import { useEffect, useMemo, useState, type FC } from 'react';
import { Navigate } from 'react-router-dom';
import {
  FileSpreadsheet,
  FileText,
  ShieldCheck,
  ClipboardList,
  Newspaper,
  Clapperboard,
  Inbox,
  PhoneCall,
  Users,
  Search,
  LogOut,
  Plus,
  Pencil,
  Trash2,
  Download,
  Check,
  X,
  Loader2,
  ChevronDown,
  ExternalLink,
  LineChart,
  BarChart3,
  Upload,
  RotateCcw,
} from 'lucide-react';
import {
  useAuth,
  useCmsArticles,
  useCmsDocuments,
  useCmsStrategyNav,
  useCmsPerformance,
} from '../lib/cms/store';
import { cms } from '../lib/cms/backend';
import { STRATEGIES } from '../data/content';
import { parseNavRows, parsePerformanceRows, deriveNavStats, formatAsOn } from '../lib/cms/navParser';
import {
  DOC_CATEGORIES,
  ARTICLE_KINDS,
  type CmsDocument,
  type DocCategory,
  type ArticleKind,
  type OnboardingRecord,
  type CallbackRecord,
  type TeamUser,
} from '../lib/cms/types';
import { useToast } from '../components/toast';

/* ------------------------------------------------------------------ */
/* Sections — the console sidebar, mapped to real ACE PMS content.     */
/* ------------------------------------------------------------------ */

type SectionType = 'doc' | 'article' | 'onboarding' | 'access' | 'nav' | 'perf' | 'callback';

interface Section {
  key: string;
  label: string;
  icon: typeof FileText;
  type: SectionType;
  category?: DocCategory;
  kinds?: ArticleKind[];
}

// Note: Insights/blog posts are file-managed in src/content/insights.json,
// so the Console handles documents, onboarding and access only.
const SECTIONS: Section[] = [
  { key: 'factsheets', label: 'Factsheets', icon: FileSpreadsheet, type: 'doc', category: 'Monthly factsheets' },
  { key: 'decks', label: 'Product Decks', icon: FileText, type: 'doc', category: 'Product decks' },
  { key: 'strategy', label: 'Strategy', icon: LineChart, type: 'nav' },
  { key: 'performance', label: 'Performance', icon: BarChart3, type: 'perf' },
  { key: 'compliance', label: 'Compliance', icon: ShieldCheck, type: 'doc', category: 'Compliance & disclosures' },
  { key: 'forms', label: 'Forms', icon: ClipboardList, type: 'doc', category: 'Forms' },
  { key: 'onboarding', label: 'Onboarding', icon: Inbox, type: 'onboarding' },
  { key: 'enquiries', label: 'Enquiries', icon: PhoneCall, type: 'callback' },
  { key: 'access', label: 'Access', icon: Users, type: 'access' },
];

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

const inputCls =
  'w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:bg-white transition';

/* ------------------------------------------------------------------ */
/* Page                                                               */
/* ------------------------------------------------------------------ */

export default function AdminPage() {
  const { session, signOut } = useAuth();
  const [activeKey, setActiveKey] = useState('factsheets');
  const [search, setSearch] = useState('');
  const [entryOpen, setEntryOpen] = useState(false);

  if (!session) return <Navigate to="/login" replace />;

  const active = SECTIONS.find((s) => s.key === activeKey) ?? SECTIONS[0];
  const canCreate = active.type === 'doc' || active.type === 'article';

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-slate-900">
      {/* Top bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
          <div className="flex items-center gap-2.5 shrink-0">
            <span className="font-extrabold tracking-tight text-lg">CONSOLE</span>
            <span className="text-[9px] font-bold uppercase tracking-wider text-white bg-accent-500 px-1.5 py-0.5 rounded">
              Super
            </span>
            <span className="hidden md:inline text-slate-200">|</span>
            <span className="hidden md:inline text-[11px] font-mono text-slate-400 truncate max-w-[220px]">
              {session.user.email}
            </span>
          </div>

          <div className="flex-1 relative max-w-md ml-auto">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search…"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:bg-white transition"
            />
          </div>

          <button
            onClick={() => signOut()}
            className="shrink-0 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider bg-ink-900 hover:bg-ink-800 text-white rounded-lg px-3.5 py-2 transition"
          >
            <LogOut className="w-3.5 h-3.5" /> Logout
          </button>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <aside className="lg:w-56 shrink-0 flex flex-col gap-4">
          <nav className="bg-white border border-slate-200 rounded-2xl p-2 flex lg:flex-col gap-1 overflow-x-auto">
            {SECTIONS.map((s) => {
              const isActive = s.key === activeKey;
              const Icon = s.icon;
              return (
                <button
                  key={s.key}
                  onClick={() => {
                    setActiveKey(s.key);
                    setEntryOpen(false);
                  }}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition ${
                    isActive
                      ? 'bg-ink-900 text-white shadow-sm'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-ink-700'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" /> {s.label}
                </button>
              );
            })}
          </nav>

          <button
            onClick={() => setEntryOpen(true)}
            disabled={!canCreate}
            className="hidden lg:inline-flex items-center justify-center gap-2 bg-accent-500 hover:bg-accent-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs uppercase tracking-wider py-3 rounded-xl transition"
          >
            <Plus className="w-4 h-4" /> New Entry
          </button>
        </aside>

        {/* Main */}
        <main className="flex-1 min-w-0">
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="font-extrabold text-slate-900">{active.label}</h2>
              {canCreate && (
                <button
                  onClick={() => setEntryOpen(true)}
                  className="lg:hidden inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider bg-accent-500 text-white rounded-lg px-3 py-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> New
                </button>
              )}
            </div>

            {active.type === 'doc' && <DocList category={active.category!} search={search} />}
            {active.type === 'article' && <ArticleList kinds={active.kinds!} search={search} />}
            {active.type === 'nav' && <NavManager />}
            {active.type === 'perf' && <PerfManager />}
            {active.type === 'onboarding' && <OnboardingList search={search} />}
            {active.type === 'callback' && <CallbackList search={search} />}
            {active.type === 'access' && <AccessList search={search} currentEmail={session.user.email} />}
          </div>
        </main>
      </div>

      {/* New Entry slide-over */}
      {entryOpen && canCreate && (
        <NewEntry section={active} onClose={() => setEntryOpen(false)} />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Record row shell                                                   */
/* ------------------------------------------------------------------ */

const Row: FC<{
  title: string;
  tag?: string;
  date?: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}> = ({ title, tag, date, actions, children }) => (
  <div className="px-5 py-4 border-b border-slate-100 last:border-0">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="font-bold text-sm text-slate-900 leading-snug">{title}</p>
        <p className="text-[11px] text-slate-400 mt-1">
          <span className="font-mono uppercase tracking-wider text-slate-400">Record</span>
          {tag ? <span className="text-accent-600 font-semibold"> · {tag}</span> : null}
          {date ? <span> · {date}</span> : null}
        </p>
        {children}
      </div>
      {actions && <div className="flex items-center gap-1 shrink-0">{actions}</div>}
    </div>
  </div>
);

const Empty: FC<{ label: string }> = ({ label }) => (
  <p className="text-xs text-slate-400 italic px-5 py-10 text-center">{label}</p>
);

const IconBtn: FC<{ onClick: () => void; title: string; danger?: boolean; children: React.ReactNode }> = ({
  onClick,
  title,
  danger,
  children,
}) => (
  <button
    onClick={onClick}
    title={title}
    className={`p-2 rounded-lg transition ${
      danger ? 'text-rose-500 hover:bg-rose-50' : 'text-ink-600 hover:bg-slate-50'
    }`}
  >
    {children}
  </button>
);

/* ------------------------------------------------------------------ */
/* Documents                                                          */
/* ------------------------------------------------------------------ */

const DocList: FC<{ category: DocCategory; search: string }> = ({ category, search }) => {
  const docs = useCmsDocuments();
  const [editing, setEditing] = useState<CmsDocument | null>(null);
  const q = search.trim().toLowerCase();
  const rows = docs.filter(
    (d) => d.category === category && (!q || d.title.toLowerCase().includes(q)),
  );
  if (rows.length === 0) return <Empty label="No records yet. Use New Entry to add one." />;
  return (
    <>
      {rows.map((d) => (
        <Row
          key={d.id}
          title={d.title}
          tag={d.strategy || category}
          date={fmtDate(d.uploadedAt)}
          actions={
            <>
              {d.fileUrl && (
                <a
                  href={d.fileUrl}
                  download={d.fileName ?? d.title}
                  className="p-2 rounded-lg text-ink-600 hover:bg-slate-50"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </a>
              )}
              <IconBtn onClick={() => setEditing(d)} title="Edit">
                <Pencil className="w-4 h-4" />
              </IconBtn>
              <IconBtn onClick={() => cms.deleteDocument(d.id)} title="Delete" danger>
                <Trash2 className="w-4 h-4" />
              </IconBtn>
            </>
          }
        />
      ))}
      {editing && <EditDocument doc={editing} onClose={() => setEditing(null)} />}
    </>
  );
};

/* ------------------------------------------------------------------ */
/* Edit document slide-over                                           */
/* ------------------------------------------------------------------ */

const EditDocument: FC<{ doc: CmsDocument; onClose: () => void }> = ({ doc, onClose }) => (
  <div className="fixed inset-0 z-50 flex justify-end">
    <div className="absolute inset-0 bg-ink-900/40 animate-fadeIn" onClick={onClose} />
    <div className="relative w-full max-w-md bg-white h-full shadow-2xl overflow-y-auto animate-fadeIn">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white">
        <h3 className="font-extrabold text-slate-900">Edit · {doc.category}</h3>
        <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:bg-slate-50">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="p-6">
        <DocumentEditForm doc={doc} onDone={onClose} />
      </div>
    </div>
  </div>
);

const DocumentEditForm: FC<{ doc: CmsDocument; onDone: () => void }> = ({ doc, onDone }) => {
  const showToast = useToast();
  const [title, setTitle] = useState(doc.title);
  const [strategy, setStrategy] = useState(doc.strategy ?? '');
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setBusy(true);
    try {
      await cms.updateDocument({
        id: doc.id,
        title: title.trim(),
        strategy: strategy.trim() || undefined,
        file: file ?? undefined,
      });
      showToast(`"${title.trim()}" updated.`);
      onDone();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Update failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <p className="text-[11px] text-slate-400">
        Category: <span className="font-semibold text-slate-600">{doc.category}</span>
      </p>
      <Field label="Title">
        <input value={title} onChange={(e) => setTitle(e.target.value)} required className={inputCls} />
      </Field>
      <Field label="Strategy (optional)">
        <input value={strategy} onChange={(e) => setStrategy(e.target.value)} placeholder="e.g. ACE Multicap" className={inputCls} />
      </Field>
      <Field label="Replace file (optional)">
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-ink-50 file:text-ink-700 file:font-semibold file:text-xs hover:file:bg-ink-100"
        />
        <span className="text-[11px] text-slate-400 mt-1.5 block">
          {doc.fileName ? `Current: ${doc.fileName}` : 'No file attached yet.'} Leave empty to keep it.
        </span>
      </Field>
      <button
        type="submit"
        disabled={busy}
        className="w-full bg-accent-500 hover:bg-accent-600 disabled:opacity-60 text-white font-bold text-xs uppercase tracking-wider py-3 rounded-lg inline-flex items-center justify-center gap-2"
      >
        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
        {busy ? 'Saving…' : 'Save changes'}
      </button>
    </form>
  );
};

/* ------------------------------------------------------------------ */
/* Strategy Returns (NAV) — Excel upload drives the growth chart       */
/* ------------------------------------------------------------------ */

const NavManager: FC = () => {
  const showToast = useToast();
  const uploaded = useCmsStrategyNav();
  const [busyId, setBusyId] = useState<string | null>(null);
  const byId = new Map(uploaded.map((s) => [s.strategyId, s]));

  const handleFile = async (strategyId: string, name: string, file: File | null) => {
    if (!file) return;
    setBusyId(strategyId);
    try {
      const XLSX = await import('xlsx');
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: 'array' });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, {
        header: 1,
        raw: true,
        blankrows: false,
      }) as unknown[][];
      const parsed = parseNavRows(rows);
      await cms.saveStrategyNav({ strategyId, ...parsed });
      showToast(
        `${name} chart updated — ${parsed.labels[0]} to ${parsed.labels[parsed.labels.length - 1]}.`,
      );
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not read that Excel file.');
    } finally {
      setBusyId(null);
    }
  };

  const reset = async (strategyId: string, name: string) => {
    setBusyId(strategyId);
    try {
      await cms.deleteStrategyNav(strategyId);
      showToast(`${name} reverted to the built-in chart data.`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not reset.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <div className="px-5 py-3 bg-accent-50/60 border-b border-accent-100">
        <p className="text-[11px] text-slate-500 leading-relaxed">
          Upload one Excel per strategy with columns{' '}
          <span className="font-bold text-accent-700">Date</span>,{' '}
          <span className="font-bold text-accent-700">Strategy NAV</span> and{' '}
          <span className="font-bold text-accent-700">Benchmark NAV</span> — the{' '}
          <span className="font-bold text-accent-700">full history since inception</span> (daily or
          month-end; the last row of each month is used). The growth chart, ₹ value, since-inception
          return and “as on” date on the Home and Strategies pages update automatically. Raw NAV is fine —
          it is rebased to ₹1 crore at inception.
        </p>
      </div>
      {STRATEGIES.map((s) => {
        const series = byId.get(s.id);
        const stats = series ? deriveNavStats(series) : null;
        const busy = busyId === s.id;
        return (
          <Row
            key={s.id}
            title={s.name}
            tag={s.tag}
            date={series ? `Updated ${fmtDate(series.uploadedAt)}` : undefined}
            actions={
              <>
                <label
                  className={`px-3 py-2 rounded-lg cursor-pointer inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider transition ${
                    busy
                      ? 'text-slate-300 pointer-events-none'
                      : 'text-white bg-accent-500 hover:bg-accent-600'
                  }`}
                  title="Upload NAV Excel"
                >
                  {busy ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Upload className="w-3.5 h-3.5" />
                  )}
                  <span>{series ? 'Replace' : 'Upload'}</span>
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    hidden
                    disabled={busy}
                    onChange={(e) => {
                      const f = e.target.files?.[0] ?? null;
                      e.target.value = '';
                      handleFile(s.id, s.name, f);
                    }}
                  />
                </label>
                {series && (
                  <IconBtn onClick={() => reset(s.id, s.name)} title="Reset to built-in data" danger>
                    <RotateCcw className="w-4 h-4" />
                  </IconBtn>
                )}
              </>
            }
          >
            <p className="text-xs text-slate-500 font-light mt-1.5">
              {series && stats
                ? `${series.labels[0]} – ${formatAsOn(series.asOf)} · ${stats.strategy} at ${stats.strategyCagr}% · benchmark ${stats.benchmark} at ${stats.benchmarkCagr}%`
                : 'Using the built-in chart data. Upload an Excel to override it.'}
            </p>
          </Row>
        );
      })}
    </>
  );
};

/* ------------------------------------------------------------------ */
/* Performance — Excel upload drives the horizon-returns tables        */
/* ------------------------------------------------------------------ */

const PERF_PERIODS = ['1Y', '3Y', '5Y', 'SI'];

const PerfManager: FC = () => {
  const showToast = useToast();
  const uploaded = useCmsPerformance();
  const [busyId, setBusyId] = useState<string | null>(null);
  const byId = new Map(uploaded.map((p) => [p.strategyId, p]));

  const handleFile = async (strategyId: string, name: string, file: File | null) => {
    if (!file) return;
    setBusyId(strategyId);
    try {
      const XLSX = await import('xlsx');
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: 'array' });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, {
        header: 1,
        raw: true,
        blankrows: false,
      }) as unknown[][];
      const parsed = parsePerformanceRows(rows);
      await cms.savePerformance({ strategyId, ...parsed });
      showToast(`${name} returns updated.`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not read that Excel file.');
    } finally {
      setBusyId(null);
    }
  };

  const reset = async (strategyId: string, name: string) => {
    setBusyId(strategyId);
    try {
      await cms.deletePerformance(strategyId);
      showToast(`${name} reverted to the built-in returns.`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not reset.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <div className="px-5 py-3 bg-accent-50/60 border-b border-accent-100">
        <p className="text-[11px] text-slate-500 leading-relaxed">
          Upload one Excel per strategy with columns{' '}
          <span className="font-bold text-accent-700">Period</span>,{' '}
          <span className="font-bold text-accent-700">Portfolio %</span> and{' '}
          <span className="font-bold text-accent-700">Benchmark %</span> — four rows:{' '}
          <span className="font-bold text-accent-700">1Y, 3Y, 5Y, Since Inception</span> (TWRR, as
          percentages, e.g. 19.2). The returns tables on the Performance and Strategies pages update
          automatically; Alpha is computed for you (Portfolio − Benchmark).
        </p>
      </div>
      {STRATEGIES.map((s) => {
        const row = byId.get(s.id);
        const busy = busyId === s.id;
        return (
          <Row
            key={s.id}
            title={s.name}
            tag={s.tag}
            date={row ? `Updated ${fmtDate(row.uploadedAt)}` : undefined}
            actions={
              <>
                <label
                  className={`px-3 py-2 rounded-lg cursor-pointer inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider transition ${
                    busy
                      ? 'text-slate-300 pointer-events-none'
                      : 'text-white bg-accent-500 hover:bg-accent-600'
                  }`}
                  title="Upload returns Excel"
                >
                  {busy ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Upload className="w-3.5 h-3.5" />
                  )}
                  <span>{row ? 'Replace' : 'Upload'}</span>
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    hidden
                    disabled={busy}
                    onChange={(e) => {
                      const f = e.target.files?.[0] ?? null;
                      e.target.value = '';
                      handleFile(s.id, s.name, f);
                    }}
                  />
                </label>
                {row && (
                  <IconBtn onClick={() => reset(s.id, s.name)} title="Reset to built-in returns" danger>
                    <RotateCcw className="w-4 h-4" />
                  </IconBtn>
                )}
              </>
            }
          >
            <p className="text-xs text-slate-500 font-light mt-1.5">
              {row
                ? row.portfolio
                    .map((v, i) => `${PERF_PERIODS[i]} ${v}% vs ${row.benchmark[i]}%`)
                    .join(' · ')
                : 'Using the built-in returns. Upload an Excel to override them.'}
            </p>
          </Row>
        );
      })}
    </>
  );
};

/* ------------------------------------------------------------------ */
/* Articles                                                           */
/* ------------------------------------------------------------------ */

const ArticleList: FC<{ kinds: ArticleKind[]; search: string }> = ({ kinds, search }) => {
  const articles = useCmsArticles();
  const q = search.trim().toLowerCase();
  const rows = articles.filter(
    (a) => kinds.includes(a.kind) && (!q || a.title.toLowerCase().includes(q)),
  );
  if (rows.length === 0) return <Empty label="No records yet. Use New Entry to add one." />;
  return (
    <>
      {rows.map((a) => (
        <Row
          key={a.id}
          title={a.title}
          tag={`${a.kind} · ${a.category}`}
          date={fmtDate(a.publishedAt)}
          actions={
            <>
              {a.link && (
                <a
                  href={a.link}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-lg text-ink-600 hover:bg-slate-50"
                  title="Open link"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
              <IconBtn onClick={() => cms.deleteArticle(a.id)} title="Delete" danger>
                <Trash2 className="w-4 h-4" />
              </IconBtn>
            </>
          }
        >
          <p className="text-xs text-slate-500 font-light mt-1.5 line-clamp-2 max-w-2xl">{a.summary}</p>
        </Row>
      ))}
    </>
  );
};

/* ------------------------------------------------------------------ */
/* Onboarding (read-only submissions)                                 */
/* ------------------------------------------------------------------ */

// Submissions carry their flow + entity type as a leading "[Client Account
// Opening · Individual]" tag on the notes field (set in OnboardingPage). Split
// it out so the console can show the client type prominently.
function parseSubmission(notes?: string): { type?: string; text?: string } {
  if (!notes) return {};
  const m = notes.match(/^\s*\[([^\]]+)\]\s*(?:—\s*)?([\s\S]*)$/);
  if (!m) return { text: notes.trim() || undefined };
  return { type: m[1].trim(), text: m[2].trim() || undefined };
}

const OnboardingList: FC<{ search: string }> = ({ search }) => {
  const showToast = useToast();
  const [rows, setRows] = useState<OnboardingRecord[] | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    cms.listOnboarding().then((r) => active && setRows(r));
    return () => {
      active = false;
    };
  }, []);

  const q = search.trim().toLowerCase();
  const filtered = useMemo(
    () =>
      (rows ?? []).filter(
        (r) =>
          !q ||
          r.fullName.toLowerCase().includes(q) ||
          r.pan.toLowerCase().includes(q) ||
          (r.notes ?? '').toLowerCase().includes(q),
      ),
    [rows, q],
  );

  const openFile = async (path?: string, name?: string) => {
    if (!path) {
      showToast('This file was submitted in a demo session (no stored copy).');
      return;
    }
    const url = await cms.signOnboardingFile(path);
    if (url) window.open(url, '_blank');
    else showToast(`Could not open ${name ?? 'file'} — check Supabase storage access.`);
  };

  if (rows === null) return <Empty label="Loading…" />;
  if (filtered.length === 0) return <Empty label="No onboarding submissions yet." />;

  return (
    <>
      {filtered.map((r) => {
        const parsed = parseSubmission(r.notes);
        const docCount = r.documents.length;
        return (
        <Row
          key={r.id}
          title={r.fullName}
          tag={parsed.type ?? 'Submission'}
          date={fmtDate(r.createdAt)}
          actions={
            <IconBtn onClick={() => setOpenId(openId === r.id ? null : r.id)} title="Details">
              <ChevronDown className={`w-4 h-4 transition-transform ${openId === r.id ? 'rotate-180' : ''}`} />
            </IconBtn>
          }
        >
          <p className="text-xs text-slate-500 font-light mt-1.5">
            PAN {r.pan} · {r.email} · {r.mobile} · {docCount} document{docCount === 1 ? '' : 's'}
          </p>
          {openId === r.id && (
            <div className="mt-3 space-y-1.5">
              {parsed.text && <p className="text-xs text-slate-500 italic">“{parsed.text}”</p>}
              <div className="flex flex-wrap gap-2">
                {r.documents.map((d) => (
                  <button
                    key={d.key}
                    onClick={() => openFile(d.path, d.label)}
                    className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-ink-700 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 hover:border-ink-400 transition"
                  >
                    <Download className="w-3 h-3" /> {d.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </Row>
        );
      })}
    </>
  );
};

/* ------------------------------------------------------------------ */
/* Enquiries (Request-a-callback submissions)                         */
/* ------------------------------------------------------------------ */

const CallbackList: FC<{ search: string }> = ({ search }) => {
  const [rows, setRows] = useState<CallbackRecord[] | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    cms.listCallbacks().then((r) => active && setRows(r));
    return () => {
      active = false;
    };
  }, []);

  const q = search.trim().toLowerCase();
  const filtered = useMemo(
    () =>
      (rows ?? []).filter(
        (r) =>
          !q ||
          r.name.toLowerCase().includes(q) ||
          r.email.toLowerCase().includes(q) ||
          r.mobile.toLowerCase().includes(q) ||
          (r.city ?? '').toLowerCase().includes(q),
      ),
    [rows, q],
  );

  if (rows === null) return <Empty label="Loading…" />;
  if (filtered.length === 0) return <Empty label="No callback enquiries yet." />;

  return (
    <>
      {filtered.map((r) => (
        <Row
          key={r.id}
          title={r.name}
          tag={r.visitorType || 'Enquiry'}
          date={fmtDate(r.createdAt)}
          actions={
            <IconBtn onClick={() => setOpenId(openId === r.id ? null : r.id)} title="Details">
              <ChevronDown className={`w-4 h-4 transition-transform ${openId === r.id ? 'rotate-180' : ''}`} />
            </IconBtn>
          }
        >
          <p className="text-xs text-slate-500 font-light mt-1.5">
            {r.email} · {r.mobile}
            {r.city ? ` · ${r.city}` : ''}
            {r.corpus ? ` · ${r.corpus}` : ''}
          </p>
          {openId === r.id && r.message && (
            <p className="text-xs text-slate-500 italic mt-2">“{r.message}”</p>
          )}
        </Row>
      ))}
    </>
  );
};

/* ------------------------------------------------------------------ */
/* Access (team users — all Super Admins)                             */
/* ------------------------------------------------------------------ */

const AccessList: FC<{ search: string; currentEmail: string }> = ({ search, currentEmail }) => {
  const showToast = useToast();
  const [users, setUsers] = useState<TeamUser[] | null>(null);

  useEffect(() => {
    let active = true;
    cms.listTeamUsers().then((u) => active && setUsers(u));
    return () => {
      active = false;
    };
  }, []);

  const q = search.trim().toLowerCase();
  const rows = (users ?? []).filter((u) => !q || u.email.toLowerCase().includes(q));

  return (
    <>
      <div className="px-5 py-3 bg-accent-50/60 border-b border-accent-100">
        <p className="text-[11px] text-slate-500">
          Every team member is a <span className="font-bold text-accent-700">Super Admin</span>. Add or
          remove accounts in Supabase → Authentication → Users.
        </p>
      </div>
      {users === null ? (
        <Empty label="Loading…" />
      ) : rows.length === 0 ? (
        <Empty label="No users found." />
      ) : (
        rows.map((u) => (
          <Row
            key={u.id}
            title={u.email}
            tag="Super Admin"
            date={u.lastSignInAt ? `Last seen ${fmtDate(u.lastSignInAt)}` : undefined}
            actions={
              u.email === currentEmail ? (
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-100 rounded px-2 py-0.5">
                  You
                </span>
              ) : undefined
            }
          />
        ))
      )}
      <div className="px-5 py-4">
        <button
          onClick={() =>
            showToast('Add team members in Supabase → Authentication → Users (with Auto Confirm).')
          }
          className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-ink-700 border border-slate-200 rounded-lg px-3 py-2 hover:border-ink-400 transition"
        >
          <Plus className="w-3.5 h-3.5" /> Add user
        </button>
      </div>
    </>
  );
};

/* ------------------------------------------------------------------ */
/* New Entry slide-over                                               */
/* ------------------------------------------------------------------ */

const NewEntry: FC<{ section: Section; onClose: () => void }> = ({ section, onClose }) => (
  <div className="fixed inset-0 z-50 flex justify-end">
    <div className="absolute inset-0 bg-ink-900/40 animate-fadeIn" onClick={onClose} />
    <div className="relative w-full max-w-md bg-white h-full shadow-2xl overflow-y-auto animate-fadeIn">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white">
        <h3 className="font-extrabold text-slate-900">New · {section.label}</h3>
        <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:bg-slate-50">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="p-6">
        {section.type === 'doc' ? (
          <DocumentForm category={section.category!} onDone={onClose} />
        ) : (
          <ArticleForm kinds={section.kinds!} onDone={onClose} />
        )}
      </div>
    </div>
  </div>
);

const Field: FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <label className="block">
    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
      {label}
    </span>
    {children}
  </label>
);

const DocumentForm: FC<{ category: DocCategory; onDone: () => void }> = ({ category, onDone }) => {
  const showToast = useToast();
  const [title, setTitle] = useState('');
  const [strategy, setStrategy] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setBusy(true);
    try {
      await cms.addDocument({ title: title.trim(), category, strategy: strategy.trim() || undefined, file: file ?? undefined });
      showToast(`"${title.trim()}" published.`);
      onDone();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <p className="text-[11px] text-slate-400">
        Category: <span className="font-semibold text-slate-600">{category}</span>
      </p>
      <Field label="Title">
        <input value={title} onChange={(e) => setTitle(e.target.value)} required className={inputCls} />
      </Field>
      <Field label="Strategy (optional)">
        <input value={strategy} onChange={(e) => setStrategy(e.target.value)} placeholder="e.g. ACE Multicap" className={inputCls} />
      </Field>
      <Field label="File (PDF, image, etc.)">
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-ink-50 file:text-ink-700 file:font-semibold file:text-xs hover:file:bg-ink-100"
        />
      </Field>
      <button
        type="submit"
        disabled={busy}
        className="w-full bg-accent-500 hover:bg-accent-600 disabled:opacity-60 text-white font-bold text-xs uppercase tracking-wider py-3 rounded-lg inline-flex items-center justify-center gap-2"
      >
        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
        {busy ? 'Publishing…' : 'Publish'}
      </button>
    </form>
  );
};

const ArticleForm: FC<{ kinds: ArticleKind[]; onDone: () => void }> = ({ kinds, onDone }) => {
  const showToast = useToast();
  const [kind, setKind] = useState<ArticleKind>(kinds[0]);
  const [category, setCategory] = useState('Strategy commentary');
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [body, setBody] = useState('');
  const [readTime, setReadTime] = useState('');
  const [link, setLink] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !summary.trim()) return;
    setBusy(true);
    try {
      await cms.addArticle({
        kind,
        category: category.trim() || 'Insights',
        title: title.trim(),
        summary: summary.trim(),
        body: body.trim() || undefined,
        readTime: readTime.trim() || undefined,
        link: link.trim() || undefined,
      });
      showToast(`"${title.trim()}" published.`);
      onDone();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Publish failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      {kinds.length > 1 && (
        <Field label="Type">
          <select value={kind} onChange={(e) => setKind(e.target.value as ArticleKind)} className={inputCls}>
            {kinds.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </Field>
      )}
      <Field label="Category">
        <input value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls} />
      </Field>
      <Field label="Title">
        <input value={title} onChange={(e) => setTitle(e.target.value)} required className={inputCls} />
      </Field>
      <Field label="Summary">
        <textarea value={summary} onChange={(e) => setSummary(e.target.value)} required rows={2} className={inputCls} />
      </Field>
      <Field label="Body (optional)">
        <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4} className={inputCls} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Read time">
          <input value={readTime} onChange={(e) => setReadTime(e.target.value)} placeholder="4 min" className={inputCls} />
        </Field>
        <Field label="External link">
          <input value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://…" className={inputCls} />
        </Field>
      </div>
      <button
        type="submit"
        disabled={busy}
        className="w-full bg-accent-500 hover:bg-accent-600 disabled:opacity-60 text-white font-bold text-xs uppercase tracking-wider py-3 rounded-lg inline-flex items-center justify-center gap-2"
      >
        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
        {busy ? 'Publishing…' : 'Publish'}
      </button>
    </form>
  );
};
