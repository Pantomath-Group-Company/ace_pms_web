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
  Trophy,
  Award,
  History,
  UserMinus,
  Save,
} from 'lucide-react';
import {
  useAuth,
  useCmsArticles,
  useCmsDocuments,
  useCmsStrategyNav,
  useCmsPerformance,
  useCmsStrategyNotes,
} from '../lib/cms/store';
import { cms } from '../lib/cms/backend';
import { STRATEGIES } from '../data/content';
import {
  useComputedFiveYearReturnRange,
  parseFiveYearOverride,
  parseRankingsNote,
  DEFAULT_PMS_RANKINGS,
} from '../lib/performance';
import {
  FIVE_YEAR_RANGE_NOTE_ID,
  PMS_RANKINGS_NOTE_ID,
  type PmsRankingRow,
  type PmsRankingsData,
} from '../lib/cms/types';
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
  type TeamRole,
  type AuditLogEntry,
  TEAM_ROLES,
  ROLE_LABELS,
} from '../lib/cms/types';
import { useToast } from '../components/toast';

/* ------------------------------------------------------------------ */
/* Sections — the console sidebar, mapped to real ACE PMS content.     */
/* ------------------------------------------------------------------ */

type SectionType =
  | 'doc'
  | 'article'
  | 'onboarding'
  | 'access'
  | 'nav'
  | 'perf'
  | 'notes'
  | 'rankings'
  | 'callback'
  | 'audit';

interface Section {
  key: string;
  label: string;
  icon: typeof FileText;
  type: SectionType;
  category?: DocCategory;
  kinds?: ArticleKind[];
  /** Hidden from (and inaccessible to) plain Admins. */
  systemAdminOnly?: boolean;
}

// Note: Insights/blog posts are file-managed in src/content/insights.json,
// so the Console handles documents, onboarding and access only.
const SECTIONS: Section[] = [
  { key: 'factsheets', label: 'Factsheets', icon: FileSpreadsheet, type: 'doc', category: 'Monthly factsheets' },
  { key: 'decks', label: 'Product Decks', icon: FileText, type: 'doc', category: 'Product decks' },
  { key: 'strategy', label: 'Strategy', icon: LineChart, type: 'nav' },
  { key: 'performance', label: 'Performance', icon: BarChart3, type: 'perf' },
  { key: 'track-record', label: 'Track Record', icon: Trophy, type: 'notes' },
  { key: 'rankings', label: 'Rankings', icon: Award, type: 'rankings' },
  { key: 'compliance', label: 'Compliance', icon: ShieldCheck, type: 'doc', category: 'Compliance & disclosures' },
  { key: 'forms', label: 'Forms', icon: ClipboardList, type: 'doc', category: 'Forms' },
  { key: 'onboarding', label: 'Onboarding', icon: Inbox, type: 'onboarding' },
  { key: 'enquiries', label: 'Enquiries', icon: PhoneCall, type: 'callback' },
  { key: 'access', label: 'Access', icon: Users, type: 'access', systemAdminOnly: true },
  { key: 'audit', label: 'Audit Logs', icon: History, type: 'audit', systemAdminOnly: true },
];

const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

const inputCls =
  'w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:bg-white transition';

/* ------------------------------------------------------------------ */
/* Page                                                               */
/* ------------------------------------------------------------------ */

export default function AdminPage() {
  const { session, signOut, isSystemAdmin } = useAuth();
  const [activeKey, setActiveKey] = useState('factsheets');
  const [search, setSearch] = useState('');
  const [entryOpen, setEntryOpen] = useState(false);

  if (!session) return <Navigate to="/login" replace />;

  // Plain Admins never see (or can land on) System-Admin-only sections.
  const sections = SECTIONS.filter((s) => isSystemAdmin || !s.systemAdminOnly);
  const active = sections.find((s) => s.key === activeKey) ?? sections[0];
  const canCreate = active.type === 'doc' || active.type === 'article';

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-slate-900">
      {/* Top bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
          <div className="flex items-center gap-2.5 shrink-0">
            <span className="font-extrabold tracking-tight text-lg">CONSOLE</span>
            <span
              className={`text-[9px] font-bold uppercase tracking-wider text-white px-1.5 py-0.5 rounded ${
                isSystemAdmin ? 'bg-ink-900' : 'bg-accent-500'
              }`}
            >
              {ROLE_LABELS[session.user.role]}
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
            {sections.map((s) => {
              const isActive = s.key === active.key;
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
            {active.type === 'notes' && <NotesManager />}
            {active.type === 'rankings' && <RankingsManager />}
            {active.type === 'onboarding' && <OnboardingList search={search} />}
            {active.type === 'callback' && <CallbackList search={search} />}
            {active.type === 'access' && isSystemAdmin && (
              <AccessList search={search} currentId={session.user.id} />
            )}
            {active.type === 'audit' && isSystemAdmin && <AuditList search={search} />}
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
    type="button"
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
      <FiveYearOverride />
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
/* 5-yr annualised return — manual override of the computed range      */
/* ------------------------------------------------------------------ */

const FiveYearOverride: FC = () => {
  const showToast = useToast();
  const notes = useCmsStrategyNotes();
  const computed = useComputedFiveYearReturnRange();
  const saved = notes.find((n) => n.strategyId === FIVE_YEAR_RANGE_NOTE_ID);
  const current = saved?.trackRecord ?? '';
  const [text, setText] = useState(current);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setText(current);
  }, [current]);

  const parsed = parseFiveYearOverride(text);
  const invalid = text.trim() !== '' && !parsed;
  const dirty = text.trim() !== current.trim();

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parsed) return;
    setBusy(true);
    try {
      await cms.saveStrategyNote({ strategyId: FIVE_YEAR_RANGE_NOTE_ID, trackRecord: parsed.label });
      showToast(`5-yr annualised return set to ${parsed.label}%.`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not save.');
    } finally {
      setBusy(false);
    }
  };

  const reset = async () => {
    setBusy(true);
    try {
      await cms.deleteStrategyNote(FIVE_YEAR_RANGE_NOTE_ID);
      showToast('5-yr annualised return reverted to the calculated range.');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not reset.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={save} className="px-5 py-4 border-b border-slate-100 space-y-3">
      <div>
        <p className="text-sm font-bold text-slate-900">5-yr annualised return (Home page)</p>
        <p className="text-[11px] text-slate-500 mt-0.5">
          Calculated from the 5Y returns below:{' '}
          <span className="font-bold text-accent-700">{computed ? `${computed.label}%` : '—'}</span>.
          If the calculation is off, enter the figure to show instead — a range like{' '}
          <span className="font-bold">17-21</span> or a single value like <span className="font-bold">20</span>.
        </p>
      </div>
      <div className="flex flex-wrap items-start gap-2">
        <div className="w-48">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={computed ? computed.label.replace('–', '-') : 'e.g. 17-21'}
            className={inputCls}
            aria-label="5-yr annualised return override"
          />
          {invalid && <p className="text-[11px] text-rose-600 mt-1">Use a number or a range, e.g. 17-21.</p>}
        </div>
        <button
          type="submit"
          disabled={busy || !dirty || !parsed}
          className="inline-flex items-center gap-2 bg-accent-500 hover:bg-accent-600 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-lg"
        >
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          Save
        </button>
        {saved && (
          <button
            type="button"
            onClick={reset}
            disabled={busy}
            className="inline-flex items-center gap-2 text-rose-600 border border-rose-200 hover:bg-rose-50 disabled:opacity-50 font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-lg"
          >
            <RotateCcw className="w-4 h-4" /> Use calculated
          </button>
        )}
      </div>
      <p className="text-[11px] text-slate-400">
        {saved
          ? `Manual override ${saved.trackRecord}% · set by ${saved.updatedBy} on ${fmtDate(saved.updatedAt)}`
          : 'Showing the calculated range.'}
      </p>
    </form>
  );
};

/* ------------------------------------------------------------------ */
/* Rankings — PMS Bazaar rankings table + footnote on the Home page    */
/* ------------------------------------------------------------------ */

const RANK_FIELDS: Array<{ key: keyof PmsRankingRow; label: string; placeholder: string }> = [
  { key: 'strategy', label: 'PMS Strategy', placeholder: 'ACE Multicap' },
  { key: 'category', label: 'Category', placeholder: 'Multicap' },
  { key: 'period', label: 'Period', placeholder: '5 Years' },
  { key: 'rank', label: 'Rank', placeholder: 'Rank 10' },
];

const emptyRankRow = (): PmsRankingRow => ({ strategy: '', category: '', period: '', rank: '' });

const cleanRankings = (d: PmsRankingsData): PmsRankingsData => ({
  rows: d.rows
    .map((r) => ({
      strategy: r.strategy.trim(),
      category: r.category.trim(),
      period: r.period.trim(),
      rank: r.rank.trim(),
    }))
    .filter((r) => r.strategy || r.category || r.period || r.rank),
  footnote: d.footnote.trim(),
});

const RankingsManager: FC = () => {
  const showToast = useToast();
  const notes = useCmsStrategyNotes();
  const saved = notes.find((n) => n.strategyId === PMS_RANKINGS_NOTE_ID);
  const current = useMemo(
    () => parseRankingsNote(saved?.trackRecord) ?? DEFAULT_PMS_RANKINGS,
    [saved?.trackRecord],
  );
  const [draft, setDraft] = useState<PmsRankingsData>(current);
  const [busy, setBusy] = useState(false);

  // Load saved data (and pick up saves made elsewhere).
  useEffect(() => {
    setDraft({ rows: current.rows.map((r) => ({ ...r })), footnote: current.footnote });
  }, [current]);

  const cleaned = cleanRankings(draft);
  const dirty = JSON.stringify(cleaned) !== JSON.stringify(cleanRankings(current));

  const setCell = (i: number, key: keyof PmsRankingRow, value: string) =>
    setDraft((d) => ({ ...d, rows: d.rows.map((r, j) => (j === i ? { ...r, [key]: value } : r)) }));
  const removeRow = (i: number) => setDraft((d) => ({ ...d, rows: d.rows.filter((_, j) => j !== i) }));
  const moveRow = (i: number, dir: -1 | 1) =>
    setDraft((d) => {
      const j = i + dir;
      if (j < 0 || j >= d.rows.length) return d;
      const rows = [...d.rows];
      [rows[i], rows[j]] = [rows[j], rows[i]];
      return { ...d, rows };
    });

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await cms.saveStrategyNote({ strategyId: PMS_RANKINGS_NOTE_ID, trackRecord: JSON.stringify(cleaned) });
      showToast('PMS Bazaar rankings updated.');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not save.');
    } finally {
      setBusy(false);
    }
  };

  const reset = async () => {
    setBusy(true);
    try {
      await cms.deleteStrategyNote(PMS_RANKINGS_NOTE_ID);
      showToast('Rankings reverted to the built-in table.');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not reset.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="px-5 py-3 bg-accent-50/60 border-b border-accent-100">
        <p className="text-[11px] text-slate-500 leading-relaxed">
          Edit the <span className="font-bold text-accent-700">PMS Bazaar rankings</span> table and the{' '}
          <span className="font-bold text-accent-700">footnote</span> shown below it on the Home page. Empty
          rows are ignored; leave the footnote blank to hide it. Reset restores the built-in table.
        </p>
      </div>
      <form onSubmit={save} className="p-5 space-y-4">
        <div className="space-y-3">
          {draft.rows.map((r, i) => (
            <div key={i} className="rounded-xl border border-slate-200 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Row {i + 1}</span>
                <div className="flex items-center gap-1">
                  <IconBtn onClick={() => moveRow(i, -1)} title="Move up">
                    <ChevronDown className="w-4 h-4 rotate-180" />
                  </IconBtn>
                  <IconBtn onClick={() => moveRow(i, 1)} title="Move down">
                    <ChevronDown className="w-4 h-4" />
                  </IconBtn>
                  <IconBtn onClick={() => removeRow(i)} title="Remove row" danger>
                    <Trash2 className="w-4 h-4" />
                  </IconBtn>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                {RANK_FIELDS.map((f) => (
                  <input
                    key={f.key}
                    value={r[f.key]}
                    onChange={(e) => setCell(i, f.key, e.target.value)}
                    placeholder={f.placeholder}
                    aria-label={`${f.label}, row ${i + 1}`}
                    title={f.label}
                    className={inputCls}
                  />
                ))}
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setDraft((d) => ({ ...d, rows: [...d.rows, emptyRankRow()] }))}
            className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-accent-600 border border-accent-200 hover:bg-accent-50 rounded-lg px-3 py-2"
          >
            <Plus className="w-3.5 h-3.5" /> Add row
          </button>
        </div>
        <div className="max-w-2xl">
          <Field label="Footnote (below the table)">
            <input
              value={draft.footnote}
              onChange={(e) => setDraft((d) => ({ ...d, footnote: e.target.value }))}
              placeholder="e.g. July 2026 PMS Bazaar Report"
              className={inputCls}
            />
          </Field>
        </div>
        <p className="text-[11px] text-slate-400">
          {saved
            ? `Custom rankings · last updated by ${saved.updatedBy} on ${fmtDate(saved.updatedAt)}`
            : 'Showing the built-in rankings.'}
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={busy || !dirty}
            className="inline-flex items-center gap-2 bg-accent-500 hover:bg-accent-600 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-lg"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Save
          </button>
          {saved && (
            <button
              type="button"
              onClick={reset}
              disabled={busy}
              className="inline-flex items-center gap-2 text-rose-600 border border-rose-200 hover:bg-rose-50 disabled:opacity-50 font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-lg"
            >
              <RotateCcw className="w-4 h-4" /> Reset to built-in
            </button>
          )}
        </div>
      </form>
    </>
  );
};

/* ------------------------------------------------------------------ */
/* Track Record — per-strategy note shown on the Strategies page       */
/* ------------------------------------------------------------------ */

const NotesManager: FC = () => {
  const showToast = useToast();
  const notes = useCmsStrategyNotes();
  const [strategyId, setStrategyId] = useState(STRATEGIES[0].id);
  const strategy = STRATEGIES.find((s) => s.id === strategyId) ?? STRATEGIES[0];
  const saved = notes.find((n) => n.strategyId === strategyId);
  const current = saved ? saved.trackRecord : (strategy.trackRecord ?? '');
  const [text, setText] = useState(current);
  const [busy, setBusy] = useState(false);

  // Load the selected strategy's text (and pick up saves made elsewhere).
  useEffect(() => {
    setText(current);
  }, [strategyId, current]);

  const dirty = text.trim() !== current.trim();

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await cms.saveStrategyNote({ strategyId, trackRecord: text.trim() });
      showToast(
        text.trim()
          ? `${strategy.name} track record updated.`
          : `${strategy.name} track record hidden.`,
      );
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not save.');
    } finally {
      setBusy(false);
    }
  };

  const reset = async () => {
    setBusy(true);
    try {
      await cms.deleteStrategyNote(strategyId);
      showToast(`${strategy.name} reverted to the built-in track record.`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not reset.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="px-5 py-3 bg-accent-50/60 border-b border-accent-100">
        <p className="text-[11px] text-slate-500 leading-relaxed">
          Select a PMS and edit the{' '}
          <span className="font-bold text-accent-700">track-record note</span> shown in its card on
          the Strategies (and Home) page. Save an empty note to hide it; reset to restore the
          built-in text.
        </p>
      </div>
      <form onSubmit={save} className="p-5 space-y-4 max-w-2xl">
        <Field label="PMS / Strategy">
          <select value={strategyId} onChange={(e) => setStrategyId(e.target.value)} className={inputCls}>
            {STRATEGIES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Track-record note">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            placeholder="e.g. Proven track record of 24% CAGR over 5 years (post fees and charges)…"
            className={inputCls}
          />
        </Field>
        <p className="text-[11px] text-slate-400">
          {saved
            ? `Custom note · last updated by ${saved.updatedBy} on ${fmtDate(saved.updatedAt)}`
            : 'Showing the built-in text.'}
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={busy || !dirty}
            className="inline-flex items-center gap-2 bg-accent-500 hover:bg-accent-600 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-lg"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Save
          </button>
          {saved && (
            <button
              type="button"
              onClick={reset}
              disabled={busy}
              className="inline-flex items-center gap-2 text-rose-600 border border-rose-200 hover:bg-rose-50 disabled:opacity-50 font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-lg"
            >
              <RotateCcw className="w-4 h-4" /> Reset to built-in
            </button>
          )}
        </div>
      </form>
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
/* Access — team users & roles (System Admin only)                    */
/* ------------------------------------------------------------------ */

const AccessList: FC<{ search: string; currentId: string }> = ({ search, currentId }) => {
  const showToast = useToast();
  const [users, setUsers] = useState<TeamUser[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [editing, setEditing] = useState<TeamUser | null>(null);

  const load = async () => {
    try {
      setUsers(await cms.listTeamUsers());
      setLoadError(null);
    } catch (err) {
      setUsers([]);
      setLoadError(err instanceof Error ? err.message : 'Could not load users.');
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const remove = async (u: TeamUser) => {
    if (busyId) return;
    if (!window.confirm(`Remove ${u.email}? They will lose Console access immediately.`)) return;
    setBusyId(u.id);
    try {
      await cms.removeTeamUser(u.id);
      showToast(`${u.email} removed.`);
      await load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not remove user.');
    } finally {
      setBusyId(null);
    }
  };

  const changeRole = async (u: TeamUser, role: TeamRole) => {
    if (role === u.role) {
      setEditing(null);
      return;
    }
    setBusyId(u.id);
    try {
      await cms.setTeamUserRole(u.id, role);
      showToast(`${u.email} is now ${ROLE_LABELS[role]}.`);
      setEditing(null);
      await load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not change role.');
    } finally {
      setBusyId(null);
    }
  };

  const q = search.trim().toLowerCase();
  const rows = (users ?? []).filter(
    (u) => !q || u.email.toLowerCase().includes(q) || (u.name ?? '').toLowerCase().includes(q),
  );

  return (
    <>
      <div className="px-5 py-3 bg-accent-50/60 border-b border-accent-100 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[11px] text-slate-500 leading-relaxed max-w-2xl">
          <span className="font-bold text-accent-700">System Admins</span> manage content, team users
          and the audit log. <span className="font-bold text-accent-700">Admins</span> manage site
          content only. Every change here is recorded in Audit Logs.
        </p>
        <button
          onClick={() => setAdding(true)}
          className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider bg-accent-500 hover:bg-accent-600 text-white rounded-lg px-3 py-2 transition"
        >
          <Plus className="w-3.5 h-3.5" /> Add user
        </button>
      </div>
      {loadError && (
        <p className="px-5 py-3 text-xs text-rose-600 bg-rose-50 border-b border-rose-100">{loadError}</p>
      )}
      {users === null ? (
        <Empty label="Loading…" />
      ) : rows.length === 0 ? (
        <Empty label="No users found." />
      ) : (
        rows.map((u) => {
          const isMe = u.id === currentId;
          const busy = busyId === u.id;
          return (
            <Row
              key={u.id}
              title={u.name ? `${u.name} · ${u.email}` : u.email}
              tag={ROLE_LABELS[u.role]}
              date={u.lastSignInAt ? `Last seen ${fmtDate(u.lastSignInAt)}` : undefined}
              actions={
                isMe ? (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-100 rounded px-2 py-0.5">
                    You
                  </span>
                ) : (
                  <>
                    {busy && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
                    <button
                      onClick={() => setEditing(u)}
                      disabled={busy}
                      title="Edit role"
                      className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-ink-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 transition disabled:opacity-60"
                    >
                      <Pencil className="w-3.5 h-3.5" /> Edit role
                    </button>
                    <IconBtn onClick={() => remove(u)} title="Remove user" danger>
                      <UserMinus className="w-4 h-4" />
                    </IconBtn>
                  </>
                )
              }
            />
          );
        })
      )}
      {editing && (
        <SlideOver title="Edit user role" onClose={() => setEditing(null)}>
          <EditRoleForm user={editing} onSave={(role) => changeRole(editing, role)} />
        </SlideOver>
      )}
      {adding && (
        <SlideOver title="Add team user" onClose={() => setAdding(false)}>
          <AddUserForm
            onDone={() => {
              setAdding(false);
              void load();
            }}
          />
        </SlideOver>
      )}
    </>
  );
};

const SlideOver: FC<{ title: string; onClose: () => void; children: React.ReactNode }> = ({
  title,
  onClose,
  children,
}) => (
  <div className="fixed inset-0 z-50 flex justify-end">
    <div className="absolute inset-0 bg-ink-900/40 animate-fadeIn" onClick={onClose} />
    <div className="relative w-full max-w-md bg-white h-full shadow-2xl overflow-y-auto animate-fadeIn">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white">
        <h3 className="font-extrabold text-slate-900">{title}</h3>
        <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:bg-slate-50">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="p-6">{children}</div>
    </div>
  </div>
);

const ROLE_DESCRIPTIONS: Record<TeamRole, string> = {
  system_admin: 'Manage site content, add/remove team users, change roles and read the Audit Logs.',
  admin: 'Manage site content only — documents, NAV/performance uploads and Track Record notes.',
};

const RolePicker: FC<{ value: TeamRole; onChange: (r: TeamRole) => void; name?: string }> = ({
  value,
  onChange,
  name = 'role',
}) => (
  <div className="space-y-2" role="radiogroup">
    {TEAM_ROLES.map((r) => (
      <label
        key={r}
        className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition ${
          value === r ? 'border-accent-500 bg-accent-50/60 ring-1 ring-accent-500' : 'border-slate-200 hover:bg-slate-50'
        }`}
      >
        <input
          type="radio"
          name={name}
          value={r}
          checked={value === r}
          onChange={() => onChange(r)}
          className="mt-0.5 accent-accent-500"
        />
        <span>
          <span className="block text-sm font-bold text-slate-900">{ROLE_LABELS[r]}</span>
          <span className="block text-[11px] text-slate-500 leading-relaxed">{ROLE_DESCRIPTIONS[r]}</span>
        </span>
      </label>
    ))}
  </div>
);

const EditRoleForm: FC<{ user: TeamUser; onSave: (role: TeamRole) => Promise<void> }> = ({ user, onSave }) => {
  const [role, setRole] = useState<TeamRole>(user.role);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await onSave(role);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="rounded-lg bg-slate-50 border border-slate-100 p-3">
        {user.name && <p className="text-sm font-bold text-slate-900">{user.name}</p>}
        <p className="text-xs text-slate-500 break-all">{user.email}</p>
        <p className="text-[11px] text-slate-400 mt-1">
          Current role: <span className="font-semibold text-accent-600">{ROLE_LABELS[user.role]}</span>
        </p>
      </div>
      <Field label="New role">
        <RolePicker value={role} onChange={setRole} name="edit-role" />
      </Field>
      <p className="text-[11px] text-slate-400">
        The change applies the next time they sign in and is recorded in Audit Logs.
      </p>
      <button
        type="submit"
        disabled={busy || role === user.role}
        className="w-full bg-accent-500 hover:bg-accent-600 disabled:opacity-60 text-white font-bold text-xs uppercase tracking-wider py-3 rounded-lg inline-flex items-center justify-center gap-2"
      >
        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        {busy ? 'Saving…' : 'Save role'}
      </button>
    </form>
  );
};

const AddUserForm: FC<{ onDone: () => void }> = ({ onDone }) => {
  const showToast = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<TeamRole>('admin');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      showToast('Password must be at least 8 characters.');
      return;
    }
    setBusy(true);
    try {
      await cms.addTeamUser({ email: email.trim(), password, name: name.trim() || undefined, role });
      showToast(`${email.trim()} added as ${ROLE_LABELS[role]}.`);
      onDone();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not add user.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Full name (optional)">
        <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
      </Field>
      <Field label="Email">
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputCls} />
      </Field>
      <Field label="Temporary password (min 8 chars)">
        <input
          type="text"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          autoComplete="new-password"
          className={inputCls}
        />
      </Field>
      <Field label="Role">
        <RolePicker value={role} onChange={setRole} />
      </Field>
      <p className="text-[11px] text-slate-400">
        The account is created pre-confirmed. Share the password securely — they can sign in at
        /login straight away.
      </p>
      <button
        type="submit"
        disabled={busy}
        className="w-full bg-accent-500 hover:bg-accent-600 disabled:opacity-60 text-white font-bold text-xs uppercase tracking-wider py-3 rounded-lg inline-flex items-center justify-center gap-2"
      >
        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
        {busy ? 'Adding…' : 'Add user'}
      </button>
    </form>
  );
};

/* ------------------------------------------------------------------ */
/* Audit Logs — every Console change (System Admin only)               */
/* ------------------------------------------------------------------ */

const ENTITY_LABELS: Record<string, string> = {
  document: 'Document',
  article: 'Article',
  strategy_nav: 'Strategy NAV',
  strategy_performance: 'Performance',
  strategy_note: 'Track Record',
  user: 'User',
};

const ACTION_STYLES: Record<string, string> = {
  create: 'text-emerald-700 bg-emerald-50 border-emerald-100',
  upload: 'text-emerald-700 bg-emerald-50 border-emerald-100',
  update: 'text-ink-700 bg-ink-50 border-ink-100',
  reset: 'text-amber-700 bg-amber-50 border-amber-100',
  delete: 'text-rose-700 bg-rose-50 border-rose-100',
};

const AuditList: FC<{ search: string }> = ({ search }) => {
  const [rows, setRows] = useState<AuditLogEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [entity, setEntity] = useState('all');
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    cms
      .listAuditLogs()
      .then((r) => active && setRows(r))
      .catch((err) => {
        if (!active) return;
        setRows([]);
        setError(err instanceof Error ? err.message : 'Could not load the audit log.');
      });
    return () => {
      active = false;
    };
  }, []);

  const q = search.trim().toLowerCase();
  const filtered = useMemo(
    () =>
      (rows ?? []).filter(
        (r) =>
          (entity === 'all' || r.entity === entity) &&
          (!q ||
            r.summary.toLowerCase().includes(q) ||
            r.actorEmail.toLowerCase().includes(q) ||
            (r.actorName ?? '').toLowerCase().includes(q)),
      ),
    [rows, q, entity],
  );

  return (
    <>
      <div className="px-5 py-3 bg-accent-50/60 border-b border-accent-100 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[11px] text-slate-500">
          Immutable record of every change made from the Console — visible to System Admins only.
        </p>
        <select
          value={entity}
          onChange={(e) => setEntity(e.target.value)}
          aria-label="Filter by area"
          className="bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[11px] font-semibold text-ink-700 focus:outline-none focus:ring-2 focus:ring-accent-500"
        >
          <option value="all">All changes</option>
          {Object.entries(ENTITY_LABELS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
      </div>
      {error && <p className="px-5 py-3 text-xs text-rose-600 bg-rose-50 border-b border-rose-100">{error}</p>}
      {rows === null ? (
        <Empty label="Loading…" />
      ) : filtered.length === 0 ? (
        <Empty label="No changes recorded yet." />
      ) : (
        filtered.map((r) => (
          <div key={r.id} className="px-5 py-3.5 border-b border-slate-100 last:border-0">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider border rounded px-1.5 py-0.5 ${
                      ACTION_STYLES[r.action] ?? ACTION_STYLES.update
                    }`}
                  >
                    {r.action}
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                    {ENTITY_LABELS[r.entity] ?? r.entity}
                  </span>
                </div>
                <p className="font-semibold text-sm text-slate-900 mt-1 leading-snug break-words">{r.summary}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {r.actorName && r.actorName !== r.actorEmail ? `${r.actorName} · ` : ''}
                  {r.actorEmail} · {fmtDateTime(r.createdAt)}
                </p>
                {openId === r.id && r.details && (
                  <pre className="mt-2 text-[10px] leading-relaxed text-slate-600 bg-slate-50 border border-slate-200 rounded-lg p-3 max-w-full whitespace-pre-wrap break-words">
                    {JSON.stringify(r.details, null, 2)}
                  </pre>
                )}
              </div>
              {r.details && (
                <IconBtn onClick={() => setOpenId(openId === r.id ? null : r.id)} title="Details">
                  <ChevronDown className={`w-4 h-4 transition-transform ${openId === r.id ? 'rotate-180' : ''}`} />
                </IconBtn>
              )}
            </div>
          </div>
        ))
      )}
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
