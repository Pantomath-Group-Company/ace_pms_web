/* ------------------------------------------------------------------ */
/* Supabase CMS backend — real auth, Postgres tables, Storage.         */
/*                                                                     */
/* Satisfies the same CmsBackend interface as the mock, so no          */
/* component changes are needed. Read methods return in-memory caches  */
/* that are refreshed on load and after each mutation (and pushed to   */
/* React via subscribe()).                                             */
/*                                                                     */
/* Requires the schema in supabase/schema.sql to be applied first.     */
/* ------------------------------------------------------------------ */

import { supabase, BUCKETS } from './supabaseClient';
import { REDIRECT_EMAIL } from './config';
import type {
  ClientOnboardingInput,
  CmsArticle,
  CmsBackend,
  CmsDocument,
  CmsSession,
  NewArticleInput,
  NewDocumentInput,
  UpdateDocumentInput,
  NewStrategyNavInput,
  StrategyNavSeries,
  NewStrategyPerformanceInput,
  StrategyPerformance,
  OnboardingRecord,
  TeamUser,
} from './types';

/* eslint-disable @typescript-eslint/no-explicit-any */

const uid = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.floor(Math.random() * 1e9)}`;

const safeName = (name: string) => name.replace(/[^a-zA-Z0-9._-]/g, '_');

function mapSession(session: any): CmsSession | null {
  if (!session?.user) return null;
  const u = session.user;
  return {
    user: {
      id: u.id,
      email: u.email ?? '',
      name: u.user_metadata?.full_name || u.user_metadata?.name || u.email || 'Team member',
    },
    token: session.access_token,
  };
}

function mapDocument(row: any): CmsDocument {
  const fileUrl = row.file_path
    ? supabase.storage.from(BUCKETS.documents).getPublicUrl(row.file_path).data.publicUrl
    : undefined;
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    strategy: row.strategy ?? undefined,
    fileName: row.file_name ?? undefined,
    fileType: row.file_type ?? undefined,
    fileUrl,
    uploadedBy: row.uploaded_by ?? 'Team',
    uploadedAt: row.created_at,
    seeded: row.seeded ?? false,
  };
}

function mapArticle(row: any): CmsArticle {
  return {
    id: row.id,
    kind: row.kind,
    category: row.category,
    title: row.title,
    summary: row.summary,
    body: row.body ?? undefined,
    readTime: row.read_time ?? undefined,
    link: row.link ?? undefined,
    publishedBy: row.published_by ?? 'ACE PMS Desk',
    publishedAt: row.created_at,
    seeded: row.seeded ?? false,
  };
}

function mapStrategyNav(row: any): StrategyNavSeries {
  return {
    strategyId: row.strategy_id,
    since: row.since,
    asOf: row.as_of,
    labels: Array.isArray(row.labels) ? row.labels : [],
    points: Array.isArray(row.points) ? row.points : [],
    uploadedBy: row.uploaded_by ?? 'Team',
    uploadedAt: row.updated_at ?? row.created_at,
  };
}

function mapPerformance(row: any): StrategyPerformance {
  return {
    strategyId: row.strategy_id,
    portfolio: Array.isArray(row.portfolio) ? row.portfolio : [],
    benchmark: Array.isArray(row.benchmark) ? row.benchmark : [],
    uploadedBy: row.uploaded_by ?? 'Team',
    uploadedAt: row.updated_at ?? row.created_at,
  };
}

class SupabaseBackend implements CmsBackend {
  readonly mode = 'supabase' as const;

  private session: CmsSession | null = null;
  private documents: CmsDocument[] = [];
  private articles: CmsArticle[] = [];
  private strategyNav: StrategyNavSeries[] = [];
  private performance: StrategyPerformance[] = [];
  private listeners = new Set<() => void>();

  constructor() {
    supabase.auth.getSession().then(({ data }) => {
      this.session = mapSession(data.session);
      this.emit();
    });
    supabase.auth.onAuthStateChange((_event, session) => {
      this.session = mapSession(session);
      this.emit();
    });
    void this.refreshDocuments();
    void this.refreshArticles();
    void this.refreshStrategyNav();
    void this.refreshPerformance();
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

  private async refreshDocuments() {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) {
      this.documents = data.map(mapDocument);
      this.emit();
    }
  }

  private async refreshArticles() {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) {
      this.articles = data.map(mapArticle);
      this.emit();
    }
  }

  private async refreshStrategyNav() {
    const { data, error } = await supabase
      .from('strategy_nav')
      .select('*')
      .order('updated_at', { ascending: false });
    if (!error && data) {
      this.strategyNav = data.map(mapStrategyNav);
      this.emit();
    }
  }

  private async refreshPerformance() {
    const { data, error } = await supabase
      .from('strategy_performance')
      .select('*')
      .order('updated_at', { ascending: false });
    if (!error && data) {
      this.performance = data.map(mapPerformance);
      this.emit();
    }
  }

  /* ---- auth ---- */

  getSession() {
    return this.session;
  }

  async signIn(email: string, password: string): Promise<CmsSession> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) throw new Error(error.message);
    const session = mapSession(data.session);
    if (!session) throw new Error('Sign-in failed — no session returned.');
    this.session = session;
    this.emit();
    return session;
  }

  async registerTeamMember(email: string, password: string, code: string) {
    const { data, error } = await supabase.functions.invoke('team-signup', {
      body: { email: email.trim(), password, code },
    });
    if (error) {
      throw new Error('Sign-up service is unavailable — deploy the team-signup function.');
    }
    if (!data?.ok) {
      throw new Error(data?.error || 'Sign-up failed.');
    }
    await this.signIn(email, password);
  }

  async signOut() {
    await supabase.auth.signOut();
    this.session = null;
    this.emit();
  }

  /* ---- documents ---- */

  listDocuments() {
    return this.documents;
  }

  async addDocument(input: NewDocumentInput): Promise<CmsDocument> {
    let filePath: string | undefined;
    let fileName: string | undefined;
    let fileType: string | undefined;

    if (input.file) {
      fileName = input.file.name;
      fileType = input.file.type || 'application/octet-stream';
      filePath = `docs/${uid()}-${safeName(input.file.name)}`;
      const { error: upErr } = await supabase.storage
        .from(BUCKETS.documents)
        .upload(filePath, input.file, { upsert: false, contentType: fileType });
      if (upErr) throw new Error(`Upload failed: ${upErr.message}`);
    }

    const { data, error } = await supabase
      .from('documents')
      .insert({
        title: input.title,
        category: input.category,
        strategy: input.strategy ?? null,
        file_path: filePath ?? null,
        file_name: fileName ?? null,
        file_type: fileType ?? null,
        uploaded_by: this.session?.user.name ?? 'Team',
      })
      .select()
      .single();
    if (error) throw new Error(error.message);

    await this.refreshDocuments();
    return mapDocument(data);
  }

  async updateDocument(input: UpdateDocumentInput): Promise<CmsDocument> {
    const current = this.documents.find((d) => d.id === input.id);
    const patch: any = {
      title: input.title,
      strategy: input.strategy ?? null,
    };

    let oldPath: string | undefined;
    if (input.file) {
      const fileType = input.file.type || 'application/octet-stream';
      const filePath = `docs/${uid()}-${safeName(input.file.name)}`;
      const { error: upErr } = await supabase.storage
        .from(BUCKETS.documents)
        .upload(filePath, input.file, { upsert: false, contentType: fileType });
      if (upErr) throw new Error(`Upload failed: ${upErr.message}`);
      patch.file_path = filePath;
      patch.file_name = input.file.name;
      patch.file_type = fileType;
      // Remember the previous file so we can clean it up after the row updates.
      if (current?.fileUrl) {
        const marker = `/${BUCKETS.documents}/`;
        const idx = current.fileUrl.indexOf(marker);
        if (idx >= 0) oldPath = decodeURIComponent(current.fileUrl.slice(idx + marker.length));
      }
    }

    const { data, error } = await supabase
      .from('documents')
      .update(patch)
      .eq('id', input.id)
      .select()
      .single();
    if (error) throw new Error(error.message);

    if (oldPath) {
      await supabase.storage.from(BUCKETS.documents).remove([oldPath]);
    }

    await this.refreshDocuments();
    return mapDocument(data);
  }

  async deleteDocument(id: string) {
    const doc = this.documents.find((d) => d.id === id);
    const { error } = await supabase.from('documents').delete().eq('id', id);
    if (error) throw new Error(error.message);
    // Best-effort storage cleanup (derive path from public URL).
    if (doc?.fileUrl) {
      const marker = `/${BUCKETS.documents}/`;
      const idx = doc.fileUrl.indexOf(marker);
      if (idx >= 0) {
        const path = decodeURIComponent(doc.fileUrl.slice(idx + marker.length));
        await supabase.storage.from(BUCKETS.documents).remove([path]);
      }
    }
    await this.refreshDocuments();
  }

  /* ---- articles ---- */

  listArticles() {
    return this.articles;
  }

  async addArticle(input: NewArticleInput): Promise<CmsArticle> {
    const { data, error } = await supabase
      .from('articles')
      .insert({
        kind: input.kind,
        category: input.category,
        title: input.title,
        summary: input.summary,
        body: input.body ?? null,
        read_time: input.readTime ?? null,
        link: input.link ?? null,
        published_by: this.session?.user.name ?? 'ACE PMS Desk',
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    await this.refreshArticles();
    return mapArticle(data);
  }

  async deleteArticle(id: string) {
    const { error } = await supabase.from('articles').delete().eq('id', id);
    if (error) throw new Error(error.message);
    await this.refreshArticles();
  }

  /* ---- strategy NAV ---- */

  listStrategyNav() {
    return this.strategyNav;
  }

  async saveStrategyNav(input: NewStrategyNavInput): Promise<StrategyNavSeries> {
    // One row per strategy — upsert on the strategy_id unique key.
    const { data, error } = await supabase
      .from('strategy_nav')
      .upsert(
        {
          strategy_id: input.strategyId,
          since: input.since,
          as_of: input.asOf,
          labels: input.labels,
          points: input.points,
          uploaded_by: this.session?.user.name ?? 'Team',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'strategy_id' },
      )
      .select()
      .single();
    if (error) throw new Error(error.message);
    await this.refreshStrategyNav();
    return mapStrategyNav(data);
  }

  async deleteStrategyNav(strategyId: string) {
    const { error } = await supabase.from('strategy_nav').delete().eq('strategy_id', strategyId);
    if (error) throw new Error(error.message);
    await this.refreshStrategyNav();
  }

  /* ---- strategy performance (horizon returns) ---- */

  listPerformance() {
    return this.performance;
  }

  async savePerformance(input: NewStrategyPerformanceInput): Promise<StrategyPerformance> {
    const { data, error } = await supabase
      .from('strategy_performance')
      .upsert(
        {
          strategy_id: input.strategyId,
          portfolio: input.portfolio,
          benchmark: input.benchmark,
          uploaded_by: this.session?.user.name ?? 'Team',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'strategy_id' },
      )
      .select()
      .single();
    if (error) throw new Error(error.message);
    await this.refreshPerformance();
    return mapPerformance(data);
  }

  async deletePerformance(strategyId: string) {
    const { error } = await supabase
      .from('strategy_performance')
      .delete()
      .eq('strategy_id', strategyId);
    if (error) throw new Error(error.message);
    await this.refreshPerformance();
  }

  /* ---- onboarding ---- */

  async submitOnboarding(input: ClientOnboardingInput) {
    const folder = `${safeName(input.pan || input.fullName || 'client')}-${uid()}`;
    const documents: Array<{ key: string; label: string; path: string; fileName: string }> = [];

    for (const item of input.files) {
      const path = `${folder}/${item.key}-${safeName(item.file.name)}`;
      const { error: upErr } = await supabase.storage
        .from(BUCKETS.onboarding)
        .upload(path, item.file, { upsert: false, contentType: item.file.type || undefined });
      if (upErr) throw new Error(`Could not upload ${item.label}: ${upErr.message}`);
      documents.push({ key: item.key, label: item.label, path, fileName: item.file.name });
    }

    const { error } = await supabase.from('client_onboarding').insert({
      full_name: input.fullName,
      email: input.email,
      mobile: input.mobile,
      pan: input.pan,
      notes: input.notes ?? null,
      documents,
    });
    if (error) throw new Error(error.message);

    // Fire the email notification. Non-fatal: the record is already stored.
    try {
      await supabase.functions.invoke('notify', {
        body: {
          type: 'client_onboarding',
          to: REDIRECT_EMAIL,
          submission: {
            fullName: input.fullName,
            email: input.email,
            mobile: input.mobile,
            pan: input.pan,
            notes: input.notes,
            documents: documents.map((d) => ({ label: d.label, fileName: d.fileName })),
          },
        },
      });
    } catch {
      /* Edge function not deployed yet — submission is safe in the DB. */
    }
  }

  async listOnboarding(): Promise<OnboardingRecord[]> {
    const { data, error } = await supabase
      .from('client_onboarding')
      .select('*')
      .order('created_at', { ascending: false });
    if (error || !data) return [];
    return data.map((r: any) => ({
      id: r.id,
      fullName: r.full_name,
      email: r.email,
      mobile: r.mobile,
      pan: r.pan,
      notes: r.notes ?? undefined,
      status: r.status ?? 'new',
      createdAt: r.created_at,
      documents: Array.isArray(r.documents) ? r.documents : [],
    }));
  }

  async signOnboardingFile(path: string): Promise<string | null> {
    const { data, error } = await supabase.storage
      .from(BUCKETS.onboarding)
      .createSignedUrl(path, 3600);
    if (error || !data) return null;
    return data.signedUrl;
  }

  async listTeamUsers(): Promise<TeamUser[]> {
    // Listing auth users requires service_role, so it runs in an Edge Function.
    try {
      const { data, error } = await supabase.functions.invoke('team-users');
      if (error || !data?.users) throw error ?? new Error('no users');
      return (data.users as any[]).map((u) => ({
        id: u.id,
        email: u.email,
        createdAt: u.created_at,
        lastSignInAt: u.last_sign_in_at,
      }));
    } catch {
      // Fallback: at least show the current user until the function is deployed.
      const u = this.session?.user;
      return u ? [{ id: u.id, email: u.email }] : [];
    }
  }
}

export const supabaseBackend = new SupabaseBackend();
