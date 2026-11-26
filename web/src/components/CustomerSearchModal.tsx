import React, { useState } from 'react';
import { Customer } from '../types';
import '../styles/classicTheme.css';

interface CustomerSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  customers: Customer[];
  onSelectCustomer: (cust: Customer) => void;
  isEnglish?: boolean;
}

export const CustomerSearchModal: React.FC<CustomerSearchModalProps> = ({
  isOpen,
  onClose,
  customers,
  onSelectCustomer,
  isEnglish = true
}) => {
  const [searchBy, setSearchBy] = useState<'name' | 'phone1' | 'phone2' | 'cell'>('phone1');
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filtered = customers.filter(c => {
    const q = searchTerm.toLowerCase();
    if (!q) return true;
    if (searchBy === 'name') return c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q);
    if (searchBy === 'phone1') return c.phone1.includes(q);
    if (searchBy === 'phone2') return (c.phone2 && c.phone2.includes(q)) || false;
    return c.phone1.includes(q) || (c.phone2 && c.phone2.includes(q)) || c.name.toLowerCase().includes(q);
  });

  return (
    <div className="win-modal-overlay">
      <div className="win-modal-window" style={{ width: 680 }}>
        <div className="win-modal-titlebar">
          <span>{isEnglish ? 'Search Customer (F6)' : 'வாடிக்கையாளர் தேடல் (F6)'}</span>
          <button className="win-control-btn" style={{ color: '#B91C1C' }} onClick={onClose}>✕</button>
        </div>

        <div style={{ padding: 6, background: '#ECE9D8' }}>
          {/* Slide 38 Lavender Header Panel */}
          <fieldset style={{ border: '1px solid #7F9DB9', padding: '4px 8px', background: '#CCCCFF', marginBottom: 4 }}>
            <legend style={{ fontWeight: 'bold', fontSize: 11, color: '#000' }}>
              {isEnglish ? 'Search Customer' : 'வாடிக்கையாளர் தேடல்'}
            </legend>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
              <div style={{ display: 'flex', gap: 10, fontSize: 11, fontWeight: 'bold' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 3, cursor: 'pointer' }}>
                  <input type="radio" name="searchBy" checked={searchBy === 'name'} onChange={() => setSearchBy('name')} /> {isEnglish ? 'Name' : 'பெயர்'}
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 3, cursor: 'pointer' }}>
                  <input type="radio" name="searchBy" checked={searchBy === 'phone1'} onChange={() => setSearchBy('phone1')} /> {isEnglish ? 'Phone1' : 'தொலைபேசி 1'}
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 3, cursor: 'pointer' }}>
                  <input type="radio" name="searchBy" checked={searchBy === 'phone2'} onChange={() => setSearchBy('phone2')} /> {isEnglish ? 'Phone2' : 'தொலைபேசி 2'}
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 3, cursor: 'pointer' }}>
                  <input type="radio" name="searchBy" checked={searchBy === 'cell'} onChange={() => setSearchBy('cell')} /> {isEnglish ? 'Cell No' : 'கைபேசி'}
                </label>
              </div>
              <input
                type="text"
                className="win-input-classic"
                style={{ width: 220 }}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                autoFocus
              />
            </div>
          </fieldset>

          {/* Grid matching Slide 38 */}
          <div style={{ height: 220, overflowY: 'auto', border: '1px inset #808080', background: '#808080' }}>
            <table className="vanigam-grid">
              <thead>
                <tr>
                  <th style={{ width: 55 }}>{isEnglish ? 'Code' : 'எண்'}</th>
                  <th style={{ width: 150 }}>{isEnglish ? 'Name' : 'பெயர்'}</th>
                  <th style={{ width: 90 }}>{isEnglish ? 'Add1' : 'முகவரி 1'}</th>
                  <th style={{ width: 80 }}>{isEnglish ? 'Add2' : 'நகரம்'}</th>
                  <th style={{ width: 85 }}>{isEnglish ? 'Phone1' : 'போன் 1'}</th>
                  <th style={{ width: 85 }}>{isEnglish ? 'Phone2' : 'போன் 2'}</th>
                  <th style={{ width: 70, textAlign: 'right' }}>{isEnglish ? 'Balance' : 'பாக்கி'}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr
                    key={c.code}
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      onSelectCustomer(c);
                      onClose();
                    }}
                  >
                    <td style={{ fontWeight: 'bold' }}>{c.code}</td>
                    <td>{c.name}</td>
                    <td>Vadapalani</td>
                    <td>Chennai</td>
                    <td style={{ fontWeight: 'bold' }}>{c.phone1}</td>
                    <td>{c.phone2 || '0'}</td>
                    <td style={{ textAlign: 'right', fontWeight: 'bold', color: c.balance > 0 ? '#B22222' : '#000' }}>
                      {c.balance.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6 }}>
            <button className="win-btn-classic" style={{ width: 90 }} onClick={onClose}>
              {isEnglish ? 'Cancel (Esc)' : 'ரத்து (Esc)'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
