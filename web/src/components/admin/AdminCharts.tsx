import React, { useState } from 'react';
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
  const total = slices.reduce((s, x) => s + x.value, 0) || 1;
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.34;
  const strokeWidth = size * 0.24;
  const circumference = 2 * Math.PI * r;

  let offsetAcc = 0;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
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
                strokeDasharray={`${Math.max(0, dashLen - gap)} ${circumference}`}
                strokeDashoffset={-currentOffset}
                transform={`rotate(-90 ${cx} ${cy})`}
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
   2. EXPENSE VS PROFIT DUAL AREA CHART (Matches Screenshot 1 Bottom-Left)
   ============================================================================ */
interface ExpenseProfitPoint {
  month: string;
  profit: number;
  expense: number;
}

export const ExpenseProfitAreaChart: React.FC<{ data: ExpenseProfitPoint[] }> = ({ data }) => {
  const width = 480;
  const height = 165;
  const padL = 44;
  const padR = 16;
  const padT = 26;
  const padB = 26;
  const innerW = width - padL - padR;
  const innerH = height - padT - padB;

  const maxVal = Math.max(...data.flatMap(d => [d.profit, d.expense]), 10000);
  const minVal = 0;

  const getX = (i: number) => padL + (i / Math.max(data.length - 1, 1)) * innerW;
  const getY = (v: number) => padT + innerH - ((v - minVal) / (maxVal - minVal)) * innerH;

  const buildSmoothPath = (vals: number[]) => {
    const pts = vals.map((v, i) => ({ x: getX(i), y: getY(v) }));
    if (pts.length === 0) return '';
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const cx = (p0.x + p1.x) / 2;
      d += ` C ${cx} ${p0.y}, ${cx} ${p1.y}, ${p1.x} ${p1.y}`;
    }
    return d;
  };

  const profitPath = buildSmoothPath(data.map(d => d.profit));
  const expensePath = buildSmoothPath(data.map(d => d.expense));

  const profitArea = `${profitPath} L ${getX(data.length - 1)} ${padT + innerH} L ${getX(0)} ${padT + innerH} Z`;
  const expenseArea = `${expensePath} L ${getX(data.length - 1)} ${padT + innerH} L ${getX(0)} ${padT + innerH} Z`;

  let maxProfitIdx = 0;
  let maxExpenseIdx = 0;
  data.forEach((d, i) => {
    if (d.profit > data[maxProfitIdx].profit) maxProfitIdx = i;
    if (d.expense > data[maxExpenseIdx].expense) maxExpenseIdx = i;
  });

  const yTicks = [0.25, 0.5, 0.75, 1].map(f => Math.round((maxVal * f) / 1000) * 1000);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
      <defs>
        <linearGradient id="bbProfitGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#166534" stopOpacity="0.24" />
          <stop offset="100%" stopColor="#166534" stopOpacity="0.02" />
        </linearGradient>
        <linearGradient id="bbExpGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C26D4A" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#C26D4A" stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {yTicks.map((tick, idx) => {
        const y = getY(tick);
        return (
          <g key={idx}>
            <line x1={padL} y1={y} x2={width - padR} y2={y} stroke="#E2E8F0" strokeDasharray="3 3" />
            <text x={padL - 8} y={y + 3} textAnchor="end" fontSize="10" fill="#64748B">
              {tick >= 1000 ? `${Math.round(tick / 1000)}k` : tick}
            </text>
          </g>
        );
      })}

      <path d={expenseArea} fill="url(#bbExpGrad)" />
      <path d={profitArea} fill="url(#bbProfitGrad)" />
      <path d={expensePath} fill="none" stroke="#C26D4A" strokeWidth="2" />
      <path d={profitPath} fill="none" stroke="#2D6A4F" strokeWidth="2.2" />

      {/* Highlight Highest Expense & Highest Profit pills matching Screenshot 1 */}
      {data[maxExpenseIdx] && (
        <g>
          <circle cx={getX(maxExpenseIdx)} cy={getY(data[maxExpenseIdx].expense)} r="3.5" fill="#C26D4A" />
          <rect
            x={Math.min(getX(maxExpenseIdx) - 42, width - 92)}
            y={Math.max(2, getY(data[maxExpenseIdx].expense) - 24)}
            width="84"
            height="16"
            rx="3"
            fill="#C26D4A"
          />
          <text
            x={Math.min(getX(maxExpenseIdx), width - 50)}
            y={Math.max(13, getY(data[maxExpenseIdx].expense) - 13)}
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize="8.5"
            fontWeight="600"
          >
            Highest Expense
          </text>
        </g>
      )}

      {data[maxProfitIdx] && (
        <g>
          <circle cx={getX(maxProfitIdx)} cy={getY(data[maxProfitIdx].profit)} r="3.5" fill="#2D6A4F" />
          <rect
            x={Math.min(getX(maxProfitIdx) - 38, width - 82)}
            y={Math.max(2, getY(data[maxProfitIdx].profit) - 24)}
            width="76"
            height="16"
            rx="3"
            fill="#2D6A4F"
          />
          <text
            x={Math.min(getX(maxProfitIdx), width - 44)}
            y={Math.max(13, getY(data[maxProfitIdx].profit) - 13)}
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize="8.5"
            fontWeight="600"
          >
            Highest Profit
          </text>
        </g>
      )}

      {data.map((d, i) => (
        <text key={i} x={getX(i)} y={height - 6} textAnchor="middle" fontSize="10.5" fill="#475569">
          {d.month}
        </text>
      ))}
    </svg>
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
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
      {data.map((_, i) => (
        <line
          key={`vg-${i}`}
          x1={getX(i)}
          y1={padT}
          x2={getX(i)}
          y2={padT + innerH}
          stroke="#CBD5E1"
          strokeDasharray="4 4"
        />
      ))}

      {yTicks.map((t, i) => (
        <text key={`yt-${i}`} x={padL - 10} y={getY(t) + 3} textAnchor="end" fontSize="10.5" fill="#475569">
          {t >= 100000 ? `${(t / 100000).toFixed(1)}L` : `${Math.round(t / 1000)}K`}
        </text>
      ))}

      <path d={path} fill="none" stroke="#3D6B5E" strokeWidth="2.8" />

      {pts.map((pt, i) => (
        <g key={i} style={{ cursor: 'pointer' }} onMouseEnter={() => setHoverIdx(i)}>
          <circle
            cx={pt.x}
            cy={pt.y}
            r={hoverIdx === i ? 6 : 4.5}
            fill="#FFFFFF"
            stroke="#3D6B5E"
            strokeWidth="2.5"
          />
          <text x={pt.x} y={height - 6} textAnchor="middle" fontSize="11" fill="#334155">
            {data[i].label}
          </text>
        </g>
      ))}

      {activePt && pts[hoverIdx] && (
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
  const clamped = Math.max(0, Math.min(100, percent));
  const angle = -90 + (clamped / 100) * 180;
  const cx = 90;
  const cy = 84;
  const r = 62;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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
        <g transform={`rotate(${angle} ${cx} ${cy})`}>
          <line x1={cx} y1={cy} x2={cx} y2={cy - 54} stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
        </g>
        <circle cx={cx} cy={cy} r="6" fill="#1E293B" />
        <text x={cx - r} y={cy + 16} textAnchor="middle" fontSize="10" fill="#64748B">
          0%
        </text>
        <text x={cx + r} y={cy + 16} textAnchor="middle" fontSize="10" fill="#64748B">
          100%
        </text>
      </svg>
      <div style={{ fontSize: 22, fontWeight: 700, color: '#1E293B', marginTop: -4 }}>
        {clamped}%
      </div>
    </div>
  );
};
