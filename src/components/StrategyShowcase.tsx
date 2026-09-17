import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Download } from 'lucide-react';
import { STRATEGIES, PERFORMANCE } from '../data/content';
import strategyNav from '../data/strategyNav.json';
import { useTopMonthlyStrategyId } from '../lib/topPerformer';
import { useCmsStrategyNav } from '../lib/cms/store';
import { deriveNavStats } from '../lib/cms/navParser';
import { Disclaimer } from './shared';
import { useToast } from './toast';

type NavSeries = { since: string; asOf: string; labels: string[]; points: number[][] };

const STATIC_NAV = strategyNav.strategies as Record<string, NavSeries>;

const PERIOD_LABELS = ['1 Year', '3 Years', '5 Years', 'Since Inception'];

// Builds the SVG paths from a real since-inception NAV series (₹1 cr rebased).
// `points` is [strategyNav, benchmarkNav][] — the actual monthly movement from
// strategyNav.json (generated from data/strategy-nav.xlsx). The higher of the
// two series sets the y-scale.
function buildGrowthChart(points: number[][]) {
  const x0 = 8;
  const x1 = 492;
  const yBottom = 186;
  const yTop = 16;
  const N = points.length;
  let maxV = 1;
  let minV = 1;
  for (const p of points) {
    maxV = Math.max(maxV, p[0], p[1]);
    minV = Math.min(minV, p[0], p[1]);
  }
  // Scale to the actual [min, max] range (with headroom) so early drawdowns
  // below ₹1 Cr and tall peaks are never clipped at the axes.
  const pad = (maxV - minV) * 0.08 || 0.1;
  const hiV = maxV + pad;
  const loV = minV - pad;
  const yFor = (v: number) => yBottom - ((v - loV) / (hiV - loV || 1)) * (yBottom - yTop);
  const xFor = (i: number) => x0 + (N <= 1 ? 0 : i / (N - 1)) * (x1 - x0);
  const s = points.map((p, i) => [xFor(i), yFor(p[0])] as [number, number]);
  const b = points.map((p, i) => [xFor(i), yFor(p[1])] as [number, number]);
  const toPath = (pts: Array<[number, number]>) =>
    pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  const sPath = toPath(s);
  return {
    sPath,
    bPath: toPath(b),
    sArea: `${sPath} L ${x1},${yBottom} L ${x0},${yBottom} Z`,
    start: s[0],
    sEndPt: s[s.length - 1],
    bEndPt: b[b.length - 1],
    sPts: s,
    bPts: b,
    x0,
    x1,
  };
}

// Fallback smooth compounding curve (end^f) for a strategy without NAV data.
const compoundingPoints = (sEnd: number, bEnd: number): number[][] =>
  Array.from({ length: 33 }, (_, i) => {
    const f = i / 32;
    return [Math.pow(sEnd, f), Math.pow(bEnd, f)];
  });

interface StrategyShowcaseProps {
  eyebrow: string;
  title: string;
  lead: string;
  /** Seed the active tab (e.g. from a URL param). */
  initialTabId?: string;
  /** Fired when the user switches tabs — lets a parent sync the URL. */
  onTabChange?: (id: string) => void;
  /** Teaser mode: trims the tallest blocks and links out to the full page. */
  compact?: boolean;
}

// The interactive strategy showcase: tab selector, left objectives card,
// right analytics card (growth chart + compound values + returns). Shared by
// the Strategies page and the home page.
export const StrategyShowcase: React.FC<StrategyShowcaseProps> = ({
  eyebrow,
  title,
  lead,
  initialTabId,
  onTabChange,
  compact = false,
}) => {
  const showToast = useToast();
  const uploadedNav = useCmsStrategyNav();
  const topStrategyId = useTopMonthlyStrategyId();
  const [activeId, setActiveId] = useState<string>(
    initialTabId && STRATEGIES.some((s) => s.id === initialTabId)
      ? initialTabId
      : STRATEGIES[0].id
  );
  const [hover, setHover] = useState<number | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialTabId && STRATEGIES.some((s) => s.id === initialTabId)) {
      setActiveId(initialTabId);
    }
  }, [initialTabId]);

  const selectTab = (id: string) => {
    setActiveId(id);
    setHover(null);
    onTabChange?.(id);
  };

  const active = STRATEGIES.find((s) => s.id === activeId) || STRATEGIES[0];
  const perf = PERFORMANCE.tables.find((t) => t.strategy === active.name);
  const benchmarkName =
    perf?.benchmarkName ?? active.keyFacts.find((f) => f.k === 'Benchmark')?.v ?? 'Benchmark';
  // Chart-friendly short name (drops "Opportunities" so it fits one line).
  const stratLabel = active.name.replace(' Opportunities', '');
  const inceptionDate = active.keyFacts.find((f) => f.k === 'Inception')?.v ?? 'Inception';

  // NAV source priority: Console-uploaded series → committed strategyNav.json.
  // When a strategy has an uploaded series we also derive its printed figures
  // (₹ endpoint value, since-inception return, "as on" date) from that series,
  // so one Excel upload updates the whole card. Otherwise the hand-set figures
  // in content.ts are shown and the static JSON only shapes the curve.
  const uploaded = uploadedNav.find((s) => s.strategyId === active.id);
  const nav = uploaded ?? STATIC_NAV[active.id];
  const derived = uploaded ? deriveNavStats(uploaded) : null;
  const g = {
    strategy: derived?.strategy ?? active.growth.strategy,
    benchmark: derived?.benchmark ?? active.growth.benchmark,
    strategyCagr: derived?.strategyCagr ?? active.growth.strategyCagr,
    benchmarkCagr: derived?.benchmarkCagr ?? active.growth.benchmarkCagr,
  };
  const asOn = derived?.asOn ?? active.asOn;
  const chartPoints =
    nav?.points && nav.points.length > 1
      ? nav.points
      : compoundingPoints(active.growth.strategyValue, active.growth.benchmarkValue);
  const chartLabels = nav?.labels;
  const chart = buildGrowthChart(chartPoints);
  // Rendered y (px) of a viewBox y within the h-56 (224px) SVG, offset by pt-4 (16px).
  const topPx = (vy: number) => 16 + (vy / 200) * 224;

  // Interactive hover: nearest data point → guide line, dots and a tooltip.
  const hi = hover == null ? null : Math.min(hover, chartPoints.length - 1);
  const onChartMove = (clientX: number) => {
    const el = chartRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const vbX = ((clientX - rect.left) / rect.width) * 500;
    const frac = (vbX - chart.x0) / (chart.x1 - chart.x0);
    const idx = Math.max(0, Math.min(chartPoints.length - 1, Math.round(frac * (chartPoints.length - 1))));
    setHover(idx);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section header with tab selector */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12 gap-4">
        <div className="space-y-2">
          <span className="text-[10px] font-bold text-accent-600 tracking-widest uppercase block font-mono">
            {eyebrow}
          </span>
          <h2 className="font-extrabold tracking-tight text-slate-900 text-3xl sm:text-4xl">
            {title}
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm font-light max-w-xl">{lead}</p>
        </div>

        {/* Strategy selection tabs */}
        <div className="flex flex-wrap gap-2 shrink-0 sm:justify-end">
          {STRATEGIES.map((s) => (
            <button
              key={s.id}
              onClick={() => selectTab(s.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all duration-200 focus:outline-none text-center ${
                activeId === s.id
                  ? 'bg-ink-900 border-ink-900 text-white shadow-md'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {s.name.replace('ACE ', '').replace(' Opportunities', '')}
              {s.id === topStrategyId && (
                <span
                  className="ml-1.5 text-[9px] text-accent-500 font-mono"
                  title="Top performer this month"
                >
                  ★
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div key={active.id} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fadeIn">
        {/* Left objectives card — 5 cols */}
        <div className="lg:col-span-5 bg-slate-50 rounded-2xl p-6 sm:p-8 border border-slate-200/60 shadow-sm space-y-6">
          <div className="space-y-1.5 pb-4 border-b border-slate-200">
            <h3 className="font-extrabold tracking-tight text-slate-900 text-xl sm:text-2xl">
              {active.name}
            </h3>
            <span className="text-xs text-slate-500 italic font-light block">
              &ldquo;{active.tagline}&rdquo;
            </span>
          </div>

          {/* Positioning points as check-cards */}
          <div className="space-y-2.5">
            {active.points.map((point) => (
              <div
                key={point}
                className="flex items-start gap-2.5 p-3 bg-white rounded-xl border border-slate-100 shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-[11px] sm:text-xs font-medium text-slate-700 leading-relaxed">
                  {point}
                </span>
              </div>
            ))}
          </div>

          {/* Key facts grid */}
          <div className="grid grid-cols-2 gap-4 border-t border-slate-200 pt-5 text-xs">
            {active.keyFacts.map((fact) => (
              <div key={fact.k}>
                <span className="text-slate-400 block font-mono text-[9px] uppercase">{fact.k}</span>
                <span className="font-extrabold text-slate-900">{fact.v}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-1">
            <button
              onClick={() =>
                showToast(
                  `The latest ${active.name} factsheet will be available for download from the Resources section.`
                )
              }
              className="flex-1 px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-ink-900 hover:bg-ink-800 transition inline-flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> Download factsheet
            </button>
            <Link
              to="/contact"
              className="flex-1 px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-accent-500 hover:bg-accent-600 transition text-center"
            >
              Request a callback
            </Link>
          </div>
        </div>

        {/* Right analytics card — 7 cols */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          {/* Growth simulation chart */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-2 border-b border-slate-100 gap-2">
              <div>
                <span className="text-[10px] text-slate-400 block font-mono uppercase font-bold">
                  Power of Compounding
                </span>
                <span className="text-xs text-slate-500">
                  Actual growth of ₹1 crore invested at inception (month-end NAV)
                </span>
              </div>
              <div className="flex gap-4 text-xs font-mono font-bold">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-accent-500"></span>
                  <span>{stratLabel}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-slate-300"></span>
                  <span>{benchmarkName}</span>
                </div>
              </div>
            </div>

            <div className="relative pt-4">
              <svg className="w-full h-56" viewBox="0 0 500 200" preserveAspectRatio="none">
                {/* Background grid */}
                <line x1="0" y1="16" x2="500" y2="16" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="0" y1="59" x2="500" y2="59" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="0" y1="101" x2="500" y2="101" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="0" y1="143" x2="500" y2="143" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="0" y1="186" x2="500" y2="186" stroke="#f1f5f9" strokeWidth="1" />

                <defs>
                  <linearGradient id="strategyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#E4611F" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#E4611F" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Strategy area + benchmark + strategy lines (data-driven) */}
                <path d={chart.sArea} fill="url(#strategyGrad)" />
                <path d={chart.bPath} fill="none" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4" />
                <path d={chart.sPath} fill="none" stroke="#E4611F" strokeWidth="3" />

                <circle cx={chart.start[0]} cy={chart.start[1]} r="3.5" fill="#94a3b8" />
                <circle cx={chart.bEndPt[0]} cy={chart.bEndPt[1]} r="4" fill="#94a3b8" />
                <circle cx={chart.sEndPt[0]} cy={chart.sEndPt[1]} r="5" fill="#E4611F" stroke="#ffffff" strokeWidth="2" />

                {/* Hover guide line + markers */}
                {hi != null && (
                  <g>
                    <line
                      x1={chart.sPts[hi][0]}
                      y1={16}
                      x2={chart.sPts[hi][0]}
                      y2={186}
                      stroke="#94a3b8"
                      strokeWidth="1"
                      strokeDasharray="3"
                      opacity="0.6"
                    />
                    <circle cx={chart.bPts[hi][0]} cy={chart.bPts[hi][1]} r="4" fill="#94a3b8" stroke="#ffffff" strokeWidth="1.5" />
                    <circle cx={chart.sPts[hi][0]} cy={chart.sPts[hi][1]} r="5" fill="#E4611F" stroke="#ffffff" strokeWidth="2" />
                  </g>
                )}
              </svg>

              {/* Hover capture overlay */}
              <div
                ref={chartRef}
                className="absolute inset-x-0 top-4 h-56 cursor-crosshair"
                onMouseMove={(e) => onChartMove(e.clientX)}
                onMouseLeave={() => setHover(null)}
                onTouchStart={(e) => onChartMove(e.touches[0].clientX)}
                onTouchMove={(e) => onChartMove(e.touches[0].clientX)}
              />

              {/* Hover tooltip */}
              {hi != null && (
                <div
                  className="absolute z-20 pointer-events-none"
                  style={{
                    left: `${Math.max(16, Math.min(84, (chart.sPts[hi][0] / 500) * 100))}%`,
                    top:
                      chart.sPts[hi][1] < 90
                        ? topPx(chart.sPts[hi][1]) + 14
                        : topPx(chart.sPts[hi][1]) - 14,
                    transform:
                      chart.sPts[hi][1] < 90 ? 'translate(-50%, 0)' : 'translate(-50%, -100%)',
                  }}
                >
                  <div className="bg-white rounded-lg border border-slate-200 shadow-lg px-3 py-2 min-w-[152px]">
                    <div className="text-[11px] font-extrabold text-slate-900 mb-1.5">
                      {chartLabels?.[hi] ?? `Point ${hi + 1}`}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-600">
                      <span className="h-2 w-2 rounded-full bg-accent-500 shrink-0" />
                      <span>{stratLabel}</span>
                      <span className="ml-auto font-bold text-slate-900">
                        ₹{chartPoints[hi][0].toFixed(2)} Cr
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-600 mt-1">
                      <span className="h-2 w-2 rounded-full bg-slate-300 shrink-0" />
                      <span>{benchmarkName}</span>
                      <span className="ml-auto font-bold text-slate-900">
                        ₹{chartPoints[hi][1].toFixed(2)} Cr
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Start-value label at inception — mirrors the end-value labels */}
              <span
                className="absolute left-1 -translate-y-1/2 text-[11px] font-bold text-slate-500 bg-white/85 px-1 rounded"
                style={{ top: topPx(chart.start[1]) - 14 }}
              >
                ₹1 Cr
              </span>

              {/* End-value labels, aligned to each line's end */}
              <span
                className="absolute right-1 -translate-y-1/2 text-xs font-extrabold text-accent-600 bg-white/85 px-1 rounded"
                style={{ top: topPx(chart.sEndPt[1]) }}
              >
                {g.strategy}
              </span>
              <span
                className="absolute right-1 -translate-y-1/2 text-[11px] font-bold text-slate-400 bg-white/85 px-1 rounded"
                style={{ top: topPx(chart.bEndPt[1]) }}
              >
                {g.benchmark}
              </span>

              <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono mt-2 uppercase">
                <span>{inceptionDate}</span>
                <span>As on {asOn}</span>
              </div>
            </div>

            {/* Compound value cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <span className="text-[9px] text-accent-700 font-mono tracking-wider font-bold block uppercase">
                  {stratLabel}
                </span>
                <span className="text-xl sm:text-2xl font-extrabold text-slate-950 block mt-0.5">
                  {g.strategy}
                </span>
                <span className="text-[10px] text-slate-500 font-medium font-mono">
                  At {g.strategyCagr}% since-inception TWRR*
                </span>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <span className="text-[9px] text-slate-400 font-mono block uppercase font-bold">
                  {benchmarkName}
                </span>
                <span className="text-xl sm:text-2xl font-extrabold text-slate-700 block mt-0.5">
                  {g.benchmark}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  At {g.benchmarkCagr}% since-inception TWRR
                </span>
              </div>
            </div>
          </div>

          {/* Returns across horizons */}
          {perf && (
            <div className="space-y-3.5 border-t border-slate-100 pt-5">
              {/* Full tile grid — full view only */}
              {!compact && (
                <>
                  <div className="flex justify-between items-center gap-3 flex-wrap">
                    <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase block font-bold">
                      RETURNS ACROSS HORIZONS (TWRR %)
                    </span>
                    <span className="text-[10px] text-slate-400 italic">As on {asOn}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {PERIOD_LABELS.map((label, i) => (
                      <div
                        key={label}
                        className="p-3 rounded-xl border bg-slate-50/60 border-slate-100 flex flex-col justify-between"
                      >
                        <div className="flex justify-between items-center w-full">
                          <span className="text-xs font-bold text-accent-600 block">{label}</span>
                          <span className="text-xs font-extrabold tracking-tight text-accent-600">
                            {perf.rows.portfolio[i].toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-200/60 h-1.5 rounded-full overflow-hidden mt-2">
                          <div
                            className="h-full rounded-full bg-slate-500 transition-all duration-300"
                            style={{
                              width: `${Math.min(Math.max((perf.rows.portfolio[i] / 30) * 100, 4), 100)}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-[11.5px] text-[#241A4C] font-bold font-mono mt-1.5 block">
                          vs {perf.rows.benchmark[i].toFixed(1)}% {benchmarkName} · +
                          {perf.rows.alpha[i].toFixed(1)}% alpha
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <p className="text-[11px] text-slate-500 font-light leading-relaxed pt-1">
                <Link to="/performance" className="font-bold text-ink-700 hover:text-accent-600">
                  See the Performance page →
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>

      {compact ? (
        <div className="mt-10 text-center">
          <Link
            to="/strategies"
            className="text-xs font-bold text-ink-700 inline-flex items-center gap-1.5 border-b-2 border-accent-500 pb-0.5 hover:text-accent-600 transition"
          >
            Compare all our strategies in full detail →
          </Link>
        </div>
      ) : (
        <Disclaimer>
          Growth-of-₹1-crore curves reflect each strategy's actual month-end NAV since inception,
          all figures as on 31 July 2026. Returns ≤1 year are absolute and &gt;1 year are annualised
          TWRR, based on aggregate portfolio returns post fees and expenses; individual portfolio
          returns may vary. Past performance is not indicative of future results. Investments in
          securities are subject to market risks; read all related documents carefully before
          investing. PMS is intended solely for HNI/UHNI investors. Rankings are based on PMS Bazaar
          monthly reports and internal classification criteria, excluding strategies with a vintage of
          less than 3 years and AMCs with aggregate AUM below ₹200 crore.
        </Disclaimer>
      )}
    </div>
  );
};
