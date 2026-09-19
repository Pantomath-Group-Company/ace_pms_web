/* ------------------------------------------------------------------ */
/* NAV workbook parsing + derived-stat helpers.                        */
/*                                                                     */
/* Pure functions (no xlsx dependency) so they're easy to reason about */
/* and reuse. The Console reads the uploaded Excel with SheetJS (lazy- */
/* imported) into a rows array, then hands it to parseNavRows().       */
/* ------------------------------------------------------------------ */

const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export interface ParsedNav {
  since: string; // YYYY-MM-DD
  asOf: string; // YYYY-MM-DD
  labels: string[];
  points: number[][]; // [[strategyRebased, benchmarkRebased], ...]
}

// Accepts an Excel serial number, a JS Date, or a parseable date string.
function toDate(v: unknown): Date | null {
  if (typeof v === 'number' && isFinite(v)) {
    return new Date(Date.UTC(1899, 11, 30) + Math.round(v) * 86400000);
  }
  if (v instanceof Date && !isNaN(v.getTime())) return v;
  if (typeof v === 'string') {
    const t = Date.parse(v);
    if (!isNaN(t)) return new Date(t);
  }
  return null;
}

/**
 * Turn raw worksheet rows (Date | Strategy NAV | Benchmark NAV) into a clean,
 * month-end, rebased-to-1 series. Header rows and blanks are skipped because
 * they fail the date/number checks. Throws a friendly error if the sheet has no
 * usable data.
 */
export function parseNavRows(rows: unknown[][]): ParsedNav {
  const byMonth = new Map<string, { d: Date; s: number; b: number }>();

  for (const r of rows) {
    if (!Array.isArray(r) || r.length < 3) continue;
    const d = toDate(r[0]);
    const s = Number(r[1]);
    const b = Number(r[2]);
    if (!d || !isFinite(s) || !isFinite(b) || s <= 0 || b <= 0) continue;
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
    const existing = byMonth.get(key);
    // Keep the latest row within each month (month-end), even if unsorted.
    if (!existing || d.getTime() > existing.d.getTime()) byMonth.set(key, { d, s, b });
  }

  const months = [...byMonth.values()].sort((a, b) => a.d.getTime() - b.d.getTime());
  if (months.length < 2) {
    throw new Error(
      'Could not read the NAV series. Expected columns: Date, Strategy NAV, Benchmark NAV — with at least two months of rows.',
    );
  }

  const s0 = months[0].s;
  const b0 = months[0].b;
  return {
    since: months[0].d.toISOString().slice(0, 10),
    asOf: months[months.length - 1].d.toISOString().slice(0, 10),
    labels: months.map((m) => `${MON[m.d.getUTCMonth()]} ${m.d.getUTCFullYear()}`),
    points: months.map((m) => [
      Math.round((m.s / s0) * 10000) / 10000,
      Math.round((m.b / b0) * 10000) / 10000,
    ]),
  };
}

export interface ParsedPerformance {
  portfolio: number[]; // [1Y, 3Y, 5Y, Since-Inception]
  benchmark: number[];
}

// Map a period label in the first column to its slot. Falls back to row order.
function periodSlot(label: unknown): number {
  const s = String(label ?? '').toLowerCase();
  if (/incep|since|si\b|inception/.test(s)) return 3;
  if (/\b5\b|5\s*y|five/.test(s)) return 2;
  if (/\b3\b|3\s*y|three/.test(s)) return 1;
  if (/\b1\b|1\s*y|one/.test(s)) return 0;
  return -1;
}

/**
 * Parse a horizon-returns sheet (Period | Portfolio % | Benchmark %) into two
 * 4-slot arrays [1Y, 3Y, 5Y, Since-Inception]. Rows are matched by the period
 * label; if labels aren't recognised, the first four data rows are used in
 * order. Header rows and blanks are skipped.
 */
export function parsePerformanceRows(rows: unknown[][]): ParsedPerformance {
  const portfolio: (number | null)[] = [null, null, null, null];
  const benchmark: (number | null)[] = [null, null, null, null];
  const ordered: { p: number; b: number }[] = [];

  for (const r of rows) {
    if (!Array.isArray(r) || r.length < 3) continue;
    const p = Number(r[1]);
    const b = Number(r[2]);
    if (!isFinite(p) || !isFinite(b)) continue; // skips the header row
    const slot = periodSlot(r[0]);
    if (slot >= 0) {
      portfolio[slot] = p;
      benchmark[slot] = b;
    }
    ordered.push({ p, b });
  }

  // Fill any slot not matched by label from the row order.
  for (let i = 0; i < 4; i++) {
    if (portfolio[i] === null && ordered[i]) {
      portfolio[i] = ordered[i].p;
      benchmark[i] = ordered[i].b;
    }
  }

  if (portfolio.some((v) => v === null)) {
    throw new Error(
      'Could not read the returns. Expected columns Period, Portfolio %, Benchmark % with four rows: 1Y, 3Y, 5Y and Since Inception.',
    );
  }
  return { portfolio: portfolio as number[], benchmark: benchmark as number[] };
}

/** "2026-07-31" → "31 Jul 2026". */
export function formatAsOn(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return `${String(d.getUTCDate()).padStart(2, '0')} ${MON[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

// "₹4 Cr" / "₹2.6 Cr" — one decimal, trimmed when whole.
function crore(v: number): string {
  const r = Math.round(v * 10) / 10;
  return `₹${Number.isInteger(r) ? r.toFixed(0) : r.toFixed(1)} Cr`;
}

export interface NavStats {
  strategy: string; // "₹4 Cr"
  benchmark: string;
  strategyCagr: number; // 19.2
  benchmarkCagr: number;
  asOn: string; // "31 Jul 2026"
}

/**
 * Derive the printed figures from a rebased series: the ₹-crore endpoint value
 * (₹1 cr invested at inception → last rebased value in crore) and the
 * since-inception annualised return (CAGR of the rebased series).
 */
export function deriveNavStats(series: {
  since: string;
  asOf: string;
  points: number[][];
}): NavStats | null {
  const pts = series.points;
  if (!pts || pts.length < 2) return null;
  const last = pts[pts.length - 1];
  const years =
    (new Date(series.asOf).getTime() - new Date(series.since).getTime()) / (365.25 * 86400000);
  const cagr = (v: number) => (years > 0 && v > 0 ? (Math.pow(v, 1 / years) - 1) * 100 : 0);
  return {
    strategy: crore(last[0]),
    benchmark: crore(last[1]),
    strategyCagr: Math.round(cagr(last[0]) * 10) / 10,
    benchmarkCagr: Math.round(cagr(last[1]) * 10) / 10,
    asOn: formatAsOn(series.asOf),
  };
}
