import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  UserRound,
  Handshake,
  ArrowRight,
  ArrowLeft,
  Lock,
  Mail,
  KeyRound,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { PageHero } from '../components/shared';
import { useToast } from '../components/toast';
import { useAuth } from '../lib/cms/store';
import { ORBIS, cms } from '../lib/cms/backend';
import { DEMO_HINT, DEMO_SIGNUP_CODE } from '../lib/cms/mockBackend';
import { UPI_PMS } from '../data/onboarding';

type Mode = 'hub' | 'team' | 'client' | 'partner';

const AUDIENCES: Array<{
  id: Exclude<Mode, 'hub'>;
  Icon: typeof ShieldCheck;
  label: string;
  accent: string;
}> = [
  {
    id: 'team',
    Icon: ShieldCheck,
    label: 'Admin',
    accent: 'text-accent-600 bg-accent-50 border-accent-100',
  },
  {
    id: 'client',
    Icon: UserRound,
    label: 'Existing/New Client',
    accent: 'text-ink-700 bg-ink-50 border-ink-100',
  },
  {
    id: 'partner',
    Icon: Handshake,
    label: 'Existing/New Distributor',
    accent: 'text-accent-600 bg-accent-50 border-accent-100',
  },
];

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>('hub');

  return (
    <>
      <PageHero
        eyebrow="SECURE ACCESS"
        title={
          <>
            Sign in to{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-ink-700 to-accent-600">
              ACE PMS
            </span>
          </>
        }
        lead="Your Wealth. Your Journey. Your Access."
      />

      <section className="py-20 bg-white font-sans min-h-[50vh]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {mode === 'hub' && <Hub onSelect={setMode} />}
          {mode === 'team' && <TeamPanel onBack={() => setMode('hub')} />}
          {mode === 'client' && <OrbisPanel kind="client" onBack={() => setMode('hub')} />}
          {mode === 'partner' && <OrbisPanel kind="partner" onBack={() => setMode('hub')} />}
        </div>
      </section>
    </>
  );
}

/* ---------------- Hub: three audience cards ---------------- */

function Hub({ onSelect }: { onSelect: (m: Mode) => void }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {AUDIENCES.map(({ id, Icon, label, accent }) => (
        <button
          key={id}
          type="button"
          onClick={() => onSelect(id)}
          className="text-left bg-white rounded-2xl border border-slate-200/80 p-7 shadow-sm hover:shadow-md hover:border-slate-300 transition group focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2"
        >
          <div className={`w-12 h-12 rounded-xl grid place-items-center border ${accent}`}>
            <Icon className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-lg text-slate-900 mt-5">{label}</h3>
          <span className="inline-flex items-center gap-1.5 mt-4 text-[11px] font-bold uppercase tracking-wider text-ink-700 group-hover:text-accent-600 transition">
            Continue <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </button>
      ))}
    </div>
  );
}

function BackLink({ onBack }: { onBack: () => void }) {
  return (
    <button
      type="button"
      onClick={onBack}
      className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 hover:text-ink-700 transition mb-6"
    >
      <ArrowLeft className="w-3.5 h-3.5" /> All sign-in options
    </button>
  );
}

/* ---------------- Team: email + password ---------------- */

function TeamPanel({ onBack }: { onBack: () => void }) {
  const navigate = useNavigate();
  const { signIn, register } = useAuth();
  const [mode, setMode] = useState<'signin' | 'register'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const isRegister = mode === 'register';

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (isRegister) await register(email, password, code);
      else await signIn(email, password);
      navigate('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <BackLink onBack={onBack} />
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-7 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl grid place-items-center border border-accent-100 bg-accent-50 text-accent-600">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-lg text-slate-900 leading-tight">
              {isRegister ? 'Create team account' : 'Admin Team'}
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">Content management</p>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <label className="block">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Work email
            </span>
            <div className="relative mt-1.5">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@yourcompany.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:bg-white transition"
              />
            </div>
          </label>

          <label className="block">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Password
            </span>
            <div className="relative mt-1.5">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                autoComplete={isRegister ? 'new-password' : 'current-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isRegister ? 'Min 8 characters' : '••••••••'}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:bg-white transition"
              />
            </div>
          </label>

          {isRegister && (
            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Team access code
              </span>
              <div className="relative mt-1.5">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Shared code from your admin"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:bg-white transition"
                />
              </div>
            </label>
          )}

          {error && (
            <p className="text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full bg-accent-500 hover:bg-accent-600 disabled:opacity-60 text-white font-bold text-xs uppercase tracking-wider py-3 rounded-lg inline-flex items-center justify-center gap-2 transition"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
            {busy ? 'Please wait…' : isRegister ? 'Create account' : 'Sign in'}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setMode(isRegister ? 'signin' : 'register');
            setError(null);
          }}
          className="mt-4 w-full text-center text-[11px] font-semibold text-ink-700 hover:text-accent-600 transition"
        >
          {isRegister ? 'Already have an account? Sign in' : 'New here? Create a team account'}
        </button>

        <div className="mt-5 pt-5 border-t border-slate-100">
          {cms.mode === 'mock' ? (
            <p className="text-[10px] text-slate-400 leading-relaxed">
              <span className="font-bold uppercase tracking-wider text-slate-500">Demo</span> — mock
              backend. Sign in with{' '}
              <code className="text-ink-700 font-mono">{DEMO_HINT.email}</code> /{' '}
              <code className="text-ink-700 font-mono">{DEMO_HINT.password}</code>, or register any
              email with code <code className="text-ink-700 font-mono">{DEMO_SIGNUP_CODE}</code>.
            </p>
          ) : (
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Registering needs your team's access code. Any work email is accepted, and every
              account is a Super Admin.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Client / Partner: Orbis + onboarding ---------------- */

function OrbisPanel({ kind, onBack }: { kind: 'client' | 'partner'; onBack: () => void }) {
  const showToast = useToast();
  const navigate = useNavigate();
  const isClient = kind === 'client';
  const url = isClient ? ORBIS.clientUrl : ORBIS.partnerUrl;
  const existingLabel = isClient ? 'Existing client' : 'Registered distributor';
  const newLabel = isClient ? 'New client' : 'New distributor';
  const [tab, setTab] = useState<'portal' | 'upi'>('portal');

  const goOrbis = () => {
    if (url) {
      window.location.href = url;
    } else {
      showToast('The Orbis portal link will be enabled once it is provided.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <BackLink onBack={onBack} />

      {isClient && (
        <div className="grid grid-cols-2 gap-2 bg-slate-100 rounded-xl p-1 mb-5">
          {(['portal', 'upi'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`rounded-lg px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider transition ${
                tab === t ? 'bg-white text-ink-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {t === 'portal' ? 'Portal access' : 'UPI handle for top up'}
            </button>
          ))}
        </div>
      )}

      {isClient && tab === 'upi' ? (
        <UpiPayment />
      ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Existing -> Orbis */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 flex flex-col">
          <div className="w-11 h-11 rounded-xl grid place-items-center border border-ink-100 bg-ink-50 text-ink-700">
            {isClient ? <UserRound className="w-5 h-5" /> : <Handshake className="w-5 h-5" />}
          </div>
          <h3 className="font-extrabold text-base text-slate-900 mt-4">{existingLabel}</h3>
          <p className="text-xs text-slate-500 font-light leading-relaxed mt-1.5 flex-1">
            Continue to the Orbis portal to access your {isClient ? 'portfolio and statements' : 'distributor dashboard'}.
          </p>
          <button
            type="button"
            onClick={goOrbis}
            className="mt-5 w-full bg-ink-900 hover:bg-ink-800 text-white font-bold text-[11px] uppercase tracking-wider py-2.5 rounded-lg inline-flex items-center justify-center gap-2 transition"
          >
            Continue to Orbis <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* New -> onboarding (deferred) */}
        <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-300 p-6 flex flex-col">
          <div className="w-11 h-11 rounded-xl grid place-items-center border border-slate-200 bg-white text-slate-400">
            <ArrowRight className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-base text-slate-900 mt-4">{newLabel}</h3>
          <p className="text-xs text-slate-500 font-light leading-relaxed mt-1.5 flex-1">
            {isClient
              ? 'Share your details and KYC documents to open a PMS account with us.'
              : 'Share your details and required documents to register as a distributor.'}
          </p>
          <button
            type="button"
            onClick={() => navigate(isClient ? '/onboarding' : '/onboarding?flow=distributor')}
            className="mt-5 w-full bg-accent-500 hover:bg-accent-600 text-white font-bold text-[11px] uppercase tracking-wider py-2.5 rounded-lg inline-flex items-center justify-center gap-2 transition"
          >
            Start onboarding <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      )}
    </div>
  );
}

/* ---------------- UPI payment (PMS client accounts) ---------------- */

function UpiPayment() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-7">
      <h3 className="font-extrabold text-lg text-slate-900">UPI handle for top up — PMS</h3>
      <p className="text-[11px] text-slate-500 font-light leading-relaxed mt-1.5">
        <span className="font-bold text-rose-600">Important:</span> use the UPI handle that matches the
        strategy your funds are intended for. Scan the QR in any UPI app, or pay to the UPI handle shown.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
        {UPI_PMS.map((acc) => (
          <div
            key={acc.upi}
            className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 flex flex-col items-center text-center"
          >
            <span className="font-extrabold text-slate-900 text-sm">{acc.name}</span>
            <div className="bg-white p-2.5 rounded-lg border border-slate-200 mt-3">
              <QRCodeSVG
                value={`upi://pay?pa=${acc.upi}&pn=ACE%20PMS&cu=INR`}
                size={128}
                level="M"
              />
            </div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-3">
              UPI handle
            </span>
            <span className="text-xs font-mono text-ink-700 bg-white border border-slate-200 rounded px-2 py-1 mt-1 break-all">
              {acc.upi}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
