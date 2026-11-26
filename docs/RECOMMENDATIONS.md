# Barakah Bepaar – Architectural & Engineering Recommendations
## Recommendations for Implementation, Robustness, and Future Extensibility

### 1. UI Fidelity & Desktop Framework Recommendations

#### 1.1 Avalonia UI Windows Classic Theme Engine
- **Recommendation**: Create an explicit `WindowsClassic.axaml` theme resource dictionary inside `Retail.Desktop/Themes/` that mirrors the Windows 7 / Windows Classic Win32 control styling:
  - Custom `DataGrid` style featuring the 1-pixel border, `#F5E6F7` (soft pink) alternating rows, `#FF00FF` / `#000080` active selection highlight, and exact 22px row heights.
  - Custom `Button` control template featuring the classic beveled 3D gradient, purple Tamil typography above, English text below, and keyboard shortcut mnemonics.
  - Active yellow input highlighting (`#FFFF99`) for barcode and product search textboxes to indicate active cashier focus.
- **Rationale**: Prevents accidental introduction of modern touch padding, rounded corners (BorderRadius > 0), or expansive margins that break cashier muscle memory.

#### 1.2 Bilingual & Tamil Typography Engine
- **Recommendation**:
  - Implement a dedicated `TamilInputManager` inside `Retail.Desktop/Services/` that provides:
    1. Unicode Tamil rendering using embedded standard fonts (e.g. `Noto Sans Tamil` or `Latha`).
    2. Bamini / TAB legacy font encoding converter if legacy master data contains non-Unicode text.
    3. An on-screen virtual Tamil keyboard modal mirroring the exact 21-dropdown consonant/vowel-combination palette observed on Slide 15 (`Letters` button).
  - Implement dynamic localization where the `[ ] ENG` checkbox immediately toggles visible labels between Tamil (`பில் எண்:`, `பொருட்பெயர்`, `விலை`, `அளவு`) and English (`Invoice No:`, `Product Name`, `Rate`, `Qty`) without reloading the view.

---

### 2. POS Offline-First & Resiliency Recommendations

#### 2.1 The Two-Tier Storage Architecture
- **Recommendation**:
  - **Tier 1 (Terminal SQLite)**: Each POS billing station runs an embedded SQLite instance (`pos_terminal_{TerminalId}.db`) configured with `PRAGMA journal_mode=WAL;` and `PRAGMA synchronous=FULL;`.
    - Contains read-only synced cache of Products, Categories, Prices, Taxes, Customers, and Sequences.
    - Contains a writable `outbox_transactions` table for offline sales and stock movements.
  - **Tier 2 (Branch / Central PostgreSQL)**: Authoritative system of record holding full historical ledger, multi-branch stock reconciliation, and centralized auditing.
- **Workflow**:
  1. Cashier scans items -> Reads from local SQLite (0.5ms latency).
  2. Cashier saves bill (`Ctrl+S`) -> Durably committed to local SQLite outbox inside an immediate ACID transaction.
  3. Bill number assigned from terminal's pre-allocated sequence block (`SI{BranchId}-{TerminalId}-{Sequence}`).
  4. Receipt prints immediately. Cashier proceeds to next customer without waiting for network ACK.
  5. Background background synchronization worker asynchronously pushes outbox records to central API via gRPC or HTTP/2.

#### 2.2 Sequence Gap Prevention & Offline Invoice Numbering
- **Recommendation**: Adopt a composite invoice prefix strategy:
  `SI-{BranchCode}-{CounterNo}-{Year}-{LocalSequence:D6}`
  - Example: `SI-01-T1-2026-000123`
- **Rationale**: Completely eliminates invoice number collisions between parallel counters during offline network partitions without requiring distributed locks.

---

### 3. Hardware Integration Recommendations

#### 3.1 Weighing Machine Serial Port Listener
- **Recommendation**: Implement `IWeighingScaleService` using `System.IO.Ports.SerialPort`:
  - Continually streams or polls gross weight from connected RS-232 / USB-to-Serial digital scales (e.g., Essae, Phoenix, Sartorius).
  - Configurable Baud rate (typically 9600-8-N-1), parity, and continuous ASCII protocol format (`STX...ETX` or `W: +00.250 kg`).
  - Wire the weight directly into the active row's `Qty` / `அளவு` field when scanning weighed produce items, with the `[ ] DISABLE W/M` checkbox enabling manual override.

#### 3.2 ESC/POS High-Speed Raw Printing
- **Recommendation**: Implement a dedicated `RawEscPosPrinterService` that writes directly to Windows Spooler via raw Win32 `OpenPrinter` / `WritePrinter` APIs or direct network socket (port 9100) instead of rendering via PDF/GDI.
  - Formats receipts in 40-column monospace (Font A) and 42/48-column (Font B).
  - Prints company header, item table with savings breakdown (`Your Savings In this Bill`), GST tax classification summary, paid amount, and auto-cut command (`GS V 65 0`).
  - Allows instant reprint from `Sales List` (`F6-Old Bill`) without re-generating transactions.

#### 3.3 Barcode Scanner Input Handling
- **Recommendation**: Support both:
  1. **Keyboard Wedge Scanners**: Handled via global KeyDown interception or dedicated focus trap on the yellow Barcode input field. Scanners typically send an enter suffix (`\r` or `\n`), which immediately triggers product resolution.
  2. **Auto-Complete Typing**: When typing product name or code manually, pop up the pink auto-complete dropdown after 2 characters, navigating rows with Up/Down arrows and selecting with Enter.

---

### 4. Database Schema & Business Logic Recommendations

#### 4.1 Multi-Rate Batch Inventory Structure
- **Recommendation**: As revealed in Slide 16 and Slide 37, a single barcode can correspond to multiple price points (e.g. MRP 105.00 @ Rate 102.00 vs MRP 110.00 @ Rate 108.00).
  - Design the product schema with a one-to-many relationship: `Product -> ProductBarcodes -> ProductPriceBatches`.
  - When scanning a barcode with multiple active batches, display the exact popup observed in Slide 37 (`MRP | RATE | PRATE`) for cashier selection.

#### 4.2 Stock Conversion Module (`PC` Code)
- **Recommendation**: The legacy system includes `Stock Convertion` (Slide 48) where bulk stock (e.g., 50kg Sugar bag) is converted into retail packaged stock (e.g., 25 x 2kg packs).
  - Implement a dual-entry stock adjustment transaction linking the source product deduction to the target product addition with zero net financial leakage.

#### 4.3 Cash Drawer & Day-End Reconciliation (`Denominations` & `Paid In/Out`)
- **Recommendation**:
  - Implement the exact Denomination counter dialog (Slide 7) at shift start and shift end (Count of 2000, 500, 200, 100, 50, 20, 10, 5, Coins).
  - Reconcile `Cash on Hand` vs `(Opening Cash + Cash Sales - Cash Returns + Paid In - Paid Out)` to compute exact `Excess / Shortage Amount` as shown on the thermal Day-End receipt (Slide 9).

---

### 5. Transition & Client Rollout Strategy

1. **Phase 1 Pilot**: Deploy the new software to one counter in parallel with legacy Vanigam in read-only / shadow mode to verify calculation parity across 10,000 real bills.
2. **Phase 2 Migration**: Import legacy SQL/Access database into PostgreSQL (Products, Categories, Customers, Suppliers, Opening Balances).
3. **Phase 3 Go-Live**: Replace terminal-by-terminal across the 5 branch shops with local offline fallback pre-configured.
