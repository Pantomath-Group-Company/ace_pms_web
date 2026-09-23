import { useEffect, useRef, useState, type FC } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, RefreshCw, Shield, Users, Scale, Brain } from 'lucide-react';

/* ------------------------------------------------------------------ */
/* The ACE SCALE framework — five filters on an auto-rotating orbit     */
/* around a central "brain". Clicking a node (or a list item) pauses    */
/* the spin, snaps that filter to the bottom, and opens its detail.     */
/* ------------------------------------------------------------------ */

interface ScaleFilter {
  letter: string;
  title: string;
  node: string; // short label shown on the orbit
  sub: string;
  desc: string;
  Icon: FC<{ className?: string; strokeWidth?: number }>;
}

const SCALE: ScaleFilter[] = [
  {
    letter: 'S',
    title: 'Structural Growth',
    node: 'Structural Growth',
    sub: 'High-Growth Industry · 1.5–2× GDP growth',
    desc: 'Invest in industries benefiting from structural tailwinds and capable of growing materially faster than the broader economy.',
    Icon: TrendingUp,
  },
  {
    letter: 'C',
    title: 'Capital Cycle',
    node: 'Capital Cycle',
    sub: 'Favourable Capital Cycle · Stable → improving ROCE',
    desc: 'Focus on industries where capital addition remains disciplined and incremental investment generates attractive or improving returns on capital.',
    Icon: RefreshCw,
  },
  {
    letter: 'A',
    title: 'Advantage',
    node: 'Advantage',
    sub: 'Strong Moats · Differentiated business models',
    desc: 'Own leadership businesses with sustainable competitive advantages, differentiated capabilities or business models that enable them to gain market share.',
    Icon: Shield,
  },
  {
    letter: 'L',
    title: 'Leadership & Management',
    node: 'Leadership',
    sub: 'Execution + Capital Allocation track record',
    desc: 'Back capable management teams with a demonstrated record of execution, prudent capital allocation and sustaining superior ROCE.',
    Icon: Users,
  },
  {
    letter: 'E',
    title: 'Entry Valuation',
    node: 'Valuation',
    sub: 'Reasonable Multiples · Margin of Safety',
    desc: 'Enter businesses at valuations where expected earnings growth and quality adequately compensate for the multiple paid, improving long-term return outcomes.',
    Icon: Scale,
  },
];

const RADIUS = 132;

// Node position on the orbit. Base angle places index 0 at the top; a shared
// rotation spins the whole orbit. Depth (front/back) drives opacity + z-index.
function nodePosition(index: number, total: number, rotationDeg: number) {
  const angle = ((index / total) * 360 + rotationDeg - 90) * (Math.PI / 180);
  const depth = Math.sin(angle); // +1 = front/bottom, -1 = back/top
  return {
    x: RADIUS * Math.cos(angle),
    y: RADIUS * Math.sin(angle),
    zIndex: 20 + Math.round(depth * 10),
    opacity: 0.55 + ((depth + 1) / 2) * 0.45,
  };
}

interface ScaleFrameworkProps {
  /** Hide the closing "flow line" strip. */
  compact?: boolean;
  /** Homepage mode: render just the centred brain orbit (no side copy/list). */
  orbitOnly?: boolean;
}

export const ScaleFramework: FC<ScaleFrameworkProps> = ({ compact = false, orbitOnly = false }) => {
  const total = SCALE.length;
  const [rotation, setRotation] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const orbitBoxRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selected != null) return;
    const id = window.setInterval(() => setRotation((r) => (r + 0.28) % 360), 40);
    return () => window.clearInterval(id);
  }, [selected]);

  // Click anywhere outside the orbit or its detail card → close and resume spin.
  // (orbit-only / homepage mode; the full layout uses its side list to switch.)
  useEffect(() => {
    if (selected == null || !orbitOnly) return;
    const onDocClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (orbitBoxRef.current?.contains(t)) return;
      if (cardRef.current?.contains(t)) return;
      setSelected(null);
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, [selected]);

  // Escape closes the open detail (popup on the full layout).
  useEffect(() => {
    if (selected == null) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setSelected(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selected]);

  const select = (index: number) => {
    if (selected === index) {
      setSelected(null);
      return;
    }
    setSelected(index);
    setRotation(180 - (index / total) * 360);
  };

  const active = selected != null ? SCALE[selected] : null;

  const heading = (
    <>
      <span className="text-[10px] font-bold text-accent-600 tracking-widest uppercase block font-mono">
        Our Investment Philosophy
      </span>
      <h2 className="font-extrabold tracking-tight text-slate-900 text-3xl sm:text-4xl mt-2">
        The ACE{' '}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-ink-700 to-accent-600">
          SCALE
        </span>{' '}
        Framework
      </h2>
      <p className="text-[11px] font-mono font-bold text-accent-600 tracking-wide mt-2">
        Growth • Capital Efficiency • Leadership • Valuation Discipline
      </p>
    </>
  );

  const orbit = (
    <div
      ref={orbitBoxRef}
      className="relative h-[360px] sm:h-[400px] select-none"
      onClick={() => setSelected(null)}
    >
      {/* Rings */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full border border-slate-200" />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[224px] h-[224px] rounded-full border border-dashed border-slate-200" />

      {/* Brain hub */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
        <div className="relative grid place-items-center w-24 h-24 rounded-full bg-gradient-to-br from-ink-900 to-accent-500 shadow-lg">
          <span className="absolute inset-0 rounded-full bg-accent-500/25 animate-ping" style={{ animationDuration: '2.8s' }} />
          <span className="absolute inset-2 rounded-full bg-ink-900/20 animate-ping" style={{ animationDuration: '3.6s' }} />
          <Brain className="relative w-11 h-11 text-white" strokeWidth={1.6} />
        </div>
      </div>

      {/* Orbiting nodes */}
      {SCALE.map((f, i) => {
        const { x, y, zIndex, opacity } = nodePosition(i, total, rotation);
        const on = selected === i;
        return (
          <button
            key={f.letter}
            type="button"
            aria-label={f.title}
            aria-pressed={on}
            onClick={(e) => {
              e.stopPropagation();
              select(i);
            }}
            className="absolute left-1/2 top-1/2 group"
            style={{
              transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
              transition: 'transform 0.5s ease',
              zIndex: on ? 40 : zIndex,
              opacity: on ? 1 : opacity,
            }}
          >
            <span
              className={`grid place-items-center w-14 h-14 rounded-full border bg-white transition ${
                on
                  ? 'border-accent-500 ring-4 ring-accent-100 scale-110 text-accent-600'
                  : 'border-slate-200 text-ink-700 group-hover:border-accent-300 shadow-sm'
              }`}
            >
              <f.Icon className="w-5 h-5" strokeWidth={1.9} />
            </span>
            <span
              className={`absolute left-1/2 top-full -translate-x-1/2 mt-1.5 whitespace-nowrap text-[10px] font-bold uppercase tracking-wider transition ${
                on ? 'text-accent-600' : 'text-slate-500'
              }`}
            >
              <span className="text-[#E4611F]">{f.node.charAt(0)}</span>
              {f.node.slice(1)}
            </span>
          </button>
        );
      })}
    </div>
  );

  const detailCard = (
    <div ref={cardRef} className="mt-2 min-h-[132px]">
      {active ? (
        <motion.div
          key={active.letter}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-lg bg-accent-500 text-white grid place-items-center font-extrabold">
              {active.letter}
            </span>
            <div>
              <h4 className="font-extrabold text-slate-900 leading-tight">{active.title}</h4>
              <p className="text-[11px] font-mono text-accent-600 font-bold">{active.sub}</p>
            </div>
          </div>
          <p className="text-xs text-slate-600 font-light leading-relaxed mt-3">{active.desc}</p>
        </motion.div>
      ) : null}
    </div>
  );

  // Homepage: just the centred brain orbit + a short heading + the detail card.
  if (orbitOnly) {
    return (
      <section className="pt-20 pb-6 bg-white border-b border-slate-100 font-sans overflow-hidden">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {heading}
          <div className="mt-10 mb-16 sm:mb-6 flex justify-center">
            <div className="w-[440px] max-w-full" style={{ transform: 'scale(1.12)' }}>
              {orbit}
            </div>
          </div>
          <div className="max-w-xl mx-auto text-left">{detailCard}</div>
        </div>
      </section>
    );
  }

  return (
    <section className="pt-20 pb-10 bg-white border-b border-slate-100 font-sans overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading — full width above the two columns */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl"
        >
          {heading}
          <p className="text-sm text-slate-500 font-light leading-relaxed mt-4">
            SCALE seeks leadership businesses in structurally high-growth industries, operating
            within favourable capital cycles, led by capable capital allocators and available at
            reasonable entry valuations.
          </p>
        </motion.div>

        {/* Accordion list (left) aligned with the brain orbit (right) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-14 mt-10 items-center">
          {/* Filter list — the selected item expands inline to reveal its detail */}
          <div className="space-y-2">
            {SCALE.map((f, i) => {
              const on = selected === i;
              return (
                <button
                  key={f.letter}
                  type="button"
                  onClick={() => select(i)}
                  aria-expanded={on}
                  className={`w-full text-left rounded-xl border p-3.5 transition ${
                    on
                      ? 'bg-accent-50/60 border-accent-200 shadow-sm'
                      : 'bg-white border-slate-200/70 hover:border-accent-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`shrink-0 w-8 h-8 rounded-lg grid place-items-center font-extrabold text-sm transition ${
                        on ? 'bg-accent-500 text-white' : 'bg-ink-900 text-white'
                      }`}
                    >
                      {f.letter}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-bold text-slate-900">{f.title}</span>
                      <span className="block text-[11px] text-slate-500 font-light leading-snug">
                        {f.sub}
                      </span>
                    </span>
                  </div>
                  {on && (
                    <p className="text-xs text-slate-600 font-light leading-relaxed mt-4 pl-11">
                      {f.desc}
                    </p>
                  )}
                </button>
              );
            })}
          </div>

          {/* Brain orbit — sized to sit alongside the list band */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex justify-center lg:justify-start lg:pl-4"
          >
            <div className="w-[440px] max-w-full" style={{ transform: 'scale(1.12)' }}>
              {orbit}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
