import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, ShieldCheck, Loader2 } from 'lucide-react';
import { CONTACT } from '../data/content';
import { PageHero } from '../components/shared';
import { useToast } from '../components/toast';
import { cms } from '../lib/cms/backend';

const CORPUS_OPTIONS = ['₹50 Lakh – ₹2 Crore', '₹2 Crore – ₹5 Crore', '₹5 Crore – ₹15 Crore', '₹15 Crore+'];
const VISITOR_OPTIONS = ['Client', 'Distributor'];

export default function ContactPage() {
  const showToast = useToast();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    name: '',
    mobile: '',
    email: '',
    corpus: CORPUS_OPTIONS[0],
    visitorType: VISITOR_OPTIONS[0],
    city: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.mobile || !form.email) {
      showToast('Please fill in your name, mobile and email so we can reach you.');
      return;
    }
    setBusy(true);
    try {
      await cms.submitCallback({
        name: form.name.trim(),
        mobile: form.mobile.trim(),
        email: form.email.trim(),
        corpus: form.corpus,
        visitorType: form.visitorType,
        city: form.city.trim() || undefined,
        message: form.message.trim() || undefined,
      });
      showToast(
        `Thank you ${form.name}! Your enquiry has been recorded. A portfolio specialist will call you back — we typically respond within one business day.`
      );
      setForm({ name: '', mobile: '', email: '', corpus: CORPUS_OPTIONS[0], visitorType: VISITOR_OPTIONS[0], city: '', message: '' });
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not submit your enquiry. Please try again or call us.');
    } finally {
      setBusy(false);
    }
  };

  const inputClass =
    'w-full bg-white text-slate-900 rounded-lg p-2.5 text-xs border border-slate-200 focus:outline-none focus:ring-1 focus:ring-ink-700';

  return (
    <>
      <PageHero
        eyebrow="CONTACT"
        title={
          <>
            Let's Build Your Portfolio <span className="text-transparent bg-clip-text bg-gradient-to-r from-ink-700 to-accent-600">Together</span>
          </>
        }
        lead="Speak to a portfolio specialist about the strategy that fits your goals. We typically respond within one business day."
      />

      {/* Enquiry + office info */}
      <section className="py-20 bg-white border-b border-slate-100 font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Form */}
            <div className="lg:col-span-7 bg-slate-50 border border-slate-200/80 rounded-2xl p-6 sm:p-8 space-y-5">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block pb-3 border-b border-slate-200">
                ✍️ REQUEST A CALLBACK
              </span>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-bold block uppercase">Name</label>
                    <input
                      type="text"
                      placeholder="Your full name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-bold block uppercase">Mobile</label>
                    <input
                      type="tel"
                      placeholder="+91 98XXX XXXXX"
                      value={form.mobile}
                      onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-bold block uppercase">Email</label>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-bold block uppercase">
                      Investment corpus range
                    </label>
                    <select
                      value={form.corpus}
                      onChange={(e) => setForm({ ...form, corpus: e.target.value })}
                      className={inputClass}
                    >
                      {CORPUS_OPTIONS.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-bold block uppercase">City</label>
                    <input
                      type="text"
                      placeholder="e.g. Mumbai"
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-bold block uppercase">You are a</label>
                    <select
                      value={form.visitorType}
                      onChange={(e) => setForm({ ...form, visitorType: e.target.value })}
                      className={inputClass}
                    >
                      {VISITOR_OPTIONS.map((v) => (
                        <option key={v}>{v}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-bold block uppercase">Message</label>
                  <textarea
                    rows={3}
                    placeholder="Tell us briefly about your goals (optional)"
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <button
                  type="submit"
                  disabled={busy}
                  className="w-full py-3 rounded-xl text-xs font-bold text-white uppercase tracking-wider bg-accent-500 hover:bg-accent-600 disabled:opacity-60 shadow-md transition inline-flex items-center justify-center gap-2"
                >
                  {busy && <Loader2 className="w-4 h-4 animate-spin" />}
                  {busy ? 'Submitting…' : 'Request a Callback'}
                </button>
                <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Your details are confidential and used only to arrange your consultation.</span>
                </div>
              </form>
            </div>

            {/* Office info */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-ink-900 text-white rounded-2xl p-6 sm:p-8 space-y-5 relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>
                <div className="relative z-10 space-y-5">
                  <h3 className="font-extrabold text-xl">Corporate Office</h3>
                  <ul className="space-y-4 text-xs text-ink-100/80">
                    <li className="flex items-start gap-2.5">
                      <MapPin className="w-4 h-4 text-accent-400 shrink-0 mt-0.5" />
                      <span>{CONTACT.address}</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Phone className="w-4 h-4 text-accent-400" />
                      <span>{CONTACT.phones.join(' / ')}</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Mail className="w-4 h-4 text-accent-400" />
                      <span>{CONTACT.email}</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Clock className="w-4 h-4 text-accent-400" />
                      <span>Office hours: {CONTACT.officeHours}</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Map */}
              <div className="rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm">
                <iframe
                  title="ACMIIL Corporate Office — Pantomath Nucleus House"
                  src="https://www.google.com/maps?q=Pantomath+Nucleus+House,+Saki-Vihar+Road,+Andheri+East,+Mumbai+400072&output=embed"
                  className="w-full h-56 border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
