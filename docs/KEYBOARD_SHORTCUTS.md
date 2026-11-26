# Barakah Bepaar – Keyboard Shortcuts Specification

Supermarket billing operations are 100% keyboard-driven. Cashiers rarely touch a mouse during high-throughput billing. All shortcuts must be implemented globally using Avalonia `KeyBinding` and routed directly to the active view models.

---

### 1. POS Billing Terminal Shortcuts

| Shortcut | Action | Scope / Context | Verified Legacy Behavior |
|---|---|---|---|
| `CTRL + N` | New Bill / Invoice | Sales Screen | Clears the active grid, generates the next local invoice sequence number, resets Customer to `CASH` (`F1`), and focuses the Barcode field. |
| `CTRL + S` | Save Bill | Sales Screen | Validates items, calculates final taxes and round-off, triggers the payment tender dialog or immediate cash commit, saves to local SQLite, and prompts "Do you want to print?" (`image34.jpeg`). |
| `CTRL + X` | Delete Active Line / Bill | Sales Screen | Deletes the currently highlighted grid row; if grid is empty, prompts for bill void/cancellation (subject to supervisor permission). |
| `ESC` | Exit / Close Active Window | Universal | Closes the current active window or cancels the current floating dialog/search popup. |
| `ALT + P` | Quick New Product Master | Sales / Purchase | Opens a lightweight `Quick Product Add` modal allowing cashiers to register an unrecognized item without leaving the billing session. |
| `F1` | Product Code Search / Default Customer | Sales Screen | In Product Code field: opens the product search browser. In Customer Code field: defaults immediately to Cash customer (`CASH`). |
| `F2` | Barcode Field Focus | Product Master | Direct focus jump to Barcode entry field. |
| `F4` | Date Selection Dialog | Lists & Reports | Opens `-Display Records Between-` date picker modal (`image41.jpeg`). |
| `F5` | Change Rate Type | Sales Screen | Cycles or opens dropdown for `1 RRate`, `2 WRate`, `3 BRate`, `4 MRP`. |
| `F6` | Customer Search / Old Bill | Sales / Return | In Sales Screen: Opens the `-Search Customer-` modal (`image39.jpeg`) with Phone/Name filters. In Sales Return: Opens `Old Bill Lookup` (`image43.jpeg`). |
| `F7` | Next Bill Navigation | Sales Screen | Loads the next sequential invoice into view mode. |
| `F8` | Last Bill Navigation | Sales Screen | Loads the previous sequential invoice into view mode. |
| `F11` | Hold Current Bill | Sales Screen | Suspends the active bill, moves lines to in-memory hold cache, prompts confirmation (`image35.jpeg`), and clears screen for next customer. |
| `F12` | Retrieve Held Bill | Sales Screen | Displays the top banner listing held tickets (`image36.jpeg`). Pressing Enter restores the highlighted held ticket. |

---

### 2. Masters & Transaction Shortcuts

| Shortcut | Action | Window / Module |
|---|---|---|
| `CTRL + N` | New Record | All Master forms (Product, Category, Customer, Supplier, Ledger, Paid In/Out) |
| `CTRL + S` | Save Record | All Master forms |
| `CTRL + X` | Delete Record | All Master forms |
| `CTRL + P` | Print Voucher / Record | Receipt Entry, Payment Entry |
| `ALT + L` | Quick New Ledger | Voucher Details |
| `CTRL + R` | Open Report Settings | All Report screens (Supplier, Customer, Stock, Sales, Purchase, Profit) |

---

### 3. Grid & Modal Navigation Rules

1. **Enter Key Navigation**:
   - In Barcode field: Pressing Enter with a scanned/typed barcode resolves the item, adds it to the grid, and refocuses the Barcode field for the next scan.
   - In Auto-Complete Dropdown: Up/Down arrow keys highlight the candidate item; Enter selects the item and closes the dropdown.
   - In Quantity field: Pressing Enter commits quantity change and recalculates line total.
2. **Arrow Key Traversal**:
   - Up/Down keys inside the pink product grid navigate through scanned lines.
   - Delete key on highlighted row triggers line deletion confirmation.
3. **Tab Sequence**:
   - Focus sequence: Barcode -> Qty -> Next Scan. Never stops on read-only fields (MRP, Tax, Amount) unless explicitly enabled for rate alteration.
