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
  ArrowLeft
} from 'lucide-react';
import barakahIcon from '../../assets/barakah-icon.png';
import {
  AdminStoreData,
  AdminProduct,
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
import { StockAlertDrawer } from './StockAlertDrawer';
import './AdminTheme.css';

interface AdminLayoutProps {
  currentUser: { username: string; role: string };
  onLogOff: () => void;
  onPreviewClassicPos: () => void;
}

type AdminTab = 'dashboard' | 'inventory' | 'orders' | 'purchase' | 'reporting' | 'shops' | 'settings';

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
    { id: 'orders', label: 'Orders', icon: <Layers size={17} /> },
    { id: 'purchase', label: 'Purchase', icon: <ShoppingCart size={17} /> },
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
              Barakah HQ ({currentUser.username})
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

        {/* Bottom Logout */}
        <div className="bb-sidebar-footer">
          <button className="bb-logout-btn" onClick={onPreviewClassicPos} title="View unchanged Classic POS">
            <ArrowLeft size={16} />
            <span>Shop POS View</span>
          </button>
          <button className="bb-logout-btn" onClick={onLogOff}>
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
              <span style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>
                Barakah Bepaar HQ &nbsp;/&nbsp; {navItems.find(n => n.id === activeTab)?.label}
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
            <AdminShopsView store={store} onUpdateStore={handleUpdateStore} />
          )}

          {activeTab === 'inventory' && (
            <AdminInventoryView
              store={store}
              searchQuery={searchQuery}
              onUpdateStore={handleUpdateStore}
            />
          )}

          {activeTab === 'orders' && (
            <AdminOrdersView
              store={store}
              searchQuery={searchQuery}
              initialBillLookup={selectedBillLookup}
              onUpdateStore={handleUpdateStore}
            />
          )}

          {activeTab === 'purchase' && (
            <AdminPurchaseView
              store={store}
              initialProductId={reorderProductId}
              onUpdateStore={handleUpdateStore}
            />
          )}

          {activeTab === 'reporting' && <AdminReportingView store={store} />}

          {activeTab === 'settings' && (
            <AdminSettingsView
              store={store}
              onUpdateStore={handleUpdateStore}
              onResetDemoData={handleResetDemo}
              onPreviewClassicPos={onPreviewClassicPos}
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
    </div>
  );
};
