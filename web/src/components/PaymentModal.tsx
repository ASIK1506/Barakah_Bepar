import React, { useState, useEffect } from 'react';
import { PaymentDetails } from '../types';
import '../styles/classicTheme.css';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  netAmount: number;
  onConfirmPayment: (payment: PaymentDetails) => void;
  isEnglish?: boolean;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  netAmount,
  onConfirmPayment,
  isEnglish = true
}) => {
  const [tenderMode, setTenderMode] = useState<'CASH' | 'CARD' | 'SODEXHO' | 'CHQ/DD' | 'CREDIT'>('CASH');
  const [paidCash, setPaidCash] = useState<string>(netAmount.toFixed(2));
  const [cardNumber, setCardNumber] = useState('');
  const [cardBank, setCardBank] = useState('');
  const [cardSurcharge, setCardSurcharge] = useState('0.0');

  // Sodexho denominations (Slide 36)
  const SODEXHO_DENOMS = [5, 10, 20, 30, 50, 100, 150, 500];
  const [coupons, setCoupons] = useState<{ [denom: number]: number }>({
    5: 0, 10: 0, 20: 0, 30: 0, 50: 0, 100: 0, 150: 0, 500: 0
  });

  useEffect(() => {
    if (isOpen) {
      setPaidCash(netAmount.toFixed(2));
    }
  }, [isOpen, netAmount]);

  if (!isOpen) return null;

  const totalCoupons = Object.entries(coupons).reduce((sum, [d, count]) => sum + (Number(d) * (count || 0)), 0);
  const paidVal = parseFloat(paidCash) || 0;
  const changeDue = Math.max(0, paidVal - netAmount);
  const surchargePercent = parseFloat(cardSurcharge) || 0;
  const surchargeAmt = (netAmount * surchargePercent) / 100;
  const cardTotal = netAmount + surchargeAmt;

  const handleCouponChange = (denom: number, countStr: string) => {
    const count = parseInt(countStr) || 0;
    setCoupons(prev => ({ ...prev, [denom]: count }));
  };

  const handleConfirm = () => {
    let payment: PaymentDetails;
    if (tenderMode === 'CASH') {
      payment = {
        mode: 'CASH',
        amount: netAmount,
        paidAmount: paidVal,
        changeAmount: changeDue
      };
    } else if (tenderMode === 'CARD') {
      payment = {
        mode: 'CARD',
        amount: cardTotal,
        paidAmount: cardTotal,
        changeAmount: 0,
        cardNumber,
        bankName: cardBank,
        cardSurchargePercent: surchargePercent
      };
    } else if (tenderMode === 'SODEXHO') {
      payment = {
        mode: 'SODEXHO',
        amount: netAmount,
        paidAmount: totalCoupons,
        changeAmount: Math.max(0, totalCoupons - netAmount),
        sodexhoCoupons: coupons
      };
    } else {
      payment = {
        mode: tenderMode,
        amount: netAmount,
        paidAmount: netAmount,
        changeAmount: 0
      };
    }
    onConfirmPayment(payment);
  };

  return (
    <div className="win-modal-overlay">
      <div className="win-modal-window" style={{ width: 580 }}>
        {/* Title Bar matching Slide 36 */}
        <div className="win-modal-titlebar">
          <span>{isEnglish ? 'CARD/SODEXHO/CHEQUE/OTHERS' : 'கார்டு / சோடெக்சோ / காசோலை / மற்றவை'}</span>
          <button className="win-control-btn" style={{ color: '#B91C1C' }} onClick={onClose}>✕</button>
        </div>

        <div style={{ padding: 10, background: '#ECE9D8' }}>
          {/* Radio Group matching Slide 36 */}
          <fieldset style={{ border: '1px solid #808080', padding: '6px 8px', marginBottom: 8 }}>
            <legend style={{ color: '#000080', fontWeight: 'bold', fontSize: 11 }}>
              {isEnglish ? 'CARD/SODEXHO/CHEQUE/OTHERS' : 'பணம் செலுத்தும் முறை'}
            </legend>

            <div style={{ display: 'flex', gap: 12, marginBottom: 8, fontSize: 11, fontWeight: 'bold' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 3, cursor: 'pointer' }}>
                <input type="radio" name="tender" checked={tenderMode === 'CASH'} onChange={() => setTenderMode('CASH')} /> {isEnglish ? 'CASH' : 'ரொக்கம்'}
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 3, cursor: 'pointer' }}>
                <input type="radio" name="tender" checked={tenderMode === 'CARD'} onChange={() => setTenderMode('CARD')} /> {isEnglish ? 'CARD' : 'கார்டு'}
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 3, cursor: 'pointer' }}>
                <input type="radio" name="tender" checked={tenderMode === 'SODEXHO'} onChange={() => setTenderMode('SODEXHO')} /> {isEnglish ? 'SODEXHO' : 'சோடெக்சோ'}
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 3, cursor: 'pointer' }}>
                <input type="radio" name="tender" checked={tenderMode === 'CHQ/DD'} onChange={() => setTenderMode('CHQ/DD')} /> {isEnglish ? 'CHQ/DD' : 'காசோலை'}
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 3, cursor: 'pointer' }}>
                <input type="radio" name="tender" checked={tenderMode === 'CREDIT'} onChange={() => setTenderMode('CREDIT')} /> {isEnglish ? 'OTHERS' : 'மற்றவை'}
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 225px', gap: 10 }}>
              {/* LEFT SIDE: TENDER INPUTS (Pink background matching Slide 36) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 11 }}>
                {tenderMode === 'CASH' ? (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: '85px 1fr', alignItems: 'center' }}>
                      <span style={{ color: '#800000', fontWeight: 'bold' }}>{isEnglish ? 'Bill Amount' : 'பில் தொகை'}</span>
                      <input type="text" className="win-input-classic" style={{ background: '#F8D0F0', fontWeight: 'bold' }} readOnly value={netAmount.toFixed(2)} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '85px 1fr', alignItems: 'center' }}>
                      <span style={{ color: '#800000', fontWeight: 'bold' }}>{isEnglish ? 'Cash Paid' : 'பெற்ற தொகை'}</span>
                      <input
                        type="number"
                        className="win-input-barcode-yellow"
                        style={{ fontWeight: 'bold', fontSize: 13 }}
                        autoFocus
                        value={paidCash}
                        onChange={(e) => setPaidCash(e.target.value)}
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '85px 1fr', alignItems: 'center' }}>
                      <span style={{ color: '#CC0000', fontWeight: 'bold' }}>{isEnglish ? 'Change' : 'மீதி'}</span>
                      <input type="text" className="win-input-classic" style={{ background: '#FFF', color: '#CC0000', fontWeight: 'bold', fontSize: 14 }} readOnly value={changeDue.toFixed(2)} />
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: '65px 1fr', alignItems: 'center' }}>
                      <span style={{ color: '#800000', fontWeight: 'bold' }}>{isEnglish ? 'Number' : 'எண்'}</span>
                      <input type="text" className="win-input-classic" style={{ background: '#F8D0F0' }} value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '65px 1fr', alignItems: 'center' }}>
                      <span style={{ color: '#800000', fontWeight: 'bold' }}>{isEnglish ? 'Bank' : 'வங்கி'}</span>
                      <input type="text" className="win-input-classic" style={{ background: '#F8D0F0' }} value={cardBank} onChange={(e) => setCardBank(e.target.value)} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '65px 95px 1fr', gap: 6, alignItems: 'center' }}>
                      <span style={{ color: '#800000', fontWeight: 'bold' }}>{isEnglish ? 'Amount' : 'தொகை'}</span>
                      <input type="text" className="win-input-classic" style={{ background: '#F8D0F0', fontWeight: 'bold' }} readOnly value={netAmount.toFixed(2)} />
                      <span style={{ color: '#800000', fontWeight: 'bold', fontSize: 10.5 }}>{isEnglish ? 'Total Amount' : 'மொத்த தொகை'}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '65px 45px 45px 1fr', gap: 4, alignItems: 'center' }}>
                      <span style={{ color: '#800000', fontWeight: 'bold' }}>{isEnglish ? 'Card %' : 'கார்டு %'}</span>
                      <input type="text" className="win-input-classic" style={{ background: '#F8D0F0' }} value={cardSurcharge} onChange={(e) => setCardSurcharge(e.target.value)} />
                      <input type="text" className="win-input-classic" style={{ background: '#F8D0F0' }} readOnly value={surchargeAmt.toFixed(2)} />
                      <input type="text" className="win-input-classic" style={{ background: '#F8D0F0', fontWeight: 'bold' }} readOnly value={cardTotal.toFixed(2)} />
                    </div>
                  </>
                )}
              </div>

              {/* RIGHT SIDE: SODEXHO DENOMINATIONS TABLE (Exact Slide 36 Table) */}
              <div style={{ border: '1px solid #808080', background: '#FFFFFF' }}>
                <table className="vanigam-grid" style={{ fontSize: 11 }}>
                  <thead>
                    <tr>
                      <th style={{ width: 65 }}>{isEnglish ? 'Denom' : 'மதிப்பு'}</th>
                      <th style={{ width: 65, textAlign: 'right' }}>{isEnglish ? "No's" : 'எண்'}</th>
                      <th style={{ textAlign: 'right' }}>{isEnglish ? 'Value' : 'தொகை'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SODEXHO_DENOMS.map(denom => {
                      const cnt = coupons[denom] || 0;
                      const val = denom * cnt;
                      return (
                        <tr key={denom}>
                          <td style={{ fontWeight: 'bold', textAlign: 'right' }}>{denom} X</td>
                          <td style={{ padding: 0 }}>
                            <input
                              type="number"
                              min="0"
                              style={{ width: '100%', height: 19, border: 'none', background: '#F8D0F0', textAlign: 'right', paddingRight: 4, fontSize: 11, boxSizing: 'border-box', fontWeight: 'bold' }}
                              value={cnt}
                              onChange={(e) => handleCouponChange(denom, e.target.value)}
                            />
                          </td>
                          <td style={{ textAlign: 'right', background: '#F8D0F0' }}>{val > 0 ? val.toFixed(2) : ''}</td>
                        </tr>
                      );
                    })}
                    <tr style={{ fontWeight: 'bold', background: '#F8D0F0' }}>
                      <td></td>
                      <td style={{ textAlign: 'center' }}>{isEnglish ? 'Total' : 'மொத்தம்'}</td>
                      <td style={{ textAlign: 'right' }}>{totalCoupons.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </fieldset>

          {/* Footer Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button className="win-btn-classic" style={{ width: 110, height: 24, fontWeight: 'bold' }} onClick={handleConfirm}>
              {isEnglish ? 'Accept & Save' : 'ஏற்று சேமி'}
            </button>
            <button className="win-btn-classic" style={{ width: 80, height: 24 }} onClick={onClose}>
              {isEnglish ? 'Cancel' : 'ரத்து'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
