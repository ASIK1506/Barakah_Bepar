# Barakah Bepaar – Implementation Roadmap
## Phase-by-Phase Development & Execution Strategy

### Overview
This roadmap establishes a disciplined, vertical development sequence. We do not build all screens simultaneously; rather, we build complete functional verticals with exhaustive visual quality assurance against reference screenshots before advancing to subsequent modules.

---

### Phase 1: Reference Analysis, Reverse Engineering & Specifications (COMPLETE)
- [x] Extract and catalog all 73 slides from `RETAIL SOFTWARE.pptx`.
- [x] Inspect and catalog all 10 live production screenshots and thermal receipts.
- [x] Extract exact UI dimensions, color schemes, font hierarchies, field layouts, and control behaviors.
- [x] Reverse engineer core workflows: POS billing, multi-rate barcodes, auto-complete search, bill hold/retrieval, multi-tender payments, stock conversion, and day-end cash reconciliation.
- [x] Document deliverables:
  - `PROJECT_OVERVIEW.md`
  - `SCREEN_INVENTORY.md`
  - `UI_RECONSTRUCTION_SPEC.md`
  - `RECOMMENDATIONS.md`
  - `KEYBOARD_SHORTCUTS.md`
  - `DATABASE_DESIGN.md`
  - `BUSINESS_LOGIC.md`
  - `OPEN_QUESTIONS.md`

---

### Phase 2: Architecture Foundation & Core Solution Setup
- [ ] Initialize the .NET 10 solution in `Barakah Bepaar/`:
  - `Retail.Desktop` (Avalonia UI 11+ with MVVM CommunityToolkit)
  - `Retail.Api` (ASP.NET Core Web API, Minimal APIs, Modular Monolith)
  - `Retail.Application` (MediatR / CQRS commands, queries, validators)
  - `Retail.Domain` (Entities, Value Objects, Domain Events, Enums)
  - `Retail.Infrastructure` (EF Core with PostgreSQL + SQLite Terminal Outbox)
  - `Retail.Contracts` (DTOs and API contracts)
  - `Retail.Shared` (Constants, Enums, Math/Round-off utilities)
- [ ] Implement database migrations for PostgreSQL authoritative database.
- [ ] Implement local SQLite database context and schema for terminals.
- [ ] Implement central authentication and role-based permissions engine.

---

### Phase 3: Desktop UI Shell & Theme Foundation
- [ ] Build the Avalonia UI Windows Classic theme:
  - Exact beveled buttons with dual-language typography (Tamil above, English below).
  - Compact DataGrid with 22px row height and alternating `#FFF0F5` lavender/pink rows.
  - Active yellow input highlighting (`#FFFF80`) on active barcode/code fields.
  - Classic MDI parent shell with menu bar (`File`, `Masters`, `Transactions`, `Reports`, `Exit`).
- [ ] Implement bilingual localization engine with instant `[ ] ENG` toggle.
- [ ] Implement Tamil typography manager and virtual letter keyboard palette (`Letters`).
- [ ] Implement global keyboard shortcut routing (`Ctrl+N`, `Ctrl+S`, `F1-F12`, `Esc`).

---

### Phase 4: Master Modules
- [ ] Tax Master (GST T1–T5 configuration).
- [ ] Product Category Master (with reward points per 100Rs).
- [ ] Product Information Master:
  - Details and List tabs.
  - Bilingual names (English & Tamil).
  - Weighing machine flag, decimal quantity flag, rate alter flag, block flag.
  - Multiple barcode and multi-price batch subgrid.
- [ ] Customer Information Master (Debit/Credit balance, phone numbers, area master).
- [ ] Supplier Information Master.
- [ ] Ledger Master & Group Information.
- [ ] Barcode Generator module with print staging queue.

---

### Phase 5: Transaction Modules (POS Billing Priority)
- [ ] **Sales / POS Billing Terminal** (Highest Priority):
  - High-speed barcode scanning (<50ms processing).
  - Live auto-complete search popup over grid.
  - Multi-rate batch selection popup.
  - Real-time gross, tax, round-off, and net calculation.
  - Hold bill (`F11`) and Retrieve held bill (`F12`) workflow.
  - Multi-tender payment dialog (`Card`, `Sodexho`, `Cheque`, `Credit`).
  - Cash change calculation and confirmation modal.
  - Navigation between bills (`F7`, `F8`, `|<`, `>|`).
  - Sales List tab with date range filter (`F4`).
- [ ] Sales Return (with link to original invoice via `F6-Old Bill`).
- [ ] Purchase Invoice & Purchase Return.
- [ ] Customer Receipt & Supplier Payment (with invoice linking).
- [ ] Voucher Entry (Journal / Ledger accounting).
- [ ] Paid In / Paid Out cash management.
- [ ] Stock Conversion (`PC` bulk to retail packaging).
- [ ] Stock Update (physical stock adjustments).

---

### Phase 6: Hardware Integration & Drivers
- [ ] ESC/POS Thermal Receipt Printer Service (40-column raw monospace output).
- [ ] RS-232 / USB Serial Weighing Machine continuous reading service.
- [ ] Raw Barcode label printing service for TSC/Zebra thermal transfer printers.
- [ ] Cash drawer kick pulse triggering (`ESC p 0 25 250`).

---

### Phase 7: Reports & Statutory Accounting
- [ ] Report Viewer Window with column visibility checkboxes and Excel export.
- [ ] Supplier Reports (Balance, Ledger).
- [ ] Customer Reports (Balance, Ledger, Areawise).
- [ ] Stock Reports (Total Stock Value, Movement, Reorder Stock).
- [ ] Sales Reports (Sales Details Brief/Full, Daywise Sales, Daily Profit).
- [ ] Purchase Reports (Purchase Details Brief/Full).
- [ ] Accounts & Statutory Reports (Day-End Cash Reconciliation, GSTR-1, GSTR-2).

---

### Phase 8: Offline Synchronization & Failure Testing
- [ ] Transactional Outbox synchronization worker on desktop terminals.
- [ ] Idempotent API endpoint for batch sales ingestion.
- [ ] Failure injection testing:
  - Network disconnected during high-volume billing.
  - Central server reboot during sync.
  - Terminal sudden power cut recovery.
  - Clock skew and conflict resolution.

---

### Phase 9: Pilot Deployment & Parallel Shadow Run
- [ ] Deploy at Counter 1 alongside legacy Vanigam in shadow mode.
- [ ] Compare 10,000 live receipts for exact penny-level calculation reconciliation.
- [ ] Verify cashier muscle memory and zero-retraining objective.
- [ ] Roll out terminal-by-terminal across all five shop branches.
