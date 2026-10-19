import React from 'react';
import { Sun, Moon, BookOpen, ChevronRight } from 'lucide-react';
import { Category } from '../types/dua';
import { ProgressBar } from './ProgressBar';
import { useDua } from '../context/DuaContext';
import { toBanglaNumber } from '../utils/date';

interface CategoryCardProps {
  category: Category;
  onSelect: (categoryId: string) => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category, onSelect }) => {
  const { getCategoryProgress } = useDua();
  const { completed, total, percentage } = getCategoryProgress(category.id);

  const renderIcon = () => {
    if (category.icon.includes('sun') || category.id === 'sokal') {
      return <Sun className="w-6 h-6 text-[#FBBF24]" />;
    }
    if (category.icon.includes('moon') || category.id === 'sondha') {
      return <Moon className="w-6 h-6 text-[#60A5FA]" />;
    }
    return <BookOpen className="w-6 h-6 text-[#34D399]" />;
  };

  const isTrackable = category.hasProgress !== false;

  return (
    <div
      onClick={() => onSelect(category.id)}
      className="bg-[#111D19] border border-[#192C25] hover:border-[#10B981]/50 rounded-2xl p-4 md:p-5 cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-emerald-950/30 group active:scale-[0.99]"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#0D1613] border border-[#1C332A] flex items-center justify-center group-hover:border-[#10B981]/40 transition-colors">
            {renderIcon()}
          </div>
          <div>
            <h4 className="text-base md:text-lg font-bold text-white group-hover:text-[#34D399] transition-colors leading-snug">
              {category.nameBangla || category.titleBangla}
            </h4>
            <span className="inline-block text-[11px] font-medium text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded mt-0.5">
              {category.timeBangla || 'প্রতিদিনের আমল'}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="bg-[#10B981]/15 border border-[#10B981]/30 px-2.5 py-1 rounded-lg">
            <span className="text-xs font-semibold text-[#34D399]">
              {isTrackable
                ? `${toBanglaNumber(completed)}/${toBanglaNumber(total)} সম্পন্ন`
                : `মোট ${toBanglaNumber(total)}টি দোয়া`}
            </span>
          </div>
          <ChevronRight className="w-5 h-5 text-[#94A3B8] group-hover:text-white transition-colors" />
        </div>
      </div>

      {category.subtitleBangla && (
        <p className="text-xs text-[#94A3B8] mt-2.5 line-clamp-2">
          {category.subtitleBangla}
        </p>
      )}

      {isTrackable && (
        <div className="mt-3.5 pt-3 border-t border-[#172721]">
          <ProgressBar
            progress={percentage}
            height={5}
            color={completed === total && total > 0 ? '#34D399' : '#10B981'}
            backgroundColor="#1A2D25"
          />
        </div>
      )}
    </div>
  );
};
