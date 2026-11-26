import React from 'react';
import { Estimation } from '../types';
import '../styles/classicTheme.css';

interface EstimateModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedEstimates: Estimation[];
  onRecallEstimate: (est: Estimation) => void;
  onDiscardEstimate: (code: string) => void;
}

export const EstimateModal: React.FC<EstimateModalProps> = ({
  isOpen,
  onClose,
  savedEstimates,
  onRecallEstimate,
  onDiscardEstimate
}) => {
  if (!isOpen) return null;

  return (
    <div className="win-modal-overlay">
      <div className="win-modal-window" style={{ width: 620 }}>
        <div className="win-titlebar">
          <span>Customer Estimation Registry [Zero Inventory Deduction]</span>
          <button className="win-btn-control win-btn-close" onClick={onClose}>✕</button>
        </div>

        <div style={{ padding: 12 }}>
          <div style={{ background: '#FFFBEB', border: '1px solid #FCD34D', padding: 8, fontSize: 12, marginBottom: 10 }}>
            <b>ℹ Estimate Mode Policy:</b> Estimates are temporary price quotations for customers. 
            <b> No stock is deducted</b> while saved as an estimate. When customer returns to buy, click <b>"Recall & Bill"</b> to convert it to an official invoice and deduct inventory.
          </div>

          <div style={{ maxHeight: 280, overflowY: 'auto', border: '1px solid #7F9DB9', background: '#FFFFFF' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11.5 }}>
              <thead>
                <tr style={{ background: '#E2E8F0', borderBottom: '1px solid #CBD5E0' }}>
                  <th style={{ padding: 4, textAlign: 'left' }}>Estimate No</th>
                  <th style={{ padding: 4, textAlign: 'left' }}>Time / Date</th>
                  <th style={{ padding: 4, textAlign: 'left' }}>Customer</th>
                  <th style={{ padding: 4, textAlign: 'center' }}>Items</th>
                  <th style={{ padding: 4, textAlign: 'right' }}>Total (₹)</th>
                  <th style={{ padding: 4, textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {savedEstimates.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: 20, textAlign: 'center', color: '#666' }}>
                      No active estimates saved. Enable [x] EST on POS screen and press Save (Ctrl+S) to create one.
                    </td>
                  </tr>
                ) : (
                  savedEstimates.map(est => (
                    <tr key={est.estimateCode} style={{ borderBottom: '1px solid #EDF2F7' }}>
                      <td style={{ padding: 4, fontWeight: 'bold', color: '#800000' }}>{est.estimateCode}</td>
                      <td style={{ padding: 4 }}>{est.date} {est.time}</td>
                      <td style={{ padding: 4 }}>{est.customer.name}</td>
                      <td style={{ padding: 4, textAlign: 'center' }}>{est.items.length}</td>
                      <td style={{ padding: 4, textAlign: 'right', fontWeight: 'bold', color: '#CC0000' }}>
                        {est.netAmount.toFixed(2)}
                      </td>
                      <td style={{ padding: 4, textAlign: 'center', display: 'flex', gap: 4, justifyContent: 'center' }}>
                        <button
                          style={{ background: '#3182CE', color: '#FFF', border: '1px solid #2B6CB0', fontSize: 10, padding: '2px 6px', cursor: 'pointer' }}
                          onClick={() => onRecallEstimate(est)}
                        >
                          Recall & Bill
                        </button>
                        <button
                          style={{ background: '#E53E3E', color: '#FFF', border: '1px solid #C53030', fontSize: 10, padding: '2px 6px', cursor: 'pointer' }}
                          onClick={() => onDiscardEstimate(est.estimateCode)}
                        >
                          Drop
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
            <button className="win-btn-action" style={{ minWidth: 80, height: 28 }} onClick={onClose}>
              Close [Esc]
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
