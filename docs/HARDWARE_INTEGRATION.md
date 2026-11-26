# Barakah Bepaar – Hardware Integration & Peripheral Drivers

### 1. Electronic Weighing Scale Integration (`IWeighingScaleService`)

As verified on Screenshot `126497929...`, the billing software integrates with weighing scales and provides a `[ ] DISABLE W/M` toggle.

#### 1.1 Communication Protocol
- **Physical Interface**: RS-232 9-pin Serial COM Port or USB-to-UART bridge (Prolific / FTDI / CH340).
- **Default Port Configuration**:
  - Baud Rate: `9600` (configurable 2400–19200)
  - Data Bits: `8`
  - Stop Bits: `One`
  - Parity: `None`
  - Handshake: `None`
- **Data Parsing Engine**:
  Most supermarket scales continuously transmit weight packets in ASCII format:
  ```
  STX [Status] [Sign] [Weight: 6 chars] [Units: 2 chars] CR LF ETX
  Example: "\x0200+00.250kg\r\n\x03" -> Parsed weight = 0.250 kg
  ```
- **Operational Integration**:
  When a product marked `is_weighing_machine = true` is scanned or entered, the terminal automatically populates the parsed weight into the `Qty` field. If `DISABLE W/M` is checked, cashier manually types the decimal quantity.

---

### 2. ESC/POS Thermal Receipt Printing (`IRawPrinterService`)

As observed in Slides 9, 41, 44, and 46, receipts are printed on 80mm / 58mm thermal rolls.

#### 2.1 Direct Raw Spooling
Instead of slow GDI/Windows Print dialogs, Barakah Bepaar transmits native ESC/POS command bytes directly to the printer spooler:

```csharp
// Sample ESC/POS Command Sequence for Supermarket Receipts:
byte[] InitPrinter     = new byte[] { 0x1B, 0x40 };                   // ESC @ (Initialize)
byte[] AlignCenter     = new byte[] { 0x1B, 0x61, 0x01 };             // ESC a 1 (Center)
byte[] BoldOn          = new byte[] { 0x1B, 0x45, 0x01 };             // ESC E 1 (Bold ON)
byte[] DoubleHeight    = new byte[] { 0x1D, 0x21, 0x01 };             // GS ! 1 (Double Height)
byte[] AlignLeft       = new byte[] { 0x1B, 0x61, 0x00 };             // ESC a 0 (Left)
byte[] FeedAndCut      = new byte[] { 0x1D, 0x56, 0x41, 0x10 };       // GS V 65 16 (Cut with feed)
byte[] OpenCashDrawer  = new byte[] { 0x1B, 0x70, 0x00, 0x19, 0xFA }; // ESC p 0 25 250 (Kick pulse)
```

#### 2.2 Standard Receipt Layout Format (40 Monospace Columns)
```
========================================
            DEMO GST VERSION            
      No.220,Rahat Plaza, 3rd floor     
       Arcot Road, Vadapalani, Ch-26    
       Phone: 9840048123, 9600246616    
            GSTIN: 1234567890           
No: SI-01-T01-000018  3:18 PM  22/08/2026
----------------------------------------
Product             Qty    MRP   Rate  Amount
----------------------------------------
S CANDY 1KG           1  85.00  78.00   78.00
D BEANS 250G          1  30.00  26.00   26.00
----------------------------------------
Total : 2           Qty: 2.000         104.00
----------------------------------------
         BILL AMT: ₹ 104.00             
  Your Savings In this Bill: 11.00      
  Non Taxable Sales: 104.00             
----------------------------------------
Paid Amt: 104.00       Returned Amt: 0.00
----------------------------------------
        THANK YOU. VISIT AGAIN.         
========================================
```

---

### 3. Barcode Scanner Keyboard Wedge
- Standard USB 1D / 2D barcode scanners (Honeywell, Zebra, Datalogic) configured in USB HID Keyboard mode.
- The terminal implements an auto-focus lock on the active yellow Barcode field.
- Scanner suffix `Enter` (`\r`) automatically triggers instant product retrieval in `< 50ms`.
