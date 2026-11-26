import React from 'react';
import { CartItem } from '../types';
import '../styles/classicTheme.css';

export interface HeldBillsRecord {
  id: string;
  heldAt: string;
  ticketNo: string;
  customerName: string;
  customerPhone: string;
  items: CartItem[];
  totalAmount: number;
}

interface HeldBillsModalProps {
  isOpen: boolean;
  onClose: () => void;
  heldBills: HeldBillsRecord[];
  onRecallBill: (bill: HeldBillsRecord) => void;
  onDiscardBill: (billId: string) => void;
}

export const HeldBillsModal: React.FC<HeldBillsModalProps> = ({
  isOpen,
  onClose,
  heldBills,
  onRecallBill,
  onDiscardBill
}) => {
  if (!isOpen) return null;

  return (
    <div className="win-modal-overlay">
      <div className="win-modal-window" style={{ width: 640 }}>
        <div className="win-titlebar">
          <span>Parked / Held Bills Registry (F11 Hold / F12 Recall)</span>
          <button className="win-btn-control win-btn-close" onClick={onClose}>✕</button>
        </div>

        <div style={{ padding: 12 }}>
          <div style={{ background: '#EFF6FF', border: '1px solid #93C5FD', padding: 8, fontSize: 12, marginBottom: 10 }}>
            <b>ℹ Held Bills Queue:</b> When a customer steps away to pick up more items, their active cart is parked here using <b>F11 (HOLD BILL)</b> so the queue can continue.
            Click <b>"Resume Bill (F12)"</b> to recall their cart.
          </div>

          <div style={{ maxHeight: 280, overflowY: 'auto', border: '1px solid #7F9DB9', background: '#FFFFFF' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11.5 }}>
              <thead>
                <tr style={{ background: '#E2E8F0', borderBottom: '1px solid #CBD5E0' }}>
                  <th style={{ padding: 6, textAlign: 'left' }}>Ticket #</th>
                  <th style={{ padding: 6, textAlign: 'left' }}>Held Time</th>
                  <th style={{ padding: 6, textAlign: 'left' }}>Customer</th>
                  <th style={{ padding: 6, textAlign: 'center' }}>Items</th>
                  <th style={{ padding: 6, textAlign: 'right' }}>Total (₹)</th>
                  <th style={{ padding: 6, textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {heldBills.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: 24, textAlign: 'center', color: '#666' }}>
                      No bills are currently on hold. Use <b>F11</b> during billing to park an active cart.
                    </td>
                  </tr>
                ) : (
                  heldBills.map(bill => (
                    <tr key={bill.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                      <td style={{ padding: 6, fontWeight: 'bold', color: '#1E3A8A' }}>{bill.ticketNo}</td>
                      <td style={{ padding: 6 }}>{bill.heldAt}</td>
                      <td style={{ padding: 6 }}>{bill.customerName} ({bill.customerPhone})</td>
                      <td style={{ padding: 6, textAlign: 'center' }}>{bill.items.length}</td>
                      <td style={{ padding: 6, textAlign: 'right', fontWeight: 'bold' }}>₹ {bill.totalAmount.toFixed(2)}</td>
                      <td style={{ padding: 6, textAlign: 'center' }}>
                        <button
                          className="win-btn win-btn-primary"
                          style={{ fontSize: 11, padding: '2px 8px', marginRight: 6 }}
                          onClick={() => {
                            onRecallBill(bill);
                            onClose();
                          }}
                        >
                          Resume Bill
                        </button>
                        <button
                          className="win-btn"
                          style={{ fontSize: 11, padding: '2px 6px', color: '#B91C1C' }}
                          onClick={() => onDiscardBill(bill.id)}
                        >
                          Discard
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
            <button className="win-btn" onClick={onClose}>
              Close (Esc)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
