# Barakah Bepaar – Database Architecture & Schema Specification
## Dual-Tier PostgreSQL (Central/HQ) & SQLite (Terminal Local) Design

### 1. Architectural Strategy
To ensure offline billing continuity without compromising financial consistency:
1. **Central / Branch Database (PostgreSQL 16+)**: The authoritative system of record. Enforces ACID transactions, relational integrity, unique transaction UUIDs, audit logging, and accounting ledgers.
2. **Terminal Database (SQLite 3.45+)**: Embedded within each billing counter desktop application. Stores read-only cached catalog snapshots and a durable transactional outbox for unsynchronized bills.

---

### 2. Central PostgreSQL Relational Schema

```sql
-- ============================================================================
-- 1. SECURITY & USER MANAGEMENT
-- ============================================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    user_level VARCHAR(20) NOT NULL DEFAULT 'User', -- 'User' or 'Administrator'
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    module_code VARCHAR(50) NOT NULL, -- e.g. 'SALES_INFO', 'TAX_MASTER', etc.
    can_access BOOLEAN NOT NULL DEFAULT FALSE,
    can_create BOOLEAN NOT NULL DEFAULT FALSE,
    can_edit BOOLEAN NOT NULL DEFAULT FALSE,
    can_delete BOOLEAN NOT NULL DEFAULT FALSE,
    UNIQUE(user_id, module_code)
);

-- ============================================================================
-- 2. MASTERS
-- ============================================================================

CREATE TABLE tax_masters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tax_code VARCHAR(10) NOT NULL UNIQUE, -- 'T1', 'T2', 'T3', 'T4', 'T5'
    tax_name VARCHAR(100) NOT NULL, -- 'Non Taxable', 'GST @5%', 'GST @12%', 'GST @18%', 'GST @28%'
    cgst_percent NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    sgst_percent NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    igst_percent NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    cess_percent NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    additional_cess_rate NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE product_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_code VARCHAR(20) NOT NULL UNIQUE,
    category_name VARCHAR(100) NOT NULL,
    reward_points_per_100rs NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_code VARCHAR(50) NOT NULL UNIQUE,
    product_name VARCHAR(200) NOT NULL,
    tamil_name VARCHAR(200),
    category_id UUID NOT NULL REFERENCES product_categories(id),
    unit VARCHAR(20) NOT NULL DEFAULT 'Nos', -- 'Nos', 'Kg', 'Gms', 'Ltr', etc.
    hsn_sac VARCHAR(20),
    sales_tax_id UUID NOT NULL REFERENCES tax_masters(id),
    purchase_tax_id UUID NOT NULL REFERENCES tax_masters(id),
    is_decimal_allowed BOOLEAN NOT NULL DEFAULT FALSE,
    is_weighing_machine BOOLEAN NOT NULL DEFAULT FALSE,
    is_rate_alter_allowed BOOLEAN NOT NULL DEFAULT FALSE,
    is_blocked BOOLEAN NOT NULL DEFAULT FALSE,
    reorder_level NUMERIC(12,3) NOT NULL DEFAULT 0.000,
    storage_location VARCHAR(50) DEFAULT '0',
    pieces_per_unit INTEGER NOT NULL DEFAULT 1,
    free_quantity NUMERIC(12,3) NOT NULL DEFAULT 0.000,
    default_supplier_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE product_barcodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    barcode VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, barcode)
);

CREATE TABLE product_price_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    barcode_id UUID REFERENCES product_barcodes(id) ON DELETE SET NULL,
    mrp NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    purchase_rate NUMERIC(12,4) NOT NULL DEFAULT 0.0000,
    retail_rate NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    wholesale_rate NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    branch_rate NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    profit_percent NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    discount_percent NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_code VARCHAR(50) NOT NULL UNIQUE,
    customer_name VARCHAR(150) NOT NULL,
    tamil_name VARCHAR(150),
    address_line1 VARCHAR(150),
    address_line2 VARCHAR(150),
    address_line3 VARCHAR(150),
    tamil_address TEXT,
    area VARCHAR(100),
    pincode VARCHAR(20),
    phone1 VARCHAR(30),
    phone2 VARCHAR(30),
    cell_no VARCHAR(30),
    fax_no VARCHAR(30),
    gstin VARCHAR(30),
    customer_type VARCHAR(20) NOT NULL DEFAULT 'Debit', -- 'Debit' or 'Credit'
    opening_balance NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    current_balance NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    max_credit_limit NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    credit_days INTEGER NOT NULL DEFAULT 0,
    reward_points NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_code VARCHAR(50) NOT NULL UNIQUE,
    supplier_name VARCHAR(150) NOT NULL,
    address_line1 VARCHAR(150),
    address_line2 VARCHAR(150),
    address_line3 VARCHAR(150),
    pincode VARCHAR(20),
    phone_no VARCHAR(30),
    cell_no VARCHAR(30),
    fax_no VARCHAR(30),
    email VARCHAR(100),
    gstin VARCHAR(30),
    reg_no2 VARCHAR(50),
    supplier_type VARCHAR(20) NOT NULL DEFAULT 'Credit', -- 'Credit' or 'Debit'
    opening_balance NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    current_balance NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    due_days INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ledgers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ledger_code VARCHAR(50) NOT NULL UNIQUE,
    ledger_name VARCHAR(150) NOT NULL,
    group_name VARCHAR(100) NOT NULL,
    opening_value NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    balance_type VARCHAR(20) NOT NULL DEFAULT 'Debit', -- 'Debit' or 'Credit'
    current_balance NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 3. TRANSACTIONS
-- ============================================================================

CREATE TABLE sales_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
    invoice_date DATE NOT NULL,
    invoice_time TIME NOT NULL,
    branch_id UUID NOT NULL,
    counter_id VARCHAR(50) NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id),
    customer_id UUID NOT NULL REFERENCES customers(id),
    rate_type VARCHAR(20) NOT NULL DEFAULT '1 RRate',
    is_estimate BOOLEAN NOT NULL DEFAULT FALSE,
    gross_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    points_redeemed NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    tax_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    cess_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    additional_cess NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    discount_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    delivery_charge NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    round_off NUMERIC(6,2) NOT NULL DEFAULT 0.00,
    net_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    paid_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    change_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    is_cancelled BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sales_invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sales_invoice_id UUID NOT NULL REFERENCES sales_invoices(id) ON DELETE CASCADE,
    serial_number INTEGER NOT NULL,
    product_id UUID NOT NULL REFERENCES products(id),
    product_code VARCHAR(50) NOT NULL,
    product_name VARCHAR(200) NOT NULL,
    tamil_name VARCHAR(200),
    mrp NUMERIC(12,2) NOT NULL,
    rate NUMERIC(12,2) NOT NULL,
    quantity NUMERIC(12,3) NOT NULL,
    line_value NUMERIC(12,2) NOT NULL,
    tax_percent NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    tax_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    cess_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    additional_cess NUMERIC(12,2) NOT NULL DEFAULT 0.00
);

CREATE TABLE sales_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sales_invoice_id UUID NOT NULL REFERENCES sales_invoices(id) ON DELETE CASCADE,
    payment_mode VARCHAR(30) NOT NULL, -- 'CASH', 'CARD', 'SODEXHO', 'CHQ/DD', 'CREDIT'
    amount NUMERIC(12,2) NOT NULL,
    card_number VARCHAR(30),
    bank_name VARCHAR(100),
    card_surcharge_percent NUMERIC(5,2) DEFAULT 0.00,
    cheque_no VARCHAR(50),
    sodexho_coupon_details JSONB, -- Breakdown of coupon denominations
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE purchase_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference_no VARCHAR(50) NOT NULL UNIQUE, -- e.g. 'PI2'
    invoice_number VARCHAR(50) NOT NULL,
    invoice_date DATE NOT NULL,
    supplier_id UUID NOT NULL REFERENCES suppliers(id),
    gross_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    product_discount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    scheme_discount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    bill_discount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    tax_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    cartage_charges NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    round_off NUMERIC(6,2) NOT NULL DEFAULT 0.00,
    net_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    paid_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    balance_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE stock_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id),
    transaction_type VARCHAR(30) NOT NULL, -- 'PURCHASE', 'SALE', 'SALE_RETURN', 'PURCHASE_RETURN', 'CONVERT_IN', 'CONVERT_OUT', 'STOCK_UPDATE'
    reference_id UUID NOT NULL,
    reference_number VARCHAR(50) NOT NULL,
    quantity_change NUMERIC(12,3) NOT NULL,
    stock_before NUMERIC(12,3) NOT NULL,
    stock_after NUMERIC(12,3) NOT NULL,
    purchase_rate NUMERIC(12,4) NOT NULL,
    transaction_date DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE paid_in_outs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    voucher_code VARCHAR(50) NOT NULL UNIQUE, -- e.g. 'S1'
    entry_date DATE NOT NULL,
    party_name VARCHAR(150) NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    entry_type VARCHAR(20) NOT NULL, -- 'PAID_IN' or 'PAID_OUT'
    info TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE stock_conversions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversion_code VARCHAR(50) NOT NULL UNIQUE, -- e.g. 'PC1'
    conversion_date DATE NOT NULL,
    source_product_id UUID NOT NULL REFERENCES products(id),
    source_quantity NUMERIC(12,3) NOT NULL,
    target_product_id UUID NOT NULL REFERENCES products(id),
    target_quantity NUMERIC(12,3) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

---

### 3. Local Terminal SQLite Schema

Every POS station runs an embedded SQLite database containing cached lookup tables and a resilient transactional outbox:

```sql
CREATE TABLE cache_products (
    id TEXT PRIMARY KEY,
    product_code TEXT NOT NULL,
    barcode TEXT NOT NULL,
    product_name TEXT NOT NULL,
    tamil_name TEXT,
    category_name TEXT,
    mrp REAL NOT NULL,
    retail_rate REAL NOT NULL,
    wholesale_rate REAL NOT NULL,
    branch_rate REAL NOT NULL,
    tax_percent REAL NOT NULL,
    cess_percent REAL NOT NULL,
    is_decimal INTEGER NOT NULL,
    is_weighing_machine INTEGER NOT NULL,
    current_stock REAL NOT NULL
);

CREATE TABLE outbox_sales (
    id TEXT PRIMARY KEY, -- Client UUID
    invoice_number TEXT NOT NULL UNIQUE,
    invoice_date TEXT NOT NULL,
    invoice_time TEXT NOT NULL,
    terminal_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    customer_code TEXT NOT NULL,
    gross_amount REAL NOT NULL,
    tax_amount REAL NOT NULL,
    discount_amount REAL NOT NULL,
    net_amount REAL NOT NULL,
    paid_amount REAL NOT NULL,
    sync_status TEXT NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'SYNCED', 'FAILED'
    created_at TEXT NOT NULL
);

CREATE TABLE outbox_sales_items (
    id TEXT PRIMARY KEY,
    sales_id TEXT NOT NULL REFERENCES outbox_sales(id),
    serial_no INTEGER NOT NULL,
    product_id TEXT NOT NULL,
    product_code TEXT NOT NULL,
    product_name TEXT NOT NULL,
    tamil_name TEXT,
    rate REAL NOT NULL,
    quantity REAL NOT NULL,
    line_value REAL NOT NULL
);

CREATE TABLE outbox_payments (
    id TEXT PRIMARY KEY,
    sales_id TEXT NOT NULL REFERENCES outbox_sales(id),
    payment_mode TEXT NOT NULL,
    amount REAL NOT NULL,
    details_json TEXT
);
```
