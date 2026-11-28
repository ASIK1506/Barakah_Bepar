import { SEED_PRODUCTS, SEED_CUSTOMERS } from '../data/seedData';
import { Customer, Invoice, Product } from '../types';

export interface ShopProfile {
  id: string;
  code: string;
  name: string;
  location: string;
  phone: string;
  gstin: string;
  cashierUsername: string;
  status: 'Active' | 'Inactive';
  createdAt: string;
}

export interface ProductRateTier {
  id: string;
  label: string; // e.g. 'Retail (1 Kg)', 'Wholesale (Box 40)', 'Branch Rate', 'Bulk 5 Kg'
  rate: number;
  unitNote?: string;
}

export interface AdminProduct {
  id: string;
  code: string;
  name: string;
  tamilName: string;
  category: string;
  unit: string; // 'Kg' | 'Nos' | 'Box'
  boxSize: number; // e.g., 40 pcs per box, 1 for loose
  purchasePrice: number;
  mrp: number;
  rate: number; // Retail
  wholesaleRate: number;
  branchRate: number;
  extraRates: ProductRateTier[];
  currentStock: number;
  lowStockThreshold: number;
  centralStock: number;
  shopStocks: Record<string, number>; // shopId -> qty
  barcode: string;
  taxSlabId?: string;
  lastSoldDaysAgo: number;
}

export interface AdminBillLineItem {
  productId: string;
  code: string;
  name: string;
  qty: number;
  rate: number;
  cost: number;
  total: number;
}

export interface AdminBill {
  id: string;
  billNo: string;
  shopId: string;
  shopName: string;
  date: string; // YYYY-MM-DD
  time: string;
  customerCode: string;
  customerName: string;
  customerPhone?: string;
  cashier: string;
  itemsCount: number;
  totalQty: number;
  categorySummary: string;
  grossAmount: number;
  discountAmount: number;
  costTotal: number;
  netAmount: number;
  paidAmount: number;
  pendingAmount: number;
  paymentMode: 'CASH' | 'UPI' | 'CARD' | 'CREDIT';
  status: 'Completed' | 'Credit Pending' | 'Cancelled';
  saleType: 'Retail' | 'Wholesale';
  items?: AdminBillLineItem[];
}

export interface AdminVendor {
  id: string;
  code: string;
  name: string;
  phone: string;
  category: string;
  totalPurchased: number;
  totalPaid: number;
  balanceDue: number;
}

export interface AdminPurchaseEntry {
  id: string;
  invoiceNo: string;
  date: string;
  vendorId: string;
  vendorName: string;
  productId: string;
  productName: string;
  packType: 'Loose' | 'Box' | 'Bag';
  packCount: number;
  unitsPerPack: number;
  totalUnitsAdded: number;
  costPerUnit: number;
  totalAmount: number;
  paidAmount: number;
  targetLocation: 'Central' | string; // 'Central' or shopId
}

export interface AdminExpense {
  id: string;
  date: string;
  title: string;
  category: string;
  shopId: string;
  amount: number;
}

export interface StockAllocationRecord {
  id: string;
  date: string;
  fromLocation: string;
  toShopId: string;
  toShopName: string;
  productId: string;
  productName: string;
  qty: number;
  unitLabel: string;
  note: string;
}

export interface ShopTransferRecord {
  id: string;
  transferNo: string;
  date: string;
  fromShopId: string;
  fromShopName: string;
  toShopId: string;
  toShopName: string;
  productId: string;
  productName: string;
  qty: number;
  unitLabel: string;
  status: 'Dispatched' | 'Received';
  reason: string;
}

export interface SalesReturnRecord {
  id: string;
  returnNo: string;
  originalBillNo: string;
  date: string;
  shopId: string;
  shopName: string;
  customerName: string;
  amount: number;
  reason: string;
}

export interface CustomerPaymentRecord {
  id: string;
  date: string;
  time: string;
  customerCode: string;
  customerName: string;
  customerPhone: string;
  billNo: string; // specific bill number or 'FIFO / Account'
  amount: number;
  method: 'CASH' | 'UPI' | 'CARD';
  balanceAfter: number;
  note: string;
}

export interface AdminCategory {
  id: string;
  code: string;
  name: string;
  tamilName: string;
  description: string;
}

export interface AdminTaxSlab {
  id: string;
  name: string;
  cgst: number;
  sgst: number;
  cess: number;
}

export interface CompanyProfile {
  name: string;
  address: string;
  phone: string;
  gstin: string;
  receiptFooter: string;
}

export interface PurchaseReturnRecord {
  id: string;
  returnNo: string;
  originalInvoiceNo: string;
  date: string;
  vendorId: string;
  vendorName: string;
  productId: string;
  productName: string;
  qty: number;
  amount: number;
  reason: string;
}

export interface VendorPaymentRecord {
  id: string;
  date: string;
  vendorId: string;
  vendorName: string;
  amount: number;
  method: 'CASH' | 'UPI' | 'BANK';
  balanceAfter: number;
  note: string;
}

export interface CashDenominationLog {
  id: string;
  date: string;
  cashier: string;
  notesTotal: number;
  paidIn: number;
  paidOut: number;
  closingNet: number;
  note: string;
}

export interface AdminCustomer extends Customer {
  customerType?: 'Retail' | 'Wholesale';
  creditLimit?: number;
  totalOrders?: number;
  totalSpent?: number;
}

export interface AdminStoreData {
  shops: ShopProfile[];
  products: AdminProduct[];
  customers: AdminCustomer[];
  bills: AdminBill[];
  vendors: AdminVendor[];
  purchases: AdminPurchaseEntry[];
  expenses: AdminExpense[];
  allocations: StockAllocationRecord[];
  shopTransfers?: ShopTransferRecord[];
  salesReturns?: SalesReturnRecord[];
  customerPayments?: CustomerPaymentRecord[];
  categories?: AdminCategory[];
  taxSlabs?: AdminTaxSlab[];
  company?: CompanyProfile;
  purchaseReturns?: PurchaseReturnRecord[];
  vendorPayments?: VendorPaymentRecord[];
  denominationLogs?: CashDenominationLog[];
  ownerWhatsapp: string;
}

const ADMIN_STORE_KEY = 'barakah_admin_store_v1';
export const MAX_STANDARD_SHOPS = 5;

function todayStr(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

function buildInitialSeedData(): AdminStoreData {
  const demoShop: ShopProfile = {
    id: 'shop-1',
    code: 'SH1',
    name: 'Barakah Main Store',
    location: 'Chennai - Broadway',
    phone: '98400 48123',
    gstin: '33AAACB1234F1Z5',
    cashierUsername: 'SHOP1',
    status: 'Active',
    createdAt: todayStr(-30)
  };

  const categoryMap: Record<string, string> = {
    '1': 'Spices & Masala',
    '173': 'Spices & Masala',
    '172': 'Spices & Masala',
    '375': 'Spices & Masala',
    '144': 'Spices & Masala',
    '159': 'Packed Spices',
    '346': 'Packed Spices',
    '461': 'Groceries',
    '436': 'Pulses & Dal',
    '123': 'Groceries',
    '1002': 'Personal Care',
    '4991': 'Health Drinks'
  };

  const products: AdminProduct[] = SEED_PRODUCTS.map((p, idx) => {
    const purchasePrice = Number((p.rate * 0.78).toFixed(2));
    const lowStock = idx === 3 ? 20 : idx === 6 ? 10 : 12;
    const stockOverride = idx === 3 ? 0 : idx === 4 ? 8 : p.currentStock; // Give 1 out-of-stock & 1 low-stock for alerts demo
    return {
      id: p.id,
      code: p.code,
      name: p.name,
      tamilName: p.tamilName,
      category: categoryMap[p.code] || 'Supermarket',
      unit: p.unit,
      boxSize: p.unit === 'Nos' ? 20 : 50,
      purchasePrice,
      mrp: p.mrp > 0 ? p.mrp : Number((p.rate * 1.1).toFixed(2)),
      rate: p.rate,
      wholesaleRate: p.wholesaleRate || Number((p.rate * 0.94).toFixed(2)),
      branchRate: p.branchRate || Number((p.rate * 0.9).toFixed(2)),
      extraRates: [
        { id: 'r1', label: 'Retail Rate', rate: p.rate, unitNote: `Per ${p.unit}` },
        { id: 'r2', label: 'Wholesale Rate', rate: p.wholesaleRate || Number((p.rate * 0.94).toFixed(2)), unitNote: 'Wholesale Buyer' },
        { id: 'r3', label: 'Branch / Bulk', rate: p.branchRate || Number((p.rate * 0.9).toFixed(2)), unitNote: 'Bulk Pack' }
      ],
      currentStock: stockOverride,
      lowStockThreshold: lowStock,
      centralStock: p.unit === 'Nos' ? 120 : 100,
      shopStocks: { 'shop-1': stockOverride },
      barcode: p.barcode,
      taxSlabId: p.taxSlabId || 'TAX-5',
      lastSoldDaysAgo: idx === 10 ? 45 : idx % 5
    };
  });

  // Add Wheat 100kg Bag SKU explicitly from client's requirement example
  products.push({
    id: 'prod-wheat-100',
    code: '501',
    name: 'WHEAT SAMBA (BULK)',
    tamilName: 'சம்பா கோதுமை',
    category: 'Grains & Staples',
    unit: 'Kg',
    boxSize: 100,
    purchasePrice: 48.00,
    mrp: 70.00,
    rate: 65.00,
    wholesaleRate: 58.00,
    branchRate: 55.00,
    extraRates: [
      { id: 'w-250g', label: '250g Pack', rate: 18.00, unitNote: '250 Grams' },
      { id: 'w-500g', label: '500g Pack', rate: 34.00, unitNote: '500 Grams' },
      { id: 'w-1kg', label: '1 Kg Retail', rate: 65.00, unitNote: '1 Kg' },
      { id: 'w-5kg', label: '5 Kg Pack', rate: 310.00, unitNote: '5 Kg' },
      { id: 'w-bag', label: '100 Kg Bag (Wholesale)', rate: 5500.00, unitNote: 'Full Bag' }
    ],
    currentStock: 100,
    lowStockThreshold: 25,
    centralStock: 300,
    shopStocks: { 'shop-1': 100 },
    barcode: '890100000501',
    taxSlabId: 'TAX-0',
    lastSoldDaysAgo: 0
  });

  const bills: AdminBill[] = [
    {
      id: 'b-118',
      billNo: 'SH1-0118',
      shopId: 'shop-1',
      shopName: demoShop.name,
      date: todayStr(0),
      time: '04:12 PM',
      customerCode: 'F1',
      customerName: 'CASH WALK-IN',
      cashier: 'SHOP1',
      itemsCount: 6,
      totalQty: 9,
      categorySummary: 'Grains & Staples',
      grossAmount: 1890,
      discountAmount: 40,
      costTotal: 1410,
      netAmount: 1850,
      paidAmount: 1850,
      pendingAmount: 0,
      paymentMode: 'UPI',
      status: 'Completed',
      saleType: 'Retail'
    },
    {
      id: 'b-117',
      billNo: 'SH1-0117',
      shopId: 'shop-1',
      shopName: demoShop.name,
      date: todayStr(0),
      time: '02:45 PM',
      customerCode: 'C3',
      customerName: 'Barakah Traders',
      customerPhone: '9840048123',
      cashier: 'SHOP1',
      itemsCount: 14,
      totalQty: 42,
      categorySummary: 'Spices & Masala',
      grossAmount: 8650,
      discountAmount: 150,
      costTotal: 6720,
      netAmount: 8500,
      paidAmount: 5000,
      pendingAmount: 3500,
      paymentMode: 'CREDIT',
      status: 'Credit Pending',
      saleType: 'Wholesale'
    },
    {
      id: 'b-116',
      billNo: 'SH1-0116',
      shopId: 'shop-1',
      shopName: demoShop.name,
      date: todayStr(0),
      time: '12:20 PM',
      customerCode: 'F1',
      customerName: 'CASH WALK-IN',
      cashier: 'SHOP1',
      itemsCount: 4,
      totalQty: 5,
      categorySummary: 'Pulses & Dal',
      grossAmount: 1240,
      discountAmount: 0,
      costTotal: 960,
      netAmount: 1240,
      paidAmount: 1240,
      pendingAmount: 0,
      paymentMode: 'CASH',
      status: 'Completed',
      saleType: 'Retail'
    },
    {
      id: 'b-115',
      billNo: 'SH1-0115',
      shopId: 'shop-1',
      shopName: demoShop.name,
      date: todayStr(0),
      time: '10:35 AM',
      customerCode: 'F1',
      customerName: 'K. Rahman',
      customerPhone: '9840199220',
      cashier: 'ADMIN',
      itemsCount: 8,
      totalQty: 12,
      categorySummary: 'Groceries',
      grossAmount: 3420,
      discountAmount: 120,
      costTotal: 2540,
      netAmount: 3300,
      paidAmount: 3300,
      pendingAmount: 0,
      paymentMode: 'CARD',
      status: 'Completed',
      saleType: 'Retail'
    },
    {
      id: 'b-114',
      billNo: 'SH1-0114',
      shopId: 'shop-1',
      shopName: demoShop.name,
      date: todayStr(-1),
      time: '06:50 PM',
      customerCode: 'C7',
      customerName: 'A.S VEGITABLE STORE',
      customerPhone: '9840123456',
      cashier: 'SHOP1',
      itemsCount: 18,
      totalQty: 65,
      categorySummary: 'Spices & Masala',
      grossAmount: 14200,
      discountAmount: 200,
      costTotal: 11100,
      netAmount: 14000,
      paidAmount: 9000,
      pendingAmount: 5000,
      paymentMode: 'CREDIT',
      status: 'Credit Pending',
      saleType: 'Wholesale'
    },
    {
      id: 'b-113',
      billNo: 'SH1-0113',
      shopId: 'shop-1',
      shopName: demoShop.name,
      date: todayStr(-1),
      time: '04:10 PM',
      customerCode: 'F1',
      customerName: 'CASH WALK-IN',
      cashier: 'SHOP1',
      itemsCount: 5,
      totalQty: 7,
      categorySummary: 'Packed Spices',
      grossAmount: 2150,
      discountAmount: 50,
      costTotal: 1620,
      netAmount: 2100,
      paidAmount: 2100,
      pendingAmount: 0,
      paymentMode: 'CASH',
      status: 'Completed',
      saleType: 'Retail'
    },
    {
      id: 'b-112',
      billNo: 'SH1-0112',
      shopId: 'shop-1',
      shopName: demoShop.name,
      date: todayStr(-2),
      time: '01:15 PM',
      customerCode: 'F1',
      customerName: 'S. Fatima',
      cashier: 'SHOP1',
      itemsCount: 9,
      totalQty: 11,
      categorySummary: 'Health Drinks',
      grossAmount: 4680,
      discountAmount: 80,
      costTotal: 3580,
      netAmount: 4600,
      paidAmount: 4600,
      pendingAmount: 0,
      paymentMode: 'UPI',
      status: 'Completed',
      saleType: 'Retail'
    },
    {
      id: 'b-111',
      billNo: 'SH1-0111',
      shopId: 'shop-1',
      shopName: demoShop.name,
      date: todayStr(-3),
      time: '11:40 AM',
      customerCode: 'F1',
      customerName: 'CASH WALK-IN',
      cashier: 'SHOP1',
      itemsCount: 7,
      totalQty: 14,
      categorySummary: 'Pulses & Dal',
      grossAmount: 5800,
      discountAmount: 0,
      costTotal: 4500,
      netAmount: 5800,
      paidAmount: 5800,
      pendingAmount: 0,
      paymentMode: 'CASH',
      status: 'Completed',
      saleType: 'Retail'
    },
    {
      id: 'b-110',
      billNo: 'SH1-0110',
      shopId: 'shop-1',
      shopName: demoShop.name,
      date: todayStr(-4),
      time: '05:30 PM',
      customerCode: 'F1',
      customerName: 'M. Ibrahim',
      cashier: 'SHOP1',
      itemsCount: 3,
      totalQty: 4,
      categorySummary: 'Personal Care',
      grossAmount: 980,
      discountAmount: 0,
      costTotal: 740,
      netAmount: 980,
      paidAmount: 0,
      pendingAmount: 0,
      paymentMode: 'CASH',
      status: 'Cancelled',
      saleType: 'Retail'
    },
    {
      id: 'b-109',
      billNo: 'SH1-0109',
      shopId: 'shop-1',
      shopName: demoShop.name,
      date: todayStr(-5),
      time: '03:20 PM',
      customerCode: 'C3',
      customerName: 'Barakah Traders',
      customerPhone: '9840048123',
      cashier: 'ADMIN',
      itemsCount: 11,
      totalQty: 25,
      categorySummary: 'Grains & Staples',
      grossAmount: 9400,
      discountAmount: 200,
      costTotal: 7200,
      netAmount: 9200,
      paidAmount: 9200,
      pendingAmount: 0,
      paymentMode: 'UPI',
      status: 'Completed',
      saleType: 'Wholesale'
    },
    {
      id: 'b-108',
      billNo: 'SH1-0108',
      shopId: 'shop-1',
      shopName: demoShop.name,
      date: todayStr(-6),
      time: '07:05 PM',
      customerCode: 'F1',
      customerName: 'CASH WALK-IN',
      cashier: 'SHOP1',
      itemsCount: 6,
      totalQty: 9,
      categorySummary: 'Spices & Masala',
      grossAmount: 3850,
      discountAmount: 50,
      costTotal: 2940,
      netAmount: 3800,
      paidAmount: 3800,
      pendingAmount: 0,
      paymentMode: 'CASH',
      status: 'Completed',
      saleType: 'Retail'
    }
  ];

  const vendors: AdminVendor[] = [
    {
      id: 'v-1',
      code: 'SUP-01',
      name: 'Madurai Spice Wholesale Mart',
      phone: '98421 55410',
      category: 'Spices & Masala',
      totalPurchased: 145000,
      totalPaid: 120000,
      balanceDue: 25000
    },
    {
      id: 'v-2',
      code: 'SUP-02',
      name: 'Salem Agro Grains & Pulses',
      phone: '94430 88712',
      category: 'Grains & Staples',
      totalPurchased: 98000,
      totalPaid: 86500,
      balanceDue: 11500
    },
    {
      id: 'v-3',
      code: 'SUP-03',
      name: 'Chennai FMCG Distributors',
      phone: '98409 11223',
      category: 'Personal Care & Health',
      totalPurchased: 64000,
      totalPaid: 64000,
      balanceDue: 0
    }
  ];

  const purchases: AdminPurchaseEntry[] = [
    {
      id: 'pur-1',
      invoiceNo: 'PINV-089',
      date: todayStr(-2),
      vendorId: 'v-2',
      vendorName: 'Salem Agro Grains & Pulses',
      productId: 'prod-wheat-100',
      productName: 'WHEAT SAMBA (BULK)',
      packType: 'Bag',
      packCount: 4,
      unitsPerPack: 100,
      totalUnitsAdded: 400,
      costPerUnit: 48,
      totalAmount: 19200,
      paidAmount: 12000,
      targetLocation: 'Central'
    },
    {
      id: 'pur-2',
      invoiceNo: 'PINV-088',
      date: todayStr(-4),
      vendorId: 'v-1',
      vendorName: 'Madurai Spice Wholesale Mart',
      productId: 'prod-1',
      productName: 'MANJAL',
      packType: 'Bag',
      packCount: 2,
      unitsPerPack: 50,
      totalUnitsAdded: 100,
      costPerUnit: 140,
      totalAmount: 14000,
      paidAmount: 14000,
      targetLocation: 'shop-1'
    }
  ];

  const expenses: AdminExpense[] = [
    { id: 'exp-1', date: todayStr(0), title: 'Loading & Unloading Labour', category: 'Logistics', shopId: 'shop-1', amount: 650 },
    { id: 'exp-2', date: todayStr(0), title: 'Staff Tea & Snacks', category: 'Welfare', shopId: 'shop-1', amount: 220 },
    { id: 'exp-3', date: todayStr(-2), title: 'Shop Electricity Bill (EB)', category: 'Utilities', shopId: 'shop-1', amount: 3400 },
    { id: 'exp-4', date: todayStr(-5), title: 'Thermal Roll & Packing Bags', category: 'Supplies', shopId: 'shop-1', amount: 1150 }
  ];

  const allocations: StockAllocationRecord[] = [
    {
      id: 'alloc-1',
      date: todayStr(-1),
      fromLocation: 'Central Warehouse',
      toShopId: 'shop-1',
      toShopName: demoShop.name,
      productId: 'prod-wheat-100',
      productName: 'WHEAT SAMBA (BULK)',
      qty: 100,
      unitLabel: 'Kg (1 Bag)',
      note: 'Weekly grain allocation'
    }
  ];

  const adminCustomers: AdminCustomer[] = [
    {
      code: 'C3',
      name: 'Barakah Traders',
      tamilName: 'பரக்கா வர்த்தகம்',
      phone1: '9840048123',
      phone2: '9600246616',
      balance: 3500,
      previousPurchase: todayStr(0),
      points: 150,
      customerType: 'Wholesale',
      creditLimit: 25000,
      totalOrders: 2,
      totalSpent: 17700
    },
    {
      code: 'C7',
      name: 'A.S VEGITABLE STORE',
      tamilName: 'ஏ.எஸ் காய்கறி அங்காடி',
      phone1: '9840123456',
      balance: 5000,
      previousPurchase: todayStr(-1),
      points: 420,
      customerType: 'Wholesale',
      creditLimit: 25000,
      totalOrders: 1,
      totalSpent: 14000
    },
    {
      code: 'C10',
      name: 'K. Rahman',
      tamilName: 'கே. ரஹ்மான்',
      phone1: '9840199220',
      balance: 0,
      previousPurchase: todayStr(0),
      points: 85,
      customerType: 'Retail',
      creditLimit: 5000,
      totalOrders: 1,
      totalSpent: 3300
    },
    {
      code: 'C11',
      name: 'S. Fatima',
      tamilName: 'எஸ். பாத்திமா',
      phone1: '9840233110',
      balance: 0,
      previousPurchase: todayStr(-2),
      points: 110,
      customerType: 'Retail',
      creditLimit: 3000,
      totalOrders: 1,
      totalSpent: 4600
    }
  ];

  const customerPayments: CustomerPaymentRecord[] = [
    {
      id: 'cpay-1',
      date: todayStr(0),
      time: '02:45 PM',
      customerCode: 'C3',
      customerName: 'Barakah Traders',
      customerPhone: '9840048123',
      billNo: 'SH1-0117',
      amount: 5000,
      method: 'UPI',
      balanceAfter: 3500,
      note: 'Upfront partial settlement at billing'
    },
    {
      id: 'cpay-2',
      date: todayStr(-1),
      time: '06:50 PM',
      customerCode: 'C7',
      customerName: 'A.S VEGITABLE STORE',
      customerPhone: '9840123456',
      billNo: 'SH1-0114',
      amount: 9000,
      method: 'CASH',
      balanceAfter: 5000,
      note: 'Partial payment against wholesale invoice'
    }
  ];

  const shopTransfers: ShopTransferRecord[] = [
    {
      id: 'tr-1',
      transferNo: 'IST-001',
      date: todayStr(-2),
      fromShopId: 'shop-1',
      fromShopName: demoShop.name,
      toShopId: 'shop-1',
      toShopName: 'Central Buffer Reserve',
      productId: 'prod-1',
      productName: 'MANJAL',
      qty: 10,
      unitLabel: 'Kg',
      status: 'Received',
      reason: 'Stock balancing audit record'
    }
  ];

  const salesReturns: SalesReturnRecord[] = [
    {
      id: 'sr-1',
      returnNo: 'SR-001',
      originalBillNo: 'SH1-0110',
      date: todayStr(-4),
      shopId: 'shop-1',
      shopName: demoShop.name,
      customerName: 'M. Ibrahim',
      amount: 980,
      reason: 'Damaged outer pack exchanged'
    }
  ];

  const categories: AdminCategory[] = [
    { id: 'cat-1', code: 'CAT-01', name: 'Spices & Masala', tamilName: 'மசாலா பொருட்கள்', description: 'Whole & ground spices' },
    { id: 'cat-2', code: 'CAT-02', name: 'Packed Spices', tamilName: 'பாக்கெட் மசாலா', description: 'Retail spice sachets & packs' },
    { id: 'cat-3', code: 'CAT-03', name: 'Grains & Staples', tamilName: 'தானியங்கள்', description: 'Wheat, rice, bulk bags' },
    { id: 'cat-4', code: 'CAT-04', name: 'Pulses & Dal', tamilName: 'பருப்பு வகைகள்', description: 'Toor, urad & lentils' },
    { id: 'cat-5', code: 'CAT-05', name: 'Groceries', tamilName: 'மளிகை பொருட்கள்', description: 'Daily household groceries' },
    { id: 'cat-6', code: 'CAT-06', name: 'Health Drinks', tamilName: 'ஆரோக்கிய பானங்கள்', description: 'Beverages & health mixes' },
    { id: 'cat-7', code: 'CAT-07', name: 'Personal Care', tamilName: 'சுய பராமரிப்பு', description: 'Soaps, cosmetics & hygiene' }
  ];

  const taxSlabs: AdminTaxSlab[] = [
    { id: 'TAX-0', name: 'GST 0% (Exempt)', cgst: 0, sgst: 0, cess: 0 },
    { id: 'TAX-5', name: 'GST 5% (2.5% + 2.5%)', cgst: 2.5, sgst: 2.5, cess: 0 },
    { id: 'TAX-12', name: 'GST 12% (6% + 6%)', cgst: 6, sgst: 6, cess: 0 },
    { id: 'TAX-18', name: 'GST 18% (9% + 9%)', cgst: 9, sgst: 9, cess: 0 },
    { id: 'TAX-28', name: 'GST 28% (14% + 14%)', cgst: 14, sgst: 14, cess: 0 }
  ];

  const company: CompanyProfile = {
    name: 'Barakah Bepaar Retail & Wholesale',
    address: 'No. 42, Broadway Main Road, Chennai - 600108',
    phone: '98400 48123',
    gstin: '33AAACB1234F1Z5',
    receiptFooter: 'Thank you for shopping at Barakah Bepaar! நன்றி! மீண்டும் வருக!'
  };

  const purchaseReturns: PurchaseReturnRecord[] = [
    {
      id: 'pret-1',
      returnNo: 'PR-001',
      originalInvoiceNo: 'PINV-089',
      date: todayStr(-1),
      vendorId: 'v-2',
      vendorName: 'Salem Agro Grains & Pulses',
      productId: 'prod-wheat-100',
      productName: 'WHEAT SAMBA (BULK)',
      qty: 10,
      amount: 480,
      reason: '10 Kg damaged sack returned to supplier'
    }
  ];

  const vendorPayments: VendorPaymentRecord[] = [
    {
      id: 'vpay-1',
      date: todayStr(-2),
      vendorId: 'v-2',
      vendorName: 'Salem Agro Grains & Pulses',
      amount: 12000,
      method: 'BANK',
      balanceAfter: 11500,
      note: 'Partial payment against PINV-089'
    }
  ];

  const denominationLogs: CashDenominationLog[] = [
    {
      id: 'denom-1',
      date: todayStr(-1),
      cashier: 'SHOP1',
      notesTotal: 14500,
      paidIn: 500,
      paidOut: 850,
      closingNet: 14150,
      note: 'Evening drawer tally matched'
    }
  ];

  return {
    shops: [demoShop],
    products,
    customers: adminCustomers,
    bills,
    vendors,
    purchases,
    expenses,
    allocations,
    shopTransfers,
    salesReturns,
    customerPayments,
    categories,
    taxSlabs,
    company,
    purchaseReturns,
    vendorPayments,
    denominationLogs,
    ownerWhatsapp: '9840048123'
  };
}

export function loadAdminStore(): AdminStoreData {
  try {
    const raw = localStorage.getItem(ADMIN_STORE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.shops) && parsed.shops.length > 0) {
        const fresh = buildInitialSeedData();
        if (!Array.isArray(parsed.customerPayments)) {
          parsed.customerPayments = fresh.customerPayments;
          parsed.customers = fresh.customers;
        }
        if (!Array.isArray(parsed.shopTransfers)) parsed.shopTransfers = fresh.shopTransfers;
        if (!Array.isArray(parsed.salesReturns)) parsed.salesReturns = fresh.salesReturns;
        if (!Array.isArray(parsed.categories)) parsed.categories = fresh.categories;
        if (!Array.isArray(parsed.taxSlabs)) parsed.taxSlabs = fresh.taxSlabs;
        if (!parsed.company) parsed.company = fresh.company;
        if (!Array.isArray(parsed.purchaseReturns)) parsed.purchaseReturns = fresh.purchaseReturns;
        if (!Array.isArray(parsed.vendorPayments)) parsed.vendorPayments = fresh.vendorPayments;
        if (!Array.isArray(parsed.denominationLogs)) parsed.denominationLogs = fresh.denominationLogs;
        return parsed;
      }
    }
  } catch {}
  const initial = buildInitialSeedData();
  saveAdminStore(initial);
  return initial;
}

export function collectCustomerUdharPayment(
  store: AdminStoreData,
  params: {
    customerCode: string;
    amount: number;
    method: 'CASH' | 'UPI' | 'CARD';
    specificBillNo?: string;
    note?: string;
  }
): AdminStoreData {
  const cust = store.customers.find(c => c.code === params.customerCode);
  if (!cust || params.amount <= 0) return store;

  let remainingPayment = Math.min(params.amount, cust.balance);
  const newBalance = Number(Math.max(0, cust.balance - remainingPayment).toFixed(2));
  const appliedBills: string[] = [];

  // Settle either specific bill first, or FIFO across oldest pending bills
  const sortedBills = [...store.bills].sort((a, b) => a.date.localeCompare(b.date));
  const pendingBillUpdates: Record<string, { paidAmount: number; pendingAmount: number; status: AdminBill['status'] }> = {};

  if (params.specificBillNo) {
    const target = sortedBills.find(b => b.billNo === params.specificBillNo && b.pendingAmount > 0);
    if (target) {
      const apply = Math.min(remainingPayment, target.pendingAmount);
      const nextPaid = target.paidAmount + apply;
      const nextPending = Number(Math.max(0, target.netAmount - nextPaid).toFixed(2));
      pendingBillUpdates[target.id] = {
        paidAmount: nextPaid,
        pendingAmount: nextPending,
        status: nextPending === 0 ? 'Completed' : 'Credit Pending'
      };
      appliedBills.push(target.billNo);
      remainingPayment -= apply;
    }
  }

  for (const b of sortedBills) {
    if (remainingPayment <= 0) break;
    if (pendingBillUpdates[b.id]) continue;
    if (b.customerCode !== cust.code && b.customerName.toLowerCase() !== cust.name.toLowerCase()) continue;
    if (b.pendingAmount <= 0 || b.status === 'Cancelled') continue;

    const apply = Math.min(remainingPayment, b.pendingAmount);
    const nextPaid = b.paidAmount + apply;
    const nextPending = Number(Math.max(0, b.netAmount - nextPaid).toFixed(2));
    pendingBillUpdates[b.id] = {
      paidAmount: nextPaid,
      pendingAmount: nextPending,
      status: nextPending === 0 ? 'Completed' : 'Credit Pending'
    };
    appliedBills.push(b.billNo);
    remainingPayment -= apply;
  }

  const nextBills = store.bills.map(b => (pendingBillUpdates[b.id] ? { ...b, ...pendingBillUpdates[b.id] } : b));
  const nextCustomers = store.customers.map(c => (c.code === cust.code ? { ...c, balance: newBalance } : c));

  const now = new Date();
  const paymentLog: CustomerPaymentRecord = {
    id: `cpay-${Date.now()}`,
    date: now.toISOString().slice(0, 10),
    time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    customerCode: cust.code,
    customerName: cust.name,
    customerPhone: cust.phone1,
    billNo: appliedBills.length > 0 ? appliedBills.join(', ') : params.specificBillNo || 'Account Recovery',
    amount: Math.min(params.amount, cust.balance),
    method: params.method,
    balanceAfter: newBalance,
    note: params.note || 'Udhar recovery payment'
  };

  return {
    ...store,
    customers: nextCustomers,
    bills: nextBills,
    customerPayments: [paymentLog, ...(store.customerPayments || [])]
  };
}

export function saveAdminStore(data: AdminStoreData): void {
  try {
    localStorage.setItem(ADMIN_STORE_KEY, JSON.stringify(data));
  } catch {}
}

export function resetAdminStore(): AdminStoreData {
  const initial = buildInitialSeedData();
  saveAdminStore(initial);
  return initial;
}

export function formatINR(amount: number, compact = false): string {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';
  if (compact) {
    if (abs >= 100000) return `${sign}₹${(abs / 100000).toFixed(1)}L`;
    if (abs >= 1000) return `${sign}₹${(abs / 1000).toFixed(1)}K`;
  }
  const hasFraction = Math.round((abs % 1) * 100) !== 0;
  return (
    sign +
    '₹' +
    abs.toLocaleString('en-IN', {
      minimumFractionDigits: hasFraction ? 2 : 0,
      maximumFractionDigits: 2
    })
  );
}

export function exportRowsToCSV(filename: string, headers: string[], rows: (string | number)[][]): void {
  const escape = (val: string | number) => `"${String(val).replace(/"/g, '""')}"`;
  const csv = [headers.map(escape).join(','), ...rows.map(r => r.map(escape).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function buildDailyClosingWhatsAppMessage(store: AdminStoreData): string {
  const today = todayStr(0);
  const activeBills = store.bills.filter(b => b.status !== 'Cancelled');
  const todayBills = activeBills.filter(b => b.date === today);
  const todaySales = todayBills.reduce((s, b) => s + b.netAmount, 0);
  const todayProfit = todayBills.reduce((s, b) => s + (b.netAmount - b.costTotal), 0);
  const cashSum = todayBills.filter(b => b.paymentMode === 'CASH').reduce((s, b) => s + b.paidAmount, 0);
  const upiSum = todayBills.filter(b => b.paymentMode === 'UPI').reduce((s, b) => s + b.paidAmount, 0);
  const cardSum = todayBills.filter(b => b.paymentMode === 'CARD').reduce((s, b) => s + b.paidAmount, 0);
  const creditPending = activeBills.reduce((s, b) => s + b.pendingAmount, 0);
  const todayExp = store.expenses.filter(e => e.date === today).reduce((s, e) => s + e.amount, 0);
  const lowCount = store.products.filter(p => p.currentStock > 0 && p.currentStock <= p.lowStockThreshold).length;
  const outCount = store.products.filter(p => p.currentStock <= 0).length;

  return [
    `*BARAKAH BEPAAR - DAILY CLOSING REPORT*`,
    `Date: ${new Date().toLocaleDateString('en-IN')}`,
    `Active Shops: ${store.shops.filter(s => s.status === 'Active').length} / ${MAX_STANDARD_SHOPS}`,
    ``,
    `*Today Sales:* ${formatINR(todaySales)} (${todayBills.length} bills)`,
    `*Today Gross Profit:* ${formatINR(todayProfit)}`,
    `*Today Expenses:* ${formatINR(todayExp)}`,
    ``,
    `*Collections Split:*`,
    `- Cash: ${formatINR(cashSum)}`,
    `- UPI: ${formatINR(upiSum)}`,
    `- Card: ${formatINR(cardSum)}`,
    `*Total Pending Udhaar:* ${formatINR(creditPending)}`,
    ``,
    `*Stock Alerts:* ${lowCount} Low Stock | ${outCount} Out of Stock`,
    `_Sent via Barakah Bepaar Admin HQ_`
  ].join('\n');
}

export function recordPosInvoiceToAdminStore(inv: Invoice, cashierUsername = 'SHOP1'): void {
  const store = loadAdminStore();
  const activeShop = store.shops[0];
  const shopId = activeShop?.id || 'shop-1';

  const lineItems: AdminBillLineItem[] = inv.items.map(it => {
    const prod = store.products.find(p => p.id === it.product.id || p.code === it.product.code);
    const cost = prod ? prod.purchasePrice : Number((it.rate * 0.78).toFixed(2));
    return {
      productId: prod?.id || it.product.id,
      code: it.product.code,
      name: it.product.name,
      qty: it.quantity,
      rate: it.rate,
      cost,
      total: it.lineValue
    };
  });

  const costTotal = Number(lineItems.reduce((s, x) => s + x.cost * x.qty, 0).toFixed(2));
  const totalQty = lineItems.reduce((s, x) => s + x.qty, 0);
  const modeRaw = inv.payment.mode;
  const paymentMode: AdminBill['paymentMode'] =
    modeRaw === 'CARD' ? 'CARD' : modeRaw === 'CREDIT' ? 'CREDIT' : 'CASH';
  const paidAmount = paymentMode === 'CREDIT' ? 0 : Math.min(inv.netAmount, inv.payment.paidAmount || inv.netAmount);
  const pendingAmount = Math.max(0, inv.netAmount - paidAmount);

  const newBill: AdminBill = {
    id: inv.id,
    billNo: `${activeShop?.code || 'SH1'}-${inv.invoiceNo}`,
    shopId,
    shopName: activeShop?.name || 'Barakah Main Store',
    date: todayStr(0),
    time: inv.time || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    customerCode: inv.customer.code,
    customerName: inv.customer.name,
    customerPhone: inv.customer.phone1,
    cashier: cashierUsername,
    itemsCount: inv.itemsCount,
    totalQty,
    categorySummary: lineItems[0]?.name || 'POS Retail',
    grossAmount: inv.grossAmount,
    discountAmount: inv.discountAmount,
    costTotal,
    netAmount: inv.netAmount,
    paidAmount,
    pendingAmount,
    paymentMode,
    status: pendingAmount > 0 ? 'Credit Pending' : 'Completed',
    saleType: inv.rateType.toLowerCase().includes('wholesale') || inv.rateType.includes('3') ? 'Wholesale' : 'Retail',
    items: lineItems
  };

  // Deduct stock from matching shop & overall inventory
  const nextProducts = store.products.map(p => {
    const soldQty = lineItems.filter(l => l.productId === p.id).reduce((s, l) => s + l.qty, 0);
    if (soldQty <= 0) return p;
    const prevShopQty = p.shopStocks[shopId] ?? p.currentStock;
    return {
      ...p,
      currentStock: Math.max(0, Number((p.currentStock - soldQty).toFixed(2))),
      lastSoldDaysAgo: 0,
      shopStocks: {
        ...p.shopStocks,
        [shopId]: Math.max(0, Number((prevShopQty - soldQty).toFixed(2)))
      }
    };
  });

  // Update customer balance if credit bill & non-walk-in
  let nextCustomers = store.customers;
  if (pendingAmount > 0 && inv.customer.code !== 'F1') {
    const exists = store.customers.some(c => c.code === inv.customer.code);
    if (exists) {
      nextCustomers = store.customers.map(c =>
        c.code === inv.customer.code
          ? {
              ...c,
              balance: Number((c.balance + pendingAmount).toFixed(2)),
              totalOrders: (c.totalOrders || 0) + 1,
              totalSpent: (c.totalSpent || 0) + inv.netAmount
            }
          : c
      );
    } else {
      nextCustomers = [
        {
          ...inv.customer,
          balance: pendingAmount,
          customerType: newBill.saleType,
          creditLimit: 10000,
          totalOrders: 1,
          totalSpent: inv.netAmount
        },
        ...store.customers
      ];
    }
  }

  saveAdminStore({
    ...store,
    products: nextProducts,
    customers: nextCustomers,
    bills: [newBill, ...store.bills]
  });
}

/* Two-way Sync Helpers: Let Classic Shop POS read Admin-created Products, Rates, Stock & Customers */
export function getSharedProductsForPos(): Product[] {
  const store = loadAdminStore();
  const activeShopId = store.shops[0]?.id || 'shop-1';
  const seedMap = new Map(SEED_PRODUCTS.map(p => [p.id, p]));

  return store.products.map(p => {
    const seed = seedMap.get(p.id);
    const shopQty = p.shopStocks?.[activeShopId] ?? p.currentStock;
    return {
      id: p.id,
      code: p.code,
      name: p.name,
      tamilName: p.tamilName || p.name,
      mrp: p.mrp,
      rate: p.rate,
      wholesaleRate: p.wholesaleRate,
      branchRate: p.branchRate,
      unit: p.unit,
      isDecimal: seed ? seed.isDecimal : p.unit.toLowerCase() === 'kg',
      isWeighingMachine: seed ? seed.isWeighingMachine : p.unit.toLowerCase() === 'kg',
      taxSlabId: p.taxSlabId || (seed ? seed.taxSlabId : 'TAX-5'),
      barcode: p.barcode || `89010000${p.code}`,
      currentStock: shopQty
    };
  });
}

export function getSharedCustomersForPos(): Customer[] {
  const store = loadAdminStore();
  const byCode = new Map<string, Customer>();
  SEED_CUSTOMERS.forEach(c => byCode.set(c.code.toUpperCase(), c));
  store.customers.forEach(c => {
    byCode.set(c.code.toUpperCase(), {
      code: c.code,
      name: c.name,
      tamilName: c.tamilName,
      phone1: c.phone1,
      phone2: c.phone2,
      balance: c.balance,
      previousPurchase: c.previousPurchase,
      points: c.points
    });
  });
  return Array.from(byCode.values());
}
