# Barakah Bepaar – Detailed Functional Requirements
## Comprehensive Module-by-Module Specification

### 1. File Menu & System Administration
- **Company Information**: Configure supermarket business name, Tamil trading name, address lines, phone numbers, GSTIN, thermal receipt headers, and footers.
- **Calculator**: Embedded desktop arithmetic calculator accessible via menu or shortcut.
- **Calendar**: Visual English / Tamil calendar for reference.
- **User Information**:
  - Create, view, edit, and deactivate user accounts.
  - Role assignment (`User` or `Administrator`).
  - Password hashing and secure credential storage.
- **Configuration (User Login Configuration)**:
  - Granular, module-level permission checkboxes per user for:
    - *Master Details*: Tax Information, Add Product Category, Add Product, Add Customer, Add Supplier, Add Ledger, BarCode Generator, Edit Product.
    - *Transactions*: Sales Information, Sales Return Information, Purchase Information, Purchase Return Information, Receipt Information, Payment Information, Voucher Information, Stock Conversion, Stock Update, Redemption.
    - *Reports*: Supplier Report, Customer Report, Purchase Report, Sales Report, Purchase Return Report, Sales Return Report, Stock Details, Accounts Reports.
- **Denominations**:
  - Physical currency drawer count tool (2000, 500, 200, 100, 50, 20, 10, 5, Coins).
  - Used for shift opening cash entry and shift closing reconciliation.
- **Paid In / Paid Out**:
  - Cash disbursements from register (expenses, petty cash, owner drawings) or cash infusions.
  - Generates serial voucher code (e.g. `S1`), logs party name, amount, and notes.

---

### 2. Masters
- **Tax Information**:
  - Configurable GST slabs: T1 (0%), T2 (5%), T3 (12%), T4 (18%), T5 (28%).
  - Tax-inclusive calculation engine for POS retail items; tax-exclusive support for B2B.
- **Product Category**:
  - Category Code, Category Name, Loyalty Reward points per ₹100 spent.
  - Category List tab with real-time filtering.
- **Product Information**:
  - Bilingual item naming: English Name (e.g., `MILK 10RS BOX`) and Tamil Name (`10ரூ மில்க் பெட்டி`).
  - Unit selection: `Nos`, `Kg`, `Gms`, `Ltr`, `Pcs`, `Box`.
  - Pieces per unit configuration (`Pcs/Unit`) and piece-level stock tracking.
  - Flags: `DECIMAL` (allows fractional quantities like `0.250`), `Rate Alter` (allows cashier price override), `WMACHINE` (reads weight from serial scale), `BLOCK` (disables scanning discontinued items).
  - Multi-price tier definitions: MRP, Retail Rate (with profit % calculation), Wholesale Rate, Branch Rate.
  - Multiple barcodes per product: Supports scanning different barcodes or packaging batches for the same master product code.
  - Virtual Tamil character palette (`Letters` button) with 21 consonant/vowel-combination dropdowns.
- **Customer Master**:
  - Code, Name, Tamil Name, 3-line address, Area dropdown (with inline F1-New, F3-Delete, F5-Refresh), Pincode.
  - Contact numbers: 3 adjacent phone boxes (`Phone1`, `Phone2`, `CellNo`), Fax, GSTIN.
  - Financial settings: `Debit` / `Credit` type, Opening Balance, Maximum Credit Limit, Credit Days, Opening Reward Points.
- **Supplier Master**:
  - Code, Name, Address, Contact details, GSTIN, Opening Balance, Credit/Debit type, Payment Due Days.
- **Ledger Master**:
  - Ledger Code, Ledger Name, Account Group (Cash, Bank, Expenses, Assets, Liabilities), Opening Balance, Balance Type.
- **Barcode Generator**:
  - Product selection, MRP, Selling Rate, Label quantity.
  - Expiry date (`Exp`) and Packing date (`Pkd`) checkboxes.
  - Direct output to thermal barcode label printers.

---

### 3. Transactions
- **Sales / POS Billing**:
  - Core fast-billing interface.
  - Support for barcode scanning, product code lookup, auto-complete search by product name.
  - Dual language display (Tamil & English) with instant toggle (`[ ] ENG`).
  - Integration with RS-232 weighing scale for automatic weight capture on produce items.
  - Multiple price batch resolution popup when barcode maps to multiple prices.
  - Bill hold (`F11`) and retrieve held bill (`F12`) without data loss.
  - Multi-tender payments: Cash, Card, Sodexho coupons, Cheques, Customer Credit.
  - Automatic round-off to nearest rupee.
  - Change due calculation in large bold red text.
  - Immediate thermal slip generation with "Do you want to print?" confirmation.
- **Sales Return**:
  - Look up original bill via `F6-Old Bill` or manual line entry.
  - Computes refund amount or issues customer credit note.
  - Restores items to stock ledger.
- **Purchase Invoice**:
  - Reference number (e.g. `PI2`), supplier invoice number, invoice date.
  - Supplier lookup and address display.
  - Line items: Barcode, Code, Name, Stock, Qty, Free Qty, Total Stock, Cartage, Purchase Rate, Discounts, Schemes, MRP, Selling Rate, Wholesale Rate, Tax Info.
  - Automatically updates product stock, purchase rates, and supplier balance.
- **Purchase Return**:
  - Return to supplier (e.g. `PR1`) referencing original purchase invoice.
  - Adjusts supplier ledger balance and decrements stock.
- **Receipt Entry**:
  - Customer payment collection against outstanding balance.
  - Records Receipt No (e.g. `R2`), customer code, mode (Cash/Cheque), amount.
  - Prints customer receipt voucher thermal slip.
- **Payment Entry**:
  - Supplier payment recording. Displays outstanding supplier purchase invoices on top right grid to link payment directly.
  - Prints supplier payment voucher thermal slip.
- **Voucher Details**:
  - Double-entry journal voucher (Debit ledger, Credit ledger, Amount, Reference No, Narration).
- **Stock Conversion (`PC` Code)**:
  - Bulk commodity packaging conversion (e.g., deducting 50kg bulk bag and crediting 25 x 2kg retail bags).
  - Maintains strict stock quantity and valuation parity.
- **Stock Update**:
  - Physical inventory audit adjustments (`U1`).
  - Logs actual stock count, variance, valuation impact, and reason.

---

### 4. Reports & Reporting Standards
- **Standard Controls on All Reports**:
  - Date Range selector (`Start Date` to `End Date`) or single Date.
  - `CTRL + R` Report Settings shortcut.
  - Action buttons: `View`, `Print`, `Close`, `Excel` (direct `.xlsx` export).
  - Column visibility checkboxes above each table header: allows users to toggle individual columns on or off before viewing or exporting.
- **Report Catalog**:
  - *Supplier Reports*: Supplier List, Supplier Balance, Supplier Ledger.
  - *Customer Reports*: Customer List, Customer Balance, Customer Ledger, Areawise Customer List, Reward Points History.
  - *Stock Reports*: Total Stock Value (with opening, purchase, returns, sales, conversions, closing), Supplierwise Stock, Reorder Stock, Product Ledger.
  - *Sales Reports*: Sales Details Brief, Sales Details Full, Daywise Sales Details, Userwise Sales, Counterwise Sales, Daily Profit Report, Sodexho Statement, Credit Sales.
  - *Purchase Reports*: Purchase Details Brief, Purchase Details Full, Product-wise Purchase.
  - *Profit Reports*: Profit Details Brief (per bill gross profit), Profit Details Full (item-level margin and cost breakdown).
  - *Accounts Reports*: Day-End Cash Reconciliation Report, Day Book, Cash Book, Bank Book, GSTR-1, GSTR-2.
