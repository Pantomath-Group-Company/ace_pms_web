/* ------------------------------------------------------------------ */
/* React bindings for the CMS backend: auth context + reactive hooks.  */
/* ------------------------------------------------------------------ */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import { cms } from './backend';
import type { CmsArticle, CmsDocument, CmsSession, StrategyNavSeries } from './types';

/* ---------------- Auth ---------------- */

interface AuthValue {
  session: CmsSession | null;
  isTeam: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, code: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<CmsSession | null>(() => cms.getSession());

  // Supabase restores the session asynchronously and fires onAuthStateChange;
  // keep local state in sync with the backend's session on every emit.
  useEffect(() => cms.subscribe(() => setSession(cms.getSession())), []);

  const signIn = useCallback(async (email: string, password: string) => {
    await cms.signIn(email, password);
    setSession(cms.getSession());
  }, []);

  const register = useCallback(async (email: string, password: string, code: string) => {
    await cms.registerTeamMember(email, password, code);
    setSession(cms.getSession());
  }, []);

  const signOut = useCallback(async () => {
    await cms.signOut();
    setSession(null);
  }, []);

  const value = useMemo<AuthValue>(
    () => ({ session, isTeam: Boolean(session), signIn, register, signOut }),
    [session, signIn, register, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}

/* ---------------- Reactive data ---------------- */

const subscribe = (cb: () => void) => cms.subscribe(cb);

export function useCmsDocuments(): CmsDocument[] {
  return useSyncExternalStore(subscribe, () => cms.listDocuments());
}

export function useCmsArticles(): CmsArticle[] {
  return useSyncExternalStore(subscribe, () => cms.listArticles());
}

export function useCmsStrategyNav(): StrategyNavSeries[] {
  return useSyncExternalStore(subscribe, () => cms.listStrategyNav());
}
