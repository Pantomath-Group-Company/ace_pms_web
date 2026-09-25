import type { FC } from 'react';
import { Award } from 'lucide-react';
import { PMS_RANKINGS } from '../data/content';

// PMS Bazaar category rankings (deck slide 14) — a light, premium showcase in
// the brand's purple/ink family, surfaced high on the home page.
export const RankingsTable: FC = () => (
  <section className="relative overflow-hidden font-sans py-20 sm:py-24 border-b border-slate-100 bg-[#F6F4FC]">
    {/* Soft ambient wash for depth */}
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: 'radial-gradient(60% 55% at 50% -10%, rgba(69,31,114,0.10), transparent 60%)',
      }}
      aria-hidden="true"
    />

    <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Heading */}
      <div className="text-center max-w-2xl mx-auto space-y-4 mb-12">
        <span className="inline-flex items-center gap-2 rounded-full border border-ink-200/60 bg-white px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-accent-600 font-mono shadow-sm">
          <Award className="w-3.5 h-3.5" /> {PMS_RANKINGS.eyebrow}
        </span>
        <h2 className="font-extrabold tracking-tight text-ink-900 text-3xl sm:text-4xl leading-tight">
          {PMS_RANKINGS.title}
        </h2>
        <p className="text-slate-500 text-sm font-light leading-relaxed">{PMS_RANKINGS.lead}</p>
      </div>

      {/* Desktop / tablet — full table */}
      <div className="hidden sm:block rounded-2xl border border-slate-200/70 bg-white shadow-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-ink-900 to-accent-600 text-white text-[11px] uppercase tracking-[0.14em] font-mono">
              <th className="py-4 px-6 font-semibold">PMS Strategy</th>
              <th className="py-4 px-6 font-semibold">Category</th>
              <th className="py-4 px-6 font-semibold">Period</th>
              <th className="py-4 px-6 font-semibold text-right">Rank</th>
            </tr>
          </thead>
          <tbody>
            {PMS_RANKINGS.rows.map((r, i) => (
              <tr
                key={`${r.strategy}-${r.period}`}
                className={`border-t border-slate-100 ${i % 2 ? 'bg-[#FAF9FE]' : 'bg-white'}`}
              >
                <td className="py-5 px-6 font-bold text-ink-900">{r.strategy}</td>
                <td className="py-5 px-6 text-sm text-slate-600">{r.category}</td>
                <td className="py-5 px-6 text-sm text-slate-600">{r.period}</td>
                <td className="py-5 px-6 text-right">
                  <span className="inline-flex items-center justify-center rounded-full bg-accent-50 border border-accent-100 px-4 py-1.5 text-sm font-extrabold text-accent-700 tracking-tight">
                    {r.rank}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile — stacked cards */}
      <div className="sm:hidden space-y-3">
        {PMS_RANKINGS.rows.map((r) => (
          <div
            key={`${r.strategy}-${r.period}`}
            className="rounded-2xl border border-slate-200/70 bg-white shadow-sm p-4 flex items-start justify-between gap-3"
          >
            <div className="min-w-0">
              <p className="font-bold text-ink-900 text-sm leading-snug">{r.strategy}</p>
              <p className="text-[11px] text-slate-500 mt-1">
                {r.category} · {r.period}
              </p>
            </div>
            <span className="shrink-0 inline-flex items-center rounded-full bg-accent-50 border border-accent-100 px-3.5 py-1.5 text-xs font-extrabold text-accent-700">
              {r.rank}
            </span>
          </div>
        ))}
      </div>
    </div>
  </section>
);
