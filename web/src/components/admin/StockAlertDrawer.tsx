import React, { useState } from 'react';
import { X, AlertTriangle, PackageX, Search, ShoppingCart, CreditCard } from 'lucide-react';
import { AdminStoreData, AdminProduct, formatINR } from '../../lib/shopStore';

interface StockAlertDrawerProps {
  isOpen: boolean;
  initialMode: 'low' | 'out' | 'udhaar';
  store: AdminStoreData;
  onClose: () => void;
  onReorderProduct: (product: AdminProduct) => void;
  onGoToOrders: (billNo?: string) => void;
}

export const StockAlertDrawer: React.FC<StockAlertDrawerProps> = ({
  isOpen,
  initialMode,
  store,
  onClose,
  onReorderProduct,
  onGoToOrders
}) => {
  const [mode, setMode] = useState<'low' | 'out' | 'udhaar'>(initialMode);
  const [query, setQuery] = useState('');
  const [selectedShopId, setSelectedShopId] = useState<string>('all');

  React.useEffect(() => {
    setMode(initialMode);
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const getProductStockForView = (p: AdminProduct) =>
    selectedShopId === 'all' ? p.currentStock : p.shopStocks[selectedShopId] ?? 0;

  const lowItems = store.products.filter(p => {
    const qty = getProductStockForView(p);
    return qty > 0 && qty <= p.lowStockThreshold;
  });
  const outItems = store.products.filter(p => getProductStockForView(p) <= 0);
  const pendingBills = store.bills.filter(
    b => b.pendingAmount > 0 && b.status !== 'Cancelled' && (selectedShopId === 'all' || b.shopId === selectedShopId)
  );

  const activeProducts = (mode === 'out' ? outItems : lowItems).filter(p =>
    !query.trim() ||
    p.name.toLowerCase().includes(query.toLowerCase()) ||
    p.code.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="bb-drawer-backdrop" onClick={onClose}>
      <div className="bb-drawer-panel" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div
          style={{
            padding: '18px 20px',
            background: '#1F4E63',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Alerts & Action Center</div>
            <div style={{ fontSize: 12, opacity: 0.85 }}>
              {outItems.length} Out of Stock · {lowItems.length} Low Stock · {pendingBills.length} Pending Udhaar
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              borderRadius: 8,
              color: '#FFF',
              padding: 6,
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Mode Switch Tabs */}
        <div style={{ display: 'flex', gap: 8, padding: '12px 16px', borderBottom: '1px solid #E2E8F0' }}>
          <button
            onClick={() => setMode('low')}
            style={{
              flex: 1,
              padding: '7px 10px',
              borderRadius: 8,
              border: '1px solid',
              borderColor: mode === 'low' ? '#D97706' : '#CBD5E1',
              background: mode === 'low' ? '#FEF3C7' : 'transparent',
              color: mode === 'low' ? '#92400E' : '#475569',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Low Stock ({lowItems.length})
          </button>
          <button
            onClick={() => setMode('out')}
            style={{
              flex: 1,
              padding: '7px 10px',
              borderRadius: 8,
              border: '1px solid',
              borderColor: mode === 'out' ? '#DC2626' : '#CBD5E1',
              background: mode === 'out' ? '#FEE2E2' : 'transparent',
              color: mode === 'out' ? '#991B1B' : '#475569',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Out of Stock ({outItems.length})
          </button>
          <button
            onClick={() => setMode('udhaar')}
            style={{
              flex: 1,
              padding: '7px 10px',
              borderRadius: 8,
              border: '1px solid',
              borderColor: mode === 'udhaar' ? '#1F4E63' : '#CBD5E1',
              background: mode === 'udhaar' ? '#E0F2FE' : 'transparent',
              color: mode === 'udhaar' ? '#1F4E63' : '#475569',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Udhaar ({pendingBills.length})
          </button>
        </div>

        {/* Shop Filter + Search */}
        <div style={{ padding: '10px 16px', borderBottom: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <select
            value={selectedShopId}
            onChange={e => setSelectedShopId(e.target.value)}
            style={{ width: '100%', padding: '6px 10px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 12.5, fontWeight: 600 }}
          >
            <option value="all">All Shops Combined ({store.shops.length} Active)</option>
            {store.shops.map(s => (
              <option key={s.id} value={s.id}>{s.code} — {s.name}</option>
            ))}
          </select>
          {mode !== 'udhaar' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#F1F5F9', padding: '7px 12px', borderRadius: 8 }}>
              <Search size={15} color="#64748B" />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Filter SKU name or code..."
                style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 13, width: '100%' }}
              />
            </div>
          )}
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {mode !== 'udhaar' ? (
            activeProducts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 36, color: '#64748B', fontSize: 13 }}>
                All stock levels in this category look healthy.
              </div>
            ) : (
              activeProducts.map(p => {
                const viewQty = getProductStockForView(p);
                const ratio = Math.min(1, viewQty / Math.max(p.lowStockThreshold, 1));
                const isOut = viewQty <= 0;
                return (
                  <div
                    key={p.id}
                    style={{
                      border: '1px solid #E2E8F0',
                      borderRadius: 10,
                      padding: 12,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13.5 }}>{p.name}</div>
                        <div style={{ fontSize: 11.5, color: '#64748B' }}>
                          Code #{p.code} · {p.category} · Central: {p.centralStock} {p.unit}
                        </div>
                      </div>
                      <span
                        style={{
                          padding: '3px 8px',
                          borderRadius: 999,
                          fontSize: 11,
                          fontWeight: 700,
                          background: isOut ? '#FEE2E2' : '#FEF3C7',
                          color: isOut ? '#B91C1C' : '#B45309',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4
                        }}
                      >
                        {isOut ? <PackageX size={12} /> : <AlertTriangle size={12} />}
                        {viewQty} {p.unit}
                      </span>
                    </div>

                    <div style={{ height: 6, background: '#E2E8F0', borderRadius: 99, overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${Math.round(ratio * 100)}%`,
                          height: '100%',
                          background: isOut ? '#EF4444' : '#F59E0B'
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11.5 }}>
                      <span style={{ color: '#64748B' }}>
                        Min threshold: {p.lowStockThreshold} {p.unit}
                      </span>
                      <button
                        className="bb-btn-primary"
                        style={{ padding: '5px 10px', fontSize: 11.5 }}
                        onClick={() => {
                          onClose();
                          onReorderProduct(p);
                        }}
                      >
                        <ShoppingCart size={13} />
                        Reorder from Vendor
                      </button>
                    </div>
                  </div>
                );
              })
            )
          ) : pendingBills.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 36, color: '#64748B', fontSize: 13 }}>
              No pending Udhaar bills.
            </div>
          ) : (
            pendingBills.map(bill => (
              <div
                key={bill.id}
                style={{
                  border: '1px solid #FDE68A',
                  background: '#FFFBEB',
                  borderRadius: 10,
                  padding: 12,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 10
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13.5, color: '#1E293B' }}>
                    {bill.billNo} · {bill.customerName}
                  </div>
                  <div style={{ fontSize: 11.5, color: '#64748B' }}>
                    Date: {bill.date} · Total: {formatINR(bill.netAmount)} · Paid: {formatINR(bill.paidAmount)}
                  </div>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: '#B45309', marginTop: 2 }}>
                    Pending: {formatINR(bill.pendingAmount)}
                  </div>
                </div>
                <button
                  className="bb-btn-primary"
                  style={{ padding: '6px 10px', fontSize: 11.5 }}
                  onClick={() => {
                    onClose();
                    onGoToOrders(bill.billNo);
                  }}
                >
                  <CreditCard size={13} />
                  Collect
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
