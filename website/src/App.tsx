import { useState, useEffect } from 'react';
import { DuaProvider, useDua } from './context/DuaContext';
import { Header } from './components/Header';
import { SettingsModal } from './components/SettingsModal';
import { HomePage } from './pages/HomePage';
import { CategoryDetailPage } from './pages/CategoryDetailPage';
import { AdminPage } from './pages/AdminPage';

function AppContent() {
  const { categories } = useDua();
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [isAdminView, setIsAdminView] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Check URL hash for direct #admin navigation
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#admin') {
        setIsAdminView(true);
        setActiveCategoryId(null);
      } else if (isAdminView && window.location.hash !== '#admin') {
        setIsAdminView(false);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [isAdminView]);

  const activeCategory = categories.find((c) => c.id === activeCategoryId);

  const handleBack = () => {
    if (isAdminView) {
      setIsAdminView(false);
      window.location.hash = '';
    } else if (activeCategoryId !== null) {
      setActiveCategoryId(null);
    }
  };

  const handleOpenAdmin = () => {
    setIsAdminView(!isAdminView);
    window.location.hash = !isAdminView ? 'admin' : '';
  };

  return (
    <div className="min-h-screen bg-[#0A0F0D] text-white flex flex-col font-bangla">
      {/* Top Header */}
      <Header
        showBack={activeCategoryId !== null || isAdminView}
        onBack={handleBack}
        title={isAdminView ? 'অ্যাডমিন প্যানেল' : activeCategory?.nameBangla || activeCategory?.titleBangla}
        subtitle={isAdminView ? 'ক্যাটাগরি ও দোয়া ডাটাবেস' : activeCategory?.timeBangla}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAdmin={handleOpenAdmin}
        isAdmin={isAdminView}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-5 md:py-8">
        {isAdminView ? (
          <AdminPage onBackToApp={() => {
            setIsAdminView(false);
            window.location.hash = '';
          }} />
        ) : activeCategoryId ? (
          <CategoryDetailPage categoryId={activeCategoryId} />
        ) : (
          <HomePage onSelectCategory={(catId) => setActiveCategoryId(catId)} />
        )}
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-[#14231E] py-5 text-center text-xs text-[#94A3B8]">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>🌙 দৈনিক দোয়া (Daily Dua) — সহীহ মাসনূন আমল</span>
          <button
            onClick={handleOpenAdmin}
            className="hover:text-[#34D399] transition-colors"
          >
            {isAdminView ? '← মূল পাতায় যান' : 'অ্যাডমিন পোর্টাল'}
          </button>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <DuaProvider>
      <AppContent />
    </DuaProvider>
  );
}
