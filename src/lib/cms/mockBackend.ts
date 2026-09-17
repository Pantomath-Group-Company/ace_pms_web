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

import { RESOURCES, INSIGHT_PLACEHOLDERS } from '../../data/content';
import type {
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
  OnboardingRecord,
  TeamUser,
} from './types';

const fileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Could not read the file.'));
    reader.readAsDataURL(file);
  });

/** Team accounts recognised by the mock. Domain-restricted, admin-provisioned. */
export const ALLOWED_DOMAIN = 'acm.co.in';
const ACCOUNTS: Array<{ email: string; password: string; name: string }> = [
  { email: `pms@${ALLOWED_DOMAIN}`, password: 'acepms@2026', name: 'PMS Desk' },
  { email: `prathmesh@${ALLOWED_DOMAIN}`, password: 'acepms@2026', name: 'Prathmesh Agrawal' },
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
  private listeners = new Set<() => void>();

  constructor() {
    this.session = read<CmsSession>(KEYS.session);
    this.documents = read<CmsDocument[]>(KEYS.docs) ?? seedDocuments();
    this.articles = read<CmsArticle[]>(KEYS.articles) ?? seedArticles();
    this.strategyNav = read<StrategyNavSeries[]>(KEYS.strategyNav) ?? [];
    // Persist initial seeds so refreshes are stable.
    if (!read(KEYS.docs)) write(KEYS.docs, this.documents);
    if (!read(KEYS.articles)) write(KEYS.articles, this.articles);
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
    if (!normalized.endsWith(`@${ALLOWED_DOMAIN}`)) {
      throw new Error(`Use your @${ALLOWED_DOMAIN} company email address.`);
    }
    const account = ACCOUNTS.find((a) => a.email === normalized && a.password === password);
    if (!account) {
      throw new Error('Incorrect email or password.');
    }
    const session: CmsSession = {
      user: { id: uid(), email: account.email, name: account.name },
      token: `mock-${uid()}`,
    };
    this.session = session;
    write(KEYS.session, session);
    this.emit();
    return session;
  }

  async registerTeamMember(email: string, password: string, code: string) {
    if (code.trim() !== DEMO_SIGNUP_CODE) throw new Error('Invalid team access code.');
    if (password.length < 8) throw new Error('Password must be at least 8 characters.');
    const normalized = email.trim().toLowerCase();
    if (!ACCOUNTS.some((a) => a.email === normalized)) {
      ACCOUNTS.push({ email: normalized, password, name: normalized.split('@')[0] });
    }
    // Register grants access with any email (no domain check), unlike the demo sign-in.
    const session: CmsSession = {
      user: { id: uid(), email: normalized, name: normalized.split('@')[0] },
      token: `mock-${uid()}`,
    };
    this.session = session;
    write(KEYS.session, session);
    this.emit();
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
    this.emit();
    return updated;
  }

  async deleteDocument(id: string) {
    this.documents = this.documents.filter((d) => d.id !== id);
    write(KEYS.docs, this.documents);
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
    this.emit();
    return article;
  }

  async deleteArticle(id: string) {
    this.articles = this.articles.filter((a) => a.id !== id);
    write(KEYS.articles, this.articles);
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
    this.emit();
    return series;
  }

  async deleteStrategyNav(strategyId: string) {
    this.strategyNav = this.strategyNav.filter((s) => s.strategyId !== strategyId);
    write(KEYS.strategyNav, this.strategyNav);
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

  async listTeamUsers(): Promise<TeamUser[]> {
    return ACCOUNTS.map((a) => ({ id: a.email, email: a.email }));
  }
}

export const mockBackend = new MockBackend();
