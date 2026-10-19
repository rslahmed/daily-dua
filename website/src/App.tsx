import { useState, useEffect } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  useLocation,
  Navigate,
} from 'react-router-dom';
import { DuaProvider, useDua } from './context/DuaContext';
import { Header } from './components/Header';
import { SettingsModal } from './components/SettingsModal';
import { HomePage } from './pages/HomePage';
import { CategoryDetailPage } from './pages/CategoryDetailPage';
import { AdminPage } from './pages/AdminPage';

// Auto-redirect legacy hash #admin to /admin
function HashRedirect() {
  const navigate = useNavigate();
  useEffect(() => {
    if (window.location.hash === '#admin') {
      window.history.replaceState(null, '', window.location.pathname);
      navigate('/admin', { replace: true });
    }
  }, [navigate]);
  return null;
}

// Dynamic Header connected to React Router
function AppHeader({ onOpenSettings }: { onOpenSettings: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { categories } = useDua();

  const isAdminCategory = location.pathname.startsWith('/admin/category/');
  const isAdminRoot = location.pathname === '/admin' || location.pathname === '/admin/';
  const isAdminPath = isAdminRoot || isAdminCategory;
  const isCategoryPath = location.pathname.startsWith('/category/');

  let showBack = false;
  let title: string | undefined = undefined;
  let subtitle: string | undefined = undefined;
  let onBack: (() => void) | undefined = undefined;

  if (isAdminCategory) {
    const catId = location.pathname.replace('/admin/category/', '').replace(/\/$/, '');
    const cat = categories.find((c) => c.id === catId);
    showBack = true;
    title = cat ? `${cat.nameBangla || cat.titleBangla} — দোয়াসমূহ` : 'অ্যাডমিন প্যানেল';
    subtitle = cat?.subtitleBangla || 'ক্যাটাগরি দোয়াসমূহ';
    onBack = () => navigate('/admin');
  } else if (isAdminRoot) {
    showBack = true;
    title = 'অ্যাডমিন প্যানেল';
    subtitle = 'ক্যাটাগরি ও দোয়া ডাটাবেস';
    onBack = () => navigate('/');
  } else if (isCategoryPath) {
    const catId = location.pathname.replace('/category/', '').replace(/\/$/, '');
    const cat = categories.find((c) => c.id === catId);
    showBack = true;
    title = cat?.nameBangla || cat?.titleBangla;
    subtitle = cat?.timeBangla || cat?.subtitleBangla;
    onBack = () => navigate('/');
  }

  const handleOpenAdmin = () => {
    if (isAdminPath) {
      navigate('/');
    } else {
      navigate('/admin');
    }
  };

  return (
    <Header
      showBack={showBack}
      onBack={onBack}
      title={title}
      subtitle={subtitle}
      onOpenSettings={onOpenSettings}
      onOpenAdmin={handleOpenAdmin}
      isAdmin={isAdminPath}
    />
  );
}

// Dynamic Footer connected to React Router
function AppFooter() {
  const location = useLocation();
  const navigate = useNavigate();
  const isAdminPath = location.pathname.startsWith('/admin');

  return (
    <footer className="border-t border-[#14231E] py-5 text-center text-xs text-[#94A3B8]">
      <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span className="inline-flex items-center gap-2">
          <img src="/logo.png" alt="Daily Dua" className="w-4 h-4 rounded object-contain inline-block" />
          <span>দৈনিক দোয়া (Daily Dua) — সহীহ মাসনূন আমল</span>
        </span>
        <button
          onClick={() => navigate(isAdminPath ? '/' : '/admin')}
          className="hover:text-[#34D399] transition-colors"
        >
          {isAdminPath ? '← মূল পাতায় যান' : 'অ্যাডমিন পোর্টাল'}
        </button>
      </div>
    </footer>
  );
}

function AppContent() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0A0F0D] text-white flex flex-col font-bangla">
      <HashRedirect />

      {/* Top Header */}
      <AppHeader onOpenSettings={() => setIsSettingsOpen(true)} />

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-5 md:py-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/category/:categoryId" element={<CategoryDetailPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin/category/:categoryId" element={<AdminPage />} />
          {/* Fallback to Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Footer */}
      <AppFooter />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <DuaProvider>
        <AppContent />
      </DuaProvider>
    </BrowserRouter>
  );
}
