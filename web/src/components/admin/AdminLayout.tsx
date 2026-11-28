import React, { useState } from 'react';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingCart,
  BarChart2,
  Store,
  Settings,
  LogOut,
  Search,
  Bell,
  Sun,
  Moon,
  UsersRound,
  Smartphone,
  X,
  Database
} from 'lucide-react';
import barakahIcon from '../../assets/barakah-icon.png';
import {
  AdminStoreData,
  AdminProduct,
  formatINR,
  loadAdminStore,
  saveAdminStore,
  resetAdminStore
} from '../../lib/shopStore';
import { APP_VERSION_TAG } from '../../lib/version';
import { AdminDashboard } from './AdminDashboard';
import {
  AdminShopsView,
  AdminInventoryView,
  AdminOrdersView,
  AdminPurchaseView,
  AdminReportingView,
  AdminSettingsView
} from './AdminViews';
import { AdminCustomersView } from './AdminCustomersView';
import { AdminMastersView } from './AdminMastersView';
import { StockAlertDrawer } from './StockAlertDrawer';
import {
  AdminToastItem,
  AdminConfirmRequest,
  DispatchSlipData,
  AdminToastViewport,
  AdminConfirmModal,
  DispatchSlipModal
} from './AdminNotifications';
import './AdminTheme.css';

interface AdminLayoutProps {
  currentUser: { username: string; role: string };
  onLogOff: () => void;
  onPreviewClassicPos: () => void;
}

type AdminTab = 'dashboard' | 'inventory' | 'masters' | 'orders' | 'purchase' | 'customers' | 'reporting' | 'shops' | 'settings';

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentUser,
  onLogOff,
  onPreviewClassicPos
}) => {
  const [store, setStore] = useState<AdminStoreData>(() => loadAdminStore());
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'low' | 'out' | 'udhaar'>('low');
  const [selectedBillLookup, setSelectedBillLookup] = useState<string | undefined>(undefined);
  const [reorderProductId, setReorderProductId] = useState<string | undefined>(undefined);
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);
  const [toasts, setToasts] = useState<AdminToastItem[]>([]);
  const [confirmReq, setConfirmReq] = useState<AdminConfirmRequest | null>(null);
  const [dispatchSlip, setDispatchSlip] = useState<DispatchSlipData | null>(null);

  const handleNotify = (toast: Omit<AdminToastItem, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts(prev => [{ id, ...toast }, ...prev].slice(0, 4));
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5200);
  };

  const handleConfirm = (req: AdminConfirmRequest) => {
    setConfirmReq(req);
  };

  const handleUpdateStore = (next: AdminStoreData) => {
    setStore(next);
    saveAdminStore(next);
  };

  const handleResetDemo = () => {
    const fresh = resetAdminStore();
    setStore(fresh);
  };

  const handleNavigate = (tab: string, contextBillNo?: string) => {
    setSelectedBillLookup(contextBillNo);
    setActiveTab(tab as AdminTab);
  };

  const handleOpenAlertDrawer = (mode: 'low' | 'out' | 'udhaar') => {
    setDrawerMode(mode);
    setDrawerOpen(true);
  };

  const handleReorderProduct = (product: AdminProduct) => {
    setReorderProductId(product.id);
    setActiveTab('purchase');
  };

  const lowOrOutCount = store.products.filter(p => p.currentStock <= p.lowStockThreshold).length;
  const udhaarCount = store.bills.filter(b => b.pendingAmount > 0 && b.status !== 'Cancelled').length;
  const totalAlerts = lowOrOutCount + udhaarCount;

  const navItems: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={17} /> },
    { id: 'inventory', label: 'Inventory', icon: <Package size={17} /> },
    { id: 'masters', label: 'Masters & Till', icon: <Database size={17} /> },
    { id: 'orders', label: 'Orders', icon: <Layers size={17} /> },
    { id: 'purchase', label: 'Purchase', icon: <ShoppingCart size={17} /> },
    { id: 'customers', label: 'Customers & Udhar', icon: <UsersRound size={17} /> },
    { id: 'reporting', label: 'Reporting', icon: <BarChart2 size={17} /> },
    { id: 'shops', label: 'Shops', icon: <Store size={17} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={17} /> }
  ];

  return (
    <div className={`bb-admin-root ${darkMode ? 'dark-mode' : ''}`}>
      {/* ====================================================================
          LEFT DEEP SLATE-TEAL SIDEBAR (Exact reference screenshot layout)
          ==================================================================== */}
      <aside className="bb-sidebar">
        <div>
          {/* Profile Ring & Identity */}
          <div className="bb-sidebar-profile">
            <div className="bb-avatar-ring">
              <div className="bb-avatar-inner">
                <img
                  src={barakahIcon}
                  alt="Barakah Bepaar"
                  style={{ width: '76%', height: '76%', objectFit: 'contain' }}
                />
              </div>
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: 0.2 }}>
              Deen Stores ({currentUser.username})
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.72)', marginTop: 2 }}>
              admin@barakahbepaar.in · {APP_VERSION_TAG}
            </div>
          </div>

          {/* Navigation Items with signature curved pill */}
          <nav className="bb-nav-list">
            {navItems.map(item => (
              <button
                key={item.id}
                className={`bb-nav-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => {
                  setSelectedBillLookup(undefined);
                  setActiveTab(item.id);
                }}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Bottom Logout (Shop POS View moved to Settings so Admin stays in Modern UI) */}
        <div className="bb-sidebar-footer">
          <button
            className="bb-logout-btn"
            onClick={() =>
              handleConfirm({
                title: 'Sign Out of Deen Stores?',
                message: 'Are you sure you want to exit the Admin HQ Dashboard and return to the Login screen?',
                confirmLabel: 'Sign Out',
                danger: false,
                onConfirm: onLogOff
              })
            }
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ====================================================================
          MAIN ICE-BLUE WORKSPACE
          ==================================================================== */}
      <div className="bb-main-area">
        {/* Top Bar */}
        <header className="bb-topbar">
          <div>
            {activeTab === 'dashboard' ? (
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 600 }}>
                Welcome {currentUser.username} !
              </h1>
            ) : (
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--bb-text-secondary)' }}>
                Deen Stores HQ &nbsp;/&nbsp; {navItems.find(n => n.id === activeTab)?.label}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {/* Search Pill matching Screenshot 1-4 */}
            <div className="bb-search-pill">
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search products, bills..."
              />
              <button className="bb-search-pill-btn" aria-label="Search">
                <Search size={16} />
              </button>
            </div>

            {/* Owner Mobile App Live Preview */}
            <button
              onClick={() => setMobilePreviewOpen(true)}
              className="bb-btn-outline"
              style={{ padding: '5px 11px', fontSize: 12, borderRadius: 999 }}
              title="Preview Owner Live Mobile View"
            >
              <Smartphone size={14} color="currentColor" />
              Owner Mobile
            </button>

            {/* Light / Dark Mode Switch Pill matching Screenshot 1-4 */}
            <button
              onClick={() => setDarkMode(d => !d)}
              title="Toggle Light / Dark theme"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: '#1F4E63',
                color: '#FFFFFF',
                border: '1px solid #94B3C4',
                borderRadius: 999,
                padding: '4px 9px',
                cursor: 'pointer'
              }}
            >
              <Sun size={13} color={darkMode ? '#94A3B8' : '#FDE047'} />
              <Moon size={13} color={darkMode ? '#38BDF8' : '#94A3B8'} />
            </button>

            {/* Notification Bell with Red Alert Dot -> Opens StockAlertDrawer */}
            <button
              onClick={() => handleOpenAlertDrawer('low')}
              title={`${totalAlerts} Active Stock & Udhaar Alerts`}
              style={{
                position: 'relative',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: darkMode ? '#E2E8F0' : '#1E293B',
                padding: 4
              }}
            >
              <Bell size={20} />
              {totalAlerts > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: 2,
                    right: 3,
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: '#EF4444'
                  }}
                />
              )}
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="bb-content-scroll">
          {activeTab === 'dashboard' && (
            <AdminDashboard
              store={store}
              searchQuery={searchQuery}
              onNavigate={handleNavigate}
              onOpenAlertDrawer={handleOpenAlertDrawer}
            />
          )}

          {activeTab === 'shops' && (
            <AdminShopsView
              store={store}
              onUpdateStore={handleUpdateStore}
              onNotify={handleNotify}
              onOpenDispatchSlip={setDispatchSlip}
            />
          )}

          {activeTab === 'inventory' && (
            <AdminInventoryView
              store={store}
              searchQuery={searchQuery}
              onUpdateStore={handleUpdateStore}
              onNotify={handleNotify}
            />
          )}

          {activeTab === 'masters' && (
            <AdminMastersView
              store={store}
              searchQuery={searchQuery}
              onUpdateStore={handleUpdateStore}
              onNotify={handleNotify}
              onConfirm={handleConfirm}
            />
          )}

          {activeTab === 'orders' && (
            <AdminOrdersView
              store={store}
              searchQuery={searchQuery}
              initialBillLookup={selectedBillLookup}
              onUpdateStore={handleUpdateStore}
              onNotify={handleNotify}
              onConfirm={handleConfirm}
            />
          )}

          {activeTab === 'purchase' && (
            <AdminPurchaseView
              store={store}
              initialProductId={reorderProductId}
              onUpdateStore={handleUpdateStore}
              onNotify={handleNotify}
            />
          )}

          {activeTab === 'customers' && (
            <AdminCustomersView
              store={store}
              searchQuery={searchQuery}
              initialBillLookup={selectedBillLookup}
              onUpdateStore={handleUpdateStore}
              onNotify={handleNotify}
              onConfirm={handleConfirm}
            />
          )}

          {activeTab === 'reporting' && <AdminReportingView store={store} />}

          {activeTab === 'settings' && (
            <AdminSettingsView
              store={store}
              onUpdateStore={handleUpdateStore}
              onResetDemoData={handleResetDemo}
              onPreviewClassicPos={onPreviewClassicPos}
              onNotify={handleNotify}
              onConfirm={handleConfirm}
            />
          )}
        </main>
      </div>

      {/* Skywalk-style Slide-Over Stock & Udhaar Alert Drawer */}
      <StockAlertDrawer
        isOpen={drawerOpen}
        initialMode={drawerMode}
        store={store}
        onClose={() => setDrawerOpen(false)}
        onReorderProduct={handleReorderProduct}
        onGoToOrders={(billNo) => handleNavigate('orders', billNo)}
      />

      {/* Owner Live Mobile App Preview Modal */}
      {mobilePreviewOpen && (
        <div
          className="bb-no-print"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 80
          }}
          onClick={() => setMobilePreviewOpen(false)}
        >
          <div
            style={{
              width: 340,
              maxHeight: '88vh',
              borderRadius: 28,
              border: '8px solid #0F172A',
              background: '#F1F5F9',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 50px rgba(0,0,0,0.4)'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ background: '#1F4E63', color: '#FFFFFF', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>Barakah Owner Live</div>
                <div style={{ fontSize: 11, opacity: 0.8 }}>Private Company App · {store.shops.length} Active Shop(s)</div>
              </div>
              <button onClick={() => setMobilePreviewOpen(false)} style={{ border: 'none', background: 'rgba(255,255,255,0.18)', color: '#FFF', borderRadius: 99, padding: 5, cursor: 'pointer' }}>
                <X size={15} />
              </button>
            </div>
            <div style={{ padding: 14, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {store.shops.map(shop => {
                const today = new Date().toISOString().slice(0, 10);
                const sBills = store.bills.filter(b => b.shopId === shop.id && b.status !== 'Cancelled');
                const tBills = sBills.filter(b => b.date === today);
                const tSales = tBills.reduce((s, b) => s + b.netAmount, 0);
                const cashAmt = tBills.filter(b => b.paymentMode === 'CASH').reduce((s, b) => s + b.paidAmount, 0);
                const upiAmt = tBills.filter(b => b.paymentMode === 'UPI').reduce((s, b) => s + b.paidAmount, 0);
                const udharDue = sBills.reduce((s, b) => s + b.pendingAmount, 0);
                return (
                  <div key={shop.id} style={{ background: '#FFFFFF', borderRadius: 12, padding: 12, border: '1px solid #CBD5E1' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: 13.5, color: '#1F4E63' }}>{shop.code} · {shop.name}</strong>
                      <span style={{ fontSize: 10.5, background: '#DCFCE7', color: '#166534', padding: '2px 7px', borderRadius: 99, fontWeight: 700 }}>LIVE</span>
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 800, marginTop: 6 }}>{formatINR(tSales)}</div>
                    <div style={{ fontSize: 11, color: '#64748B' }}>Today ({tBills.length} bills) · Cash {formatINR(cashAmt)} · UPI {formatINR(upiAmt)}</div>
                    <div style={{ fontSize: 11.5, marginTop: 6, color: '#B45309', fontWeight: 600 }}>Pending Udhaar: {formatINR(udharDue)}</div>
                  </div>
                );
              })}
              <div style={{ background: '#FFFFFF', borderRadius: 12, padding: 12, border: '1px solid #CBD5E1', fontSize: 12 }}>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>Alert Snapshot</div>
                <div>Low / Out Stock SKUs: <strong>{lowOrOutCount}</strong></div>
                <div>Pending Credit Bills: <strong>{udhaarCount}</strong></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Branded Toast, Confirm Dialog & Dispatch Slip Print Modal */}
      <AdminToastViewport
        toasts={toasts}
        onDismiss={id => setToasts(prev => prev.filter(t => t.id !== id))}
      />
      <AdminConfirmModal request={confirmReq} onCancel={() => setConfirmReq(null)} />
      <DispatchSlipModal slip={dispatchSlip} onClose={() => setDispatchSlip(null)} />
    </div>
  );
};
