export type UserLevel = 'User' | 'Administrator';

export interface UserAccount {
  username: string;
  password: string;
  level: UserLevel;
}

export interface UserPermissions {
  // Master Details (8)
  taxInformation: boolean;
  addProductCategory: boolean;
  addProduct: boolean;
  addCustomer: boolean;
  addSupplier: boolean;
  addLedger: boolean;
  barcodeGenerator: boolean;
  editProduct: boolean;
  // Transations (10)
  salesInformation: boolean;
  salesReturnInformation: boolean;
  purchaseInformation: boolean;
  purchaseReturnInformation: boolean;
  receiptInformation: boolean;
  paymentInformation: boolean;
  voucherInformation: boolean;
  stockConvertor: boolean;
  stockUpdate: boolean;
  redemption: boolean;
  // Reports (8)
  supplierReport: boolean;
  purchaseReport: boolean;
  purchaseReturnReport: boolean;
  stockDetails: boolean;
  customerReport: boolean;
  salesReport: boolean;
  salesReturnReport: boolean;
  accountsReports: boolean;
}

const USERS_STORAGE_KEY = 'barakah_users_v1';
const PERMS_STORAGE_KEY = 'barakah_user_permissions_v1';

export const DEFAULT_USERS: UserAccount[] = [
  { username: 'ADMIN', password: 'admin', level: 'Administrator' },
  { username: 'USER', password: 'user', level: 'User' }
];

export const createAllPermissions = (enabled: boolean): UserPermissions => ({
  taxInformation: enabled,
  addProductCategory: enabled,
  addProduct: enabled,
  addCustomer: enabled,
  addSupplier: enabled,
  addLedger: enabled,
  barcodeGenerator: enabled,
  editProduct: enabled,
  salesInformation: enabled,
  salesReturnInformation: enabled,
  purchaseInformation: enabled,
  purchaseReturnInformation: enabled,
  receiptInformation: enabled,
  paymentInformation: enabled,
  voucherInformation: enabled,
  stockConvertor: enabled,
  stockUpdate: enabled,
  redemption: enabled,
  supplierReport: enabled,
  purchaseReport: enabled,
  purchaseReturnReport: enabled,
  stockDetails: enabled,
  customerReport: enabled,
  salesReport: enabled,
  salesReturnReport: enabled,
  accountsReports: enabled
});

export const DEFAULT_USER_PERMISSIONS: UserPermissions = {
  ...createAllPermissions(false),
  addCustomer: true,
  salesInformation: true,
  salesReturnInformation: true
};

export function loadUsers(): UserAccount[] {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) return DEFAULT_USERS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch {}
  return DEFAULT_USERS;
}

export function saveUsers(users: UserAccount[]): void {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch {}
}

export function findStoredUser(username: string): UserAccount | undefined {
  const key = username.trim().toUpperCase();
  return loadUsers().find(u => u.username.toUpperCase() === key);
}

export function loadAllPermissions(): Record<string, UserPermissions> {
  try {
    const raw = localStorage.getItem(PERMS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return parsed;
      }
    }
  } catch {}
  return {
    ADMIN: createAllPermissions(true),
    USER: { ...DEFAULT_USER_PERMISSIONS }
  };
}

export function getPermissionsForUser(username: string, level?: UserLevel): UserPermissions {
  const all = loadAllPermissions();
  const key = username.trim().toUpperCase();
  if (all[key]) {
    return { ...createAllPermissions(false), ...all[key] };
  }
  if (level === 'Administrator' || key === 'ADMIN') {
    return createAllPermissions(true);
  }
  return { ...DEFAULT_USER_PERMISSIONS };
}

export function savePermissionsForUser(username: string, perms: UserPermissions): void {
  const all = loadAllPermissions();
  const key = username.trim().toUpperCase();
  all[key] = perms;
  try {
    localStorage.setItem(PERMS_STORAGE_KEY, JSON.stringify(all));
  } catch {}
}

