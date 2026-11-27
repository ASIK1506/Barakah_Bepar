import React, { useState, useEffect } from 'react';
import { SEED_PRODUCTS, SEED_CUSTOMERS } from '../data/seedData';
import '../styles/classicTheme.css';

interface ScreenProps {
  onClose: () => void;
  isEnglish: boolean;
}

const ToolbarButton: React.FC<{
  icon: string;
  en: string;
  ta: string;
  isEnglish: boolean;
  onClick: () => void;
  color?: string;
}> = ({ icon, en, ta, isEnglish, onClick, color }) => (
  <div className="action-btn" onClick={onClick}>
    <span style={{ fontSize: 13, color }}>{icon}</span>
    <span className={isEnglish ? 'action-btn-label-en' : 'action-btn-label-ta'}>
      {isEnglish ? en : ta}
    </span>
  </div>
);

/* ============================================================================
   1. SALES RETURN (Slide 42 / image43.jpeg)
   ============================================================================ */
export const SalesReturnScreen: React.FC<ScreenProps> = ({ onClose, isEnglish }) => {
  const [tab, setTab] = useState<'info' | 'list'>('info');
  const [returnNo, setReturnNo] = useState('SR1');
  const [returnDate] = useState(() => new Date().toLocaleDateString('en-GB'));
  const [custCode, setCustCode] = useState('C3');
  const [custName, setCustName] = useState('arul');
  const [barcode, setBarcode] = useState('');
  const [rows, setRows] = useState([
    { code: '6311', name: 'F & L PUMP 50G', rate: 102.82, qty: 5, mrp: 106.00, tamil: 'லவ்லி பம்ப் டியுப்(15)50கி', tax: 0, taxP: 0, val: 514.10 },
    { code: '5446', name: 'FA ROLLON', rate: 125.00, qty: 1, mrp: 155.00, tamil: 'பா ரோலான்', tax: 0, taxP: 0, val: 125.00 }
  ]);

  const handleCloseSafe = React.useCallback(() => {
    if (rows.length > 0 && !window.confirm(isEnglish ? 'Close Sales Return? Any unsaved items will be lost.' : 'விற்பனை திரும்பல் திரையை மூடவா? சேமிக்காதவை அழியும்.')) {
      return;
    }
    onClose();
  }, [rows.length, isEnglish, onClose]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') handleCloseSafe(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleCloseSafe]);

  const gross = rows.reduce((s, r) => s + r.val, 0);
  const net = Math.round(gross * 2) / 2;
  const rOff = net - gross;

  const addSample = () => {
    const prod = SEED_PRODUCTS.find(p => p.code === barcode || p.barcode === barcode) || SEED_PRODUCTS[0];
    setRows(prev => [...prev, {
      code: prod.code, name: prod.name, rate: prod.rate, qty: 1,
      mrp: prod.mrp, tamil: prod.tamilName, tax: 0, taxP: 5, val: prod.rate
    }]);
    setBarcode('');
  };

  return (
    <div className="win-child-window maximized">
      <div className="win-child-titlebar">
        <span>{isEnglish ? 'Sales Return' : 'விற்பனை திரும்பல்'}</span>
        <button className="win-control-btn" style={{ color: '#B91C1C' }} onClick={handleCloseSafe}>✕</button>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '4px 8px', background: '#ECE9D8', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <span style={{ fontSize: 20, fontWeight: 'bold', color: '#800000' }}>
              {isEnglish ? 'SALES RETURN' : 'விற்பனை திரும்பல்'}
            </span>
            <span style={{ fontSize: 14, fontWeight: 'bold', color: '#000' }}>Stock - 0</span>
          </div>
          <div className="action-buttons-box">
            <ToolbarButton icon="📄" en="New" ta="சேர்ப்பு" isEnglish={isEnglish} onClick={() => {
              if (rows.length > 0 && !window.confirm(isEnglish ? 'Start a new Sales Return? Current items will be cleared.' : 'புதிய விற்பனை திரும்பல் தொடங்கவா?')) return;
              setRows([]); setReturnNo('SR2');
            }} />
            <ToolbarButton icon="💾" en="Save" ta="பதிவு" isEnglish={isEnglish} onClick={() => { window.barakahFs?.appendTransaction({ type: 'SALES_RETURN', returnNo, custCode, net }); alert(isEnglish ? `Sales Return ${returnNo} saved!` : `விற்பனை திரும்பல் ${returnNo} சேமிக்கப்பட்டது!`); }} />
            <ToolbarButton icon="▲" en="Delete" ta="ரத்து" isEnglish={isEnglish} color="#DC2626" onClick={() => {
              if (rows.length === 0) return;
              if (!window.confirm(isEnglish ? 'Remove the last item from Sales Return?' : 'கடைசிப் பொருளை நீக்கவா?')) return;
              setRows(r => r.slice(0, -1));
            }} />
            <ToolbarButton icon="🖨" en="Print" ta="அச்சிடு" isEnglish={isEnglish} onClick={() => window.print()} />
            <ToolbarButton icon="🛑" en="Close" ta="முற்றும்" isEnglish={isEnglish} color="#B91C1C" onClick={handleCloseSafe} />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 2 }}>
          <div className="win-tabs-container" style={{ flex: 1 }}>
            <div className={`win-tab ${tab === 'info' ? 'active' : ''}`} onClick={() => setTab('info')}>{isEnglish ? 'Sales Info' : 'விவரம்'}</div>
            <div className={`win-tab ${tab === 'list' ? 'active' : ''}`} onClick={() => setTab('list')}>{isEnglish ? 'Sales List' : 'பட்டியல்'}</div>
          </div>
          <div style={{ display: 'flex', gap: 10, fontSize: 11, paddingBottom: 3 }}>
            <label><input type="checkbox" defaultChecked /> BCODE</label>
            <label><input type="checkbox" checked={isEnglish} readOnly /> ENG</label>
            <label><input type="checkbox" /> NAME</label>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '210px 150px 1fr', gap: 10, padding: '6px 4px', borderBottom: '1px solid #808080', alignItems: 'center' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '85px 1fr', gap: 3, fontSize: 11, alignItems: 'center' }}>
            <b style={{ color: '#000080', textAlign: 'right' }}>{isEnglish ? 'Invoice No' : 'பில் எண்'}</b>
            <input className="win-input-classic" value={returnNo} onChange={e => setReturnNo(e.target.value)} />
            <b style={{ color: '#000080', textAlign: 'right' }}>{isEnglish ? 'Invoice Date' : 'தேதி'}</b>
            <input className="win-input-classic" value={returnDate} readOnly />
            <b style={{ color: '#000080', textAlign: 'right' }}>{isEnglish ? 'Customer Code' : 'எண்'}</b>
            <input className="win-input-classic" value={custCode} onChange={e => setCustCode(e.target.value)} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className="nav-btn-group">
              <div className="nav-btn-col"><button className="nav-btn">|&lt;</button></div>
              <div className="nav-btn-col"><button className="nav-btn">&lt;&lt;</button><span className="nav-btn-subtext">F8</span></div>
              <div className="nav-btn-col"><button className="nav-btn">&gt;&gt;</button><span className="nav-btn-subtext">F7</span></div>
              <div className="nav-btn-col"><button className="nav-btn">&gt;|</button></div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: 3, fontSize: 11, alignItems: 'center' }}>
            <b style={{ color: '#000080', textAlign: 'right' }}>{isEnglish ? 'Customer Name' : 'வாடிக்கையாளர்'}</b>
            <input className="win-input-classic" value={custName} onChange={e => setCustName(e.target.value)} />
            <b style={{ color: '#800000', textAlign: 'right' }}>{isEnglish ? 'Balance' : 'பாக்கி'}</b>
            <input className="win-input-classic" style={{ width: 120, color: '#000080' }} defaultValue="-500.00" />
          </div>
        </div>

        <div style={{ padding: '4px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <b style={{ color: '#800000' }}>{isEnglish ? 'Barcode :' : 'பார்கோடு :'}</b>
          <input
            className="win-input-barcode-yellow"
            style={{ width: 200 }}
            value={barcode}
            onChange={e => setBarcode(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') addSample(); }}
            placeholder={isEnglish ? 'Scan or Enter...' : 'ஸ்கேன் செய்யவும்...'}
          />
          <button className="win-btn-classic" onClick={addSample}>{isEnglish ? '+ Add Return Item' : '+ சேர்'}</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', background: '#808080', border: '1px inset #808080' }}>
          <table className="vanigam-grid">
            <thead>
              <tr>
                <th style={{ width: 65 }}>{isEnglish ? 'Code' : 'எண்'}</th>
                <th>{isEnglish ? 'Product Name' : 'பொருள் பெயர்'}</th>
                <th style={{ width: 80, textAlign: 'right' }}>{isEnglish ? 'Rate' : 'விலை'}</th>
                <th style={{ width: 55, textAlign: 'right' }}>{isEnglish ? 'Qty' : 'அளவு'}</th>
                <th style={{ width: 70, textAlign: 'right' }}>Mrp</th>
                <th>{isEnglish ? 'Tamil Name' : 'பொருட்பெயர்'}</th>
                <th style={{ width: 65, textAlign: 'right' }}>{isEnglish ? 'Tax' : 'வரி'}</th>
                <th style={{ width: 55, textAlign: 'right' }}>Tax%</th>
                <th style={{ width: 85, textAlign: 'right' }}>{isEnglish ? 'Value' : 'தொகை'}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td><b>{r.code}</b></td>
                  <td><b>{r.name}</b></td>
                  <td style={{ textAlign: 'right' }}>{r.rate.toFixed(2)}</td>
                  <td style={{ textAlign: 'right' }}>{r.qty}</td>
                  <td style={{ textAlign: 'right' }}>{r.mrp.toFixed(2)}</td>
                  <td style={{ fontFamily: "'Noto Sans Tamil', sans-serif" }}>{r.tamil}</td>
                  <td style={{ textAlign: 'right' }}>{r.tax.toFixed(2)}</td>
                  <td style={{ textAlign: 'right' }}>{r.taxP.toFixed(2)}</td>
                  <td style={{ textAlign: 'right', fontWeight: 'bold', color: '#CC0000' }}>{r.val.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', gap: 6, padding: '4px 0', alignItems: 'flex-end' }}>
          <div className="pos-summary-cell" style={{ width: 50 }}><span className="pos-summary-label">{isEnglish ? 'Items' : 'எண்'}</span><div className="pos-summary-value">{rows.length}</div></div>
          <div className="pos-summary-cell" style={{ width: 80 }}><span className="pos-summary-label">{isEnglish ? 'Gross Amt' : 'மொ.தொகை'}</span><div className="pos-summary-value">{gross.toFixed(2)}</div></div>
          <div className="pos-summary-cell" style={{ width: 60 }}><span className="pos-summary-label">{isEnglish ? 'ROff' : 'ரவுண்ட்'}</span><div className="pos-summary-value">{rOff.toFixed(2)}</div></div>
          <div className="pos-summary-cell" style={{ width: 85 }}><span className="pos-summary-label">{isEnglish ? 'Nett Amt' : 'நிகர தொகை'}</span><div className="pos-summary-value">{net.toFixed(2)}</div></div>
          <div className="pos-summary-cell" style={{ width: 85 }}><span className="pos-summary-label" style={{ color: '#CC0000' }}>{isEnglish ? 'Paid Amt' : 'செலுத்தியது'}</span><div className="pos-summary-value" style={{ color: '#CC0000' }}>{net.toFixed(2)}</div></div>
        </div>
        <div style={{ fontSize: 10.5, fontWeight: 'bold', color: '#CC0000' }}>
          {isEnglish ? 'CTRL+N - New ; CTRL+S - Save ; CTRL+X - Delete ; ESC - Exit ; F6-Old Bill' : 'CTRL+N - சேர்ப்பு ; CTRL+S - பதிவு ; CTRL+X - ரத்து ; ESC - முற்றும் ; F6-பழைய பில்'}
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
   2. PURCHASE INFORMATION & RETURN (Slides 26-29 / image27.jpeg)
   ============================================================================ */
export const PurchaseInvoiceScreen: React.FC<ScreenProps & { isReturn?: boolean }> = ({ onClose, isEnglish, isReturn = false }) => {
  const [tab, setTab] = useState<'info' | 'list'>('info');
  const [refNo, setRefNo] = useState(isReturn ? 'PR1' : 'PI2');
  const [invNo, setInvNo] = useState('123');
  const [supplier, setSupplier] = useState('BARAKAH TRADERS');
  const [items, setItems] = useState([
    { name: SEED_PRODUCTS[0].name, qty: 10, free: 1, prate: 155.00, val: 1550.00, disc: 0, tax: 77.50, srate: 180.00, mrp: 200.00 }
  ]);

  const handleClosePurchase = React.useCallback(() => {
    if (items.length > 0 && !window.confirm(isEnglish ? 'Close Purchase screen? Unsaved lines will be lost.' : 'கொள்முதல் திரையை மூடவா? சேமிக்காதவை அழியும்.')) {
      return;
    }
    onClose();
  }, [items.length, isEnglish, onClose]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClosePurchase(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleClosePurchase]);

  const gross = items.reduce((s, i) => s + i.val, 0);
  const tax = items.reduce((s, i) => s + i.tax, 0);
  const nett = Math.round(gross + tax);

  return (
    <div className="win-child-window maximized">
      <div className="win-child-titlebar">
        <span>{isReturn ? (isEnglish ? 'PURCHASE RETURN' : 'கொள்முதல் திரும்பல்') : (isEnglish ? 'PURCHASE INFORMATION' : 'கொள்முதல் விவரம்')}</span>
        <button className="win-control-btn" style={{ color: '#B91C1C' }} onClick={handleClosePurchase}>✕</button>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '4px 8px', background: '#ECE9D8', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 19, fontWeight: 'bold', color: '#800000' }}>
            {isReturn
              ? (isEnglish ? 'PURCHASE RETURN' : 'கொள்முதல் திரும்பல்')
              : (isEnglish ? 'PURCHASE INFORMATION' : 'கொள்முதல் விவரம்')}
          </span>
          <div className="action-buttons-box">
            <ToolbarButton icon="📄" en="New" ta="சேர்ப்பு" isEnglish={isEnglish} onClick={() => {
              if (items.length > 0 && !window.confirm(isEnglish ? 'Start a new Purchase entry? Current lines will be cleared.' : 'புதிய கொள்முதல் பதிவு தொடங்கவா?')) return;
              setItems([]);
            }} />
            <ToolbarButton icon="💾" en="Save" ta="பதிவு" isEnglish={isEnglish} onClick={() => { window.barakahFs?.appendTransaction({ type: isReturn ? 'PURCHASE_RETURN' : 'PURCHASE', refNo, nett }); alert(isEnglish ? `${refNo} saved!` : `${refNo} சேமிக்கப்பட்டது!`); }} />
            <ToolbarButton icon="▲" en="Delete" ta="ரத்து" isEnglish={isEnglish} color="#DC2626" onClick={() => {
              if (items.length === 0) return;
              if (!window.confirm(isEnglish ? 'Remove the last product line?' : 'கடைசிப் பொருளை நீக்கவா?')) return;
              setItems(p => p.slice(0, -1));
            }} />
            <ToolbarButton icon="🖨" en="Print" ta="அச்சிடு" isEnglish={isEnglish} onClick={() => window.print()} />
            <ToolbarButton icon="🛑" en="Close" ta="முற்றும்" isEnglish={isEnglish} color="#B91C1C" onClick={handleClosePurchase} />
          </div>
        </div>

        <div className="win-tabs-container">
          <div className={`win-tab ${tab === 'info' ? 'active' : ''}`} onClick={() => setTab('info')}>{isEnglish ? 'Invoice Information' : 'பில் விவரம்'}</div>
          <div className={`win-tab ${tab === 'list' ? 'active' : ''}`} onClick={() => setTab('list')}>{isEnglish ? 'Invoice List' : 'பட்டியல்'}</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '230px 1fr', gap: 16, padding: 6, fontSize: 11, borderBottom: '1px solid #808080' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '95px 1fr', gap: 3, alignItems: 'center' }}>
            <b style={{ color: '#000080', textAlign: 'right' }}>{isEnglish ? 'Reference No:' : 'குறிப்பு எண்:'}</b>
            <input className="win-input-classic" value={refNo} onChange={e => setRefNo(e.target.value)} />
            <b style={{ color: '#000080', textAlign: 'right' }}>{isEnglish ? 'Invoice Date :' : 'பில் தேதி :'}</b>
            <input className="win-input-classic" defaultValue={new Date().toLocaleDateString('en-GB')} />
            <b style={{ color: '#000080', textAlign: 'right' }}>{isEnglish ? 'Invoice No:' : 'பில் எண்:'}</b>
            <input className="win-input-classic" value={invNo} onChange={e => setInvNo(e.target.value)} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: 3, alignItems: 'center' }}>
            <b style={{ color: '#000080', textAlign: 'right' }}>{isEnglish ? 'Supplier Name' : 'விநியோகஸ்தர்'}</b>
            <input className="win-input-classic" value={supplier} onChange={e => setSupplier(e.target.value)} />
            <b style={{ color: '#000080', textAlign: 'right' }}>{isEnglish ? 'Supplier Address' : 'முகவரி'}</b>
            <input className="win-input-classic" defaultValue="Chennai - 600026" />
          </div>
        </div>

        <div style={{ padding: '4px', display: 'flex', gap: 8, alignItems: 'center' }}>
          <b style={{ color: '#800000' }}>{isEnglish ? 'Product Barcode :' : 'பார்கோடு :'}</b>
          <input className="win-input-barcode-yellow" style={{ width: 200 }} placeholder="Enter or Scan..." />
          <button
            className="win-btn-classic"
            onClick={() => setItems(prev => [...prev, { name: SEED_PRODUCTS[1].name, qty: 5, free: 0, prate: 240, val: 1200, disc: 0, tax: 60, srate: 280, mrp: 300 }])}
          >
            {isEnglish ? '+ Add Product Line' : '+ பொருள் சேர்'}
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', background: '#808080', border: '1px inset #808080' }}>
          <table className="vanigam-grid">
            <thead>
              <tr>
                <th>{isEnglish ? 'Product Name' : 'பொருள் பெயர்'}</th>
                <th style={{ width: 55, textAlign: 'right' }}>{isEnglish ? 'Qty' : 'அளவு'}</th>
                <th style={{ width: 50, textAlign: 'right' }}>Free</th>
                <th style={{ width: 70, textAlign: 'right' }}>P.Rate</th>
                <th style={{ width: 75, textAlign: 'right' }}>{isEnglish ? 'Value' : 'தொகை'}</th>
                <th style={{ width: 65, textAlign: 'right' }}>Tax</th>
                <th style={{ width: 70, textAlign: 'right' }}>S.Rate</th>
                <th style={{ width: 70, textAlign: 'right' }}>MRP</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, i) => (
                <tr key={i}>
                  <td><b>{it.name}</b></td>
                  <td style={{ textAlign: 'right' }}>{it.qty}</td>
                  <td style={{ textAlign: 'right' }}>{it.free}</td>
                  <td style={{ textAlign: 'right' }}>{it.prate.toFixed(2)}</td>
                  <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{it.val.toFixed(2)}</td>
                  <td style={{ textAlign: 'right' }}>{it.tax.toFixed(2)}</td>
                  <td style={{ textAlign: 'right' }}>{it.srate.toFixed(2)}</td>
                  <td style={{ textAlign: 'right' }}>{it.mrp.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', gap: 6, padding: '4px 0' }}>
          <div className="pos-summary-cell" style={{ width: 65 }}><span className="pos-summary-label">{isEnglish ? 'Products' : 'எண்'}</span><div className="pos-summary-value">{items.length}</div></div>
          <div className="pos-summary-cell" style={{ width: 85 }}><span className="pos-summary-label">{isEnglish ? 'Gross Amt' : 'மொ.தொகை'}</span><div className="pos-summary-value">{gross.toFixed(2)}</div></div>
          <div className="pos-summary-cell" style={{ width: 75 }}><span className="pos-summary-label" style={{ color: '#CC0000' }}>{isEnglish ? 'Tax Amt' : 'வரி'}</span><div className="pos-summary-value">{tax.toFixed(2)}</div></div>
          <div className="pos-summary-cell" style={{ width: 85 }}><span className="pos-summary-label">{isEnglish ? 'Nett Amt' : 'நிகர தொகை'}</span><div className="pos-summary-value">{nett.toFixed(2)}</div></div>
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
   3. RECEIPT & PAYMENT INFORMATION (Slides 43 & 45 / image44 & image46)
   ============================================================================ */
export const ReceiptPaymentScreen: React.FC<ScreenProps & { mode: 'receipt' | 'payment' }> = ({ onClose, isEnglish, mode }) => {
  const isRec = mode === 'receipt';
  const [docNo, setDocNo] = useState(isRec ? 'R2' : 'P1');
  const [partyCode, setPartyCode] = useState(isRec ? SEED_CUSTOMERS[1].code : 'S1');
  const [partyName, setPartyName] = useState(isRec ? SEED_CUSTOMERS[1].name : 'BARAKAH');
  const [amount, setAmount] = useState(isRec ? '178.00' : '1541.50');
  const [payMode, setPayMode] = useState('CASH');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="win-child-window" style={{ width: 700, height: 470, margin: 'auto' }}>
      <div className="win-child-titlebar">
        <span>{isRec ? (isEnglish ? 'RECEIPT ENTRY' : 'ரசீது பதிவு') : (isEnglish ? 'PAYMENT INFORMATION' : 'பணம் செலுத்தல்')}</span>
        <button className="win-control-btn" style={{ color: '#B91C1C' }} onClick={onClose}>✕</button>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 10, background: '#ECE9D8' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <div style={{ fontSize: 18, fontWeight: 'bold', color: '#CC0000' }}>
            {isRec
              ? (isEnglish ? 'RECEIPT INFORMATION' : 'ரசீது தகவல்')
              : (isEnglish ? 'PAYMENT INFORMATION' : 'பணம் செலுத்தல் விவரம்')}
          </div>
          <div className="action-buttons-box">
            <ToolbarButton icon="📄" en="New" ta="சேர்ப்பு" isEnglish={isEnglish} onClick={() => {
              if (parseFloat(amount) > 0 && !window.confirm(isEnglish ? 'Clear current amount and start new entry?' : 'தற்போதைய தொகையை அழித்து புதிய பதிவு தொடங்கவா?')) return;
              setAmount('0.00');
            }} />
            <ToolbarButton icon="💾" en="Save" ta="பதிவு" isEnglish={isEnglish} onClick={() => { window.barakahFs?.appendTransaction({ type: mode.toUpperCase(), docNo, partyCode, amount }); alert(isEnglish ? `${docNo} saved!` : `${docNo} சேமிக்கப்பட்டது!`); }} />
            <ToolbarButton icon="▲" en="Delete" ta="ரத்து" isEnglish={isEnglish} color="#DC2626" onClick={() => {
              if (!window.confirm(isEnglish ? `Cancel/delete voucher ${docNo}?` : `வவுச்சர் ${docNo} ஐ ரத்து செய்யவா?`)) return;
              setAmount('0.00');
            }} />
            <ToolbarButton icon="🖨" en="Print" ta="அச்சிடு" isEnglish={isEnglish} onClick={() => window.print()} />
            <ToolbarButton icon="🛑" en="Close" ta="முற்றும்" isEnglish={isEnglish} color="#B91C1C" onClick={onClose} />
          </div>
        </div>

        <div style={{ flex: 1, border: '1px solid #808080', padding: 14, display: 'grid', gridTemplateColumns: isRec ? '1fr' : '1fr 230px', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '125px 1fr', gap: 6, fontSize: 11.5, alignItems: 'center', alignContent: 'start' }}>
            <b style={{ color: '#000080', textAlign: 'right' }}>{isEnglish ? 'Total Balance' : 'மொத்த பாக்கி'}</b>
            <span style={{ fontSize: 18, fontWeight: 'bold', color: isRec ? '#000' : '#CC0000' }}>{amount}</span>

            <b style={{ color: '#000080', textAlign: 'right' }}>{isRec ? (isEnglish ? 'Receipt No' : 'ரசீது எண்') : (isEnglish ? 'Payment No' : 'வவுச்சர் எண்')}</b>
            <input className="win-input-classic" style={{ width: 120 }} value={docNo} onChange={e => setDocNo(e.target.value)} />

            <b style={{ color: '#000080', textAlign: 'right' }}>{isEnglish ? 'Date' : 'தேதி'}</b>
            <input className="win-input-classic" style={{ width: 120 }} defaultValue={new Date().toLocaleDateString('en-GB')} />

            <b style={{ color: '#000080', textAlign: 'right' }}>{isRec ? (isEnglish ? 'Customer Code' : 'வாடிக்கையாளர் எண்') : (isEnglish ? 'Supplier Code' : 'விநியோகஸ்தர் எண்')}</b>
            <input className="win-input-classic" style={{ width: 120 }} value={partyCode} onChange={e => setPartyCode(e.target.value)} />

            <b style={{ color: '#000080', textAlign: 'right' }}>{isEnglish ? 'Name' : 'பெயர்'}</b>
            <input className="win-input-classic" value={partyName} onChange={e => setPartyName(e.target.value)} />

            <b style={{ color: '#000080', textAlign: 'right' }}>{isEnglish ? 'Mode' : 'முறை'}</b>
            <select className="win-input-classic" value={payMode} onChange={e => setPayMode(e.target.value)}>
              <option>CASH</option><option>CARD</option><option>CHEQUE / NEFT</option>
            </select>

            <b style={{ color: '#000080', textAlign: 'right' }}>{isRec ? (isEnglish ? 'Received Amount' : 'பெற்ற தொகை') : (isEnglish ? 'Amount Paid' : 'செலுத்திய தொகை')}</b>
            <input className="win-input-barcode-yellow" style={{ width: 130 }} value={amount} onChange={e => setAmount(e.target.value)} />

            <b style={{ color: '#800000', textAlign: 'right' }}>{isEnglish ? 'Information' : 'குறிப்பு'}</b>
            <textarea className="win-input-classic" style={{ height: 48 }} />
          </div>

          {!isRec && (
            <div style={{ border: '1px inset #808080', background: '#808080', height: 150 }}>
              <table className="vanigam-grid">
                <thead>
                  <tr><th>No.</th><th>Date</th><th style={{ textAlign: 'right' }}>Balance</th></tr>
                </thead>
                <tbody>
                  <tr className="selected"><td>PI3</td><td>14/08/18</td><td style={{ textAlign: 'right' }}>{amount}</td></tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
   4. STOCK CONVERSION & STOCK UPDATE (Slides 48-49 / image49 & image50)
   ============================================================================ */
export const StockUtilityScreen: React.FC<ScreenProps & { mode: 'conversion' | 'update' }> = ({ onClose, isEnglish, mode }) => {
  const isConv = mode === 'conversion';
  const [prod, setProd] = useState(SEED_PRODUCTS[0]);
  const [stock, setStock] = useState(String(SEED_PRODUCTS[0].currentStock));
  const [retailRate, setRetailRate] = useState(SEED_PRODUCTS[0].rate.toFixed(2));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const totalVal = (parseFloat(stock) || 0) * (parseFloat(retailRate) || 0);

  return (
    <div className="win-child-window" style={{ width: 560, height: 400, margin: 'auto' }}>
      <div className="win-child-titlebar">
        <span>{isConv ? (isEnglish ? 'STOCK TRANSFER' : 'சரக்கு மாற்றம்') : (isEnglish ? 'Stock Update' : 'சரக்கு புதுப்பிப்பு')}</span>
        <button className="win-control-btn" style={{ color: '#B91C1C' }} onClick={onClose}>✕</button>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 12, background: '#ECE9D8' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 18, fontWeight: 'bold', color: isConv ? '#000' : '#CC0000' }}>
            {isConv ? (isEnglish ? 'STOCK TRANSFER' : 'சரக்கு மாற்றம்') : (isEnglish ? 'Stock Update' : 'சரக்கு புதுப்பிப்பு')}
          </span>
          <div className="action-buttons-box">
            <ToolbarButton icon="📄" en="New" ta="சேர்ப்பு" isEnglish={isEnglish} onClick={() => {
              if (!window.confirm(isEnglish ? 'Reset stock quantity to 0?' : 'இருப்பு எண்ணிக்கையை 0 ஆக மாற்றவா?')) return;
              setStock('0');
            }} />
            <ToolbarButton icon="💾" en="Save" ta="பதிவு" isEnglish={isEnglish} onClick={() => alert(isEnglish ? 'Stock updated!' : 'சரக்கு புதுப்பிக்கப்பட்டது!')} />
            <ToolbarButton icon="🛑" en="Close" ta="முற்றும்" isEnglish={isEnglish} color="#B91C1C" onClick={onClose} />
          </div>
        </div>

        <div style={{ flex: 1, border: '1px solid #808080', padding: 14, display: 'grid', gridTemplateColumns: '125px 1fr', gap: 6, fontSize: 11.5, alignItems: 'center', alignContent: 'start' }}>
          <b style={{ color: '#000080', textAlign: 'right' }}>{isEnglish ? 'Product Code :' : 'பொருள் எண் :'}</b>
          <div style={{ display: 'flex', gap: 6 }}>
            <select className="win-input-classic" style={{ width: 90 }} value={prod.code} onChange={e => {
              const p = SEED_PRODUCTS.find(x => x.code === e.target.value) || SEED_PRODUCTS[0];
              setProd(p); setStock(String(p.currentStock)); setRetailRate(p.rate.toFixed(2));
            }}>
              {SEED_PRODUCTS.map(p => <option key={p.id} value={p.code}>{p.code}</option>)}
            </select>
            <input className="win-input-barcode-yellow" style={{ flex: 1 }} readOnly value={prod.barcode} />
          </div>

          <b style={{ color: '#000080', textAlign: 'right' }}>{isEnglish ? 'Product Name :' : 'பொருள் பெயர் :'}</b>
          <input className="win-input-classic" readOnly value={isEnglish ? prod.name : prod.tamilName} />

          <b style={{ color: '#000080', textAlign: 'right' }}>{isEnglish ? 'Stock :' : 'இருப்பு :'}</b>
          <input className="win-input-classic" style={{ width: 110, fontWeight: 'bold' }} value={stock} onChange={e => setStock(e.target.value)} />

          <b style={{ color: '#000080', textAlign: 'right' }}>MRP :</b>
          <input className="win-input-classic" style={{ width: 110 }} readOnly value={prod.mrp.toFixed(2)} />

          <b style={{ color: '#000080', textAlign: 'right' }}>{isEnglish ? 'Retail Rate :' : 'விற்பனை விலை :'}</b>
          <input className="win-input-classic" style={{ width: 110 }} value={retailRate} onChange={e => setRetailRate(e.target.value)} />

          <b style={{ color: '#CC0000', textAlign: 'right' }}>{isEnglish ? 'Value :' : 'மொத்த மதிப்பு :'}</b>
          <input className="win-input-barcode-yellow" style={{ width: 110 }} readOnly value={totalVal.toFixed(2)} />
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
   5. REPORTS SCREEN (Slides 53-72 / image61.jpeg)
   ============================================================================ */
export const ReportsScreen: React.FC<ScreenProps & { reportType: string }> = ({ onClose, isEnglish, reportType }) => {
  const [fromDate, setFromDate] = useState(() => new Date().toLocaleDateString('en-GB'));
  const [toDate, setToDate] = useState(() => new Date().toLocaleDateString('en-GB'));
  const [selectedIdx, setSelectedIdx] = useState(0);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const titles: Record<string, { en: string; ta: string }> = {
    sales_reports: { en: 'SALES DETAILS - BRIEF', ta: 'விற்பனை அறிக்கை - சுருக்கம்' },
    stock_reports: { en: 'TOTAL STOCK VALUE REPORT', ta: 'மொத்த சரக்கு இருப்பு அறிக்கை' },
    customer_reports: { en: 'CUSTOMER BALANCE REPORT', ta: 'வாடிக்கையாளர் பாக்கி அறிக்கை' },
    supplier_reports: { en: 'SUPPLIER BALANCE REPORT', ta: 'விநியோகஸ்தர் பாக்கி அறிக்கை' },
    profit_reports: { en: 'PROFIT DETAILS - BRIEF', ta: 'லாப விவர அறிக்கை' }
  };

  const title = titles[reportType] || titles.sales_reports;

  const exportCsv = () => {
    const csv = 'Code,Name,Qty,Rate,Value\n' + SEED_PRODUCTS.map(p => `${p.code},"${p.name}",${p.currentStock},${p.rate},${(p.currentStock * p.rate).toFixed(2)}`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportType}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="win-child-window maximized">
      <div className="win-child-titlebar">
        <span>{isEnglish ? 'REPORT PRINTING INFORMATION' : 'அறிக்கை தகவல்'}</span>
        <button className="win-control-btn" style={{ color: '#B91C1C' }} onClick={onClose}>✕</button>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '6px 8px', background: '#ECE9D8', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 'bold', color: '#CC0000' }}>{isEnglish ? title.en : title.ta}</div>
            <div style={{ fontSize: 11, fontWeight: 'bold', color: '#800000' }}>CTRL + R - REPORT SETTINGS</div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ border: '1px solid #808080', padding: '4px 8px', display: 'flex', gap: 8, fontSize: 11, alignItems: 'center' }}>
              <div><b style={{ color: '#000080' }}>{isEnglish ? 'Start Date' : 'தொடக்க தேதி'}</b><br /><input className="win-input-classic" style={{ width: 85 }} value={fromDate} onChange={e => setFromDate(e.target.value)} /></div>
              <div><b style={{ color: '#000080' }}>{isEnglish ? 'End Date' : 'முடிவு தேதி'}</b><br /><input className="win-input-classic" style={{ width: 85 }} value={toDate} onChange={e => setToDate(e.target.value)} /></div>
            </div>
            <div className="action-buttons-box">
              <ToolbarButton icon="👁" en="View" ta="பார்" isEnglish={isEnglish} onClick={() => setSelectedIdx(0)} />
              <ToolbarButton icon="🖨" en="Print" ta="அச்சிடு" isEnglish={isEnglish} onClick={() => window.print()} />
              <ToolbarButton icon="🛑" en="Close" ta="முற்றும்" isEnglish={isEnglish} color="#B91C1C" onClick={onClose} />
              <ToolbarButton icon="📊" en="Excel" ta="எக்செல்" isEnglish={isEnglish} color="#15803D" onClick={exportCsv} />
            </div>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', background: '#808080', border: '1px inset #808080' }}>
          <table className="vanigam-grid">
            <thead>
              <tr>
                <th style={{ width: 70 }}>{isEnglish ? 'CODE' : 'குறியீடு'}</th>
                <th>{isEnglish ? 'PARTICULARS / NAME' : 'விவரம் / பெயர்'}</th>
                <th style={{ width: 90, textAlign: 'right' }}>{isEnglish ? 'STOCK / QTY' : 'இருப்பு'}</th>
                <th style={{ width: 90, textAlign: 'right' }}>{isEnglish ? 'RATE' : 'விலை'}</th>
                <th style={{ width: 110, textAlign: 'right' }}>{isEnglish ? 'AMOUNT' : 'மொத்தம்'}</th>
              </tr>
              <tr style={{ background: '#FFFF00' }}>
                <th><input type="checkbox" defaultChecked /></th>
                <th><input type="checkbox" defaultChecked /></th>
                <th><input type="checkbox" defaultChecked /></th>
                <th><input type="checkbox" defaultChecked /></th>
                <th><input type="checkbox" defaultChecked /></th>
              </tr>
            </thead>
            <tbody>
              {SEED_PRODUCTS.map((p, idx) => (
                <tr key={p.id} className={idx === selectedIdx ? 'selected' : ''} onClick={() => setSelectedIdx(idx)} style={{ cursor: 'pointer' }}>
                  <td><b>{p.code}</b></td>
                  <td>{isEnglish ? p.name : p.tamilName}</td>
                  <td style={{ textAlign: 'right' }}>{p.currentStock.toFixed(2)}</td>
                  <td style={{ textAlign: 'right' }}>{p.rate.toFixed(2)}</td>
                  <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{(p.currentStock * p.rate).toFixed(2)}</td>
                </tr>
              ))}
              <tr style={{ fontWeight: 'bold', background: '#ECE9D8' }}>
                <td></td>
                <td>{isEnglish ? 'Total' : 'மொத்தம்'}</td>
                <td></td>
                <td></td>
                <td style={{ textAlign: 'right' }}>
                  {SEED_PRODUCTS.reduce((s, p) => s + p.currentStock * p.rate, 0).toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
