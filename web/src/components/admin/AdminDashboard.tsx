import React from 'react';
import {
  TrendingUp,
  IndianRupee,
  Wallet,
  Package,
  AlertTriangle,
  PackageX,
  Users,
  MoreVertical,
  ArrowUpRight,
  MessageCircle,
  Store
} from 'lucide-react';
import {
  AdminStoreData,
  MAX_STANDARD_SHOPS,
  formatINR,
  buildDailyClosingWhatsAppMessage
} from '../../lib/shopStore';
import { DonutChart, ExpenseProfitAreaChart } from './AdminCharts';
import { InsightsChart } from './InsightsChart';

interface AdminDashboardProps {
  store: AdminStoreData;
  searchQuery: string;
  onNavigate: (tab: string, contextBillNo?: string) => void;
  onOpenAlertDrawer: (mode: 'low' | 'out' | 'udhaar') => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  store,
  searchQuery,
  onNavigate,
  onOpenAlertDrawer
}) => {
  const today = new Date().toISOString().slice(0, 10);
  const weekAgo = new Date(Date.now() - 6 * 86400000).toISOString().slice(0, 10);

  const activeBills = store.bills.filter(b => b.status !== 'Cancelled');
  const todayBills = activeBills.filter(b => b.date === today);
  const weekBills = activeBills.filter(b => b.date >= weekAgo);

  const todaySales = todayBills.reduce((s, b) => s + b.netAmount, 0);
  const weekSales = weekBills.reduce((s, b) => s + b.netAmount, 0);
  const todayExpenses = store.expenses.filter(e => e.date === today).reduce((s, e) => s + e.amount, 0);
  const todayProfit = todayBills.reduce((s, b) => s + (b.netAmount - b.costTotal), 0) - todayExpenses;

  const stockValue = store.products.reduce((s, p) => s + p.rate * p.currentStock, 0);
  const stockCost = store.products.reduce((s, p) => s + p.purchasePrice * p.currentStock, 0);

  const lowStockCount = store.products.filter(p => p.currentStock > 0 && p.currentStock <= p.lowStockThreshold).length;
  const outOfStockCount = store.products.filter(p => p.currentStock <= 0).length;

  const totalPendingUdhaar = activeBills.reduce((s, b) => s + b.pendingAmount, 0);
  const vendorDuesTotal = store.vendors.reduce((s, v) => s + v.balanceDue, 0);

  // Payment breakdown across recent bills
  const cashTotal = activeBills.filter(b => b.paymentMode === 'CASH').reduce((s, b) => s + b.paidAmount, 0);
  const upiTotal = activeBills.filter(b => b.paymentMode === 'UPI').reduce((s, b) => s + b.paidAmount, 0);
  const cardCreditTotal = activeBills
    .filter(b => b.paymentMode === 'CARD' || b.paymentMode === 'CREDIT')
    .reduce((s, b) => s + b.paidAmount, 0);

  // Top Selling Products (computed from products + demo volume)
  const topProducts = [...store.products]
    .filter(p => !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .map((p, idx) => ({
      name: p.name,
      amount: Math.round((p.rate * (38 - idx * 2.4)) + (idx === 0 ? 1200 : 400))
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 10);
  const maxProductSale = Math.max(...topProducts.map(x => x.amount), 1);

  // 6-Month Expense vs Profit trend (realistic supermarket baseline + current month live profit/expense)
  const monthExpense = store.expenses.reduce((s, e) => s + e.amount, 0);
  const monthProfit = activeBills.reduce((s, b) => s + (b.netAmount - b.costTotal), 0);
  const expenseProfitTrend = [
    { month: 'Jun', profit: 24500, expense: 19200 },
    { month: 'Jul', profit: 21000, expense: 23800 },
    { month: 'Aug', profit: 28400, expense: 20500 },
    { month: 'Sep', profit: 26200, expense: 31400 },
    { month: 'Oct', profit: 33900, expense: 22100 },
    { month: 'Nov', profit: Math.max(36500, monthProfit), expense: Math.max(18500, monthExpense) }
  ];

  const handleWhatsAppClosingReport = () => {
    const text = encodeURIComponent(buildDailyClosingWhatsAppMessage(store));
    const phone = (store.ownerWhatsapp || '').replace(/\D/g, '');
    const url = phone ? `https://wa.me/91${phone}?text=${text}` : `https://wa.me/?text=${text}`;
    window.open(url, '_blank');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* ====================================================================
          SECTION 1: OVER VIEW CARD (Screenshot 1 Layout + Skywalk 7 KPI Brief)
          ==================================================================== */}
      <div className="bb-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h2 style={{ margin: 0, fontSize: 16.5, fontWeight: 700 }}>Over View</h2>
            <span
              style={{
                background: '#DCFCE7',
                color: '#166534',
                fontSize: 11,
                fontWeight: 700,
                padding: '3px 9px',
                borderRadius: 999
              }}
            >
              {store.shops.length} / {MAX_STANDARD_SHOPS} Shops Active
            </span>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="bb-btn-outline" onClick={handleWhatsAppClosingReport}>
              <MessageCircle size={14} color="#16A34A" />
              WhatsApp Daily Summary
            </button>
            <button className="bb-btn-primary" onClick={() => onNavigate('shops')}>
              <Store size={14} />
              Manage Shops
            </button>
          </div>
        </div>

        {/* Skywalk Executive 7-KPI Responsive Grid inside Screenshot 1 Tile Style */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(168px, 1fr))',
            gap: 12
          }}
        >
          {/* 1. Today Sales */}
          <div className="bb-kpi-tile clickable" onClick={() => onNavigate('orders')}>
            <div className="bb-kpi-icon-box" style={{ background: '#DCFCE7', color: '#15803D' }}>
              <IndianRupee size={19} />
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{formatINR(todaySales)}</div>
              <div style={{ fontSize: 12, color: '#64748B' }}>Today Sales ({todayBills.length} bills)</div>
            </div>
          </div>

          {/* 2. Week Sales */}
          <div className="bb-kpi-tile clickable" onClick={() => onNavigate('reporting')}>
            <div className="bb-kpi-icon-box" style={{ background: '#E0F2FE', color: '#0369A1' }}>
              <TrendingUp size={19} />
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{formatINR(weekSales)}</div>
              <div style={{ fontSize: 12, color: '#64748B' }}>Week Sales (7 Days)</div>
            </div>
          </div>

          {/* 3. Today Profit */}
          <div className="bb-kpi-tile">
            <div
              className="bb-kpi-icon-box"
              style={{
                background: todayProfit >= 0 ? '#D1FAE5' : '#FEE2E2',
                color: todayProfit >= 0 ? '#047857' : '#B91C1C'
              }}
            >
              <TrendingUp size={19} />
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{formatINR(todayProfit)}</div>
              <div style={{ fontSize: 12, color: '#64748B' }}>
                Today Profit ({todayProfit >= 0 ? 'Positive' : 'Deficit'})
              </div>
            </div>
          </div>

          {/* 4. Today Expenses */}
          <div className="bb-kpi-tile clickable" onClick={() => onNavigate('purchase')}>
            <div className="bb-kpi-icon-box" style={{ background: '#FEE2E2', color: '#DC2626' }}>
              <Wallet size={19} />
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{formatINR(todayExpenses)}</div>
              <div style={{ fontSize: 12, color: '#64748B' }}>Today Expenses</div>
            </div>
          </div>

          {/* 5. Stock Value */}
          <div className="bb-kpi-tile clickable" onClick={() => onNavigate('inventory')}>
            <div className="bb-kpi-icon-box" style={{ background: '#E6F4F1', color: '#1F4E63' }}>
              <Package size={19} />
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{formatINR(stockValue, true)}</div>
              <div style={{ fontSize: 12, color: '#64748B' }}>Cost: {formatINR(stockCost, true)}</div>
            </div>
          </div>

          {/* 6. Low Stock */}
          <div
            className="bb-kpi-tile clickable"
            style={{ borderColor: lowStockCount > 0 ? '#FCD34D' : undefined }}
            onClick={() => onOpenAlertDrawer('low')}
          >
            <div className="bb-kpi-icon-box" style={{ background: '#FEF3C7', color: '#B45309' }}>
              <AlertTriangle size={19} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{lowStockCount}</div>
              <div style={{ fontSize: 12, color: '#64748B' }}>Low Stock</div>
            </div>
            <ArrowUpRight size={14} color="#B45309" />
          </div>

          {/* 7. Out of Stock (Peach alert styling matching Screenshot 1 right tile) */}
          <div
            className="bb-kpi-tile clickable"
            style={{
              background: outOfStockCount > 0 ? '#FDF2EE' : undefined,
              borderColor: outOfStockCount > 0 ? '#E5B6A5' : undefined
            }}
            onClick={() => onOpenAlertDrawer('out')}
          >
            <div className="bb-kpi-icon-box" style={{ background: '#F7D7CC', color: '#9A3412' }}>
              <PackageX size={19} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#1E293B' }}>{outOfStockCount}</div>
              <div style={{ fontSize: 12, color: '#64748B' }}>Out of Stock</div>
            </div>
            <ArrowUpRight size={14} color="#9A3412" />
          </div>
        </div>
      </div>

      {/* ====================================================================
          SECTION 2 & 3: MIDDLE + BOTTOM GRID (Exact Screenshot 1 Proportions)
          ==================================================================== */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 2.2fr) minmax(290px, 1.05fr)',
          gap: 18,
          alignItems: 'stretch'
        }}
      >
        {/* Left Column: Top 2 sub-cards + Bottom Expense vs Profit chart */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Row: No of Customers/Udhaar + Inventory/Payment Donut */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(180px, 0.85fr) minmax(260px, 1.55fr)',
              gap: 18
            }}
          >
            {/* Card: No of Customers & Pending Udhaar */}
            <div className="bb-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 15, fontWeight: 600 }}>Customers & Udhaar</span>
                <button
                  onClick={() => onOpenAlertDrawer('udhaar')}
                  style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748B' }}
                  title="View Pending Udhaar"
                >
                  <MoreVertical size={16} />
                </button>
              </div>

              <div style={{ margin: '14px 0' }}>
                <div
                  style={{
                    width: 44,
                    height: 36,
                    borderRadius: 8,
                    background: '#D7E6EE',
                    border: '1px solid #93B5C6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#1F4E63',
                    marginBottom: 12
                  }}
                >
                  <Users size={19} />
                </div>
                <div style={{ fontSize: 22, fontWeight: 800 }}>{store.customers.length} Active</div>
                <div style={{ fontSize: 12.5, color: '#64748B', marginTop: 2 }}>
                  Pending Udhaar: <strong style={{ color: '#B45309' }}>{formatINR(totalPendingUdhaar)}</strong>
                </div>
              </div>

              <button
                className="bb-btn-outline"
                style={{ width: '100%', justifyContent: 'center', fontSize: 11.5 }}
                onClick={() => onNavigate('customers')}
              >
                Open Customers & Udhar
              </button>
            </div>

            {/* Card: Payment & Sales Channel Mix Donut (Screenshot 1 "Inventory Values" visual) */}
            <div className="bb-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 15, fontWeight: 600 }}>Sales by Payment Mix</span>
                <span style={{ fontSize: 11.5, color: '#64748B' }}>All Active Bills</span>
              </div>
              <DonutChart
                slices={[
                  {
                    label: 'UPI / Digital',
                    value: Math.max(upiTotal, 1),
                    color: '#BACCD7',
                    amountText: formatINR(upiTotal)
                  },
                  {
                    label: 'Cash + Card',
                    value: Math.max(cashTotal + cardCreditTotal, 1),
                    color: '#5B7B8B',
                    amountText: formatINR(cashTotal + cardCreditTotal)
                  }
                ]}
              />
            </div>
          </div>

          {/* Bottom Left Card: Expense vs Profit (Last 6 Months) */}
          <div className="bb-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 15.5, fontWeight: 700 }}>Expense vs Profit</span>
              <span style={{ fontSize: 12.5, color: '#64748B' }}>Last 6 months · Interactive Hover</span>
            </div>
            <ExpenseProfitAreaChart data={expenseProfitTrend} />
          </div>
        </div>

        {/* Right Column: Top Selling Products / Store Performance (Screenshot 1 tall right card) */}
        <div className="bb-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <span style={{ fontSize: 15.5, fontWeight: 700 }}>Top 10 Selling Products</span>
              <button
                onClick={() => onNavigate('reporting')}
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: '#1F4E63',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Full Report
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
              {topProducts.map((item, idx) => {
                const widthPct = Math.max(12, Math.round((item.amount / maxProductSale) * 100));
                return (
                  <div
                    key={idx}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '112px 1fr 56px',
                      alignItems: 'center',
                      gap: 10
                    }}
                  >
                    <span
                      style={{
                        fontSize: 12.5,
                        color: '#475569',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                      title={item.name}
                    >
                      {item.name}
                    </span>
                    <div style={{ height: 10, background: '#EFF5F8', borderRadius: 99, overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${widthPct}%`,
                          height: '100%',
                          background: '#5B7B8B',
                          borderRadius: 99
                        }}
                      />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, textAlign: 'right', color: '#334155' }}>
                      {formatINR(item.amount, true)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Demo Shop & Vendor Dues Summary Footer */}
          <div
            style={{
              marginTop: 18,
              paddingTop: 12,
              borderTop: '1px dashed #CBD5E1',
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 12
            }}
          >
            <div>
              <div style={{ color: '#64748B' }}>Demo Shop Active</div>
              <div style={{ fontWeight: 700 }}>{store.shops[0]?.name}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: '#64748B' }}>Vendor Payables</div>
              <div style={{ fontWeight: 700, color: '#B91C1C' }}>{formatINR(vendorDuesTotal)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================================
          SECTION 3.5: HOURLY & WEEKLY SHOP TRANSACTIONS INSIGHTS CHART
          ==================================================================== */}
      <InsightsChart bills={store.bills} shops={store.shops} />

      {/* ====================================================================
          SECTION 4: SKYWALK RECENT BILLS & FINANCIAL MONITORING STRIP
          ==================================================================== */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 18
        }}
      >
        {/* Recent Bills */}
        <div className="bb-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 15, fontWeight: 700 }}>Recent Transactions</span>
            <button
              onClick={() => onNavigate('orders')}
              style={{ border: 'none', background: 'transparent', color: '#1F4E63', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
            >
              View All
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {store.bills.slice(0, 4).map(bill => (
              <div
                key={bill.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 10px',
                  borderRadius: 8,
                  background: '#F8FAFC',
                  cursor: 'pointer'
                }}
                onClick={() => onNavigate('orders', bill.billNo)}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{bill.billNo} · {bill.customerName}</div>
                  <div style={{ fontSize: 11.5, color: '#64748B' }}>{bill.date} · {bill.paymentMode} ({bill.saleType})</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: '#15803D' }}>{formatINR(bill.netAmount)}</div>
                  {bill.pendingAmount > 0 && (
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#B45309' }}>Due: {formatINR(bill.pendingAmount)}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Customer Udhaar & Vendor Payables */}
        <div className="bb-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 15, fontWeight: 700 }}>Credit (Udhaar) & Vendor Monitoring</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#B45309' }}>
              Receivable: {formatINR(totalPendingUdhaar)}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {activeBills
              .filter(b => b.pendingAmount > 0)
              .map(b => (
                <div
                  key={b.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 10px',
                    borderRadius: 8,
                    background: '#FFFBEB',
                    border: '1px solid #FDE68A'
                  }}
                >
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{b.billNo} — {b.customerName}</div>
                    <div style={{ fontSize: 11, color: '#64748B' }}>
                      Bill: {formatINR(b.netAmount)} | Paid: {formatINR(b.paidAmount)}
                    </div>
                  </div>
                  <button
                    className="bb-btn-primary"
                    style={{ padding: '5px 10px', fontSize: 11.5 }}
                    onClick={() => onNavigate('orders', b.billNo)}
                  >
                    Pending {formatINR(b.pendingAmount)}
                  </button>
                </div>
              ))}
            {store.vendors
              .filter(v => v.balanceDue > 0)
              .map(v => (
                <div
                  key={v.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 10px',
                    borderRadius: 8,
                    background: '#FEF2F2',
                    border: '1px solid #FECACA'
                  }}
                >
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>Vendor: {v.name}</div>
                    <div style={{ fontSize: 11, color: '#64748B' }}>{v.category} · Ph: {v.phone}</div>
                  </div>
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: '#B91C1C' }}>
                    Payable {formatINR(v.balanceDue)}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};
