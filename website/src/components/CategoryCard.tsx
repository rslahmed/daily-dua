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

  const getCategoryTheme = () => {
    if (category.icon?.includes('sun') || category.id === 'sokal') {
      return {
        icon: <Sun className="w-6 h-6 text-[#FBBF24]" />,
        iconBg: 'bg-[#FBBF24]/10 border-[#FBBF24]/25 group-hover:border-[#FBBF24]/50',
      };
    }
    if (category.icon?.includes('moon') || category.id === 'sondha') {
      return {
        icon: <Moon className="w-6 h-6 text-[#60A5FA]" />,
        iconBg: 'bg-[#60A5FA]/10 border-[#60A5FA]/25 group-hover:border-[#60A5FA]/50',
      };
    }
    if (category.icon?.includes('bed') || category.id === 'sleep' || category.id === 'ghum') {
      return {
        icon: <Bed className="w-6 h-6 text-[#A78BFA]" />,
        iconBg: 'bg-[#A78BFA]/10 border-[#A78BFA]/25 group-hover:border-[#A78BFA]/50',
      };
    }
    return {
      icon: <BookOpen className="w-6 h-6 text-[#34D399]" />,
      iconBg: 'bg-[#10B981]/10 border-[#10B981]/25 group-hover:border-[#10B981]/50',
    };
  };

  const theme = getCategoryTheme();

  return (
    <div
      onClick={() => onSelect(category.id)}
      className={`rounded-2xl p-4 md:p-5 cursor-pointer transition-all duration-200 group active:scale-[0.99] border flex flex-col justify-between ${
        isCompleted
          ? 'bg-[#0F1A16] border-[#064E3B] hover:border-[#10B981]'
          : 'bg-[#111D19] border-[#192C25] hover:border-[#10B981]/50'
      } hover:shadow-lg hover:shadow-emerald-950/20`}
    >
      {/* Header Row: Icon + Title & Subtitle + Chevron */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start space-x-3.5 min-w-0 flex-1">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 border transition-colors ${
              isCompleted
                ? 'bg-[#10B981]/20 border-[#34D399]'
                : theme.iconBg
            }`}
          >
            {theme.icon}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <h4 className="text-base md:text-lg font-bold text-white group-hover:text-[#34D399] transition-colors leading-snug">
                {category.nameBangla || category.titleBangla}
              </h4>
              {category.timeBangla && (
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-[#0D1613] border border-[#1E332B] text-[#94A3B8]">
                  {category.timeBangla}
                </span>
              )}
            </div>
            <p className="text-xs text-[#94A3B8] mt-1 line-clamp-2 leading-relaxed">
              {category.subtitleBangla || category.timeBangla || ''}
            </p>
          </div>
        </div>

        <div className="w-8 h-8 rounded-xl bg-[#0D1613] border border-[#1E332B] flex items-center justify-center group-hover:border-[#10B981]/40 group-hover:bg-[#10B981]/10 transition-all flex-shrink-0 mt-0.5">
          <ChevronRight className="w-4 h-4 text-[#64748B] group-hover:text-[#34D399] transition-colors" />
        </div>
      </div>

      {/* Footer Row: Progress Stats / Namaz Info */}
      <div className="mt-4 pt-3.5 border-t border-[#172721]">
        {isTrackable ? (
          <>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-[#CBD5E1] font-medium">
                সম্পন্ন: <strong className="text-white font-semibold">{toBanglaNumber(completed)}/{toBanglaNumber(total)}</strong> টি
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
              মোট <strong className="text-white font-semibold">{toBanglaNumber(total)}</strong> টি দোয়া
            </span>
            <span className="text-[#34D399] font-medium bg-[#10B981]/10 border border-[#10B981]/20 px-2.5 py-0.5 rounded text-[11px]">
              {category.timeBangla || 'ফরজ সালাতের পর'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
