import type { FC } from 'react';
import { Landmark, Factory, ShoppingCart, Cpu, Leaf, Plane } from 'lucide-react';
import { HERO_THEMES } from '../data/content';

const THEME_ICONS: Record<string, FC<{ className?: string; strokeWidth?: number }>> = {
  Landmark,
  Factory,
  ShoppingCart,
  Cpu,
  Leaf,
  Plane,
};

export const StructuralThemesSection: FC = () => (
  <section className="py-16 border-b border-slate-100 font-sans bg-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Eyebrow with rule flanks */}
      <div className="flex items-center justify-center gap-3 mb-3">
        <span className="h-px w-8 bg-accent-400/60" />
        <span className="text-[10px] font-bold text-accent-600 tracking-widest uppercase font-mono">
          Structural Growth Themes
        </span>
        <span className="h-px w-8 bg-accent-400/60" />
      </div>

      <h2 className="text-center font-extrabold tracking-tight text-slate-900 text-2xl sm:text-3xl">
        The Engines of India's Structural Transformation
      </h2>
      <p className="text-center text-slate-500 text-xs sm:text-sm font-light max-w-2xl mx-auto mt-3 leading-relaxed">
        We invest in businesses positioned to benefit from the powerful forces reshaping India's
        economy on the road to <span className="text-accent-600 font-semibold">$10 trillion</span>.
      </p>

      {/* Theme cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mt-10">
        {HERO_THEMES.map((t) => {
          const Icon = THEME_ICONS[t.icon] ?? Landmark;
          return (
            <div
              key={t.label}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 p-4 flex flex-col items-center text-center gap-2.5"
            >
              <Icon className="w-7 h-7 text-accent-500" strokeWidth={1.7} />
              <span className="text-[13px] font-bold text-ink-900 leading-tight">{t.label}</span>
              <span className="h-0.5 w-5 bg-accent-500 rounded-full" />
            </div>
          );
        })}
      </div>
    </div>
  </section>
);
