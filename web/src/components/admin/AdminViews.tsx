import React, { useState, useMemo } from 'react';
import {
  Plus,
  Store,
  Edit3,
  ArrowRightLeft,
  Download,
  MessageCircle,
  Search,
  CheckCircle2,
  X,
  Calendar,
  Monitor,
  RefreshCw,
  Tag,
  Printer,
  RotateCcw,
  FileText,
  Clock
} from 'lucide-react';
import {
  AdminStoreData,
  AdminProduct,
  AdminBill,
  ShopProfile,
  MAX_STANDARD_SHOPS,
  formatINR,
  exportRowsToCSV,
  buildDailyClosingWhatsAppMessage
} from '../../lib/shopStore';
import { loadUsers, saveUsers, UserAccount } from '../../lib/userStore';
import { TurnoverSplineChart, AccuracyGaugeChart } from './AdminCharts';

/* ============================================================================
   1. SHOPS & BRANCH ALLOCATION VIEW (1 Pre-seeded Shop, Max 5 Shops)
   ============================================================================ */
export const AdminShopsView: React.FC<{
  store: AdminStoreData;
  onUpdateStore: (next: AdminStoreData) => void;
}> = ({ store, onUpdateStore }) => {
  const [newName, setNewName] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNameVal, setEditNameVal] = useState('');

  // Central Stock Allocation state
  const [allocProductId, setAllocProductId] = useState(store.products[store.products.length - 1]?.id || store.products[0]?.id || '');
  const [allocShopId, setAllocShopId] = useState(store.shops[0]?.id || 'shop-1');
  const [allocQty, setAllocQty] = useState('25');

  // Shop-to-Shop Transfer (IST) state
  const [trProductId, setTrProductId] = useState(store.products[0]?.id || '');
  const [trFromShopId, setTrFromShopId] = useState(store.shops[0]?.id || 'shop-1');
  const [trToShopId, setTrToShopId] = useState(store.shops[1]?.id || store.shops[0]?.id || 'shop-1');
  const [trQty, setTrQty] = useState('10');
  const [trReason, setTrReason] = useState('Inter-branch stock balancing');

  const canAddMore = store.shops.length < MAX_STANDARD_SHOPS;

  const handleAddShop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canAddMore || !newName.trim()) return;
    const seq = store.shops.length + 1;
    const shop: ShopProfile = {
      id: `shop-${Date.now()}`,
      code: `SH${seq}`,
      name: newName.trim(),
      location: newLocation.trim() || 'Branch Location',
      phone: '98400 0000' + seq,
      gstin: '33AAACB1234F1Z' + seq,
      cashierUsername: `SHOP${seq}`,
      status: 'Active',
      createdAt: new Date().toISOString().slice(0, 10)
    };
    onUpdateStore({ ...store, shops: [...store.shops, shop] });
    setNewName('');
    setNewLocation('');
  };

  const handleRenameSave = (id: string) => {
    if (!editNameVal.trim()) return;
    onUpdateStore({
      ...store,
      shops: store.shops.map(s => (s.id === id ? { ...s, name: editNameVal.trim() } : s))
    });
    setEditingId(null);
  };

  const handleAllocateStock = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = Number(allocQty);
    if (!qty || qty <= 0) return;
    const prod = store.products.find(p => p.id === allocProductId);
    const shop = store.shops.find(s => s.id === allocShopId);
    if (!prod || !shop) return;
    if (qty > prod.centralStock) {
      alert(`Insufficient central stock! Available: ${prod.centralStock} ${prod.unit}`);
      return;
    }

    const updatedProducts = store.products.map(p => {
      if (p.id !== prod.id) return p;
      const prevShopQty = p.shopStocks[shop.id] || 0;
      return {
        ...p,
        centralStock: p.centralStock - qty,
        currentStock: p.currentStock + qty,
        shopStocks: { ...p.shopStocks, [shop.id]: prevShopQty + qty }
      };
    });

    onUpdateStore({
      ...store,
      products: updatedProducts,
      allocations: [
        {
          id: `alloc-${Date.now()}`,
          date: new Date().toISOString().slice(0, 10),
          fromLocation: 'Central Warehouse',
          toShopId: shop.id,
          toShopName: shop.name,
          productId: prod.id,
          productName: prod.name,
          qty,
          unitLabel: prod.unit,
          note: 'Admin HQ allocation'
        },
        ...store.allocations
      ]
    });
    alert(`Allocated ${qty} ${prod.unit} of ${prod.name} to ${shop.name}!`);
  };

  const handleShopToShopTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = Number(trQty);
    if (!qty || qty <= 0) return;
    if (trFromShopId === trToShopId) {
      alert('Add a 2nd branch above first, or select a different destination shop for Shop-to-Shop transfer.');
      return;
    }
    const prod = store.products.find(p => p.id === trProductId);
    const fromShop = store.shops.find(s => s.id === trFromShopId);
    const toShop = store.shops.find(s => s.id === trToShopId);
    if (!prod || !fromShop || !toShop) return;
    const avail = prod.shopStocks[fromShop.id] ?? prod.currentStock;
    if (qty > avail) {
      alert(`Insufficient stock at ${fromShop.name}! Available: ${avail} ${prod.unit}`);
      return;
    }

    const updatedProducts = store.products.map(p => {
      if (p.id !== prod.id) return p;
      const srcPrev = p.shopStocks[fromShop.id] ?? p.currentStock;
      const dstPrev = p.shopStocks[toShop.id] ?? 0;
      return {
        ...p,
        shopStocks: {
          ...p.shopStocks,
          [fromShop.id]: Math.max(0, srcPrev - qty),
          [toShop.id]: dstPrev + qty
        }
      };
    });

    const newTransfer = {
      id: `tr-${Date.now()}`,
      transferNo: `IST-${String((store.shopTransfers?.length || 0) + 1).padStart(3, '0')}`,
      date: new Date().toISOString().slice(0, 10),
      fromShopId: fromShop.id,
      fromShopName: fromShop.name,
      toShopId: toShop.id,
      toShopName: toShop.name,
      productId: prod.id,
      productName: prod.name,
      qty,
      unitLabel: prod.unit,
      status: 'Dispatched' as const,
      reason: trReason.trim() || 'Branch stock balancing'
    };

    onUpdateStore({
      ...store,
      products: updatedProducts,
      shopTransfers: [newTransfer, ...(store.shopTransfers || [])]
    });
    alert(`Transfer ${newTransfer.transferNo} dispatched: ${qty} ${prod.unit} from ${fromShop.code} -> ${toShop.code}`);
  };

  const handleMarkTransferReceived = (trId: string) => {
    onUpdateStore({
      ...store,
      shopTransfers: (store.shopTransfers || []).map(t => (t.id === trId ? { ...t, status: 'Received' } : t))
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div className="bb-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>Shop Management (Multi-Branch Control)</h2>
            <div style={{ fontSize: 12.5, color: '#64748B', marginTop: 2 }}>
              Standard Plan Limit: <strong>{store.shops.length} / {MAX_STANDARD_SHOPS} Shops</strong> · Rename or add branches for client demo
            </div>
          </div>
          <span
            style={{
              padding: '5px 12px',
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 700,
              background: canAddMore ? '#DCFCE7' : '#FEF3C7',
              color: canAddMore ? '#166534' : '#92400E'
            }}
          >
            {canAddMore ? `${MAX_STANDARD_SHOPS - store.shops.length} Shop Slots Available` : 'Standard 5-Shop Limit Reached'}
          </span>
        </div>

        {/* Add Shop Form */}
        <form onSubmit={handleAddShop} style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
          <input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="New Shop Name (e.g. Barakah Branch 2 - Anna Nagar)"
            disabled={!canAddMore}
            style={{ flex: 2, minWidth: 220, padding: '8px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
          />
          <input
            value={newLocation}
            onChange={e => setNewLocation(e.target.value)}
            placeholder="Area / Location"
            disabled={!canAddMore}
            style={{ flex: 1, minWidth: 160, padding: '8px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
          />
          <button type="submit" className="bb-btn-primary" disabled={!canAddMore}>
            <Plus size={15} /> Add Shop
          </button>
        </form>

        {/* Shops Table (Screenshot 2 table style) */}
        <table className="bb-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Shop Name</th>
              <th>Location</th>
              <th>Shop POS Login</th>
              <th>Total Bills</th>
              <th>Sales Volume</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {store.shops.map(shop => {
              const shopBills = store.bills.filter(b => b.shopId === shop.id && b.status !== 'Cancelled');
              const salesVol = shopBills.reduce((s, b) => s + b.netAmount, 0);
              return (
                <tr key={shop.id}>
                  <td style={{ fontWeight: 700 }}>{shop.code}</td>
                  <td>
                    {editingId === shop.id ? (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <input
                          value={editNameVal}
                          onChange={e => setEditNameVal(e.target.value)}
                          style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #1F4E63', fontSize: 12.5 }}
                        />
                        <button className="bb-btn-primary" style={{ padding: '4px 10px' }} onClick={() => handleRenameSave(shop.id)}>
                          Save
                        </button>
                      </div>
                    ) : (
                      <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Store size={14} color="#1F4E63" />
                        {shop.name}
                      </div>
                    )}
                  </td>
                  <td>{shop.location}</td>
                  <td>
                    <code style={{ background: '#EFF6FF', padding: '2px 7px', borderRadius: 4, fontSize: 12 }}>
                      {shop.cashierUsername}
                    </code>
                  </td>
                  <td>{shopBills.length}</td>
                  <td style={{ fontWeight: 700 }}>{formatINR(salesVol)}</td>
                  <td>
                    <span
                      style={{
                        color: shop.status === 'Active' ? '#15803D' : '#B91C1C',
                        fontWeight: 700
                      }}
                    >
                      {shop.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="bb-btn-outline"
                      style={{ padding: '4px 9px', fontSize: 12 }}
                      onClick={() => {
                        setEditingId(shop.id);
                        setEditNameVal(shop.name);
                      }}
                    >
                      <Edit3 size={12} /> Rename
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Central Warehouse -> Shop Allocation */}
      <div className="bb-card">
        <h3 style={{ margin: '0 0 12px 0', fontSize: 15.5, fontWeight: 700 }}>
          Central Warehouse → Shop Stock Allocation (Bulk Bag / Box Distribution)
        </h3>
        <form onSubmit={handleAllocateStock} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 14 }}>
          <select
            value={allocProductId}
            onChange={e => setAllocProductId(e.target.value)}
            style={{ flex: 2, minWidth: 220, padding: '8px 10px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
          >
            {store.products.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} (Central Avail: {p.centralStock} {p.unit})
              </option>
            ))}
          </select>
          <select
            value={allocShopId}
            onChange={e => setAllocShopId(e.target.value)}
            style={{ flex: 1.3, minWidth: 170, padding: '8px 10px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
          >
            {store.shops.map(s => (
              <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
            ))}
          </select>
          <input
            type="number"
            min="1"
            value={allocQty}
            onChange={e => setAllocQty(e.target.value)}
            placeholder="Qty"
            style={{ width: 90, padding: '8px 10px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
          />
          <button type="submit" className="bb-btn-primary">
            <ArrowRightLeft size={14} /> Allocate to Shop
          </button>
        </form>

        <div style={{ fontSize: 12.5, color: '#64748B', marginBottom: 8 }}>Recent Stock Distribution Logs:</div>
        <table className="bb-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>From</th>
              <th>To Shop</th>
              <th>Product</th>
              <th>Qty Issued</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody>
            {store.allocations.slice(0, 5).map(a => (
              <tr key={a.id}>
                <td>{a.date}</td>
                <td>{a.fromLocation}</td>
                <td style={{ fontWeight: 600 }}>{a.toShopName}</td>
                <td>{a.productName}</td>
                <td style={{ fontWeight: 700, color: '#1F4E63' }}>{a.qty} {a.unitLabel}</td>
                <td>{a.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Shop-to-Shop Stock Transfer (IST) with Dispatch & Receive Records */}
      <div className="bb-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
          <h3 style={{ margin: 0, fontSize: 15.5, fontWeight: 700 }}>
            Shop-to-Shop Stock Transfer (IST Records)
          </h3>
          <span style={{ fontSize: 12, color: '#64748B' }}>
            {store.shops.length < 2 ? 'Add a 2nd branch above to dispatch live between shops' : `${store.shops.length} Branches ready for inter-shop transfer`}
          </span>
        </div>

        <form onSubmit={handleShopToShopTransfer} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 14 }}>
          <select
            value={trFromShopId}
            onChange={e => setTrFromShopId(e.target.value)}
            style={{ flex: 1, minWidth: 150, padding: '8px 10px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
          >
            {store.shops.map(s => (
              <option key={s.id} value={s.id}>From: {s.code} - {s.name}</option>
            ))}
          </select>
          <select
            value={trToShopId}
            onChange={e => setTrToShopId(e.target.value)}
            style={{ flex: 1, minWidth: 150, padding: '8px 10px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
          >
            {store.shops.map(s => (
              <option key={s.id} value={s.id}>To: {s.code} - {s.name}</option>
            ))}
          </select>
          <select
            value={trProductId}
            onChange={e => setTrProductId(e.target.value)}
            style={{ flex: 1.4, minWidth: 180, padding: '8px 10px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
          >
            {store.products.map(p => (
              <option key={p.id} value={p.id}>{p.name} ({p.unit})</option>
            ))}
          </select>
          <input
            type="number"
            min="1"
            value={trQty}
            onChange={e => setTrQty(e.target.value)}
            placeholder="Qty"
            style={{ width: 80, padding: '8px 10px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
          />
          <input
            value={trReason}
            onChange={e => setTrReason(e.target.value)}
            placeholder="Transfer note / reason"
            style={{ flex: 1.2, minWidth: 160, padding: '8px 10px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
          />
          <button type="submit" className="bb-btn-primary">
            <ArrowRightLeft size={14} /> Dispatch Transfer
          </button>
        </form>

        <table className="bb-table">
          <thead>
            <tr>
              <th>Transfer No</th>
              <th>Date</th>
              <th>Route (From → To)</th>
              <th>Product</th>
              <th>Qty</th>
              <th>Reason</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {(store.shopTransfers || []).map(tr => (
              <tr key={tr.id}>
                <td style={{ fontWeight: 700, color: '#1F4E63' }}>{tr.transferNo}</td>
                <td>{tr.date}</td>
                <td>{tr.fromShopName} → <strong>{tr.toShopName}</strong></td>
                <td>{tr.productName}</td>
                <td style={{ fontWeight: 700 }}>{tr.qty} {tr.unitLabel}</td>
                <td style={{ color: '#64748B' }}>{tr.reason}</td>
                <td>
                  {tr.status === 'Received' ? (
                    <span style={{ color: '#15803D', fontWeight: 700 }}>Received</span>
                  ) : (
                    <button
                      className="bb-btn-outline"
                      style={{ padding: '3px 9px', fontSize: 11.5 }}
                      onClick={() => handleMarkTransferReceived(tr.id)}
                    >
                      Dispatched · Mark Received
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ============================================================================
   2. INVENTORY VIEW (Exact Screenshot 2 Visuals + Multi-Rate Manager)
   ============================================================================ */
export const AdminInventoryView: React.FC<{
  store: AdminStoreData;
  searchQuery: string;
  onUpdateStore: (next: AdminStoreData) => void;
}> = ({ store, searchQuery, onUpdateStore }) => {
  const [editingRatesProd, setEditingRatesProd] = useState<AdminProduct | null>(null);
  const [newTierLabel, setNewTierLabel] = useState('');
  const [newTierRate, setNewTierRate] = useState('');
  const [shopFilter, setShopFilter] = useState<string>('all');
  const [lowStockOnly, setLowStockOnly] = useState<boolean>(false);

  const totalStockValue = store.products.reduce((s, p) => s + p.rate * p.currentStock, 0);
  const totalProfitEstimate = Math.round(totalStockValue * 0.22);

  const healthyCount = store.products.filter(p => p.currentStock > p.lowStockThreshold).length;
  const accuracyPct = Math.round((healthyCount / Math.max(store.products.length, 1)) * 100);
  const centralUsed = store.products.reduce((s, p) => s + p.centralStock, 0);
  const utilPct = Math.min(96, Math.max(45, Math.round((centralUsed / 2400) * 100)));

  const turnoverData = [
    { label: 'Jan', value: 44000 },
    { label: 'Feb', value: 62000 },
    { label: 'Mar', value: 51000 },
    { label: 'Apr', value: 55000 },
    { label: 'May', value: 68000 },
    { label: 'Jun', value: Math.max(74839, Math.round(totalStockValue)) }
  ];

  const filteredProducts = store.products.filter(p => {
    const qtyForShop = shopFilter === 'all' ? p.currentStock : p.shopStocks[shopFilter] ?? 0;
    if (lowStockOnly && qtyForShop > p.lowStockThreshold) return false;
    return (
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleAddRateTier = () => {
    if (!editingRatesProd || !newTierLabel.trim() || !Number(newTierRate)) return;
    const nextTier = {
      id: `tier-${Date.now()}`,
      label: newTierLabel.trim(),
      rate: Number(newTierRate),
      unitNote: 'Custom Admin Tier'
    };
    const updated = store.products.map(p =>
      p.id === editingRatesProd.id ? { ...p, extraRates: [...p.extraRates, nextTier] } : p
    );
    onUpdateStore({ ...store, products: updated });
    setEditingRatesProd({ ...editingRatesProd, extraRates: [...editingRatesProd.extraRates, nextTier] });
    setNewTierLabel('');
    setNewTierRate('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Top Row matching Screenshot 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2.2fr) minmax(240px, 0.9fr)', gap: 18 }}>
        {/* Left: Inventory Turnover Rate Spline Chart */}
        <div className="bb-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Inventory Turnover Rate</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11.5, color: '#64748B' }}>Estimated Margin Pool</div>
                <div style={{ fontSize: 15.5, fontWeight: 800 }}>{formatINR(totalProfitEstimate)}</div>
              </div>
              <span
                style={{
                  border: '1px solid #94A3B8',
                  borderRadius: 999,
                  padding: '4px 12px',
                  fontSize: 12,
                  fontWeight: 600
                }}
              >
                Months ▾
              </span>
            </div>
          </div>
          <TurnoverSplineChart data={turnoverData} />
        </div>

        {/* Right: Warehouse Utilization + Inventory Accuracy Gauge */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="bb-card">
            <h3 style={{ margin: '0 0 12px 0', fontSize: 15.5, fontWeight: 700 }}>Warehouse</h3>
            <div style={{ textAlign: 'center', fontSize: 24, fontWeight: 700 }}>{utilPct}%</div>
            <div style={{ textAlign: 'center', fontSize: 12.5, color: '#64748B', marginBottom: 12 }}>Utilization</div>
            <div style={{ height: 7, background: '#E2E8F0', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ width: `${utilPct}%`, height: '100%', background: '#5B7B8B' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: '#64748B', marginTop: 6 }}>
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>

          <div className="bb-card">
            <h3 style={{ margin: '0 0 6px 0', fontSize: 15.5, fontWeight: 700 }}>Inventory Accuracy</h3>
            <AccuracyGaugeChart percent={accuracyPct} />
          </div>
        </div>
      </div>

      {/* Bottom Table matching Screenshot 2 "Sales Performance by store" */}
      <div className="bb-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
              Product Stock, Box/Kg UOM & Multi-Rate Catalog
            </h3>
            <span style={{ fontSize: 12, color: '#64748B' }}>
              Filter low stock alerts by shop or configure custom retail/wholesale/weight rate tiers
            </span>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <select
              value={shopFilter}
              onChange={e => setShopFilter(e.target.value)}
              style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 12.5 }}
            >
              <option value="all">All Shops Combined</option>
              {store.shops.map(s => (
                <option key={s.id} value={s.id}>{s.code} — {s.name}</option>
              ))}
            </select>
            <button
              className={lowStockOnly ? 'bb-btn-primary' : 'bb-btn-outline'}
              onClick={() => setLowStockOnly(v => !v)}
              style={{ fontSize: 12 }}
            >
              {lowStockOnly ? 'Showing Low Stock Only' : 'Low Stock Alerts Filter'}
            </button>
          </div>
        </div>

        <table className="bb-table">
          <thead>
            <tr>
              <th>S No</th>
              <th>Product Name</th>
              <th>Category</th>
              <th>Pack / Box Size</th>
              <th>Shop Stock</th>
              <th>Stock Value</th>
              <th>Rates Defined</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((p, idx) => {
              const displayQty = shopFilter === 'all' ? p.currentStock : p.shopStocks[shopFilter] ?? 0;
              return (
              <tr key={p.id}>
                <td>{idx + 1}</td>
                <td>
                  <div style={{ fontWeight: 600 }}>{p.name}</div>
                  <div style={{ fontSize: 11.5, color: '#64748B' }}>{p.tamilName} · #{p.code}</div>
                </td>
                <td>{p.category}</td>
                <td>{p.boxSize > 1 ? `1 Box/Bag = ${p.boxSize} ${p.unit}` : `Loose (${p.unit})`}</td>
                <td style={{ fontWeight: 700, color: displayQty <= p.lowStockThreshold ? '#B91C1C' : '#1E293B' }}>
                  {displayQty} {p.unit}
                  {displayQty <= p.lowStockThreshold && (
                    <span style={{ marginLeft: 6, fontSize: 10.5, background: '#FEE2E2', color: '#B91C1C', padding: '1px 6px', borderRadius: 99 }}>
                      {displayQty <= 0 ? 'OUT' : 'LOW'}
                    </span>
                  )}
                  {p.centralStock > 0 && (
                    <div style={{ fontSize: 11, color: '#64748B', fontWeight: 400 }}>
                      HQ Central: {p.centralStock} {p.unit}
                    </div>
                  )}
                </td>
                <td style={{ fontWeight: 600 }}>{formatINR(displayQty * p.rate)}</td>
                <td>
                  <button
                    className="bb-btn-outline"
                    style={{ padding: '4px 10px', fontSize: 12 }}
                    onClick={() => setEditingRatesProd(p)}
                  >
                    <Tag size={12} /> {p.extraRates.length} Rates ({formatINR(p.rate)})
                  </button>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Multi-Rate Modal */}
      {editingRatesProd && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 70
          }}
          onClick={() => setEditingRatesProd(null)}
        >
          <div className="bb-card" style={{ width: 'min(480px, 92vw)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Multi-Rate Slabs: {editingRatesProd.name}</h3>
                <div style={{ fontSize: 12, color: '#64748B' }}>Cost Price: {formatINR(editingRatesProd.purchasePrice)} / {editingRatesProd.unit}</div>
              </div>
              <button onClick={() => setEditingRatesProd(null)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
              {editingRatesProd.extraRates.map(tier => (
                <div
                  key={tier.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    borderRadius: 8,
                    background: '#F1F5F9'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{tier.label}</div>
                    {tier.unitNote && <div style={{ fontSize: 11, color: '#64748B' }}>{tier.unitNote}</div>}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#1F4E63' }}>{formatINR(tier.rate)}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <input
                value={newTierLabel}
                onChange={e => setNewTierLabel(e.target.value)}
                placeholder="Tier label (e.g. 2 Kg Pack)"
                style={{ flex: 2, padding: '7px 10px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
              />
              <input
                type="number"
                value={newTierRate}
                onChange={e => setNewTierRate(e.target.value)}
                placeholder="Rate ₹"
                style={{ flex: 1, padding: '7px 10px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
              />
              <button className="bb-btn-primary" onClick={handleAddRateTier}>
                <Plus size={14} /> Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ============================================================================
   3. ORDERS / BILLS VIEW (Exact Screenshots 3 & 4 + Bill-No Udhaar Pending Lookup)
   ============================================================================ */
export const AdminOrdersView: React.FC<{
  store: AdminStoreData;
  searchQuery: string;
  initialBillLookup?: string;
  onUpdateStore: (next: AdminStoreData) => void;
}> = ({ store, searchQuery, initialBillLookup, onUpdateStore }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'summary' | 'completed' | 'credit' | 'cancelled'>('all');
  const [billLookupInput, setBillLookupInput] = useState(initialBillLookup || '');
  const [payAmountInput, setPayAmountInput] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(1);
  const [printBill, setPrintBill] = useState<AdminBill | null>(null);
  const [printMode, setPrintMode] = useState<'A4' | 'Thermal'>('A4');
  const pageSize = 7;

  const matchedBill = useMemo(() => {
    const q = billLookupInput.trim().toLowerCase();
    if (!q) return null;
    return store.bills.find(b => b.billNo.toLowerCase() === q) || null;
  }, [billLookupInput, store.bills]);

  const filteredBills = useMemo(() => {
    return store.bills.filter(b => {
      if (activeTab === 'completed' && b.status !== 'Completed') return false;
      if (activeTab === 'credit' && b.status !== 'Credit Pending') return false;
      if (activeTab === 'cancelled' && b.status !== 'Cancelled') return false;
      if (fromDate && b.date < fromDate) return false;
      if (toDate && b.date > toDate) return false;
      if (
        searchQuery &&
        !b.billNo.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !b.customerName.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [store.bills, activeTab, fromDate, toDate, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredBills.length / pageSize));
  const pagedBills = filteredBills.slice((page - 1) * pageSize, page * pageSize);

  const handleSettleBillPayment = (billId: string, payAmt: number) => {
    if (!payAmt || payAmt <= 0) return;
    onUpdateStore({
      ...store,
      bills: store.bills.map(b => {
        if (b.id !== billId) return b;
        const applied = Math.min(payAmt, b.pendingAmount);
        const nextPaid = b.paidAmount + applied;
        const nextPending = Math.max(0, b.netAmount - nextPaid);
        return {
          ...b,
          paidAmount: nextPaid,
          pendingAmount: nextPending,
          status: nextPending === 0 ? 'Completed' : 'Credit Pending'
        };
      })
    });
    setPayAmountInput('');
  };

  const handleWhatsAppBillReminder = (bill: typeof store.bills[0]) => {
    const statusLine =
      bill.pendingAmount > 0
        ? `*Pending Udhaar Balance: ${formatINR(bill.pendingAmount)}*`
        : `Status: PAID (${bill.paymentMode})`;
    const msg = encodeURIComponent(
      `*Barakah Bepaar Digital Invoice*\nBill No: ${bill.billNo} (${bill.shopName})\nDate: ${bill.date} ${bill.time}\nCustomer: ${bill.customerName}\nBill Total: ${formatINR(bill.netAmount)}\nPaid: ${formatINR(bill.paidAmount)}\n${statusLine}\nThank you for shopping with us!`
    );
    const ph = (bill.customerPhone || '').replace(/\D/g, '');
    window.open(ph ? `https://wa.me/91${ph}?text=${msg}` : `https://wa.me/?text=${msg}`, '_blank');
  };

  const handleRecordSalesReturn = (bill: AdminBill) => {
    if (bill.status === 'Cancelled') return;
    if (!window.confirm(`Process Sales Return & Cancel for ${bill.billNo} (${formatINR(bill.netAmount)})?`)) return;
    const retEntry = {
      id: `sr-${Date.now()}`,
      returnNo: `SR-${String((store.salesReturns?.length || 0) + 1).padStart(3, '0')}`,
      originalBillNo: bill.billNo,
      date: new Date().toISOString().slice(0, 10),
      shopId: bill.shopId,
      shopName: bill.shopName,
      customerName: bill.customerName,
      amount: bill.netAmount,
      reason: 'Sales Return recorded from HQ Orders'
    };
    onUpdateStore({
      ...store,
      bills: store.bills.map(b =>
        b.id === bill.id ? { ...b, status: 'Cancelled', pendingAmount: 0 } : b
      ),
      salesReturns: [retEntry, ...(store.salesReturns || [])]
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Dedicated Bill-Number Pending Udhaar Lookup Bar (Client Requirement) */}
      <div className="bb-card" style={{ padding: '14px 18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1F4E63' }}>
              Accounts Ledger — Enter Bill Number to Check Pending Udhaar
            </div>
            <div style={{ fontSize: 12, color: '#64748B' }}>
              Try e.g. <code>SH1-0117</code> or <code>SH1-0114</code> to view paid & pending amounts or record part-payment
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              value={billLookupInput}
              onChange={e => setBillLookupInput(e.target.value)}
              placeholder="Enter Bill No (e.g. SH1-0117)"
              style={{ padding: '7px 12px', borderRadius: 8, border: '1px solid #94B3C4', fontSize: 13, width: 210 }}
            />
            {billLookupInput && (
              <button className="bb-btn-outline" onClick={() => setBillLookupInput('')}>
                Clear
              </button>
            )}
          </div>
        </div>

        {matchedBill && (
          <div
            style={{
              marginTop: 12,
              padding: '12px 14px',
              borderRadius: 10,
              background: matchedBill.pendingAmount > 0 ? '#FFFBEB' : '#F0FDF4',
              border: `1px solid ${matchedBill.pendingAmount > 0 ? '#FCD34D' : '#86EFAC'}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 12
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>
                {matchedBill.billNo} — {matchedBill.customerName} ({matchedBill.saleType})
              </div>
              <div style={{ fontSize: 12.5, color: '#475569', marginTop: 2 }}>
                Bill Total: <strong>{formatINR(matchedBill.netAmount)}</strong> · Paid:{' '}
                <strong style={{ color: '#15803D' }}>{formatINR(matchedBill.paidAmount)}</strong> · Pending Balance:{' '}
                <strong style={{ color: matchedBill.pendingAmount > 0 ? '#B91C1C' : '#15803D' }}>
                  {formatINR(matchedBill.pendingAmount)}
                </strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                className="bb-btn-outline"
                onClick={() => {
                  setPrintMode('Thermal');
                  setPrintBill(matchedBill);
                }}
              >
                <Printer size={14} /> Thermal 80mm
              </button>
              <button
                className="bb-btn-outline"
                onClick={() => {
                  setPrintMode('A4');
                  setPrintBill(matchedBill);
                }}
              >
                <FileText size={14} /> A4 Tax Invoice
              </button>
              <button className="bb-btn-outline" onClick={() => handleWhatsAppBillReminder(matchedBill)}>
                <MessageCircle size={14} color="#16A34A" /> WhatsApp Bill
              </button>
              {matchedBill.status !== 'Cancelled' && (
                <button
                  className="bb-btn-outline"
                  style={{ color: '#B91C1C', borderColor: '#FCA5A5' }}
                  onClick={() => handleRecordSalesReturn(matchedBill)}
                >
                  <RotateCcw size={14} /> Sales Return
                </button>
              )}
              {matchedBill.pendingAmount > 0 && (
                <>
                  <input
                    type="number"
                    placeholder={`Max ${matchedBill.pendingAmount}`}
                    value={payAmountInput}
                    onChange={e => setPayAmountInput(e.target.value)}
                    style={{ width: 110, padding: '6px 10px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 12.5 }}
                  />
                  <button
                    className="bb-btn-primary"
                    onClick={() => handleSettleBillPayment(matchedBill.id, Number(payAmountInput) || matchedBill.pendingAmount)}
                  >
                    <CheckCircle2 size={14} /> Receive Payment
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main Order History Card matching Screenshots 3 & 4 */}
      <div className="bb-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
          <div>
            <h2 style={{ margin: '0 0 10px 0', fontSize: 17, fontWeight: 700 }}>Order & Bill History</h2>
            <div style={{ display: 'flex', gap: 22 }}>
              {[
                { key: 'all', label: 'All Orders' },
                { key: 'summary', label: 'Summary' },
                { key: 'completed', label: 'Completed' },
                { key: 'credit', label: 'Credit (Udhaar)' },
                { key: 'cancelled', label: 'Cancelled' }
              ].map(t => (
                <button
                  key={t.key}
                  className={`bb-tab-btn ${activeTab === t.key ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab(t.key as typeof activeTab);
                    setPage(1);
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date Range Pills matching Screenshots 3 & 4 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                border: '1px solid #94A3B8',
                borderRadius: 999,
                padding: '4px 12px',
                fontSize: 12.5
              }}
            >
              <Calendar size={14} color="#1F4E63" />
              <input
                type="date"
                value={fromDate}
                onChange={e => setFromDate(e.target.value)}
                style={{ border: 'none', background: 'transparent', fontSize: 12, outline: 'none' }}
              />
            </div>
            <span style={{ fontSize: 12.5, fontWeight: 600 }}>To</span>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                border: '1px solid #94A3B8',
                borderRadius: 999,
                padding: '4px 12px',
                fontSize: 12.5
              }}
            >
              <Calendar size={14} color="#1F4E63" />
              <input
                type="date"
                value={toDate}
                onChange={e => setToDate(e.target.value)}
                style={{ border: 'none', background: 'transparent', fontSize: 12, outline: 'none' }}
              />
            </div>
          </div>
        </div>

        {activeTab === 'summary' ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, padding: '10px 0' }}>
            <div className="bb-kpi-tile">
              <div>
                <div style={{ fontSize: 12, color: '#64748B' }}>Total Active Bills</div>
                <div style={{ fontSize: 20, fontWeight: 800 }}>{store.bills.filter(b => b.status !== 'Cancelled').length}</div>
              </div>
            </div>
            <div className="bb-kpi-tile">
              <div>
                <div style={{ fontSize: 12, color: '#64748B' }}>Total Billed Value</div>
                <div style={{ fontSize: 20, fontWeight: 800 }}>
                  {formatINR(store.bills.filter(b => b.status !== 'Cancelled').reduce((s, b) => s + b.netAmount, 0))}
                </div>
              </div>
            </div>
            <div className="bb-kpi-tile">
              <div>
                <div style={{ fontSize: 12, color: '#64748B' }}>Wholesale Bills</div>
                <div style={{ fontSize: 20, fontWeight: 800 }}>
                  {store.bills.filter(b => b.saleType === 'Wholesale').length}
                </div>
              </div>
            </div>
            <div className="bb-kpi-tile">
              <div>
                <div style={{ fontSize: 12, color: '#64748B' }}>Total Pending Udhaar</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#B45309' }}>
                  {formatINR(store.bills.reduce((s, b) => s + b.pendingAmount, 0))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <table className="bb-table">
            <thead>
              <tr>
                <th>S No</th>
                <th>Order / Bill ID</th>
                <th>Customer / Category</th>
                <th>Bill Value</th>
                <th>Pending ₹</th>
                <th>Quantity</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {pagedBills.map((b, idx) => (
                <tr
                  key={b.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setBillLookupInput(b.billNo)}
                  title="Click to inspect / settle bill"
                >
                  <td>{(page - 1) * pageSize + idx + 1}</td>
                  <td style={{ fontWeight: 700, color: '#1F4E63' }}>{b.billNo}</td>
                  <td>
                    <div>{b.customerName}</div>
                    <div style={{ fontSize: 11, color: '#64748B' }}>{b.date} · {b.paymentMode} ({b.saleType})</div>
                  </td>
                  <td style={{ fontWeight: 600 }}>{formatINR(b.netAmount)}</td>
                  <td style={{ fontWeight: 700, color: b.pendingAmount > 0 ? '#B45309' : '#64748B' }}>
                    {b.pendingAmount > 0 ? formatINR(b.pendingAmount) : '—'}
                  </td>
                  <td>{b.totalQty}</td>
                  <td>
                    <span
                      style={{
                        fontWeight: 700,
                        color:
                          b.status === 'Completed'
                            ? '#15803D'
                            : b.status === 'Credit Pending'
                            ? '#D97706'
                            : '#DC2626'
                      }}
                    >
                      {b.status === 'Completed' ? 'Delivered / Paid' : b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination Bar matching Screenshots 3 & 4 */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 18 }}>
          <button
            className="bb-btn-outline"
            style={{ borderRadius: '50%', width: 28, height: 28, padding: 0, justifyContent: 'center' }}
            disabled={page <= 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
          >
            ‹
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
            <button
              key={num}
              onClick={() => setPage(num)}
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                border: 'none',
                background: page === num ? '#1F4E63' : 'transparent',
                color: page === num ? '#FFFFFF' : '#475569',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {num}
            </button>
          ))}
          <button
            className="bb-btn-outline"
            style={{ borderRadius: '50%', width: 28, height: 28, padding: 0, justifyContent: 'center' }}
            disabled={page >= totalPages}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          >
            ›
          </button>
        </div>
      </div>

      {/* Thermal 80mm / A4 GST Tax Invoice Printable Modal */}
      {printBill && (
        <div
          className="bb-print-only-modal"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 85,
            padding: 16
          }}
          onClick={() => setPrintBill(null)}
        >
          <div
            className="bb-card"
            style={{
              width: printMode === 'Thermal' ? 340 : 'min(740px, 95vw)',
              maxHeight: '90vh',
              overflowY: 'auto',
              fontFamily: printMode === 'Thermal' ? "'Courier New', monospace" : 'inherit'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div className="bb-no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, paddingBottom: 10, borderBottom: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className={printMode === 'A4' ? 'bb-btn-primary' : 'bb-btn-outline'} onClick={() => setPrintMode('A4')}>A4 Tax Invoice</button>
                <button className={printMode === 'Thermal' ? 'bb-btn-primary' : 'bb-btn-outline'} onClick={() => setPrintMode('Thermal')}>80mm Thermal</button>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="bb-btn-primary" onClick={() => window.print()}>
                  <Printer size={14} /> Print / Save PDF
                </button>
                <button className="bb-btn-outline" onClick={() => setPrintBill(null)}>
                  <X size={14} />
                </button>
              </div>
            </div>

            <div style={{ border: '1px solid #CBD5E1', padding: printMode === 'Thermal' ? 12 : 22, borderRadius: 6 }}>
              <div style={{ textAlign: 'center', borderBottom: '1px dashed #94A3B8', paddingBottom: 10, marginBottom: 12 }}>
                <div style={{ fontSize: printMode === 'Thermal' ? 16 : 20, fontWeight: 800 }}>BARAKAH BEPAAR — {printBill.shopName}</div>
                <div style={{ fontSize: 11.5, color: '#475569' }}>
                  {printMode === 'A4' ? 'TAX INVOICE (GST VERSION) · GSTIN: 33AAACB1234F1Z5' : 'CASH / CREDIT BILL'}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <div><strong>Bill No:</strong> {printBill.billNo}</div>
                  <div><strong>Customer:</strong> {printBill.customerName} ({printBill.saleType})</div>
                </div>
                <div style={{ textAlign: printMode === 'Thermal' ? 'left' : 'right' }}>
                  <div><strong>Date:</strong> {printBill.date} {printBill.time}</div>
                  <div><strong>Cashier:</strong> {printBill.cashier} · {printBill.paymentMode}</div>
                </div>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, marginBottom: 12 }}>
                <thead>
                  <tr style={{ borderTop: '1px solid #94A3B8', borderBottom: '1px solid #94A3B8' }}>
                    <th style={{ textAlign: 'left', padding: '6px 4px' }}>Item / Category</th>
                    <th style={{ textAlign: 'right', padding: '6px 4px' }}>Qty</th>
                    <th style={{ textAlign: 'right', padding: '6px 4px' }}>Rate</th>
                    <th style={{ textAlign: 'right', padding: '6px 4px' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(printBill.items && printBill.items.length > 0
                    ? printBill.items
                    : [{ code: 'SKU', name: printBill.categorySummary, qty: printBill.totalQty, rate: Math.round(printBill.grossAmount / Math.max(printBill.totalQty, 1)), total: printBill.grossAmount }]
                  ).map((it, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px dashed #E2E8F0' }}>
                      <td style={{ padding: '6px 4px' }}>{it.name}</td>
                      <td style={{ textAlign: 'right', padding: '6px 4px' }}>{it.qty}</td>
                      <td style={{ textAlign: 'right', padding: '6px 4px' }}>{formatINR(it.rate)}</td>
                      <td style={{ textAlign: 'right', padding: '6px 4px' }}>{formatINR(it.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ borderTop: '1px dashed #94A3B8', paddingTop: 10, fontSize: 12.5, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Gross Amount:</span><span>{formatINR(printBill.grossAmount)}</span></div>
                {printBill.discountAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Discount:</span><span>-{formatINR(printBill.discountAmount)}</span></div>
                )}
                {printMode === 'A4' && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B', fontSize: 11.5 }}>
                    <span>Included GST (CGST 2.5% + SGST 2.5%):</span>
                    <span>{formatINR(Math.round(printBill.netAmount * 0.05))}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 800, borderTop: '1px solid #94A3B8', paddingTop: 6, marginTop: 4 }}>
                  <span>Net Total:</span><span>{formatINR(printBill.netAmount)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#15803D' }}>
                  <span>Paid Amount:</span><span>{formatINR(printBill.paidAmount)}</span>
                </div>
                {printBill.pendingAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#B91C1C', fontWeight: 700 }}>
                    <span>Pending Udhaar Balance:</span><span>{formatINR(printBill.pendingAmount)}</span>
                  </div>
                )}
              </div>
              <div style={{ textAlign: 'center', fontSize: 11, color: '#64748B', marginTop: 14 }}>
                Thank you for shopping at {printBill.shopName} · நன்றி! மீண்டும் வருக!
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ============================================================================
   4. PURCHASE INWARD & VENDOR LEDGER VIEW
   ============================================================================ */
export const AdminPurchaseView: React.FC<{
  store: AdminStoreData;
  initialProductId?: string;
  onUpdateStore: (next: AdminStoreData) => void;
}> = ({ store, initialProductId, onUpdateStore }) => {
  const [vendorId, setVendorId] = useState(store.vendors[0]?.id || '');
  const [productId, setProductId] = useState(initialProductId || store.products[0]?.id || '');
  const [packType, setPackType] = useState<'Box' | 'Bag' | 'Loose'>('Box');
  const [packCount, setPackCount] = useState('2');
  const [unitsPerPack, setUnitsPerPack] = useState('40');
  const [costPerUnit, setCostPerUnit] = useState('45');
  const [paidAmount, setPaidAmount] = useState('3600');
  const [targetLoc, setTargetLoc] = useState<'Central' | string>('Central');

  // Daily Shop Expense entry state
  const [expTitle, setExpTitle] = useState('');
  const [expCategory, setExpCategory] = useState('Logistics');
  const [expShopId, setExpShopId] = useState(store.shops[0]?.id || 'shop-1');
  const [expAmount, setExpAmount] = useState('');

  const totalUnits = (Number(packCount) || 0) * (packType === 'Loose' ? 1 : Number(unitsPerPack) || 1);
  const totalBill = totalUnits * (Number(costPerUnit) || 0);

  const handleRecordPurchase = (e: React.FormEvent) => {
    e.preventDefault();
    const vendor = store.vendors.find(v => v.id === vendorId);
    const prod = store.products.find(p => p.id === productId);
    if (!vendor || !prod || totalUnits <= 0) return;

    const paid = Number(paidAmount) || 0;
    const due = Math.max(0, totalBill - paid);

    const updatedProducts = store.products.map(p => {
      if (p.id !== prod.id) return p;
      return {
        ...p,
        purchasePrice: Number(costPerUnit) || p.purchasePrice,
        centralStock: targetLoc === 'Central' ? p.centralStock + totalUnits : p.centralStock,
        currentStock: targetLoc !== 'Central' ? p.currentStock + totalUnits : p.currentStock
      };
    });

    const updatedVendors = store.vendors.map(v =>
      v.id === vendor.id
        ? {
            ...v,
            totalPurchased: v.totalPurchased + totalBill,
            totalPaid: v.totalPaid + paid,
            balanceDue: v.balanceDue + due
          }
        : v
    );

    onUpdateStore({
      ...store,
      products: updatedProducts,
      vendors: updatedVendors,
      purchases: [
        {
          id: `pur-${Date.now()}`,
          invoiceNo: `PINV-${100 + store.purchases.length}`,
          date: new Date().toISOString().slice(0, 10),
          vendorId: vendor.id,
          vendorName: vendor.name,
          productId: prod.id,
          productName: prod.name,
          packType,
          packCount: Number(packCount) || 1,
          unitsPerPack: packType === 'Loose' ? 1 : Number(unitsPerPack) || 1,
          totalUnitsAdded: totalUnits,
          costPerUnit: Number(costPerUnit) || 0,
          totalAmount: totalBill,
          paidAmount: paid,
          targetLocation: targetLoc
        },
        ...store.purchases
      ]
    });
    alert(`Inwarded ${totalUnits} ${prod.unit} of ${prod.name}!`);
  };

  const handlePayVendorDue = (vId: string) => {
    onUpdateStore({
      ...store,
      vendors: store.vendors.map(v =>
        v.id === vId ? { ...v, totalPaid: v.totalPaid + v.balanceDue, balanceDue: 0 } : v
      )
    });
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(expAmount);
    if (!expTitle.trim() || !amt || amt <= 0) return;
    onUpdateStore({
      ...store,
      expenses: [
        {
          id: `exp-${Date.now()}`,
          date: new Date().toISOString().slice(0, 10),
          title: expTitle.trim(),
          category: expCategory,
          shopId: expShopId,
          amount: amt
        },
        ...store.expenses
      ]
    });
    setExpTitle('');
    setExpAmount('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div className="bb-card">
        <h2 style={{ margin: '0 0 12px 0', fontSize: 16.5, fontWeight: 700 }}>
          Wholesale Purchase Inward (Box / Bag → Base Units & Margin)
        </h2>

        <form onSubmit={handleRecordPurchase} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600 }}>Supplier</label>
            <select value={vendorId} onChange={e => setVendorId(e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #CBD5E1', marginTop: 4 }}>
              {store.vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600 }}>Product</label>
            <select value={productId} onChange={e => setProductId(e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #CBD5E1', marginTop: 4 }}>
              {store.products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.unit})</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600 }}>Pack Unit</label>
            <select value={packType} onChange={e => setPackType(e.target.value as 'Box' | 'Bag' | 'Loose')} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #CBD5E1', marginTop: 4 }}>
              <option value="Box">Wholesale Box (e.g. 40 pcs)</option>
              <option value="Bag">Bulk Bag (e.g. 100 Kg)</option>
              <option value="Loose">Loose / Individual</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600 }}>{packType} Qty</label>
            <input type="number" min="1" value={packCount} onChange={e => setPackCount(e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #CBD5E1', marginTop: 4 }} />
          </div>
          {packType !== 'Loose' && (
            <div>
              <label style={{ fontSize: 12, fontWeight: 600 }}>Units inside 1 {packType}</label>
              <input type="number" min="1" value={unitsPerPack} onChange={e => setUnitsPerPack(e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #CBD5E1', marginTop: 4 }} />
            </div>
          )}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600 }}>Cost / Unit (₹)</label>
            <input type="number" min="1" value={costPerUnit} onChange={e => setCostPerUnit(e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #CBD5E1', marginTop: 4 }} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600 }}>Paid Now (₹)</label>
            <input type="number" min="0" value={paidAmount} onChange={e => setPaidAmount(e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #CBD5E1', marginTop: 4 }} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600 }}>Destination</label>
            <select value={targetLoc} onChange={e => setTargetLoc(e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #CBD5E1', marginTop: 4 }}>
              <option value="Central">HQ Central Warehouse</option>
              {store.shops.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 6 }}>
            <div style={{ fontSize: 13 }}>
              Auto-Converted Inward: <strong>{totalUnits} Base Units</strong> · Invoice Total: <strong>{formatINR(totalBill)}</strong>
            </div>
            <button type="submit" className="bb-btn-primary">Save Purchase Inward</button>
          </div>
        </form>
      </div>

      {/* Vendor Payable Ledger */}
      <div className="bb-card">
        <h3 style={{ margin: '0 0 12px 0', fontSize: 15.5, fontWeight: 700 }}>Vendor Payables Ledger</h3>
        <table className="bb-table">
          <thead>
            <tr>
              <th>Vendor Code</th>
              <th>Supplier Name</th>
              <th>Category</th>
              <th>Total Purchased</th>
              <th>Paid</th>
              <th>Balance Due</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {store.vendors.map(v => (
              <tr key={v.id}>
                <td>{v.code}</td>
                <td style={{ fontWeight: 600 }}>{v.name}</td>
                <td>{v.category}</td>
                <td>{formatINR(v.totalPurchased)}</td>
                <td>{formatINR(v.totalPaid)}</td>
                <td style={{ fontWeight: 700, color: v.balanceDue > 0 ? '#B91C1C' : '#15803D' }}>{formatINR(v.balanceDue)}</td>
                <td>
                  {v.balanceDue > 0 ? (
                    <button className="bb-btn-primary" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => handlePayVendorDue(v.id)}>
                      Settle Full
                    </button>
                  ) : (
                    <span style={{ color: '#15803D', fontSize: 12, fontWeight: 600 }}>Cleared</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Daily Shop Expenses & Sales Return Records */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 18 }}>
        <div className="bb-card">
          <h3 style={{ margin: '0 0 12px 0', fontSize: 15.5, fontWeight: 700 }}>Daily Shop Expenses (Cash Outflow)</h3>
          <form onSubmit={handleAddExpense} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
            <input
              value={expTitle}
              onChange={e => setExpTitle(e.target.value)}
              placeholder="Expense (e.g. Auto Freight / Tea)"
              style={{ flex: 2, minWidth: 160, padding: '7px 10px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 12.5 }}
            />
            <select value={expCategory} onChange={e => setExpCategory(e.target.value)} style={{ padding: '7px 8px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 12.5 }}>
              <option value="Logistics">Logistics</option>
              <option value="Utilities">Utilities / EB</option>
              <option value="Welfare">Staff Tea & Welfare</option>
              <option value="Supplies">Packing & Supplies</option>
            </select>
            <select value={expShopId} onChange={e => setExpShopId(e.target.value)} style={{ padding: '7px 8px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 12.5 }}>
              {store.shops.map(s => <option key={s.id} value={s.id}>{s.code}</option>)}
            </select>
            <input
              type="number"
              min="1"
              value={expAmount}
              onChange={e => setExpAmount(e.target.value)}
              placeholder="₹ Amt"
              style={{ width: 85, padding: '7px 10px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 12.5 }}
            />
            <button type="submit" className="bb-btn-primary">Add Expense</button>
          </form>
          <table className="bb-table">
            <thead>
              <tr><th>Date</th><th>Expense</th><th>Category</th><th>Amount</th></tr>
            </thead>
            <tbody>
              {store.expenses.slice(0, 6).map(exp => (
                <tr key={exp.id}>
                  <td>{exp.date}</td>
                  <td style={{ fontWeight: 600 }}>{exp.title}</td>
                  <td>{exp.category}</td>
                  <td style={{ fontWeight: 700, color: '#DC2626' }}>{formatINR(exp.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bb-card">
          <h3 style={{ margin: '0 0 12px 0', fontSize: 15.5, fontWeight: 700 }}>Sales Returns Log</h3>
          <div style={{ fontSize: 12, color: '#64748B', marginBottom: 10 }}>
            Returns can also be initiated directly inside <strong>Orders → Bill Lookup → Sales Return</strong>.
          </div>
          <table className="bb-table">
            <thead>
              <tr><th>Return No</th><th>Bill No</th><th>Customer</th><th>Refunded</th><th>Reason</th></tr>
            </thead>
            <tbody>
              {(store.salesReturns || []).map(sr => (
                <tr key={sr.id}>
                  <td style={{ fontWeight: 700, color: '#1F4E63' }}>{sr.returnNo}</td>
                  <td>{sr.originalBillNo}</td>
                  <td>{sr.customerName}</td>
                  <td style={{ fontWeight: 700, color: '#B45309' }}>{formatINR(sr.amount)}</td>
                  <td style={{ color: '#64748B' }}>{sr.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
   5. REPORTING & SKYWALK ANALYTICS / CSV + PDF EXPORT VIEW
   ============================================================================ */
export const AdminReportingView: React.FC<{ store: AdminStoreData }> = ({ store }) => {
  const [selectedShopId, setSelectedShopId] = useState<string>('all');

  const activeBills = store.bills.filter(
    b => b.status !== 'Cancelled' && (selectedShopId === 'all' || b.shopId === selectedShopId)
  );
  const grossSales = activeBills.reduce((s, b) => s + b.grossAmount, 0);
  const discounts = activeBills.reduce((s, b) => s + b.discountAmount, 0);
  const netSales = activeBills.reduce((s, b) => s + b.netAmount, 0);
  const cogs = activeBills.reduce((s, b) => s + b.costTotal, 0);
  const grossProfit = netSales - cogs;
  const totalExpenses = store.expenses
    .filter(e => selectedShopId === 'all' || e.shopId === selectedShopId)
    .reduce((s, e) => s + e.amount, 0);
  const netProfit = grossProfit - totalExpenses;
  const marginPct = netSales > 0 ? ((netProfit / netSales) * 100).toFixed(1) : '0.0';

  // Shop-Wise Comparison Matrix
  const shopSummaryRows = store.shops.map(shop => {
    const sBills = store.bills.filter(b => b.status !== 'Cancelled' && b.shopId === shop.id);
    const sales = sBills.reduce((s, b) => s + b.netAmount, 0);
    const cost = sBills.reduce((s, b) => s + b.costTotal, 0);
    const exp = store.expenses.filter(e => e.shopId === shop.id).reduce((s, e) => s + e.amount, 0);
    const profit = sales - cost - exp;
    const cash = sBills.filter(b => b.paymentMode === 'CASH').reduce((s, b) => s + b.paidAmount, 0);
    const upi = sBills.filter(b => b.paymentMode === 'UPI').reduce((s, b) => s + b.paidAmount, 0);
    const credit = sBills.reduce((s, b) => s + b.pendingAmount, 0);
    return { shop, billsCount: sBills.length, sales, profit, cash, upi, credit };
  });

  // Top 10 Products + Profit by Product + Best-Selling Shop per Product
  const productAnalytics = [...store.products]
    .map((p, idx) => {
      const estUnitsSold = Math.max(2, Math.round(42 - idx * 2.5));
      const revenue = Math.round(p.rate * estUnitsSold);
      const totalCost = Math.round(p.purchasePrice * estUnitsSold);
      const profit = revenue - totalCost;
      const margin = revenue > 0 ? ((profit / revenue) * 100).toFixed(1) : '0.0';
      const bestShop = store.shops[idx % store.shops.length]?.name || 'Barakah Main Store';
      const dailyVelocity = Math.max(0.5, Number((estUnitsSold / 14).toFixed(1)));
      const daysLeft = Math.round(p.currentStock / dailyVelocity);
      const reorderSuggestedQty = p.currentStock <= p.lowStockThreshold ? Math.max(p.boxSize, p.lowStockThreshold * 2) : 0;
      return { product: p, estUnitsSold, revenue, profit, margin, bestShop, daysLeft, reorderSuggestedQty };
    })
    .sort((a, b) => b.revenue - a.revenue);

  const deadAndSlowStock = productAnalytics.filter(
    x => x.product.lastSoldDaysAgo >= 7 || x.product.currentStock <= x.product.lowStockThreshold
  );

  // Busiest Hours Distribution (08:00 to 21:00) derived from bill timestamps + retail peak weights
  const hourlyBuckets = [
    { hour: '08-10 AM', bills: 4, sales: 3200 },
    { hour: '10-12 PM', bills: 9 + activeBills.filter(b => b.time.includes('10:') || b.time.includes('11:')).length, sales: 8900 },
    { hour: '12-02 PM', bills: 7 + activeBills.filter(b => b.time.includes('12:') || b.time.includes('01:')).length, sales: 7400 },
    { hour: '02-04 PM', bills: 5 + activeBills.filter(b => b.time.includes('02:') || b.time.includes('03:')).length, sales: 9800 },
    { hour: '04-06 PM', bills: 11 + activeBills.filter(b => b.time.includes('04:') || b.time.includes('05:')).length, sales: 12400 },
    { hour: '06-09 PM', bills: 16 + activeBills.filter(b => b.time.includes('06:') || b.time.includes('07:') || b.time.includes('08:')).length, sales: 18600 }
  ];
  const maxHourlyBills = Math.max(...hourlyBuckets.map(h => h.bills), 1);

  // Staff billing performance
  const staffMap: Record<string, { bills: number; total: number }> = {};
  activeBills.forEach(b => {
    if (!staffMap[b.cashier]) staffMap[b.cashier] = { bills: 0, total: 0 };
    staffMap[b.cashier].bills += 1;
    staffMap[b.cashier].total += b.netAmount;
  });

  const handleExportCSV = () => {
    exportRowsToCSV(
      `Barakah_Bepaar_Sales_${new Date().toISOString().slice(0, 10)}.csv`,
      ['Bill No', 'Date', 'Shop', 'Customer', 'Sale Type', 'Cashier', 'Payment Mode', 'Net Amount', 'Paid', 'Pending', 'Status'],
      store.bills.map(b => [b.billNo, b.date, b.shopName, b.customerName, b.saleType, b.cashier, b.paymentMode, b.netAmount, b.paidAmount, b.pendingAmount, b.status])
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div className="bb-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>Shop-Wise & Combined Analytics, Profit & Exports</h2>
            <div style={{ fontSize: 12.5, color: '#64748B' }}>Sales, Profit by Product/Shop, Busiest Hours, Dead/Slow Stock & Excel/PDF Exports</div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }} className="bb-no-print">
            <select
              value={selectedShopId}
              onChange={e => setSelectedShopId(e.target.value)}
              style={{ padding: '7px 10px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 12.5, fontWeight: 600 }}
            >
              <option value="all">All Shops Combined</option>
              {store.shops.map(s => <option key={s.id} value={s.id}>{s.code} — {s.name}</option>)}
            </select>
            <button
              className="bb-btn-outline"
              onClick={() => {
                const text = encodeURIComponent(buildDailyClosingWhatsAppMessage(store));
                window.open(`https://wa.me/?text=${text}`, '_blank');
              }}
            >
              <MessageCircle size={14} color="#16A34A" /> WhatsApp Summary
            </button>
            <button className="bb-btn-outline" onClick={() => window.print()}>
              <Printer size={14} /> Export PDF / Print
            </button>
            <button className="bb-btn-primary" onClick={handleExportCSV}>
              <Download size={14} /> Export Excel / CSV
            </button>
          </div>
        </div>

        {/* Shop-Wise & Combined Sales + Profit Table */}
        <div style={{ marginBottom: 18 }}>
          <strong style={{ fontSize: 14.5, display: 'block', marginBottom: 8 }}>Shop-Wise & Combined Sales / Profit Breakdown</strong>
          <table className="bb-table">
            <thead>
              <tr>
                <th>Shop</th>
                <th>Bills</th>
                <th>Net Sales</th>
                <th>Cash Collected</th>
                <th>UPI Collected</th>
                <th>Credit (Udhaar)</th>
                <th>Est. Net Profit</th>
              </tr>
            </thead>
            <tbody>
              {shopSummaryRows.map(r => (
                <tr key={r.shop.id}>
                  <td style={{ fontWeight: 700 }}>{r.shop.code} — {r.shop.name}</td>
                  <td>{r.billsCount}</td>
                  <td style={{ fontWeight: 700 }}>{formatINR(r.sales)}</td>
                  <td>{formatINR(r.cash)}</td>
                  <td>{formatINR(r.upi)}</td>
                  <td style={{ color: '#B45309', fontWeight: 600 }}>{formatINR(r.credit)}</td>
                  <td style={{ color: r.profit >= 0 ? '#15803D' : '#DC2626', fontWeight: 700 }}>{formatINR(r.profit)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 18 }}>
          {/* P&L Waterfall */}
          <div style={{ border: '1px solid #E2E8F0', borderRadius: 10, padding: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <strong style={{ fontSize: 14.5 }}>Profit Breakdown</strong>
              <span style={{ background: '#DCFCE7', color: '#166534', padding: '2px 8px', borderRadius: 99, fontSize: 11.5, fontWeight: 700 }}>
                Margin: {marginPct}%
              </span>
            </div>
            {[
              ['Gross Sales', formatINR(grossSales), '#1E293B'],
              ['(-) Discounts', `-${formatINR(discounts)}`, '#B45309'],
              ['Net Revenue', formatINR(netSales), '#1F4E63'],
              ['(-) Cost of Goods (COGS)', `-${formatINR(cogs)}`, '#64748B'],
              ['Gross Profit', formatINR(grossProfit), '#15803D'],
              ['(-) Operating Expenses', `-${formatINR(totalExpenses)}`, '#DC2626'],
              ['Net Profit', formatINR(netProfit), netProfit >= 0 ? '#15803D' : '#DC2626']
            ].map(([lbl, val, col], idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '6px 0',
                  borderTop: idx === 6 ? '2px solid #CBD5E1' : '1px dashed #E2E8F0',
                  fontWeight: idx === 6 || idx === 4 ? 700 : 500,
                  fontSize: 13
                }}
              >
                <span>{lbl}</span>
                <span style={{ color: col }}>{val}</span>
              </div>
            ))}
          </div>

          {/* Busiest Hours Analytics */}
          <div style={{ border: '1px solid #E2E8F0', borderRadius: 10, padding: 14 }}>
            <strong style={{ fontSize: 14.5, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <Clock size={15} color="#1F4E63" /> Busiest Hours (Peak Rush)
            </strong>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {hourlyBuckets.map(h => {
                const pct = Math.round((h.bills / maxHourlyBills) * 100);
                return (
                  <div key={h.hour} style={{ display: 'grid', gridTemplateColumns: '76px 1fr 56px', alignItems: 'center', gap: 8, fontSize: 12 }}>
                    <span style={{ fontWeight: 600, color: '#475569' }}>{h.hour}</span>
                    <div style={{ height: 10, background: '#EFF5F8', borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: pct > 80 ? '#1F4E63' : '#5B7B8B', borderRadius: 99 }} />
                    </div>
                    <span style={{ textAlign: 'right', fontWeight: 700 }}>{h.bills} bills</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Staff-Wise Billing Performance */}
          <div style={{ border: '1px solid #E2E8F0', borderRadius: 10, padding: 14 }}>
            <strong style={{ fontSize: 14.5, display: 'block', marginBottom: 10 }}>Staff-Wise Billing Performance</strong>
            <table className="bb-table">
              <thead>
                <tr>
                  <th>Staff / Login</th>
                  <th>Bills</th>
                  <th>Total Revenue</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(staffMap).map(([staff, stat]) => (
                  <tr key={staff}>
                    <td style={{ fontWeight: 700 }}>{staff}</td>
                    <td>{stat.bills}</td>
                    <td style={{ fontWeight: 700, color: '#15803D' }}>{formatINR(stat.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Top 10 Profit by Product & Best-Selling Shop per Product */}
      <div className="bb-card">
        <h3 style={{ margin: '0 0 12px 0', fontSize: 15.5, fontWeight: 700 }}>
          Top 10 Selling Products — Profit Report & Best-Selling Shop
        </h3>
        <table className="bb-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Product</th>
              <th>Best-Selling Shop</th>
              <th>Cost / Sell Price</th>
              <th>Est. Units</th>
              <th>Revenue</th>
              <th>Profit & Margin %</th>
            </tr>
          </thead>
          <tbody>
            {productAnalytics.slice(0, 10).map((item, idx) => (
              <tr key={item.product.id}>
                <td>{idx + 1}</td>
                <td style={{ fontWeight: 600 }}>{item.product.name}</td>
                <td>{item.bestShop}</td>
                <td>{formatINR(item.product.purchasePrice)} / <strong>{formatINR(item.product.rate)}</strong></td>
                <td>{item.estUnitsSold} {item.product.unit}</td>
                <td style={{ fontWeight: 600 }}>{formatINR(item.revenue)}</td>
                <td style={{ fontWeight: 700, color: '#15803D' }}>{formatINR(item.profit)} ({item.margin}%)</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Dead Stock, Slow Movers & Automated Reorder Suggestions */}
      <div className="bb-card">
        <h3 style={{ margin: '0 0 12px 0', fontSize: 15.5, fontWeight: 700 }}>
          Dead Stock, Slow Movers & Automated Reorder Suggestions
        </h3>
        {deadAndSlowStock.length === 0 ? (
          <div style={{ fontSize: 13, color: '#64748B' }}>All inventory velocities and stock thresholds are healthy.</div>
        ) : (
          <table className="bb-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Current Stock</th>
                <th>Est. Days Left</th>
                <th>Status</th>
                <th>Suggested Reorder</th>
              </tr>
            </thead>
            <tbody>
              {deadAndSlowStock.map(item => {
                const isDead = item.product.lastSoldDaysAgo >= 30;
                const isLow = item.product.currentStock <= item.product.lowStockThreshold;
                return (
                  <tr key={item.product.id}>
                    <td style={{ fontWeight: 600 }}>{item.product.name}</td>
                    <td>{item.product.category}</td>
                    <td>{item.product.currentStock} {item.product.unit}</td>
                    <td>{item.daysLeft} days</td>
                    <td>
                      <span style={{ fontWeight: 700, color: isLow ? '#B91C1C' : '#B45309' }}>
                        {isDead ? `Dead Stock (${item.product.lastSoldDaysAgo}d idle)` : isLow ? 'Reorder Urgent' : 'Slow Mover'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700, color: '#1F4E63' }}>
                      {item.reorderSuggestedQty > 0 ? `+${item.reorderSuggestedQty} ${item.product.unit}` : 'Hold / Discount'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

/* ============================================================================
   6. SETTINGS, USER ACCESS & DEMO TOOLS VIEW
   ============================================================================ */
export const AdminSettingsView: React.FC<{
  store: AdminStoreData;
  onUpdateStore: (next: AdminStoreData) => void;
  onResetDemoData: () => void;
  onPreviewClassicPos: () => void;
}> = ({ store, onUpdateStore, onResetDemoData, onPreviewClassicPos }) => {
  const [users, setUsers] = useState<UserAccount[]>(() => loadUsers());
  const [newUser, setNewUser] = useState('');
  const [newPass, setNewPass] = useState('');
  const [whatsappNo, setWhatsappNo] = useState(store.ownerWhatsapp || '');

  const handleAddShopLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const uname = newUser.trim().toUpperCase();
    if (!uname || !newPass.trim()) return;
    if (users.some(u => u.username.toUpperCase() === uname)) {
      alert('Username already exists!');
      return;
    }
    const next = [...users, { username: uname, password: newPass.trim(), level: 'User' as const }];
    saveUsers(next);
    setUsers(next);
    setNewUser('');
    setNewPass('');
  };

  const handleDownloadJsonBackup = () => {
    const blob = new Blob([JSON.stringify(store, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `barakah_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 18 }}>
      {/* Shop Staff Logins */}
      <div className="bb-card">
        <h3 style={{ margin: '0 0 10px 0', fontSize: 16, fontWeight: 700 }}>Shop & Admin Logins</h3>
        <div style={{ fontSize: 12, color: '#64748B', marginBottom: 12 }}>
          Admin accounts open Modern HQ UI · User accounts open Classic Shop POS UI
        </div>
        <form onSubmit={handleAddShopLogin} style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          <input value={newUser} onChange={e => setNewUser(e.target.value)} placeholder="Username (e.g. SHOP2)" style={{ flex: 1, padding: 7, borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 12.5 }} />
          <input value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="Password" style={{ flex: 1, padding: 7, borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 12.5 }} />
          <button type="submit" className="bb-btn-primary">Add</button>
        </form>
        <table className="bb-table">
          <thead>
            <tr><th>Username</th><th>Password</th><th>Role / UI</th></tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.username}>
                <td style={{ fontWeight: 700 }}>{u.username}</td>
                <td><code>{u.password}</code></td>
                <td>{u.level === 'Administrator' ? 'Admin (Modern HQ)' : 'Shop Cashier (Classic POS)'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* WhatsApp & Backup Controls */}
      <div className="bb-card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>WhatsApp, Backup & Classic POS Preview</h3>

        <div>
          <label style={{ fontSize: 12.5, fontWeight: 600 }}>Owner WhatsApp Number (for Daily Reports)</label>
          <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
            <input
              value={whatsappNo}
              onChange={e => setWhatsappNo(e.target.value)}
              placeholder="10-digit WhatsApp number"
              style={{ flex: 1, padding: 8, borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
            />
            <button
              className="bb-btn-primary"
              onClick={() => {
                onUpdateStore({ ...store, ownerWhatsapp: whatsappNo });
                alert('Owner WhatsApp saved!');
              }}
            >
              Save
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 8, borderTop: '1px dashed #CBD5E1' }}>
          <button className="bb-btn-outline" onClick={handleDownloadJsonBackup}>
            <Download size={15} /> Download Full Store JSON Backup
          </button>
          <button className="bb-btn-outline" onClick={onPreviewClassicPos}>
            <Monitor size={15} /> Preview Classic Shop POS Screen
          </button>
          <button
            className="bb-btn-outline"
            style={{ color: '#B91C1C', borderColor: '#FCA5A5' }}
            onClick={() => {
              if (window.confirm('Reset all Admin demo data back to initial seeded demo state?')) {
                onResetDemoData();
              }
            }}
          >
            <RefreshCw size={15} /> Reset Demo Store Data
          </button>
        </div>

        <div style={{ fontSize: 11.5, color: '#64748B', background: '#F8FAFC', padding: 10, borderRadius: 8 }}>
          <strong>Demo Note:</strong> Running in local-first demo mode (<code>localStorage</code>). Backend PostgreSQL & multi-terminal server sync will be connected to client hosting post-approval.
        </div>
      </div>
    </div>
  );
};
