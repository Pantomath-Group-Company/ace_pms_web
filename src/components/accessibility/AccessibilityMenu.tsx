import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FC,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import {
  Accessibility,
  X,
  RotateCcw,
  ChevronDown,
  Minus,
  Plus,
  Type,
  Palette,
  UserRound,
  Paintbrush,
  Compass,
} from 'lucide-react';
import './accessibility.css';

/* ------------------------------------------------------------------ */
/* Settings model                                                     */
/* ------------------------------------------------------------------ */

type Contrast = 'none' | 'invert' | 'dark' | 'high';
type Saturation = 'none' | 'high' | 'low' | 'mono';
type Align = 'none' | 'left' | 'center' | 'right';

interface Settings {
  fontScale: number; // 0..4
  readableFont: boolean;
  dyslexiaFont: boolean;
  letterSpacing: number; // 0..3
  lineHeight: number; // 0..3
  textAlign: Align;
  highlightLinks: boolean;
  highlightTitles: boolean;
  contrast: Contrast;
  saturation: Saturation;
  textColor: string | null;
  titleColor: string | null;
  bgColor: string | null;
  bigCursor: boolean;
  stopAnimations: boolean;
  hideImages: boolean;
  highlightFocus: boolean;
  readingGuide: boolean;
  readingMask: boolean;
}

const DEFAULT: Settings = {
  fontScale: 0,
  readableFont: false,
  dyslexiaFont: false,
  letterSpacing: 0,
  lineHeight: 0,
  textAlign: 'none',
  highlightLinks: false,
  highlightTitles: false,
  contrast: 'none',
  saturation: 'none',
  textColor: null,
  titleColor: null,
  bgColor: null,
  bigCursor: false,
  stopAnimations: false,
  hideImages: false,
  highlightFocus: false,
  readingGuide: false,
  readingMask: false,
};

const STORAGE_KEY = 'acepms_a11y';
const FONT_SCALES = [100, 110, 120, 130, 145];

function load(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULT, ...(JSON.parse(raw) as Partial<Settings>) } : DEFAULT;
  } catch {
    return DEFAULT;
  }
}

function applySettings(s: Settings) {
  const html = document.documentElement;
  const root = document.getElementById('root');

  html.style.fontSize = s.fontScale ? `${FONT_SCALES[s.fontScale]}%` : '';

  const cls = (name: string, on: boolean) => html.classList.toggle(name, on);
  cls('a11y-readable-font', s.readableFont && !s.dyslexiaFont);
  cls('a11y-dyslexia', s.dyslexiaFont);
  cls('a11y-highlight-links', s.highlightLinks);
  cls('a11y-highlight-titles', s.highlightTitles);
  cls('a11y-big-cursor', s.bigCursor);
  cls('a11y-stop-animations', s.stopAnimations);
  cls('a11y-hide-images', s.hideImages);
  cls('a11y-highlight-focus', s.highlightFocus);

  const attr = (name: string, val: string | null) =>
    val ? html.setAttribute(name, val) : html.removeAttribute(name);
  attr('data-a11y-spacing', s.letterSpacing ? String(s.letterSpacing) : null);
  attr('data-a11y-lineheight', s.lineHeight ? String(s.lineHeight) : null);
  attr('data-a11y-align', s.textAlign === 'none' ? null : s.textAlign);

  const colour = (name: string, cssVar: string, val: string | null) => {
    if (val) {
      html.style.setProperty(cssVar, val);
      html.setAttribute(name, '');
    } else {
      html.style.removeProperty(cssVar);
      html.removeAttribute(name);
    }
  };
  colour('data-a11y-textcolor', '--a11y-textcolor', s.textColor);
  colour('data-a11y-titlecolor', '--a11y-titlecolor', s.titleColor);
  colour('data-a11y-bgcolor', '--a11y-bgcolor', s.bgColor);

  if (root) {
    const parts: string[] = [];
    if (s.contrast === 'invert') parts.push('invert(1)');
    else if (s.contrast === 'dark') parts.push('invert(1)', 'hue-rotate(180deg)');
    else if (s.contrast === 'high') parts.push('contrast(1.4)');
    if (s.saturation === 'high') parts.push('saturate(2)');
    else if (s.saturation === 'low') parts.push('saturate(0.45)');
    else if (s.saturation === 'mono') parts.push('grayscale(1)');
    root.style.filter = parts.join(' ');
    root.classList.toggle('a11y-mediafix-invert', s.contrast === 'invert');
    root.classList.toggle('a11y-mediafix-dark', s.contrast === 'dark');
  }
}

/* ------------------------------------------------------------------ */
/* Profiles — bundles of settings                                     */
/* ------------------------------------------------------------------ */

const PROFILES: { id: string; label: string; desc: string; patch: Partial<Settings> }[] = [
  {
    id: 'vision',
    label: 'Vision impaired',
    desc: 'Bigger, high-contrast, readable text',
    patch: { fontScale: 2, contrast: 'high', readableFont: true, lineHeight: 1 },
  },
  {
    id: 'seizure',
    label: 'Seizure safe',
    desc: 'Stops motion and dampens colour',
    patch: { stopAnimations: true, saturation: 'low' },
  },
  {
    id: 'adhd',
    label: 'ADHD friendly',
    desc: 'Reading mask to reduce distraction',
    patch: { readingMask: true, saturation: 'low', highlightLinks: true },
  },
  {
    id: 'dyslexia',
    label: 'Dyslexia friendly',
    desc: 'Dyslexia font with extra spacing',
    patch: { dyslexiaFont: true, letterSpacing: 1, lineHeight: 2 },
  },
  {
    id: 'keyboard',
    label: 'Keyboard navigation',
    desc: 'Clear focus outlines on every element',
    patch: { highlightFocus: true, bigCursor: true },
  },
];

/* ------------------------------------------------------------------ */
/* Reusable UI bits                                                   */
/* ------------------------------------------------------------------ */

const Section: FC<{
  icon: FC<{ className?: string }>;
  label: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}> = ({ icon: Icon, label, open, onToggle, children }) => (
  <div className="border-b border-slate-100">
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left hover:bg-slate-50 transition"
    >
      <span className="flex items-center gap-2.5 text-sm font-bold text-slate-900">
        <Icon className="w-4 h-4 text-accent-600" /> {label}
      </span>
      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
    </button>
    {open && <div className="px-4 pb-4 space-y-3">{children}</div>}
  </div>
);

const Toggle: FC<{ label: string; on: boolean; onClick: () => void }> = ({ label, on, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={on}
    className={`w-full flex items-center justify-between gap-3 rounded-xl border px-3.5 py-2.5 text-xs font-semibold transition ${
      on
        ? 'border-accent-300 bg-accent-50 text-accent-700'
        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
    }`}
  >
    <span>{label}</span>
    <span
      className={`relative h-4 w-7 shrink-0 rounded-full transition ${on ? 'bg-accent-500' : 'bg-slate-300'}`}
    >
      <span
        className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition-all ${on ? 'left-3.5' : 'left-0.5'}`}
      />
    </span>
  </button>
);

const Stepper: FC<{ label: string; value: number; max: number; onChange: (v: number) => void }> = ({
  label,
  value,
  max,
  onChange,
}) => (
  <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3.5 py-2">
    <span className="text-xs font-semibold text-slate-700">{label}</span>
    <div className="flex items-center gap-2">
      <button
        type="button"
        aria-label={`Decrease ${label}`}
        onClick={() => onChange(Math.max(0, value - 1))}
        className="h-6 w-6 grid place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
        disabled={value === 0}
      >
        <Minus className="w-3.5 h-3.5" />
      </button>
      <span className="w-5 text-center text-xs font-bold text-slate-900 tabular-nums">{value}</span>
      <button
        type="button"
        aria-label={`Increase ${label}`}
        onClick={() => onChange(Math.min(max, value + 1))}
        className="h-6 w-6 grid place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
        disabled={value === max}
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  </div>
);

function OptionGroup<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { v: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {options.map((o) => (
        <button
          key={o.v}
          type="button"
          onClick={() => onChange(value === o.v ? (options[0].v as T) : o.v)}
          aria-pressed={value === o.v}
          className={`rounded-xl border px-3 py-2 text-xs font-semibold transition ${
            value === o.v
              ? 'border-accent-300 bg-accent-50 text-accent-700'
              : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

const ColourRow: FC<{ label: string; value: string | null; onChange: (v: string | null) => void }> = ({
  label,
  value,
  onChange,
}) => (
  <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3.5 py-2">
    <span className="text-xs font-semibold text-slate-700">{label}</span>
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={value ?? '#000000'}
        onChange={(e) => onChange(e.target.value)}
        className="h-7 w-10 rounded cursor-pointer border border-slate-200 bg-white"
        aria-label={label}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange(null)}
          className="text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-accent-600"
        >
          Clear
        </button>
      )}
    </div>
  </div>
);

/* ------------------------------------------------------------------ */
/* Reading guide + mask overlays (portaled, never filtered)           */
/* ------------------------------------------------------------------ */

const ReadingAids: FC<{ guide: boolean; mask: boolean }> = ({ guide, mask }) => {
  const [y, setY] = useState(-100);
  useEffect(() => {
    if (!guide && !mask) return;
    const onMove = (e: MouseEvent) => setY(e.clientY);
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [guide, mask]);

  if (!guide && !mask) return null;
  const band = 120;
  return createPortal(
    <div className="fixed inset-0 z-[2147483000] pointer-events-none" aria-hidden="true">
      {mask && (
        <>
          <div className="absolute inset-x-0 top-0 bg-black/60" style={{ height: Math.max(0, y - band / 2) }} />
          <div
            className="absolute inset-x-0 bottom-0 bg-black/60"
            style={{ top: y + band / 2 }}
          />
        </>
      )}
      {guide && (
        <div
          className="absolute inset-x-0 h-[4px] bg-accent-500 shadow-[0_0_6px_rgba(228,97,31,0.8)]"
          style={{ top: y - 2 }}
        />
      )}
    </div>,
    document.body,
  );
};

/* ------------------------------------------------------------------ */
/* Main widget                                                        */
/* ------------------------------------------------------------------ */

export const AccessibilityMenu: FC = () => {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<Settings>(load);
  const [section, setSection] = useState<string | null>('content');
  const panelRef = useRef<HTMLDivElement>(null);

  // Apply + persist whenever settings change.
  useEffect(() => {
    applySettings(settings);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      /* ignore */
    }
  }, [settings]);

  // Esc closes the panel.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const set = useCallback(
    <K extends keyof Settings>(k: K, v: Settings[K]) => setSettings((p) => ({ ...p, [k]: v })),
    [],
  );
  const toggle = useCallback((k: keyof Settings) => setSettings((p) => ({ ...p, [k]: !p[k] })), []);
  const applyProfile = useCallback((patch: Partial<Settings>) => setSettings((p) => ({ ...p, ...patch })), []);
  const reset = useCallback(() => setSettings(DEFAULT), []);

  const toggleSection = (id: string) => setSection((s) => (s === id ? null : id));

  const profileActive = (patch: Partial<Settings>) =>
    (Object.keys(patch) as (keyof Settings)[]).every((k) => settings[k] === patch[k]);

  return createPortal(
    <>
      <ReadingAids guide={settings.readingGuide} mask={settings.readingMask} />

      {/* Trigger */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open accessibility menu"
          className="fixed bottom-5 right-5 z-[2147483001] h-13 w-13 grid place-items-center rounded-full bg-ink-900 text-white shadow-2xl hover:bg-ink-800 ring-2 ring-white/20 transition p-3"
          style={{ height: 52, width: 52 }}
        >
          <Accessibility className="w-6 h-6" />
        </button>
      )}

      {/* Panel */}
      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Accessibility menu"
          className="fixed z-[2147483001] top-3 bottom-3 right-3 flex flex-col rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden"
          style={{ width: 360, maxWidth: 'calc(100vw - 1.5rem)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-2 px-4 py-3.5 bg-ink-900 text-white shrink-0">
            <span className="flex items-center gap-2 font-extrabold">
              <Accessibility className="w-5 h-5" /> Accessibility Menu
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={reset}
                title="Reset all"
                aria-label="Reset all accessibility settings"
                className="h-8 w-8 grid place-items-center rounded-lg bg-white/10 hover:bg-white/20 transition"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                title="Close"
                aria-label="Close accessibility menu"
                className="h-8 w-8 grid place-items-center rounded-lg bg-white/10 hover:bg-white/20 transition"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto">
            {/* Content */}
            <Section icon={Type} label="Content" open={section === 'content'} onToggle={() => toggleSection('content')}>
              <Stepper label="Bigger text" value={settings.fontScale} max={4} onChange={(v) => set('fontScale', v)} />
              <Stepper label="Letter spacing" value={settings.letterSpacing} max={3} onChange={(v) => set('letterSpacing', v)} />
              <Stepper label="Line height" value={settings.lineHeight} max={3} onChange={(v) => set('lineHeight', v)} />
              <Toggle label="Readable font" on={settings.readableFont} onClick={() => toggle('readableFont')} />
              <Toggle label="Dyslexia-friendly font" on={settings.dyslexiaFont} onClick={() => toggle('dyslexiaFont')} />
              <Toggle label="Highlight links" on={settings.highlightLinks} onClick={() => toggle('highlightLinks')} />
              <Toggle label="Highlight titles" on={settings.highlightTitles} onClick={() => toggle('highlightTitles')} />
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Text align</p>
                <OptionGroup<Align>
                  value={settings.textAlign}
                  onChange={(v) => set('textAlign', v)}
                  options={[
                    { v: 'none', label: 'Default' },
                    { v: 'left', label: 'Left' },
                    { v: 'center', label: 'Center' },
                    { v: 'right', label: 'Right' },
                  ]}
                />
              </div>
            </Section>

            {/* Colors */}
            <Section icon={Palette} label="Colors" open={section === 'colors'} onToggle={() => toggleSection('colors')}>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Contrast</p>
                <OptionGroup<Contrast>
                  value={settings.contrast}
                  onChange={(v) => set('contrast', v)}
                  options={[
                    { v: 'none', label: 'Default' },
                    { v: 'dark', label: 'Dark' },
                    { v: 'high', label: 'High contrast' },
                    { v: 'invert', label: 'Invert' },
                  ]}
                />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Saturation</p>
                <OptionGroup<Saturation>
                  value={settings.saturation}
                  onChange={(v) => set('saturation', v)}
                  options={[
                    { v: 'none', label: 'Default' },
                    { v: 'high', label: 'High' },
                    { v: 'low', label: 'Low' },
                    { v: 'mono', label: 'Monochrome' },
                  ]}
                />
              </div>
            </Section>

            {/* Profiles */}
            <Section icon={UserRound} label="Profiles" open={section === 'profiles'} onToggle={() => toggleSection('profiles')}>
              {PROFILES.map((p) => {
                const active = profileActive(p.patch);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => applyProfile(p.patch)}
                    aria-pressed={active}
                    className={`w-full text-left rounded-xl border px-3.5 py-2.5 transition ${
                      active ? 'border-accent-300 bg-accent-50' : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <span className={`block text-xs font-bold ${active ? 'text-accent-700' : 'text-slate-900'}`}>
                      {p.label}
                    </span>
                    <span className="block text-[11px] text-slate-500 font-light mt-0.5">{p.desc}</span>
                  </button>
                );
              })}
            </Section>

            {/* Color adjustment */}
            <Section icon={Paintbrush} label="Color Adjustment" open={section === 'coloradjust'} onToggle={() => toggleSection('coloradjust')}>
              <ColourRow label="Text color" value={settings.textColor} onChange={(v) => set('textColor', v)} />
              <ColourRow label="Title color" value={settings.titleColor} onChange={(v) => set('titleColor', v)} />
              <ColourRow label="Background color" value={settings.bgColor} onChange={(v) => set('bgColor', v)} />
            </Section>

            {/* Navigation / Orientation */}
            <Section icon={Compass} label="Navigation" open={section === 'navigation'} onToggle={() => toggleSection('navigation')}>
              <Toggle label="Big cursor" on={settings.bigCursor} onClick={() => toggle('bigCursor')} />
              <Toggle label="Pause animations" on={settings.stopAnimations} onClick={() => toggle('stopAnimations')} />
              <Toggle label="Hide images" on={settings.hideImages} onClick={() => toggle('hideImages')} />
              <Toggle label="Highlight focus" on={settings.highlightFocus} onClick={() => toggle('highlightFocus')} />
              <Toggle label="Reading guide" on={settings.readingGuide} onClick={() => toggle('readingGuide')} />
              <Toggle label="Reading mask" on={settings.readingMask} onClick={() => toggle('readingMask')} />
            </Section>
          </div>

          {/* Footer */}
          <div className="shrink-0 border-t border-slate-100 p-3">
            <button
              type="button"
              onClick={reset}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider py-2.5 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset all settings
            </button>
          </div>
        </div>
      )}
    </>,
    document.body,
  );
};
