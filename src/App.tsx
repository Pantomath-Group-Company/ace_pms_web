import { useEffect, useState, useCallback } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { AccessibilityMenu } from './components/accessibility/AccessibilityMenu';
import { ToastContext } from './components/toast';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import PhilosophyPage from './pages/PhilosophyPage';
import StrategiesPage from './pages/StrategiesPage';
import PerformancePage from './pages/PerformancePage';
import WhyPage from './pages/WhyPage';
import InsightsPage from './pages/InsightsPage';
import InsightDetailPage from './pages/InsightDetailPage';
import ResourcesPage from './pages/ResourcesPage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage';
import OnboardingPage from './pages/OnboardingPage';

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      // Element renders after route mount — defer the scroll one frame
      requestAnimationFrame(() => {
        document.querySelector(hash)?.scrollIntoView({ behavior: 'instant' as ScrollBehavior });
      });
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    }
  }, [pathname, hash]);
  return null;
}

export default function App() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const { pathname } = useLocation();
  const chromeless = pathname === '/admin'; // the Console has its own top bar

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    window.setTimeout(() => setToastMessage(null), 6000);
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      <div className="min-h-screen bg-[#FAFAFA] text-slate-900 font-sans selection:bg-accent-100 selection:text-accent-700 relative">
        <ScrollToTop />

        {toastMessage && (
          <div className="fixed bottom-6 left-6 z-[120] bg-ink-900 text-white rounded-xl p-4 shadow-2xl border border-ink-600 max-w-sm flex items-start gap-3 animate-fadeIn">
            <div className="h-5 w-5 bg-emerald-500 text-white rounded-full flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-xs font-bold font-mono tracking-wider text-accent-500 block uppercase mb-0.5">
               ACE PMS
              </span>
              <span className="text-xs text-ink-100 font-light leading-relaxed">{toastMessage}</span>
            </div>
          </div>
        )}

        {!chromeless && <Header />}

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/philosophy" element={<PhilosophyPage />} />
          <Route path="/strategies" element={<StrategiesPage />} />
          <Route path="/performance" element={<PerformancePage />} />
          <Route path="/why-ace-pms" element={<WhyPage />} />
          <Route path="/why-acmiil" element={<Navigate to="/why-ace-pms" replace />} />
          <Route path="/insights" element={<InsightsPage />} />
          <Route path="/insights/:slug" element={<InsightDetailPage />} />
          <Route path="/resources" element={<ResourcesPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>

        {!chromeless && <Footer />}

        <AccessibilityMenu />
      </div>
    </ToastContext.Provider>
  );
}
