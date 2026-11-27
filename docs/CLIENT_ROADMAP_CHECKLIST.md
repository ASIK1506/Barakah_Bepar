# Barakah Bepaar — Master Client Requirements & Phase-by-Phase Execution Plan

> **Document Purpose:** Unified, phase-by-phase engineering checklist covering all 21 client matrix requirements, HQ multi-shop licensing (5 shops + paid expansion), wholesale/retail unit conversion (boxes, pieces, kg/grams), structured bill-wise credit (Udhaar) ledger, industry-standard analytics, WhatsApp/mobile reporting, and team track coordination.

---

## 1. Team Ownership & Parallel Execution Model

To ship fast without merge conflicts or overwriting legacy UI work:

| Team Member | Branch | Primary Responsibility |
| :--- | :--- | :--- |
| **Ashik** | `asik` | Legacy Vanigam screen parity, pixel-by-pixel fixes, Tamil/English layout checks, manual QA against `extracted_pptx/` |
| **Abid** | `abid` | Legacy screen refinements, shortcut consistency (`F1`–`F12`), modal/receipt visual alignment, manual QA |
| **Lead + AI Agent** | `main` / feature branches | Client multi-shop architecture, HQ Admin portal, licensing cap, stock/UOM conversion, accounts ledger, analytics, cloud sync & packaging |

> **Golden Rule:** All new HQ Admin, Analytics, Multi-Shop Distribution, and Ledger features must keep the POS Billing Counter screen (`Ctrl+I`) keyboard-first, fast, and visually faithful to the classic operator workflow.

---

## 2. Complete Feature Matrix Coverage (Client Spec + Screenshot Checklist)

Every item from the client's feature sheet and verbal requirements mapped to its target phase:

| # | Requirement / Feature | Target Phase |
| :-: | :--- | :--- |
| 1 | Owner HQ login + 5 individual shop logins (simultaneous multi-shop billing) | Phase 2 |
| 2 | 5-shop license cap + paid unlock option for Shop #6+ & shop renaming | Phase 2 |
| 3 | 2-week demo trial control, implementation & training checklist | Phase 2 / Phase 8 |
| 4 | Central cloud database + offline-resilient Electron terminal sync | Phase 1 |
| 5 | Central inventory with multi-shop stock entry & manager allocation | Phase 3 |
| 6 | Box, piece (`20/40 pcs/box`) & bulk kg (`100 kg bag → 250g/500g/1kg/2kg/5kg`) handling + dynamic slab rates | Phase 3 |
| 7 | Shop-to-shop stock transfer with dispatch & receive audit records | Phase 3 |
| 8 | Low stock alerts by shop | Phase 3 / Phase 6 |
| 9 | Separate billing per shop with instant English/Tamil name search | Phase 4 |
| 10 | Tamil & English bilingual billing & thermal/A4 receipts | Phase 4 |
| 11 | Purchase price, selling price & margin tracking | Phase 3 / Phase 4 |
| 12 | Sales returns, supplier purchases & daily expenses | Phase 4 / Phase 5 |
| 13 | Customer credit (`Udhaar`) ledger + wholesale/retail credit accounts | Phase 5 |
| 14 | Bill-number lookup showing paid amount & exact pending balance | Phase 5 |
| 15 | Cash, UPI & credit payment breakdown | Phase 4 / Phase 6 |
| 16 | Shop-wise & combined sales reports | Phase 6 |
| 17 | Profit report by product & by shop | Phase 6 |
| 18 | Top 10 selling products, best-selling shop per product & busiest hours | Phase 6 |
| 19 | Dead stock, slow movers & smart reorder suggestions | Phase 6 |
| 20 | Staff-wise billing records + Excel (`.xlsx`/`.csv`) & PDF export | Phase 6 |
| 21 | Bill printing (58/80mm thermal or A4) & automated daily backups | Phase 4 / Phase 8 |
| 22 | WhatsApp bills, credit reminders & daily closing report | Phase 7 |
| 23 | Owner mobile app / live mobile dashboard for each shop | Phase 7 |

---

## 3. Phase-by-Phase Checklist

### Phase 0: Legacy Screen Parity & Team Foundation *(Ongoing — Ashik & Abid)*
- [ ] Audit all 73 reference slides (`extracted_pptx/`) against current screens (`PosBillingScreen`, `MasterScreens`, `TransactionScreens`, `UserScreens`).
- [ ] Verify exact keyboard shortcuts (`F1`–`F12`, `Ctrl+N`, `Ctrl+S`, `Ctrl+I`, `Alt+P`, `Esc`) and focus rings (`#FFFF80`).
- [ ] Verify Tamil & English translations across all labels, grids, and modals (`[ ] ENG` toggle).
- [ ] Resolve any visual layout, spacing, or grid density mismatches reported during manual testing on Vercel Chrome preview.
- [ ] Keep `main`, `asik`, and `abid` synchronized after each milestone.

---

### Phase 1: Central Cloud Data Layer & Offline Sync Architecture *(Architecture Prerequisite)*
> *Why first:* Since 5 shops will bill simultaneously on desktop Electron apps while the HQ Owner views live consolidated analytics, local-only `localStorage` is no longer sufficient.

- [ ] **1.1 Backend & Database Setup**
  - [ ] Provision authoritative cloud PostgreSQL database (e.g., Supabase / Neon Postgres + REST/API layer).
  - [ ] Design normalized multi-tenant schema (`organizations`, `licenses`, `shops`, `users`, `products`, `product_uoms`, `product_batches`, `warehouse_stock`, `shop_stock`, `stock_transfers`, `invoices`, `invoice_items`, `credit_ledger_entries`, `suppliers`, `purchases`, `expenses`, `audit_logs`).
- [ ] **1.2 Electron Offline-First Outbox Queue**
  - [ ] Persist every completed bill locally (`C:\BarakahBepaar_Data`) immediately before printing (never lose a sale if internet drops).
  - [ ] Implement background FIFO outbox sync worker in `electron/main.cjs` / web sync service using idempotent invoice IDs (`<SHOP_CODE>-<FY>-<SEQ>`).
  - [ ] Add connection status & pending-sync counter pill in the top bar (Green = Synced, Amber = Queued Offline).
- [ ] **1.3 Automated Daily Backup Engine**
  - [ ] Auto-export daily closing snapshot JSON/CSV to `C:\BarakahBepaar_Data\backups\YYYY-MM-DD\`.
  - [ ] Add one-click manual backup download & restore utility for Shop/HQ Admins.

---

### Phase 2: HQ Owner Admin Portal, Multi-Shop Licensing & RBAC
- [ ] **2.1 Role-Based Authentication (`Owner`, `Shop Manager`, `Cashier`)**
  - [ ] Upgrade `LoginScreen.tsx` to support **HQ Owner Login** and **Shop-Scoped Logins** (with Shop selector or shop-bound username e.g. `shop1_cashier`).
  - [ ] Enforce strict RBAC: Cashiers access POS + assigned shop only; Shop Managers manage branch stock/returns; HQ Owner accesses all 5 shops + Admin portal.
- [ ] **2.2 Multi-Shop Management & 5-Shop License Cap**
  - [ ] Build **HQ Admin Console** (`Shop Management` module).
  - [ ] Enforce **maximum 5 active shops** on the standard license (`Shops Created: X / 5`).
  - [ ] Allow HQ Owner to **rename shops** dynamically (e.g., `Shop A → Anna Nagar Branch`), edit address/GSTIN/phone, and toggle Active/Suspended status.
  - [ ] Implement **"Add Additional Shop (Paid Expansion)"** flow: displays license limit dialog when reaching 5 shops and allows unlocking Slot #6+ via an encrypted/signed **Expansion License Key** generated for paying customers.
- [ ] **2.3 2-Week Demo / Trial & Licensing Guard**
  - [ ] Support configurable **14-day Demo Trial** banner & expiry check for client pilot installations (`Trial Days Remaining: 14`) with license activation screen.

---

### Phase 3: Central Warehouse, Wholesale UOM Conversion & Multi-Shop Distribution
- [ ] **3.1 Central Warehouse & Supplier Purchase Entry**
  - [ ] Upgrade Purchase Entry to record **Purchase Price**, **Landing Cost**, **Wholesale Rate**, **Retail Selling Price / MRP**, and auto-calculate **Margin % / Profit per Unit**.
  - [ ] Store incoming stock in **Central Warehouse** prior to shop allocation.
- [ ] **3.2 Flexible Box / Bag / Piece / Weight UOM Engine**
  - [ ] Define **Base Unit** (`pcs` or `grams`) + **Purchase Pack Unit** (`Box of 20`, `Box of 40`, `50 kg Bag`) per product.
  - [ ] **Scenario A — Wholesale Boxes to Retail Pieces:**
    - Buy `5 Boxes` (where `1 Box = 40 pcs` = `200 pcs` total).
    - Allow manager/cashier to sell `1 Box`, `2 Boxes`, OR `2 pcs` / `3 pcs` individually.
    - Stock automatically tracks fractional box balance (e.g., `4 Boxes, 38 Pcs` or `198 Pcs`).
  - [ ] **Scenario B — Bulk Kg Bags to Variable Weight Packs (`250g`, `500g`, `1kg`, `2kg`, `5kg`):**
    - Buy `100 kg Wheat` centrally → stored as `100,000 g` base inventory.
    - Support **weight-slab pricing table** per product (e.g., `250g = ₹18`, `500g = ₹34`, `1kg = ₹65`, `2kg = ₹128`, `5kg = ₹310`) instead of strict linear multiplication when slab rates differ!
    - Integrate quick weight selector presets (`250g`, `500g`, `1kg`, `2kg`, `5kg`) + RS-232 electronic scale weight capture at POS.
- [ ] **3.3 Warehouse-to-Shop Allocation & Shop-to-Shop Transfers**
  - [ ] **Admin Stock Issue / Allocation screen:** HQ Manager selects Central stock (`100 kg` or `10 Boxes`) and allocates quantities across Shop A–E.
  - [ ] **Shop Goods Receipt (GRN):** Receiving shop confirms incoming stock distribution into its shop floor inventory.
  - [ ] **Shop-to-Shop Stock Transfer (`IST`):** Transfer stock directly from Shop A → Shop B with transfer slip number, reason, status (`Dispatched` → `Received`), and full audit trail.
- [ ] **3.4 Low Stock Alerts**
  - [ ] Configure per-shop minimum reorder thresholds; highlight low-stock SKUs in red per branch on both Shop and HQ dashboards.

---

### Phase 4: Shop-Isolated POS Billing, Dual Retail/Wholesale Pricing & Printing
- [ ] **4.1 Separate Shop Billing Context**
  - [ ] Isolate stock lookup, invoice numbering (`SH1-2425-0001`..`SH5-2425-0001`), customer dues, and day-end cash drawers per shop.
  - [ ] Preserve instant Tamil & English product search, barcode scan (`F9`), hold/recall (`F11`/`F12`), and weighing scale toggle.
- [ ] **4.2 Wholesale vs. Retail Mode & Multi-Tender Payment**
  - [ ] Add `Retail` / `Wholesale` customer/bill toggle so wholesale buyers automatically get wholesale rates (box/bulk rates) while retail shoppers get retail/MRP rates.
  - [ ] Upgrade Payment Modal to explicitly track **Cash**, **UPI** (with optional UPI ref/QR), **Card**, **Credit (Udhaar)**, and split combinations cleanly.
- [ ] **4.3 Dual Print Engine (Thermal 58/80mm + A4 Tax Invoice) & Returns/Expenses**
  - [ ] Keep 40-column thermal receipt print AND add **A4 GST Tax Invoice** print template (especially for B2B wholesale bills showing HSN, CGST/SGST breakdown, and previous/current credit balance!).
  - [ ] Tag **Staff / Cashier ID** on every invoice for staff-wise billing accountability.
  - [ ] Wire **Sales Returns** (restoring exact shop + UOM stock) and **Daily Shop Expenses** (tea, transport, loading/unloading, EB bill) into daily cash reconciliation.

---

### Phase 5: Structured Accounts Section & Bill-Wise Credit (Udhaar) Ledger
- [ ] **5.1 Accounts & General Ledger Structure**
  - [ ] Dedicated **Accounts & Ledger** workspace with separated **Customer (Debtor) Ledgers**, **Wholesale Buyer Ledgers**, **Supplier (Creditor) Ledgers**, and **Expense Accounts**.
- [ ] **5.2 Bill-Number Pending Balance Lookup**
  - [ ] Enter or scan any **Bill Number** (e.g. `SH1-2425-0042`) in Receipt/Accounts/POS → immediately display:
    - Customer / Wholesaler Name & Shop
    - Original Bill Date & Bill Total (`₹`)
    - Total Paid to Date (`₹`) + Partial Payment History
    - **Exact Pending Balance (`₹`)**
  - [ ] Allow one-click **Part Payment** or **Full Settlement** against that exact bill number (supporting Cash, UPI, or Cheque).
- [ ] **5.3 Credit Limits, Wholesale Accounts & Aging Reports**
  - [ ] Set **Credit Limit (`₹`)** and **Credit Days** per retail/wholesale party with cashier warning when credit limit is exceeded.
  - [ ] Add **Receivables Aging Report** (`0–30 Days`, `31–60 Days`, `60+ Days Overdue`) filterable by Shop or Combined.

---

### Phase 6: Enterprise Analytics Dashboard & Full Export Suite *(Web-Benchmarked BI)*
> *Benchmarked against modern multi-store retail/wholesale POS standards:*

- [ ] **6.1 HQ Multi-Shop Executive Overview**
  - [ ] Live side-by-side KPI cards & comparison table for **Shop A through Shop E + Combined Total**:
    - Gross Sales, Net Sales, Bill Count (Footfall), Average Bill Value (ABV), Gross Profit & Margin %, Cash vs. UPI vs. Credit breakdown, Total Expenses.
  - [ ] Drill-down filter by Date Range (Today, Yesterday, This Week, This Month, Custom) and Wholesale vs. Retail channel.
- [ ] **6.2 Product & Inventory Intelligence**
  - [ ] **Top 10 Selling Products** (by revenue & by quantity) across all shops or per shop.
  - [ ] **Best-Selling Shop per Product** leaderboard (shows which branch moves each SKU fastest for smart stock allocation).
  - [ ] **Busiest Hours Heatmap / Bar Chart** (hourly sales & bill volume `06:00–23:00` by shop to optimize cashier shift staffing).
  - [ ] **Dead Stock Report** (items with stock on hand & zero sales in last `30 / 60 / 90` days).
  - [ ] **Slow Movers & Automated Reorder Suggestions** (velocity-based `Days of Stock Remaining` + recommended PO qty).
- [ ] **6.3 Profit, Staff & Financial Reports + Excel/PDF Exports**
  - [ ] **Profit Report by Product & by Shop** (`(Selling Price - Purchase Cost) × Qty - Discounts`).
  - [ ] **Staff-Wise Billing Performance** (total bills, net revenue, returns, average billing speed/value per cashier).
  - [ ] **Export Engine:** Real **Excel (`.xlsx` / `.csv`)** and formatted **PDF** export buttons on every report and ledger statement.

---

### Phase 7: WhatsApp Automation & Owner Live Mobile View
- [ ] **7.1 WhatsApp Customer Bills & Udhaar Reminders**
  - [ ] **Send Bill on WhatsApp:** Instant WhatsApp share after billing (`wa.me` structured digital receipt or WhatsApp Cloud API PDF link).
  - [ ] **Credit (Udhaar) Payment Reminders:** One-click / scheduled polite WhatsApp reminder in **Tamil & English** containing pending bill numbers and total due amount.
  - [ ] **Automated Daily Closing Report:** Formatted WhatsApp summary at day-end (`Shop-wise Sales, Cash/UPI/Credit split, Profit, Expenses, Low Stock count`) sent to Owner's WhatsApp.
- [ ] **7.2 Owner Mobile App / Live Mobile PWA**
  - [ ] Build mobile-responsive **Owner Live View** (`/owner-mobile` PWA installable on Android & iOS via existing `site.webmanifest`):
    - Live today's sales per shop (auto-refreshing), Cash/UPI/Credit gauges, pending Udhaar dues, and urgent low-stock alerts.

---

### Phase 8: Pilot Rollout, Hardware QA, 2-Week Demo & Production Release
- [ ] **8.1 Hardware Stress Test on Windows Electron**
  - [ ] Verify RS-232 weighing scale streaming, USB barcode scanner, 58/80mm ESC/POS printing, and cash drawer kick across Windows 10/11 terminals.
- [ ] **8.2 2-Week Client Demo & Staff Training Package**
  - [ ] Pre-load realistic multi-shop demo seed data (5 sample shops, wholesale boxes & bulk weight SKUs, sample Udhaar ledgers).
  - [ ] Produce 1-page bilingual **Cashier Quick-Start Shortcut Sheet** + **HQ Admin Training Guide**.
- [ ] **8.3 Production Windows Installer & Go-Live**
  - [ ] Build signed/packaged **Barakah Bepaar Setup `.exe`** + **Portable `.exe`** and shadow-run at Pilot Shop before full 5-shop rollout.
