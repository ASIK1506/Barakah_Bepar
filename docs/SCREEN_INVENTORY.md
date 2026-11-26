# Barakah Bepaar – Master Screen Inventory
## Complete Reverse Engineered Inventory of 73 Presentation Slides & Live Screenshots

### 1. Presentation Structure Overview
`RETAIL SOFTWARE.pptx` contains 73 slides divided into 4 core functional sections:
- **Slides 1–2**: Splash & Main MDI Application Window with Login
- **Slides 3–9**: FILE Menu Operations (User Management, Configuration, Denominations, Paid In/Out, Day-End)
- **Slides 10–23**: MASTERS Module (Tax, Category, Product Master, Barcode Generator, Customer, Supplier, Ledger)
- **Slides 24–49**: TRANSACTIONS Module (Purchase, Purchase Return, Sales / POS Billing, Sales Return, Receipt, Payment, Voucher, Stock Transfer/Conversion, Stock Update)
- **Slides 50–72**: REPORTS Module (Supplier, Customer, Stock, Sales, Purchase, Profit, Accounts)
- **Slide 73**: Concluding slide

---

### 2. Comprehensive Slide-by-Slide Inventory

| Slide # | Screen / Window Name | Module Group | Reference Image | Key Elements & Layout Observed | Keyboard Shortcuts Observed |
|:---:|:---|:---|:---|:---|:---|
| **1** | Title Slide | Presentation | `image3.jpeg` | Retail Software Demo cover slide | - |
| **2** | Main MDI Window & Login | Main Shell | `image4.jpeg` | MDI Parent window (`AdminSoft....`). Top Menu bar (`File`, `Masters`, `Transactions`, `Reports`, `Exit`). Bottom-right modal login box with `User Name` and `Password` input fields. Background branding: Vanigam 4.0, Divine Infotech, contact numbers. | Enter to submit login |
| **3** | Section Divider: FILE | Presentation | None | Section title: "FILE" | - |
| **4** | File Menu Dropdown | Main Shell | `image7.jpeg` | Dropdown items: Company Information, Calculator, Calendar, User Information, Configuration, Repair Database, Edit Product, Denomination, Edit Barcode, Log Off. | Alt+F for File menu |
| **5** | User Information | File | `image8.jpeg` | Red title `USER INFORMATION`. Action buttons: New (blank doc), Save (floppy), Delete (triangle/trash), Close (red alert). Tabs: `User Details`, `User List`. Fields: `User Name` [text], `Password` [masked], `User Level` [dropdown: User, Administrator]. | `CTRL+N` New Record; `CTRL+S` Save Record; `ESC` Exit |
| **6** | Configuration (User Login Configuration) | File | `image9.jpeg` | Permissions matrix by user. User dropdown selector. Three permission groups with checkboxes: `Master Details` (8 modules), `Transations` (10 modules), `Reports` (8 modules). Action buttons: Save, Edit, Close. | `F1` Save Record |
| **7** | Denominations | File | `image10.jpeg` | Cash drawer physical currency count modal. Input field `COUNT : [ ]`. Currency rows: 2000, 500, 100, 50, 20, 10, 5, Coins. Multiplier fields: Denomination x Qty = Line Total. `Total : [ ]`. Action buttons: Save, Exit, Paid In/Outs. | Enter navigation |
| **8** | Paid In - Paid Out | File | `image11.jpeg` | Cash movement voucher. Tabs: `Information`, `List`. Fields: `Code` [auto-gen, e.g. S1], `Date` [DD/MM/YYYY], `Party Name`, `Amount`, Radio buttons `(*) PAID OUT ( ) PAID IN`, multiline `Info:`. Action buttons: New, Save, Delete. | `Ctrl+N` New; `Ctrl+S` Save; `Ctrl+X` Delete |
| **9** | Day-End Cash Report Receipt | Output | `image12.jpeg` | 40-column thermal receipt slip: Header `DAYEND REPORT 2 ADMIN [Date]`, Credit Bills summary, Credit Card Bills summary, Day-End Cash summary (Cash Sales, Credit, Card, Sodexho, Cheque, Coupon, Total), Cash on Hand denomination count, Final cash reconciliation (Cash Sales (+) - Returns (-) + Paid In - Paid Out = Net, Cash on Hand vs Net = Excess/Shortage). | Printed automatically |
| **10** | Section Divider: MASTERS | Presentation | None | Section title: "MASTERS" | - |
| **11** | Masters Menu Dropdown | Main Shell | `image13.jpeg` | Dropdown items: Product Category, Product Details, Customer Information, Supplier Information, Group Information, Ledger Information, Tax Information, BarCode Generator. | Alt+M for Masters menu |
| **12** | Category Information (Details Tab) | Masters | `image14.jpeg` | Red title `CATEGORY INFORMATION`. Tabs: `Category Information`, `Category List`. Fields: `Category Code` [e.g. 61], `Category Name` [e.g. OIL], `Reward Points` [e.g. 0] Per 100Rs. Action buttons: New, Save, Print, Close. | `CTRL+N` New; `CTRL+S` Save; `CTRL+X` Delete; `ESC` Exit |
| **13** | Category Information (List Tab) | Masters | `image15.jpeg` | Category List tab. Top filter boxes: `Code [ ]`, `Name [ ]`. DataGrid columns: `Code`, `Category Name`, `Points`. Vertical scrollbar. | Tab/Arrow navigation |
| **14** | Product Information (Barcode Subgrid) | Masters | `image16.jpeg` | Complex master form. Tabs: `Product Details`, `Product List`. Top bar: Hint `F2-BARCODE`, Navigation (`|<`, `<< F7`, `>> F8`, `>|`). Action buttons: New, Save, Print, Close, Letters (Tamil virtual palette). Fields: Sales Tax, Purchase Tax, Product Code, Tamil Name (`பொருட்பெயர்`), Product Name, Category, Unit, Checkboxes: `[ ] DECIMAL`, `[ ] Rate Alter`, `[ ] WMACHINE`. Opening Stock, Opening Value, Purchase Rate, MRP, Retail Rate (with Profit %), Wholesale Rate, Profit %, Discount %, Reorder Level, Location, Free Qty, Supplier dropdown. Subgrid for multi-barcode entries: `BARCODE`, `PRATE`, `MRP`, `RATE`. | `CTRL+N` New; `CTRL+X` Delete; `CTRL+S` Save; `ESC` Exit |
| **15** | Product Information (Tamil Virtual Palette) | Masters | `image17.jpeg` | `Letters` button activated: displays floating overlay `தமிழ் எழுத்துக்கள்` on the left. 21 letter dropdown selectors (`க`, `ச`, `ட`, `த`, `ப`, `ற`, `ங`, `ஞ`, `ண`, `ந`, `ம`, `ன`, `ய`, `ர`, `ல`, `வ`, `ழ`, `ள`, `அ`, `ஸ`, `?`, `Close`). Allows cashier to compose Tamil letters without phonetic IME. | Click / Dropdown selection |
| **16** | Product Information (Multiple Barcode Batches) | Masters | `image18.jpeg` | Product 4991 HORLICKS 200G REF with two distinct barcode price batches: (Barcode 8901571001873 @ PRate 82.00, MRP 105.00, Rate 102.00) and (Barcode 8901571001873 @ PRate 88.00, MRP 110.00, Rate 108.00). | Arrow navigation in subgrid |
| **17** | Product Information (Product List Tab) | Masters | `image19.jpeg` | Product List tab. Search filters: `Product code [ ]`, `Product Name [ ]`. DataGrid columns: `Code`, `Product Name`, `Sales Rate`, `Opening Stock`. Dense display of catalog. | Arrow keys / Enter to open |
| **18** | Customer Information (Details Tab) | Masters | `image20.jpeg` | Red title `CUSTOMER INFORMATION`. Tabs: `Information`, `List`. Action buttons: New, Save, Print, Letters, Close. Fields: `Customer Code` [C3], `Customer Name` [Vanigam], `Tamil Details` [Tamil Name/Address], `Address` [3 lines], `Area` [dropdown with F1-New F3-Delete F5-Refresh], `Pincode`, `Phone No.` [3 adjacent inputs], `Fax No.`, `GSTIN`, `Opening Amount`, Radio `(*) Debit ( ) Credit`, `Maximum Credit`, `Credit Days`, `Opening Rewards`. | `CTRL+N` New; `CTRL+X` Delete; `CTRL+S` Save; `ESC` Exit |
| **19** | Customer Information (List Tab) | Masters | `image21.jpeg` | Customer List tab. Filters: `Customer Code [ ]`, `Customer Name [ ]`. DataGrid columns: `Code`, `Name`, `Address`, `Credit`, `Debit`. Bottom status bar shortcut guide. | Double click row to load |
| **20** | Supplier Information (Details Tab) | Masters | `image22.jpeg` | Red title `SUPPLIER INFORMATION`. Tabs: `Supplier Information`, `Supplier List`. Fields: `Supplier Code` [S1], `Supplier Name` [VANIGAM], `Address` [3 lines], `Pincode`, `Phone No.` [2 boxes], `Cell No.`, `Fax No.`, `E-Mail`, `GSTIN`, `Reg.No2`, `Opening Amount`, Radio `(*) Credit ( ) Debit`, `Due Days`. Action buttons: New, Save, Print, Close. | `CTRL+N` New; `CTRL+X` Delete; `CTRL+S` Save; `ESC` Exit |
| **21** | Supplier Information (List Tab) | Masters | `image23.jpeg` | Supplier List tab. Filters: `Supplier Code [ ]`, `Supplier Name [ ]`. DataGrid columns: `Code`, `Name`, `Address`, `Credit`, `Debit`. Bottom summary row with Total. | Arrow navigation |
| **22** | Ledger Information | Masters | `image24.jpeg` | Red title `LEDGER INFORMATION`. Tabs: `Ledger Information`, `Ledger List`. Fields: `Ledger Code` [L1], `Ledger Name`, `Group Name`, `Opening Value`, Radio `( ) Debit ( ) Credit`. Action buttons: New, Save, Print, Close. | `CTRL+N` New; `CTRL+S` Save; `ESC` Exit |
| **23** | Bar Code Generator | Masters | `image25.jpeg` | Barcode label generation & printing utility. `PRINTER : [dropdown]`. Fields: `Code` [2611], `Name` [SUGAR 2KG], `MRP` [96.00], `Rate` [90.00], `Labels` [4]. Button: `Add`. Staging grid: `Code | Name | Rate | Qty`. Checkboxes: `[ ] Exp [Date]`, `[ ] Pkd`. Action buttons: Print, Close. | Enter to add to queue |
| **24** | Section Divider: TRANSACTIONS | Presentation | None | Section title: "TRANSACTIONS" | - |
| **25** | Transactions Menu Dropdown | Main Shell | `image26.jpeg` | Dropdown items: Purchase Invoice, Purchase Return, Sales Invoice (Ctrl+I), Sales Return, Voucher Entry, Receipt Details, Payment Details, Redeem Points, Stock Convertion, Stock Update. | Alt+T for Transactions |
| **26** | Purchase Information (Details Tab) | Transactions | `image27.jpeg` | Inward purchase invoice entry. Tabs: `Invoice Information`, `Invoice List`. Header: `Reference No: [PI2]`, `Invoice Date`, `Invoice No`, `Supplier Code`, `Supplier Name`, `Supplier Address`. Active product entry box: Barcode (yellow), Code, Name, Stock, Qty, Free, Total Stock, Cartage, P.Rate, Discount Info (%), Scheme Info, Amount, S%, S.Rate, MRP, W%, W.Rate, Tax Info, NRate. Product grid: `Product Name | Qty | Free | P.Rate | Value | Disc | Tax | S.Rate | MRP | Scheme | NRate | NValue`. Footer totals. | `CTRL+N` New; `CTRL+S` Save; `CTRL+X` Delete; `ESC` Exit; `ALT+P` New Product |
| **27** | Purchase Information (Search Dropdown) | Transactions | `image28.jpeg` | Active product search popup over purchase grid with light cyan background: `Code | Name | MRP | PRATE | SRATE | Stock | Tax% | Unit`. Highlighted active row. | Up/Down arrows + Enter |
| **28** | Purchase Information (Invoice List Tab) | Transactions | `image29.jpeg` | Purchase invoice listing tab. Filters: `Ref No [ ]`, `Supplier Name [ ]`. Hint: `Press F4 for Date Selection`. DataGrid columns: `Ref No | Inv No | Inv Date | Supplier Name | Items | Nett Amount | Paid Amount`. Total summary row at bottom. | F4 Date Filter |
| **29** | Purchase Return | Transactions | `image30.png` | Outward return to supplier. Return No [PR1], Invoice Date, Reference No, Supplier Details. Product entry row and grid: `Product Name | Qty | Free | P.Rate | Value | Disc | Tax | S.Rate | MRP | Scheme | NRate`. Footer financial summary. | `CTRL+N` New; `CTRL+S` Save; `CTRL+X` Delete; `ESC` Exit |
| **30** | Sales Information (Empty Invoice) | Transactions | `image31.jpeg` | Default empty state of the POS billing terminal. Rate Type: `1 RRate`. Default customer: `Cash` (`Customer Code: F1`). Bill Date: Current date. Admin badge. Checkboxes: `[x] GST`, `[ ] EST`, `[x] BCODE`, `[x] ENG`, `[x] NAME`. Large zero totals. | Standard POS shortcuts |
| **31** | Sales Information (Product Search 'a') | Transactions | `image32.jpeg` | Typing 'a' in product name box triggers a drop-down search list with pink background: `Code | Name | Mrp | Rate | Stock | TamilName`. Active selection highlighted in dark blue. | Up/Down + Enter to pick |
| **32** | Sales Information (Blank Grid Ready) | Transactions | `image33.jpeg` | Active billing screen ready for item scanning. Status bar displays all 12 operational shortcuts clearly. | F1, F5, F6, F7, F8, F11, F12 |
| **33** | Sales Information (Confirm Print Dialog) | Transactions | `image34.jpeg` | Saving bill (`Ctrl+S`) prompts modal: `Confirm Print` - "Do you want to print?" [ Yes ] [ No ]. Displays red change indicator `200.00` in top header bar. | Enter for Yes, Esc for No |
| **34** | Sales Information (Hold Bill F11) | Transactions | `image35.jpeg` | Cashier pressing `F11` triggers modal: `Hold Data - 7` - "Do you want Hold this Information" [ Yes ] [ No ]. Moves pending items to in-memory hold queue. | `F11` Hold |
| **35** | Sales Information (Retrieve Held Bill F12) | Transactions | `image36.jpeg` | Cashier pressing `F12` reveals blue held bill banner across top panel: `18-05-18 Vanigam | 3 | 74.00`. Clicking or pressing Enter loads the held bill back onto the active grid. | `F12` Retrieve |
| **36** | Sales Information (Payment Split Dialog) | Transactions | `image37.jpeg` | Multi-tender payment modal: `CARD/SODEXHO/CHEQUE/OTHERS`. Radio buttons: `(*) CARD ( ) SODEXHO ( ) CHQ/DD ( ) OTHERS`. Card fields: Number, Bank, Amount, Card %. Sodexho denominations table on right (5, 10, 20, 30, 50, 100, 150, 500). | Arrow keys & Enter |
| **37** | Sales Information (Multi-Rate Batch Popup) | Transactions | `image38.jpeg` | Scanning barcode with multiple active batches (e.g. 8901571001873) opens popup directly below barcode field: `MRP | RATE | PRATE`. Cashier selects active batch. | Up/Down + Enter |
| **38** | Sales Information (Customer Search F6) | Transactions | `image39.jpeg` | Pressing `F6` opens search panel `-Search Customer-`. Radio selectors: `( ) Name (*) Phone1 ( ) Phone2 ( ) Cell No`. Search input box. Grid: `Code | Name | Add1 | Add2 | Add4 | Phone1 | Phone2 | CellNo`. | `F6` Search |
| **39** | Sales Information (Sales List Tab) | Transactions | `image40.jpeg` | Sales invoice history tab. Filters: `Invoice No [ ]`, `Amount [ ]`, `Customer Name [ ]`. Hint: `Press F4 for Date Selection`. Grid: `Inv No | Inv Date | Customer Name | Items | Nett Amt | Cash Amt | Card Amt | Sodexho | Cheque | Others`. Total row. | F4 Date Selection |
| **40** | Sales Information (Date Range Filter F4) | Transactions | `image41.jpeg` | Modal dialog triggered by `F4`: `-Display Records Between-` with `From Date [ ]` and `To Date [ ]` inputs, [ OK ] button. | F4 Date Picker |
| **41** | Sales Invoice POS Thermal Receipt | Output | `image42.jpeg` | Thermal receipt slip: Store Header (Vadapalani, Chennai), GSTIN, Invoice No, Time, Date. Table: `Product | Qty | MRP | Rate | Amount`. Summary: `BILL AMT: ₹ 104.00`, `Your Savings In this Bill: 11.00`, `Non Taxable Sales: 104.00`, `Paid Amt: 104.00`, `Returned Amt: 0.00`. Footer: "THANK YOU.VISIT AGAIN." | Auto-print on save |
| **42** | Sales Return | Transactions | `image43.jpeg` | Return screen. Invoice No [SR1], Invoice Date, Customer Name/Code, Previous Balance. Box: Product entry with Barcode. Grid: `Code | Product Name | Rate | Qty | Mrp | Tamil Name | Tax | Tax% | Value`. Footer totals with Net Return and Paid Amount. Shortcut: `F6-Old Bill` to link return to original sale. | `F6` Old Bill lookup |
| **43** | Receipt Information | Transactions | `image44.jpeg` | Customer payment receipt. Window: `RECEIPT ENTRY`. Red title `RECEIPT INFORMATION`. Tabs: `Receipt Details`, `Receipt List`. Blue header: `Total Balance: 178.00`. Fields: Receipt No, Date, Customer Code, Name, Address [3 lines], Receipt Mode [CASH], Received Amount [178.00], multiline `Information`. Buttons: New, Save, Delete, Print, Close. | `CTRL+N` New; `CTRL+S` Save; `CTRL+X` Delete; `ESC` Exit; `Ctrl+P` Print |
| **44** | Receipt Voucher Thermal Slip | Output | `image45.jpeg` | Thermal slip for customer receipt: Header, Customer Code, Name, Time, Date, `BALANCE AMT: 230.00`, `AMOUNT PAID: 230.00`, `BALANCE: 0.00`, `Signature`. | Auto-print on receipt save |
| **45** | Payment Information | Transactions | `image46.jpeg` | Supplier payment entry. Window: `PAYMENT INFORMATION`. Red header: `Total Balance: 1541.50`. Supplier invoice balance subgrid on top-right: `No. | Date | Total | Balance` (allows linking payment to specific supplier purchase invoice!). Fields: Payment No, Supplier Code, Address [5 lines], Payment Mode [CASH], Amount Paid, multiline `Information`, Payment Date, Cheque No. | `CTRL+N` New; `CTRL+S` Save; `CTRL+X` Delete; `ESC` Exit; `Ctrl+P` Print |
| **46** | Payment Voucher Thermal Slip | Output | `image47.jpeg` | Thermal slip for supplier payment: Header, Supplier Code, Supplier Name, Time, Date, `Balance: 550.00`, `Amount Paid: 550.00`, `Remaining Balance: 0.00`. | Print on save |
| **47** | Voucher Details | Transactions | `image48.jpeg` | Journal / General voucher entry. Window: `Voucher Information`. Red title `VOUCHER DETAILS`. Tabs: `Voucher Details`, `Voucher List`. Fields: `Voucher Code` [V1], `Date`, `Debit` [e.g. CASH], `Credit` [e.g. RENT], `Amount` [5000.00], `Chk/Ref No: [ ]`, multiline `Note`. Shortcut: `ALT+L - New Ledger`. | `CTRL+N` New; `CTRL+S` Save; `CTRL+X` Delete; `ESC` Exit; `ALT+L` New Ledger |
| **48** | Stock Transfer (Stock Conversion) | Transactions | `image49.jpeg` | Stock packaging/conversion module. Code [PC1], Date. Top section (Bulk Item): Product Code [2611], Name [SUGAR 2KG], Stock [10], C.Stock [50] (red text). Bottom section (Retail Item): Product Code [2141], Name [SUGAM 1KG], Stock [20], C.Stock [0]. Deducts bulk stock and credits retail packs. | `New`, `Save`, `Delete`, `Close` |
| **49** | Stock Update | Transactions | `image50.jpeg` | Direct physical stock adjustment / reconciliation. Code [U1], Date, Indicator `Stock - 0.00` (red). Fields: Product Code [2611], Product Name [SUGAR 2KG], Current Stock [50], MRP [96.00], Purchase Rate [84.00], WRate [0.00], Retail Rate [90.00], Total Stock Value [4200.00] (calculated as 50 * 84), multiline `Info:`. | `Ctrl+N` New; `Ctrl+S` Save; `Ctrl+X` Delete |
| **50** | Section Divider: REPORTS | Presentation | None | Section title: "REPORTS" | - |
| **51** | Reports Menu Overview | Main Shell | `image51.jpeg` | Top-level Reports dropdown: Supplier >, Customer >, Stock >, Sales >, Sales Return >, Purchase >, Purchase Return >, Accounts >. | Alt+R for Reports |
| **52** | Supplier Reports Submenu | Reports | `image52.jpeg` | Submenu items: Supplier List, Supplier Balance, Supplier Ledger. | Arrow keys navigation |
| **53** | Supplier Balance Report | Reports | `image53.jpeg` | Red title `SUPPLIER BALANCE`. Action buttons: View, Print, Close, Excel (green X icon). Date indicator. Columns: `[x] Code | [x] Name | [x] Balance`. Summary Total row. Note checkboxes above each column header for column visibility customization! | `CTRL+R` Report Settings |
| **54** | Supplier Ledger Report | Reports | `image54.jpeg` | Red title `SUPPLIER LEDGER`. Supplier No [S1], Name [VICKY]. Date Range: `Start Date [ ]` to `End Date [ ]`. Columns: `[x] Code | [x] Date | Particulars | [x] Invoice | [x] Balance | [x] Payment | [x] Closing`. Tracks opening, invoices (PI), payments (P), returns (PR), closing. | `CTRL+R` Report Settings |
| **55** | Customer Reports Submenu | Reports | `image55.jpeg` | Submenu items: Customer List, Customer Balance, Customer Ledger, Areawise Customer List, Areawise Customer Balance, Reward Points History, Customer Points, Receipt Details, Non Visited Customers. | Arrow keys navigation |
| **56** | Customer Balance Report | Reports | `image56.jpeg` | Red title `CUSTOMER BALANCE`. Single Date filter. Action buttons: View, Print, Close, Excel. Columns: `Code | Name | Balance | LDate` (Last transaction date). Total row. | Column checkboxes |
| **57** | Customer Ledger Report | Reports | `image57.jpeg` | Red title `CUSTOMER LEDGER`. Customer No [C7], Name. Date range filter. Columns: `[x] Code | [x] Date | Particulars | [x] Invoice | [x] Balance | [x] Receipt | [x] Closing`. Reconciles invoices (SI) and receipts (R). | `CTRL+R` Report Settings |
| **58** | Stock Reports Submenu | Reports | `image58.png` | Submenu items: Supplierwise Stock Status, Total Stock, Category-Wise Stock, Product Ledger, Non Moving Items, Stock Statement, Fast Moving Items, Productwise Stock, Product List, Tax Categorywise Product, Reorder Report, Categorywise Reorder, Stock Convertion Report, Stock Update Report. | Arrow keys navigation |
| **59** | Total Stock Value Report | Reports | `image59.jpeg` | Complete inventory movement audit report. Date range. Columns: `[x] CODE | [x] PRODUCT NAME | [x] OPENING | [x] PURCHASE | [x] PRETURN | [x] SALES | [x] ADJUST | [x] CON.(-) | [x] CON.(+) | [x] CLOSING | [x] VALUE`. Formula: Closing = Opening + Purchase - PReturn - Sales + Adjust - Con(-) + Con(+). | Formula validation |
| **60** | Sales Reports Submenu | Reports | `image60.png` | Submenu items: Customer Sales List, Sales Details Brief, Sales Details Full, Userwise Sales Brief, Categorized Daily Sales, Userwise Daily Sales, Counterwise Sales, Counterwise Userwise Sales, Product Wise Sales, Customer Wise Sales Brief/Full, Deleted Sales Brief/Full, Daily Sales, Daily Profit Report, Sodexho Statement, Categorywise Productwise Sales, Rate Alter Report, Credit Sales Brief/Full. | Comprehensive sales breakdown |
| **61** | Sales Details - Brief Report | Reports | `image61.jpeg` | Red title `SALES DETAILS - BRIEF`. Date range. Columns: `[x] CODE | [x] DATE | [x] CUSTOMER NAME | [x] NETT AMT | [x] CASH | [x] CARD | [x] SODEXHO | [x] CHEQUE | [x] OTHERS | [x] CR/DIFF`. Summary totals by payment tender. | Tender reconciliation |
| **62** | Sales Details - Full Report | Reports | `image62.jpeg` | Red title `SALES DETAILS - FULL`. Date range. Itemized sales invoice report. Columns: `[x] NO | [x] DATE | [x] CUSTOMER | [x] PRODUCT NAME | [x] MRP | [x] RATE | [x] QTY | [x] VALUE | [x] ROFF | [x] NETT AMT`. | Item-level sales audit |
| **63** | Daywise Sales Details Report | Reports | `image63.jpeg` | Red title `Daywise Sales Details`. Date range. Daily sales aggregation. Columns: `[x] SNo | [x] Date | [x] Cash Sales | [x] Card Sales | [x] Sodexho. | [x] Cheque | [x] Others | [x] Cred.Sal | [x] Tot.Sales | [x] Profit Amt | [x] Profit %`. | Daily P&L and tender totals |
| **64** | Daywise Sales Details (Single Date) | Reports | `image64.jpeg` | Same report filtered for a single operating date (`05/05/2018`). | Daily closing validation |
| **65** | Sales Return Reports Submenu | Reports | `image65.png` | Submenu items: Sales Return Brief, Sales Return Full. | Arrow navigation |
| **66** | Purchase Reports Submenu | Reports | `image66.jpeg` | Submenu items: Purchase Details Brief, Purchase Details Full, Product wise Purchase, Today's Purchase. | Arrow navigation |
| **67** | Purchase Details - Brief Report | Reports | `image67.jpeg` | Red title `PURCHASE DETAILS - BRIEF`. Date range. Columns: `[x] REF | [x] CODE | [x] DATE | [x] SUPPLIER NAME | [x] ITEM | [x] GROSS AMT | [x] TAX AMT | [x] DISC% | [x] DISCOUNT | [x] CARTAGE | [x] ROFF | [x] NETT AMT`. | Supplier billing audit |
| **68** | Purchase Details - Full Report | Reports | `image68.jpeg` | Red title `PURCHASE DETAILS - FULL`. Itemized supplier purchase records. Columns: `[x] Ref | [x] Code | [x] Date | [x] Supplier Name | [x] Product Name | [x] MRP | [x] NRate | [x] Rate | [x] Qty | [x] Value`. | Item-level purchase audit |
| **69** | Purchase Return Reports Submenu | Reports | `image69.jpeg` | Submenu items: Purchase Return Brief, Purchase Return Full. | Arrow navigation |
| **70** | Accounts Reports Submenu | Reports | `image70.jpeg` | Submenu items: Day End Report, Day Book, Bank Book, Cash Book, Ledger Transactions, Cheque Details, Output Tax, Output Tax Elaborate, Input Tax, Input Tax Elaborate, Profit Details, VAT REPORT, Categorywise Profit, Trial Balance, GSTR 1, GSTR 2, Ratewise Sales. | Statutory GST & Financial Accounting |
| **71** | Profit Details - Brief Report | Reports | `image71.jpeg` | Red title `PROFIT DETAILS - BRIEF`. Radio toggle: `(*) Brief ( ) Full`. Date range. Columns: `[x] Bill No | [x] Date | [x] Customer Name | [x] Prchs Amt | [x] Sales Amt | [x] Profit Amt | [x] Profit%`. Gross profit per invoice. | Gross margin tracking |
| **72** | Profit Details - Full Report | Reports | `image72.jpeg` | Red title `PROFIT DETAILS - FULL`. Radio toggle: `( ) Brief (*) Full`. Item-level profit breakdown. Columns: `[x] Bill No | [x] Date | [x] Customer Name | [x] Product Name | [x] Rate | [x] Qty | [x] Profit | [x] C.Rate | [x] PDisc | [x] BDisc | [x] BProf`. | Product line margin audit |
| **73** | Closing Slide | Presentation | `image5.png` | "Thank You" concluding slide | - |

---

### 3. Supplemental Production Screenshots Inventory

1. `Screenshot 2026-11-24 121834.png` (Live Vanigam Supermarket Billing System):
   - Confirms live production POS screen in full Tamil language mode (`[ ] ENG` unchecked).
   - Shows Tamil product names (`கு.மிளகாய்`, `தனியா`, `சுக்கு`, `கொம்பு மஞ்சள்`, `மிளகு100கிராம்`, `சீரகம்100கிராம்`, `வெந்தியம்`, `தடம் து பருப்பு`, `எல்.ஜீ.தூள்`).
   - Confirms decimal quantity support (`.200`, `.250`).
   - Shows top stock balance indicator `இருப்பு : -74` in red.
   - Shows sum of items count `10.85 எண்` and total amount `1786.25`.

2. `Screenshot 2026-11-24 121637.png` (Confirmation Popup):
   - Shows exact modal confirmation box: Title `உறுதி செய்` (Confirm) with yellow smiley face icon.
   - Message: `உறுதியாக மாற்ற வேண்டுமா?` (Do you really want to change/proceed?).
   - Action buttons: `சரி` (OK/Yes) and `வேண்டாம்` (Cancel/No).

3. `offline-vanigam-supermarket-billing-software-1000x1000.webp` (High-Res English POS Screen):
   - Shows full English mode (`[x] ENG` checked).
   - Shows alternating lavender/pink table rows with bright pink active selection.
   - Detailed header breakdown: Rate Type `1 RRate`, T.Points, Prev Purchase date `04/01/23`, Customer Code `F1`, Customer Name `CASH`.

4. `offline-vanigam-supermarket-billing-software-500x500 (1).webp` (Daily Profit Report):
   - Shows column checkboxes allowing cashiers/managers to show or hide individual report columns dynamically.
   - Shows profit percentage calculations with negative profit indicator for loss items (`-91.64%`).

5. `offline-vanigam-supermarket-billing-software-500x500 (2).webp` (Product List with GST Tax Codes):
   - Displays top tax reference header: `T1 - Non Taxable, T2-Tax@5%, T3-Tax@12%, T4-Tax@18%, T5-Tax@28%`.
   - Proves five standard GST rate classes in production.
   - Columns: `Code | Product Name | Tamil Name | PRate | SRate | Mrp | WRate | BRate | GST%`.

6. `offline-vanigam-supermarket-billing-software-500x500 (3).webp` (Product Master Detail View):
   - Confirms field labels: `LOCATION : 0`, `P.RATE 1: 0.00`, `P.RATE 2: 0.00`, `P.RATE 3: 0.00` (cyan background fields).
   - Confirms checkboxes: `[x] DECIMAL`, `[ ] Rate Alter`, `[ ] BLOCK` (Red text BLOCK for discontinued products).
   - Confirms piece calculation: `Pcs/Unit : 120`, `Current Stock(Pcs) : 0`.

7. `offline-vanigam-supermarket-billing-software-500x500 (4).webp` & `(5).webp` (Reorder Stock Report):
   - Shows reorder level triggers: `Code | Product Name | Reorder | Stock | L Prchs | Date | Supplier | Rate | Qty`.

8. `offline-vanigam-supermarket-billing-software-500x500.webp` (Live Auto-Complete Search Popup):
   - Shows real-time auto-complete when typing "MAN" in the Name box:
   - Floating table directly over grid: `Code | Name | Mrp | Rate | Stock | TamilName`.

9. `126497929_193753238919529_8799877944518381199_n.jpg.jpeg` (Full Desktop Environment):
   - Confirms hardware integration checkbox: `[ ] DISABLE W/M` (Weighing Machine bypass toggle).
   - Confirms operating environment: Windows 7 / Windows 10 desktop at 1024x768 / 1366x768 resolution.
