import type { FC } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { HERO } from '../data/content';

// Clean, text-free cityscape render (16:9).
const CITYSCAPE_SRC = '/new-updated-image.png';

const Headline: FC = () => (
  <h1 className="font-extrabold tracking-tight text-4xl sm:text-5xl lg:text-[52px] leading-[1.08] text-slate-950">
    {HERO.headlineLead}
    <span className="text-accent-600">{HERO.headlineAccent}</span>
    {HERO.headlineTail}
  </h1>
);

const Subheadline: FC = () => (
  <p className="text-slate-600 text-sm sm:text-base font-light max-w-lg leading-relaxed">
    {HERO.subheadline}
  </p>
);

const Ctas: FC = () => (
  <div className="flex flex-col sm:flex-row gap-3.5">
    <Link
      to="/strategies"
      className="px-6 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-ink-900 shadow-xl hover:bg-ink-800 hover:shadow-2xl transition-all duration-300 text-center inline-flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2"
    >
      <span>{HERO.primaryCta}</span>
      <ArrowRight className="w-4 h-4 text-accent-500" />
    </Link>
    <Link
      to="/contact"
      className="px-6 py-3.5 rounded-xl text-xs font-semibold bg-white text-slate-800 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition duration-200 text-center inline-flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2"
    >
      {HERO.secondaryCta}
    </Link>
  </div>
);

const HeroContent: FC = () => (
  <div className="max-w-xl">
    <Headline />
    <div className="mt-6">
      <Subheadline />
    </div>
    <div className="mt-8">
      <Ctas />
    </div>
  </div>
);

export const HomeHero: FC = () => (
  <section className="relative overflow-hidden border-b border-slate-100 bg-[#FAFAFA] font-sans">
    {/* Desktop — the cityscape is a real image (height follows width) capped at a
        max width and centred, so it fills the screen at normal desktop sizes but
        shrinks (rather than staying full-bleed) once the viewport grows past the
        cap — e.g. on ultra-wide screens or when the browser is zoomed out. A left
        scrim keeps the overlaid text legible. */}
    <div className="relative hidden md:block max-w-[1920px] mx-auto">
      <img
        src={CITYSCAPE_SRC}
        alt=""
        className="block w-full h-auto select-none"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-gradient-to-r from-[#FAFAFA] from-15% via-[#FAFAFA]/85 via-45% to-transparent"
        aria-hidden="true"
      />
      <div className="absolute inset-0 z-10 flex items-center">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <HeroContent />
        </div>
      </div>
    </div>

    {/* Mobile — headline, then image, then the subline, then the CTAs */}
    <div className="md:hidden">
      <div className="px-4 sm:px-6 pt-14">
        <Headline />
      </div>
      <img
        src={CITYSCAPE_SRC}
        alt="India's structural growth — skyline, infrastructure, manufacturing and ports rising toward a $10 trillion economy"
        className="w-full mt-8"
        loading="eager"
      />
      <div className="px-4 sm:px-6 mt-8">
        <Subheadline />
      </div>
      <div className="px-4 sm:px-6 mt-8 pb-14">
        <Ctas />
      </div>
    </div>
  </section>
);
