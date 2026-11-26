import React, { useState } from 'react';
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
  const [categories, setCategories] = useState([
    { code: '61', name: 'OIL', points: 0 },
    { code: '12', name: 'SPICES & MASALA', points: 1 },
    { code: '15', name: 'PULSES & DHAL', points: 1 },
    { code: '24', name: 'SHAMPOOS', points: 2 }
  ]);

  const handleSave = () => {
    setCategories(prev => {
      const idx = prev.findIndex(c => c.code === code);
      const item = { code, name, points: parseInt(points) || 0 };
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = item;
        return next;
      }
      return [...prev, item];
    });
    alert(isEnglish ? 'Category saved!' : 'பிரிவு சேமிக்கப்பட்டது!');
  };

  return (
    <div className="win-child-window" style={{ width: 640, height: 420, margin: 'auto' }}>
      <div className="win-child-titlebar">
        <span>{isEnglish ? 'CATEGORY INFORMATION' : 'பொருள் பிரிவு விவரம்'}</span>
        <button className="win-control-btn" style={{ color: '#B91C1C' }} onClick={onClose}>✕</button>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 10, background: '#ECE9D8' }}>
        {/* Header + 4 Toolbar Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <div style={{ fontSize: 18, fontWeight: 'bold', color: '#CC0000' }}>
            {isEnglish ? 'CATEGORY INFORMATION' : 'பொருள் பிரிவு விவரம்'}
          </div>
          <div className="action-buttons-box">
            <div className="action-btn" onClick={() => { setCode(''); setName(''); setPoints('0'); }}>
              <span style={{ fontSize: 14 }}>📄</span>
              <span className={isEnglish ? 'action-btn-label-en' : 'action-btn-label-ta'}>{isEnglish ? 'New' : 'சேர்ப்பு'}</span>
            </div>
            <div className="action-btn" onClick={handleSave}>
              <span style={{ fontSize: 14 }}>💾</span>
              <span className={isEnglish ? 'action-btn-label-en' : 'action-btn-label-ta'}>{isEnglish ? 'Save' : 'பதிவு'}</span>
            </div>
            <div className="action-btn" onClick={() => window.print()}>
              <span style={{ fontSize: 14 }}>🖨</span>
              <span className={isEnglish ? 'action-btn-label-en' : 'action-btn-label-ta'}>{isEnglish ? 'Print' : 'அச்சிடு'}</span>
            </div>
            <div className="action-btn" onClick={onClose}>
              <span style={{ fontSize: 14, color: '#B91C1C' }}>🛑</span>
              <span className={isEnglish ? 'action-btn-label-en' : 'action-btn-label-ta'}>{isEnglish ? 'Close' : 'முற்றும்'}</span>
            </div>
          </div>
        </div>

        <div className="win-tabs-container">
          <div className={`win-tab ${tab === 'info' ? 'active' : ''}`} onClick={() => setTab('info')}>
            {isEnglish ? 'Category Information' : 'பிரிவு விவரம்'}
          </div>
          <div className={`win-tab ${tab === 'list' ? 'active' : ''}`} onClick={() => setTab('list')}>
            {isEnglish ? 'Category List' : 'பிரிவு பட்டியல்'}
          </div>
        </div>

        <div style={{ flex: 1, border: '1px solid #808080', borderTop: 'none', padding: 18, background: '#ECE9D8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {tab === 'info' ? (
            <div style={{ border: '1px solid #808080', padding: '24px 36px', background: '#ECE9D8', width: 420 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: 10, alignItems: 'center', fontSize: 11.5 }}>
                <label style={{ fontWeight: 'bold', color: '#000080', textAlign: 'right' }}>{isEnglish ? 'Category Code' : 'பிரிவு எண்'}</label>
                <input type="text" className="win-input-classic" style={{ width: 90 }} value={code} onChange={e => setCode(e.target.value)} />

                <label style={{ fontWeight: 'bold', color: '#000080', textAlign: 'right' }}>{isEnglish ? 'Category Name' : 'பிரிவு பெயர்'}</label>
                <input type="text" className="win-input-classic" style={{ fontWeight: 'bold' }} value={name} onChange={e => setName(e.target.value)} />

                <label style={{ fontWeight: 'bold', color: '#000', textAlign: 'right' }}>{isEnglish ? 'Reward Points' : 'புள்ளிகள்'}</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <input type="text" className="win-input-classic" style={{ width: 90 }} value={points} onChange={e => setPoints(e.target.value)} />
                  <span style={{ fontWeight: 'bold' }}>Per 100Rs.</span>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ width: '100%', height: '100%', background: '#808080', border: '1px inset #808080', overflowY: 'auto' }}>
              <table className="vanigam-grid">
                <thead>
                  <tr>
                    <th style={{ width: 80 }}>Code</th>
                    <th>Category Name</th>
                    <th style={{ width: 100, textAlign: 'right' }}>Points</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map(c => (
                    <tr key={c.code} onClick={() => { setCode(c.code); setName(c.name); setPoints(String(c.points)); setTab('info'); }} style={{ cursor: 'pointer' }}>
                      <td><b>{c.code}</b></td>
                      <td>{c.name}</td>
                      <td style={{ textAlign: 'right' }}>{c.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
export const ProductMasterScreen: React.FC<MasterScreenProps> = ({ onClose, isEnglish }) => {
  const [tab, setTab] = useState<'details' | 'list'>('details');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [showTamilPalette, setShowTamilPalette] = useState(false);

  const prod = SEED_PRODUCTS[selectedIdx] || SEED_PRODUCTS[0];
  const [prodCode, setProdCode] = useState(prod.code);
  const [prodName, setProdName] = useState(prod.name);
  const [tamilName, setTamilName] = useState(prod.tamilName);
  const [mrp, setMrp] = useState(prod.mrp.toFixed(2));
  const [rate, setRate] = useState(prod.rate.toFixed(2));
  const [wRate, setWRate] = useState((prod.wholesaleRate || 0).toFixed(2));
  const [unit, setUnit] = useState(prod.unit);
  const [isDec, setIsDec] = useState(prod.isDecimal);
  const [isWm, setIsWm] = useState(prod.isWeighingMachine);

  const loadProduct = (idx: number) => {
    const p = SEED_PRODUCTS[idx];
    if (!p) return;
    setSelectedIdx(idx);
    setProdCode(p.code);
    setProdName(p.name);
    setTamilName(p.tamilName);
    setMrp(p.mrp.toFixed(2));
    setRate(p.rate.toFixed(2));
    setWRate((p.wholesaleRate || 0).toFixed(2));
    setUnit(p.unit);
    setIsDec(p.isDecimal);
    setIsWm(p.isWeighingMachine);
  };

  const TAMIL_CHARS = ['க', 'ச', 'ட', 'த', 'ப', 'ற', 'ங', 'ஞ', 'ண', 'ந', 'ம', 'ன', 'ய', 'ர', 'ல', 'வ', 'ழ', 'ள', 'அ', 'ஸ'];

  return (
    <div className="win-child-window" style={{ position: 'relative' }}>
      <div className="win-child-titlebar">
        <span>{isEnglish ? 'PRODUCT INFORMATION' : 'பொருள் விவரம்'}</span>
        <button className="win-control-btn" style={{ color: '#B91C1C' }} onClick={onClose}>✕</button>
      </div>

      {/* Slide 15 Tamil Virtual Keyboard Overlay */}
      {showTamilPalette && (
        <div style={{
          position: 'absolute', left: 20, top: 80, zIndex: 500, width: 210,
          background: '#ECE9D8', border: '2px outset #FFF', boxShadow: '2px 2px 6px rgba(0,0,0,0.4)', padding: 6
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: 4, fontSize: 11 }}>
            <span style={{ color: '#800000' }}>தமிழ் எழுத்துக்கள்</span>
            <button className="win-control-btn" onClick={() => setShowTamilPalette(false)}>✕</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 3 }}>
            {TAMIL_CHARS.map(ch => (
              <button
                key={ch}
                className="win-btn-classic"
                style={{ fontFamily: "'Noto Sans Tamil', sans-serif", fontWeight: 'bold' }}
                onClick={() => setTamilName(prev => prev + ch)}
              >
                {ch}
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '6px 10px', background: '#ECE9D8', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: 18, fontWeight: 'bold', color: '#CC0000' }}>
              {isEnglish ? 'PRODUCT INFORMATION' : 'பொருள் தகவல்'}
            </span>
            <span style={{ marginLeft: 30, fontSize: 11, fontWeight: 'bold', color: '#800000' }}>F2-BARCODE</span>
          </div>

          <div className="action-buttons-box">
            <div className="action-btn" onClick={() => { setProdCode(''); setProdName(''); setTamilName(''); }}>
              <span style={{ fontSize: 13 }}>📄</span>
              <span className={isEnglish ? 'action-btn-label-en' : 'action-btn-label-ta'}>{isEnglish ? 'New' : 'சேர்ப்பு'}</span>
            </div>
            <div className="action-btn" onClick={() => alert(isEnglish ? 'Product saved!' : 'சேமிக்கப்பட்டது!')}>
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
            <div className="action-btn" onClick={() => setShowTamilPalette(prev => !prev)}>
              <span style={{ fontSize: 13 }}>🎨</span>
              <span className={isEnglish ? 'action-btn-label-en' : 'action-btn-label-ta'}>{isEnglish ? 'Letters' : 'எழுத்து'}</span>
            </div>
          </div>
        </div>

        <div className="win-tabs-container">
          <div className={`win-tab ${tab === 'details' ? 'active' : ''}`} onClick={() => setTab('details')}>
            {isEnglish ? 'Product Details' : 'பொருள் விவரம்'}
          </div>
          <div className={`win-tab ${tab === 'list' ? 'active' : ''}`} onClick={() => setTab('list')}>
            {isEnglish ? 'Product List' : 'பொருள் பட்டியல்'}
          </div>
        </div>

        {tab === 'details' ? (
          <div style={{ flex: 1, border: '1px solid #808080', borderTop: 'none', padding: 8, background: '#ECE9D8', overflowY: 'auto' }}>
            {/* Nav arrows */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}>
              <div className="nav-btn-group">
                <div className="nav-btn-col"><button className="nav-btn" onClick={() => loadProduct(0)}>|&lt;</button></div>
                <div className="nav-btn-col"><button className="nav-btn" onClick={() => loadProduct(Math.max(0, selectedIdx - 1))}>&lt;&lt;</button><span className="nav-btn-subtext">F8</span></div>
                <div className="nav-btn-col"><button className="nav-btn" onClick={() => loadProduct(Math.min(SEED_PRODUCTS.length - 1, selectedIdx + 1))}>&gt;&gt;</button><span className="nav-btn-subtext">F7</span></div>
                <div className="nav-btn-col"><button className="nav-btn" onClick={() => loadProduct(SEED_PRODUCTS.length - 1)}>&gt;|</button></div>
              </div>
            </div>

            {/* Tax row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 6, fontSize: 11 }}>
              <div>
                <div style={{ color: '#800000', fontWeight: 'bold' }}>{isEnglish ? 'Sales Tax :' : 'விற்பனை வரி :'}</div>
                <select className="win-input-classic" style={{ width: '100%' }}>
                  <option>T1 - 5% GST</option>
                  <option>T0 - NON TAXABLE ITEMS</option>
                </select>
              </div>
              <div>
                <div style={{ color: '#800000', fontWeight: 'bold' }}>{isEnglish ? 'Purchase Tax :' : 'கொள்முதல் வரி :'}</div>
                <select className="win-input-classic" style={{ width: '100%' }}>
                  <option>T1 - 5% GST</option>
                  <option>T0 - NON TAXABLE ITEMS</option>
                </select>
              </div>
            </div>

            {/* Main details 2-col */}
            <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 14, fontSize: 11 }}>
              {/* Left Column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', alignItems: 'center', gap: 4 }}>
                  <label style={{ color: '#000080', fontWeight: 'bold', textAlign: 'right' }}>{isEnglish ? 'Product Code' : 'குறியீடு'}</label>
                  <input type="text" className="win-input-classic" value={prodCode} onChange={e => setProdCode(e.target.value)} />

                  <label style={{ color: '#000080', fontWeight: 'bold', textAlign: 'right' }}>{isEnglish ? 'Product Name' : 'பெயர்'}</label>
                  <input type="text" className="win-input-classic" style={{ fontWeight: 'bold' }} value={prodName} onChange={e => setProdName(e.target.value)} />

                  <label style={{ color: '#000080', fontWeight: 'bold', textAlign: 'right' }}>{isEnglish ? 'Product Category' : 'பிரிவு'}</label>
                  <select className="win-input-classic"><option>GROCERIES &amp; SPICES</option><option>SHAMPOOS</option></select>

                  <label style={{ color: '#000080', fontWeight: 'bold', textAlign: 'right' }}>{isEnglish ? 'Product Unit' : 'அலகு'}</label>
                  <select className="win-input-classic" value={unit} onChange={e => setUnit(e.target.value)}>
                    <option value="Kg">Kg</option><option value="Nos">Nos</option>
                  </select>

                  <label style={{ color: '#000080', fontWeight: 'bold', textAlign: 'right' }}>{isEnglish ? 'Opening Stock' : 'ஆரம்ப இருப்பு'}</label>
                  <input type="text" className="win-input-classic" value={prod.currentStock} readOnly />

                  <label style={{ color: '#000080', fontWeight: 'bold', textAlign: 'right' }}>MRP</label>
                  <input type="text" className="win-input-classic" value={mrp} onChange={e => setMrp(e.target.value)} />

                  <label style={{ color: '#000080', fontWeight: 'bold', textAlign: 'right' }}>{isEnglish ? 'Retail Rate' : 'விற்பனை விலை'}</label>
                  <input type="text" className="win-input-classic" style={{ fontWeight: 'bold' }} value={rate} onChange={e => setRate(e.target.value)} />

                  <label style={{ color: '#000080', fontWeight: 'bold', textAlign: 'right' }}>{isEnglish ? 'W Rate' : 'மொத்த விலை'}</label>
                  <input type="text" className="win-input-classic" value={wRate} onChange={e => setWRate(e.target.value)} />

                  <label style={{ color: '#800000', fontWeight: 'bold', textAlign: 'right' }}>{isEnglish ? 'Reorder Level' : 'குறைந்த அளவு'}</label>
                  <input type="text" className="win-input-classic" defaultValue="3.00" />
                </div>
              </div>

              {/* Right Column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', alignItems: 'center', gap: 4 }}>
                  <label style={{ color: '#800000', fontWeight: 'bold' }}>பொருட்பெயர்</label>
                  <input type="text" className="win-input-classic" style={{ fontFamily: "'Noto Sans Tamil', sans-serif", fontWeight: 'bold' }} value={tamilName} onChange={e => setTamilName(e.target.value)} />
                </div>

                <div style={{ display: 'flex', gap: 14, fontWeight: 'bold' }}>
                  <label><input type="checkbox" checked={isDec} onChange={e => setIsDec(e.target.checked)} /> DECIMAL</label>
                  <label><input type="checkbox" /> Rate Alter</label>
                  <label><input type="checkbox" checked={isWm} onChange={e => setIsWm(e.target.checked)} /> WMACHINE</label>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', alignItems: 'center', gap: 4 }}>
                  <label style={{ color: '#800000', fontWeight: 'bold' }}>{isEnglish ? 'Supplier :' : 'விநியோகஸ்தர் :'}</label>
                  <select className="win-input-classic"><option>CASH - F1</option><option>BARAKAH - S1</option></select>
                  <label style={{ color: '#000080', fontWeight: 'bold' }}>HSN CODE :</label>
                  <input type="text" className="win-input-classic" defaultValue="0910" />
                </div>

                {/* Multi-Barcode Subgrid matching Slide 14 */}
                <div style={{ marginTop: 4, border: '1px inset #808080', background: '#808080', flex: 1 }}>
                  <table className="vanigam-grid">
                    <thead>
                      <tr>
                        <th>BARCODE</th>
                        <th style={{ textAlign: 'right' }}>PRATE</th>
                        <th style={{ textAlign: 'right' }}>MRP</th>
                        <th style={{ textAlign: 'right' }}>RATE</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><b>{prod.barcode}</b></td>
                        <td style={{ textAlign: 'right' }}>{(prod.wholesaleRate || prod.rate).toFixed(2)}</td>
                        <td style={{ textAlign: 'right' }}>{prod.mrp.toFixed(2)}</td>
                        <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{prod.rate.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ flex: 1, border: '1px inset #808080', background: '#808080', overflowY: 'auto' }}>
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
                {SEED_PRODUCTS.map((p, i) => (
                  <tr key={p.id} onClick={() => { loadProduct(i); setTab('details'); }} style={{ cursor: 'pointer' }}>
                    <td><b>{p.code}</b></td>
                    <td>{p.name}</td>
                    <td style={{ fontFamily: "'Noto Sans Tamil', sans-serif" }}>{p.tamilName}</td>
                    <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{p.rate.toFixed(2)}</td>
                    <td style={{ textAlign: 'right' }}>{p.currentStock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
   4. DENOMINATIONS (Slide 7)
   ============================================================================ */
export const DenominationScreen: React.FC<MasterScreenProps> = ({ onClose, isEnglish }) => {
  const DENOMS = [2000, 500, 100, 50, 20, 10, 5];
  const [counts, setCounts] = useState<{ [k: number]: number }>({ 2000: 1, 500: 2, 100: 20, 50: 110, 20: 0, 10: 50, 5: 0 });
  const [coins, setCoins] = useState('0.00');

  const total = DENOMS.reduce((sum, d) => sum + d * (counts[d] || 0), 0) + (parseFloat(coins) || 0);

  return (
    <div className="win-child-window" style={{ width: 440, height: 340, margin: 'auto' }}>
      <div className="win-child-titlebar">
        <span>{isEnglish ? 'Denominations' : 'பண மதிப்பு கணக்கு'}</span>
        <button className="win-control-btn" style={{ color: '#B91C1C' }} onClick={onClose}>✕</button>
      </div>
      <div style={{ flex: 1, padding: 12, background: '#ECE9D8', display: 'grid', gridTemplateColumns: '1fr 110px', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <b style={{ color: '#800000' }}>COUNT :</b>
            <input type="text" className="win-input-barcode-yellow" style={{ width: 70 }} defaultValue="2" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, fontSize: 11.5 }}>
            {DENOMS.map(d => (
              <div key={d} style={{ display: 'grid', gridTemplateColumns: '50px 18px 60px 18px 1fr', alignItems: 'center', gap: 4 }}>
                <b style={{ textAlign: 'right' }}>{d}</b>
                <span>x</span>
                <input
                  type="number"
                  className="win-input-classic"
                  style={{ textAlign: 'right' }}
                  value={counts[d] || 0}
                  onChange={e => setCounts(prev => ({ ...prev, [d]: parseInt(e.target.value) || 0 }))}
                />
                <span>=</span>
                <input type="text" className="win-input-classic" style={{ textAlign: 'right', fontWeight: 'bold' }} readOnly value={(d * (counts[d] || 0)).toFixed(2)} />
              </div>
            ))}
            <div style={{ display: 'grid', gridTemplateColumns: '50px 18px 60px 18px 1fr', alignItems: 'center', gap: 4 }}>
              <b style={{ textAlign: 'right' }}>Coins</b>
              <span>-</span>
              <input type="text" className="win-input-classic" style={{ textAlign: 'right' }} value={coins} onChange={e => setCoins(e.target.value)} />
              <span></span><span></span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '132px 18px 1fr', alignItems: 'center', gap: 4, marginTop: 4 }}>
              <b style={{ textAlign: 'right', color: '#CC0000' }}>Total :</b>
              <span></span>
              <input type="text" className="win-input-classic" style={{ textAlign: 'right', fontWeight: 'bold', color: '#CC0000' }} readOnly value={total.toFixed(2)} />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 30 }}>
          <button className="win-btn-classic" style={{ height: 26, fontWeight: 'bold' }} onClick={() => { alert(isEnglish ? 'Denomination Saved!' : 'பண மதிப்பு சேமிக்கப்பட்டது!'); onClose(); }}>
            {isEnglish ? 'Save' : 'பதிவு'}
          </button>
          <button className="win-btn-classic" style={{ height: 26 }} onClick={onClose}>
            {isEnglish ? 'Exit' : 'முற்றும்'}
          </button>
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
