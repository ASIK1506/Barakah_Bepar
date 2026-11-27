import React, { useState, useMemo } from 'react';
import {
  Users,
  IndianRupee,
  AlertTriangle,
  Plus,
  MessageCircle,
  CheckCircle2,
  FileText,
  Download,
  Phone,
  Search,
  X,
  CreditCard,
  ShieldAlert
} from 'lucide-react';
import {
  AdminStoreData,
  AdminCustomer,
  AdminBill,
  formatINR,
  exportRowsToCSV,
  collectCustomerUdharPayment
} from '../../lib/shopStore';
import { AdminNotifyFn, AdminConfirmFn } from './AdminNotifications';

interface AdminCustomersViewProps {
  store: AdminStoreData;
  searchQuery: string;
  initialBillLookup?: string;
  onUpdateStore: (next: AdminStoreData) => void;
  onNotify?: AdminNotifyFn;
  onConfirm?: AdminConfirmFn;
}

/* Skywalk Severity Color Coding (>= 2000 Red, >= 500 Amber, < 500 Dark Orange) */
function getCreditSeverity(balance: number): { label: string; bg: string; color: string; border: string } {
  if (balance >= 2000) {
    return { label: `Udhar: ${formatINR(balance)}`, bg: '#FEE2E2', color: '#B91C1C', border: '#FCA5A5' };
  }
  if (balance >= 500) {
    return { label: `Pending: ${formatINR(balance)}`, bg: '#FEF3C7', color: '#B45309', border: '#FCD34D' };
  }
  if (balance > 0) {
    return { label: `Pending: ${formatINR(balance)}`, bg: '#FFEDD5', color: '#C2410C', border: '#FDBA74' };
  }
  return { label: 'Settled', bg: '#DCFCE7', color: '#15803D', border: '#86EFAC' };
}

export const AdminCustomersView: React.FC<AdminCustomersViewProps> = ({
  store,
  searchQuery,
  initialBillLookup,
  onUpdateStore,
  onNotify,
  onConfirm
}) => {
  const [subTab, setSubTab] = useState<'directory' | 'bill_lookup' | 'payments'>(
    initialBillLookup ? 'bill_lookup' : 'directory'
  );
  const [filterChip, setFilterChip] = useState<'all' | 'udhar' | 'wholesale' | 'over_limit'>('all');
  const [sortMode, setSortMode] = useState<'highest_udhar' | 'name'>('highest_udhar');

  // Collect Payment modal (Skywalk _showCollectDialog)
  const [collectCust, setCollectCust] = useState<AdminCustomer | null>(null);
  const [collectAmount, setCollectAmount] = useState('');
  const [collectMethod, setCollectMethod] = useState<'CASH' | 'UPI' | 'CARD'>('CASH');
  const [collectBillNo, setCollectBillNo] = useState('');
  const [collectError, setCollectError] = useState('');

  // Customer Khata / Ledger Modal
  const [khataCust, setKhataCust] = useState<AdminCustomer | null>(null);

  // Add Customer Modal (Phone-first deduplication guard)
  const [addCustOpen, setAddCustOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newType, setNewType] = useState<'Retail' | 'Wholesale'>('Retail');
  const [newLimit, setNewLimit] = useState('5000');
  const [addCustErr, setAddCustErr] = useState('');

  // Quick New Udhar Credit Bill Modal (Skywalk Walk-in Guard & Partial split)
  const [newUdharOpen, setNewUdharOpen] = useState(false);
  const [udharCustCode, setUdharCustCode] = useState(store.customers[0]?.code || '');
  const [udharBillTotal, setUdharBillTotal] = useState('1500');
  const [udharPaidNow, setUdharPaidNow] = useState('0');
  const [udharPayMethod, setUdharPayMethod] = useState<'CASH' | 'UPI'>('CASH');

  // Bill-Number Pending Balance Lookup
  const [billLookupInput, setBillLookupInput] = useState(initialBillLookup || '');

  const paymentsLog = store.customerPayments || [];
  const totalCustomerDues = store.customers.reduce((s, c) => s + (c.balance || 0), 0);
  const customersWithDues = store.customers.filter(c => c.balance > 0);
  const totalRecovered = paymentsLog.reduce((s, p) => s + p.amount, 0);

  const filteredCustomers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return [...store.customers]
      .filter(c => {
        if (filterChip === 'udhar' && c.balance <= 0) return false;
        if (filterChip === 'wholesale' && c.customerType !== 'Wholesale') return false;
        if (filterChip === 'over_limit' && (!c.creditLimit || c.balance <= c.creditLimit)) return false;
        if (
          q &&
          !c.name.toLowerCase().includes(q) &&
          !c.phone1.includes(q) &&
          !c.code.toLowerCase().includes(q)
        ) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortMode === 'highest_udhar') return b.balance - a.balance;
        return a.name.localeCompare(b.name);
      });
  }, [store.customers, filterChip, sortMode, searchQuery]);

  const matchedBill = useMemo(() => {
    const q = billLookupInput.trim().toLowerCase();
    if (!q) return null;
    return store.bills.find(b => b.billNo.toLowerCase() === q) || null;
  }, [billLookupInput, store.bills]);

  const openCollectDialog = (c: AdminCustomer, preselectBillNo = '') => {
    setCollectCust(c);
    setCollectAmount(String(c.balance));
    setCollectMethod('CASH');
    setCollectBillNo(preselectBillNo);
    setCollectError('');
  };

  const handleConfirmCollect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!collectCust) return;
    const amt = Number(collectAmount);
    if (!amt || amt <= 0) {
      setCollectError('Enter a valid amount greater than ₹0.');
      return;
    }
    if (amt > collectCust.balance + 0.01) {
      setCollectError(`Cannot collect more than outstanding Udhar (${formatINR(collectCust.balance)}).`);
      return;
    }

    const updated = collectCustomerUdharPayment(store, {
      customerCode: collectCust.code,
      amount: amt,
      method: collectMethod,
      specificBillNo: collectBillNo || undefined
    });
    onUpdateStore(updated);
    setCollectCust(null);
  };

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    setAddCustErr('');
    const cleanPhone = newPhone.replace(/\D/g, '');
    if (!newName.trim() || cleanPhone.length < 10) {
      setAddCustErr('Customer Name and valid 10-digit Phone Number are required (Phone-First Udhar rule).');
      return;
    }
    if (store.customers.some(c => c.phone1.replace(/\D/g, '') === cleanPhone)) {
      setAddCustErr('A customer with this phone number already exists!');
      return;
    }
    const nextCode = `C${store.customers.length + 13}`;
    const created: AdminCustomer = {
      code: nextCode,
      name: newName.trim(),
      phone1: cleanPhone,
      balance: 0,
      points: 0,
      previousPurchase: new Date().toISOString().slice(0, 10),
      customerType: newType,
      creditLimit: Number(newLimit) || 5000,
      totalOrders: 0,
      totalSpent: 0
    };
    onUpdateStore({ ...store, customers: [created, ...store.customers] });
    setNewName('');
    setNewPhone('');
    setAddCustOpen(false);
  };

  const handleCreateCreditBill = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = store.customers.find(c => c.code === udharCustCode);
    const total = Math.round(Number(udharBillTotal) || 0);
    const paid = Math.min(total, Math.max(0, Math.round(Number(udharPaidNow) || 0)));
    const due = Math.max(0, total - paid);

    if (!cust || !cust.phone1.trim()) {
      onNotify?.({
        type: 'error',
        title: 'Walk-in Guard Active',
        message: 'Customer name and phone number are strictly required for Udhar sales!'
      });
      return;
    }
    if (total <= 0 || due <= 0) {
      onNotify?.({
        type: 'warning',
        title: 'Invalid Udhar Amount',
        message: 'Pending Udhar balance must be greater than ₹0.'
      });
      return;
    }

    const commitUdharBill = () => {
      const nextSeq = 119 + store.bills.length;
      const now = new Date();
      const newBill: AdminBill = {
        id: `b-${Date.now()}`,
        billNo: `SH1-0${nextSeq}`,
        shopId: store.shops[0]?.id || 'shop-1',
        shopName: store.shops[0]?.name || 'Barakah Main Store',
        date: now.toISOString().slice(0, 10),
        time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        customerCode: cust.code,
        customerName: cust.name,
        customerPhone: cust.phone1,
        cashier: 'ADMIN',
        itemsCount: 3,
        totalQty: 5,
        categorySummary: cust.customerType === 'Wholesale' ? 'Wholesale Supply' : 'Groceries',
        grossAmount: total,
        discountAmount: 0,
        costTotal: Math.round(total * 0.78),
        netAmount: total,
        paidAmount: paid,
        pendingAmount: due,
        paymentMode: paid > 0 ? udharPayMethod : 'CREDIT',
        status: 'Credit Pending',
        saleType: cust.customerType || 'Retail'
      };

      const nextCustomers = store.customers.map(c =>
        c.code === cust.code
          ? {
              ...c,
              balance: c.balance + due,
              totalOrders: (c.totalOrders || 0) + 1,
              totalSpent: (c.totalSpent || 0) + total,
              previousPurchase: newBill.date
            }
          : c
      );

      const nextPayments =
        paid > 0
          ? [
              {
                id: `cpay-${Date.now()}`,
                date: newBill.date,
                time: newBill.time,
                customerCode: cust.code,
                customerName: cust.name,
                customerPhone: cust.phone1,
                billNo: newBill.billNo,
                amount: paid,
                method: udharPayMethod,
                balanceAfter: cust.balance + due,
                note: 'Upfront partial payment on Udhar bill'
              },
              ...paymentsLog
            ]
          : paymentsLog;

      onUpdateStore({
        ...store,
        customers: nextCustomers,
        bills: [newBill, ...store.bills],
        customerPayments: nextPayments
      });
      setNewUdharOpen(false);
      onNotify?.({
        type: 'success',
        title: `${paid > 0 ? 'Partial' : 'Udhar'} Bill ${newBill.billNo} Recorded`,
        message: `Added to ${cust.name}'s Khata ledger.`,
        meta: `Pending Balance: ${formatINR(due)} · New Account Due: ${formatINR(cust.balance + due)}`
      });
    };

    if (cust.creditLimit && cust.balance + due > cust.creditLimit && onConfirm) {
      onConfirm({
        title: 'Credit Limit Warning',
        message: `${cust.name}'s new balance (${formatINR(cust.balance + due)}) exceeds their credit limit (${formatINR(cust.creditLimit)}). Proceed anyway?`,
        confirmLabel: 'Proceed Anyway',
        onConfirm: commitUdharBill
      });
      return;
    }

    commitUdharBill();
  };

  const handleSendWhatsAppReminder = (c: AdminCustomer) => {
    const custBills = store.bills.filter(
      b =>
        b.pendingAmount > 0 &&
        b.status !== 'Cancelled' &&
        (b.customerCode === c.code || b.customerName.toLowerCase() === c.name.toLowerCase())
    );
    const billsText =
      custBills.length > 0
        ? custBills.map(b => `• ${b.billNo} (${b.date}): Pending ${formatINR(b.pendingAmount)}`).join('\n')
        : `Account Balance: ${formatINR(c.balance)}`;

    const msg = encodeURIComponent(
      `*Barakah Bepaar — Payment Reminder*\nDear ${c.name},\nYour current pending Udhar balance is *${formatINR(c.balance)}*.\n\n*Pending Bills:*\n${billsText}\n\nKindly settle at your convenience. Thank you!`
    );
    const ph = c.phone1.replace(/\D/g, '');
    window.open(ph ? `https://wa.me/91${ph}?text=${msg}` : `https://wa.me/?text=${msg}`, '_blank');
  };

  const handleExportCustomersCSV = () => {
    exportRowsToCSV(
      `Barakah_Customers_Udhar_${new Date().toISOString().slice(0, 10)}.csv`,
      ['Code', 'Customer Name', 'Phone', 'Type', 'Credit Limit', 'Pending Udhar (₹)', 'Last Purchase'],
      store.customers.map(c => [
        c.code,
        c.name,
        c.phone1,
        c.customerType || 'Retail',
        c.creditLimit || 5000,
        c.balance,
        c.previousPurchase || ''
      ])
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* ====================================================================
          TOP KPI STRIP
          ==================================================================== */}
      <div className="bb-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>Customers & Udhar Khata Ledger</h2>
            <div style={{ fontSize: 12.5, color: '#64748B', marginTop: 2 }}>
              Phone-first customer tracking · Credit limits · Bill-wise Udhar settlement & Cash/UPI recovery log
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="bb-btn-outline" onClick={handleExportCustomersCSV}>
              <Download size={14} /> Export Ledger CSV
            </button>
            <button className="bb-btn-outline" onClick={() => setNewUdharOpen(true)}>
              <FileText size={14} /> + New Udhar Bill
            </button>
            <button className="bb-btn-primary" onClick={() => setAddCustOpen(true)}>
              <Plus size={14} /> Add Customer
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(185px, 1fr))', gap: 12 }}>
          <div className="bb-kpi-tile">
            <div className="bb-kpi-icon-box" style={{ background: '#E0F2FE', color: '#0369A1' }}>
              <Users size={19} />
            </div>
            <div>
              <div style={{ fontSize: 19, fontWeight: 800 }}>{store.customers.length}</div>
              <div style={{ fontSize: 12, color: '#64748B' }}>Registered Customers</div>
            </div>
          </div>

          <div className="bb-kpi-tile clickable" onClick={() => setFilterChip('udhar')}>
            <div className="bb-kpi-icon-box" style={{ background: '#FEF3C7', color: '#B45309' }}>
              <AlertTriangle size={19} />
            </div>
            <div>
              <div style={{ fontSize: 19, fontWeight: 800 }}>{customersWithDues.length}</div>
              <div style={{ fontSize: 12, color: '#64748B' }}>Customers with Udhar</div>
            </div>
          </div>

          <div className="bb-kpi-tile">
            <div className="bb-kpi-icon-box" style={{ background: '#FEE2E2', color: '#B91C1C' }}>
              <IndianRupee size={19} />
            </div>
            <div>
              <div style={{ fontSize: 19, fontWeight: 800, color: '#B91C1C' }}>{formatINR(totalCustomerDues)}</div>
              <div style={{ fontSize: 12, color: '#64748B' }}>Total Receivable Udhar</div>
            </div>
          </div>

          <div className="bb-kpi-tile clickable" onClick={() => setSubTab('payments')}>
            <div className="bb-kpi-icon-box" style={{ background: '#DCFCE7', color: '#15803D' }}>
              <CheckCircle2 size={19} />
            </div>
            <div>
              <div style={{ fontSize: 19, fontWeight: 800, color: '#15803D' }}>{formatINR(totalRecovered)}</div>
              <div style={{ fontSize: 12, color: '#64748B' }}>Recovered ({paymentsLog.length} entries)</div>
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================================
          SUB-NAVIGATION TABS
          ==================================================================== */}
      <div className="bb-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 22 }}>
            {[
              { id: 'directory', label: `Customer Udhar Directory (${store.customers.length})` },
              { id: 'bill_lookup', label: 'Bill-Number Udhar Lookup' },
              { id: 'payments', label: `Payment Collection History (${paymentsLog.length})` }
            ].map(t => (
              <button
                key={t.id}
                className={`bb-tab-btn ${subTab === t.id ? 'active' : ''}`}
                onClick={() => setSubTab(t.id as typeof subTab)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {subTab === 'directory' && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              {[
                { key: 'all', label: 'All' },
                { key: 'udhar', label: 'Credit / Udhar' },
                { key: 'wholesale', label: 'Wholesale' },
                { key: 'over_limit', label: 'Over Limit' }
              ].map(f => (
                <button
                  key={f.key}
                  onClick={() => setFilterChip(f.key as typeof filterChip)}
                  style={{
                    padding: '5px 11px',
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: '1px solid',
                    borderColor: filterChip === f.key ? '#1F4E63' : '#CBD5E1',
                    background: filterChip === f.key ? '#1F4E63' : '#FFFFFF',
                    color: filterChip === f.key ? '#FFFFFF' : '#475569'
                  }}
                >
                  {f.label}
                </button>
              ))}

              <select
                value={sortMode}
                onChange={e => setSortMode(e.target.value as typeof sortMode)}
                style={{ padding: '5px 10px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 12 }}
              >
                <option value="highest_udhar">Sort: Highest Udhar First</option>
                <option value="name">Sort: Name (A–Z)</option>
              </select>
            </div>
          )}
        </div>

        {/* TAB 1: CUSTOMER UDHAAR DIRECTORY */}
        {subTab === 'directory' && (
          <table className="bb-table">
            <thead>
              <tr>
                <th>Customer & Phone</th>
                <th>Account Type</th>
                <th>Credit Limit</th>
                <th>Udhar Balance</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map(c => {
                const sev = getCreditSeverity(c.balance);
                const overLimit = Boolean(c.creditLimit && c.balance > c.creditLimit);
                return (
                  <tr key={c.code}>
                    <td>
                      <div style={{ fontWeight: 700, fontSize: 13.5 }}>
                        {c.name}{' '}
                        <span style={{ fontSize: 11, color: '#64748B', fontWeight: 500 }}>({c.code})</span>
                      </div>
                      <div style={{ fontSize: 12, color: '#64748B', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                        <Phone size={11} /> {c.phone1} {c.tamilName ? `· ${c.tamilName}` : ''}
                      </div>
                    </td>
                    <td>
                      <span
                        style={{
                          padding: '3px 9px',
                          borderRadius: 999,
                          fontSize: 11.5,
                          fontWeight: 600,
                          background: c.customerType === 'Wholesale' ? '#EDE9FE' : '#F1F5F9',
                          color: c.customerType === 'Wholesale' ? '#5B21B6' : '#475569'
                        }}
                      >
                        {c.customerType || 'Retail'}
                      </span>
                    </td>
                    <td>
                      <div>{formatINR(c.creditLimit || 5000)}</div>
                      {overLimit && (
                        <div style={{ fontSize: 11, color: '#DC2626', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3 }}>
                          <ShieldAlert size={11} /> Over Limit
                        </div>
                      )}
                    </td>
                    <td>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '4px 10px',
                          borderRadius: 999,
                          fontSize: 12,
                          fontWeight: 700,
                          background: sev.bg,
                          color: sev.color,
                          border: `1px solid ${sev.border}`
                        }}
                      >
                        {sev.label}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {c.balance > 0 && (
                          <button
                            className="bb-btn-primary"
                            style={{ padding: '5px 10px', fontSize: 11.5 }}
                            onClick={() => openCollectDialog(c)}
                          >
                            <CreditCard size={12} /> Collect Payment
                          </button>
                        )}
                        <button
                          className="bb-btn-outline"
                          style={{ padding: '5px 10px', fontSize: 11.5 }}
                          onClick={() => setKhataCust(c)}
                        >
                          <FileText size={12} /> Khata
                        </button>
                        {c.balance > 0 && (
                          <button
                            className="bb-btn-outline"
                            style={{ padding: '5px 9px', fontSize: 11.5, color: '#15803D', borderColor: '#86EFAC' }}
                            onClick={() => handleSendWhatsAppReminder(c)}
                            title="Send WhatsApp Udhar Reminder"
                          >
                            <MessageCircle size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* TAB 2: BILL-NUMBER PENDING UDHAR LOOKUP */}
        {subTab === 'bill_lookup' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, border: '1.5px solid #1F4E63', borderRadius: 10, padding: '7px 12px', width: 290 }}>
                <Search size={16} color="#1F4E63" />
                <input
                  value={billLookupInput}
                  onChange={e => setBillLookupInput(e.target.value)}
                  placeholder="Enter Bill No (e.g. SH1-0117)"
                  style={{ border: 'none', outline: 'none', width: '100%', fontSize: 13.5 }}
                />
              </div>
              {store.bills
                .filter(b => b.pendingAmount > 0 && b.status !== 'Cancelled')
                .map(b => (
                  <button
                    key={b.id}
                    className="bb-btn-outline"
                    style={{ fontSize: 12 }}
                    onClick={() => setBillLookupInput(b.billNo)}
                  >
                    {b.billNo} ({formatINR(b.pendingAmount)})
                  </button>
                ))}
            </div>

            {matchedBill ? (
              <div style={{ border: '1px solid #CBD5E1', borderRadius: 12, padding: 16, background: '#F8FAFC' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#1F4E63' }}>
                      Bill #{matchedBill.billNo} — {matchedBill.customerName}
                    </div>
                    <div style={{ fontSize: 12.5, color: '#64748B', marginTop: 3 }}>
                      Date: {matchedBill.date} · Shop: {matchedBill.shopName} · Type: {matchedBill.saleType}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 11, color: '#64748B' }}>Bill Total</div>
                      <div style={{ fontSize: 15, fontWeight: 700 }}>{formatINR(matchedBill.netAmount)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: '#64748B' }}>Paid Amount</div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#15803D' }}>{formatINR(matchedBill.paidAmount)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: '#64748B' }}>Exact Pending</div>
                      <div style={{ fontSize: 17, fontWeight: 800, color: matchedBill.pendingAmount > 0 ? '#B91C1C' : '#15803D' }}>
                        {formatINR(matchedBill.pendingAmount)}
                      </div>
                    </div>
                    {matchedBill.pendingAmount > 0 && (
                      <button
                        className="bb-btn-primary"
                        onClick={() => {
                          const cust = store.customers.find(c => c.code === matchedBill.customerCode);
                          if (cust) openCollectDialog(cust, matchedBill.billNo);
                        }}
                      >
                        Settle Bill
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ padding: 20, textAlign: 'center', color: '#64748B', fontSize: 13 }}>
                Enter or click a pending bill number above to inspect exact bill-wise Udhar details.
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PAYMENT COLLECTION AUDIT LOG (customer_payments) */}
        {subTab === 'payments' && (
          <table className="bb-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Customer</th>
                <th>Applied Bill(s)</th>
                <th>Method</th>
                <th>Amount Paid</th>
                <th>Balance After</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              {paymentsLog.map(p => (
                <tr key={p.id}>
                  <td>
                    <div>{p.date}</div>
                    <div style={{ fontSize: 11, color: '#64748B' }}>{p.time}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{p.customerName}</div>
                    <div style={{ fontSize: 11, color: '#64748B' }}>{p.customerPhone}</div>
                  </td>
                  <td style={{ fontWeight: 600, color: '#1F4E63' }}>{p.billNo}</td>
                  <td>
                    <span style={{ padding: '2px 8px', borderRadius: 6, background: '#E0F2FE', color: '#0369A1', fontSize: 11.5, fontWeight: 700 }}>
                      {p.method}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700, color: '#15803D' }}>{formatINR(p.amount)}</td>
                  <td style={{ fontWeight: 600 }}>{formatINR(p.balanceAfter)}</td>
                  <td style={{ fontSize: 12, color: '#64748B' }}>{p.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ====================================================================
          MODAL 1: COLLECT UDHAR PAYMENT (Skywalk _showCollectDialog)
          ==================================================================== */}
      {collectCust && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 75 }}
          onClick={() => setCollectCust(null)}
        >
          <div className="bb-card" style={{ width: 'min(420px, 92vw)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ margin: 0, fontSize: 16.5, fontWeight: 700 }}>Collect Udhar Payment</h3>
              <button onClick={() => setCollectCust(null)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ background: '#FFFBEB', border: '1px solid #FCD34D', borderRadius: 10, padding: '10px 12px', marginBottom: 14 }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{collectCust.name}</div>
              <div style={{ fontSize: 12, color: '#64748B' }}>Phone: {collectCust.phone1}</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#B45309', marginTop: 4 }}>
                Outstanding Udhar: {formatINR(collectCust.balance)}
              </div>
            </div>

            <form onSubmit={handleConfirmCollect} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600 }}>Amount Collecting (₹)</label>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={collectAmount}
                  onChange={e => setCollectAmount(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #CBD5E1', marginTop: 4, fontSize: 14 }}
                  autoFocus
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600 }}>Payment Method</label>
                <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                  {(['CASH', 'UPI', 'CARD'] as const).map(m => (
                    <button
                      type="button"
                      key={m}
                      onClick={() => setCollectMethod(m)}
                      style={{
                        flex: 1,
                        padding: '7px 0',
                        borderRadius: 8,
                        fontWeight: 700,
                        fontSize: 12.5,
                        cursor: 'pointer',
                        border: '1.5px solid',
                        borderColor: collectMethod === m ? '#1F4E63' : '#CBD5E1',
                        background: collectMethod === m ? '#E0F2FE' : '#FFFFFF',
                        color: collectMethod === m ? '#1F4E63' : '#475569'
                      }}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {collectError && (
                <div style={{ fontSize: 12, color: '#B91C1C', fontWeight: 600 }}>{collectError}</div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 6 }}>
                <button type="button" className="bb-btn-outline" onClick={() => setCollectCust(null)}>
                  Cancel
                </button>
                <button type="submit" className="bb-btn-primary">
                  Confirm Collection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL 2: CUSTOMER KHATA STATEMENT
          ==================================================================== */}
      {khataCust && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 75 }}
          onClick={() => setKhataCust(null)}
        >
          <div className="bb-card" style={{ width: 'min(580px, 94vw)', maxHeight: '85vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 16.5, fontWeight: 700 }}>Customer Khata: {khataCust.name}</h3>
                <div style={{ fontSize: 12, color: '#64748B' }}>
                  {khataCust.phone1} · Balance Due: <strong style={{ color: '#B91C1C' }}>{formatINR(khataCust.balance)}</strong>
                </div>
              </div>
              <button onClick={() => setKhataCust(null)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 6 }}>Linked Bills</div>
            <table className="bb-table" style={{ marginBottom: 16 }}>
              <thead>
                <tr><th>Bill No</th><th>Date</th><th>Total</th><th>Paid</th><th>Pending</th></tr>
              </thead>
              <tbody>
                {store.bills
                  .filter(b => b.customerCode === khataCust.code || b.customerName.toLowerCase() === khataCust.name.toLowerCase())
                  .map(b => (
                    <tr key={b.id}>
                      <td style={{ fontWeight: 700 }}>{b.billNo}</td>
                      <td>{b.date}</td>
                      <td>{formatINR(b.netAmount)}</td>
                      <td style={{ color: '#15803D' }}>{formatINR(b.paidAmount)}</td>
                      <td style={{ fontWeight: 700, color: b.pendingAmount > 0 ? '#B91C1C' : '#64748B' }}>
                        {formatINR(b.pendingAmount)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>

            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 6 }}>Payment Recoveries</div>
            <table className="bb-table">
              <thead>
                <tr><th>Date</th><th>Bill(s)</th><th>Method</th><th>Amount</th><th>Balance After</th></tr>
              </thead>
              <tbody>
                {paymentsLog
                  .filter(p => p.customerCode === khataCust.code)
                  .map(p => (
                    <tr key={p.id}>
                      <td>{p.date}</td>
                      <td>{p.billNo}</td>
                      <td>{p.method}</td>
                      <td style={{ fontWeight: 700, color: '#15803D' }}>{formatINR(p.amount)}</td>
                      <td>{formatINR(p.balanceAfter)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL 3: ADD CUSTOMER (Phone-first deduplication)
          ==================================================================== */}
      {addCustOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 75 }}
          onClick={() => setAddCustOpen(false)}
        >
          <div className="bb-card" style={{ width: 'min(420px, 92vw)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ margin: 0, fontSize: 16.5, fontWeight: 700 }}>Add Customer Account</h3>
              <button onClick={() => setAddCustOpen(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddCustomer} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600 }}>Customer / Shop Name *</label>
                <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Madurai Stores" style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #CBD5E1', marginTop: 4 }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600 }}>Phone Number * (Unique Key)</label>
                <input value={newPhone} onChange={e => setNewPhone(e.target.value)} placeholder="10-digit mobile" style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #CBD5E1', marginTop: 4 }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600 }}>Account Type</label>
                  <select value={newType} onChange={e => setNewType(e.target.value as 'Retail' | 'Wholesale')} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #CBD5E1', marginTop: 4 }}>
                    <option value="Retail">Retail</option>
                    <option value="Wholesale">Wholesale</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600 }}>Credit Limit (₹)</label>
                  <input type="number" value={newLimit} onChange={e => setNewLimit(e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #CBD5E1', marginTop: 4 }} />
                </div>
              </div>
              {addCustErr && <div style={{ color: '#B91C1C', fontSize: 12, fontWeight: 600 }}>{addCustErr}</div>}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button type="button" className="bb-btn-outline" onClick={() => setAddCustOpen(false)}>Cancel</button>
                <button type="submit" className="bb-btn-primary">Save Customer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL 4: QUICK UDHAR BILL ENTRY (Skywalk Partial/Full Udhar demo)
          ==================================================================== */}
      {newUdharOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 75 }}
          onClick={() => setNewUdharOpen(false)}
        >
          <div className="bb-card" style={{ width: 'min(420px, 92vw)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ margin: 0, fontSize: 16.5, fontWeight: 700 }}>Record Credit / Udhar Bill</h3>
              <button onClick={() => setNewUdharOpen(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateCreditBill} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600 }}>Select Customer (Walk-in Blocked)</label>
                <select value={udharCustCode} onChange={e => setUdharCustCode(e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #CBD5E1', marginTop: 4 }}>
                  {store.customers.map(c => (
                    <option key={c.code} value={c.code}>
                      {c.name} ({c.phone1}) — Cur Due: {formatINR(c.balance)}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600 }}>Bill Total (₹)</label>
                  <input type="number" min="1" value={udharBillTotal} onChange={e => setUdharBillTotal(e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #CBD5E1', marginTop: 4 }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600 }}>Upfront Paid (₹)</label>
                  <input type="number" min="0" value={udharPaidNow} onChange={e => setUdharPaidNow(e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #CBD5E1', marginTop: 4 }} />
                </div>
              </div>
              <div style={{ background: '#FFFBEB', padding: 10, borderRadius: 8, fontSize: 13, fontWeight: 700, color: '#B45309' }}>
                Pending Udhar Added: {formatINR(Math.max(0, (Number(udharBillTotal) || 0) - (Number(udharPaidNow) || 0)))}
              </div>
              {Number(udharPaidNow) > 0 && (
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600 }}>Upfront Paid Via</label>
                  <select value={udharPayMethod} onChange={e => setUdharPayMethod(e.target.value as 'CASH' | 'UPI')} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #CBD5E1', marginTop: 4 }}>
                    <option value="CASH">Cash</option>
                    <option value="UPI">UPI</option>
                  </select>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button type="button" className="bb-btn-outline" onClick={() => setNewUdharOpen(false)}>Cancel</button>
                <button type="submit" className="bb-btn-primary">Create Udhar Bill</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
