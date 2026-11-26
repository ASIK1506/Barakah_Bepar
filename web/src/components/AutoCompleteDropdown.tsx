import React, { useEffect, useRef } from 'react';
import { Product } from '../types';
import '../styles/classicTheme.css';

interface AutoCompleteDropdownProps {
  products: Product[];
  filterText: string;
  isOpen: boolean;
  onSelect: (product: Product) => void;
  onClose: () => void;
  selectedIndex: number;
}

export const AutoCompleteDropdown: React.FC<AutoCompleteDropdownProps> = ({
  products,
  filterText,
  isOpen,
  onSelect,
  onClose,
  selectedIndex
}) => {
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll selected row into view
    if (tableRef.current) {
      const selectedEl = tableRef.current.querySelector('.selected-row');
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  if (!isOpen || !filterText || products.length === 0) return null;

  return (
    <div
      ref={tableRef}
      style={{
        position: 'absolute',
        top: '100%',
        left: 0,
        width: 620,
        maxHeight: 220,
        overflowY: 'auto',
        background: '#FFFFE0', // Light yellow matching Vanigam autocomplete popup
        border: '2px solid #000080',
        boxShadow: '2px 3px 6px rgba(0,0,0,0.3)',
        zIndex: 9999,
        fontSize: '11px',
        fontFamily: "'Segoe UI', Tahoma, 'Noto Sans Tamil', sans-serif"
      }}
    >
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead style={{ background: '#000080', color: '#FFFFFF', position: 'sticky', top: 0 }}>
          <tr>
            <th style={{ padding: '3px 4px', textAlign: 'left', width: 50 }}>Code</th>
            <th style={{ padding: '3px 4px', textAlign: 'left', width: 140 }}>Name</th>
            <th style={{ padding: '3px 4px', textAlign: 'left', width: 140 }}>Tamil Name</th>
            <th style={{ padding: '3px 4px', textAlign: 'right', width: 60 }}>MRP</th>
            <th style={{ padding: '3px 4px', textAlign: 'right', width: 60 }}>Rate</th>
            <th style={{ padding: '3px 4px', textAlign: 'right', width: 60 }}>Stock</th>
            <th style={{ padding: '3px 4px', textAlign: 'center', width: 50 }}>Unit</th>
          </tr>
        </thead>
        <tbody>
          {products.map((prod, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <tr
                key={prod.id}
                className={isSelected ? 'selected-row' : ''}
                style={{
                  background: isSelected ? '#316AC5' : idx % 2 === 0 ? '#FFFFF0' : '#FFFACD',
                  color: isSelected ? '#FFFFFF' : '#000000',
                  cursor: 'pointer',
                  borderBottom: '1px solid #DCDCDC'
                }}
                onMouseDown={() => onSelect(prod)}
              >
                <td style={{ padding: '3px 4px', fontWeight: 'bold' }}>{prod.code}</td>
                <td style={{ padding: '3px 4px' }}>{prod.name}</td>
                <td style={{ padding: '3px 4px', fontFamily: "'Noto Sans Tamil', sans-serif" }}>{prod.tamilName}</td>
                <td style={{ padding: '3px 4px', textAlign: 'right' }}>₹ {prod.mrp.toFixed(2)}</td>
                <td style={{ padding: '3px 4px', textAlign: 'right', fontWeight: 'bold', color: isSelected ? '#FFF' : '#B22222' }}>
                  ₹ {prod.rate.toFixed(2)}
                </td>
                <td style={{ padding: '3px 4px', textAlign: 'right' }}>{prod.currentStock.toFixed(prod.isDecimal ? 3 : 0)}</td>
                <td style={{ padding: '3px 4px', textAlign: 'center' }}>{prod.unit}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
