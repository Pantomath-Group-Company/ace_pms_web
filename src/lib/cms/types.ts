/* ------------------------------------------------------------------ */
/* CMS domain types — shared by every backend implementation.          */
/* The mock (localStorage) backend and the future Supabase backend     */
/* both satisfy the CmsBackend interface, so swapping is a one-line     */
/* change in backend.ts.                                               */
/* ------------------------------------------------------------------ */

export const DOC_CATEGORIES = [
  'Product decks',
  'Monthly factsheets',
  'Compliance & disclosures',
  'Forms',
] as const;

export type DocCategory = (typeof DOC_CATEGORIES)[number];

export const ARTICLE_KINDS = ['Article', 'Blog', 'Media'] as const;
export type ArticleKind = (typeof ARTICLE_KINDS)[number];

/** A signed-in internal PMS team member. */
export interface CmsUser {
  id: string;
  email: string;
  name: string;
}

export interface CmsSession {
  user: CmsUser;
  /** Opaque token — a fake JWT in mock mode, a real Supabase access token later. */
  token: string;
}

/** A downloadable document surfaced on the Resources page. */
export interface CmsDocument {
  id: string;
  title: string;
  category: DocCategory;
  /** Optional strategy tag (e.g. "ACE Multicap") for factsheets/decks. */
  strategy?: string;
  fileName?: string;
  fileType?: string;
  /**
   * In mock mode this is a base64 data URL held in localStorage.
   * In Supabase mode it becomes a Storage public/signed URL.
   */
  fileUrl?: string;
  uploadedBy: string;
  uploadedAt: string; // ISO timestamp
  /** Seeded placeholder from the original site copy (no real file attached). */
  seeded?: boolean;
}

/** An article / blog / media item surfaced on the Insights page. */
export interface CmsArticle {
  id: string;
  kind: ArticleKind;
  category: string; // e.g. "Strategy commentary", "In the media"
  title: string;
  summary: string;
  body?: string;
  readTime?: string;
  coverUrl?: string;
  /** External link for press/media items. */
  link?: string;
  publishedBy: string;
  publishedAt: string; // ISO timestamp
  seeded?: boolean;
}

export interface NewDocumentInput {
  title: string;
  category: DocCategory;
  strategy?: string;
  /** The chosen file — mock reads it to a data URL, Supabase streams to Storage. */
  file?: File;
}

/** Edit an existing document (Console). Category is fixed; file is optional. */
export interface UpdateDocumentInput {
  id: string;
  title: string;
  strategy?: string;
  /** A replacement file. When omitted the existing file (if any) is kept. */
  file?: File;
}

/** The six KYC documents required to onboard an individual client. */
export const ONBOARDING_DOCS = [
  { key: 'pan', label: 'PAN Card' },
  { key: 'aadhaar', label: 'Aadhaar Card' },
  { key: 'bank', label: 'Bank Proof (personalised cancelled cheque)' },
  { key: 'nominee', label: 'Nominee ID proof' },
  { key: 'signature', label: 'Signature (white background)' },
  { key: 'photo', label: 'Passport-size photograph' },
] as const;

export type OnboardingDocKey = (typeof ONBOARDING_DOCS)[number]['key'];

export interface OnboardingFile {
  key: string;
  label: string;
  file: File;
}

export interface ClientOnboardingInput {
  fullName: string;
  email: string;
  mobile: string;
  pan: string;
  notes?: string;
  files: OnboardingFile[];
}

/** A stored onboarding submission (team-only view). */
export interface OnboardingRecord {
  id: string;
  fullName: string;
  email: string;
  mobile: string;
  pan: string;
  notes?: string;
  status: string;
  createdAt: string;
  documents: { key: string; label: string; path?: string; fileName: string }[];
}

/** A team member account (all are Super Admins). */
export interface TeamUser {
  id: string;
  email: string;
  createdAt?: string;
  lastSignInAt?: string;
}

export interface NewArticleInput {
  kind: ArticleKind;
  category: string;
  title: string;
  summary: string;
  body?: string;
  readTime?: string;
  coverUrl?: string;
  link?: string;
}

/**
 * The contract every backend implements. Read methods are synchronous
 * (data is cached in memory and mirrored to the store); mutations are
 * async so the Supabase implementation can await the network.
 */
export interface CmsBackend {
  readonly mode: 'mock' | 'supabase';

  getSession(): CmsSession | null;
  signIn(email: string, password: string): Promise<CmsSession>;
  /** Self-service registration gated by a shared team access code. */
  registerTeamMember(email: string, password: string, code: string): Promise<void>;
  signOut(): Promise<void>;

  listDocuments(): CmsDocument[];
  addDocument(input: NewDocumentInput): Promise<CmsDocument>;
  updateDocument(input: UpdateDocumentInput): Promise<CmsDocument>;
  deleteDocument(id: string): Promise<void>;

  listArticles(): CmsArticle[];
  addArticle(input: NewArticleInput): Promise<CmsArticle>;
  deleteArticle(id: string): Promise<void>;

  /** Public: an individual client submits their onboarding pack. */
  submitOnboarding(input: ClientOnboardingInput): Promise<void>;

  /** Team: read onboarding submissions and mint short-lived file links. */
  listOnboarding(): Promise<OnboardingRecord[]>;
  signOnboardingFile(path: string): Promise<string | null>;

  /** Team: list team accounts (Access screen). */
  listTeamUsers(): Promise<TeamUser[]>;

  /** Subscribe to any data/session change; returns an unsubscribe fn. */
  subscribe(cb: () => void): () => void;
}
