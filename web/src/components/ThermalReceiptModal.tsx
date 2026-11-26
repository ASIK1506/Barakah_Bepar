import React from 'react';
import { Invoice } from '../types';
import '../styles/classicTheme.css';

interface ThermalReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  isEnglish?: boolean;
}

export const ThermalReceiptModal: React.FC<ThermalReceiptModalProps> = ({
  isOpen,
  onClose,
  invoice,
  isEnglish = true
}) => {
  if (!isOpen || !invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const totalSavings = invoice.items.reduce((sum, item) => {
    const mrp = item.product.mrp || item.rate;
    if (mrp > item.rate) {
      return sum + ((mrp - item.rate) * item.quantity);
    }
    return sum;
  }, 0) + invoice.discountAmount;

  return (
    <div className="win-modal-overlay">
      <div className="win-modal-window" style={{ width: 350, maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}>
        <div className="win-modal-titlebar">
          <span>
            {invoice.isEstimate
              ? (isEnglish ? 'Estimate Slip' : 'மதிப்பீட்டு ரசீது')
              : (isEnglish ? 'Thermal Receipt [Slide 41 Format]' : 'அச்சு ரசீது')}
          </span>
          <button className="win-control-btn" style={{ color: '#B91C1C' }} onClick={onClose}>✕</button>
        </div>

        {/* Exact Slide 41 Thermal Receipt Format */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          background: '#FFFFFF',
          padding: '14px 12px',
          fontFamily: "'Times New Roman', Times, serif",
          fontSize: '12px',
          lineHeight: '1.25',
          color: '#000000',
          margin: 6,
          border: '1px solid #808080'
        }}>
          {/* Header (Slide 41) */}
          <div style={{ marginBottom: 6 }}>
            <div style={{ fontSize: 18, fontWeight: 'bold' }}>BARAKAH BEPAAR</div>
            <div style={{ fontSize: 12, fontWeight: 'bold' }}>No.220,Rahat Plaza,3rd floor</div>
            <div style={{ fontSize: 12, fontWeight: 'bold' }}>Arcot Road,Vadapalani,Chennai-26</div>
            <div style={{ fontSize: 12, fontWeight: 'bold', textAlign: 'center' }}>Phone :9840048123,9600246616</div>
            <div style={{ fontSize: 12, fontWeight: 'bold', textAlign: 'center' }}>GSTIN :1234567890</div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, fontWeight: 'bold', marginBottom: 4 }}>
            <span>No: {invoice.invoiceNo}</span>
            <span>{invoice.time}</span>
            <span>{invoice.date}</span>
          </div>

          <div style={{ borderTop: '1px dashed #000', margin: '3px 0' }}></div>

          {/* Table Header */}
          <div style={{ display: 'flex', fontWeight: 'bold', fontSize: 11.5 }}>
            <span style={{ width: '44%' }}>Product</span>
            <span style={{ width: '12%', textAlign: 'right' }}>Qty</span>
            <span style={{ width: '15%', textAlign: 'right' }}>MRP</span>
            <span style={{ width: '14%', textAlign: 'right' }}>Rate</span>
            <span style={{ width: '15%', textAlign: 'right' }}>Amount</span>
          </div>

          <div style={{ borderTop: '1px dashed #000', margin: '3px 0' }}></div>

          {/* Line Items */}
          {invoice.items.map((item, idx) => (
            <div key={idx} style={{ marginBottom: 2 }}>
              <div style={{ display: 'flex', fontSize: 11.5 }}>
                <span style={{ width: '44%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.product.name}
                </span>
                <span style={{ width: '12%', textAlign: 'right' }}>
                  {item.quantity % 1 === 0 ? item.quantity : item.quantity.toFixed(2)}
                </span>
                <span style={{ width: '15%', textAlign: 'right' }}>{item.product.mrp.toFixed(2)}</span>
                <span style={{ width: '14%', textAlign: 'right' }}>{item.rate.toFixed(2)}</span>
                <span style={{ width: '15%', textAlign: 'right' }}>{item.lineValue.toFixed(2)}</span>
              </div>
              {item.product.tamilName && (
                <div style={{ fontSize: 10, color: '#222', fontFamily: "'Noto Sans Tamil', sans-serif" }}>
                  {item.product.tamilName}
                </div>
              )}
            </div>
          ))}

          <div style={{ borderTop: '1px dashed #000', margin: '4px 0' }}></div>

          {/* Totals row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 'bold' }}>
            <span>Total : {invoice.itemsCount} &nbsp; Qty: &nbsp; {invoice.items.reduce((s, i) => s + i.quantity, 0)}</span>
            <span>{invoice.grossAmount.toFixed(2)}</span>
          </div>

          <div style={{ borderTop: '1px dashed #000', margin: '4px 0' }}></div>

          {/* Large BILL AMT */}
          <div style={{ textAlign: 'center', fontFamily: 'Arial, sans-serif', fontSize: 18, fontWeight: 'bold', margin: '6px 0' }}>
            BILL AMT: ₹ {invoice.netAmount.toFixed(2)}
          </div>

          <div style={{ fontSize: 11.5, fontWeight: 'bold' }}>
            Your Savings In this Bill: {totalSavings.toFixed(2)}
          </div>
          <div style={{ fontSize: 11.5, fontWeight: 'bold' }}>
            Non Taxable Sales :{invoice.netAmount.toFixed(2)}
          </div>

          <div style={{ borderTop: '1px dashed #000', margin: '6px 0' }}></div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, fontWeight: 'bold' }}>
            <span>Paid Amt: {invoice.payment.paidAmount.toFixed(2)}</span>
            <span>Returned Amt: {invoice.payment.changeAmount.toFixed(2)}</span>
          </div>

          <div style={{ marginTop: 18, fontSize: 12, fontWeight: 'bold' }}>
            THANK YOU.VISIT AGAIN.
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, padding: 6, background: '#ECE9D8', borderTop: '1px solid #808080' }}>
          <button className="win-btn-classic" style={{ width: 95, fontWeight: 'bold' }} onClick={handlePrint}>
            {isEnglish ? 'Print (Alt+P)' : 'அச்சிடு (Alt+P)'}
          </button>
          <button className="win-btn-classic" style={{ width: 70 }} onClick={onClose}>
            {isEnglish ? 'Close' : 'மூடு'}
          </button>
        </div>
      </div>
    </div>
  );
};
