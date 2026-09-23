import { useState, type FC } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

/* ------------------------------------------------------------------ */
/* Monoline vector illustrations — 2px stroke, no fill, currentColor.  */
/* These sit in each card's "picture place" (the medallion).           */
/* ------------------------------------------------------------------ */

const svgProps = {
  viewBox: '0 0 64 64',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.9,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

// Advisor–client consultation
const IllustrationConsult: FC<{ className?: string }> = ({ className = '' }) => (
  <svg {...svgProps} className={className} aria-hidden="true">
    <circle cx="22" cy="20" r="6" />
    <path d="M11 44c0-6.5 5-11 11-11s11 4.5 11 11" />
    <circle cx="46" cy="22" r="5" />
    <path d="M38 44c0-5.5 3.5-9 8-9s8 3.5 8 9" />
    <path d="M6 52h52" />
  </svg>
);

// Figure with award / ranking motif
const IllustrationAward: FC<{ className?: string }> = ({ className = '' }) => (
  <svg {...svgProps} className={className} aria-hidden="true">
    <circle cx="32" cy="18" r="8" />
    <path d="M24 25l-4 9M40 25l4 9M22 34h20" />
    <circle cx="32" cy="45" r="9" />
    <path d="M32 40v5l3.5 2" />
    <path d="M18 57h28" />
  </svg>
);

// Analyst with rising chart
const IllustrationChart: FC<{ className?: string }> = ({ className = '' }) => (
  <svg {...svgProps} className={className} aria-hidden="true">
    <path d="M12 12v40h40" />
    <path d="M18 44l10-11 8 6 14-19" />
    <path d="M44 20h6v6" />
    <circle cx="18" cy="44" r="1.6" />
    <circle cx="28" cy="33" r="1.6" />
    <circle cx="36" cy="39" r="1.6" />
  </svg>
);

// Research team reviewing documents
const IllustrationResearch: FC<{ className?: string }> = ({ className = '' }) => (
  <svg {...svgProps} className={className} aria-hidden="true">
    <rect x="23" y="10" width="18" height="24" rx="2" />
    <path d="M27 17h10M27 22h10M27 27h6" />
    <circle cx="15" cy="30" r="4.5" />
    <path d="M8 45c0-4.5 3-7.5 7-7.5s7 3 7 7.5" />
    <circle cx="49" cy="30" r="4.5" />
    <path d="M42 45c0-4.5 3-7.5 7-7.5s7 3 7 7.5" />
  </svg>
);

/* ------------------------------------------------------------------ */
/* Card data                                                          */
/* ------------------------------------------------------------------ */

interface ImpactCard {
  id: string;
  metric: string;
  title: string;
  description: string;
  redirect: string;
  cta: string;
  Illustration: FC<{ className?: string }>;
  surface: string; // card container tint
  medallion: string; // "picture place" backdrop
  metricClass: string;
  strokeClass: string; // illustration tint
  titleClass: string;
  descClass: string;
  ctaClass: string;
}

const impactCards: ImpactCard[] = [
  {
    id: 'track-record',
    metric: '9+ Yrs',
    title: 'Proven track record',
    description:
      'Navigating multiple bull and bear cycles since 2017 — longevity that compounds trust as reliably as capital.',
    redirect: '/about',
    cta: 'Learn more',
    Illustration: IllustrationConsult,
    surface: 'bg-accent-50 border-accent-100',
    medallion: 'bg-white/70',
    metricClass: 'text-accent-600',
    strokeClass: 'text-accent-600',
    titleClass: 'text-ink-900',
    descClass: 'text-ink-700/75',
    ctaClass: 'text-ink-700 hover:text-accent-600',
  },
  {
    id: 'ranked',
    metric: 'Top 10',
    title: 'Ranked PMS schemes',
    description: 'Top 10 ranked PMS schemes in 3-yr and 5-yr timeframes by PMS Bazaar.*',
    redirect: '/performance',
    cta: 'Learn more',
    Illustration: IllustrationAward,
    surface: 'bg-ink-50 border-ink-100',
    medallion: 'bg-white/75',
    metricClass: 'text-ink-700',
    strokeClass: 'text-ink-600',
    titleClass: 'text-ink-900',
    descClass: 'text-ink-700/75',
    ctaClass: 'text-ink-700 hover:text-accent-600',
  },
  {
    id: 'alpha',
    metric: '24%*',
    title: 'Annualized return',
    description: 'Delivered ~24% annualized return across our strategies.',
    redirect: '/performance',
    cta: 'Learn more',
    Illustration: IllustrationChart,
    surface: 'bg-ink-900 border-ink-800',
    medallion: 'bg-white/5 border border-white/10',
    metricClass: 'text-accent-400',
    strokeClass: 'text-ink-100',
    titleClass: 'text-white',
    descClass: 'text-ink-100/75',
    ctaClass: 'text-accent-400 hover:text-accent-500',
  },
  {
    id: 'research',
    metric: 'SCALE',
    title: 'The SCALE framework',
    description:
      'Structural growth, capital cycle, competitive advantage, leadership and entry valuation form the foundation of every investment decision.',
    redirect: '/contact',
    cta: 'Discuss Our Process',
    Illustration: IllustrationResearch,
    surface: 'bg-accent-50 border-accent-100',
    medallion: 'bg-white/70',
    metricClass: 'text-accent-600',
    strokeClass: 'text-accent-600',
    titleClass: 'text-ink-900',
    descClass: 'text-ink-700/75',
    ctaClass: 'text-ink-700 hover:text-accent-600',
  },
];

/* ------------------------------------------------------------------ */
/* Section                                                            */
/* ------------------------------------------------------------------ */

export const WhyAcePmsSection = () => {
  const [openCard, setOpenCard] = useState(0);
  const reduce = useReducedMotion();

  const spring = reduce
    ? { duration: 0 }
    : { type: 'spring' as const, stiffness: 240, damping: 29 };

  return (
    <section className="py-24 bg-white border-b border-slate-100 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <span className="text-[10px] font-bold text-accent-600 tracking-widest uppercase block font-mono">
            THE ACE PMS EDGE
          </span>
          <h2 className="font-extrabold tracking-tight text-slate-900 text-3xl sm:text-4xl">
            Four proof points behind the process
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm font-light leading-relaxed">
            Hover, focus or tap a card to explore what a decade of disciplined, research-first
            investing has delivered.
          </p>
        </div>

        {/* Expanding cards */}
        <div className="flex flex-col lg:flex-row gap-3 lg:h-[360px]">
          {impactCards.map((card, i) => {
            const isOpen = openCard === i;
            return (
              <motion.div
                key={card.id}
                role="button"
                tabIndex={0}
                aria-expanded={isOpen}
                aria-label={`${card.metric} — ${card.title}`}
                onMouseEnter={() => setOpenCard(i)}
                onFocus={() => setOpenCard(i)}
                onClick={() => setOpenCard(i)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setOpenCard(i);
                  }
                }}
                animate={{ flexGrow: isOpen ? 2.4 : 1 }}
                transition={spring}
                className={`relative overflow-hidden rounded-2xl border cursor-pointer flex flex-col min-h-[280px] lg:min-h-0 lg:basis-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 transition-shadow ${
                  card.surface
                } ${isOpen ? 'shadow-lg' : 'shadow-sm hover:shadow-md'}`}
              >
                {/* Picture place — illustration medallion fills the visual zone */}
                <div className="flex-1 flex items-center justify-center px-6 pt-8 pb-2">
                  <div
                    className={`rounded-full flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28 shrink-0 ${card.medallion}`}
                  >
                    <card.Illustration className={`w-12 h-12 sm:w-14 sm:h-14 ${card.strokeClass}`} />
                  </div>
                </div>

                {/* Label block — anchored at the bottom */}
                <div className="px-6 sm:px-7 pb-6 sm:pb-7">
                  <div
                    className={`text-2xl sm:text-3xl font-extrabold tracking-tight leading-none ${card.metricClass}`}
                  >
                    {card.metric}
                  </div>
                  <h3 className={`font-bold text-sm mt-2 leading-snug ${card.titleClass}`}>
                    {card.title}
                  </h3>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={reduce ? false : { opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={reduce ? undefined : { opacity: 0, height: 0 }}
                        transition={reduce ? { duration: 0 } : { duration: 0.3, ease: 'easeOut' }}
                        className="overflow-hidden"
                      >
                        <p className={`text-xs font-light leading-relaxed mt-2.5 ${card.descClass}`}>
                          {card.description}
                        </p>
                        <Link
                          to={card.redirect}
                          onClick={(e) => e.stopPropagation()}
                          className={`inline-flex items-center gap-1.5 mt-3.5 text-[11px] font-bold uppercase tracking-wider transition focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 rounded ${card.ctaClass}`}
                        >
                          {card.cta} <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Closing pill CTA */}
        <div className="mt-8">
          <Link
            to="/performance"
            className="group flex flex-col sm:flex-row items-center justify-between gap-4 bg-ink-900 rounded-2xl px-6 sm:px-10 py-6 text-center sm:text-left hover:bg-ink-800 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2"
          >
            <span className="text-white font-extrabold text-base sm:text-lg tracking-tight">
              See what disciplined investing compounds into — explore our performance.
            </span>
            <span className="shrink-0 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent-400">
              View Performance{' '}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </Link>
        </div>

      </div>
    </section>
  );
};
