# Barakah Bepaar – Technical Questions & Resolution Register

### 1. Questions Resolved by Architecture Research

The following architectural questions have been resolved and formalized in our project specifications:

| Architectural Item | Research Resolution | Document Reference |
|---|---|---|
| **Multi-Branch Topology** | Central HQ + Local Store Server per branch + Terminal local SQLite fallback. Counters communicate with local branch API over LAN. | `SYNC_ARCHITECTURE.md` |
| **Offline Data Persistence** | Transactions committed to local ACID storage (PostgreSQL/SQLite WAL) before receipt is printed. Browser IndexedDB rejected as sole durable store. | `DATABASE_DESIGN.md` |
| **Replication Strategy** | Bi-directional native multi-master replication avoided. Application-level Transactional Outbox pattern adopted with idempotent consumer. | `SYNC_ARCHITECTURE.md` |
| **Invoice Numbering Offline** | Composite format `SI-{Branch}-{Terminal}-{Year}-{LocalSeq}`. Eliminates numbering collisions across partitioned branches. | `KEYBOARD_SHORTCUTS.md` |
| **Multi-Branch Stock Contention** | Stock balance is branch-local. No distributed locking during WAN outages. HQ aggregates movements upon reconnection. | `BUSINESS_LOGIC.md` |
| **Payment Tenders Offline** | Cash and Sodexho paper coupons fully supported offline. External Card EDC and UPI subject to provider connectivity rules. | `BUSINESS_LOGIC.md` |
| **Resiliency Verification** | 12-point failure injection testing suite defined (FIT-01 to FIT-12). | `TESTING_STRATEGY.md` |

---

### 2. Remaining Questions Requiring Client / Hardware Specifics

The following questions cannot be resolved by generic research and require input based on the client's actual store facilities:

#### A. Legacy Vanigam Database Extraction
1. **Existing Data Backup**:
   - What format is the client's current Vanigam store database (e.g. Microsoft SQL Server `.bak`, Microsoft Access `.mdb`, or `.mdf`)?
   - Can we receive a sanitized backup of the existing product master, Tamil names, barcode mappings, and customer accounts to build the initial seed migrations?

#### B. Store Hardware & Peripherals
2. **Weighing Machine Make & Model**:
   - The UI provides a `[ ] DISABLE W/M` toggle. What exact model of weighing scale is connected to each counter (e.g. Essae DS-852, Phoenix, Citizen, Sartorius)?
   - What baud rate and protocol is currently used (standard continuous stream: 9600-8-N-1)?
3. **Card Payment Machine (EDC)**:
   - What payment terminal provider is used across the counters (e.g. Pine Labs, Innoviti, Paytm, HDFC, SBI)?
   - Has the merchant contract enabled offline store-and-forward batch authorization for credit/debit cards?
4. **Thermal Printer Specs**:
   - Are the receipt printers 3-inch (80mm) or 2-inch (58mm) (e.g., TVS RP-3200, Epson TM-T82)?

#### C. In-Store Server Infrastructure
5. **Branch Server Provisioning**:
   - Does each of the five shops have an always-on desktop PC or mini-server (e.g. Intel NUC / dedicated desktop) connected via LAN Ethernet to the billing counters?
   - Are all billing terminals and servers backed up by Uninterruptible Power Supplies (UPS)?
6. **Estimate Mode (`[ ] EST`)**:
   - When a cashier checks `[ ] EST` on the POS billing screen (Slide 30), does the store treat this as an informal pro-forma quotation (bypassing GST tax registers and official invoice numbering), or does it also deduct physical inventory?
