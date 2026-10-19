import React from 'react';
import { Sun, Moon, BookOpen, Bed, ChevronRight } from 'lucide-react';
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

  const isTrackable = category.hasProgress !== false;
  const isCompleted = isTrackable && total > 0 && completed === total;

  const renderIcon = () => {
    if (category.icon?.includes('sun') || category.id === 'sokal') {
      return <Sun className="w-6 h-6 text-[#FBBF24]" />;
    }
    if (category.icon?.includes('moon') || category.id === 'sondha') {
      return <Moon className="w-6 h-6 text-[#60A5FA]" />;
    }
    if (category.icon?.includes('bed') || category.id === 'sleep' || category.id === 'ghum') {
      return <Bed className="w-6 h-6 text-[#A78BFA]" />;
    }
    return <BookOpen className="w-6 h-6 text-[#34D399]" />;
  };

  return (
    <div
      onClick={() => onSelect(category.id)}
      className={`rounded-2xl p-4 md:p-5 cursor-pointer transition-all duration-200 group active:scale-[0.99] border ${
        isCompleted
          ? 'bg-[#0F1A16] border-[#064E3B] hover:border-[#10B981]'
          : 'bg-[#111D19] border-[#192C25] hover:border-[#10B981]/50'
      } hover:shadow-lg hover:shadow-emerald-950/20`}
    >
      {/* Header Row: Icon + Title & Subtitle + Chevron */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3.5 min-w-0 flex-1">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 border transition-colors ${
              isCompleted
                ? 'bg-[#10B981]/20 border-[#34D399]'
                : 'bg-[#0D1613] border-[#1C332A] group-hover:border-[#10B981]/40'
            }`}
          >
            {renderIcon()}
          </div>
          <div className="min-w-0 flex-1 pr-2">
            <h4 className="text-base md:text-lg font-bold text-white group-hover:text-[#34D399] transition-colors leading-snug truncate">
              {category.nameBangla || category.titleBangla}
            </h4>
            <p className="text-xs text-[#94A3B8] mt-0.5 truncate">
              {category.subtitleBangla || category.timeBangla || ''}
            </p>
          </div>
        </div>

        <div className="flex-shrink-0 pl-1">
          <ChevronRight className="w-5 h-5 text-[#64748B] group-hover:text-white transition-colors" />
        </div>
      </div>

      {/* Footer Row: Progress Stats / Namaz Info */}
      <div className="mt-4 pt-3.5 border-t border-[#172721]">
        {isTrackable ? (
          <>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-[#CBD5E1] font-medium">
                সম্পন্ন: {toBanglaNumber(completed)}/{toBanglaNumber(total)} টি
              </span>
              <span
                className={`font-semibold ${
                  isCompleted ? 'text-[#34D399]' : 'text-[#10B981]'
                }`}
              >
                {isCompleted ? '✓ সম্পূর্ণ' : `${toBanglaNumber(percentage)}%`}
              </span>
            </div>
            <ProgressBar
              progress={percentage}
              height={5}
              color={isCompleted ? '#34D399' : '#10B981'}
              backgroundColor="#1A2D25"
            />
          </>
        ) : (
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#CBD5E1] font-medium">
              মোট {toBanglaNumber(total)} টি দোয়া
            </span>
            <span className="text-[#34D399] font-medium bg-[#10B981]/10 px-2 py-0.5 rounded text-[11px]">
              {category.timeBangla || 'ফরজ সালাতের পর'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
