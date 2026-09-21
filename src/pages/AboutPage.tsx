import { useEffect, useRef, type FC } from 'react';
import { Link } from 'react-router-dom';
import { useReducedMotion } from 'framer-motion';
import {
  Users,
  Building2,
  MapPin,
  ArrowRight,
  PieChart,
  Landmark,
  TrendingUp,
  Briefcase,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { ABOUT } from '../data/content';
import { TeamSection } from '../components/TeamSection';
import { CountUp, useInView } from '../components/motion';
import { PageHero } from '../components/shared';

// Renders *phrase* segments as emphasised (bold) inline text.
const withEmphasis = (text: string) =>
  text.split(/(\*[^*]+\*)/g).map((seg, i) =>
    seg.startsWith('*') && seg.endsWith('*') ? (
      <strong key={i} className="font-semibold text-slate-900">
        {seg.slice(1, -1)}
      </strong>
    ) : (
      <span key={i}>{seg}</span>
    ),
  );

const STAT_ICONS: Record<string, FC<{ className?: string }>> = { Users, Building2, MapPin };

const SERVICE_ICONS: Record<string, FC<{ className?: string }>> = {
  'Portfolio Management': PieChart,
  'Institutional Equities': Landmark,
  'Stock Broking': TrendingUp,
  'Asset Management': Briefcase,
  'Wealth Management': Users,
  'Investment Banking': Building2,
};

/* ---------------- 7.3 Group structure — one conglomerate, four platforms ---------------- */
const GroupStructure: FC = () => {
  const gs = ABOUT.groupStructure;
  return (
    <section id="group-structure" className="py-20 bg-white border-b border-slate-100 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Heading + tagline */}
          <div className="lg:col-span-4">
            <span className="text-[10px] font-bold text-accent-600 tracking-widest uppercase block font-mono mb-4">
              {gs.eyebrow}
            </span>
            <h2 className="font-extrabold tracking-tight text-slate-900 text-3xl sm:text-4xl leading-tight">
              {gs.title}
            </h2>
            <div className="mt-6 space-y-1">
              {gs.tagline.map((t) => (
                <p key={t} className="text-sm text-slate-500 font-light leading-relaxed">
                  {t}
                </p>
              ))}
            </div>
            <div className="mt-6 w-12 h-0.5 bg-accent-500" aria-hidden="true" />
          </div>

          {/* Entity cards */}
          <div className="lg:col-span-8 grid sm:grid-cols-2 gap-4">
            {gs.entities.map((e) => (
              <div
                key={e.name}
                className={`rounded-2xl bg-white p-5 flex flex-col transition-shadow hover:shadow-md ${
                  e.primary
                    ? 'border border-slate-200 border-l-4 border-l-accent-500 shadow-sm'
                    : 'border border-slate-200/80'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="h-16 flex items-center rounded-lg bg-white ring-1 ring-slate-200/70 shadow-sm px-4">
                    <img
                      src={encodeURI(e.logo)}
                      alt={e.name}
                      className="max-h-12 max-w-[190px] w-auto object-contain"
                      loading="lazy"
                    />
                  </div>
                  {e.badge && (
                    <span className="text-[9px] font-bold uppercase tracking-wider text-accent-700 bg-accent-50 border border-accent-100 px-2 py-0.5 rounded shrink-0">
                      {e.badge}
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-sm text-slate-900 mt-3.5 leading-snug">{e.name}</h3>
                <p className="text-xs text-slate-500 font-light leading-relaxed mt-1.5">{e.short}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

/* ---------------- 7.4 Group service lines + scale ---------------- */
const GroupScale: FC = () => {
  const { ref, inView } = useInView<HTMLDivElement>();
  const scroller = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  const scrollByDir = (d: number) => scroller.current?.scrollBy({ left: d * 240, behavior: 'smooth' });

  // Continuous auto-scroll; the track is duplicated so it loops seamlessly.
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const id = window.setInterval(() => {
      if (pausedRef.current) return;
      el.scrollLeft += 0.6;
      const half = el.scrollWidth / 2;
      if (half > 0 && el.scrollLeft >= half) el.scrollLeft -= half;
    }, 16);
    return () => window.clearInterval(id);
  }, []);

  return (
    <section
      id="group-scale"
      className="relative py-20 bg-[#FAFAFA] border-b border-slate-200/60 font-sans overflow-hidden"
    >
      {/* Subtle full-width skyline backdrop */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <img
          src="/skyline-strip.png"
          alt=""
          className="w-full h-full object-cover object-center opacity-[0.14]"
        />
        {/* vertical wash keeps content legible and blends the edges */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#FAFAFA] via-[#FAFAFA]/55 to-[#FAFAFA]" />
      </div>

      <div className="relative z-10">
        {/* Service lines — full-width carousel with arrows near the screen edges */}
        <span className="text-[10px] font-bold text-accent-600 tracking-widest uppercase block font-mono mb-8 text-center px-4">
          Group Service Lines
        </span>
        <div className="relative">
          <button
            type="button"
            onClick={() => scrollByDir(-1)}
            aria-label="Previous service lines"
            className="hidden sm:grid absolute left-3 lg:left-10 top-1/2 -translate-y-1/2 z-20 h-11 w-11 rounded-full bg-white border border-slate-200 shadow-lg place-items-center text-ink-700 hover:text-accent-600 hover:border-accent-300 transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div
            ref={scroller}
            onMouseEnter={() => (pausedRef.current = true)}
            onMouseLeave={() => (pausedRef.current = false)}
            onPointerDown={() => (pausedRef.current = true)}
            onPointerUp={() => (pausedRef.current = false)}
            className="flex gap-4 overflow-x-auto pb-2 max-w-6xl mx-auto px-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            {[...ABOUT.scale.serviceLines, ...ABOUT.scale.serviceLines].map((s, i) => {
              const Icon = SERVICE_ICONS[s] ?? Briefcase;
              return (
                <div
                  key={`${s}-${i}`}
                  className="shrink-0 w-44 sm:w-52 flex flex-col items-center gap-3 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="w-12 h-12 rounded-full grid place-items-center bg-accent-50 border border-accent-100 text-accent-600">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[12px] font-semibold text-slate-700 text-center leading-tight">
                    {s}
                  </span>
                </div>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => scrollByDir(1)}
            aria-label="Next service lines"
            className="hidden sm:grid absolute right-3 lg:right-10 top-1/2 -translate-y-1/2 z-20 h-11 w-11 rounded-full bg-white border border-slate-200 shadow-lg place-items-center text-ink-700 hover:text-accent-600 hover:border-accent-300 transition"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Scale stats + footnote */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-14">
          <div
            ref={ref}
            className="max-w-4xl mx-auto bg-white rounded-2xl border border-slate-200/80 shadow-sm grid grid-cols-3 divide-x divide-slate-100"
          >
          {ABOUT.scale.stats.map((stat) => {
            const Icon = STAT_ICONS[stat.icon] ?? Users;
            return (
              <div
                key={stat.label}
                className="p-3 sm:p-6 flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left justify-center sm:justify-start"
              >
                <div className="h-9 w-9 sm:h-11 sm:w-11 bg-ink-50 rounded-xl flex items-center justify-center border border-ink-100 shrink-0">
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-ink-700" />
                </div>
                <div>
                  <div className="text-lg sm:text-3xl font-extrabold text-ink-800 tracking-tight tabular-nums leading-none">
                    <CountUp value={stat.value} active={inView} suffix={stat.suffix} />
                  </div>
                  <div className="text-[9px] sm:text-[10px] text-slate-500 font-mono uppercase tracking-wide mt-1">
                    {stat.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

          {ABOUT.scale.footnote && (
            <p className="text-center text-[10px] text-slate-400 italic mt-8">{ABOUT.scale.footnote}</p>
          )}
        </div>
      </div>
    </section>
  );
};

/* ---------------- 7.5 Leadership — medallion card ---------------- */
const Leadership: FC = () => {
  const { ref, inView } = useInView<HTMLDivElement>(0.3);
  const reduce = useReducedMotion();
  const revealed = reduce || inView;
  const L = ABOUT.leadership;

  return (
    <section id="leadership" className="py-20 bg-white border-b border-slate-100 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-extrabold tracking-tight text-slate-900 text-3xl sm:text-4xl mb-12">
          {L.title}
        </h2>

        <div className="bg-slate-50 rounded-3xl border border-slate-200/70 p-7 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Photograph — circular medallion */}
          <div className="lg:col-span-4 flex justify-center lg:pt-1">
            <div className="relative w-52 h-52 sm:w-64 sm:h-64 rounded-full overflow-hidden ring-1 ring-slate-200 shadow-sm bg-gradient-to-br from-ink-50 via-white to-accent-50">
              <img
                src={encodeURI(L.photo)}
                alt={`${L.name}, ${L.role}`}
                className="absolute inset-0 w-full h-full object-cover object-top"
                loading="lazy"
              />
            </div>
          </div>

          {/* Narrative */}
          <div className="lg:col-span-8 space-y-5">
            <div>
              <h3 className="text-2xl sm:text-3xl font-normal tracking-tight text-accent-600">
                {L.name}
              </h3>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest font-mono mt-1.5">
                {L.role}
              </p>
            </div>

            <div className="text-slate-600 text-sm sm:text-base font-light leading-relaxed max-w-2xl space-y-4">
              {L.bio.map((para, i) => (
                <p key={i}>{withEmphasis(para)}</p>
              ))}
            </div>

            {/* Career timeline */}
            <div ref={ref} className="pt-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono block mb-5">
                Career milestones
              </span>
              <div className="relative">
                <div
                  className="absolute left-0 top-[7px] h-0.5 bg-accent-500/70 origin-left transition-transform duration-1000 ease-out"
                  style={{ right: 0, transform: revealed ? 'scaleX(1)' : 'scaleX(0)' }}
                  aria-hidden="true"
                />
                <ol className="relative flex justify-between gap-2">
                  {L.timeline.map((step, i) => (
                    <li
                      key={step}
                      className="flex flex-col items-center text-center flex-1 transition-opacity duration-500"
                      style={{
                        opacity: revealed ? 1 : 0,
                        transitionDelay: revealed ? `${i * 120}ms` : '0ms',
                      }}
                    >
                      <span
                        className={`w-3.5 h-3.5 rounded-full ring-4 ring-slate-50 shrink-0 ${
                          i === L.timeline.length - 1 ? 'bg-accent-500' : 'bg-ink-400'
                        }`}
                      />
                      <span className="text-[10px] sm:text-[11px] font-semibold text-slate-700 mt-2.5 leading-tight">
                        {step}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {L.closingLine && (
              <p className="text-xs text-slate-500 font-light italic border-t border-slate-200 pt-5 mt-2">
                {L.closingLine}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

/* ---------------- Page ---------------- */
export default function AboutPage() {
  return (
    <>
      {/* 7.2 Hero — shared style, consistent with other pages */}
      <PageHero
        eyebrow="A Pantomath Group Company"
        title={
          <>
            Asit C. Mehta{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-ink-700 to-accent-600">
              Investment Interrmediates Ltd.
            </span>
          </>
        }
        lead={ABOUT.hero.sub}
      />

      <GroupStructure />
      <TeamSection />
      <GroupScale />

      {/* 7.6 Closing CTA band */}
      <section className="py-16 bg-[#FAFAFA] font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-ink-900 rounded-3xl px-6 sm:px-12 py-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>
            <div className="relative z-10 space-y-6">
              <h2 className="font-extrabold tracking-tight text-white text-2xl sm:text-3xl max-w-2xl mx-auto">
                {ABOUT.cta.title}
              </h2>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link
                  to="/why-ace-pms"
                  className="px-6 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider text-ink-900 bg-white hover:bg-slate-100 transition inline-flex items-center justify-center gap-2"
                >
                  Why ACE PMS
                </Link>
                <Link
                  to="/contact"
                  className="px-6 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-accent-500 hover:bg-accent-600 transition inline-flex items-center justify-center gap-2"
                >
                  Schedule a Conversation <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
