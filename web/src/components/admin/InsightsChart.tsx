import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { Store } from 'lucide-react';
import { AdminBill, ShopProfile, formatINR } from '../../lib/shopStore';

export type TrafficViewMode = 'hourly' | 'weekly' | 'daily14';

interface HourlySlot {
  hour: string;
  count: number;
  sales: number;
}

interface DailySlot {
  day: string;
  count: number;
  sales: number;
}

const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const FALLBACK_HOURLY: HourlySlot[] = Array.from({ length: 12 }, (_, i) => ({
  hour: String(i * 2).padStart(2, '0'),
  count: 0,
  sales: 0
}));

function parseBillHour(timeStr?: string): number {
  if (!timeStr) return 12;
  const cleaned = timeStr.trim().toUpperCase();
  const isPM = cleaned.includes('PM');
  const isAM = cleaned.includes('AM');
  const match = cleaned.match(/(\d{1,2})/);
  if (!match) return 12;
  let hour = parseInt(match[1], 10);
  if (Number.isNaN(hour)) return 12;
  if (isPM && hour < 12) hour += 12;
  if (isAM && hour === 12) hour = 0;
  return Math.max(0, Math.min(23, hour));
}

function getLocalISODate(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span
        style={{
          width: 9,
          height: 9,
          borderRadius: 3,
          background: color,
          display: 'inline-block'
        }}
      />
      <span>{label}</span>
    </span>
  );
}

interface InsightsChartProps {
  bills: AdminBill[];
  shops: ShopProfile[];
}

export const InsightsChart: React.FC<InsightsChartProps> = ({ bills, shops }) => {
  const [trafficView, setTrafficView] = useState<TrafficViewMode>('hourly');
  const [selectedShopId, setSelectedShopId] = useState<string>('ALL');
  const [isInView, setIsInView] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) {
      setIsInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      entries => {
        if (entries.some(e => e.isIntersecting)) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.16 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const scopedBills = useMemo(() => {
    return bills.filter(b => {
      if (b.status === 'Cancelled') return false;
      if (selectedShopId !== 'ALL' && b.shopId !== selectedShopId) return false;
      return true;
    });
  }, [bills, selectedShopId]);

  const { hourly, daily, hourlyBillsTotal, hourlySalesTotal, dailyBillsTotal, dailySalesTotal } = useMemo(() => {
    const todayIso = getLocalISODate(0);
    const utcTodayIso = new Date().toISOString().slice(0, 10);

    // 1. Hourly (12 x 2-hr slots: 00, 02, ..., 22)
    const hourlyMap: Record<string, { count: number; sales: number }> = {};
    for (let i = 0; i < 24; i += 2) {
      hourlyMap[String(i).padStart(2, '0')] = { count: 0, sales: 0 };
    }

    let hBills = 0;
    let hSales = 0;
    scopedBills.forEach(bill => {
      if (bill.date === todayIso || bill.date === utcTodayIso) {
        const h = parseBillHour(bill.time);
        const slotHour = String(Math.floor(h / 2) * 2).padStart(2, '0');
        if (hourlyMap[slotHour]) {
          hourlyMap[slotHour].count += 1;
          hourlyMap[slotHour].sales += bill.netAmount || 0;
          hBills += 1;
          hSales += bill.netAmount || 0;
        }
      }
    });

    const hourlyArr: HourlySlot[] = Object.entries(hourlyMap).map(([hour, v]) => ({
      hour,
      count: v.count,
      sales: Math.round(v.sales)
    }));

    // 2. Day-wise (7 days or 14 days)
    const daysCount = trafficView === 'daily14' ? 14 : 7;
    const dailyMap: Record<string, { dateLabel: string; count: number; sales: number }> = {};
    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const localKey = getLocalISODate(-i);
      const utcKey = d.toISOString().slice(0, 10);
      const label = `${d.getDate()} ${MONTH_SHORT[d.getMonth()]}`;
      dailyMap[localKey] = { dateLabel: label, count: 0, sales: 0 };
      if (utcKey !== localKey) {
        dailyMap[utcKey] = dailyMap[localKey];
      }
    }

    let dBills = 0;
    let dSales = 0;
    scopedBills.forEach(bill => {
      if (bill.date && dailyMap[bill.date]) {
        dailyMap[bill.date].count += 1;
        dailyMap[bill.date].sales += bill.netAmount || 0;
        dBills += 1;
        dSales += bill.netAmount || 0;
      }
    });

    // Deduplicate ordered keys from local dates
    const dailyArr: DailySlot[] = [];
    for (let i = daysCount - 1; i >= 0; i--) {
      const key = getLocalISODate(-i);
      const entry = dailyMap[key];
      dailyArr.push({
        day: entry.dateLabel,
        count: entry.count,
        sales: Math.round(entry.sales)
      });
    }

    return {
      hourly: hourlyArr.length > 0 ? hourlyArr : FALLBACK_HOURLY,
      daily: dailyArr,
      hourlyBillsTotal: hBills,
      hourlySalesTotal: hSales,
      dailyBillsTotal: dBills,
      dailySalesTotal: dSales
    };
  }, [scopedBills, trafficView]);

  const activeShopLabel =
    selectedShopId === 'ALL'
      ? 'All Shops (Overall)'
      : shops.find(s => s.id === selectedShopId)?.name || 'Selected Shop';

  const chartTitle =
    trafficView === 'hourly'
      ? 'Hourly Transactions'
      : trafficView === 'weekly'
        ? 'Weekly Shop Transactions'
        : 'Day-wise Transactions';

  const chartSubtitle =
    trafficView === 'hourly'
      ? `${activeShopLabel} — ${hourlyBillsTotal} bills (${formatINR(hourlySalesTotal)}) today in 2-hour intervals`
      : `${activeShopLabel} — ${dailyBillsTotal} bills & ${formatINR(dailySalesTotal)} across ${daily.length} days`;

  return (
    <section
      ref={cardRef}
      className={`bb-card bb-scroll-reveal ${isInView ? 'is-visible' : ''}`}
      style={{ padding: 0, overflow: 'hidden' }}
    >
      {/* Card Header */}
      <header className="bb-insights-header">
        <div>
          <h3 style={{ margin: 0, fontSize: 15.5, fontWeight: 700, letterSpacing: '-0.01em' }}>
            {chartTitle}
          </h3>
          <p style={{ margin: '4px 0 0 0', fontSize: 12, color: '#64748B' }}>
            {chartSubtitle}
          </p>
        </div>

        {/* Right Controls: Shop Filter + Pill Toggle + Legend */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>
          {/* Shop-wise Selector */}
          <div className="bb-shop-filter-pill" title="Filter transactions by shop or overall">
            <Store size={13} color="var(--bb-accent-link)" />
            <select
              value={selectedShopId}
              onChange={e => setSelectedShopId(e.target.value)}
              aria-label="Filter transactions by shop"
            >
              <option value="ALL">All Shops (Overall)</option>
              {shops.map(shop => (
                <option key={shop.id} value={shop.id}>
                  {shop.code} · {shop.name}
                </option>
              ))}
            </select>
          </div>

          {/* Pill Toggle (WEIGHSoft Hourly / Weekly / 14 Days) */}
          <div className="bb-pill-toggle-group">
            <button
              type="button"
              className={`bb-pill-toggle-btn ${trafficView === 'hourly' ? 'active' : ''}`}
              onClick={() => setTrafficView('hourly')}
            >
              Hourly (Today)
            </button>
            <button
              type="button"
              className={`bb-pill-toggle-btn ${trafficView === 'weekly' ? 'active' : ''}`}
              onClick={() => setTrafficView('weekly')}
            >
              Weekly (7 Days)
            </button>
            <button
              type="button"
              className={`bb-pill-toggle-btn ${trafficView === 'daily14' ? 'active' : ''}`}
              onClick={() => setTrafficView('daily14')}
            >
              14 Days
            </button>
          </div>

          {/* Dot Legend */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              fontSize: 11.5,
              color: '#64748B',
              marginLeft: 2
            }}
          >
            <LegendDot color="var(--bb-accent-link)" label="Bills (Count)" />
            {trafficView !== 'hourly' && <LegendDot color="#16A34A" label="Sales (₹)" />}
          </div>
        </div>
      </header>

      {/* Chart Area */}
      <div style={{ padding: '16px 18px 18px 18px' }}>
        <div style={{ width: '100%', height: 270 }}>
          {isInView && (
            <ResponsiveContainer width="100%" height="100%">
              {trafficView === 'hourly' ? (
                <BarChart
                  key={`hourly-${selectedShopId}`}
                  data={hourly}
                  barCategoryGap="18%"
                  margin={{ top: 14, right: 16, left: -16, bottom: 0 }}
                >
                  <CartesianGrid stroke="var(--bb-grid-stroke)" strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="hour"
                    stroke="#94A3B8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={val => `${val}:00`}
                  />
                  <YAxis
                    stroke="#94A3B8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                    domain={[0, (dataMax: number) => Math.max(dataMax, 4)]}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(31, 78, 99, 0.08)', radius: 6 }}
                    content={({ active, payload }) => {
                      if (active && payload?.length) {
                        const item = payload[0].payload as HourlySlot;
                        const endHour = String((parseInt(item.hour, 10) + 2) % 24).padStart(2, '0');
                        return (
                          <div className="bb-chart-tooltip">
                            <div className="bb-chart-tooltip-title">
                              Time Slot: {item.hour}:00 – {endHour}:00
                            </div>
                            <div className="bb-chart-tooltip-row">
                              <span>Bills Done:</span>
                              <strong style={{ color: '#38BDF8', fontFamily: 'monospace' }}>
                                {item.count} {item.count === 1 ? 'bill' : 'bills'}
                              </strong>
                            </div>
                            <div className="bb-chart-tooltip-row">
                              <span>Sales Value:</span>
                              <strong style={{ color: '#34D399', fontFamily: 'monospace' }}>
                                {formatINR(item.sales)}
                              </strong>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="count"
                    name="Bills (Count)"
                    fill="var(--bb-accent-link)"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={38}
                    isAnimationActive={true}
                    animationDuration={850}
                    animationEasing="ease-out"
                  />
                </BarChart>
              ) : (
                <AreaChart
                  key={`${trafficView}-${selectedShopId}`}
                  data={daily}
                  margin={{ top: 12, right: 12, left: -16, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="bbTrafficDailyGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#1F4E63" stopOpacity={0.34} />
                      <stop offset="100%" stopColor="#1F4E63" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="var(--bb-grid-stroke)" strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="day"
                    stroke="#94A3B8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    yAxisId="count"
                    stroke="#94A3B8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                    domain={[0, (dataMax: number) => Math.max(dataMax, 4)]}
                  />
                  <YAxis
                    yAxisId="sales"
                    orientation="right"
                    stroke="#16A34A"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={v => (v >= 1000 ? `₹${Math.round(v / 1000)}k` : `₹${v}`)}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload?.length) {
                        const item = payload[0].payload as DailySlot;
                        return (
                          <div className="bb-chart-tooltip">
                            <div className="bb-chart-tooltip-title">Date: {label}</div>
                            <div className="bb-chart-tooltip-row">
                              <span>Bills Done:</span>
                              <strong style={{ color: '#38BDF8', fontFamily: 'monospace' }}>
                                {item.count} {item.count === 1 ? 'bill' : 'bills'}
                              </strong>
                            </div>
                            <div className="bb-chart-tooltip-row">
                              <span>Total Sales:</span>
                              <strong style={{ color: '#34D399', fontFamily: 'monospace' }}>
                                {formatINR(item.sales)}
                              </strong>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    yAxisId="count"
                    type="monotone"
                    dataKey="count"
                    name="Bills (Count)"
                    stroke="var(--bb-accent-link)"
                    strokeWidth={2.5}
                    fill="url(#bbTrafficDailyGrad)"
                    dot={{ r: 3.5, fill: 'var(--bb-accent-link)', strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: 'var(--bb-accent-link)', stroke: '#FFFFFF', strokeWidth: 2 }}
                    isAnimationActive={true}
                    animationDuration={950}
                    animationEasing="ease-out"
                  />
                  <Line
                    yAxisId="sales"
                    type="monotone"
                    dataKey="sales"
                    name="Sales (₹)"
                    stroke="#16A34A"
                    strokeWidth={2.4}
                    dot={{ r: 3.5, fill: '#16A34A', strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: '#16A34A', stroke: '#FFFFFF', strokeWidth: 2 }}
                    isAnimationActive={true}
                    animationDuration={1100}
                    animationEasing="ease-out"
                  />
                </AreaChart>
              )}
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </section>
  );
};
