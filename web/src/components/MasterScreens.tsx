import React, { useState, useCallback, useEffect } from 'react';
import { SEED_PRODUCTS, SEED_CUSTOMERS } from '../data/seedData';
import '../styles/classicTheme.css';

interface MasterScreenProps {
  onClose: () => void;
  isEnglish: boolean;
}

/* ============================================================================
   1. CATEGORY INFORMATION (Slides 12-13)
   ============================================================================ */
export const CategoryMasterScreen: React.FC<MasterScreenProps> = ({ onClose, isEnglish }) => {
  const [tab, setTab] = useState<'info' | 'list'>('info');
  const [code, setCode] = useState('61');
  const [name, setName] = useState('OIL');
  const [points, setPoints] = useState('0');
  const [filterCode, setFilterCode] = useState('');
  const [filterName, setFilterName] = useState('');
  const [categories, setCategories] = useState([
    { code: '1', name: 'APPALAM', points: 50 },
    { code: '2', name: 'AXESPRAY BODYCENT', points: 0 },
    { code: '3', name: 'BABY FOODS', points: 0 },
    { code: '4', name: 'BABY POWDER & SOAPS', points: 0 },
    { code: '5', name: 'BALMS', points: 0 },
    { code: '6', name: 'BATHING SOAPS', points: 0 },
    { code: '7', name: 'BISCUITS & SAVOURIES', points: 0 },
    { code: '61', name: 'OIL', points: 0 },
    { code: '12', name: 'SPICES & MASALA', points: 1 },
    { code: '15', name: 'PULSES & DHAL', points: 1 },
    { code: '24', name: 'SHAMPOOS', points: 2 }
  ]);

  const handleNew = useCallback(() => {
    setCode('');
    setName('');
    setPoints('0');
    setTab('info');
  }, []);

  const handleSave = useCallback(() => {
    if (!code.trim() || !name.trim()) {
      alert(isEnglish ? 'Please enter Category Code and Name.' : 'பிரிவு எண் மற்றும் பெயரை உள்ளிடவும்.');
      return;
    }
    setCategories(prev => {
      const idx = prev.findIndex(c => c.code === code.trim());
      const item = { code: code.trim(), name: name.trim(), points: parseInt(points) || 0 };
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = item;
        return next;
      }
      return [...prev, item];
    });
    alert(isEnglish ? 'Category saved!' : 'பிரிவு சேமிக்கப்பட்டது!');
  }, [code, name, points, isEnglish]);

  const handleDelete = useCallback(() => {
    if (!code.trim()) return;
    if (!window.confirm(isEnglish ? `Delete category ${code}?` : `பிரிவு ${code} ஐ நீக்கவா?`)) return;
    setCategories(prev => prev.filter(c => c.code !== code.trim()));
    handleNew();
  }, [code, isEnglish, handleNew]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === 'n') { e.preventDefault(); handleNew(); }
      else if (e.ctrlKey && e.key.toLowerCase() === 's') { e.preventDefault(); handleSave(); }
      else if (e.ctrlKey && e.key.toLowerCase() === 'x') { e.preventDefault(); handleDelete(); }
      else if (e.key === 'Escape') { e.preventDefault(); onClose(); }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleNew, handleSave, handleDelete, onClose]);

  const filteredCategories = categories.filter(c =>
    (!filterCode.trim() || c.code.toLowerCase().includes(filterCode.trim().toLowerCase())) &&
    (!filterName.trim() || c.name.toLowerCase().includes(filterName.trim().toLowerCase()))
  );

  return (
    <div className="win-child-window" style={{ width: 640, height: 420, margin: 'auto' }}>
      <div className="win-child-titlebar">
        <span>{isEnglish ? 'CATEGORY INFORMATION' : 'பொருள் பிரிவு விவரம்'}</span>
        <button className="win-control-btn" style={{ color: '#B91C1C' }} onClick={onClose}>✕</button>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 10, background: '#ECE9D8', overflow: 'hidden' }}>
        {/* Header + 4 Toolbar Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <div style={{ fontSize: 18, fontWeight: 'bold', color: '#CC0000' }}>
            {isEnglish ? 'CATEGORY INFORMATION' : 'பொருள் பிரிவு விவரம்'}
          </div>
          <div className="action-buttons-box">
            <div className="action-btn" title="New Record (CTRL+N)" onClick={handleNew}>
              <span style={{ fontSize: 14 }}>📄</span>
              <span className={isEnglish ? 'action-btn-label-en' : 'action-btn-label-ta'}>{isEnglish ? 'New' : 'சேர்ப்பு'}</span>
            </div>
            <div
              className="action-btn"
              title="Save Record (CTRL+S)"
              onClick={handleSave}
              style={{ opacity: tab === 'list' ? 0.55 : 1 }}
            >
              <span style={{ fontSize: 14 }}>💾</span>
              <span className={isEnglish ? 'action-btn-label-en' : 'action-btn-label-ta'}>{isEnglish ? 'Save' : 'பதிவு'}</span>
            </div>
            <div
              className="action-btn"
              title="Print"
              onClick={() => window.print()}
              style={{ opacity: tab === 'info' ? 0.55 : 1 }}
            >
              <span style={{ fontSize: 14 }}>🖨</span>
              <span className={isEnglish ? 'action-btn-label-en' : 'action-btn-label-ta'}>{isEnglish ? 'Print' : 'அச்சிடு'}</span>
            </div>
            <div className="action-btn" title="Close (ESC)" onClick={onClose}>
              <span style={{ fontSize: 14, color: '#DC2626' }}>▲</span>
              <span className={isEnglish ? 'action-btn-label-en' : 'action-btn-label-ta'}>{isEnglish ? 'Close' : 'முற்றும்'}</span>
            </div>
          </div>
        </div>

        <div className="win-tabs-container">
          <div
            className={`win-tab ${tab === 'info' ? 'active' : ''}`}
            style={{ color: '#000080', fontWeight: tab === 'info' ? 'normal' : 'bold' }}
            onClick={() => setTab('info')}
          >
            {isEnglish ? 'Category Information' : 'பிரிவு விவரம்'}
          </div>
          <div
            className={`win-tab ${tab === 'list' ? 'active' : ''}`}
            style={{ color: '#000080', fontWeight: tab === 'list' ? 'normal' : 'bold' }}
            onClick={() => setTab('list')}
          >
            {isEnglish ? 'Category List' : 'பிரிவு பட்டியல்'}
          </div>
        </div>

        <div style={{ flex: 1, border: '1px solid #808080', borderTop: 'none', padding: 14, background: '#ECE9D8', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          {tab === 'info' ? (
            <div style={{ border: '1px solid #A0A0A0', padding: '24px 36px', background: '#ECE9D8', width: 430 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '115px 1fr', gap: 10, alignItems: 'center', fontSize: 11.5 }}>
                <label style={{ fontWeight: 'bold', color: '#000080', textAlign: 'right' }}>{isEnglish ? 'Category Code' : 'பிரிவு எண்'}</label>
                <input type="text" className="win-input-classic" style={{ width: 95 }} value={code} onChange={e => setCode(e.target.value)} />

                <label style={{ fontWeight: 'bold', color: '#000080', textAlign: 'right' }}>{isEnglish ? 'Category Name' : 'பிரிவு பெயர்'}</label>
                <input type="text" className="win-input-classic" style={{ fontWeight: 'bold' }} value={name} onChange={e => setName(e.target.value)} />

                <label style={{ fontWeight: 'bold', color: '#000', textAlign: 'right' }}>{isEnglish ? 'Reward Points' : 'புள்ளிகள்'}</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <input type="text" className="win-input-classic" style={{ width: 95 }} value={points} onChange={e => setPoints(e.target.value)} />
                  <span style={{ fontWeight: 'bold' }}>Per 100Rs.</span>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', gap: 8, overflow: 'hidden' }}>
              {/* Filter Row matching Slide 13 (Image 3) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '0 4px', fontSize: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <label style={{ fontWeight: 'bold', color: '#000080' }}>{isEnglish ? 'Code' : 'எண்'}</label>
                  <input
                    type="text"
                    className="win-input-classic"
                    style={{ width: 110 }}
                    value={filterCode}
                    onChange={e => setFilterCode(e.target.value)}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
                  <label style={{ fontWeight: 'bold', color: '#000080' }}>{isEnglish ? 'Name' : 'பெயர்'}</label>
                  <input
                    type="text"
                    className="win-input-classic"
                    style={{ width: 220 }}
                    value={filterName}
                    onChange={e => setFilterName(e.target.value)}
                  />
                </div>
              </div>

              {/* Category DataGrid */}
              <div style={{ flex: 1, background: '#FFFFFF', border: '1px inset #808080', overflowY: 'auto' }}>
                <table className="vanigam-grid">
                  <thead>
                    <tr>
                      <th style={{ width: 70 }}>{isEnglish ? 'Code' : 'எண்'}</th>
                      <th>{isEnglish ? 'Category Name' : 'பிரிவு பெயர்'}</th>
                      <th style={{ width: 85, textAlign: 'right' }}>{isEnglish ? 'Points' : 'புள்ளிகள்'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCategories.map(c => (
                      <tr key={c.code} onClick={() => { setCode(c.code); setName(c.name); setPoints(String(c.points)); setTab('info'); }} style={{ cursor: 'pointer' }}>
                        <td style={{ textAlign: 'right' }}><b>{c.code}</b></td>
                        <td style={{ fontWeight: 'bold' }}>{c.name}</td>
                        <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{c.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div style={{ marginTop: 6, fontSize: 11, fontWeight: 'bold', color: '#000' }}>
          CTRL+N - New Record ; CTRL+S - Save Record ; CTRL+X - Delete Record; ESC - Exit
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
   2. PRODUCT INFORMATION (Slides 14-17)
   ============================================================================ */
interface BarcodeBatch {
  barcode: string;
  prate: string;
  mrp: string;
  rate: string;
}

const TAMIL_VOWEL_SIGNS = ['', 'ா', 'ி', 'ீ', 'ு', 'ூ', 'ெ', 'ே', 'ை', 'ொ', 'ோ', 'ௌ', '்'];
const makeUyirmei = (base: string) => TAMIL_VOWEL_SIGNS.map(sign => base + sign);

const TAMIL_PALETTE_GROUPS: { label: string; chars: string[] }[] = [
  { label: 'க', chars: makeUyirmei('க') },
  { label: 'ச', chars: makeUyirmei('ச') },
  { label: 'ட', chars: makeUyirmei('ட') },
  { label: 'த', chars: makeUyirmei('த') },
  { label: 'ப', chars: makeUyirmei('ப') },
  { label: 'ற', chars: makeUyirmei('ற') },
  { label: 'ங', chars: makeUyirmei('ங') },
  { label: 'ஞ', chars: makeUyirmei('ஞ') },
  { label: 'ண', chars: makeUyirmei('ண') },
  { label: 'ந', chars: makeUyirmei('ந') },
  { label: 'ம', chars: makeUyirmei('ம') },
  { label: 'ன', chars: makeUyirmei('ன') },
  { label: 'ய', chars: makeUyirmei('ய') },
  { label: 'ர', chars: makeUyirmei('ர') },
  { label: 'ல', chars: makeUyirmei('ல') },
  { label: 'வ', chars: makeUyirmei('வ') },
  { label: 'ழ', chars: makeUyirmei('ழ') },
  { label: 'ள', chars: makeUyirmei('ள') },
  { label: 'அ', chars: ['அ', 'ஆ', 'இ', 'ஈ', 'உ', 'ஊ', 'எ', 'ஏ', 'ஐ', 'ஒ', 'ஓ', 'ஔ', 'ஃ'] },
  { label: 'ஸ', chars: makeUyirmei('ஸ') },
  { label: '?', chars: ['ஜ', 'ஷ', 'ஹ', 'க்ஷ', 'ஸ்ரீ', 'ஶ', ' ', '-', '.', '/'] }
];

export const ProductMasterScreen: React.FC<MasterScreenProps> = ({ onClose, isEnglish }) => {
  const [tab, setTab] = useState<'details' | 'list'>('details');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [showTamilPalette, setShowTamilPalette] = useState(false);
  const [listFilterCode, setListFilterCode] = useState('');
  const [listFilterName, setListFilterName] = useState('');

  const prod = SEED_PRODUCTS[selectedIdx] || SEED_PRODUCTS[0];
  const [salesTax, setSalesTax] = useState('T1 - NON TAXABLE ITEMS');
  const [purchaseTax, setPurchaseTax] = useState('T1 - NON TAXABLE ITEMS');
  const [prodCode, setProdCode] = useState(prod.code);
  const [prodName, setProdName] = useState(prod.name);
  const [tamilName, setTamilName] = useState(prod.tamilName);
  const [category, setCategory] = useState('SHAMPOOS');
  const [unit, setUnit] = useState(prod.unit);
  const [openingStock, setOpeningStock] = useState(String(prod.currentStock));
  const [openingValue, setOpeningValue] = useState('0.00');
  const [purchaseRate, setPurchaseRate] = useState((prod.wholesaleRate || prod.rate).toFixed(4));
  const [mrp, setMrp] = useState(prod.mrp.toFixed(2));
  const [retailMargin, setRetailMargin] = useState('14.79');
  const [rate, setRate] = useState(prod.rate.toFixed(2));
  const [wMargin, setWMargin] = useState('0');
  const [wRate, setWRate] = useState((prod.wholesaleRate || 0).toFixed(2));
  const [profitPct, setProfitPct] = useState('0');
  const [discountPct, setDiscountPct] = useState('0.00');
  const [reorderLevel, setReorderLevel] = useState('3.00');
  const [location, setLocation] = useState('0');

  const [isDec, setIsDec] = useState(prod.isDecimal);
  const [isRateAlter, setIsRateAlter] = useState(false);
  const [isWm, setIsWm] = useState(prod.isWeighingMachine);
  const [freeText, setFreeText] = useState('');
  const [supplier, setSupplier] = useState('CASH - F1');
  const [hsnCode, setHsnCode] = useState('F1');

  const [newBarcode, setNewBarcode] = useState('');
  const [newPrate, setNewPrate] = useState('0.00');
  const [newMrp, setNewMrp] = useState('0.00');
  const [newRate, setNewRate] = useState('0.00');
  const [barcodeRows, setBarcodeRows] = useState<BarcodeBatch[]>([
    {
      barcode: prod.barcode,
      prate: (prod.wholesaleRate || prod.rate).toFixed(2),
      mrp: prod.mrp.toFixed(2),
      rate: prod.rate.toFixed(2)
    }
  ]);

  const loadProduct = useCallback((idx: number) => {
    const p = SEED_PRODUCTS[idx];
    if (!p) return;
    setSelectedIdx(idx);
    setProdCode(p.code);
    setProdName(p.name);
    setTamilName(p.tamilName);
    setUnit(p.unit);
    setOpeningStock(String(p.currentStock));
    setPurchaseRate((p.wholesaleRate || p.rate).toFixed(4));
    setMrp(p.mrp.toFixed(2));
    setRate(p.rate.toFixed(2));
    setWRate((p.wholesaleRate || 0).toFixed(2));
    setIsDec(p.isDecimal);
    setIsWm(p.isWeighingMachine);
    setBarcodeRows([
      {
        barcode: p.barcode,
        prate: (p.wholesaleRate || p.rate).toFixed(2),
        mrp: p.mrp.toFixed(2),
        rate: p.rate.toFixed(2)
      }
    ]);
  }, []);

  const handleNewProduct = useCallback(() => {
    setProdCode(String(10500 + SEED_PRODUCTS.length));
    setProdName('');
    setTamilName('');
    setOpeningStock('0');
    setOpeningValue('0.00');
    setPurchaseRate('0.0000');
    setMrp('0.00');
    setRetailMargin('0');
    setRate('0.00');
    setWMargin('0');
    setWRate('0.00');
    setProfitPct('0');
    setDiscountPct('0.00');
    setReorderLevel('0.00');
    setLocation('0');
    setFreeText('');
    setNewBarcode('');
    setNewPrate('0.00');
    setNewMrp('0.00');
    setNewRate('0.00');
    setBarcodeRows([]);
    setTab('details');
  }, []);

  const handleSaveProduct = useCallback(() => {
    if (!prodCode.trim() || !prodName.trim()) {
      alert(isEnglish ? 'Please enter Product Code and Product Name.' : 'பொருள் குறியீடு மற்றும் பெயரை உள்ளிடவும்.');
      return;
    }
    alert(isEnglish ? 'Product saved!' : 'பொருள் சேமிக்கப்பட்டது!');
  }, [prodCode, prodName, isEnglish]);

  const handleAddBarcodeRow = useCallback(() => {
    const codeVal = newBarcode.trim();
    if (!codeVal) return;
    setBarcodeRows(prev => [
      ...prev,
      {
        barcode: codeVal,
        prate: (parseFloat(newPrate) || 0).toFixed(2),
        mrp: (parseFloat(newMrp) || 0).toFixed(2),
        rate: (parseFloat(newRate) || 0).toFixed(2)
      }
    ]);
    setNewBarcode('');
    setNewPrate('0.00');
    setNewMrp('0.00');
    setNewRate('0.00');
  }, [newBarcode, newPrate, newMrp, newRate]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === 'n') { e.preventDefault(); handleNewProduct(); }
      else if (e.ctrlKey && e.key.toLowerCase() === 's') { e.preventDefault(); handleSaveProduct(); }
      else if (e.ctrlKey && e.key.toLowerCase() === 'x') {
        e.preventDefault();
        if (window.confirm(isEnglish ? `Delete product ${prodCode}?` : `பொருள் ${prodCode} ஐ நீக்கவா?`)) {
          handleNewProduct();
        }
      }
      else if (e.key === 'F8') { e.preventDefault(); loadProduct(Math.max(0, selectedIdx - 1)); }
      else if (e.key === 'F7') { e.preventDefault(); loadProduct(Math.min(SEED_PRODUCTS.length - 1, selectedIdx + 1)); }
      else if (e.key === 'F2') { e.preventDefault(); handleAddBarcodeRow(); }
      else if (e.key === 'Escape') { e.preventDefault(); onClose(); }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleNewProduct, handleSaveProduct, loadProduct, handleAddBarcodeRow, selectedIdx, prodCode, isEnglish, onClose]);

  const filteredProducts = SEED_PRODUCTS.filter(p =>
    (!listFilterCode.trim() || p.code.toLowerCase().includes(listFilterCode.trim().toLowerCase())) &&
    (!listFilterName.trim() || p.name.toLowerCase().includes(listFilterName.trim().toLowerCase()))
  );

  return (
    <div className="win-child-window" style={{ position: 'relative' }}>
      <div className="win-child-titlebar">
        <span>{isEnglish ? 'PRODUCT INFORMATION' : 'பொருள் விவரம்'}</span>
        <button className="win-control-btn" style={{ color: '#B91C1C' }} onClick={onClose}>✕</button>
      </div>

      {/* Slide 15 Tamil Virtual Palette Overlay (21 dropdowns + Close button, Image 5) */}
      {showTamilPalette && (
        <div
          style={{
            position: 'absolute',
            left: 14,
            top: 84,
            zIndex: 500,
            width: 162,
            background: '#9E9E9E',
            border: '2px outset #FFFFFF',
            boxShadow: '2px 2px 6px rgba(0,0,0,0.45)',
            padding: 4
          }}
        >
          <div
            style={{
              textAlign: 'center',
              fontWeight: 'bold',
              fontSize: 11,
              color: '#000000',
              fontFamily: "'Noto Sans Tamil', sans-serif",
              marginBottom: 4
            }}
          >
            தமிழ் எழுத்துக்கள்
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
            {TAMIL_PALETTE_GROUPS.map(group => (
              <select
                key={group.label}
                className="win-input-classic"
                value=""
                onChange={e => {
                  if (e.target.value) {
                    setTamilName(prev => prev + e.target.value);
                  }
                }}
                style={{
                  fontFamily: "'Noto Sans Tamil', sans-serif",
                  fontWeight: 'bold',
                  fontSize: 11,
                  height: 21,
                  padding: '0 2px',
                  background: '#ECE9D8'
                }}
              >
                <option value="">{group.label}</option>
                {group.chars.map(ch => (
                  <option key={ch} value={ch}>
                    {ch}
                  </option>
                ))}
              </select>
            ))}
            <button
              className="win-btn-classic"
              style={{ height: 21, fontWeight: 'bold', fontSize: 11 }}
              onClick={() => setShowTamilPalette(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '6px 10px', background: '#ECE9D8', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 28 }}>
            <span style={{ fontSize: 18, fontWeight: 'bold', color: '#CC0000' }}>
              {isEnglish ? 'PRODUCT INFORMATION' : 'பொருள் தகவல்'}
            </span>
            <span style={{ fontSize: 11, fontWeight: 'bold', color: '#800000' }}>F2-BARCODE</span>
          </div>

          <div className="action-buttons-box">
            <div className="action-btn" title="New Record (CTRL+N)" onClick={handleNewProduct}>
              <span style={{ fontSize: 13 }}>📄</span>
              <span className={isEnglish ? 'action-btn-label-en' : 'action-btn-label-ta'}>{isEnglish ? 'New' : 'சேர்ப்பு'}</span>
            </div>
            <div className="action-btn" title="Save Record (CTRL+S)" onClick={handleSaveProduct}>
              <span style={{ fontSize: 13 }}>💾</span>
              <span className={isEnglish ? 'action-btn-label-en' : 'action-btn-label-ta'}>{isEnglish ? 'Save' : 'பதிவு'}</span>
            </div>
            <div className="action-btn" title="Print" onClick={() => window.print()}>
              <span style={{ fontSize: 13 }}>🖨</span>
              <span className={isEnglish ? 'action-btn-label-en' : 'action-btn-label-ta'}>{isEnglish ? 'Print' : 'அச்சிடு'}</span>
            </div>
            <div className="action-btn" title="Close (ESC)" onClick={onClose}>
              <span style={{ fontSize: 13, color: '#DC2626' }}>▲</span>
              <span className={isEnglish ? 'action-btn-label-en' : 'action-btn-label-ta'}>{isEnglish ? 'Close' : 'முற்றும்'}</span>
            </div>
            <div className="action-btn" title="Tamil Letters Palette" onClick={() => setShowTamilPalette(prev => !prev)}>
              <span style={{ fontSize: 13 }}>🎨</span>
              <span className={isEnglish ? 'action-btn-label-en' : 'action-btn-label-ta'}>{isEnglish ? 'Letters' : 'எழுத்து'}</span>
            </div>
          </div>
        </div>

        <div className="win-tabs-container">
          <div
            className={`win-tab ${tab === 'details' ? 'active' : ''}`}
            style={{ color: '#000080', fontWeight: tab === 'details' ? 'normal' : 'bold' }}
            onClick={() => setTab('details')}
          >
            {isEnglish ? 'Product Details' : 'பொருள் விவரம்'}
          </div>
          <div
            className={`win-tab ${tab === 'list' ? 'active' : ''}`}
            style={{ color: '#000080', fontWeight: tab === 'list' ? 'normal' : 'bold' }}
            onClick={() => setTab('list')}
          >
            {isEnglish ? 'Product List' : 'பொருள் பட்டியல்'}
          </div>
        </div>

        {tab === 'details' ? (
          <div style={{ flex: 1, border: '1px solid #808080', borderTop: 'none', padding: '6px 12px', background: '#ECE9D8', overflowY: 'auto' }}>
            {/* Nav arrows */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}>
              <div className="nav-btn-group">
                <div className="nav-btn-col"><button className="nav-btn" onClick={() => loadProduct(0)}>|&lt;</button></div>
                <div className="nav-btn-col"><button className="nav-btn" onClick={() => loadProduct(Math.max(0, selectedIdx - 1))}>&lt;&lt;</button><span className="nav-btn-subtext">F8</span></div>
                <div className="nav-btn-col"><button className="nav-btn" onClick={() => loadProduct(Math.min(SEED_PRODUCTS.length - 1, selectedIdx + 1))}>&gt;&gt;</button><span className="nav-btn-subtext">F7</span></div>
                <div className="nav-btn-col"><button className="nav-btn" onClick={() => loadProduct(SEED_PRODUCTS.length - 1)}>&gt;|</button></div>
              </div>
            </div>

            {/* Tax row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 6, fontSize: 11 }}>
              <div>
                <div style={{ color: '#800000', fontWeight: 'bold', textAlign: 'center', marginBottom: 1 }}>
                  {isEnglish ? 'Sales Tax :' : 'விற்பனை வரி :'}
                </div>
                <select
                  className="win-input-classic"
                  style={{ width: '100%', fontWeight: 'bold' }}
                  value={salesTax}
                  onChange={e => setSalesTax(e.target.value)}
                >
                  <option>T1 - NON TAXABLE ITEMS</option>
                  <option>T2 - 5% GST</option>
                  <option>T3 - 12% GST</option>
                  <option>T4 - 18% GST</option>
                  <option>T5 - 28% GST</option>
                </select>
              </div>
              <div>
                <div style={{ color: '#800000', fontWeight: 'bold', textAlign: 'center', marginBottom: 1 }}>
                  {isEnglish ? 'Purchase Tax :' : 'கொள்முதல் வரி :'}
                </div>
                <select
                  className="win-input-classic"
                  style={{ width: '100%', fontWeight: 'bold' }}
                  value={purchaseTax}
                  onChange={e => setPurchaseTax(e.target.value)}
                >
                  <option>T1 - NON TAXABLE ITEMS</option>
                  <option>T2 - 5% GST</option>
                  <option>T3 - 12% GST</option>
                  <option>T4 - 18% GST</option>
                  <option>T5 - 28% GST</option>
                </select>
              </div>
            </div>

            {/* Main details 2-col (Image 4 layout) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.15fr', gap: 10, fontSize: 11 }}>
              {/* Left Column: 14 fields matching Image 4 */}
              <div style={{ display: 'grid', gridTemplateColumns: '115px 1fr', alignItems: 'center', gap: '2.5px 6px' }}>
                <label style={{ color: '#000080', fontWeight: 'bold', textAlign: 'right' }}>
                  {isEnglish ? 'Product Code' : 'குறியீடு'}
                </label>
                <input type="text" className="win-input-classic" style={{ width: 140 }} value={prodCode} onChange={e => setProdCode(e.target.value)} />

                <label style={{ color: '#000080', fontWeight: 'bold', textAlign: 'right' }}>
                  {isEnglish ? 'Product Name' : 'பெயர்'}
                </label>
                <input type="text" className="win-input-classic" style={{ fontWeight: 'bold' }} value={prodName} onChange={e => setProdName(e.target.value)} />

                <label style={{ color: '#000080', fontWeight: 'bold', textAlign: 'right' }}>
                  {isEnglish ? 'Product Category' : 'பிரிவு'}
                </label>
                <select className="win-input-classic" style={{ fontWeight: 'bold' }} value={category} onChange={e => setCategory(e.target.value)}>
                  <option>SHAMPOOS</option>
                  <option>APPALAM</option>
                  <option>GROCERIES &amp; SPICES</option>
                  <option>OIL</option>
                </select>

                <label style={{ color: '#000080', fontWeight: 'bold', textAlign: 'right' }}>
                  {isEnglish ? 'Product Unit' : 'அலகு'}
                </label>
                <select className="win-input-classic" style={{ width: 95, fontWeight: 'bold' }} value={unit} onChange={e => setUnit(e.target.value)}>
                  <option value="Nos">Nos</option>
                  <option value="Kg">Kg</option>
                  <option value="Gms">Gms</option>
                  <option value="Ltr">Ltr</option>
                  <option value="Pcs">Pcs</option>
                  <option value="Box">Box</option>
                </select>

                <label style={{ color: '#000080', fontWeight: 'bold', textAlign: 'right' }}>
                  {isEnglish ? 'Opening Stock' : 'ஆரம்ப இருப்பு'}
                </label>
                <input type="text" className="win-input-classic" style={{ width: 100, fontWeight: 'bold' }} value={openingStock} onChange={e => setOpeningStock(e.target.value)} />

                <label style={{ color: '#000080', fontWeight: 'bold', textAlign: 'right' }}>
                  {isEnglish ? 'Opening Value' : 'ஆரம்ப மதிப்பு'}
                </label>
                <input type="text" className="win-input-classic" style={{ width: 100, fontWeight: 'bold' }} value={openingValue} onChange={e => setOpeningValue(e.target.value)} />

                <label style={{ color: '#000080', fontWeight: 'bold', textAlign: 'right' }}>
                  {isEnglish ? 'Purchase Rate' : 'கொள்முதல் விலை'}
                </label>
                <input type="text" className="win-input-classic" style={{ width: 100, fontWeight: 'bold' }} value={purchaseRate} onChange={e => setPurchaseRate(e.target.value)} />

                <label style={{ color: '#000080', fontWeight: 'bold', textAlign: 'right' }}>MRP</label>
                <input type="text" className="win-input-classic" style={{ width: 100, fontWeight: 'bold' }} value={mrp} onChange={e => setMrp(e.target.value)} />

                <label style={{ color: '#000080', fontWeight: 'bold', textAlign: 'right' }}>
                  {isEnglish ? 'Retail Rate' : 'விற்பனை விலை'}
                </label>
                <div style={{ display: 'flex', gap: 3 }}>
                  <input type="text" className="win-input-classic" style={{ width: 46, fontWeight: 'bold' }} value={retailMargin} onChange={e => setRetailMargin(e.target.value)} />
                  <input type="text" className="win-input-classic" style={{ width: 76, fontWeight: 'bold' }} value={rate} onChange={e => setRate(e.target.value)} />
                </div>

                <label style={{ color: '#000080', fontWeight: 'bold', textAlign: 'right' }}>
                  {isEnglish ? 'W Rate' : 'மொத்த விலை'}
                </label>
                <div style={{ display: 'flex', gap: 3 }}>
                  <input type="text" className="win-input-classic" style={{ width: 46, fontWeight: 'bold' }} value={wMargin} onChange={e => setWMargin(e.target.value)} />
                  <input type="text" className="win-input-classic" style={{ width: 76, fontWeight: 'bold' }} value={wRate} onChange={e => setWRate(e.target.value)} />
                </div>

                <label style={{ color: '#800000', fontWeight: 'bold', textAlign: 'right' }}>
                  {isEnglish ? 'Profit % :' : 'லாபம் % :'}
                </label>
                <input type="text" className="win-input-classic" style={{ width: 100, fontWeight: 'bold' }} value={profitPct} onChange={e => setProfitPct(e.target.value)} />

                <label style={{ color: '#000080', fontWeight: 'bold', textAlign: 'right' }}>
                  {isEnglish ? 'Discount Percent' : 'தள்ளுபடி %'}
                </label>
                <input type="text" className="win-input-classic" style={{ width: 100, fontWeight: 'bold' }} value={discountPct} onChange={e => setDiscountPct(e.target.value)} />

                <label style={{ color: '#000080', fontWeight: 'bold', textAlign: 'right' }}>
                  {isEnglish ? 'Reorder Level' : 'குறைந்த அளவு'}
                </label>
                <input type="text" className="win-input-classic" style={{ width: 100, fontWeight: 'bold' }} value={reorderLevel} onChange={e => setReorderLevel(e.target.value)} />

                <label style={{ color: '#CC0000', fontWeight: 'bold', textAlign: 'right' }}>LOCATION :</label>
                <input type="text" className="win-input-classic" style={{ width: 100, fontWeight: 'bold' }} value={location} onChange={e => setLocation(e.target.value)} />
              </div>

              {/* Right Column: பொருட்பெயர், flags, FREE, Supplier, HSN CODE, Barcode Entry + Subgrid */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: '#800000', fontWeight: 'bold', fontSize: 11.5, marginBottom: 1 }}>பொருட்பெயர்</div>
                  <input
                    type="text"
                    className="win-input-classic"
                    style={{ width: '100%', fontFamily: "'Noto Sans Tamil', sans-serif", fontWeight: 'bold' }}
                    value={tamilName}
                    onChange={e => setTamilName(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: 14, fontWeight: 'bold', marginTop: 4 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 3, cursor: 'pointer' }}>
                    <input type="checkbox" checked={isDec} onChange={e => setIsDec(e.target.checked)} /> DECIMAL
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 3, cursor: 'pointer' }}>
                    <input type="checkbox" checked={isRateAlter} onChange={e => setIsRateAlter(e.target.checked)} /> Rate Alter
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 3, cursor: 'pointer' }}>
                    <input type="checkbox" checked={isWm} onChange={e => setIsWm(e.target.checked)} /> WMACHINE
                  </label>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '68px 1fr', alignItems: 'center', gap: '3px 6px', marginTop: 2 }}>
                  <label style={{ color: '#800000', fontWeight: 'bold', textAlign: 'right' }}>FREE:</label>
                  <input type="text" className="win-input-classic" value={freeText} onChange={e => setFreeText(e.target.value)} />

                  <label style={{ color: '#CC0000', fontWeight: 'bold', textAlign: 'right' }}>
                    {isEnglish ? 'Supplier :' : 'விநியோகஸ்தர் :'}
                  </label>
                  <select className="win-input-classic" style={{ fontWeight: 'bold' }} value={supplier} onChange={e => setSupplier(e.target.value)}>
                    <option>CASH - F1</option>
                    <option>BARAKAH - S1</option>
                  </select>

                  <label style={{ color: '#000000', fontWeight: 'bold', textAlign: 'right' }}>HSN CODE :</label>
                  <input type="text" className="win-input-classic" style={{ fontWeight: 'bold' }} value={hsnCode} onChange={e => setHsnCode(e.target.value)} />
                </div>

                {/* Barcode entry strip matching Image 4 */}
                <div style={{ border: '1px solid #C0C0C0', padding: '4px 6px', marginTop: 2, background: '#ECE9D8' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1fr 1fr 1fr', gap: 4, fontSize: 10.5, fontWeight: 'bold', color: '#800000', marginBottom: 2 }}>
                    <span>BARCODE :</span>
                    <span>PRATE :</span>
                    <span>MRP :</span>
                    <span>RATE :</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1fr 1fr 1fr', gap: 4 }}>
                    <input
                      type="text"
                      className="win-input-classic"
                      value={newBarcode}
                      onChange={e => setNewBarcode(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleAddBarcodeRow(); }}
                    />
                    <input
                      type="text"
                      className="win-input-classic"
                      style={{ fontWeight: 'bold' }}
                      value={newPrate}
                      onChange={e => setNewPrate(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleAddBarcodeRow(); }}
                    />
                    <input
                      type="text"
                      className="win-input-classic"
                      style={{ fontWeight: 'bold' }}
                      value={newMrp}
                      onChange={e => setNewMrp(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleAddBarcodeRow(); }}
                    />
                    <input
                      type="text"
                      className="win-input-classic"
                      style={{ fontWeight: 'bold' }}
                      value={newRate}
                      onChange={e => setNewRate(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleAddBarcodeRow(); }}
                    />
                  </div>
                </div>

                {/* Multi-Barcode Subgrid matching Slide 14 / Image 4 */}
                <div style={{ border: '1px inset #808080', background: '#808080', flex: 1, minHeight: 92, overflowY: 'auto' }}>
                  <table className="vanigam-grid">
                    <thead>
                      <tr>
                        <th style={{ width: '42%' }}>BARCODE</th>
                        <th style={{ textAlign: 'right' }}>PRATE</th>
                        <th style={{ textAlign: 'right' }}>MRP</th>
                        <th style={{ textAlign: 'right' }}>RATE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {barcodeRows.map((row, rIdx) => (
                        <tr key={`${row.barcode}-${rIdx}`}>
                          <td><b>{row.barcode}</b></td>
                          <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{row.prate}</td>
                          <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{row.mrp}</td>
                          <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{row.rate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ flex: 1, border: '1px solid #808080', borderTop: 'none', padding: 10, background: '#ECE9D8', display: 'flex', flexDirection: 'column', gap: 8, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 11.5 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <label style={{ fontWeight: 'bold', color: '#000080' }}>{isEnglish ? 'Product code' : 'பொருள் எண்'}</label>
                <input type="text" className="win-input-classic" style={{ width: 110 }} value={listFilterCode} onChange={e => setListFilterCode(e.target.value)} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <label style={{ fontWeight: 'bold', color: '#000080' }}>{isEnglish ? 'Product Name' : 'பொருள் பெயர்'}</label>
                <input type="text" className="win-input-classic" style={{ width: 220 }} value={listFilterName} onChange={e => setListFilterName(e.target.value)} />
              </div>
            </div>
            <div style={{ flex: 1, border: '1px inset #808080', background: '#FFFFFF', overflowY: 'auto' }}>
              <table className="vanigam-grid">
                <thead>
                  <tr>
                    <th style={{ width: 65 }}>Code</th>
                    <th>Product Name</th>
                    <th>Tamil Name</th>
                    <th style={{ width: 85, textAlign: 'right' }}>Sales Rate</th>
                    <th style={{ width: 85, textAlign: 'right' }}>Opening Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map(p => {
                    const realIdx = SEED_PRODUCTS.findIndex(sp => sp.id === p.id);
                    return (
                      <tr key={p.id} onClick={() => { loadProduct(realIdx >= 0 ? realIdx : 0); setTab('details'); }} style={{ cursor: 'pointer' }}>
                        <td><b>{p.code}</b></td>
                        <td>{p.name}</td>
                        <td style={{ fontFamily: "'Noto Sans Tamil', sans-serif" }}>{p.tamilName}</td>
                        <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{p.rate.toFixed(2)}</td>
                        <td style={{ textAlign: 'right' }}>{p.currentStock}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div style={{ marginTop: 4, fontSize: 11, fontWeight: 'bold' }}>
          CTRL+N - New Record ;CTRL+X-Delete Record; CTRL+S - Save Record ; ESC - Exit
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
   3. CUSTOMER INFORMATION (Slides 18-19)
   ============================================================================ */
export const CustomerMasterScreen: React.FC<MasterScreenProps> = ({ onClose, isEnglish }) => {
  const [tab, setTab] = useState<'info' | 'list'>('info');
  const [customerList, setCustomerList] = useState(SEED_CUSTOMERS);
  const [code, setCode] = useState(SEED_CUSTOMERS[1].code);
  const [name, setName] = useState(SEED_CUSTOMERS[1].name);
  const [tamilName, setTamilName] = useState(SEED_CUSTOMERS[1].tamilName || '');
  const [phone, setPhone] = useState(SEED_CUSTOMERS[1].phone1);
  const [balance, setBalance] = useState(SEED_CUSTOMERS[1].balance.toFixed(2));

  const handleNew = () => {
    setCode('');
    setName('');
    setTamilName('');
    setPhone('');
    setBalance('0.00');
  };

  const handleSave = () => {
    if (!code.trim() || !name.trim()) {
      alert(isEnglish ? 'Enter customer code and name.' : 'குறியீடு மற்றும் பெயரை உள்ளிடவும்.');
      return;
    }
    setCustomerList(prev => {
      const idx = prev.findIndex(c => c.code === code);
      const record = {
        code,
        name,
        tamilName,
        phone1: phone,
        balance: parseFloat(balance) || 0,
        points: 0
      };
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], ...record };
        return next;
      }
      return [...prev, record];
    });
    alert(isEnglish ? 'Customer saved!' : 'வாடிக்கையாளர் சேமிக்கப்பட்டது!');
  };

  const selectCust = (c: typeof SEED_CUSTOMERS[0]) => {
    setCode(c.code);
    setName(c.name);
    setTamilName(c.tamilName || '');
    setPhone(c.phone1);
    setBalance(c.balance.toFixed(2));
    setTab('info');
  };

  return (
    <div className="win-child-window" style={{ width: 740, height: 500, margin: 'auto' }}>
      <div className="win-child-titlebar">
        <span>{isEnglish ? 'CUSTOMER INFORMATION' : 'வாடிக்கையாளர் தகவல்'}</span>
        <button className="win-control-btn" style={{ color: '#B91C1C' }} onClick={onClose}>✕</button>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 8, background: '#ECE9D8', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 'bold', color: '#CC0000' }}>
            {isEnglish ? 'CUSTOMER INFORMATION' : 'வாடிக்கையாளர் தகவல்'}
          </div>
          <div className="action-buttons-box">
            <div className="action-btn" onClick={handleNew}><span style={{ fontSize: 13 }}>📄</span><span className={isEnglish ? 'action-btn-label-en' : 'action-btn-label-ta'}>{isEnglish ? 'New' : 'சேர்ப்பு'}</span></div>
            <div className="action-btn" onClick={handleSave}><span style={{ fontSize: 13 }}>💾</span><span className={isEnglish ? 'action-btn-label-en' : 'action-btn-label-ta'}>{isEnglish ? 'Save' : 'பதிவு'}</span></div>
            <div className="action-btn" onClick={() => window.print()}><span style={{ fontSize: 13 }}>🖨</span><span className={isEnglish ? 'action-btn-label-en' : 'action-btn-label-ta'}>{isEnglish ? 'Print' : 'அச்சிடு'}</span></div>
            <div className="action-btn" onClick={onClose}><span style={{ fontSize: 13, color: '#B91C1C' }}>🛑</span><span className={isEnglish ? 'action-btn-label-en' : 'action-btn-label-ta'}>{isEnglish ? 'Close' : 'முற்றும்'}</span></div>
          </div>
        </div>

        <div className="win-tabs-container">
          <div className={`win-tab ${tab === 'info' ? 'active' : ''}`} onClick={() => setTab('info')}>{isEnglish ? 'Information' : 'விவரம்'}</div>
          <div className={`win-tab ${tab === 'list' ? 'active' : ''}`} onClick={() => setTab('list')}>{isEnglish ? 'List' : 'பட்டியல்'}</div>
        </div>

        {tab === 'info' ? (
          <div style={{ flex: 1, border: '1px solid #808080', borderTop: 'none', padding: 10, overflowY: 'auto' }}>
            {/* Dotted blue box matching Slide 18 */}
            <div style={{ border: '1.5px dashed #1D4ED8', borderRadius: 8, padding: 10, marginBottom: 8, display: 'grid', gridTemplateColumns: '1fr 220px', gap: 10, fontSize: 11 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: 5, alignItems: 'center' }}>
                <label style={{ color: '#000080', fontWeight: 'bold', textAlign: 'right' }}>{isEnglish ? 'Customer Code' : 'குறியீடு'}</label>
                <input type="text" className="win-input-classic" style={{ width: 90 }} value={code} onChange={e => setCode(e.target.value)} />
                <label style={{ color: '#000080', fontWeight: 'bold', textAlign: 'right' }}>{isEnglish ? 'Customer Name' : 'பெயர்'}</label>
                <input type="text" className="win-input-classic" style={{ fontWeight: 'bold' }} value={name} onChange={e => setName(e.target.value)} />
                <label style={{ color: '#000080', fontWeight: 'bold', textAlign: 'right' }}>{isEnglish ? 'Address' : 'முகவரி'}</label>
                <input type="text" className="win-input-classic" defaultValue="Arcot Road, Vadapalani" />
                <span></span>
                <input type="text" className="win-input-classic" defaultValue="Chennai" />
                <label style={{ color: '#000080', fontWeight: 'bold', textAlign: 'right' }}>{isEnglish ? 'Area :' : 'பகுதி :'}</label>
                <select className="win-input-classic"><option>Vadapalani</option><option>Kodambakkam</option></select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ color: '#800000', fontWeight: 'bold' }}>{isEnglish ? 'Tamil Details' : 'தமிழ் விவரம்'}</label>
                <input type="text" className="win-input-classic" style={{ fontFamily: "'Noto Sans Tamil', sans-serif" }} value={tamilName} onChange={e => setTamilName(e.target.value)} />
                <input type="text" className="win-input-classic" />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '110px 180px 110px 1fr', gap: 6, alignItems: 'center', fontSize: 11 }}>
              <label style={{ color: '#000080', fontWeight: 'bold', textAlign: 'right' }}>{isEnglish ? 'Phone No.' : 'தொலைபேசி'}</label>
              <input type="text" className="win-input-classic" value={phone} onChange={e => setPhone(e.target.value)} />
              <label style={{ color: '#800000', fontWeight: 'bold', textAlign: 'right' }}>{isEnglish ? 'Opening Amount' : 'ஆரம்ப பாக்கி'}</label>
              <input type="text" className="win-input-classic" value={balance} onChange={e => setBalance(e.target.value)} />

              <label style={{ color: '#800000', fontWeight: 'bold', textAlign: 'right' }}>GSTIN :</label>
              <input type="text" className="win-input-classic" />
              <label style={{ color: '#800000', fontWeight: 'bold', textAlign: 'right' }}>{isEnglish ? 'Customer Type' : 'வகை'}</label>
              <div>
                <label><input type="radio" name="ctype" defaultChecked /> {isEnglish ? 'Debit' : 'பற்று'}</label>{' '}
                <label><input type="radio" name="ctype" /> {isEnglish ? 'Credit' : 'வரவு'}</label>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ flex: 1, border: '1px inset #808080', background: '#808080', overflowY: 'auto' }}>
            <table className="vanigam-grid">
              <thead>
                <tr>
                  <th>{isEnglish ? 'Code' : 'எண்'}</th>
                  <th>{isEnglish ? 'Name' : 'பெயர்'}</th>
                  <th>{isEnglish ? 'Mobile' : 'தொலைபேசி'}</th>
                  <th style={{ textAlign: 'right' }}>{isEnglish ? 'Balance' : 'பாக்கி'}</th>
                </tr>
              </thead>
              <tbody>
                {customerList.map(c => (
                  <tr key={c.code} onClick={() => selectCust(c)} style={{ cursor: 'pointer' }}>
                    <td><b>{c.code}</b></td><td>{c.name}</td><td>{c.phone1}</td><td style={{ textAlign: 'right' }}>{c.balance.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div style={{ marginTop: 4, fontSize: 11, fontWeight: 'bold' }}>
          CTRL+N - New Record ; CTRL+X- Delete Customer; CTRL+S - Save Record ; ESC - Exit
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
   4. DENOMINATIONS (Slide 7 / image10.jpeg)
   Matches reference: small floating dialog, COUNT field yellow, denomination
   rows (2000,500,100,50,20,5,Coins), Save / Exit / Paid In/Outs buttons
   ============================================================================ */
interface DenomScreenProps extends MasterScreenProps {
  onOpenPaidInOut?: () => void;
}
export const DenominationScreen: React.FC<DenomScreenProps> = ({ onClose, isEnglish, onOpenPaidInOut }) => {
  const DENOMS = [2000, 500, 100, 50, 20, 10, 5] as const;
  const [counts, setCounts] = useState<Record<number, number>>({
    2000: 1,
    500: 2,
    100: 20,
    50: 110,
    20: 0,
    10: 50,
    5: 0
  });
  const [coins, setCoins] = useState<string>('0.00');
  const [countVal, setCountVal] = useState<string>('2');

  const total =
    DENOMS.reduce((sum, d) => sum + d * (counts[d] || 0), 0) +
    (parseFloat(coins) || 0);

  const handleSave = useCallback(() => {
    alert(isEnglish ? 'Denomination Saved!' : 'பண மதிப்பு சேமிக்கப்பட்டது!');
  }, [isEnglish]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose(); }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const denomRow = (denom: number, value: number, onChange: (v: number) => void) => (
    <div
      key={denom}
      style={{
        display: 'grid',
        gridTemplateColumns: '64px 54px 14px 104px',
        alignItems: 'center',
        gap: 4,
        marginBottom: 4
      }}
    >
      <span style={{ textAlign: 'right', fontWeight: 'bold', color: '#CC0000', fontSize: 12 }}>
        {denom} &nbsp;x
      </span>
      <input
        type="number"
        className="win-input-classic"
        style={{ textAlign: 'left', fontWeight: 'bold', fontSize: 12, width: '100%' }}
        min={0}
        value={value}
        onChange={e => onChange(Math.max(0, parseInt(e.target.value) || 0))}
      />
      <span style={{ textAlign: 'center', fontWeight: 'bold', color: '#CC0000', fontSize: 12 }}>=</span>
      <input
        type="text"
        className="win-input-classic"
        style={{ textAlign: 'left', fontWeight: 'bold', fontSize: 12, width: '100%' }}
        readOnly
        value={(denom * value).toFixed(2)}
      />
    </div>
  );

  return (
    <div
      className="win-child-window"
      style={{
        width: 396,
        height: 'auto',
        margin: 'auto',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <div className="win-child-titlebar">
        <span>{isEnglish ? 'Denominations' : 'பண மதிப்பு கணக்கு'}</span>
        <button className="win-control-btn" style={{ color: '#B91C1C' }} onClick={onClose}>✕</button>
      </div>

      <div style={{ display: 'flex', flex: 1, padding: '12px 12px 14px 16px', background: '#FFFFFF', gap: 10 }}>
        {/* Left: COUNT + 7 denomination rows + Coins + Total */}
        <div style={{ flex: 1 }}>
          {/* COUNT row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, paddingLeft: 66 }}>
            <b style={{ color: '#000000', fontSize: 12 }}>COUNT :</b>
            <input
              type="text"
              className="win-input-barcode-yellow"
              style={{ width: 104, fontSize: 12, fontWeight: 'bold', backgroundColor: '#FFFFC0' }}
              value={countVal}
              onChange={e => setCountVal(e.target.value)}
            />
          </div>

          {/* 2000, 500, 100, 50, 20, 10, 5 */}
          {DENOMS.map(d =>
            denomRow(d, counts[d] || 0, v => setCounts(p => ({ ...p, [d]: v })))
          )}

          {/* Coins row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '64px 54px 14px 104px',
              alignItems: 'center',
              gap: 4,
              marginTop: 6,
              marginBottom: 8
            }}
          >
            <span style={{ gridColumn: '1 / 4', textAlign: 'right', fontSize: 12, fontWeight: 'bold', color: '#CC0000', paddingRight: 4 }}>
              Coins -
            </span>
            <input
              type="text"
              className="win-input-classic"
              style={{ textAlign: 'left', fontWeight: 'bold', fontSize: 12, width: '100%' }}
              value={coins}
              onChange={e => setCoins(e.target.value)}
            />
          </div>

          {/* Total row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '64px 54px 14px 104px',
              alignItems: 'center',
              gap: 4,
              marginTop: 4
            }}
          >
            <span
              style={{
                gridColumn: '1 / 4',
                textAlign: 'right',
                fontWeight: 'bold',
                fontSize: 12.5,
                color: '#CC0000',
                paddingRight: 4
              }}
            >
              Total :
            </span>
            <input
              type="text"
              className="win-input-classic"
              style={{
                textAlign: 'left',
                fontWeight: 'bold',
                fontSize: 12,
                color: '#000000',
                width: '100%'
              }}
              readOnly
              value={total.toFixed(2)}
            />
          </div>
        </div>

        {/* Right: Save / Exit / Paid In/Outs buttons */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            paddingTop: 34,
            width: 82
          }}
        >
          <button
            className="win-btn-classic"
            style={{ height: 32, fontWeight: 'bold', width: '100%', background: '#FAD4D4', fontSize: 12 }}
            onClick={handleSave}
          >
            Save
          </button>
          <button
            className="win-btn-classic"
            style={{ height: 32, fontWeight: 'bold', width: '100%', background: '#FAD4D4', fontSize: 12 }}
            onClick={onClose}
          >
            Exit
          </button>
          <button
            className="win-btn-classic"
            style={{ height: 42, fontWeight: 'bold', width: '100%', background: '#FAD4D4', fontSize: 11.5, whiteSpace: 'normal', lineHeight: 1.25 }}
            onClick={() => {
              if (onOpenPaidInOut) {
                onOpenPaidInOut();
              }
            }}
          >
            Paid<br />In/Outs
          </button>
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
   4b. PAID IN / PAID OUT (Slide 8 / image11.jpeg)
   ============================================================================ */
interface PaidInOutRecord {
  code: string;
  date: string;
  partyName: string;
  amount: string;
  type: 'PAID OUT' | 'PAID IN';
  info: string;
}

const today = () => {
  const d = new Date();
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
};

export const PaidInOutScreen: React.FC<MasterScreenProps> = ({ onClose, isEnglish }) => {
  const [tab, setTab] = useState<'info' | 'list'>('info');
  const [records, setRecords] = useState<PaidInOutRecord[]>([
    { code: 'S1', date: '22/08/2018', partyName: 'Vanigam', amount: '1000.00', type: 'PAID OUT', info: '' }
  ]);
  const [current, setCurrent] = useState<PaidInOutRecord>({ ...records[0] });

  const handleNew = useCallback(() => {
    const nextCode = `S${records.length + 1}`;
    const rec: PaidInOutRecord = {
      code: nextCode,
      date: today(),
      partyName: '',
      amount: '0.00',
      type: 'PAID OUT',
      info: ''
    };
    setCurrent(rec);
    setTab('info');
  }, [records.length]);

  const handleSave = useCallback(() => {
    if (!current.partyName.trim()) {
      alert(isEnglish ? 'Please enter Party Name.' : 'தரப்பு பெயரை உள்ளிடவும்.');
      return;
    }
    setRecords(prev => {
      const idx = prev.findIndex(r => r.code === current.code);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...current };
        return next;
      }
      return [...prev, { ...current }];
    });
    alert(isEnglish ? 'Saved!' : 'சேமிக்கப்பட்டது!');
  }, [current, isEnglish]);

  const handleDelete = useCallback(() => {
    if (!current.code) return;
    if (!window.confirm(isEnglish ? `Delete record ${current.code}?` : `${current.code} நீக்கவா?`)) return;
    setRecords(prev => {
      const next = prev.filter(r => r.code !== current.code);
      return next;
    });
    handleNew();
  }, [current, isEnglish, handleNew]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === 'n') { e.preventDefault(); handleNew(); }
      else if (e.ctrlKey && e.key.toLowerCase() === 's') { e.preventDefault(); handleSave(); }
      else if (e.ctrlKey && e.key.toLowerCase() === 'x') { e.preventDefault(); handleDelete(); }
      else if (e.key === 'Escape') { e.preventDefault(); onClose(); }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleNew, handleSave, handleDelete, onClose]);

  return (
    <div className="win-child-window" style={{ width: 560, height: 360, margin: 'auto' }}>
      <div className="win-child-titlebar">
        <span>{isEnglish ? 'PAID IN - PAID OUT' : 'வரவு - செலவு'}</span>
        <button className="win-control-btn" style={{ color: '#B91C1C' }} onClick={onClose}>✕</button>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '8px 12px', background: '#ECE9D8' }}>
        {/* Header: Title + New/Save/Delete buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ fontSize: 18, fontWeight: 'bold', color: '#CC0000' }}>
            {isEnglish ? 'PAID IN - PAID OUT' : 'வரவு - செலவு'}
          </span>
          <div className="action-buttons-box">
            <div className="action-btn" title="New (Ctrl+N)" onClick={handleNew}>
              <span style={{ fontSize: 13 }}>📄</span>
              <span className={isEnglish ? 'action-btn-label-en' : 'action-btn-label-ta'}>
                {isEnglish ? 'New' : 'சேர்ப்பு'}
              </span>
            </div>
            <div className="action-btn" title="Save (Ctrl+S)" onClick={handleSave}>
              <span style={{ fontSize: 13 }}>💾</span>
              <span className={isEnglish ? 'action-btn-label-en' : 'action-btn-label-ta'}>
                {isEnglish ? 'Save' : 'பதிவு'}
              </span>
            </div>
            <div className="action-btn" title="Delete (Ctrl+X)" onClick={handleDelete}>
              <span style={{ fontSize: 13, color: '#DC2626' }}>▲</span>
              <span className={isEnglish ? 'action-btn-label-en' : 'action-btn-label-ta'}>
                {isEnglish ? 'Delete' : 'நீக்கு'}
              </span>
            </div>
          </div>
        </div>

        {/* Classic Tabs: Information | List */}
        <div className="win-tabs-container">
          <div
            className={`win-tab ${tab === 'info' ? 'active' : ''}`}
            style={{ color: '#800000', flex: 1, textAlign: 'center' }}
            onClick={() => setTab('info')}
          >
            {isEnglish ? 'Information' : 'விவரம்'}
          </div>
          <div
            className={`win-tab ${tab === 'list' ? 'active' : ''}`}
            style={{ color: '#800000', flex: 1, textAlign: 'center' }}
            onClick={() => setTab('list')}
          >
            {isEnglish ? 'List' : 'பட்டியல்'}
          </div>
        </div>

        {/* Tab content */}
        <div
          style={{
            flex: 1,
            border: '1px solid #808080',
            borderTop: 'none',
            padding: '12px 18px',
            background: '#ECE9D8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden'
          }}
        >
          {tab === 'info' ? (
            <div style={{ width: '100%', border: '1px solid #A0A0A0', padding: '14px 20px', background: '#ECE9D8' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '95px 1fr',
                  gap: '6px 8px',
                  alignItems: 'center',
                  fontSize: 12
                }}
              >
                <label style={{ fontWeight: 'bold', color: '#000080', textAlign: 'right' }}>Code :</label>
                <input
                  className="win-input-classic"
                  style={{ width: 110 }}
                  value={current.code}
                  onChange={e => setCurrent(p => ({ ...p, code: e.target.value }))}
                />

                <label style={{ fontWeight: 'bold', color: '#000080', textAlign: 'right' }}>Date :</label>
                <input
                  className="win-input-classic"
                  style={{ width: 110 }}
                  value={current.date}
                  onChange={e => setCurrent(p => ({ ...p, date: e.target.value }))}
                />

                <label style={{ fontWeight: 'bold', color: '#000080', textAlign: 'right' }}>Party Name :</label>
                <input
                  className="win-input-classic"
                  style={{ fontWeight: 'bold' }}
                  value={current.partyName}
                  onChange={e => setCurrent(p => ({ ...p, partyName: e.target.value }))}
                />

                <label style={{ fontWeight: 'bold', color: '#000080', textAlign: 'right' }}>Amount :</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input
                    className="win-input-classic"
                    style={{ width: 110, textAlign: 'left', fontWeight: 'bold' }}
                    value={current.amount}
                    onChange={e => setCurrent(p => ({ ...p, amount: e.target.value }))}
                  />
                  <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', fontSize: 11.5, fontWeight: 'bold' }}>
                    <input
                      type="radio"
                      name="paidtype"
                      checked={current.type === 'PAID OUT'}
                      onChange={() => setCurrent(p => ({ ...p, type: 'PAID OUT' }))}
                    />
                    PAID OUT
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', fontSize: 11.5, fontWeight: 'bold' }}>
                    <input
                      type="radio"
                      name="paidtype"
                      checked={current.type === 'PAID IN'}
                      onChange={() => setCurrent(p => ({ ...p, type: 'PAID IN' }))}
                    />
                    PAID IN
                  </label>
                </div>

                <label style={{ fontWeight: 'bold', color: '#000080', textAlign: 'right', alignSelf: 'start', paddingTop: 3 }}>Info:</label>
                <textarea
                  className="win-input-classic"
                  rows={2}
                  style={{ height: 42, resize: 'none' }}
                  value={current.info}
                  onChange={e => setCurrent(p => ({ ...p, info: e.target.value }))}
                />
              </div>
            </div>
          ) : (
            <div style={{ width: '100%', height: '100%', background: '#FFFFFF', border: '1px inset #808080', overflowY: 'auto' }}>
              <table className="vanigam-grid">
                <thead>
                  <tr>
                    <th style={{ width: 55 }}>Code</th>
                    <th style={{ width: 90 }}>Date</th>
                    <th>Party Name</th>
                    <th style={{ width: 80, textAlign: 'right' }}>Amount</th>
                    <th style={{ width: 72 }}>Type</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map(r => (
                    <tr
                      key={r.code}
                      style={{ cursor: 'pointer' }}
                      onClick={() => { setCurrent({ ...r }); setTab('info'); }}
                    >
                      <td><b>{r.code}</b></td>
                      <td>{r.date}</td>
                      <td>{r.partyName}</td>
                      <td style={{ textAlign: 'right' }}>{r.amount}</td>
                      <td>{r.type}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Bottom shortcut legend */}
        <div style={{ marginTop: 5, fontSize: 11, fontWeight: 'bold', color: '#6B21A8' }}>
          Ctrl + N - New Record &nbsp;&nbsp; Ctrl + S - Save Record &nbsp;&nbsp; Ctrl + X - Delete Record
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
   5. DAY-END CASH REPORT RECEIPT (Slide 9)
   ============================================================================ */
export const DayEndReportScreen: React.FC<MasterScreenProps> = ({ onClose, isEnglish }) => {
  return (
    <div className="win-child-window" style={{ width: 380, height: '90%', margin: 'auto' }}>
      <div className="win-child-titlebar">
        <span>{isEnglish ? 'DAY END CASH REPORT' : 'நாள் இறுதி பண அறிக்கை'}</span>
        <button className="win-control-btn" style={{ color: '#B91C1C' }} onClick={onClose}>✕</button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', background: '#FFF', margin: 8, padding: 12, border: '1px solid #808080', fontFamily: "'Courier New', monospace", fontSize: 11.5, lineHeight: 1.3 }}>
        <div style={{ fontWeight: 'bold', fontSize: 14 }}>DAYEND REPORT &nbsp; 2</div>
        <div style={{ fontWeight: 'bold' }}>ADMIN &nbsp;&nbsp; {new Date().toLocaleDateString('en-GB')}</div>
        <div style={{ textAlign: 'center', marginTop: 4 }}>Credit Bills</div>
        <div>--------------------------------------</div>
        <div>Bill No Customer Name &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Amount</div>
        <div>--------------------------------------</div>
        <div>SI13 &nbsp;&nbsp;&nbsp; Barakah &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 150.00</div>
        <div>--------------------------------------</div>
        <div>Total Credit Sales - &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 150.00</div>
        <div>--------------------------------------</div>
        <div style={{ textAlign: 'center', marginTop: 6 }}>Credit Card Bills</div>
        <div>--------------------------------------</div>
        <div>SI14 &nbsp;&nbsp;&nbsp; CASH &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 23.00</div>
        <div>--------------------------------------</div>
        <div>Total Card Sales &nbsp; - &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 23.00</div>
        <div style={{ marginTop: 8, fontWeight: 'bold' }}>DAY END CASH REPORT</div>
        <div>--------------------------------------</div>
        <div>S A L E S &nbsp;&nbsp; S U M M A R Y</div>
        <div>--------------------------------------</div>
        <div>Cash Sales &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; - &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 5.00</div>
        <div>Credit Sales &nbsp;&nbsp;&nbsp; - &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 150.00</div>
        <div>Card Sales &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; - &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 23.00</div>
        <div>--------------------------------------</div>
        <div><b>Total Sales &nbsp;&nbsp;&nbsp;&nbsp; - &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 178.00</b></div>
        <div style={{ marginTop: 8, fontWeight: 'bold' }}>CASH ON HAND</div>
        <div>Rs.2000 &nbsp;&nbsp;&nbsp; 1 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 2000.00</div>
        <div>Rs. 500 &nbsp;&nbsp;&nbsp; 2 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 1000.00</div>
        <div>Rs. 100 &nbsp;&nbsp; 20 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 2000.00</div>
        <div>Rs. &nbsp;50 &nbsp; 110 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 5500.00</div>
        <div>Rs. &nbsp;10 &nbsp;&nbsp; 50 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 500.00</div>
        <div>--------------------------------------</div>
        <div><b>C A S H &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 11000.00</b></div>
        <div style={{ marginTop: 8, fontWeight: 'bold' }}>D A Y &nbsp; E N D &nbsp; S U M M A R Y</div>
        <div>**************************************</div>
        <div>Cash Sales(+) &nbsp;&nbsp;&nbsp; - &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 5.00</div>
        <div>Cash Returns(-) &nbsp; - &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 25.00</div>
        <div>Total Amount &nbsp;&nbsp;&nbsp;&nbsp; - &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; -20.00</div>
        <div>Cash on Hand &nbsp;&nbsp;&nbsp;&nbsp; - &nbsp;&nbsp;&nbsp; 11000.00</div>
        <div><b>Excess Amount &nbsp;&nbsp;&nbsp; - &nbsp;&nbsp;&nbsp; 11020.00</b></div>
        <div>**************************************</div>
      </div>
      <div style={{ padding: 6, background: '#ECE9D8', display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
        <button className="win-btn-classic" style={{ width: 80, fontWeight: 'bold' }} onClick={() => window.print()}>
          {isEnglish ? 'Print' : 'அச்சிடு'}
        </button>
        <button className="win-btn-classic" style={{ width: 70 }} onClick={onClose}>
          {isEnglish ? 'Close' : 'மூடு'}
        </button>
      </div>
    </div>
  );
};

/* ============================================================================
   6. ADDITIONAL MASTERS & FILE SCREENS (Slides 5, 8, 20, 23)
   ============================================================================ */
export const GenericMasterUtilityScreen: React.FC<MasterScreenProps & { moduleId: string }> = ({ onClose, isEnglish, moduleId }) => {
  const meta: Record<string, { en: string; ta: string; codeLabel: string; nameLabel: string; defCode: string; defName: string }> = {
    user_master: { en: 'USER INFORMATION', ta: 'பயனர் விவரம்', codeLabel: 'User Name', nameLabel: 'User Level', defCode: 'ADMIN', defName: 'Administrator' },
    config: { en: 'USER CONFIGURATION', ta: 'பயனர் அமைப்பு', codeLabel: 'Profile', nameLabel: 'Access', defCode: 'ADMIN', defName: 'Full Masters / Billing / Reports' },
    paid_in_out: { en: 'PAID IN / PAID OUT', ta: 'வரவு / செலவு', codeLabel: 'Voucher Code', nameLabel: 'Party / Reason', defCode: 'S1', defName: 'Petty Cash' },
    supplier_master: { en: 'SUPPLIER INFORMATION', ta: 'விநியோகஸ்தர் தகவல்', codeLabel: 'Supplier Code', nameLabel: 'Supplier Name', defCode: 'S1', defName: 'BARAKAH TRADERS' },
    tax_master: { en: 'TAX INFORMATION', ta: 'வரி விவரம்', codeLabel: 'Tax Code', nameLabel: 'GST Slab', defCode: 'T1', defName: 'GST 5% (CGST 2.5% + SGST 2.5%)' },
    barcode_gen: { en: 'BARCODE GENERATOR', ta: 'பார்கோடு உருவாக்கி', codeLabel: 'Product Code', nameLabel: 'Label Text', defCode: '2611', defName: 'SUGAR 2KG - ₹90.00' }
  };
  const info = meta[moduleId] || meta.tax_master;
  const [f1, setF1] = useState(info.defCode);
  const [f2, setF2] = useState(info.defName);

  return (
    <div className="win-child-window" style={{ width: 580, height: 340, margin: 'auto' }}>
      <div className="win-child-titlebar">
        <span>{isEnglish ? info.en : info.ta}</span>
        <button className="win-control-btn" style={{ color: '#B91C1C' }} onClick={onClose}>✕</button>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 12, background: '#ECE9D8' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontSize: 18, fontWeight: 'bold', color: '#CC0000' }}>{isEnglish ? info.en : info.ta}</span>
          <div className="action-buttons-box">
            <div className="action-btn" onClick={() => { setF1(''); setF2(''); }}>
              <span style={{ fontSize: 13 }}>📄</span>
              <span className={isEnglish ? 'action-btn-label-en' : 'action-btn-label-ta'}>{isEnglish ? 'New' : 'சேர்ப்பு'}</span>
            </div>
            <div className="action-btn" onClick={() => alert(isEnglish ? 'Saved!' : 'சேமிக்கப்பட்டது!')}>
              <span style={{ fontSize: 13 }}>💾</span>
              <span className={isEnglish ? 'action-btn-label-en' : 'action-btn-label-ta'}>{isEnglish ? 'Save' : 'பதிவு'}</span>
            </div>
            <div className="action-btn" onClick={() => window.print()}>
              <span style={{ fontSize: 13 }}>🖨</span>
              <span className={isEnglish ? 'action-btn-label-en' : 'action-btn-label-ta'}>{isEnglish ? 'Print' : 'அச்சிடு'}</span>
            </div>
            <div className="action-btn" onClick={onClose}>
              <span style={{ fontSize: 13, color: '#B91C1C' }}>🛑</span>
              <span className={isEnglish ? 'action-btn-label-en' : 'action-btn-label-ta'}>{isEnglish ? 'Close' : 'முற்றும்'}</span>
            </div>
          </div>
        </div>
        <div style={{ flex: 1, border: '1px solid #808080', padding: 18, display: 'grid', gridTemplateColumns: '120px 1fr', gap: 10, alignItems: 'center', alignContent: 'center', fontSize: 12 }}>
          <b style={{ color: '#000080', textAlign: 'right' }}>{info.codeLabel}:</b>
          <input className="win-input-classic" value={f1} onChange={e => setF1(e.target.value)} />
          <b style={{ color: '#000080', textAlign: 'right' }}>{info.nameLabel}:</b>
          <input className="win-input-classic" value={f2} onChange={e => setF2(e.target.value)} />
        </div>
      </div>
    </div>
  );
};
