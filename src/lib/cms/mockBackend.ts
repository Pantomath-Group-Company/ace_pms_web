/* ------------------------------------------------------------------ */
/* Mock CMS backend — localStorage + in-memory.                        */
/*                                                                     */
/* This satisfies CmsBackend so the whole app (login, admin uploads,   */
/* Resources / Insights rendering) is fully functional today WITHOUT a */
/* server. Swap it for a Supabase implementation later without         */
/* touching any component — see backend.ts.                            */
/*                                                                     */
/* NOTE: files are held as base64 data URLs in localStorage, which is  */
/* capped at ~5MB by the browser. That's fine for a demo/scaffold;     */
/* large PDFs stay in memory for the session only. Supabase Storage    */
/* removes this limit.                                                 */
/* ------------------------------------------------------------------ */

import { RESOURCES, INSIGHT_PLACEHOLDERS, STRATEGIES } from '../../data/content';
import type {
  CallbackInput,
  CallbackRecord,
  ClientOnboardingInput,
  CmsArticle,
  CmsBackend,
  CmsDocument,
  CmsSession,
  DocCategory,
  NewArticleInput,
  NewDocumentInput,
  UpdateDocumentInput,
  NewStrategyNavInput,
  StrategyNavSeries,
  NewStrategyPerformanceInput,
  StrategyPerformance,
  OnboardingRecord,
  TeamUser,
  TeamRole,
  NewTeamUserInput,
  StrategyNote,
  NewStrategyNoteInput,
  AuditLogEntry,
  NewAuditInput,
} from './types';
import { ROLE_LABELS } from './types';

const strategyName = (id: string) => STRATEGIES.find((s) => s.id === id)?.name ?? id;

const fileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Could not read the file.'));
    reader.readAsDataURL(file);
  });

/** Team accounts recognised by the mock. Domain-restricted, admin-provisioned. */
export const ALLOWED_DOMAIN = 'acm.co.in';
interface MockAccount {
  email: string;
  password: string;
  name: string;
  role: TeamRole;
  createdAt?: string;
}
const SEED_ACCOUNTS: MockAccount[] = [
  { email: `pms@${ALLOWED_DOMAIN}`, password: 'acepms@2026', name: 'PMS Desk', role: 'system_admin' },
  { email: `prathmesh@${ALLOWED_DOMAIN}`, password: 'acepms@2026', name: 'Prathmesh Agrawal', role: 'admin' },
];

/** Shown on the login form so the scaffold is testable. */
export const DEMO_HINT = { email: `pms@${ALLOWED_DOMAIN}`, password: 'acepms@2026' };

/** Demo access code for the mock registration flow. */
export const DEMO_SIGNUP_CODE = 'acepms-team';

const KEYS = {
  session: 'acepms_cms_session',
  docs: 'acepms_cms_documents',
  articles: 'acepms_cms_articles',
  strategyNav: 'acepms_cms_strategy_nav',
  performance: 'acepms_cms_performance',
  notes: 'acepms_cms_strategy_notes',
  accounts: 'acepms_cms_accounts',
  audit: 'acepms_cms_audit',
};

const uid = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.floor(Math.random() * 1e9)}`;

const nowIso = () => new Date().toISOString();

function read<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    // Quota exceeded (large data URLs) — keep in-memory for the session.
    return false;
  }
}

/* ---------------- Seeds from the original static content ---------------- */

function seedDocuments(): CmsDocument[] {
  const docs: CmsDocument[] = [];
  for (const group of RESOURCES.groups) {
    for (const title of group.items) {
      docs.push({
        id: uid(),
        title,
        category: group.title as DocCategory,
        uploadedBy: 'System',
        uploadedAt: nowIso(),
        seeded: true,
      });
    }
  }
  return docs;
}

function seedArticles(): CmsArticle[] {
  return INSIGHT_PLACEHOLDERS.map((a) => ({
    id: uid(),
    kind: 'Article' as const,
    category: a.category,
    title: a.title,
    summary: a.summary,
    readTime: a.readTime,
    publishedBy: 'ACE PMS Desk',
    publishedAt: nowIso(),
    seeded: true,
  }));
}

/* ---------------- Backend implementation ---------------- */

class MockBackend implements CmsBackend {
  readonly mode = 'mock' as const;

  private session: CmsSession | null;
  private documents: CmsDocument[];
  private articles: CmsArticle[];
  private strategyNav: StrategyNavSeries[];
  private performance: StrategyPerformance[];
  private strategyNotes: StrategyNote[];
  private accounts: MockAccount[];
  private listeners = new Set<() => void>();

  constructor() {
    this.accounts = read<MockAccount[]>(KEYS.accounts) ?? SEED_ACCOUNTS.map((a) => ({ ...a }));
    const stored = read<CmsSession>(KEYS.session);
    // Sessions saved before roles existed: re-derive the role from the account.
    this.session = stored
      ? {
          ...stored,
          user: {
            ...stored.user,
            role: this.accounts.find((a) => a.email === stored.user.email)?.role ?? 'admin',
          },
        }
      : null;
    this.documents = read<CmsDocument[]>(KEYS.docs) ?? seedDocuments();
    this.articles = read<CmsArticle[]>(KEYS.articles) ?? seedArticles();
    this.strategyNav = read<StrategyNavSeries[]>(KEYS.strategyNav) ?? [];
    this.performance = read<StrategyPerformance[]>(KEYS.performance) ?? [];
    this.strategyNotes = read<StrategyNote[]>(KEYS.notes) ?? [];
    // Persist initial seeds so refreshes are stable.
    if (!read(KEYS.docs)) write(KEYS.docs, this.documents);
    if (!read(KEYS.articles)) write(KEYS.articles, this.articles);
    if (!read(KEYS.accounts)) write(KEYS.accounts, this.accounts);
  }

  private saveAccounts() {
    write(KEYS.accounts, this.accounts);
  }

  private startSession(account: MockAccount): CmsSession {
    const session: CmsSession = {
      user: { id: account.email, email: account.email, name: account.name, role: account.role },
      token: `mock-${uid()}`,
    };
    this.session = session;
    write(KEYS.session, session);
    this.emit();
    return session;
  }

  /** Append an entry to the local audit log (newest first, capped). */
  private audit(entry: NewAuditInput) {
    const u = this.session?.user;
    if (!u) return;
    const log = read<AuditLogEntry[]>(KEYS.audit) ?? [];
    const row: AuditLogEntry = {
      id: uid(),
      actorId: u.id,
      actorEmail: u.email,
      actorName: u.name,
      ...entry,
      createdAt: nowIso(),
    };
    write(KEYS.audit, [row, ...log].slice(0, 1000));
  }

  private requireSystemAdmin() {
    if (this.session?.user.role !== 'system_admin') {
      throw new Error('Only a System Admin can do this.');
    }
  }

  private emit() {
    this.listeners.forEach((cb) => cb());
  }

  subscribe(cb: () => void) {
    this.listeners.add(cb);
    return () => {
      this.listeners.delete(cb);
    };
  }

  /* ---- auth ---- */

  getSession() {
    return this.session;
  }

  async signIn(email: string, password: string): Promise<CmsSession> {
    const normalized = email.trim().toLowerCase();
    const known = this.accounts.some((a) => a.email === normalized);
    // Accounts created from the Console (or registered) may use any domain.
    if (!known && !normalized.endsWith(`@${ALLOWED_DOMAIN}`)) {
      throw new Error(`Use your @${ALLOWED_DOMAIN} company email address.`);
    }
    const account = this.accounts.find((a) => a.email === normalized && a.password === password);
    if (!account) {
      throw new Error('Incorrect email or password.');
    }
    return this.startSession(account);
  }

  async registerTeamMember(email: string, password: string, code: string) {
    if (code.trim() !== DEMO_SIGNUP_CODE) throw new Error('Invalid team access code.');
    if (password.length < 8) throw new Error('Password must be at least 8 characters.');
    const normalized = email.trim().toLowerCase();
    if (this.accounts.some((a) => a.email === normalized)) {
      throw new Error('An account with this email already exists — sign in instead.');
    }
    // Self-registered accounts are plain Admins (content only).
    const account: MockAccount = {
      email: normalized,
      password,
      name: normalized.split('@')[0],
      role: 'admin',
      createdAt: nowIso(),
    };
    this.accounts.push(account);
    this.saveAccounts();
    this.startSession(account);
  }

  async signOut() {
    this.session = null;
    try {
      localStorage.removeItem(KEYS.session);
    } catch {
      /* ignore */
    }
    this.emit();
  }

  /* ---- documents ---- */

  listDocuments() {
    return this.documents;
  }

  async addDocument(input: NewDocumentInput): Promise<CmsDocument> {
    const fileUrl = input.file ? await fileToDataUrl(input.file) : undefined;
    const doc: CmsDocument = {
      id: uid(),
      title: input.title,
      category: input.category,
      strategy: input.strategy,
      fileName: input.file?.name,
      fileType: input.file?.type || undefined,
      fileUrl,
      uploadedBy: this.session?.user.name ?? 'Unknown',
      uploadedAt: nowIso(),
    };
    this.documents = [doc, ...this.documents];
    const ok = write(KEYS.docs, this.documents);
    if (!ok && fileUrl) {
      // Couldn't persist the file across refreshes — flag it, keep in memory.
      doc.fileName = doc.fileName ? `${doc.fileName} (session only)` : doc.fileName;
    }
    this.audit({
      action: 'create',
      entity: 'document',
      entityId: doc.id,
      summary: `Published "${doc.title}" in ${doc.category}`,
      details: { title: doc.title, category: doc.category, strategy: doc.strategy, fileName: input.file?.name },
    });
    this.emit();
    return doc;
  }

  async updateDocument(input: UpdateDocumentInput): Promise<CmsDocument> {
    const current = this.documents.find((d) => d.id === input.id);
    if (!current) throw new Error('Document not found.');
    const fileUrl = input.file ? await fileToDataUrl(input.file) : current.fileUrl;
    const updated: CmsDocument = {
      ...current,
      title: input.title,
      strategy: input.strategy,
      fileName: input.file?.name ?? current.fileName,
      fileType: input.file ? input.file.type || undefined : current.fileType,
      fileUrl,
      // Once a real file is attached, it's no longer a bare placeholder seed.
      seeded: input.file ? false : current.seeded,
    };
    this.documents = this.documents.map((d) => (d.id === input.id ? updated : d));
    write(KEYS.docs, this.documents);
    this.audit({
      action: 'update',
      entity: 'document',
      entityId: input.id,
      summary: `Edited "${input.title}"${input.file ? ' (file replaced)' : ''}`,
      details: {
        before: { title: current.title, strategy: current.strategy, fileName: current.fileName },
        after: { title: updated.title, strategy: updated.strategy, fileName: updated.fileName },
      },
    });
    this.emit();
    return updated;
  }

  async deleteDocument(id: string) {
    const doc = this.documents.find((d) => d.id === id);
    this.documents = this.documents.filter((d) => d.id !== id);
    write(KEYS.docs, this.documents);
    this.audit({
      action: 'delete',
      entity: 'document',
      entityId: id,
      summary: `Deleted "${doc?.title ?? id}"${doc ? ` from ${doc.category}` : ''}`,
      details: doc ? { title: doc.title, category: doc.category, fileName: doc.fileName } : undefined,
    });
    this.emit();
  }

  /* ---- articles ---- */

  listArticles() {
    return this.articles;
  }

  async addArticle(input: NewArticleInput): Promise<CmsArticle> {
    const article: CmsArticle = {
      id: uid(),
      kind: input.kind,
      category: input.category,
      title: input.title,
      summary: input.summary,
      body: input.body,
      readTime: input.readTime,
      coverUrl: input.coverUrl,
      link: input.link,
      publishedBy: this.session?.user.name ?? 'ACE PMS Desk',
      publishedAt: nowIso(),
    };
    this.articles = [article, ...this.articles];
    write(KEYS.articles, this.articles);
    this.audit({
      action: 'create',
      entity: 'article',
      entityId: article.id,
      summary: `Published ${input.kind.toLowerCase()} "${input.title}"`,
      details: { kind: input.kind, category: input.category, title: input.title },
    });
    this.emit();
    return article;
  }

  async deleteArticle(id: string) {
    const art = this.articles.find((a) => a.id === id);
    this.articles = this.articles.filter((a) => a.id !== id);
    write(KEYS.articles, this.articles);
    this.audit({
      action: 'delete',
      entity: 'article',
      entityId: id,
      summary: `Deleted article "${art?.title ?? id}"`,
      details: art ? { kind: art.kind, category: art.category, title: art.title } : undefined,
    });
    this.emit();
  }

  /* ---- strategy NAV ---- */

  listStrategyNav() {
    return this.strategyNav;
  }

  async saveStrategyNav(input: NewStrategyNavInput): Promise<StrategyNavSeries> {
    const series: StrategyNavSeries = {
      ...input,
      uploadedBy: this.session?.user.name ?? 'Team',
      uploadedAt: nowIso(),
    };
    // One series per strategy — replace any existing one.
    this.strategyNav = [series, ...this.strategyNav.filter((s) => s.strategyId !== input.strategyId)];
    write(KEYS.strategyNav, this.strategyNav);
    this.audit({
      action: 'upload',
      entity: 'strategy_nav',
      entityId: input.strategyId,
      summary: `Uploaded NAV series for ${strategyName(input.strategyId)} (${input.labels[0]} – ${input.labels[input.labels.length - 1]})`,
      details: { since: input.since, asOf: input.asOf, months: input.labels.length },
    });
    this.emit();
    return series;
  }

  async deleteStrategyNav(strategyId: string) {
    this.strategyNav = this.strategyNav.filter((s) => s.strategyId !== strategyId);
    write(KEYS.strategyNav, this.strategyNav);
    this.audit({
      action: 'reset',
      entity: 'strategy_nav',
      entityId: strategyId,
      summary: `Reset NAV series for ${strategyName(strategyId)} to built-in data`,
    });
    this.emit();
  }

  /* ---- strategy performance (horizon returns) ---- */

  listPerformance() {
    return this.performance;
  }

  async savePerformance(input: NewStrategyPerformanceInput): Promise<StrategyPerformance> {
    const before = this.performance.find((p) => p.strategyId === input.strategyId);
    const row: StrategyPerformance = {
      ...input,
      uploadedBy: this.session?.user.name ?? 'Team',
      uploadedAt: nowIso(),
    };
    this.performance = [row, ...this.performance.filter((p) => p.strategyId !== input.strategyId)];
    write(KEYS.performance, this.performance);
    this.audit({
      action: 'upload',
      entity: 'strategy_performance',
      entityId: input.strategyId,
      summary: `Uploaded horizon returns for ${strategyName(input.strategyId)}`,
      details: {
        before: before ? { portfolio: before.portfolio, benchmark: before.benchmark } : undefined,
        after: { portfolio: input.portfolio, benchmark: input.benchmark },
      },
    });
    this.emit();
    return row;
  }

  async deletePerformance(strategyId: string) {
    this.performance = this.performance.filter((p) => p.strategyId !== strategyId);
    write(KEYS.performance, this.performance);
    this.audit({
      action: 'reset',
      entity: 'strategy_performance',
      entityId: strategyId,
      summary: `Reset horizon returns for ${strategyName(strategyId)} to built-in figures`,
    });
    this.emit();
  }

  /* ---- strategy notes (track-record banner) ---- */

  listStrategyNotes() {
    return this.strategyNotes;
  }

  async saveStrategyNote(input: NewStrategyNoteInput): Promise<StrategyNote> {
    const before = this.strategyNotes.find((n) => n.strategyId === input.strategyId);
    const note: StrategyNote = {
      ...input,
      updatedBy: this.session?.user.name ?? 'Team',
      updatedAt: nowIso(),
    };
    this.strategyNotes = [note, ...this.strategyNotes.filter((n) => n.strategyId !== input.strategyId)];
    write(KEYS.notes, this.strategyNotes);
    this.audit({
      action: 'update',
      entity: 'strategy_note',
      entityId: input.strategyId,
      summary: `Updated track-record note for ${strategyName(input.strategyId)}`,
      details: { before: before?.trackRecord, after: input.trackRecord },
    });
    this.emit();
    return note;
  }

  async deleteStrategyNote(strategyId: string) {
    const before = this.strategyNotes.find((n) => n.strategyId === strategyId);
    this.strategyNotes = this.strategyNotes.filter((n) => n.strategyId !== strategyId);
    write(KEYS.notes, this.strategyNotes);
    this.audit({
      action: 'reset',
      entity: 'strategy_note',
      entityId: strategyId,
      summary: `Reset track-record note for ${strategyName(strategyId)} to built-in text`,
      details: { before: before?.trackRecord },
    });
    this.emit();
  }

  /* ---- onboarding ---- */

  async submitOnboarding(input: ClientOnboardingInput) {
    // Mock: record metadata locally so the flow is testable without a server.
    const existing = read<unknown[]>('acepms_cms_onboarding') ?? [];
    const record = {
      id: uid(),
      fullName: input.fullName,
      email: input.email,
      mobile: input.mobile,
      pan: input.pan,
      notes: input.notes,
      documents: input.files.map((f) => ({ key: f.key, label: f.label, fileName: f.file.name })),
      submittedAt: nowIso(),
    };
    write('acepms_cms_onboarding', [record, ...existing]);
    // No email is sent in mock mode.
  }

  async submitCallback(input: CallbackInput) {
    const existing = read<CallbackRecord[]>('acepms_cms_callbacks') ?? [];
    const record: CallbackRecord = { id: uid(), ...input, createdAt: nowIso() };
    write('acepms_cms_callbacks', [record, ...existing]);
  }

  async listCallbacks(): Promise<CallbackRecord[]> {
    return read<CallbackRecord[]>('acepms_cms_callbacks') ?? [];
  }

  async listOnboarding(): Promise<OnboardingRecord[]> {
    const rows = read<any[]>('acepms_cms_onboarding') ?? [];
    return rows.map((r) => ({
      id: r.id,
      fullName: r.fullName,
      email: r.email,
      mobile: r.mobile,
      pan: r.pan,
      notes: r.notes,
      status: r.status ?? 'new',
      createdAt: r.submittedAt ?? nowIso(),
      documents: r.documents ?? [],
    }));
  }

  async signOnboardingFile(): Promise<string | null> {
    return null; // no real storage in mock mode
  }

  /* ---- team users (System Admin) ---- */

  async listTeamUsers(): Promise<TeamUser[]> {
    this.requireSystemAdmin();
    return this.accounts.map((a) => ({
      id: a.email,
      email: a.email,
      name: a.name,
      role: a.role,
      createdAt: a.createdAt,
    }));
  }

  async addTeamUser(input: NewTeamUserInput) {
    this.requireSystemAdmin();
    const email = input.email.trim().toLowerCase();
    if (!email || !input.password) throw new Error('Email and password are required.');
    if (input.password.length < 8) throw new Error('Password must be at least 8 characters.');
    if (this.accounts.some((a) => a.email === email)) {
      throw new Error('A user with this email already exists.');
    }
    const name = input.name?.trim() || email.split('@')[0];
    this.accounts.push({ email, password: input.password, name, role: input.role, createdAt: nowIso() });
    this.saveAccounts();
    this.audit({
      action: 'create',
      entity: 'user',
      entityId: email,
      summary: `Added user ${email} as ${ROLE_LABELS[input.role]}`,
      details: { email, name, role: input.role },
    });
    this.emit();
  }

  async removeTeamUser(id: string) {
    this.requireSystemAdmin();
    if (id === this.session?.user.id) throw new Error('You cannot remove your own account.');
    const target = this.accounts.find((a) => a.email === id);
    if (!target) throw new Error('User not found.');
    const systemAdmins = this.accounts.filter((a) => a.role === 'system_admin');
    if (target.role === 'system_admin' && systemAdmins.length <= 1) {
      throw new Error('Cannot remove the last System Admin.');
    }
    this.accounts = this.accounts.filter((a) => a.email !== id);
    this.saveAccounts();
    this.audit({
      action: 'delete',
      entity: 'user',
      entityId: id,
      summary: `Removed user ${target.email}`,
      details: { email: target.email, role: target.role },
    });
    this.emit();
  }

  async setTeamUserRole(id: string, role: TeamRole) {
    this.requireSystemAdmin();
    if (id === this.session?.user.id) throw new Error('You cannot change your own role.');
    const target = this.accounts.find((a) => a.email === id);
    if (!target) throw new Error('User not found.');
    const from = target.role;
    if (from === role) return;
    if (from === 'system_admin' && this.accounts.filter((a) => a.role === 'system_admin').length <= 1) {
      throw new Error('Cannot demote the last System Admin.');
    }
    target.role = role;
    this.saveAccounts();
    this.audit({
      action: 'update',
      entity: 'user',
      entityId: id,
      summary: `Changed ${target.email} from ${ROLE_LABELS[from]} to ${ROLE_LABELS[role]}`,
      details: { email: target.email, from, to: role },
    });
    this.emit();
  }

  /* ---- audit log (System Admin) ---- */

  async listAuditLogs(): Promise<AuditLogEntry[]> {
    this.requireSystemAdmin();
    return read<AuditLogEntry[]>(KEYS.audit) ?? [];
  }
}

export const mockBackend = new MockBackend();
