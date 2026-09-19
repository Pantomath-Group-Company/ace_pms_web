import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { PERFORMANCE } from '../data/content';
import { CountUp, prefersReducedMotion, useInView } from './motion';
import { useAsOnDate, applyAsOn } from '../lib/asOn';

function GrowthCard({ g }: { g: (typeof PERFORMANCE.growth)[number] }) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const reduce = prefersReducedMotion();
  const benchPct = Math.round((g.benchmarkValue / g.terminalValue) * 100);
  const revealed = reduce || inView;

  return (
    <div
      ref={ref}
      className="bg-white rounded-2xl border border-slate-200/80 p-7 sm:p-8 shadow-sm space-y-6"
    >
      <h3 className="font-extrabold text-base text-ink-900">{g.strategy}</h3>

      {/* The number — the hero of the card */}
      <div className="space-y-1">
        <div className="text-[12px] font-mono font-bold text-accent-600 uppercase tracking-wider">₹1 cr →</div>
        <div className="text-[44px] sm:text-[52px] font-extrabold text-ink-800 tracking-tight leading-none tabular-nums">
          ₹<CountUp value={g.terminalValue} active={inView} decimals={1} /> cr
        </div>
      </div>

      {/* Dual-bar comparison — pure divs, no chart library */}
      <div className="space-y-3 pt-1">
        <div>
          <div className="flex justify-between text-[10px] font-mono mb-1.5">
            <span className="font-bold text-ink-700">{g.strategy}</span>
            <span className="font-bold text-accent-600">~₹{g.terminalValue} cr</span>
          </div>
          <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-accent-500 rounded-full transition-[width] duration-1000 ease-out"
              style={{ width: revealed ? '100%' : '0%' }}
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-[10px] font-mono mb-1.5">
            <span className="text-slate-500">{g.benchmarkName}</span>
            <span className="text-slate-500">~₹{g.benchmarkValue} cr</span>
          </div>
          <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#241A4C] rounded-full transition-[width] duration-1000 ease-out"
              style={{ width: revealed ? `${benchPct}%` : '0%' }}
            />
          </div>
        </div>
      </div>

      <div className="text-[11px] text-slate-500 font-light border-t border-slate-200 pt-4">
        Inception {g.inception}
      </div>
    </div>
  );
}

// "Growth of ₹1 crore" — the emotional centrepiece: proof right after philosophy.
export const GrowthShowcase = () => {
  const asOn = useAsOnDate();
  return (
  <section id="growth" className="py-24 bg-[#FAFAFA] border-b border-slate-200/60 font-sans">
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
        <span className="text-[10px] font-bold text-accent-600 tracking-widest uppercase block font-mono">
          GROWTH OF ₹1 CRORE
        </span>
        <h2 className="font-extrabold tracking-tight text-slate-900 text-3xl sm:text-4xl">
          What ₹1 crore at inception became
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        {PERFORMANCE.growth.map((g) => (
          <GrowthCard key={g.strategy} g={g} />
        ))}
      </div>

      <p className="text-center text-[11px] text-slate-400 italic mt-10 max-w-2xl mx-auto leading-relaxed">
        {applyAsOn(PERFORMANCE.growthNote, asOn)}
      </p>

      <div className="text-center mt-8">
        <Link
          to="/performance"
          className="text-xs font-bold text-ink-700 inline-flex items-center gap-1.5 border-b-2 border-accent-500 pb-0.5 hover:text-accent-600 transition"
        >
          View Full Performance <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  </section>
  );
};
