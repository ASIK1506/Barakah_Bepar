# Barakah Bepaar - Retail Management System (GST Version)
## Reverse-Engineered Desktop POS Application for Supermarkets & Hypermarkets

This codebase contains the complete reverse-engineered system and interactive working demo recreating the legacy **Vanigam 4.0 / Demo Retail Management Software (GST Version)**.

---

## 🎯 Key Design & Functional Pillars

1. **Zero Retraining Requirement**:
   - The user interface, field arrangements, 22px table rows, alternating pink/white grid (`#FFF0F5`), active yellow barcode highlight (`#FFFF80`), dual-language English/Tamil typography, and all keyboard shortcuts (`F1`–`F12`, `Ctrl+N`, `Ctrl+S`, `Ctrl+X`, `Alt+P`) have been reproduced to match the legacy desktop experience exactly.
2. **Demo Seed Data**:
   - Pre-seeded with 10 authentic Indian supermarket products extracted from the reference presentation (`MANJAL`, `MILAGA.KUNDU`, `DHANIYA`, `SUKKU`, `MANJAL KOMBU`, `MEELAGU`, `SIRAGAM`, `VENTHIYAM`, `TPARUPU`, `LG.THOOL`) and customer ledgers (`F1 Cash`, `C3 Vanigam Supermarket`, `C7 A.S Vegitable Store`).
3. **Estimate Mode Policy (`[x] EST / F10`)**:
   - **Zero inventory deduction**: Quotations saved in Estimate mode (`EST-XXXX`) do not deduct stock.
   - When the customer returns, estimates can be recalled from the Estimate Registry and converted into an official tax invoice (`SI-2425-XXXXX`) upon payment confirmation, which is the only time stock is decremented.
4. **Hardware Readiness**:
   - RS-232 serial weighing scale protocol (Essae / Phoenix / Bayes continuous stream) option configurable in Settings with on-screen bypass toggle `[ ] DISABLE W/M`.
   - Card EDC payment tender entry tracking.
   - ESC/POS 40-column monospace thermal receipt preview matching Slide 41.
5. **Dual-Tier Offline Architecture**:
   - Structured for offline-first store resilience: local SQLite / IndexedDB transactional outbox with guaranteed FIFO sync back to central PostgreSQL when connectivity resumes.

---

## 🚀 How to Run the Web Demo

The interactive demo is built using **React 18 + TypeScript + Vite**.

### 1. Open Terminal & Navigate to `web`
```bash
cd "Barakah Bepaar\web"
```

### 2. Start the Development Server
```bash
npm run dev
```
By default, the server runs at: **`http://localhost:5173`** (or access via local network IP on mobile/tablet browsers).

### 3. Production Build & Preview
```bash
npm run build
npm run preview
```

---

## ⌨️ POS Keyboard Shortcut Guide

| Key | Operation | Legacy Vanigam Behavior |
| :--- | :--- | :--- |
| **F1** | Cash Customer | Sets customer to `F1 CASH`, clears credit balance |
| **F2** | Split Tender / Card | Opens Payment Modal (Cash, Card, Sodexho, Cheque, Credit) |
| **F3 / Ctrl+S** | Save Bill | Validates cart, tenders payment, commits bill, prints receipt |
| **F4 / Ctrl+N** | New Bill | Clears active cart and resets counter for next customer |
| **F5 / Alt+P** | Print Bill | Opens ESC/POS 40-column thermal receipt preview dialog |
| **F6** | Customer Search | Opens customer search popup (Code, Name, Mobile, Balance) |
| **F7** | Delete Line Row | Deletes selected row from cart and recalculates totals |
| **F8** | Clear Cart | Empties all items from active cart after confirmation |
| **F9** | Focus Barcode | Returns active keyboard cursor to yellow Barcode input |
| **F10** | Toggle Estimate | Switches between Invoice Mode and Estimate Quotation Mode |
| **F11** | Hold Bill | Parks active cart to queue (customer stepped away) |
| **F12** | Recall Bill | Opens Parked Bills Queue to resume a held customer cart |
| **Enter** | Add Line Item | Inserts selected item with quantity and rate into table |
| **Arrow Down/Up** | Autocomplete Nav | Navigates matching products in the yellow lookup overlay |

---

## 📁 Repository Structure

```
Barakah Bepaar/
├── README.md                           # This startup & architecture guide
├── docs/                               # 13 Technical reverse-engineering specifications
│   ├── PROJECT_OVERVIEW.md             # Baseline, scope & operational principles
│   ├── SCREEN_INVENTORY.md             # Complete inventory of 73 slides + 10 live photos
│   ├── UI_RECONSTRUCTION_SPEC.md       # Pixel-identical design system, CSS, 22px rows
│   ├── RECOMMENDATIONS.md              # Core recommendations for desktop UI, Tamil typography
│   ├── KEYBOARD_SHORTCUTS.md           # Exhaustive shortcut & modal navigation mapping
│   ├── DATABASE_DESIGN.md              # Dual-tier schema (PostgreSQL Central + SQLite Local)
│   ├── BUSINESS_LOGIC.md               # GST, Sodexho coupons, Estimate lifecycle, Day-End cash
│   ├── HARDWARE_INTEGRATION.md         # RS-232 scale, ESC/POS 40-col, barcode wedge
│   ├── SYNC_ARCHITECTURE.md            # Transactional outbox & offline store-and-forward
│   ├── TESTING_STRATEGY.md             # 12-point chaos & failure injection test suite
│   ├── IMPLEMENTATION_ROADMAP.md       # 9-phase enterprise production roadmap
│   ├── slide_catalog.json              # Extracted slide metadata catalog
│   └── slides_summary.json             # Reverse-engineered screen OCR text & OCR summary
└── web/                                # Interactive React + TypeScript Demo
    ├── package.json                    # Dependencies & build scripts
    ├── vite.config.ts                  # Vite bundler configuration
    ├── index.html                      # Entry HTML with Noto Sans Tamil webfont
    ├── dist/                           # Compiled production build artifacts
    └── src/
        ├── types/                      # Domain interfaces (Product, CartItem, Invoice, etc.)
        ├── data/                       # 10 Indian supermarket seed products & customers
        ├── styles/                     # classicTheme.css (Pixel-identical Vanigam styling)
        └── components/
            ├── MdiShell.tsx            # Windows Classic titlebar & top menus
            ├── PosBillingScreen.tsx    # Primary POS Billing screen
            ├── AutoCompleteDropdown.tsx# Floating yellow product lookup popup
            ├── PaymentModal.tsx        # Multi-tender split payment dialog (Slide 36)
            ├── ThermalReceiptModal.tsx # ESC/POS 40-column thermal bill preview (Slide 41)
            ├── HeldBillsModal.tsx      # F11 Hold / F12 Recall queue
            ├── EstimateModal.tsx       # Estimate registry (Zero inventory deduction)
            ├── CustomerSearchModal.tsx # F6 Customer lookup dialog
            └── SettingsModal.tsx       # Weighing scale serial port & EDC card machine config
```
