# Barakah Bepaar – Core Business Logic & Calculation Specification

### 1. POS Billing & Line Item Calculations

#### 1.1 Line Item Value Computation
For each scanned or selected product:
- **Quantity ($Q$)**: Supports both integer quantities (e.g., $1, 2, 10$) and decimal quantities for weighed items (e.g., $0.200, 0.250, 1.450$).
- **Selling Rate ($R$)**: Determined by the active Rate Type (`1 RRate`, `2 WRate`, `3 BRate`, `4 MRP`).
- **Base Line Value ($V_{base}$)**:
  $$V_{base} = Q \times R$$
- **Tax Classification**:
  Each product references a GST Tax Code (T1–T5):
  - **T1**: Non-Taxable / Exempt ($0\%$)
  - **T2**: GST @ $5\%$ (CGST $2.5\%$ + SGST $2.5\%$)
  - **T3**: GST @ $12\%$ (CGST $6.0\%$ + SGST $6.0\%$)
  - **T4**: GST @ $18\%$ (CGST $9.0\%$ + SGST $9.0\%$)
  - **T5**: GST @ $28\%$ (CGST $14.0\%$ + SGST $14.0\%$)
- **Tax-Inclusive Pricing Mode** (Default retail supermarket practice observed in Vanigam):
  $$TaxAmount = V_{base} - \left( \frac{V_{base}}{1 + \frac{Tax\%}{100}} \right)$$

#### 1.2 Invoice Level Totals & Round-Off
- **Gross Amount**: Sum of all line item values:
  $$GrossAmount = \sum V_{base}$$
- **Discounts**: Item level discount + Bill level discount ($Disc_{bill}$).
- **Net Amount before Round-off**:
  $$Net_{raw} = GrossAmount - Disc_{bill} + DeliveryCharge + MiscCharge$$
- **Round-Off ($ROff$)**:
  Calculated to nearest rupee ($0.50$ rounds up):
  $$ROff = \text{round}(Net_{raw}) - Net_{raw}$$
  $$NetAmount = \text{round}(Net_{raw})$$
- **Balance / Change Due**:
  $$Change = PaidAmount - NetAmount$$
  Displayed in large crimson red text on the right of the summary line.

---

### 2. Multi-Tender & Split Payment Logic

As evidenced in Slide 36 (`CARD/SODEXHO/CHEQUE/OTHERS`):
1. **Cash Payment**:
   - Cash received entered into `Paid Amount`.
   - If `Paid Amount >= Net Amount`, invoice completes immediately; change is displayed on screen and printed on thermal slip (`image42.jpeg`).
2. **Card Payment**:
   - Card Number (last 4 digits), Issuing Bank name, and Transaction Reference.
   - Surcharge ($Card\%$) applied if configured.
3. **Sodexho Meal Vouchers / Coupons**:
   - Cashiers enter the tally of paper coupons into the denomination table:
     $$TotalCouponValue = \sum (\text{Denomination} \times \text{Count})$$
   - Vouchers are non-refundable; if coupon total exceeds bill, excess is forfeited (or recorded as coupon excess).
4. **Credit Sales (Customer Account)**:
   - Permitted only if selected Customer has credit facility enabled.
   - Verifies:
     $$CurrentBalance + NetAmount \le MaxCreditLimit$$
   - Updates Customer ledger balance atomically.

---

### 3. Inventory Movements & Stock Ledger

Every stock change must create an immutable entry in the `stock_ledger` table:

| Transaction Type | Quantity Effect | Reference Document |
|---|---|---|
| **Purchase Invoice** | $+Q$ | Purchase Reference (e.g. `PI2`) |
| **Purchase Return** | $-Q$ | Purchase Return No (e.g. `PR1`) |
| **Sales Invoice** | $-Q$ | Invoice No (e.g. `SI18`) |
| **Sales Return** | $+Q$ | Sales Return No (e.g. `SR1`) |
| **Stock Conversion (Source)** | $-Q_{source}$ | Conversion Code (e.g. `PC1`) |
| **Stock Conversion (Target)** | $+Q_{target}$ | Conversion Code (e.g. `PC1`) |
| **Stock Update** | $\pm \Delta Q$ | Stock Update Code (e.g. `U1`) |

#### 3.1 Total Stock Value Balance Formula
Verified against Slide 59 (`Total Stock Value` report):
$$ClosingStock = Opening + Purchase - PReturn - Sales + Adjust - Con(-) + Con(+)$$
$$ClosingValue = ClosingStock \times PurchaseRate$$

---

### 4. Cash Drawer & Day-End Balancing

Verified against Slide 7 (`Denominations`) and Slide 9 (`DAYEND REPORT 2`):
1. Cashier enters closing physical currency count:
   $$PhysicalCash = \sum (\text{NoteDenom} \times \text{Count}) + Coins$$
2. System calculates expected register cash:
   $$ExpectedCash = OpeningCash + CashSales - CashReturns + PaidIn - PaidOut$$
3. Discrepancy computed:
   $$ExcessOrShortage = PhysicalCash - ExpectedCash$$
4. Day-End thermal slip printed showing full breakdown of card, credit, coupons, and physical cash tally.

---

### 5. Estimate Mode Lifecycle (`[ ] EST`)

The supermarket uses Estimate Mode for pro-forma customer price quotes:
1. **Activation**: Cashier checks the `[x] EST` checkbox on the POS billing header.
2. **Identification**: The invoice number changes to an estimate sequence: `EST-{Year}-{Sequence:D4}` (e.g., `EST-2026-0042`).
3. **Inventory Rule (Zero Stock Deduction)**:
   - When saving an Estimate (`Ctrl+S`), **no stock is deducted** from the `stock_ledger` or `current_stock`.
   - A confirmation prompt asks: *"Save this Estimation for Customer Quote?"* with options `[ Save Quote ]` or `[ Discard ]`.
4. **Estimation Registry & Recall**:
   - Saved estimates are stored in the local estimation register.
   - When a customer returns to purchase, the cashier can recall the estimation by number or customer name.
5. **Conversion to Official Invoice**:
   - Cashier unchecks `[ ] EST` or clicks `[ Convert to Official Bill ]`.
   - The system checks current available stock for all line items.
   - Cashier completes payment tender (Cash/Card).
   - Official invoice number assigned (e.g. `SI-01-T01-000142`).
   - **Only now is inventory atomically deducted** and tax registers updated.

---

### 6. Demo Seed Products (10 Indian Supermarket Items)

Extracted from live Vanigam supermarket production screenshots:

| Code | English Name | Tamil Name (`பொருட்பெயர்`) | Default Rate (₹) | MRP (₹) | Unit | Decimal Allowed | Tax Slab | Barcode |
|---|---|---|---|---|---|:---:|:---:|---|
| **1** | MANJAL | மஞ்சள் (Turmeric) | 180.00 | 0.00 | Kg | Yes | T1 (0%) | 890100000001 |
| **173** | MILAGA.KUNDU | கு.மிளகாய் (Round Chili) | 280.00 | 0.00 | Kg | Yes | T1 (0%) | 890100000173 |
| **172** | DHANIYA | தனியா (Coriander Seeds) | 200.00 | 1.00 | Kg | Yes | T1 (0%) | 890100000172 |
| **375** | SUKKU | சுக்கு (Dry Ginger) | 450.00 | 0.00 | Kg | Yes | T1 (0%) | 890100000375 |
| **144** | MANJAL KOMBU | கொம்பு மஞ்சள் (Finger Turmeric) | 1.00 | 0.00 | Kg | Yes | T1 (0%) | 890100000144 |
| **159** | MEELAGU 100GRAM | மிளகு100கிராம் (Black Pepper) | 90.00 | 0.00 | Nos | No | T1 (0%) | 890100000159 |
| **346** | SIRAGAM 100G | சீரகம்100கிராம் (Cumin Seeds) | 40.00 | 0.00 | Nos | No | T1 (0%) | 890100000346 |
| **461** | VENTHIYAM | வெந்தியம் (Fenugreek) | 120.00 | 0.00 | Kg | Yes | T1 (0%) | 890100000461 |
| **436** | TPARUPU | தடம் து பருப்பு (Toor Dal) | 160.00 | 0.00 | Kg | Yes | T1 (0%) | 890100000436 |
| **123** | LG.THOOL | எல்.ஜீ.தூள் (Compounded Asafoetida) | 75.00 | 0.00 | Nos | No | T1 (0%) | 890100000123 |
| **1002** | CLINIC PLUS 80ML | கிளினிக் பிளஸ் 80மி.லி | 44.00 | 47.00 | Nos | No | T4 (18%) | 8901030623066 |
| **4991** | HORLICKS 200G REF | ஹார்லிக்ஸ் 200கி | 108.00 | 110.00 | Nos | No | T4 (18%) | 8901571001873 |
