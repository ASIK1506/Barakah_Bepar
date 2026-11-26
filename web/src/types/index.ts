export interface Product {
  id: string;
  code: string;
  name: string;
  tamilName: string;
  mrp: number;
  rate: number; // Retail Rate (RRate)
  wholesaleRate?: number;
  branchRate?: number;
  unit: string;
  isDecimal: boolean;
  isWeighingMachine: boolean;
  taxSlabId: string;
  barcode: string;
  currentStock: number;
}

export interface CartItem {
  serialNo: number;
  product: Product;
  quantity: number;
  rate: number;
  lineValue: number;
  mrp: number;
  taxPercent: number;
  taxAmount: number;
  cessAmount: number;
  additionalCess: number;
}

export interface Customer {
  code: string;
  name: string;
  tamilName?: string;
  phone1: string;
  phone2?: string;
  balance: number;
  previousPurchase?: string;
  points: number;
}

export interface PaymentDetails {
  mode: 'CASH' | 'CARD' | 'SODEXHO' | 'CHQ/DD' | 'CREDIT';
  amount: number;
  paidAmount: number;
  changeAmount: number;
  cardNumber?: string;
  bankName?: string;
  cardSurchargePercent?: number;
  sodexhoCoupons?: { [denomination: number]: number };
}

export interface Invoice {
  id: string;
  invoiceNo: string;
  date: string;
  time: string;
  customer: Customer;
  rateType: string;
  items: CartItem[];
  itemsCount: number;
  grossAmount: number;
  pointsRedeemed: number;
  taxAmount: number;
  cessAmount: number;
  additionalCess: number;
  discountAmount: number;
  deliveryCharge: number;
  roundOff: number;
  netAmount: number;
  payment: PaymentDetails;
  isEstimate: boolean;
  estimateCode?: string;
  createdAt: string;
}

export interface Estimation {
  estimateCode: string;
  date: string;
  time: string;
  customer: Customer;
  items: CartItem[];
  grossAmount: number;
  taxAmount: number;
  netAmount: number;
  notes?: string;
  status: 'ACTIVE' | 'CONVERTED' | 'DISCARDED';
}

export interface BarakahBridgeDiagnostic {
  app: string;
  version: string;
  platform: string;
  electronVersion: string;
  nodeVersion: string;
  bridgePort: number | null;
  dataDir: string;
  dataDirWritable: boolean;
  snapshotCount: number;
  uptimeSeconds: number;
}

declare global {
  interface Window {
    isElectron?: boolean;
    electronAPI?: {
      platform: string;
      isElectron: boolean;
      minimizeWindow: () => void;
      toggleMaximizeWindow: () => void;
      closeWindow: () => void;
    };
    electronApp?: {
      platform: string;
      version: string;
      send: (channel: string, data?: unknown) => void;
      on: (channel: string, callback: (...args: unknown[]) => void) => () => void;
    };
    barakahFs?: {
      getBridgePort: () => Promise<number | null>;
      getDataDir: () => Promise<string>;
      openDataFolder: () => Promise<{ ok: boolean; path: string }>;
      appendTransaction: (record: unknown) => Promise<{ ok: boolean; file: string }>;
      saveSnapshot: (name: string, payload: unknown) => Promise<{ ok: boolean; file: string }>;
      listSnapshots: () => Promise<string[]>;
      readSnapshot: (name: string) => Promise<unknown>;
      getDiagnostic: () => Promise<BarakahBridgeDiagnostic>;
    };
  }
}
