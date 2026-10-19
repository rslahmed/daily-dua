import React, { useState, useEffect } from 'react';
import {
  Lock,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  ArrowLeft,
  BookOpen,
  LogOut,
  FolderPlus,
  Sun,
  Moon,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';
import { Category, Dua } from '../types/dua';
import {
  loginAdmin,
  checkAdminAuth,
  setAdminToken,
  fetchAdminCategories,
  saveAdminCategory,
  deleteAdminCategory,
  fetchAdminDuas,
  saveAdminDua,
  deleteAdminDua,
} from '../services/api';
import { toBanglaNumber } from '../utils/date';
import { useDua } from '../context/DuaContext';

interface AdminPageProps {
  onBackToApp: () => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onBackToApp }) => {
  const { refreshData } = useDua();

  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Data State
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [duas, setDuas] = useState<Dua[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Modals
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);

  const [isDuaModalOpen, setIsDuaModalOpen] = useState(false);
  const [editingDua, setEditingDua] = useState<Partial<Dua> | null>(null);

  // Delete Confirmation Modal State
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    type: 'category' | 'dua';
    id: string;
    title: string;
  }>({
    isOpen: false,
    type: 'category',
    id: '',
    title: '',
  });
  const [isDeleting, setIsDeleting] = useState(false);

  // Check auth on mount
  useEffect(() => {
    checkAdminAuth().then((auth) => {
      setIsAuthenticated(auth);
      if (auth) {
        loadCategories();
      }
    });
  }, []);

  const renderCategoryIcon = (category: Category) => {
    if (category.icon?.includes('sun') || category.id === 'sokal') {
      return <Sun className="w-6 h-6 text-[#FBBF24]" />;
    }
    if (category.icon?.includes('moon') || category.id === 'sondha') {
      return <Moon className="w-6 h-6 text-[#60A5FA]" />;
    }
    return <BookOpen className="w-6 h-6 text-[#34D399]" />;
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');
    try {
      const res = await loginAdmin(passwordInput);
      if (res.success) {
        setIsAuthenticated(true);
        loadCategories();
      } else {
        setLoginError(res.error || 'ভুল পাসওয়ার্ড।');
      }
    } catch {
      setLoginError('সার্ভারে যোগাযোগ করা যায়নি।');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    setAdminToken(null);
    setIsAuthenticated(false);
  };

  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const cats = await fetchAdminCategories();
      setCategories(cats);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategoryDuas = async (cat: Category) => {
    setSelectedCategory(cat);
    setIsLoading(true);
    try {
      const list = await fetchAdminDuas(cat.id);
      setDuas(list);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  // Category Save / Delete
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory?.nameBangla) return;

    try {
      const isEdit = !!editingCategory.id && categories.some((c) => c.id === editingCategory.id);
      await saveAdminCategory(editingCategory, isEdit);
      setIsCategoryModalOpen(false);
      setEditingCategory(null);
      await loadCategories();
      await refreshData();
      showToast('ক্যাটাগরি সফলভাবে সংরক্ষিত ও ডাটাবেস আপডেট হয়েছে!');
    } catch {
      alert('ক্যাটাগরি সংরক্ষণ করা যায়নি।');
    }
  };

  const handleRequestDeleteCategory = (id: string, name: string) => {
    setDeleteConfirm({
      isOpen: true,
      type: 'category',
      id,
      title: name,
    });
  };

  const handleRequestDeleteDua = (id: string, title: string) => {
    setDeleteConfirm({
      isOpen: true,
      type: 'dua',
      id,
      title,
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm.id) return;
    setIsDeleting(true);
    try {
      if (deleteConfirm.type === 'category') {
        await deleteAdminCategory(deleteConfirm.id);
        if (selectedCategory?.id === deleteConfirm.id) {
          setSelectedCategory(null);
        }
        await loadCategories();
        await refreshData();
        showToast(`"${deleteConfirm.title}" ক্যাটাগরি মুছে ফেলা হয়েছে!`);
      } else {
        await deleteAdminDua(deleteConfirm.id);
        if (selectedCategory) {
          await loadCategoryDuas(selectedCategory);
        }
        await loadCategories();
        await refreshData();
        showToast(`"${deleteConfirm.title}" দোয়াটি মুছে ফেলা হয়েছে!`);
      }
      setDeleteConfirm({ isOpen: false, type: 'category', id: '', title: '' });
    } catch {
      showToast('মুছে ফেলা সম্ভব হয়নি। আবার চেষ্টা করুন।');
    } finally {
      setIsDeleting(false);
    }
  };

  // Dua Save / Edit
  const handleOpenAddDua = () => {
    setEditingDua({
      titleBangla: '',
      arabic: '',
      pronunciationBangla: '',
      meaningBangla: '',
      benefitBangla: '',
      referenceBangla: '',
      repetitionCount: 1,
      repetitionText: '১ বার',
      categoryIds: selectedCategory ? [selectedCategory.id] : [],
    });
    setIsDuaModalOpen(true);
  };

  const handleOpenEditDua = (dua: Dua) => {
    setEditingDua({
      ...dua,
      categoryIds: dua.categoryIds || (selectedCategory ? [selectedCategory.id] : []),
    });
    setIsDuaModalOpen(true);
  };

  const handleSaveDua = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDua?.titleBangla || !editingDua?.arabic) {
      showToast('দোয়ার শিরোনাম ও আরবি পাঠ আবশ্যক।');
      return;
    }

    try {
      const isEdit = !!editingDua.id && duas.some((d) => d.id === editingDua.id);
      const repCount = editingDua.repetitionCount || 1;
      const payload: Partial<Dua> = {
        ...editingDua,
        repetitionCount: repCount,
        repetitionText: `${toBanglaNumber(repCount)} বার`,
        categoryIds: editingDua.categoryIds || (selectedCategory ? [selectedCategory.id] : []),
      };

      await saveAdminDua(payload, isEdit);
      setIsDuaModalOpen(false);
      setEditingDua(null);
      if (selectedCategory) {
        await loadCategoryDuas(selectedCategory);
      }
      await loadCategories();
      await refreshData();
      showToast('দোয়া সফলভাবে সংরক্ষিত এবং ভার্সন আপডেট হয়েছে!');
    } catch {
      showToast('দোয়া সংরক্ষণ করা যায়নি।');
    }
  };

  // Login View
  if (isAuthenticated === false) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 bg-[#111D19] border border-[#192C25] rounded-3xl text-center space-y-5 emerald-glow">
        <div className="w-14 h-14 rounded-2xl bg-[#065F46]/50 border border-[#10B981]/30 flex items-center justify-center text-[#34D399] mx-auto">
          <Lock className="w-7 h-7" />
        </div>

        <div>
          <h2 className="text-xl font-bold text-white">অ্যাডমিন প্রবেশদ্বার</h2>
          <p className="text-xs text-[#94A3B8] mt-1">
            ক্যাটাগরি ও দোয়া ডাটাবেস পরিচালনার জন্য পাসওয়ার্ড দিন
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-3.5">
          <input
            type="password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            placeholder="অ্যাডমিন পাসওয়ার্ড (default: dua@admin123)"
            className="w-full px-4 py-3 rounded-xl bg-[#0D1613] border border-[#192C25] focus:border-[#10B981] focus:outline-none text-white text-sm"
            autoFocus
          />

          {loginError && <p className="text-xs text-red-400 font-medium">{loginError}</p>}

          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full py-3 rounded-xl bg-[#10B981] hover:bg-[#34D399] text-black font-bold text-sm transition-all active:scale-95 disabled:opacity-50"
          >
            {isLoggingIn ? 'যাচাই করা হচ্ছে...' : 'লগইন করুন'}
          </button>
        </form>

        <button
          onClick={onBackToApp}
          className="text-xs text-[#94A3B8] hover:text-[#34D399] transition-colors pt-2 block mx-auto"
        >
          ← অ্যাপে ফিরে যান
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#065F46] border border-[#10B981] text-white px-4 py-3 rounded-2xl shadow-xl flex items-center space-x-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-[#34D399]" />
          <span className="text-xs md:text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Admin Top Navigation */}
      <div className="bg-[#111D19] border border-[#1E332B] rounded-2xl p-4 md:p-5 flex flex-wrap items-center justify-between gap-4 shadow-lg shadow-black/20">
        <div className="flex items-center space-x-3.5">
          {selectedCategory ? (
            <button
              onClick={() => setSelectedCategory(null)}
              className="px-3.5 py-2.5 rounded-xl bg-[#162822] border border-[#244237] text-[#34D399] hover:text-white hover:bg-[#1E3A2F] transition-all flex items-center space-x-2 text-xs md:text-sm font-semibold active:scale-95 shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>ক্যাটাগরি তালিকায় ফিরুন</span>
            </button>
          ) : (
            <button
              onClick={onBackToApp}
              className="px-3.5 py-2.5 rounded-xl bg-[#162822] border border-[#244237] text-[#CBD5E1] hover:text-white hover:bg-[#1E3A2F] transition-all flex items-center space-x-2 text-xs md:text-sm font-semibold active:scale-95 shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>মূল অ্যাপে ফিরুন</span>
            </button>
          )}

          <div>
            <h2 className="text-base md:text-lg font-bold text-white leading-tight">
              {selectedCategory ? `${selectedCategory.nameBangla} — দোয়াসমূহ` : 'অ্যাডমিন ড্যাশবোর্ড'}
            </h2>
            <p className="text-xs text-[#34D399] mt-0.5">
              {selectedCategory
                ? `${selectedCategory.hasProgress ? 'দৈনিক ট্র্যাকিং সহ ক্যাটাগরি' : 'সাধারণ পঠন ক্যাটাগরি'} (${toBanglaNumber(duas.length)}টি দোয়া)`
                : 'প্রথমে ক্যাটাগরি নির্বাচন করুন, তারপর দোয়া পরিচালনা করুন'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          {selectedCategory ? (
            <button
              onClick={handleOpenAddDua}
              className="px-4 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#34D399] text-[#0A0F0D] text-xs md:text-sm font-bold transition-all shadow-md shadow-[#10B981]/25 flex items-center space-x-2 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন দোয়া যোগ করুন</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setEditingCategory({
                  nameBangla: '',
                  subtitleBangla: '',
                  timeBangla: '',
                  icon: 'sunny-outline',
                  hasProgress: true,
                });
                setIsCategoryModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#34D399] text-[#0A0F0D] text-xs md:text-sm font-bold transition-all shadow-md shadow-[#10B981]/25 flex items-center space-x-2 active:scale-95"
            >
              <FolderPlus className="w-4 h-4" />
              <span>নতুন ক্যাটাগরি যোগ করুন</span>
            </button>
          )}

          <button
            onClick={handleLogout}
            className="px-3.5 py-2.5 rounded-xl bg-red-950/25 border border-red-900/40 text-red-400 hover:text-red-200 hover:bg-red-900/40 transition-all flex items-center space-x-1.5 text-xs font-semibold active:scale-95 shadow-sm"
            title="লগআউট"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">লগআউট</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: Categories List (First step) */}
      {!selectedCategory ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-base md:text-lg font-bold text-white">
              ১. ক্যাটাগরি নির্বাচন করুন ({toBanglaNumber(categories.length)}টি)
            </h3>
            <span className="text-xs text-[#94A3B8]">যেকোনো ক্যাটাগরিতে ক্লিক করে দোয়া যোগ/এডিট করুন</span>
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-[#94A3B8] text-sm">লোড হচ্ছে...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  onClick={() => loadCategoryDuas(cat)}
                  className="bg-[#111D19] border border-[#1E332B] hover:border-[#10B981]/60 rounded-2xl p-5 transition-all duration-200 group flex flex-col justify-between shadow-lg shadow-black/20 hover:shadow-[#10B981]/5 hover:-translate-y-0.5 cursor-pointer"
                >
                  {/* Card Top: Icon + Title + Subtitle */}
                  <div className="flex items-start space-x-3.5 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-[#0D1613] border border-[#1E332B] group-hover:border-[#10B981]/40 flex items-center justify-center flex-shrink-0 transition-colors">
                      {renderCategoryIcon(cat)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-base md:text-lg font-bold text-white group-hover:text-[#34D399] transition-colors leading-snug">
                        {cat.nameBangla || cat.titleBangla}
                      </h4>
                      <p className="text-xs text-[#94A3B8] mt-1 line-clamp-2 leading-relaxed">
                        {cat.subtitleBangla || cat.timeBangla || 'কোনো বিবরণ নেই'}
                      </p>
                    </div>
                  </div>

                  {/* Card Bottom: Dua Count + Tracking Tag + Actions */}
                  <div className="mt-5 pt-4 border-t border-[#1C332A] flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1.5">
                      <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#0D1613] border border-[#1E332B] text-xs font-semibold text-[#34D399]">
                        <BookOpen className="w-3.5 h-3.5 text-[#10B981]" />
                        <span>মোট {toBanglaNumber(cat.totalDuas || 0)}টি দোয়া</span>
                      </div>

                      <span
                        className={`text-xs font-semibold px-2.5 py-1.5 rounded-xl border ${
                          cat.hasProgress
                            ? 'bg-[#10B981]/15 border-[#10B981]/30 text-[#34D399]'
                            : 'bg-[#1E293B] border-[#334155] text-[#94A3B8]'
                        }`}
                      >
                        {cat.hasProgress ? 'ট্র্যাকিং সহ' : 'সাধারণ পঠন'}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingCategory(cat);
                          setIsCategoryModalOpen(true);
                        }}
                        className="px-3 py-2 rounded-xl bg-[#162822] hover:bg-[#1E3A2F] border border-[#244237] hover:border-[#10B981]/60 text-[#CBD5E1] hover:text-white text-xs font-semibold transition-all flex items-center space-x-1.5 active:scale-95 shadow-sm"
                        title="ক্যাটাগরি সম্পাদনা"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-[#34D399]" />
                        <span>এডিট</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRequestDeleteCategory(cat.id, cat.nameBangla || cat.titleBangla || '');
                        }}
                        className="px-3 py-2 rounded-xl bg-red-950/25 hover:bg-red-950/50 border border-red-900/40 hover:border-red-500/60 text-red-400 hover:text-red-200 text-xs font-semibold transition-all flex items-center space-x-1.5 active:scale-95 shadow-sm"
                        title="ক্যাটাগরি মুছে ফেলুন"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>মুছুন</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          loadCategoryDuas(cat);
                        }}
                        className="px-3.5 py-2 rounded-xl bg-[#10B981] hover:bg-[#34D399] text-[#0A0F0D] text-xs font-bold transition-all flex items-center space-x-1.5 shadow-md shadow-[#10B981]/20 active:scale-95"
                      >
                        <span>দোয়া দেখুন</span>
                        <ChevronRight className="w-4 h-4 text-[#0A0F0D]" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* VIEW 2: Selected Category's Duas List (Second step) */
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-base md:text-lg font-bold text-white">
              "{selectedCategory.nameBangla}" ক্যাটাগরির দোয়া সমূহ ({toBanglaNumber(duas.length)}টি)
            </h3>
            <button
              onClick={handleOpenAddDua}
              className="px-3.5 py-2 rounded-xl bg-[#10B981]/15 border border-[#10B981]/30 hover:bg-[#10B981]/25 text-[#34D399] hover:text-white text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>এই ক্যাটাগরিতে নতুন দোয়া যোগ করুন</span>
            </button>
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-[#94A3B8] text-sm">লোড হচ্ছে...</div>
          ) : duas.length === 0 ? (
            <div className="bg-[#111D19] border border-[#1E332B] rounded-2xl p-8 text-center space-y-3">
              <BookOpen className="w-10 h-10 text-[#94A3B8] mx-auto opacity-60" />
              <p className="text-sm text-white font-medium">এই ক্যাটাগরিতে এখনো কোনো দোয়া যুক্ত করা হয়নি।</p>
              <button
                onClick={handleOpenAddDua}
                className="px-5 py-2.5 rounded-xl bg-[#10B981] text-[#0A0F0D] text-xs font-bold transition-all inline-flex items-center space-x-2 shadow-md shadow-[#10B981]/25"
              >
                <Plus className="w-4 h-4" />
                <span>প্রথম দোয়াটি যুক্ত করুন</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3.5">
              {duas.map((dua, index) => (
                <div
                  key={dua.id}
                  className="bg-[#111D19] border border-[#1E332B] hover:border-[#10B981]/50 rounded-2xl p-4 md:p-5 transition-all shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start space-x-3 flex-1 min-w-0">
                      <span className="w-8 h-8 rounded-xl bg-[#182C24] border border-[#244237] text-xs font-bold text-[#34D399] flex items-center justify-center flex-shrink-0 mt-0.5">
                        {toBanglaNumber(index + 1)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
                          <h4 className="text-base md:text-lg font-bold text-white leading-snug">
                            {dua.titleBangla}
                          </h4>
                          <span className="inline-flex items-center text-xs font-bold text-[#34D399] bg-[#10B981]/15 border border-[#10B981]/30 px-2.5 py-0.5 rounded-lg">
                            {toBanglaNumber(dua.repetitionCount)} বার পাঠ্য
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <button
                        onClick={() => handleOpenEditDua(dua)}
                        className="px-3 py-1.5 rounded-xl bg-[#162822] hover:bg-[#1E3A2F] border border-[#244237] hover:border-[#10B981]/60 text-[#CBD5E1] hover:text-white text-xs font-semibold flex items-center space-x-1.5 transition-all active:scale-95 shadow-sm"
                        title="দোয়া সম্পাদনা"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-[#34D399]" />
                        <span>এডিট</span>
                      </button>
                      <button
                        onClick={() => handleRequestDeleteDua(dua.id, dua.titleBangla)}
                        className="px-3 py-1.5 rounded-xl bg-red-950/25 hover:bg-red-950/50 border border-red-900/40 hover:border-red-500/60 text-red-400 hover:text-red-200 text-xs font-semibold flex items-center space-x-1.5 transition-all active:scale-95 shadow-sm"
                        title="দোয়া মুছে ফেলুন"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>মুছুন</span>
                      </button>
                    </div>
                  </div>

                  {/* Arabic text snippet box */}
                  <div className="mt-3.5 p-3.5 rounded-xl bg-[#0D1613] border border-[#182A22]">
                    <p className="font-arabic text-[#34D399] text-base md:text-lg leading-loose line-clamp-2" dir="rtl">
                      {dua.arabic}
                    </p>
                  </div>

                  {/* Pronunciation & Meaning Preview */}
                  {dua.pronunciationBangla && (
                    <p className="text-xs md:text-sm text-[#CBD5E1] mt-2.5 line-clamp-1 leading-relaxed">
                      <span className="text-[#34D399] font-bold">উচ্চারণ:</span> {dua.pronunciationBangla}
                    </p>
                  )}
                  {dua.meaningBangla && (
                    <p className="text-xs text-[#94A3B8] mt-1.5 line-clamp-1 leading-relaxed">
                      <span className="text-[#10B981] font-semibold">অর্থ:</span> {dua.meaningBangla}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Category Modal (Create / Edit) */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#111D19] border border-[#192C25] rounded-3xl w-full max-w-md p-5 md:p-6 shadow-2xl text-white">
            <h3 className="text-lg font-bold text-white pb-3 border-b border-[#172721]">
              {editingCategory?.id ? 'ক্যাটাগরি সম্পাদনা' : 'নতুন ক্যাটাগরি তৈরি'}
            </h3>

            <form onSubmit={handleSaveCategory} className="space-y-4 my-4">
              <div>
                <label className="text-xs text-[#94A3B8] block mb-1">ক্যাটাগরির নাম (Title) *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: সকালের দোয়া"
                  value={editingCategory?.nameBangla || ''}
                  onChange={(e) =>
                    setEditingCategory({ ...editingCategory, nameBangla: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D1613] border border-[#192C25] focus:border-[#10B981] text-sm text-white"
                />
              </div>

              <div>
                <label className="text-xs text-[#94A3B8] block mb-1">সাবটাইটেল (Subtitle)</label>
                <input
                  type="text"
                  placeholder="যেমন: ফজর হতে সূর্যোদয় পর্যন্ত পাঠ্য দোয়া"
                  value={editingCategory?.subtitleBangla || ''}
                  onChange={(e) =>
                    setEditingCategory({ ...editingCategory, subtitleBangla: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D1613] border border-[#192C25] focus:border-[#10B981] text-sm text-white"
                />
              </div>

              <div>
                <label className="text-xs text-[#94A3B8] block mb-1">সময় নির্দেশক (Time text)</label>
                <input
                  type="text"
                  placeholder="যেমন: ফজর পরবর্তী সময়"
                  value={editingCategory?.timeBangla || ''}
                  onChange={(e) =>
                    setEditingCategory({ ...editingCategory, timeBangla: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D1613] border border-[#192C25] focus:border-[#10B981] text-sm text-white"
                />
              </div>

              {/* hasProgress Checkbox / Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#0D1613] border border-[#192C25]">
                <div>
                  <p className="text-sm font-semibold text-white">দৈনিক আমল ট্র্যাকিং (hasProgress)</p>
                  <p className="text-xs text-[#94A3B8]">কাউন্টার ও প্রগ্রেস বার থাকবে কি না</p>
                </div>
                <input
                  type="checkbox"
                  checked={editingCategory?.hasProgress !== false}
                  onChange={(e) =>
                    setEditingCategory({ ...editingCategory, hasProgress: e.target.checked })
                  }
                  className="w-5 h-5 accent-[#10B981] rounded cursor-pointer"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-[#1C332A]">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-xs md:text-sm font-semibold text-[#CBD5E1] bg-[#162822] border border-[#244237] hover:bg-[#1E3A2F] hover:text-white transition-all active:scale-95"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#34D399] text-[#0A0F0D] text-xs md:text-sm font-bold shadow-md shadow-[#10B981]/25 transition-all active:scale-95"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dua Modal (Create / Edit inside selected category) */}
      {isDuaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#111D19] border border-[#192C25] rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-5 md:p-6 shadow-2xl text-white">
            <h3 className="text-lg font-bold text-white pb-3 border-b border-[#172721]">
              {editingDua?.id ? 'দোয়া সম্পাদনা' : 'নতুন দোয়া যোগ করুন'}
            </h3>

            <form onSubmit={handleSaveDua} className="space-y-4 my-4">
              {/* 1. Title */}
              <div>
                <label className="text-xs text-[#94A3B8] block mb-1">১. দোয়ার শিরোনাম (Title) *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: আয়াতুল কুরসী"
                  value={editingDua?.titleBangla || ''}
                  onChange={(e) => setEditingDua({ ...editingDua, titleBangla: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D1613] border border-[#192C25] focus:border-[#10B981] text-sm text-white"
                />
              </div>

              {/* 2. Arabic */}
              <div>
                <label className="text-xs text-[#94A3B8] block mb-1">২. আরবি পাঠ (Arabic with Harakat) *</label>
                <textarea
                  required
                  rows={3}
                  dir="rtl"
                  placeholder="اللَّهُ لَا إِلٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ..."
                  value={editingDua?.arabic || ''}
                  onChange={(e) => setEditingDua({ ...editingDua, arabic: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D1613] border border-[#192C25] focus:border-[#10B981] text-base font-arabic text-[#34D399] leading-loose"
                />
              </div>

              {/* 3. Bangla Uccharon */}
              <div>
                <label className="text-xs text-[#94A3B8] block mb-1">৩. বাংলা উচ্চারণ (Bangla Uccharon)</label>
                <textarea
                  rows={2}
                  placeholder="আল্লা-হু লা ইলা-হা ইল্লা হুওয়াল হাইয়্যুল ক্বাইয়্যূম..."
                  value={editingDua?.pronunciationBangla || ''}
                  onChange={(e) =>
                    setEditingDua({ ...editingDua, pronunciationBangla: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D1613] border border-[#192C25] focus:border-[#10B981] text-sm text-white leading-relaxed"
                />
              </div>

              {/* 4. Bangla Meaning */}
              <div>
                <label className="text-xs text-[#94A3B8] block mb-1">৪. বাংলা অর্থ (Bangla Meaning)</label>
                <textarea
                  rows={2}
                  placeholder="আল্লাহ, তিনি ছাড়া কোনো হক ইলাহ্ নেই। তিনি চিরঞ্জীব..."
                  value={editingDua?.meaningBangla || ''}
                  onChange={(e) => setEditingDua({ ...editingDua, meaningBangla: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D1613] border border-[#192C25] focus:border-[#10B981] text-sm text-white leading-relaxed"
                />
              </div>

              {/* 5. Fazilat */}
              <div>
                <label className="text-xs text-[#94A3B8] block mb-1">৫. ফযীলত ও উপকারিতা (Fazilat)</label>
                <textarea
                  rows={2}
                  placeholder="সকাল-সন্ধ্যায় পাঠ করলে শয়তান ও জিনের আক্রমণ থেকে নিরাপত্তা লাভ হয়..."
                  value={editingDua?.benefitBangla || ''}
                  onChange={(e) => setEditingDua({ ...editingDua, benefitBangla: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D1613] border border-[#192C25] focus:border-[#10B981] text-xs text-white leading-relaxed"
                />
              </div>

              {/* 6. Reference & 7. Kotobar in 2 columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs text-[#94A3B8] block mb-1">৬. রেফারেন্স (Reference)</label>
                  <input
                    type="text"
                    placeholder="যেমন: সূরা বাক্বারা: ২৫৫; সহীহ বুখারী: ২৩১১"
                    value={editingDua?.referenceBangla || ''}
                    onChange={(e) =>
                      setEditingDua({ ...editingDua, referenceBangla: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D1613] border border-[#192C25] focus:border-[#10B981] text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-xs text-[#94A3B8] block mb-1">৭. কতবার পাঠ করতে হবে (Kotobar)</label>
                  <input
                    type="number"
                    min={1}
                    value={editingDua?.repetitionCount || 1}
                    onChange={(e) =>
                      setEditingDua({
                        ...editingDua,
                        repetitionCount: parseInt(e.target.value) || 1,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D1613] border border-[#192C25] focus:border-[#10B981] text-xs text-white"
                  />
                </div>
              </div>

              {/* Multi-Category Selector */}
              <div className="p-3.5 rounded-xl bg-[#0D1613] border border-[#1E332B]">
                <label className="text-xs font-semibold text-[#10B981] block mb-2.5">
                  কোন কোন ক্যাটাগরিতে এই দোয়াটি থাকবে (একাধিক ক্যাটাগরি নির্বাচন করা যাবে):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {categories.map((c) => {
                    const isSelected = editingDua?.categoryIds?.includes(c.id) || false;
                    return (
                      <label
                        key={c.id}
                        className={`flex items-center space-x-2.5 p-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-[#10B981]/15 border-[#10B981] text-white shadow-sm'
                            : 'bg-[#111D19] border-[#1E332B] text-[#94A3B8] hover:border-[#10B981]/40'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            const prev = editingDua?.categoryIds || [];
                            const next = e.target.checked
                              ? [...prev, c.id]
                              : prev.filter((id) => id !== c.id);
                            setEditingDua({ ...editingDua, categoryIds: next });
                          }}
                          className="w-4 h-4 accent-[#10B981] rounded"
                        />
                        <span>{c.nameBangla || c.titleBangla}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-[#1C332A]">
                <button
                  type="button"
                  onClick={() => setIsDuaModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-xs md:text-sm font-semibold text-[#CBD5E1] bg-[#162822] border border-[#244237] hover:bg-[#1E3A2F] hover:text-white transition-all active:scale-95"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#34D399] text-[#0A0F0D] text-xs md:text-sm font-bold shadow-md shadow-[#10B981]/25 transition-all active:scale-95"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div
            className="bg-[#111D19] border border-red-900/50 rounded-3xl w-full max-w-md p-6 shadow-2xl text-center space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Warning Icon with Glow */}
            <div className="w-16 h-16 rounded-2xl bg-red-950/40 border border-red-500/40 flex items-center justify-center text-red-400 mx-auto shadow-lg shadow-red-950/50">
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>

            <div>
              <h3 className="text-lg md:text-xl font-bold text-white">
                {deleteConfirm.type === 'category' ? 'ক্যাটাগরি মুছে ফেলতে চান?' : 'দোয়াটি মুছে ফেলতে চান?'}
              </h3>
              <p className="text-xs md:text-sm text-[#94A3B8] mt-2 leading-relaxed">
                আপনি কি নিশ্চিতভাবে <span className="text-white font-bold">"{deleteConfirm.title}"</span>{' '}
                {deleteConfirm.type === 'category'
                  ? 'ক্যাটাগরি এবং এর সমস্ত দোয়া লিঙ্ক মুছে ফেলতে চান? এটি আর ফিরিয়ে আনা যাবে না।'
                  : 'দোয়াটি মুছে ফেলতে চান? এটি আর ফিরিয়ে আনা যাবে না।'}
              </p>
            </div>

            <div className="flex items-center justify-center space-x-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeleteConfirm({ isOpen: false, type: 'category', id: '', title: '' })}
                className="px-5 py-2.5 rounded-xl bg-[#162822] border border-[#244237] text-xs md:text-sm font-semibold text-[#CBD5E1] hover:text-white hover:bg-[#1E3A2F] transition-all disabled:opacity-50"
              >
                বাতিল করুন
              </button>

              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs md:text-sm font-bold shadow-lg shadow-red-950/50 transition-all flex items-center space-x-2 active:scale-95 disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isDeleting ? 'মুছে ফেলা হচ্ছে...' : 'হ্যাঁ, মুছে ফেলুন'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
