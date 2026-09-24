import type { FC } from 'react';
import { Award } from 'lucide-react';
import { PMS_RANKINGS } from '../data/content';

// PMS Bazaar category rankings (deck slide 14) — a premium, dark showcase that
// management wants surfaced near the top of the home page.
export const RankingsTable: FC = () => (
  <section className="relative overflow-hidden bg-ink-900 text-white font-sans py-20 sm:py-24 border-b border-ink-800">
    {/* Ambient glow + faint grid for depth */}
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage:
          'radial-gradient(60% 55% at 50% -10%, rgba(228,97,31,0.20), transparent 60%)',
      }}
      aria-hidden="true"
    />
    <div className="absolute inset-0 bg-grid-pattern opacity-[0.06] pointer-events-none" aria-hidden="true" />

    <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Heading */}
      <div className="text-center max-w-2xl mx-auto space-y-4 mb-12">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-accent-400 font-mono">
          <Award className="w-3.5 h-3.5" /> {PMS_RANKINGS.eyebrow}
        </span>
        <h2 className="font-extrabold tracking-tight text-3xl sm:text-4xl leading-tight">
          {PMS_RANKINGS.title}
        </h2>
        <p className="text-ink-100/70 text-sm font-light leading-relaxed">{PMS_RANKINGS.lead}</p>
      </div>

      {/* Table card */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[560px]">
            <thead>
              <tr className="text-[10px] uppercase tracking-[0.16em] font-mono text-ink-100/45 border-b border-white/10">
                <th className="py-4 px-6 font-semibold">PMS Strategy</th>
                <th className="py-4 px-6 font-semibold">Category</th>
                <th className="py-4 px-6 font-semibold">Period</th>
                <th className="py-4 px-6 font-semibold text-right">Rank</th>
              </tr>
            </thead>
            <tbody>
              {PMS_RANKINGS.rows.map((r) => (
                <tr
                  key={`${r.strategy}-${r.period}`}
                  className="border-t border-white/[0.06] hover:bg-white/[0.04] transition-colors"
                >
                  <td className="py-5 px-6 font-bold text-white">{r.strategy}</td>
                  <td className="py-5 px-6 text-sm text-ink-100/65">{r.category}</td>
                  <td className="py-5 px-6 text-sm text-ink-100/65">{r.period}</td>
                  <td className="py-5 px-6 text-right">
                    <span className="text-lg font-extrabold text-accent-400 tracking-tight">
                      {r.rank}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </section>
);
