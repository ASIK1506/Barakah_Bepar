# Barakah Bepaar — Master Client Requirements & Phase-by-Phase Execution Plan

> **Document Purpose:** Unified, phase-by-phase engineering checklist covering all 21 client matrix requirements, HQ multi-shop licensing (5 shops + paid expansion), wholesale/retail unit conversion (boxes, pieces, kg/grams), structured bill-wise credit (Udhaar) ledger, industry-standard analytics, WhatsApp/mobile reporting, and team track coordination.

---

## 0. Client Answers & Key Architecture Decisions

| # | Question | Decision |
| :-: | :--- | :--- |
| Q1 | Cloud Database & Sync | **Demo: localStorage only (no Supabase/Postgres).** Vercel link = frontend only (no backend). Post-approval: deploy to client's own hosting server with real backend. |
| Q2 | Owner Mobile App | **Yes — separate mobile apps** for Owner + Shop. Private to Moideen's company only (not published to Play Store). |
| Q3 | WhatsApp Integration | **Yes — keep WhatsApp integration** for bills, credit reminders, and daily closing reports. |
| Q4 | License Expansion Unlock | **Skip for demo.** Future scope only — implement after core software is complete and working. |
| Q5 | Weighing Scale / Rates | **No physical scale integration.** Cashier manually enters weight via keyboard. Multiple rates already in codebase (`rate`, `wholesaleRate`, `branchRate`). Admin creates rates, cashier selects from dropdown. |

### UI Architecture Decision
| Login Role | UI Style | Rationale |
| :--- | :--- | :--- |
| **Admin / HQ Owner** | **Modern React UI** — clean cards, Lucide icons, sidebar nav, analytics dashboard | Manager is tech-savvy, needs new features & analytics |
| **Shop / Cashier** | **Classic Windows POS UI** — unchanged legacy look & feel | Shop staff cannot adapt to new UI quickly; speed & familiarity are critical |

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
| 2 | 5-shop license cap + paid unlock option for Shop #6+ & shop renaming | ~~Phase 2~~ **Future Scope** |
| 3 | 2-week demo trial control, implementation & training checklist | ~~Phase 2~~ **Future Scope** |
| 4 | Central cloud database + offline-resilient Electron terminal sync | ~~Phase 1~~ **Post-Approval (Server Deployment)** |
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

### Phase 1: Demo Foundation — Admin Portal Shell & Multi-Shop Data Architecture *(DEMO PRIORITY)*
> *Why first:* The demo needs to show the HQ Admin can manage 5 shops and see consolidated data. For the demo, all data stays in localStorage — no backend server needed.

- [ ] **1.1 Admin Dashboard Shell (Modern UI)**
  - [ ] Create `AdminLayout.tsx` — modern sidebar-based layout with Lucide icons, clean cards, dark sidebar navigation.
  - [ ] Admin route: when ADMIN logs in → show Admin Dashboard (not POS billing screen).
  - [ ] Dashboard landing page: 5 shop cards showing shop name, today's sales total, bill count, active status.
  - [ ] Navigation: Dashboard, Shops, Inventory, Reports, Users, Settings.

- [ ] **1.2 Multi-Shop Data Model (localStorage for Demo)**
  - [ ] Create `shopStore.ts` — manage 5 shop profiles (name, code, address, GSTIN, status) in localStorage.
  - [ ] Pre-seed 5 demo shops: `Moideen Supermarket - Anna Nagar`, `Moideen Supermarket - T.Nagar`, `Moideen Supermarket - Velachery`, `Moideen Supermarket - Tambaram`, `Moideen Supermarket - Porur`.
  - [ ] Each shop has its own product stock, invoice sequence, and customer list (shop-scoped keys in localStorage).

- [ ] **1.3 Conditional UI Routing by Role**
  - [ ] `ADMIN` login → Modern Admin Dashboard (new UI).
  - [ ] `SHOP1` / `USER` / Cashier login → Classic POS billing screen (unchanged legacy UI).
  - [ ] Add "Switch to Shop View" button in Admin for quick preview.

---

### Phase 2: HQ Owner Admin Portal — Shop Management & User RBAC
- [ ] **2.1 Shop Management Screen (Admin UI)**
  - [ ] CRUD for shops: create, rename, edit address/GSTIN/phone, toggle Active/Suspended.
  - [ ] Visual shop limit indicator: `Shops: 3 / 5 Active`.
  - [ ] Each shop gets its own login accounts (auto-created: `SHOP1_CASHIER`, `SHOP1_MANAGER`, etc.).

- [ ] **2.2 User & Role Management (Admin UI)**
  - [ ] Upgrade `UserScreens.tsx` for admin: assign users to shops, set roles (`Owner`, `Shop Manager`, `Cashier`).
  - [ ] Permission matrix per role (which screens/actions each role can access).

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
    - Admin creates **multiple rate entries** per product for different quantities/wholesale tiers.
    - Cashier selects rate from admin-defined dropdown at POS.
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
- [ ] **7.2 Owner & Shop Mobile Apps (Private — Not on Play Store)**
  - [ ] Build separate mobile-responsive views for Owner and Shop usage:
    - **Owner App:** Live today's sales per shop (auto-refreshing), Cash/UPI/Credit gauges, pending Udhaar dues, and urgent low-stock alerts.
    - **Shop App:** Lightweight mobile POS or stock check for shop floor staff.
  - [ ] Distribute as private APKs or PWA (not published on Google Play Store).

---

### Phase 8: Server Deployment, Hardware QA & Production Release
- [ ] **8.1 Server Deployment (Post Client Approval)**
  - [ ] Deploy to client's own hosting server with real PostgreSQL/MySQL backend.
  - [ ] Convert localStorage data layer to server API calls.
  - [ ] Setup automated daily backups on the server.
- [ ] **8.2 Hardware Stress Test on Windows Electron**
  - [ ] Verify RS-232 weighing scale streaming, USB barcode scanner, 58/80mm ESC/POS printing, and cash drawer kick across Windows 10/11 terminals.
- [ ] **8.3 Client Training & Go-Live**
  - [ ] Pre-load realistic multi-shop demo seed data (5 sample shops, wholesale boxes & bulk weight SKUs, sample Udhaar ledgers).
  - [ ] Produce 1-page bilingual **Cashier Quick-Start Shortcut Sheet** + **HQ Admin Training Guide**.
  - [ ] Build signed/packaged **Barakah Bepaar Setup `.exe`** + **Portable `.exe`** and shadow-run at Pilot Shop before full 5-shop rollout.

---

## 4. Demo Submission Notes

> **Vercel Link** (`https://web-one-tawny-bgge8e6but.vercel.app/`): Contains frontend files only — **no backend functionality**. All data is stored in browser localStorage for demonstration purposes. Full server-side functionality will be deployed to client's hosting server post-approval.

> **Demo Accounts:**
> | Username | Password | Role | UI |
> | :--- | :--- | :--- | :--- |
> | `admin` | `admin` | Administrator / HQ Owner | Modern Admin Dashboard |
> | `shop1` | `shop1` | Shop Cashier | Classic POS Billing Screen |
