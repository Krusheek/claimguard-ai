import React, { useId } from 'react';
import { ArrowUpRight, ArrowDownRight, HelpCircle } from 'lucide-react';

/**
 * Pure SVG Cubic Bezier Sparkline Curve
 */
export function SparklineCurve({
  data = [10, 20, 15, 25, 30, 28, 40],
  color = 'emerald',
  width = 80,
  height = 28,
  className = '',
}) {
  const generatedId = useId ? useId().replace(/[^a-zA-Z0-9_-]/g, '') : '';
  const gradId = `grad-${color}-${generatedId || 'default'}`;

  const cleanData = Array.isArray(data)
    ? data.filter((v) => v !== null && v !== undefined && typeof v === 'number' && Number.isFinite(v))
    : [];

  if (cleanData.length < 2) return null;

  const padding = 3;
  const min = Math.min(...cleanData);
  const max = Math.max(...cleanData);
  const range = max - min || 1;
  const pw = width - padding * 2;
  const ph = height - padding * 2;

  // Normalized coordinates
  const points = cleanData.map((val, i) => ({
    x: padding + (i / (cleanData.length - 1)) * pw,
    y: height - padding - ((val - min) / range) * ph,
  }));

  // Cubic Bezier Spline Path
  const linePath = points.reduce((acc, pt, i, arr) => {
    if (i === 0) return `M ${pt.x},${pt.y}`;
    const prev = arr[i - 1];
    const cp1x = prev.x + (pt.x - prev.x) / 2;
    const cp1y = prev.y;
    const cp2x = prev.x + (pt.x - prev.x) / 2;
    const cp2y = pt.y;
    return `${acc} C ${cp1x},${cp1y} ${cp2x},${cp2y} ${pt.x},${pt.y}`;
  }, '');

  const areaPath = `${linePath} L ${points[points.length - 1].x},${height} L ${points[0].x},${height} Z`;

  // Color mappings
  const colorMap = {
    emerald: { stroke: '#059669', stop1: '#10B981', stop2: '#ECFDF5', dot: '#059669' },
    primary: { stroke: '#0284C7', stop1: '#38BDF8', stop2: '#F0F9FF', dot: '#0284C7' },
    brand: { stroke: '#0284C7', stop1: '#38BDF8', stop2: '#F0F9FF', dot: '#0284C7' },
    teal: { stroke: '#0D9488', stop1: '#14B8A6', stop2: '#F0FDFA', dot: '#0D9488' },
    amber: { stroke: '#D97706', stop1: '#FBBF24', stop2: '#FFFBEB', dot: '#D97706' },
    rose: { stroke: '#E11D48', stop1: '#FB7185', stop2: '#FFF1F2', dot: '#E11D48' },
    slate: { stroke: '#64748B', stop1: '#94A3B8', stop2: '#F8FAFC', dot: '#64748B' },
  };

  const c = colorMap[color] || colorMap.emerald;
  const lastPoint = points[points.length - 1];

  return (
    <div className={`relative flex-shrink-0 ${className}`}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={c.stop1} stopOpacity="0.25" />
            <stop offset="100%" stopColor={c.stop2} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill={`url(#${gradId})`} />
        <path d={linePath} fill="none" stroke={c.stroke} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={lastPoint.x} cy={lastPoint.y} r="2.5" fill={c.dot} />
      </svg>
    </div>
  );
}

/**
 * Enterprise Financial Metric KPI Card
 */
export default function MetricCard({
  label,
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  isPositive,
  trendLabel = 'from last cycle',
  variant = 'primary',
  sparkline = null,
  sparklineColor = null,
  variance = null,
  badges = [],
  metaText = null,
  targetPill = null,
  tooltip = null,
  className = '',
}) {
  const displayLabel = label || title || 'Metric';

  // Variant accent styling
  const variantStyles = {
    primary: 'text-brand-600 bg-brand-50 border-brand-100',
    teal: 'text-medical-600 bg-medical-50 border-medical-100',
    emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    amber: 'text-amber-600 bg-amber-50 border-amber-100',
    rose: 'text-rose-600 bg-rose-50 border-rose-100',
    slate: 'text-slate-600 bg-slate-100 border-slate-200',
  };

  const accent = variantStyles[variant] || variantStyles.primary;
  const activeSparkColor = sparklineColor || (variant === 'primary' ? 'brand' : variant);

  return (
    <div className={`card-enterprise card-enterprise-hover p-5 lg:p-6 flex flex-col justify-between relative overflow-hidden group ${className}`}>
      {/* Top row: Label & Icon */}
      <div>
        <div className="flex justify-between items-start gap-4">
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {displayLabel}
              </span>
              {tooltip && (
                <span className="text-slate-400 hover:text-slate-600 cursor-help" title={tooltip}>
                  <HelpCircle className="w-3.5 h-3.5" />
                </span>
              )}
            </div>
            <div className="text-2xl lg:text-3xl font-bold text-slate-900 font-financial tracking-tight">
              {value}
            </div>
          </div>

          {Icon && (
            <div className={`p-3 rounded-xl border ${accent} flex-shrink-0 shadow-xs transition-transform duration-200 group-hover:scale-105`}>
              <Icon className="w-6 h-6" />
            </div>
          )}
        </div>

        {/* Target Benchmark Pill */}
        {targetPill && (
          <div className="mt-2.5">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${
                targetPill.status === 'warning'
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : targetPill.status === 'pass'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              {targetPill.label}
            </span>
          </div>
        )}

        {/* Secondary Badges Array */}
        {Array.isArray(badges) && badges.length > 0 && (
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            {badges.map((b, idx) => (
              <span
                key={idx}
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                  b.variant === 'rose'
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : b.variant === 'amber'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : b.variant === 'emerald'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                {b.label}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Bottom row: Trend, Variance, or Sparkline */}
      {(trend || subtitle || variance || metaText || (Array.isArray(sparkline) && sparkline.length > 0)) && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs gap-2">
          {variance ? (
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span
                  className={`inline-flex items-center font-bold px-1.5 py-0.5 rounded-md border ${
                    variance.isPositive
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}
                >
                  {variance.isPositive ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
                  {variance.value}
                </span>
                <span className="text-slate-500 font-medium text-[11px]">{variance.label || trendLabel}</span>
              </div>
              {metaText && <span className="text-[11px] text-slate-400 mt-0.5">{metaText}</span>}
            </div>
          ) : trend ? (
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span
                  className={`inline-flex items-center font-semibold px-1.5 py-0.5 rounded ${
                    isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                  }`}
                >
                  {isPositive ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
                  {trend}
                </span>
                <span className="text-slate-500">{trendLabel}</span>
              </div>
              {metaText && <span className="text-[11px] text-slate-400 mt-0.5">{metaText}</span>}
            </div>
          ) : subtitle ? (
            <div className="flex flex-col">
              <span className="text-slate-500 font-medium">{subtitle}</span>
              {metaText && <span className="text-[11px] text-slate-400 mt-0.5">{metaText}</span>}
            </div>
          ) : metaText ? (
            <div className="text-[11px] text-slate-400 font-medium">{metaText}</div>
          ) : (
            <div />
          )}

          {/* Sparkline Graphic (SVG Bezier Curve + Activity Bars) */}
          {Array.isArray(sparkline) && sparkline.length > 0 && (
            <div className="flex items-center gap-2 flex-shrink-0">
              <SparklineCurve data={sparkline} color={activeSparkColor} width={75} height={28} />
              <div className="flex items-end gap-1 h-5" aria-hidden="true">
                {sparkline
                  .filter((val) => val !== null && val !== undefined && typeof val === 'number' && Number.isFinite(val))
                  .map((val, i) => {
                    const clampedHeight = Math.max(15, Math.min(100, val));
                    return (
                      <div
                        key={i}
                        style={{ height: `${clampedHeight}%` }}
                        className={`w-1 rounded-t ${isPositive !== false ? 'bg-emerald-400' : 'bg-brand-400'}`}
                      />
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
