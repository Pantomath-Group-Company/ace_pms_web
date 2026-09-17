import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, ChevronDown, Sparkles } from 'lucide-react';
import {
  CREDIBILITY_BAR,
  PMS_EXPLAINER,
  GETTING_STARTED,
  FAQS,
} from '../data/content';
import { INSIGHTS, fmtInsightDate } from '../content/insights';
import { HomeHero } from '../components/HomeHero';
import { StructuralThemesSection } from '../components/StructuralThemes';
import { ScaleFramework } from '../components/ScaleFramework';
import { SchedulerCta } from '../components/SchedulerCta';
import { StrategyShowcase } from '../components/StrategyShowcase';
import { GrowthShowcase } from '../components/GrowthShowcase';
import { SectionHeading } from '../components/shared';

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const latestInsights = INSIGHTS.slice(0, 3);

  return (
    <>
      {/* ============ HERO — $10 Trillion structural-growth rebuild ============ */}
      <HomeHero />

      {/* ============ Structural Growth Themes (standalone) ============ */}
      <StructuralThemesSection />

      {/* ============ Credibility metrics strip ============ */}
      <section className="bg-white border-b border-slate-200/80 py-10 font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {CREDIBILITY_BAR.map((item) => (
              <div key={item.label} className="space-y-1 p-2">
                <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase block font-bold">
                  {item.label}
                </span>
                <div className="flex items-baseline gap-0.5">
                  <span className="text-xl sm:text-2xl font-extrabold text-slate-950 tracking-tight">
                    {item.value}
                  </span>
                  {item.suffix && (
                    <span className="text-sm sm:text-base font-bold text-slate-950">
                      {item.suffix}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 leading-normal font-light">{item.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link
              to="/about"
              className="text-xs font-bold text-ink-700 inline-flex items-center gap-1.5 border-b-2 border-accent-500 pb-0.5 hover:text-accent-600 transition"
            >
              Read our story <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ============ Growth of ₹1 crore — right after the 'Read our story' CTA ============ */}
      <GrowthShowcase />

      {/* ============ Philosophy — the ACE SCALE brain orbit ============ */}
      <ScaleFramework orbitOnly />

      {/* ============ Strategies ============ */}
      <section className="pt-10 pb-20 bg-[#FAFAFA] border-b border-slate-200/60 font-sans">
        <StrategyShowcase
          compact
          eyebrow="OUR STRATEGIES"
          title="3 Purpose-built Strategies, One Kitchen"
          lead="Select a mandate for a snapshot of its construction, key facts and track record."
        />
      </section>

      {/* ============ Understanding PMS ============ */}
      <section className="py-20 bg-white border-b border-slate-100 font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="NEW TO PMS?"
            title={PMS_EXPLAINER.title}
            lead={PMS_EXPLAINER.body}
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PMS_EXPLAINER.tiles.map((tile) => (
              <div key={tile.title} className="border-l-2 border-accent-500 pl-5 py-1">
                <h4 className="font-extrabold text-lg text-slate-900">{tile.title}</h4>
                <p className="text-xs text-slate-500 font-light mt-1">{tile.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ Getting started — connected journey stepper ============ */}
      <section className="py-20 bg-[#FAFAFA] border-b border-slate-200/60 font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="GETTING STARTED"
            title={GETTING_STARTED.title}
            lead="From first conversation to a fully managed portfolio — four steps, no friction."
            center
          />

          {/* Connected stepper */}
          <div className="relative">
            {/* Connecting line (desktop) */}
            <div className="hidden lg:block absolute top-6 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-ink-200 via-accent-400 to-ink-200"></div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
              {GETTING_STARTED.steps.map((step, idx) => (
                <div key={step.title} className="relative flex flex-col items-center text-center group">
                  <div
                    className={`h-12 w-12 rounded-full grid place-items-center font-mono text-sm font-bold shrink-0 z-10 ring-8 ring-[#FAFAFA] transition-transform duration-200 group-hover:scale-110 ${
                      idx === 0
                        ? 'bg-accent-500 text-white shadow-lg shadow-accent-500/30'
                        : 'bg-ink-900 text-white shadow-md'
                    }`}
                  >
                    0{idx + 1}
                  </div>
                  <h4 className="font-extrabold text-base text-slate-900 mt-4">{step.title}</h4>
                  <p className="text-xs text-slate-500 font-light leading-relaxed mt-1.5 max-w-[220px]">
                    {step.body}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Key facts band */}
          <div className="mt-14 bg-ink-900 rounded-2xl overflow-hidden relative">
            <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>
            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 lg:divide-x divide-ink-800">
              {GETTING_STARTED.facts.map((fact) => (
                <div key={fact.k} className="p-6 space-y-1.5">
                  <span className="text-[10px] text-accent-400 font-mono tracking-widest uppercase block font-bold">
                    {fact.k}
                  </span>
                  <span className="text-sm font-bold text-white leading-snug block">{fact.v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ Insights teaser ============ */}
      <section className="py-20 bg-white border-b border-slate-100 font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="INSIGHTS & MEDIA"
            title="Perspectives from our desk"
            center
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {latestInsights.map((item) => (
              <Link
                key={item.slug}
                to={`/insights/${item.slug}`}
                className="bg-slate-50 rounded-2xl border border-slate-200/80 p-6 flex flex-col justify-between hover:shadow-md hover:border-slate-300 transition group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-accent-700 font-bold uppercase bg-accent-50 border border-accent-100 px-2 py-0.5 rounded">
                      {item.category}
                    </span>
                    <span className="text-slate-400">{fmtInsightDate(item.date)}</span>
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-lg leading-snug min-h-[52px] group-hover:text-ink-700 transition">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-light">{item.excerpt}</p>
                </div>
                <div className="pt-5 border-t border-slate-200 mt-5 flex items-center justify-between">
                  <span className="text-xs font-bold text-ink-700 inline-flex items-center gap-1 group-hover:text-accent-600 transition">
                    Read more <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                  {item.readTime && (
                    <span className="text-[10px] text-slate-400 font-mono bg-white px-2 py-1 rounded border border-slate-100">
                      {item.readTime}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              to="/insights"
              className="px-6 py-3 rounded-xl text-xs font-semibold bg-white text-slate-800 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition duration-200 inline-flex items-center gap-1.5 shadow-sm"
            >
              Read all insights <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section className="py-20 bg-[#FAFAFA] border-b border-slate-200/60 font-sans">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="FAQ" title="Questions Investors ask?" center />
          <div className="space-y-3">
            {FAQS.map((faq, idx) => (
              <div
                key={faq.q}
                className="bg-white rounded-xl border border-slate-200/80 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex justify-between items-center gap-4 p-4.5 text-left focus:outline-none px-5 py-4"
                >
                  <span className="font-extrabold text-sm sm:text-base text-slate-900">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-accent-600 shrink-0 transition-transform ${
                      openFaq === idx ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-slate-500 font-light leading-relaxed animate-fadeIn">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ Closing CTA — interactive scheduler ============ */}
      <section className="py-20 bg-ink-900/5 border-b border-slate-100 font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-[11px] font-bold text-accent-600 tracking-wide block font-mono">
              <Sparkles className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />
              Ready to build a portfolio with an edge,
            </span>
            <h2 className="font-extrabold tracking-tight text-slate-900 text-3xl sm:text-4xl">
              Speak to a portfolio specialist
            </h2>
          </div>
          <SchedulerCta />
        </div>
      </section>

      {/* Trust note */}
      <section className="py-8 bg-white font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>
              SEBI-registered PMS · Minimum investment ₹50 lakh · No lock-in
            </span>
          </div>
        </div>
      </section>
    </>
  );
}
