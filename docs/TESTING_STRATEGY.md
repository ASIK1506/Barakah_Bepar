# Barakah Bepaar – Testing Strategy & Failure Injection Suite
## 12-Point Resiliency & Chaos Engineering Protocol

Based on multi-branch offline retail POS research, claiming "100% data persistence" or "zero data loss" is invalid without empirical demonstration through simulated disaster testing. This document defines the mandatory failure injection test suite that must pass before production deployment.

---

### 1. Test Environment Setup
- **Topology**:
  - 1 x HQ Server (PostgreSQL + Central API + SignalR Hub)
  - 2 x Simulated Branch Stores (Shop A, Shop B) with local store server / LAN
  - 2 x POS Counters per branch running `Retail.Desktop` (Avalonia UI + Local SQLite Outbox)
  - 1 x Hardware Mock Harness (Virtual Serial Scale, Virtual ESC/POS Printer, Virtual Barcode Wedge)

---

### 2. The 12 Mandatory Failure Injection Tests

| Test ID | Failure Scenario | Injected Condition | Expected System Behavior | Verification & Acceptance Metric |
|:---:|:---|:---|:---|:---|
| **FIT-01** | **Active WAN Severance** | Disconnect WAN router / block HQ IP during an active 100-bill continuous checkout run at Shop A. | Cashiers experience 0ms added latency; checkout completes against local store DB/SQLite; UI shows `"Branch Online / HQ Disconnected"` badge with pending sync counter `[100]`. | Exactly 100 invoices saved in local outbox. Receipt prints with offline indicator. |
| **FIT-02** | **WAN Reconnection & Ingestion** | Restore WAN connection after FIT-01 completion. | Outbox worker awakens; streams 100 invoices to HQ via `POST /api/v1/sync/sales-batch`. | HQ database commits exactly 100 transactions; pending counter returns to `0`; local outbox marks rows as `'SYNCED'`. |
| **FIT-03** | **Network Flap / Replay Idempotency** | Replay the exact raw HTTP payload of 100 synchronized invoices from FIT-02 back to HQ API. | HQ idempotency guard identifies existing UUIDs; returns HTTP 200 OK with original transaction acknowledgments; **no duplicate invoices or duplicate stock movements created**. | `SELECT COUNT(*) FROM sales_invoices` at HQ remains unchanged. Zero duplicate ledger entries. |
| **FIT-04** | **Simultaneous Multi-Branch Partition** | Sever internet at Shop A and Shop B simultaneously; execute 50 transactions at both stores for the same overlapping product SKUs. | Both branches bill independently using their local stock balance without blocking or deadlock. | Both branches complete sales; upon reconnection, HQ merges movements sequentially without unique-key collisions. |
| **FIT-05** | **Offline Price Protection** | Update product price at HQ from ₹100 to ₹120 while Shop A is offline. Bill the product at Shop A. | Shop A continues selling at ₹100 using its last valid downloaded price package. Invoices record price rule version used. | Historical bills preserved at ₹100; upon reconnection, Shop A downloads new ₹120 price package for subsequent sales. |
| **FIT-06** | **Concurrent Same-Branch Terminal Sales** | Counter 1 and Counter 2 at Shop A simultaneously scan and sell the last 5 units of a shared SKU. | Atomic reservation in local branch database ensures stock accurately reaches `0` without negative oversell (or records controlled adjustment). | Stock ledger reflects exact decrements (-3 on Counter 1, -2 on Counter 2; final balance = 0). |
| **FIT-07** | **Worker Crash During Sync** | Forcefully kill (`kill -9` / `Process.Kill()`) the synchronization worker process mid-transmission of a 50-bill batch. | Unacknowledged bills remain marked `'PENDING'`; when worker restarts, it resumes from the last uncommitted outbox record. | Zero lost bills; zero skipped records. |
| **FIT-08** | **Cache/Queue Engine Crash (Redis)** | Terminate the Redis service on store/HQ server during active peak billing. | Relational database transactions continue uninterrupted; non-authoritative cache misses fall back directly to PostgreSQL/SQLite. | Billing does not stop. Invoices and stock movements remain 100% intact. |
| **FIT-09** | **Sudden Power Failure Mid-Commit** | Cut AC power to POS terminal / kill process during the exact millisecond `Ctrl+S` commits to disk. | OS filesystem and SQLite/PostgreSQL WAL journaling guarantee atomic rollback of half-written transaction on restart. | Database reopens without corruption. Incomplete bill is either cleanly restored to draft state or rolled back. |
| **FIT-10** | **Store Server Crash (Counter Survival)** | Disconnect/power down the local branch store server. | Terminals with local SQLite fallback switch seamlessly to local emergency billing mode; bills accumulate in local terminal outbox. | Cashier can continue cash checkout and thermal printing without store server. |
| **FIT-11** | **Backup & Point-in-Time Recovery (PITR)** | Simulate storage drive failure; restore branch database from last WAL archive backup to clean host. | Clean database recovery up to the exact transaction before drive failure. | Reconcile restored transaction IDs against physical paper receipts and terminal local caches. |
| **FIT-12** | **High-Throughput Latency Benchmark** | Generate simulated barcode input at 60 scans per minute with simultaneous 20-client background report queries. | Barcode-to-cart latency remains `< 50ms`; bill commit time remains `< 200ms`. | Cashier experience remains instant and fluid with zero stutter. |

---

### 3. Acceptance Criteria & Production Gate
1. **Zero Data Loss**: Not a single committed transaction may be dropped, duplicated, or corrupted across any of the 12 failure scenarios.
2. **Deterministic RPO/RTO**:
   - **RPO (Recovery Point Objective)**: $0$ for transactions committed to local terminal storage; $\le 60$ seconds for HQ consolidated visibility during online operation.
   - **RTO (Recovery Time Objective)**: $< 10$ seconds for terminal restart; $< 5$ minutes for store server failover.
3. **Audit Visibility**: Every failed or conflicting sync item is permanently retained in an accessible exception queue with full cashier, terminal, branch, and timestamp context.
