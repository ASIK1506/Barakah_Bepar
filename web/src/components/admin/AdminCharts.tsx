import React, { useEffect, useRef, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { formatINR } from '../../lib/shopStore';

/* ============================================================================
   1. DONUT CHART (Matches Screenshot 1 "Inventory Values" / Payment Mix)
   ============================================================================ */
interface DonutSlice {
  label: string;
  value: number;
  color: string;
  amountText?: string;
}

export const DonutChart: React.FC<{ slices: DonutSlice[]; size?: number }> = ({
  slices,
  size = 132
}) => {
  const [revealed, setRevealed] = useState(false);
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const el = svgRef.current;
    if (!el) {
      setRevealed(true);
      return;
    }
    const obs = new IntersectionObserver(
      entries => {
        if (entries.some(e => e.isIntersecting)) {
          setRevealed(true);
          obs.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const total = slices.reduce((s, x) => s + x.value, 0) || 1;
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.34;
  const strokeWidth = size * 0.24;
  const circumference = 2 * Math.PI * r;

  let offsetAcc = 0;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
      <svg ref={svgRef} width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {slices.map((slice, idx) => {
          const pct = slice.value / total;
          const dashLen = pct * circumference;
          const gap = slices.length > 1 ? 3 : 0;
          const currentOffset = offsetAcc;
          offsetAcc += dashLen;

          // Label midpoint angle
          const midAngle = ((currentOffset + dashLen / 2) / circumference) * 2 * Math.PI - Math.PI / 2;
          const lx = cx + r * Math.cos(midAngle);
          const ly = cy + r * Math.sin(midAngle);

          return (
            <g key={idx}>
              <circle
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke={slice.color}
                strokeWidth={strokeWidth}
                strokeDasharray={`${revealed ? Math.max(0, dashLen - gap) : 0} ${circumference}`}
                strokeDashoffset={-currentOffset}
                transform={`rotate(-90 ${cx} ${cy})`}
                style={{ transition: `stroke-dasharray 1.8s cubic-bezier(0.22, 1, 0.36, 1) ${idx * 180}ms` }}
              />
              {pct >= 0.1 && (
                <text
                  x={lx}
                  y={ly}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={idx === 0 ? '#1E293B' : '#FFFFFF'}
                  fontSize="11"
                  fontWeight="700"
                  style={{ opacity: revealed ? 1 : 0, transition: 'opacity 0.8s ease 0.9s' }}
                >
                  {Math.round(pct * 100)}%
                </text>
              )}
            </g>
          );
        })}
        <circle cx={cx} cy={cy} r={r - strokeWidth / 2} fill="transparent" />
      </svg>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {slices.map((s, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                width: 14,
                height: 14,
                borderRadius: 4,
                background: s.color,
                display: 'inline-block'
              }}
            />
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 600 }}>{s.label}</div>
              {s.amountText && (
                <div style={{ fontSize: 11, color: '#64748B' }}>{s.amountText}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ============================================================================
   2. EXPENSE VS PROFIT DUAL AREA CHART (Animated Recharts + Scroll Reveal + Hover)
   ============================================================================ */
interface ExpenseProfitPoint {
  month: string;
  profit: number;
  expense: number;
}

export const ExpenseProfitAreaChart: React.FC<{ data: ExpenseProfitPoint[] }> = ({ data }) => {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) {
      setIsVisible(true);
      return;
    }
    const obs = new IntersectionObserver(
      entries => {
        if (entries.some(e => e.isIntersecting)) {
          setIsVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  let peakProfit = data[0];
  let peakExpense = data[0];
  data.forEach(d => {
    if (!peakProfit || d.profit > peakProfit.profit) peakProfit = d;
    if (!peakExpense || d.expense > peakExpense.expense) peakExpense = d;
  });

  return (
    <div ref={containerRef} style={{ width: '100%' }}>
      {/* Peak Indicator Pills */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          marginBottom: 8
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {peakProfit && (
            <span className="bb-peak-profit-pill">
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'currentColor' }} />
              Highest Profit: {peakProfit.month} ({formatINR(peakProfit.profit, true)})
            </span>
          )}
          {peakExpense && (
            <span className="bb-peak-expense-pill">
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'currentColor' }} />
              Highest Expense: {peakExpense.month} ({formatINR(peakExpense.expense, true)})
            </span>
          )}
        </div>
      </div>

      {/* Animated Recharts Dual Area Chart */}
      <div style={{ width: '100%', height: 195 }}>
        {isVisible && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 12, left: -14, bottom: 0 }}>
              <defs>
                <linearGradient id="bbProfitGradAnim" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2D6A4F" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#2D6A4F" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="bbExpGradAnim" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#C26D4A" stopOpacity={0.32} />
                  <stop offset="100%" stopColor="#C26D4A" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--bb-grid-stroke)" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="month"
                stroke="var(--bb-text-muted)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="var(--bb-text-muted)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={v => (v >= 1000 ? `${Math.round(v / 1000)}k` : String(v))}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload?.length) {
                    const row = payload[0].payload as ExpenseProfitPoint;
                    const net = row.profit - row.expense;
                    return (
                      <div className="bb-chart-tooltip">
                        <div className="bb-chart-tooltip-title">Month: {label}</div>
                        <div className="bb-chart-tooltip-row">
                          <span>Gross Profit:</span>
                          <strong style={{ color: '#34D399', fontFamily: 'monospace' }}>
                            {formatINR(row.profit)}
                          </strong>
                        </div>
                        <div className="bb-chart-tooltip-row">
                          <span>Expenses:</span>
                          <strong style={{ color: '#FB923C', fontFamily: 'monospace' }}>
                            {formatINR(row.expense)}
                          </strong>
                        </div>
                        <div
                          className="bb-chart-tooltip-row"
                          style={{ borderTop: '1px solid rgba(148,163,184,0.25)', paddingTop: 4, marginTop: 2 }}
                        >
                          <span>Net Surplus:</span>
                          <strong
                            style={{
                              color: net >= 0 ? '#6EE7B7' : '#FCA5A5',
                              fontFamily: 'monospace'
                            }}
                          >
                            {net >= 0 ? '+' : ''}
                            {formatINR(net)}
                          </strong>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="expense"
                name="Expense"
                stroke="#C26D4A"
                strokeWidth={2.4}
                fill="url(#bbExpGradAnim)"
                dot={{ r: 3.5, fill: '#C26D4A', strokeWidth: 0 }}
                activeDot={{ r: 6, fill: '#C26D4A', stroke: '#FFFFFF', strokeWidth: 2 }}
                isAnimationActive={true}
                animationDuration={2100}
                animationEasing="ease-out"
              />
              <Area
                type="monotone"
                dataKey="profit"
                name="Profit"
                stroke="#2D6A4F"
                strokeWidth={2.6}
                fill="url(#bbProfitGradAnim)"
                dot={{ r: 3.5, fill: '#2D6A4F', strokeWidth: 0 }}
                activeDot={{ r: 6, fill: '#2D6A4F', stroke: '#FFFFFF', strokeWidth: 2 }}
                isAnimationActive={true}
                animationDuration={2400}
                animationEasing="ease-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

/* ============================================================================
   3. INVENTORY TURNOVER SPLINE CHART (Matches Screenshot 2 Top-Left)
   ============================================================================ */
export const TurnoverSplineChart: React.FC<{ data: { label: string; value: number }[] }> = ({ data }) => {
  const [hoverIdx, setHoverIdx] = useState<number>(() => {
    let maxI = 0;
    data.forEach((d, i) => {
      if (d.value > data[maxI].value) maxI = i;
    });
    return maxI;
  });
  const [revealed, setRevealed] = useState(false);
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const el = svgRef.current;
    if (!el) {
      setRevealed(true);
      return;
    }
    const obs = new IntersectionObserver(
      entries => {
        if (entries.some(e => e.isIntersecting)) {
          setRevealed(true);
          obs.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const width = 540;
  const height = 195;
  const padL = 46;
  const padR = 24;
  const padT = 32;
  const padB = 28;
  const innerW = width - padL - padR;
  const innerH = height - padT - padB;

  const maxVal = Math.max(...data.map(d => d.value), 10000);
  const getX = (i: number) => padL + (i / Math.max(data.length - 1, 1)) * innerW;
  const getY = (v: number) => padT + innerH - (v / maxVal) * innerH;

  let path = '';
  const pts = data.map((d, i) => ({ x: getX(i), y: getY(d.value) }));
  if (pts.length > 0) {
    path = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const cx = (pts[i].x + pts[i + 1].x) / 2;
      path += ` C ${cx} ${pts[i].y}, ${cx} ${pts[i + 1].y}, ${pts[i + 1].x} ${pts[i + 1].y}`;
    }
  }

  const yTicks = [0.25, 0.5, 0.75, 1].map(f => Math.round((maxVal * f) / 1000) * 1000);
  const activePt = data[hoverIdx] || data[0];

  return (
    <svg ref={svgRef} viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
      {data.map((_, i) => (
        <line
          key={`vg-${i}`}
          x1={getX(i)}
          y1={padT}
          x2={getX(i)}
          y2={padT + innerH}
          stroke="var(--bb-grid-stroke)"
          strokeDasharray="4 4"
        />
      ))}

      {yTicks.map((t, i) => (
        <text key={`yt-${i}`} x={padL - 10} y={getY(t) + 3} textAnchor="end" fontSize="10.5" fill="var(--bb-text-muted)">
          {t >= 100000 ? `${(t / 100000).toFixed(1)}L` : `${Math.round(t / 1000)}K`}
        </text>
      ))}

      <path
        d={path}
        fill="none"
        stroke="#3D6B5E"
        strokeWidth="2.8"
        strokeDasharray="900"
        strokeDashoffset={revealed ? 0 : 900}
        style={{ transition: 'stroke-dashoffset 2.2s cubic-bezier(0.22, 1, 0.36, 1)' }}
      />

      {pts.map((pt, i) => (
        <g key={i} style={{ cursor: 'pointer' }} onMouseEnter={() => setHoverIdx(i)}>
          <circle
            cx={pt.x}
            cy={pt.y}
            r={revealed ? (hoverIdx === i ? 6.5 : 4.5) : 0}
            fill="#FFFFFF"
            stroke="#3D6B5E"
            strokeWidth="2.5"
            style={{ transition: `r 0.55s ease ${i * 220}ms` }}
          />
          <text x={pt.x} y={height - 6} textAnchor="middle" fontSize="11" fill="var(--bb-text-secondary)">
            {data[i].label}
          </text>
        </g>
      ))}

      {activePt && pts[hoverIdx] && revealed && (
        <g>
          <rect
            x={Math.min(Math.max(pts[hoverIdx].x - 36, padL), width - 78)}
            y={Math.max(4, pts[hoverIdx].y - 30)}
            width="72"
            height="20"
            rx="4"
            fill="#3D6B5E"
          />
          <text
            x={Math.min(Math.max(pts[hoverIdx].x, padL + 36), width - 42)}
            y={Math.max(17, pts[hoverIdx].y - 17)}
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize="10"
            fontWeight="700"
          >
            {formatINR(activePt.value)}
          </text>
        </g>
      )}
    </svg>
  );
};

/* ============================================================================
   4. SEMI-CIRCULAR ACCURACY GAUGE (Matches Screenshot 2 Right Card)
   ============================================================================ */
export const AccuracyGaugeChart: React.FC<{ percent: number }> = ({ percent }) => {
  const [revealed, setRevealed] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) {
      setRevealed(true);
      return;
    }
    const obs = new IntersectionObserver(
      entries => {
        if (entries.some(e => e.isIntersecting)) {
          setRevealed(true);
          obs.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const clamped = Math.max(0, Math.min(100, percent));
  const angle = revealed ? -90 + (clamped / 100) * 180 : -90;
  const cx = 90;
  const cy = 84;
  const r = 62;

  return (
    <div ref={wrapRef} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg width="180" height="104" viewBox="0 0 180 104">
        {/* Left Amber/Terracotta Segment */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx} ${cy - r}`}
          fill="none"
          stroke="#C27D56"
          strokeWidth="18"
          strokeLinecap="butt"
        />
        {/* Right Sage-Teal Segment */}
        <path
          d={`M ${cx} ${cy - r} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke="#72AA9A"
          strokeWidth="18"
          strokeLinecap="butt"
        />
        {/* Needle */}
        <g
          style={{
            transform: `rotate(${angle}deg)`,
            transformOrigin: `${cx}px ${cy}px`,
            transformBox: 'view-box',
            transition: 'transform 2.1s cubic-bezier(0.22, 1, 0.36, 1)'
          }}
        >
          <line x1={cx} y1={cy} x2={cx} y2={cy - 54} stroke="var(--bb-text-primary)" strokeWidth="3" strokeLinecap="round" />
        </g>
        <circle cx={cx} cy={cy} r="6" fill="var(--bb-text-primary)" />
        <text x={cx - r} y={cy + 16} textAnchor="middle" fontSize="10" fill="var(--bb-text-muted)">
          0%
        </text>
        <text x={cx + r} y={cy + 16} textAnchor="middle" fontSize="10" fill="var(--bb-text-muted)">
          100%
        </text>
      </svg>
      <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--bb-text-primary)', marginTop: -4 }}>
        {clamped}%
      </div>
    </div>
  );
};
