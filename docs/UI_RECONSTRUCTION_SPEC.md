# Barakah Bepaar – UI Reconstruction Specification
## Pixel-Identical Design System & Control Specifications for Avalonia UI

### 1. Design System & Theme Foundations

To guarantee zero retraining for supermarket cashier staff, the visual appearance of Barakah Bepaar must faithfully recreate the Windows Classic Win32 aesthetics of the legacy Vanigam retail software.

#### 1.1 Color Palette Reference

| Semantic Token | Hex Code | Visual Application in Vanigam UI |
|---|---|---|
| `Color.Window.Background` | `#EBE9ED` / `#F0F0F0` | Main window and dialog background |
| `Color.Panel.Border` | `#808080` / `#A0A0A0` | Outer 1px inset borders of groupboxes and tab controls |
| `Color.Header.Text` | `#800000` / `#990000` | Bold crimson red titles on master and transaction forms |
| `Color.Input.ActiveBarcode` | `#FFFF80` / `#FFF59D` | Active yellow background on barcode scanning text field |
| `Color.Input.PcsUnitRate` | `#B2EBF2` / `#D4F6F9` | Cyan background on P.RATE 1, 2, 3 fields |
| `Color.Grid.RowEven` | `#FFFFFF` | White background on even DataGrid rows |
| `Color.Grid.RowOdd` | `#FDF2F8` / `#FFF0F5` | Pale lavender/pink alternating background on odd rows |
| `Color.Grid.RowSelected` | `#FF00FF` / `#000080` | Bright magenta or classic dark navy active row selection |
| `Color.Grid.AmountText` | `#CC0000` | Bright crimson text on line item values and amounts |
| `Color.Total.HeaderLarge` | `#000066` / `#000000` | 28pt bold navy/black header total display |
| `Color.Total.ChangeRed` | `#CC0000` | 24pt bold red change / balance indicator |
| `Color.Customer.PanelBg` | `#E8F4FD` / `#EBF5FB` | Pale blue background of customer information block |
| `Color.Shortcuts.Line1` | `#990000` | Dark red text for primary shortcuts (`Ctrl+N`, `Ctrl+S`, etc.) |
| `Color.Shortcuts.Line2` | `#000000` | Black text for function key shortcuts (`F1`, `F7`, `F11`, etc.) |

---

### 2. Window & Layout Anatomy

#### 2.1 Geometry & Scaling Rules
- **Base Canvas**: Fixed proportion 1024 x 768 pixels.
- **Scaling Behavior**: Uses Avalonia `Viewbox` or high-DPI coordinate scaling (`Stretch="Uniform"`) so that 1366x768 and 1920x1080 displays scale smoothly without breaking relative field alignment or compact line density.
- **MDI Layout**: The top level application is a classic MDI Parent shell with a Menu Bar (`File`, `Masters`, `Transactions`, `Reports`, `Exit`) and an inner desktop workspace hosting compact child windows.

#### 2.2 Top Header & Action Buttons
Every master and transaction screen follows a consistent top header pattern:
1. **Module Title**: 16pt Bold Serif/Sans Crimson Red text (e.g., `PRODUCT INFORMATION`, `SALES INFORMATION`, `PURCHASE INFORMATION`).
2. **Action Button Bar** (Top-Right):
   - Compact 3D beveled buttons with 16x16 or 24x24 icons:
     - `New` (Blank sheet of paper icon)
     - `Save` (3.5" Blue floppy disk icon)
     - `Delete` (Triangle/hazard/trash icon)
     - `Print` (Desktop laser printer icon)
     - `Close` (Red triangular warning/exit icon)
     - `Letters` (Rainbow color wheel icon – opens virtual Tamil keyboard)
     - `Excel` (Green Excel spreadsheet icon – available on reports)
   - Dual-language typography on buttons: Tamil label placed on top (in purple text) and English label placed below (in black text), e.g.:
     `சேர்ப்பு` / `New`
     `பதிவு` / `Save`
     `ரத்து` / `Delete`
     `அச்சிடு` / `Print`
     `முற்றும்` / `Close`

---

### 3. Sales / POS Screen Layout Specification

The Sales / POS billing screen is the highest priority screen in the system. Its layout is structured into five distinct vertical tiers:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ [1489.00] 9 Nos          Stock - 0.0      [x] NAME [ ] ENG [ ] EST  [New][Save][Print] │
├───────────────────────────────┬────────────────────────────────────────────────────────┤
│ Invoice No:   [SI18         ] │ Customer Code: [F1]   Customer Name: [CASH           ] │
│ Invoice Date: [01/12/2023   ] │ T.Points: [0.00]  Prev Purchase: [04/01/23]            │
│ Rate Type:    [1 RRate     v] │ Balance:  [0.00]                                     S │
│ Time:         [05:15:38 PM  ] │                                                      A │
│ User:         [ADMIN        ] │                                                      L │
│ Navigation:   [|<][<<][>>][>|]│                                                      E │
├───────────────────────────────┴────────────────────────────────────────────────────────┤
│ - Product -                                                                            │
│ Code: [     ]  Barcode: [█████████████████]  MRP: [0.00]  Rate: [0.00]  Qty: [1]       │
│                Name:    [                 ]  Value: [0.00]  GST%: [0]  CESS%: [0]      │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ SNo | Code | Tamil Name        | Rate   | Qty | MRP   | Product Name      | Value     │
│  1  |  173 | கு.மிளகாய்       | 280.00 |   2 |  0.00 | MILAGA.KUNDU      | 560.00    │
│  2  |  172 | தனியா            | 200.00 |   4 |  1.00 | DHANIYA           | 800.00    │
│  3  |  375 | சுக்கு            | 450.00 | .20 |  0.00 | SUKKU             |  90.00    │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ Items Gross POINTS TaxAmt CESS ACESS DiscInfo Delivery ROff NettAmt MISC Other  [0.00] │
│   3   1450   0.00   83.89 0.00 0.00  0.0 0.00   0.00   0.00 1450.00 0.00  0.00        │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ CTRL+N - New ; CTRL+S - Save ; CTRL+X - Delete ; ESC - Exit  ALT+P - New Product ;     │
│ F1 - Product; F7-Next Bill; F8-Last Bill ; F11-Hold Bill ; F12-Retrive Holded Bill; F6 │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

#### 3.1 Field-by-Field Breakdown
1. **Invoice Number**: Left-aligned, read-only during normal billing; editable in recall mode.
2. **Rate Type Selector**: Dropdown supporting:
   - `1 RRate` (Retail Rate – default)
   - `2 WRate` (Wholesale Rate)
   - `3 BRate` (Branch / Bulk Rate)
   - `4 MRP` (Maximum Retail Price)
3. **Customer Block**:
   - Customer Code field defaults to `F1` (Cash Customer).
   - Pressing `F6` opens the Customer Search modal (search by Name, Phone1, Phone2, Cell No).
4. **Active Product Entry Row**:
   - The Barcode input box has an active yellow background (`#FFFF80`).
   - Pressing Enter or scanning barcode populates Code, Name, Tamil Name, MRP, Rate, and calculates Line Value.
   - For produce sold by weight, the weighing scale communicates via serial port and writes weight directly into `Qty`.
5. **Product Grid**:
   - Fixed row height: 22px.
   - Headers: `SNo`, `Code`, `Tamil Name`, `Rate`, `Qty`, `MRP`, `Product Name`, `Value`, `CESS`, `A.CESS`.
   - Alternating rows: White (`#FFFFFF`) and Soft Pink (`#FDF2F8`).
   - Line item values formatted in red bold text (`#CC0000`).
6. **Footer Summary Row**:
   - 13 dense inline cells: Items Count, Gross Amount, Points, Tax Amount, CESS Amount, Additional CESS, Discount Info (Percent & Value), Delivery Charge, Round Off, Net Amount, Miscellaneous Charges, Other Amount, Paid Amount.
   - Large Red Total: Right-aligned 24pt bold red text displaying Balance / Change due.

---

### 4. Floating Modals & Workflow Popups

1. **Auto-Complete Product Search (Slide 31)**:
   - When typing in the Product Name box, a floating popup appears directly over the grid.
   - Header: `Code | Name | Mrp | Rate | Stock | TamilName`.
   - Cashier uses Up/Down arrows to highlight, and Enter to select.
2. **Multi-Rate Barcode Popup (Slide 37)**:
   - If a scanned barcode matches multiple batches in the catalog, a modal dropdown opens directly under the barcode box: `MRP | RATE | PRATE`.
   - Prevents pricing errors when stock of an older batch coexists with new MRP stock.
3. **Hold / Retrieve Bill (Slides 34 & 35)**:
   - `F11` prompts: `Do you want Hold this Information` [ Yes ] [ No ].
   - `F12` displays a horizontal blue banner across the top header bar listing held tickets (e.g., `18-05-18 Vanigam | 3 | 74.00`). Pressing Enter immediately restores the ticket to the active grid.
4. **Split Tender & Card Payment Dialog (Slide 36)**:
   - Title: `CARD/SODEXHO/CHEQUE/OTHERS`.
   - Radio buttons for payment method selection.
   - Left side: Card details (Card Number, Bank, Amount, Card Surcharge %).
   - Right side: Sodexho coupon denomination table (Denomination 5, 10, 20, 30, 50, 100, 150, 500 x Count = Line Total).
5. **Confirmation Dialog (Screenshot 121637)**:
   - Title: `உறுதி செய்` (Confirm) with standard yellow smiley icon.
   - Text: `உறுதியாக மாற்ற வேண்டுமா?` (Do you really want to proceed?).
   - Buttons: `சரி` (OK) and `வேண்டாம்` (Cancel).
