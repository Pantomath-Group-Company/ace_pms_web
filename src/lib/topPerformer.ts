import strategyNav from '../data/strategyNav.json';
import { STRATEGIES } from '../data/content';
import { useCmsStrategyNav } from './cms/store';

// Latest-month return per strategy from the month-end NAV series, used to flag
// the current top monthly performer (the ★). Console-uploaded series (when
// present) take priority over the committed strategyNav.json, so the badge
// refreshes as soon as a new month's Excel is uploaded.
const STATIC_NAV = strategyNav.strategies as Record<string, { points: number[][] }>;

function lastMonthReturn(pts?: number[][]): number {
  if (!pts || pts.length < 2) return -Infinity;
  const last = pts[pts.length - 1]?.[0];
  const prev = pts[pts.length - 2]?.[0];
  return prev && prev > 0 ? last / prev - 1 : -Infinity;
}

function topFrom(navFor: (id: string) => number[][] | undefined): string {
  return STRATEGIES.reduce(
    (best, s) => (lastMonthReturn(navFor(s.id)) > lastMonthReturn(navFor(best)) ? s.id : best),
    STRATEGIES[0].id,
  );
}

/** Static fallback (uploaded data isn't known at module-load time). */
export const TOP_MONTHLY_STRATEGY_ID: string = topFrom((id) => STATIC_NAV[id]?.points);

/** Reactive variant — reflects Console-uploaded NAV data. */
export function useTopMonthlyStrategyId(): string {
  const uploaded = useCmsStrategyNav();
  const map = new Map(uploaded.map((s) => [s.strategyId, s.points]));
  return topFrom((id) => map.get(id) ?? STATIC_NAV[id]?.points);
}
