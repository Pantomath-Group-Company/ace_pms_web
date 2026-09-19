import { PERFORMANCE } from '../data/content';
import { PageHero, SectionHeading, Disclaimer } from '../components/shared';
import { useResolvedPerformanceTables } from '../lib/performance';
import { useAsOnDate, applyAsOn } from '../lib/asOn';

const PERIODS = ['1 Yr', '3 Yr', '5 Yr', 'Since Incep.'];

const fmt = (v: number) => `${v.toFixed(1)}%`;

export default function PerformancePage() {
  const tables = useResolvedPerformanceTables();
  const asOn = useAsOnDate();
  return (
    <>
      <PageHero
        eyebrow="PERFORMANCE"
        title={
          <>
            Proven Wealth <span className="text-transparent bg-clip-text bg-gradient-to-r from-ink-700 to-accent-600">Creation</span>
          </>
        }
        lead={
          <>
            Three Strategies. One Investment Philosophy.{' '}
            <span className="font-bold text-slate-800">Consistent Alpha Across Market Cycles.</span>
          </>
        }
      />

      {/* Strategy performance tables */}
      <section className="py-20 bg-white border-b border-slate-100 font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading title="Performance (TWRR)" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {tables.map((table) => (
              <div
                key={table.strategy}
                className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-sm"
              >
                <div className="flex justify-between items-baseline mb-4 gap-3 flex-wrap">
                  <h3 className="font-extrabold text-lg text-slate-900">
                    {table.strategy.replace(' Opportunities', '')}
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono">({table.since})</span>
                </div>
                <table className="w-full border-collapse text-left text-xs font-sans">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-medium font-mono uppercase tracking-widest text-[9px]">
                      <th className="py-2.5 px-2"></th>
                      <th className="py-2.5 px-2 text-right">Portfolio</th>
                      <th className="py-2.5 px-2 text-right normal-case tracking-normal">{table.benchmarkName}</th>
                      <th className="py-2.5 px-2 text-right text-ink-900">Alpha</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/70 text-slate-700">
                    {PERIODS.map((period, i) => (
                      <tr key={period}>
                        <td className="py-3 px-2 font-bold text-slate-900 font-mono uppercase text-[10px] tracking-wider">
                          {period}
                        </td>
                        <td className="py-3 px-2 text-right font-mono font-semibold text-slate-900">
                          {fmt(table.rows.portfolio[i])}
                        </td>
                        <td className="py-3 px-2 text-right font-mono text-slate-500">
                          {fmt(table.rows.benchmark[i])}
                        </td>
                        <td
                          className={`py-3 px-2 text-right font-mono font-bold ${
                            table.rows.alpha[i] >= 0 ? 'text-accent-600' : 'text-rose-600'
                          }`}
                        >
                          {table.rows.alpha[i] >= 0 ? '+' : ''}
                          {fmt(table.rows.alpha[i])}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
          <Disclaimer>{applyAsOn(PERFORMANCE.tableNote, asOn)}</Disclaimer>
        </div>
      </section>
    </>
  );
}
