import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle2, BookOpen } from 'lucide-react';
import { ProgressBar } from '../components/ProgressBar';
import { DuaCard } from '../components/DuaCard';
import { useDua } from '../context/DuaContext';
import { toBanglaNumber } from '../utils/date';

interface CategoryDetailPageProps {
  categoryId?: string;
}

type FilterTab = 'all' | 'unread' | 'read';

export const CategoryDetailPage: React.FC<CategoryDetailPageProps> = ({ categoryId: propCategoryId }) => {
  const { categoryId: paramCategoryId } = useParams<{ categoryId: string }>();
  const categoryId = propCategoryId || paramCategoryId || '';

  const { categories, duas, isDuaRead, getCategoryProgress } = useDua();
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  const currentCategory = categories.find((c) => c.id === categoryId) || {
    id: categoryId,
    nameBangla: 'দোয়ার বিভাগ',
    subtitleBangla: '',
    timeBangla: '',
    icon: 'sunny-outline',
    hasProgress: true,
  };

  const isTrackable = currentCategory.hasProgress !== false;
  const categoryDuas = duas.filter(
    (d) => d.categoryIds?.includes(categoryId) || d.categoryId === categoryId
  );

  const { completed, total, percentage } = getCategoryProgress(categoryId);
  const unreadCount = total - completed;

  const filteredDuas = !isTrackable
    ? categoryDuas
    : categoryDuas.filter((d) => {
        const isRead = isDuaRead(d.id);
        if (activeTab === 'unread') return !isRead;
        if (activeTab === 'read') return isRead;
        return true;
      });

  return (
    <div className="space-y-4">
      {/* Category Progress Banner */}
      <div className="bg-[#111D19] border border-[#192C25] rounded-2xl p-4 md:p-5">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="text-lg md:text-xl font-bold text-white">
              {currentCategory.nameBangla || currentCategory.titleBangla}
            </h3>
            {currentCategory.timeBangla && (
              <p className="text-xs text-[#94A3B8] mt-0.5">{currentCategory.timeBangla}</p>
            )}
          </div>

          <div className="bg-[#10B981]/15 border border-[#10B981]/30 px-3 py-1 rounded-xl">
            <span className="text-xs font-semibold text-[#34D399]">
              {isTrackable
                ? `${toBanglaNumber(completed)}/${toBanglaNumber(total)} সম্পন্ন`
                : `মোট ${toBanglaNumber(total)}টি দোয়া`}
            </span>
          </div>
        </div>

        {isTrackable && (
          <div className="mt-3">
            <ProgressBar
              progress={percentage}
              height={6}
              color={completed === total && total > 0 ? '#34D399' : '#10B981'}
              backgroundColor="#1A2D25"
            />
          </div>
        )}
      </div>

      {/* Filter Tabs (only for trackable routine categories) */}
      {isTrackable && (
        <div className="flex bg-[#111D19] border border-[#172721] rounded-xl p-1 gap-1">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'all'
                ? 'bg-[#065F46] text-white shadow-sm'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            সব দোয়া ({toBanglaNumber(total)})
          </button>

          <button
            onClick={() => setActiveTab('unread')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'unread'
                ? 'bg-[#065F46] text-white shadow-sm'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            বাকি আছে ({toBanglaNumber(unreadCount)})
          </button>

          <button
            onClick={() => setActiveTab('read')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'read'
                ? 'bg-[#065F46] text-white shadow-sm'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            পড়া হয়েছে ({toBanglaNumber(completed)})
          </button>
        </div>
      )}

      {/* Dua Cards List */}
      <div className="space-y-3.5">
        {filteredDuas.length > 0 ? (
          filteredDuas.map((dua, index) => (
            <DuaCard key={dua.id} dua={dua} index={index} />
          ))
        ) : (
          <div className="bg-[#111D19] border border-[#1C332A] rounded-2xl p-8 md:p-12 text-center my-6 space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#162721] text-[#10B981] flex items-center justify-center mx-auto">
              {activeTab === 'unread' ? (
                <CheckCircle2 className="w-6 h-6" />
              ) : (
                <BookOpen className="w-6 h-6" />
              )}
            </div>
            <h4 className="text-base font-bold text-white">
              {activeTab === 'unread'
                ? 'মাশাআল্লাহ! সমস্ত দোয়া পড়া সম্পন্ন হয়েছে।'
                : 'এখনো কোনো দোয়া পড়া হয়নি।'}
            </h4>
            <p className="text-xs text-[#94A3B8] max-w-sm mx-auto">
              {activeTab === 'unread'
                ? 'আল্লাহ আপনার আমল কবুল করুন।'
                : 'দোয়া পড়ার পর "পড়া হয়েছে" বাটনে ক্লিক করুন অথবা কাউন্টার ব্যাজে ট্যাপ করুন।'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
