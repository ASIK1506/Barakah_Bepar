# Barakah Bepaar – Synchronization Architecture & Data Ownership

### 1. Synchronization Topology & Failure Boundaries

In accordance with enterprise supermarket POS architecture (LS Central / Dynamics 365 Commerce patterns), the system supports five geographically dispersed supermarket branches connecting to a central HQ.

```
                         HEAD OFFICE (HQ)
                ┌───────────────────────────────────┐
                │ Central PostgreSQL Database       │
                │ Central ASP.NET Core API          │
                │ Consolidated Multi-Branch Reports │
                │ Master Data & Catalog Authority   │
                └─────────────────┬─────────────────┘
                                  │ (Secure WAN / VPN)
        ┌─────────────────────────┼─────────────────────────┐
        ▼                         ▼                         ▼
   BRANCH SHOP 1             BRANCH SHOP 2             BRANCH SHOP 3
┌───────────────────────┐ ┌───────────────────────┐ ┌───────────────────────┐
│ Store Server (Postgres│ │ Store Server (Postgres│ │ Store Server (Postgres│
│ + Local API Service)  │ │ + Local API Service)  │ │ + Local API Service)  │
│          │ (Store LAN)│ │          │ (Store LAN)│ │          │ (Store LAN)│
│   ┌──────┴──────┐     │ │   ┌──────┴──────┐     │ │   ┌──────┴──────┐     │
│ Counter 1   Counter 2 │ │ Counter 1   Counter 2 │ │ Counter 1   Counter 2 │
│ (Avalonia + (Avalonia + │ │ (Avalonia + (Avalonia + │ │ (Avalonia + (Avalonia + │
│  SQLite)     SQLite)  │ │  SQLite)     SQLite)  │ │  SQLite)     SQLite)  │
└───────────────────────┘ └───────────────────────┘ └───────────────────────┘
```

#### The Three Failure Boundaries:
1. **WAN / Internet / HQ Failure**: The store server on the branch LAN continues servicing all counters with sub-second response times. Invoices accumulate in the local PostgreSQL outbox.
2. **Store Server / LAN Failure**: Each desktop counter possesses its own embedded SQLite outbox, allowing cashiers to continue cash billing and thermal receipt printing even if the branch store server or local switch fails.
3. **Catastrophic Hardware / Power Failure**: Prevented via counter UPS hardware, PostgreSQL Write-Ahead Logging (WAL) continuous archiving, and point-in-time recovery (PITR).

---

### 2. Data Ownership Matrix

To prevent multi-master replication conflicts, data ownership is partitioned strictly by domain:

| Data Domain | Authoritative Owner | Offline Operating Policy at Branch |
|---|---|---|
| **Product Master & Barcodes** | HQ Admin | Branch uses last downloaded catalog snapshot. Branch cannot create products offline by default. |
| **Tax Slabs & GST Configuration** | HQ Admin / Approved | Effective-dated local copy used. Never modified locally. |
| **Global Price Lists** | HQ Admin | Branch bills using last active price package. Invoices record price rule version used. |
| **Branch Price Overrides** | Branch Manager | Stored with explicit audit trail and supervisor user ID. |
| **Sales Invoices & Items** | Originating Branch / Terminal | Committed durably to local database; uploaded asynchronously to HQ upon reconnection. |
| **Payments & Tenders** | Originating Terminal | Record local tender results (Cash, EDC reference, Sodexho vouchers) locally. |
| **Stock Movements & Deductions** | Originating Branch | Appended to local stock ledger; synchronized to HQ later. |
| **Stock Balances** | Derived Per Branch | Each branch maintains its own authoritative stock balance. No real-time global stock locking during WAN partitions. |
| **Customer Master** | HQ / Synced Locally | Cached local copy for lookup. Offline customer creation flagged as `'LOCAL_PROVISIONAL'` until synced. |
| **Customer Credit Balances** | HQ / Local Cached | Allowed offline up to cached credit limit. Synchronized upon reconnection. |
| **Sales Returns** | Processing Branch | Validated against locally available original invoice. If original bill belongs to another branch, requires manager override. |
| **Cash Drawer Denominations & EOD** | Originating Terminal / Branch | Closed locally at shift end; uploaded to HQ for accounting reconciliation. |

---

### 3. Offline Feature Capability Matrix

| Feature | Operational Status Offline | Operational Rule / Mitigation |
|---|:---:|---|
| **Barcode Scanning** | **Full** | Instant lookup (<1ms) against local SQLite / PostgreSQL cache. |
| **Cash Billing** | **Full** | 100% functional. Receipts print immediately with local sequence number. |
| **Thermal Receipt Printing** | **Full** | Local USB / Serial printer prints directly via raw ESC/POS commands. |
| **Product Search (Bilingual)** | **Full** | Local text and phonetic search over cached product tables. |
| **Decimal & Weighed Items** | **Full** | Direct serial RS-232 communication with physical weighing scale. |
| **Bill Hold / Retrieve (`F11`/`F12`)** | **Full** | In-memory and local SQLite hold queue. |
| **Manager Discounts & Overrides** | **Full** | Validated against locally cached manager credentials / permissions. |
| **Sodexho Coupon Tallying** | **Full** | Denomination table tallied locally and recorded as coupon payment. |
| **External Card Machine (EDC)** | **Dependent** | Depends on bank EDC terminal support for offline store-and-forward. |
| **UPI QR Payments** | **Restricted** | Standard dynamic UPI requires bank server callback. During WAN outage, cashier requests Cash/Card or uses pre-printed static UPI QR with manual UTR entry. |
| **Inter-Branch Stock Transfer** | **Two-Phase** | Stored locally as `'DISPATCHED'`. Target branch records `'RECEIVED'` upon receipt and network reconnection. |
| **Consolidated HQ Reports** | **Deferred** | Local branch reports are 100% fresh. Consolidated HQ reports clearly display freshness timestamp (e.g. *"Shop 2 last synced: 2 hrs ago"*). |

---

### 4. Idempotent Ingestion & Sequence Allocation

#### 4.1 Sequence Gap Prevention
- Terminals assign composite invoice identifiers:
  `SI-{BranchCode}-{CounterId}-{Year}-{LocalSequence:D6}`
  - Example: `SI-01-T01-2026-000452`
- Eliminates invoice collisions across disconnected terminals.

#### 4.2 Idempotency Guard
- Each invoice has a client-generated **UUIDv7** primary key.
- The API's `POST /api/v1/sync/sales-batch` endpoint checks:
  ```sql
  INSERT INTO sales_invoices (...)
  VALUES (...)
  ON CONFLICT (id) DO NOTHING;
  ```
- Resending the same payload across network retries returns the existing confirmation with zero duplicate sales or stock movements.
