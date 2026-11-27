import { SEED_PRODUCTS, SEED_CUSTOMERS } from '../data/seedData';
import { Customer } from '../types';

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
  lastSoldDaysAgo: number;
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

export interface AdminStoreData {
  shops: ShopProfile[];
  products: AdminProduct[];
  customers: Customer[];
  bills: AdminBill[];
  vendors: AdminVendor[];
  purchases: AdminPurchaseEntry[];
  expenses: AdminExpense[];
  allocations: StockAllocationRecord[];
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

  return {
    shops: [demoShop],
    products,
    customers: SEED_CUSTOMERS,
    bills,
    vendors,
    purchases,
    expenses,
    allocations,
    ownerWhatsapp: '9840048123'
  };
}

export function loadAdminStore(): AdminStoreData {
  try {
    const raw = localStorage.getItem(ADMIN_STORE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.shops) && parsed.shops.length > 0) {
        return parsed;
      }
    }
  } catch {}
  const initial = buildInitialSeedData();
  saveAdminStore(initial);
  return initial;
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
