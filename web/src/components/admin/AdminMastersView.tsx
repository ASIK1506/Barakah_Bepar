import React, { useState } from 'react';
import {
  PackagePlus,
  Tags,
  Truck,
  Percent,
  Wallet,
  Plus,
  Edit3,
  Printer,
  Trash2,
  X,
  Barcode
} from 'lucide-react';
import {
  AdminStoreData,
  AdminProduct,
  AdminCategory,
  AdminVendor,
  AdminTaxSlab,
  formatINR
} from '../../lib/shopStore';
import { AdminNotifyFn, AdminConfirmFn } from './AdminNotifications';

interface AdminMastersViewProps {
  store: AdminStoreData;
  searchQuery: string;
  onUpdateStore: (next: AdminStoreData) => void;
  onNotify: AdminNotifyFn;
  onConfirm?: AdminConfirmFn;
}

export const AdminMastersView: React.FC<AdminMastersViewProps> = ({
  store,
  searchQuery,
  onUpdateStore,
  onNotify,
  onConfirm
}) => {
  const [subTab, setSubTab] = useState<'products' | 'categories' | 'suppliers' | 'taxes' | 'cash_till'>('products');

  // Product CRUD modal state
  const [prodModalOpen, setProdModalOpen] = useState(false);
  const [editingProdId, setEditingProdId] = useState<string | null>(null);
  const [pCode, setPCode] = useState('');
  const [pName, setPName] = useState('');
  const [pTamilName, setPTamilName] = useState('');
  const [pCategory, setPCategory] = useState(store.categories?.[0]?.name || 'Spices & Masala');
  const [pUnit, setPUnit] = useState('Kg');
  const [pBoxSize, setPBoxSize] = useState('50');
  const [pPurchasePrice, setPPurchasePrice] = useState('100');
  const [pMrp, setPMrp] = useState('150');
  const [pRate, setPRate] = useState('135');
  const [pWholesaleRate, setPWholesaleRate] = useState('125');
  const [pBranchRate, setPBranchRate] = useState('120');
  const [pCentralStock, setPCentralStock] = useState('100');
  const [pShopStock, setPShopStock] = useState('40');
  const [pLowThresh, setPLowThresh] = useState('15');
  const [pBarcode, setPBarcode] = useState('');

  // Barcode sticker modal
  const [barcodeProd, setBarcodeProd] = useState<AdminProduct | null>(null);
  const [labelQty, setLabelQty] = useState('6');

  // Category CRUD state
  const [catName, setCatName] = useState('');
  const [catTamil, setCatTamil] = useState('');
  const [catDesc, setCatDesc] = useState('');

  // Supplier CRUD state
  const [supName, setSupName] = useState('');
  const [supPhone, setSupPhone] = useState('');
  const [supCategory, setSupCategory] = useState(store.categories?.[0]?.name || 'Groceries');

  // Tax Slab CRUD state
  const [taxName, setTaxName] = useState('');
  const [taxCgst, setTaxCgst] = useState('2.5');
  const [taxSgst, setTaxSgst] = useState('2.5');
  const [taxCess, setTaxCess] = useState('0');

  // Cash Till & Day-End Denomination state
  const [denomCounts, setDenomCounts] = useState<Record<number, number>>({
    500: 18,
    200: 12,
    100: 25,
    50: 14,
    20: 15,
    10: 20,
    5: 10,
    2: 5,
    1: 10
  });
  const [paidInAmt, setPaidInAmt] = useState('500');
  const [paidOutAmt, setPaidOutAmt] = useState('250');
  const [tillNote, setTillNote] = useState('Counter Day-End Cash Tally');

  const categories = store.categories || [];
  const taxSlabs = store.taxSlabs || [];
  const denomLogs = store.denominationLogs || [];

  const filteredProducts = store.products.filter(
    p =>
      !searchQuery.trim() ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openNewProductModal = () => {
    const nextNum = 502 + store.products.length;
    setEditingProdId(null);
    setPCode(String(nextNum));
    setPName('');
    setPTamilName('');
    setPCategory(categories[0]?.name || 'Groceries');
    setPUnit('Kg');
    setPBoxSize('25');
    setPPurchasePrice('80');
    setPMrp('120');
    setPRate('110');
    setPWholesaleRate('102');
    setPBranchRate('96');
    setPCentralStock('100');
    setPShopStock('25');
    setPLowThresh('12');
    setPBarcode(`890100000${nextNum}`);
    setProdModalOpen(true);
  };

  const openEditProductModal = (p: AdminProduct) => {
    setEditingProdId(p.id);
    setPCode(p.code);
    setPName(p.name);
    setPTamilName(p.tamilName);
    setPCategory(p.category);
    setPUnit(p.unit);
    setPBoxSize(String(p.boxSize));
    setPPurchasePrice(String(p.purchasePrice));
    setPMrp(String(p.mrp));
    setPRate(String(p.rate));
    setPWholesaleRate(String(p.wholesaleRate));
    setPBranchRate(String(p.branchRate));
    setPCentralStock(String(p.centralStock));
    setPShopStock(String(p.currentStock));
    setPLowThresh(String(p.lowStockThreshold));
    setPBarcode(p.barcode);
    setProdModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pName.trim() || !pCode.trim()) {
      onNotify({ type: 'error', title: 'Missing Product Details', message: 'Product Code and Name are required.' });
      return;
    }

    const rateVal = Number(pRate) || 0;
    const wsVal = Number(pWholesaleRate) || Number((rateVal * 0.94).toFixed(2));
    const brVal = Number(pBranchRate) || Number((rateVal * 0.9).toFixed(2));
    const shopId = store.shops[0]?.id || 'shop-1';
    const shopStockVal = Number(pShopStock) || 0;

    if (editingProdId) {
      const nextProducts = store.products.map(p =>
        p.id === editingProdId
          ? {
              ...p,
              code: pCode.trim(),
              name: pName.trim().toUpperCase(),
              tamilName: pTamilName.trim() || pName.trim(),
              category: pCategory,
              unit: pUnit,
              boxSize: Number(pBoxSize) || 1,
              purchasePrice: Number(pPurchasePrice) || 0,
              mrp: Number(pMrp) || rateVal,
              rate: rateVal,
              wholesaleRate: wsVal,
              branchRate: brVal,
              centralStock: Number(pCentralStock) || 0,
              currentStock: shopStockVal,
              lowStockThreshold: Number(pLowThresh) || 10,
              barcode: pBarcode.trim() || p.barcode,
              shopStocks: { ...p.shopStocks, [shopId]: shopStockVal },
              extraRates: [
                { id: 'r1', label: 'Retail Rate', rate: rateVal, unitNote: `Per ${pUnit}` },
                { id: 'r2', label: 'Wholesale Rate', rate: wsVal, unitNote: 'Wholesale Buyer' },
                { id: 'r3', label: 'Branch / Bulk', rate: brVal, unitNote: 'Bulk Pack' },
                ...p.extraRates.filter(r => !['r1', 'r2', 'r3'].includes(r.id))
              ]
            }
          : p
      );
      onUpdateStore({ ...store, products: nextProducts });
      onNotify({
        type: 'success',
        title: 'Product Master Updated',
        message: `${pName.trim().toUpperCase()} (#${pCode.trim()}) synced to HQ & Shop POS.`
      });
    } else {
      const newProd: AdminProduct = {
        id: `prod-${Date.now()}`,
        code: pCode.trim(),
        name: pName.trim().toUpperCase(),
        tamilName: pTamilName.trim() || pName.trim(),
        category: pCategory,
        unit: pUnit,
        boxSize: Number(pBoxSize) || 1,
        purchasePrice: Number(pPurchasePrice) || 0,
        mrp: Number(pMrp) || rateVal,
        rate: rateVal,
        wholesaleRate: wsVal,
        branchRate: brVal,
        extraRates: [
          { id: 'r1', label: 'Retail Rate', rate: rateVal, unitNote: `Per ${pUnit}` },
          { id: 'r2', label: 'Wholesale Rate', rate: wsVal, unitNote: 'Wholesale Buyer' },
          { id: 'r3', label: 'Branch / Bulk', rate: brVal, unitNote: 'Bulk Pack' }
        ],
        currentStock: shopStockVal,
        lowStockThreshold: Number(pLowThresh) || 10,
        centralStock: Number(pCentralStock) || 0,
        shopStocks: { [shopId]: shopStockVal },
        barcode: pBarcode.trim() || `89010000${pCode.trim()}`,
        lastSoldDaysAgo: 0
      };
      onUpdateStore({ ...store, products: [newProd, ...store.products] });
      onNotify({
        type: 'success',
        title: 'New Product Created',
        message: `${newProd.name} added to Master Catalog and synced with Shop POS.`
      });
    }
    setProdModalOpen(false);
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;
    const created: AdminCategory = {
      id: `cat-${Date.now()}`,
      code: `CAT-${String(categories.length + 1).padStart(2, '0')}`,
      name: catName.trim(),
      tamilName: catTamil.trim() || catName.trim(),
      description: catDesc.trim() || 'Custom product category'
    };
    onUpdateStore({ ...store, categories: [created, ...categories] });
    setCatName('');
    setCatTamil('');
    setCatDesc('');
    onNotify({ type: 'success', title: 'Category Added', message: `${created.name} is now available for products.` });
  };

  const handleAddSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supName.trim() || !supPhone.trim()) {
      onNotify({ type: 'error', title: 'Missing Supplier Info', message: 'Enter both Supplier Name and Phone Number.' });
      return;
    }
    const created: AdminVendor = {
      id: `v-${Date.now()}`,
      code: `SUP-${String(store.vendors.length + 1).padStart(2, '0')}`,
      name: supName.trim(),
      phone: supPhone.trim(),
      category: supCategory,
      totalPurchased: 0,
      totalPaid: 0,
      balanceDue: 0
    };
    onUpdateStore({ ...store, vendors: [created, ...store.vendors] });
    setSupName('');
    setSupPhone('');
    onNotify({ type: 'success', title: 'Supplier Added', message: `${created.name} (${created.code}) added to Vendor Ledger.` });
  };

  const handleAddTaxSlab = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taxName.trim()) return;
    const created: AdminTaxSlab = {
      id: `TAX-${Date.now()}`,
      name: taxName.trim(),
      cgst: Number(taxCgst) || 0,
      sgst: Number(taxSgst) || 0,
      cess: Number(taxCess) || 0
    };
    onUpdateStore({ ...store, taxSlabs: [...taxSlabs, created] });
    setTaxName('');
    onNotify({ type: 'success', title: 'GST Tax Slab Saved', message: `${created.name} added.` });
  };

  const notesTotal = Object.entries(denomCounts).reduce((sum, [val, cnt]) => sum + Number(val) * (cnt || 0), 0);
  const netCashClosing = notesTotal + (Number(paidInAmt) || 0) - (Number(paidOutAmt) || 0);

  const handleSaveDenomination = () => {
    const log = {
      id: `denom-${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      cashier: 'ADMIN',
      notesTotal,
      paidIn: Number(paidInAmt) || 0,
      paidOut: Number(paidOutAmt) || 0,
      closingNet: netCashClosing,
      note: tillNote.trim() || 'Day-End Cash Register Tally'
    };
    onUpdateStore({ ...store, denominationLogs: [log, ...denomLogs] });
    onNotify({
      type: 'success',
      title: 'Day-End Cash Tally Recorded',
      message: `Net Closing Cash: ${formatINR(netCashClosing)} (Drawer: ${formatINR(notesTotal)})`
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Sub-Navigation Card */}
      <div className="bb-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>Masters & Cash Register Administration</h2>
            <div style={{ fontSize: 12.5, color: '#64748B' }}>
              All changes made here sync directly to Shop POS terminals (`SHOP1`)
            </div>
          </div>
          {subTab === 'products' && (
            <button className="bb-btn-primary" onClick={openNewProductModal}>
              <Plus size={15} /> Add New Product
            </button>
          )}
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {[
            { id: 'products', label: `Products & Barcodes (${store.products.length})`, icon: <PackagePlus size={14} /> },
            { id: 'categories', label: `Categories (${categories.length})`, icon: <Tags size={14} /> },
            { id: 'suppliers', label: `Suppliers (${store.vendors.length})`, icon: <Truck size={14} /> },
            { id: 'taxes', label: `GST Tax Slabs (${taxSlabs.length})`, icon: <Percent size={14} /> },
            { id: 'cash_till', label: 'Cash Till & Denomination', icon: <Wallet size={14} /> }
          ].map(t => (
            <button
              key={t.id}
              className={subTab === t.id ? 'bb-btn-primary' : 'bb-btn-outline'}
              onClick={() => setSubTab(t.id as typeof subTab)}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: PRODUCTS MASTER & BARCODE STICKERS */}
      {subTab === 'products' && (
        <div className="bb-card">
          <table className="bb-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Product (English / Tamil)</th>
                <th>Category</th>
                <th>Purchase Cost</th>
                <th>MRP / Retail</th>
                <th>Wholesale / Branch</th>
                <th>Shop Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(p => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 700, color: 'var(--bb-accent-link)' }}>#{p.code}</td>
                  <td>
                    <div style={{ fontWeight: 700 }}>{p.name}</div>
                    <div style={{ fontSize: 11.5, color: '#64748B' }}>{p.tamilName} · {p.barcode}</div>
                  </td>
                  <td>{p.category}</td>
                  <td>{formatINR(p.purchasePrice)}</td>
                  <td>
                    <span style={{ color: '#64748B', fontSize: 11.5 }}>MRP {formatINR(p.mrp)} · </span>
                    <strong>{formatINR(p.rate)}</strong>
                  </td>
                  <td style={{ fontSize: 12 }}>
                    WS: {formatINR(p.wholesaleRate)} · BR: {formatINR(p.branchRate)}
                  </td>
                  <td style={{ fontWeight: 700 }}>
                    {p.currentStock} {p.unit}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        className="bb-btn-outline"
                        style={{ padding: '4px 9px', fontSize: 11.5 }}
                        onClick={() => openEditProductModal(p)}
                      >
                        <Edit3 size={12} /> Edit
                      </button>
                      <button
                        className="bb-btn-outline"
                        style={{ padding: '4px 9px', fontSize: 11.5 }}
                        onClick={() => setBarcodeProd(p)}
                      >
                        <Barcode size={12} /> Label
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 2: PRODUCT CATEGORIES */}
      {subTab === 'categories' && (
        <div className="bb-card">
          <h3 style={{ margin: '0 0 12px 0', fontSize: 15.5, fontWeight: 700 }}>Product Category Master</h3>
          <form onSubmit={handleAddCategory} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
            <input
              value={catName}
              onChange={e => setCatName(e.target.value)}
              placeholder="Category Name (e.g. Oils & Ghee)"
              style={{ flex: 1.5, minWidth: 180, padding: '8px 10px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
            />
            <input
              value={catTamil}
              onChange={e => setCatTamil(e.target.value)}
              placeholder="Tamil Name (எண்ணெய் & நெய்)"
              style={{ flex: 1.5, minWidth: 180, padding: '8px 10px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
            />
            <input
              value={catDesc}
              onChange={e => setCatDesc(e.target.value)}
              placeholder="Description"
              style={{ flex: 2, minWidth: 200, padding: '8px 10px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
            />
            <button type="submit" className="bb-btn-primary">
              <Plus size={14} /> Add Category
            </button>
          </form>

          <table className="bb-table">
            <thead>
              <tr><th>Code</th><th>Category Name</th><th>Tamil Name</th><th>Description</th><th>Action</th></tr>
            </thead>
            <tbody>
              {categories.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 700 }}>{c.code}</td>
                  <td style={{ fontWeight: 600 }}>{c.name}</td>
                  <td>{c.tamilName}</td>
                  <td style={{ color: '#64748B' }}>{c.description}</td>
                  <td>
                    <button
                      className="bb-btn-outline"
                      style={{ padding: '4px 8px', color: '#B91C1C', borderColor: '#FCA5A5' }}
                      onClick={() => {
                        const removeCat = () => {
                          onUpdateStore({ ...store, categories: categories.filter(x => x.id !== c.id) });
                          onNotify({ type: 'info', title: 'Category Removed', message: `${c.name} (${c.code}) was removed.` });
                        };
                        if (onConfirm) {
                          onConfirm({
                            title: `Remove Category "${c.name}"?`,
                            message: 'Products currently assigned to this category will keep their text label, but the category will no longer appear in dropdowns.',
                            confirmLabel: 'Remove Category',
                            danger: true,
                            onConfirm: removeCat
                          });
                        } else {
                          removeCat();
                        }
                      }}
                    >
                      <Trash2 size={12} /> Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: SUPPLIERS / VENDORS */}
      {subTab === 'suppliers' && (
        <div className="bb-card">
          <h3 style={{ margin: '0 0 12px 0', fontSize: 15.5, fontWeight: 700 }}>Supplier / Vendor Master</h3>
          <form onSubmit={handleAddSupplier} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
            <input
              value={supName}
              onChange={e => setSupName(e.target.value)}
              placeholder="Supplier Business Name"
              style={{ flex: 2, minWidth: 200, padding: '8px 10px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
            />
            <input
              value={supPhone}
              onChange={e => setSupPhone(e.target.value)}
              placeholder="Phone Number"
              style={{ flex: 1, minWidth: 140, padding: '8px 10px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
            />
            <select
              value={supCategory}
              onChange={e => setSupCategory(e.target.value)}
              style={{ flex: 1, minWidth: 160, padding: '8px 10px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
            >
              {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
            <button type="submit" className="bb-btn-primary">
              <Plus size={14} /> Add Supplier
            </button>
          </form>

          <table className="bb-table">
            <thead>
              <tr><th>Code</th><th>Supplier Name</th><th>Phone</th><th>Supply Category</th><th>Purchased</th><th>Balance Due</th></tr>
            </thead>
            <tbody>
              {store.vendors.map(v => (
                <tr key={v.id}>
                  <td style={{ fontWeight: 700 }}>{v.code}</td>
                  <td style={{ fontWeight: 600 }}>{v.name}</td>
                  <td>{v.phone}</td>
                  <td>{v.category}</td>
                  <td>{formatINR(v.totalPurchased)}</td>
                  <td style={{ fontWeight: 700, color: v.balanceDue > 0 ? '#B91C1C' : '#15803D' }}>{formatINR(v.balanceDue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 4: GST TAX SLABS */}
      {subTab === 'taxes' && (
        <div className="bb-card">
          <h3 style={{ margin: '0 0 12px 0', fontSize: 15.5, fontWeight: 700 }}>GST Tax Slabs & Cess Configuration</h3>
          <form onSubmit={handleAddTaxSlab} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
            <input
              value={taxName}
              onChange={e => setTaxName(e.target.value)}
              placeholder="Slab Name (e.g. GST 5% Food)"
              style={{ flex: 2, minWidth: 180, padding: '8px 10px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13 }}
            />
            <input type="number" step="0.5" value={taxCgst} onChange={e => setTaxCgst(e.target.value)} placeholder="CGST %" style={{ width: 90, padding: 8, borderRadius: 8, border: '1px solid #CBD5E1' }} />
            <input type="number" step="0.5" value={taxSgst} onChange={e => setTaxSgst(e.target.value)} placeholder="SGST %" style={{ width: 90, padding: 8, borderRadius: 8, border: '1px solid #CBD5E1' }} />
            <input type="number" step="0.5" value={taxCess} onChange={e => setTaxCess(e.target.value)} placeholder="Cess %" style={{ width: 90, padding: 8, borderRadius: 8, border: '1px solid #CBD5E1' }} />
            <button type="submit" className="bb-btn-primary">
              <Plus size={14} /> Add Tax Slab
            </button>
          </form>

          <table className="bb-table">
            <thead>
              <tr><th>Tax Slab</th><th>CGST %</th><th>SGST %</th><th>Total GST %</th><th>Cess %</th></tr>
            </thead>
            <tbody>
              {taxSlabs.map(t => (
                <tr key={t.id}>
                  <td style={{ fontWeight: 700 }}>{t.name}</td>
                  <td>{t.cgst}%</td>
                  <td>{t.sgst}%</td>
                  <td style={{ fontWeight: 700, color: 'var(--bb-accent-link)' }}>{t.cgst + t.sgst}%</td>
                  <td>{t.cess}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 5: CASH TILL, PAID IN / PAID OUT & DAY-END DENOMINATION */}
      {subTab === 'cash_till' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: 18 }}>
          <div className="bb-card">
            <h3 style={{ margin: '0 0 12px 0', fontSize: 15.5, fontWeight: 700 }}>Cash Drawer Denomination Counter</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 14 }}>
              {[500, 200, 100, 50, 20, 10, 5, 2, 1].map(denom => (
                <div key={denom} style={{ border: '1px solid var(--bb-border-soft)', borderRadius: 8, padding: 8, background: 'var(--bb-surface-soft)' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--bb-accent-link)' }}>₹{denom} ×</div>
                  <input
                    type="number"
                    min="0"
                    value={denomCounts[denom] || 0}
                    onChange={e => setDenomCounts(prev => ({ ...prev, [denom]: Math.max(0, Number(e.target.value) || 0) }))}
                    style={{ width: '100%', padding: '5px 7px', borderRadius: 6, border: '1px solid #CBD5E1', marginTop: 4, fontSize: 13 }}
                  />
                  <div style={{ fontSize: 11, color: '#64748B', marginTop: 3 }}>
                    = {formatINR(denom * (denomCounts[denom] || 0))}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600 }}>Paid In (Opening / Extra Cash ₹)</label>
                <input type="number" value={paidInAmt} onChange={e => setPaidInAmt(e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #CBD5E1', marginTop: 4 }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600 }}>Paid Out (Petty Cash Out ₹)</label>
                <input type="number" value={paidOutAmt} onChange={e => setPaidOutAmt(e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #CBD5E1', marginTop: 4 }} />
              </div>
            </div>

            <input
              value={tillNote}
              onChange={e => setTillNote(e.target.value)}
              placeholder="Shift / Register note"
              style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #CBD5E1', marginBottom: 12, fontSize: 12.5 }}
            />

            <div className="bb-highlight-teal" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderRadius: 10 }}>
              <div>
                <div style={{ fontSize: 11.5, color: 'var(--bb-text-secondary)' }}>Drawer Cash: {formatINR(notesTotal)}</div>
                <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--bb-accent-link)' }}>Net Closing: {formatINR(netCashClosing)}</div>
              </div>
              <button className="bb-btn-primary" onClick={handleSaveDenomination}>Save Day-End Tally</button>
            </div>
          </div>

          <div className="bb-card">
            <h3 style={{ margin: '0 0 12px 0', fontSize: 15.5, fontWeight: 700 }}>Recent Day-End Reconciliation Logs</h3>
            <table className="bb-table">
              <thead>
                <tr><th>Date</th><th>Drawer Cash</th><th>Paid In / Out</th><th>Closing Net</th></tr>
              </thead>
              <tbody>
                {denomLogs.map(log => (
                  <tr key={log.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{log.date}</div>
                      <div style={{ fontSize: 11, color: '#64748B' }}>{log.note}</div>
                    </td>
                    <td>{formatINR(log.notesTotal)}</td>
                    <td style={{ fontSize: 12 }}>+{formatINR(log.paidIn)} / -{formatINR(log.paidOut)}</td>
                    <td style={{ fontWeight: 800, color: '#15803D' }}>{formatINR(log.closingNet)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD / EDIT PRODUCT MODAL */}
      {prodModalOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 90, padding: 16 }}
          onClick={() => setProdModalOpen(false)}
        >
          <div className="bb-card" style={{ width: 'min(620px, 95vw)', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ margin: 0, fontSize: 16.5, fontWeight: 700 }}>
                {editingProdId ? 'Edit Product Master' : 'Add New Product to Master Catalog'}
              </h3>
              <button onClick={() => setProdModalOpen(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <form onSubmit={handleSaveProduct} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600 }}>Product Code *</label>
                <input value={pCode} onChange={e => setPCode(e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #CBD5E1', marginTop: 4 }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600 }}>Barcode *</label>
                <input value={pBarcode} onChange={e => setPBarcode(e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #CBD5E1', marginTop: 4 }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600 }}>English Name *</label>
                <input value={pName} onChange={e => setPName(e.target.value)} placeholder="e.g. CARDAMOM 100G" style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #CBD5E1', marginTop: 4 }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600 }}>Tamil Name</label>
                <input value={pTamilName} onChange={e => setPTamilName(e.target.value)} placeholder="ஏலக்காய்" style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #CBD5E1', marginTop: 4 }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600 }}>Category</label>
                <select value={pCategory} onChange={e => setPCategory(e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #CBD5E1', marginTop: 4 }}>
                  {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600 }}>Base Unit & Box Size</label>
                <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                  <select value={pUnit} onChange={e => setPUnit(e.target.value)} style={{ flex: 1, padding: 8, borderRadius: 8, border: '1px solid #CBD5E1' }}>
                    <option value="Kg">Kg</option>
                    <option value="Nos">Nos</option>
                    <option value="Box">Box</option>
                  </select>
                  <input type="number" value={pBoxSize} onChange={e => setPBoxSize(e.target.value)} placeholder="Pack" style={{ width: 65, padding: 8, borderRadius: 8, border: '1px solid #CBD5E1' }} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600 }}>Purchase Cost (₹)</label>
                <input type="number" step="0.5" value={pPurchasePrice} onChange={e => setPPurchasePrice(e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #CBD5E1', marginTop: 4 }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600 }}>MRP (₹)</label>
                <input type="number" step="0.5" value={pMrp} onChange={e => setPMrp(e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #CBD5E1', marginTop: 4 }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600 }}>Retail Selling Rate (₹)</label>
                <input type="number" step="0.5" value={pRate} onChange={e => setPRate(e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #CBD5E1', marginTop: 4 }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600 }}>Wholesale Rate (₹)</label>
                <input type="number" step="0.5" value={pWholesaleRate} onChange={e => setPWholesaleRate(e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #CBD5E1', marginTop: 4 }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600 }}>Branch Rate (₹)</label>
                <input type="number" step="0.5" value={pBranchRate} onChange={e => setPBranchRate(e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #CBD5E1', marginTop: 4 }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600 }}>Central / Shop Stock</label>
                <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                  <input type="number" value={pCentralStock} onChange={e => setPCentralStock(e.target.value)} title="Central Warehouse" style={{ flex: 1, padding: 8, borderRadius: 8, border: '1px solid #CBD5E1' }} />
                  <input type="number" value={pShopStock} onChange={e => setPShopStock(e.target.value)} title="Main Shop Stock" style={{ flex: 1, padding: 8, borderRadius: 8, border: '1px solid #CBD5E1' }} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600 }}>Low Stock Threshold</label>
                <input type="number" value={pLowThresh} onChange={e => setPLowThresh(e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #CBD5E1', marginTop: 4 }} />
              </div>

              <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                <button type="button" className="bb-btn-outline" onClick={() => setProdModalOpen(false)}>Cancel</button>
                <button type="submit" className="bb-btn-primary">{editingProdId ? 'Update Product' : 'Save New Product'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BARCODE STICKER GENERATOR MODAL */}
      {barcodeProd && (
        <div
          className="bb-print-only-modal"
          style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 95, padding: 16 }}
          onClick={() => setBarcodeProd(null)}
        >
          <div className="bb-card" style={{ width: 'min(540px, 94vw)', maxHeight: '88vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div className="bb-no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <strong style={{ fontSize: 15.5, color: 'var(--bb-accent-link)' }}>Barcode Sticker Print: {barcodeProd.name}</strong>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input type="number" min="1" max="24" value={labelQty} onChange={e => setLabelQty(e.target.value)} style={{ width: 60, padding: '5px 8px', borderRadius: 6, border: '1px solid #CBD5E1' }} />
                <button className="bb-btn-primary" onClick={() => window.print()}><Printer size={14} /> Print Labels</button>
                <button className="bb-btn-outline" onClick={() => setBarcodeProd(null)}><X size={14} /></button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10 }}>
              {Array.from({ length: Math.min(24, Math.max(1, Number(labelQty) || 1)) }, (_, idx) => (
                <div key={idx} style={{ border: '1px dashed #94A3B8', borderRadius: 6, padding: 10, textAlign: 'center', background: '#FFFFFF' }}>
                  <div style={{ fontSize: 10, fontWeight: 700 }}>BARAKAH BEPAAR</div>
                  <div style={{ fontSize: 11.5, fontWeight: 700, marginTop: 2 }}>{barcodeProd.name}</div>
                  <div style={{ fontSize: 10, color: '#475569' }}>{barcodeProd.tamilName}</div>
                  <div
                    style={{
                      margin: '6px auto',
                      height: 28,
                      width: '88%',
                      background: 'repeating-linear-gradient(90deg, #0F172A 0 2px, #FFF 2px 4px, #0F172A 4px 7px, #FFF 7px 9px)'
                    }}
                  />
                  <div style={{ fontSize: 10, fontFamily: 'monospace' }}>{barcodeProd.barcode}</div>
                  <div style={{ fontSize: 12.5, fontWeight: 800, marginTop: 2 }}>
                    MRP {formatINR(barcodeProd.mrp)} · Rate {formatINR(barcodeProd.rate)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
