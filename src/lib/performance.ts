import { PERFORMANCE, STRATEGIES } from '../data/content';
import { useCmsPerformance } from './cms/store';

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
