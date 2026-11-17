import { PERFORMANCE, STRATEGIES } from '../data/content';
import { useCmsPerformance, useCmsStrategyNav, useCmsStrategyNotes } from './cms/store';
import { formatAsOn } from './cms/navParser';

// Merge Console-uploaded horizon returns over the committed PERFORMANCE.tables.
// Tables are keyed by strategy name; uploads by strategy id — STRATEGIES bridges
// the two. Alpha is always derived (portfolio − benchmark). Strategies without
// an upload keep their hand-set figures.
const idForName = (name: string) => STRATEGIES.find((s) => s.name === name)?.id;

export type PerformanceTable = (typeof PERFORMANCE.tables)[number];

export function useResolvedPerformanceTables(): PerformanceTable[] {
  const uploaded = useCmsPerformance();
  const byId = new Map(uploaded.map((p) => [p.strategyId, p]));
  return PERFORMANCE.tables.map((t) => {
    const id = idForName(t.strategy);
    const up = id ? byId.get(id) : undefined;
    if (!up || up.portfolio.length < 4 || up.benchmark.length < 4) return t;
    const alpha = up.portfolio.map((v, i) => Math.round((v - up.benchmark[i]) * 10) / 10);
    return { ...t, rows: { portfolio: up.portfolio, benchmark: up.benchmark, alpha } };
  });
}

export type GrowthEntry = (typeof PERFORMANCE.growth)[number];

const round1 = (v: number) => Math.round(v * 10) / 10;

/**
 * "Growth of ₹1 crore" cards, kept identical to the Strategies page:
 * a Console-uploaded NAV series (rebased to ₹1 cr at inception) supplies the
 * ₹ endpoint values and "as on" date; otherwise the strategy's own figures in
 * STRATEGIES[].growth are used — the same source the Strategies page reads.
 */
export function useResolvedGrowth(): GrowthEntry[] {
  const uploaded = useCmsStrategyNav();
  return PERFORMANCE.growth.map((g) => {
    const s = STRATEGIES.find((x) => x.name === g.strategy);
    if (!s) return g;
    const series = uploaded.find((u) => u.strategyId === s.id);
    const last = series?.points?.length && series.points.length > 1 ? series.points[series.points.length - 1] : null;
    if (series && last) {
      return {
        ...g,
        terminalValue: round1(last[0]),
        benchmarkValue: round1(last[1]),
        asOn: formatAsOn(series.asOf),
      };
    }
    return {
      ...g,
      terminalValue: s.growth.strategyValue,
      benchmarkValue: s.growth.benchmarkValue,
      asOn: s.asOn,
    };
  });
}

/** Index of the 5-year column in the [1Y, 3Y, 5Y, SI] horizon arrays. */
const FIVE_YEAR = 2;

const fmtPct = (v: number) => {
  const r = Math.round(v * 10) / 10;
  return Number.isInteger(r) ? String(r) : r.toFixed(1);
};

export interface ReturnRange {
  min: number;
  max: number;
  /** "19.9–24.8" (or a single "24.8" when every strategy is equal). No % sign. */
  label: string;
}

/**
 * 5-year annualised return range across every strategy: the lowest 5Y
 * portfolio return is the start, the highest is the end. Reads the resolved
 * tables, so a Console upload for any strategy moves the range immediately.
 */
export function useFiveYearReturnRange(): ReturnRange | null {
  const values = useResolvedPerformanceTables()
    .map((t) => Number(t.rows.portfolio[FIVE_YEAR]))
    .filter((v) => Number.isFinite(v));
  if (values.length === 0) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const label = fmtPct(min) === fmtPct(max) ? fmtPct(max) : `${fmtPct(min)}–${fmtPct(max)}`;
  return { min, max, label };
}

/**
 * Track-record banner for a strategy: the Console-edited note when one exists
 * (an empty note hides the banner), otherwise the built-in content.ts text.
 */
export function useTrackRecord(strategyId: string): string | undefined {
  const notes = useCmsStrategyNotes();
  const note = notes.find((n) => n.strategyId === strategyId);
  if (note) return note.trackRecord.trim() || undefined;
  return STRATEGIES.find((s) => s.id === strategyId)?.trackRecord;
}
