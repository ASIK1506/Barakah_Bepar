import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  X,
  Printer,
  MessageCircle
} from 'lucide-react';

export interface ToastAction {
  label: string;
  icon?: 'print' | 'whatsapp';
  onClick: () => void;
}

export interface AdminToastItem {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  meta?: string;
  action?: ToastAction;
  secondaryAction?: ToastAction;
}

export interface AdminConfirmRequest {
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
}

export interface DispatchSlipData {
  refNo: string;
  date: string;
  fromLocation: string;
  toLocation: string;
  productName: string;
  qty: number;
  unit: string;
  beforeFrom?: number;
  afterFrom?: number;
  beforeTo?: number;
  afterTo?: number;
  note?: string;
}

export type AdminNotifyFn = (toast: Omit<AdminToastItem, 'id'>) => void;
export type AdminConfirmFn = (req: AdminConfirmRequest) => void;

export const AdminToastViewport: React.FC<{
  toasts: AdminToastItem[];
  onDismiss: (id: string) => void;
}> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  const palette = {
    success: { bg: '#FFFFFF', border: '#86EFAC', accent: '#15803D', badgeBg: '#DCFCE7', Icon: CheckCircle2 },
    error: { bg: '#FFFFFF', border: '#FCA5A5', accent: '#B91C1C', badgeBg: '#FEE2E2', Icon: XCircle },
    warning: { bg: '#FFFFFF', border: '#FCD34D', accent: '#B45309', badgeBg: '#FEF3C7', Icon: AlertTriangle },
    info: { bg: '#FFFFFF', border: '#93C5FD', accent: '#1F4E63', badgeBg: '#E0F2FE', Icon: Info }
  };

  return (
    <div
      className="bb-no-print"
      style={{
        position: 'fixed',
        top: 18,
        right: 20,
        zIndex: 120,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        width: 'min(390px, 92vw)',
        pointerEvents: 'none'
      }}
    >
      {toasts.map(t => {
        const cfg = palette[t.type];
        const Icon = cfg.Icon;
        return (
          <div
            key={t.id}
            style={{
              pointerEvents: 'auto',
              background: cfg.bg,
              border: `1.5px solid ${cfg.border}`,
              borderLeft: `5px solid ${cfg.accent}`,
              borderRadius: 12,
              padding: '12px 14px',
              boxShadow: '0 12px 32px rgba(15, 23, 42, 0.16)',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              animation: 'bbSlideIn 0.18s ease-out'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  background: cfg.badgeBg,
                  color: cfg.accent,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: 1
                }}
              >
                <Icon size={17} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A' }}>{t.title}</div>
                <div style={{ fontSize: 12.5, color: '#334155', marginTop: 2, lineHeight: 1.4 }}>{t.message}</div>
                {t.meta && (
                  <div
                    style={{
                      marginTop: 6,
                      padding: '4px 8px',
                      borderRadius: 6,
                      background: '#F1F5F9',
                      fontSize: 11.5,
                      fontWeight: 600,
                      color: '#1F4E63'
                    }}
                  >
                    {t.meta}
                  </div>
                )}
              </div>
              <button
                onClick={() => onDismiss(t.id)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: '#64748B',
                  cursor: 'pointer',
                  padding: 2
                }}
                aria-label="Close notification"
              >
                <X size={15} />
              </button>
            </div>

            {(t.action || t.secondaryAction) && (
              <div style={{ display: 'flex', gap: 8, paddingLeft: 40, flexWrap: 'wrap' }}>
                {t.action && (
                  <button
                    className="bb-btn-primary"
                    style={{ padding: '4px 10px', fontSize: 11.5 }}
                    onClick={() => {
                      t.action?.onClick();
                      onDismiss(t.id);
                    }}
                  >
                    {t.action.icon === 'print' && <Printer size={12} />}
                    {t.action.icon === 'whatsapp' && <MessageCircle size={12} />}
                    {t.action.label}
                  </button>
                )}
                {t.secondaryAction && (
                  <button
                    className="bb-btn-outline"
                    style={{ padding: '4px 10px', fontSize: 11.5 }}
                    onClick={() => {
                      t.secondaryAction?.onClick();
                      onDismiss(t.id);
                    }}
                  >
                    {t.secondaryAction.icon === 'whatsapp' && <MessageCircle size={12} color="#16A34A" />}
                    {t.secondaryAction.icon === 'print' && <Printer size={12} />}
                    {t.secondaryAction.label}
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export const AdminConfirmModal: React.FC<{
  request: AdminConfirmRequest | null;
  onCancel: () => void;
}> = ({ request, onCancel }) => {
  if (!request) return null;
  return (
    <div
      className="bb-no-print"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 130,
        padding: 16
      }}
      onClick={onCancel}
    >
      <div
        className="bb-card"
        style={{ width: 'min(430px, 92vw)', padding: 0, overflow: 'hidden' }}
        onClick={e => e.stopPropagation()}
      >
        <div
          style={{
            background: request.danger ? '#991B1B' : '#1F4E63',
            color: '#FFFFFF',
            padding: '13px 18px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <span style={{ fontWeight: 700, fontSize: 14.5 }}>{request.title}</span>
          <button
            onClick={onCancel}
            style={{ border: 'none', background: 'transparent', color: '#FFFFFF', cursor: 'pointer' }}
          >
            <X size={16} />
          </button>
        </div>
        <div style={{ padding: 18 }}>
          <p style={{ margin: '0 0 18px 0', fontSize: 13.5, color: '#334155', lineHeight: 1.5 }}>
            {request.message}
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button className="bb-btn-outline" onClick={onCancel}>
              Cancel
            </button>
            <button
              className="bb-btn-primary"
              style={request.danger ? { background: '#B91C1C' } : undefined}
              onClick={() => {
                request.onConfirm();
                onCancel();
              }}
            >
              {request.confirmLabel || 'Confirm'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const DispatchSlipModal: React.FC<{
  slip: DispatchSlipData | null;
  onClose: () => void;
}> = ({ slip, onClose }) => {
  if (!slip) return null;

  const handleWhatsApp = () => {
    const msg = encodeURIComponent(
      `*BARAKAH BEPAAR — STOCK DISPATCH SLIP*\nRef: ${slip.refNo}\nDate: ${slip.date}\nRoute: ${slip.fromLocation} -> ${slip.toLocation}\nItem: *${slip.productName}*\nQuantity: *${slip.qty} ${slip.unit}*\n${slip.note ? `Note: ${slip.note}` : ''}`
    );
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  };

  return (
    <div
      className="bb-print-only-modal"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 110,
        padding: 16
      }}
      onClick={onClose}
    >
      <div className="bb-card" style={{ width: 'min(480px, 94vw)' }} onClick={e => e.stopPropagation()}>
        <div
          className="bb-no-print"
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}
        >
          <strong style={{ fontSize: 15, color: '#1F4E63' }}>Stock Transfer / Allocation Voucher</strong>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="bb-btn-outline" onClick={handleWhatsApp}>
              <MessageCircle size={14} color="#16A34A" /> WhatsApp
            </button>
            <button className="bb-btn-primary" onClick={() => window.print()}>
              <Printer size={14} /> Print Slip
            </button>
            <button className="bb-btn-outline" onClick={onClose}>
              <X size={14} />
            </button>
          </div>
        </div>

        <div style={{ border: '1.5px solid #CBD5E1', borderRadius: 10, padding: 18 }}>
          <div style={{ textAlign: 'center', borderBottom: '1px dashed #94A3B8', paddingBottom: 10, marginBottom: 12 }}>
            <div style={{ fontSize: 17, fontWeight: 800 }}>BARAKAH BEPAAR HQ</div>
            <div style={{ fontSize: 12, color: '#475569' }}>STOCK DISPATCH & TRANSFER VOUCHER</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 12.5, marginBottom: 12 }}>
            <div><strong>Voucher Ref:</strong> {slip.refNo}</div>
            <div style={{ textAlign: 'right' }}><strong>Date:</strong> {slip.date}</div>
            <div><strong>From:</strong> {slip.fromLocation}</div>
            <div style={{ textAlign: 'right' }}><strong>To:</strong> {slip.toLocation}</div>
          </div>
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, padding: 12, marginBottom: 10 }}>
            <div style={{ fontSize: 13.5, fontWeight: 700 }}>{slip.productName}</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#1F4E63', marginTop: 4 }}>
              Issued Qty: {slip.qty} {slip.unit}
            </div>
            {(slip.afterFrom !== undefined || slip.afterTo !== undefined) && (
              <div style={{ fontSize: 11.5, color: '#475569', marginTop: 6 }}>
                {slip.beforeFrom !== undefined && slip.afterFrom !== undefined && (
                  <span>Source Balance: {slip.beforeFrom} → <strong>{slip.afterFrom} {slip.unit}</strong> &nbsp;|&nbsp; </span>
                )}
                {slip.beforeTo !== undefined && slip.afterTo !== undefined && (
                  <span>Destination Balance: {slip.beforeTo} → <strong>{slip.afterTo} {slip.unit}</strong></span>
                )}
              </div>
            )}
          </div>
          {slip.note && <div style={{ fontSize: 12, color: '#64748B' }}>Note: {slip.note}</div>}
        </div>
      </div>
    </div>
  );
};
