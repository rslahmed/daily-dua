import React from 'react';
import { CheckCircle2, Circle, Bookmark, Sparkles } from 'lucide-react';
import { Dua } from '../types/dua';
import { useDua } from '../context/DuaContext';
import { toBanglaNumber } from '../utils/date';

interface DuaCardProps {
  dua: Dua;
  index: number;
}

export const DuaCard: React.FC<DuaCardProps> = ({ dua, index }) => {
  const { isDuaRead, toggleDuaRead, settings, categories } = useDua();

  // Check if current dua belongs to any trackable category
  const parentCategories = categories.filter(
    (c) => dua.categoryIds?.includes(c.id) || dua.categoryId === c.id
  );
  const isPlainOnly = parentCategories.length > 0 && parentCategories.every((c) => c.hasProgress === false);

  const isRead = !isPlainOnly && isDuaRead(dua.id);

  return (
    <div
      className={`rounded-2xl p-4 md:p-5 mb-3.5 border transition-all duration-200 ${
        isRead
          ? 'bg-[#0F1A16] border-[#065F46]'
          : 'bg-[#111D19] border-[#1C332A]'
      }`}
    >
      {/* Top Header: Serial & Title & Repetition Tag */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center space-x-2.5 flex-1 min-w-0">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 border text-xs font-semibold ${
              isRead
                ? 'bg-[#064E3B] border-[#10B981] text-[#34D399]'
                : 'bg-[#182C24] border-[#244237] text-[#94A3B8]'
            }`}
          >
            {toBanglaNumber(index + 1)}
          </div>
          <h4 className="text-base md:text-lg font-bold text-white leading-snug">
            {dua.titleBangla}
          </h4>
        </div>

        {/* Repetition Tag (Static text-only, exactly like mobile app) */}
        <div className="flex-shrink-0 bg-[#10B981]/12 border border-[#10B981]/30 px-2.5 py-1 rounded-xl">
          <span className="text-xs font-semibold text-[#34D399]">
            {dua.repetitionText || `${toBanglaNumber(dua.repetitionCount || 1)} বার`}
          </span>
        </div>
      </div>

      {/* Part 1: Arabic Text */}
      <div className="pt-1 pb-3 mb-3 border-b border-[#1C332A] text-right" dir="rtl">
        <p
          className="font-arabic text-white leading-loose select-text"
          style={{
            fontSize: `${settings.arabicFontSize}px`,
            lineHeight: `${settings.arabicFontSize * 2}px`,
          }}
        >
          {dua.arabic}
        </p>
      </div>

      {/* Part 2: উচ্চারণ (Uccharon) */}
      {settings.showUccharon && dua.pronunciationBangla && (
        <div className="mb-2.5 text-sm leading-relaxed">
          <span className="text-[#34D399] font-bold">উচ্চারণ: </span>
          <span className="text-[#E2E8F0] whitespace-pre-line">{dua.pronunciationBangla}</span>
        </div>
      )}

      {/* Part 3: অর্থ (Ortho) */}
      {settings.showOrtho && dua.meaningBangla && (
        <div className="mb-2.5 text-sm leading-relaxed">
          <span className="text-[#10B981] font-bold">অর্থ: </span>
          <span className="text-[#CBD5E1] whitespace-pre-line">{dua.meaningBangla}</span>
        </div>
      )}

      {/* Part 4: ফযীলত (Fazilat) */}
      {settings.showFazilat && dua.benefitBangla && (
        <div className="bg-[#10B981]/[0.08] border-l-[3px] border-[#10B981] rounded-xl p-3 mb-2.5">
          <div className="flex items-center space-x-1.5 mb-1 text-xs font-bold text-[#34D399]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ফযীলত:</span>
          </div>
          <p className="text-xs md:text-sm text-[#E2E8F0] whitespace-pre-line leading-relaxed">
            {dua.benefitBangla}
          </p>
        </div>
      )}

      {/* Part 5: Reference */}
      {dua.referenceBangla && (
        <div className="flex items-start space-x-1.5 text-xs text-[#6EE7B7] mb-3 pt-0.5">
          <Bookmark className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          <span className="leading-relaxed">{dua.referenceBangla}</span>
        </div>
      )}

      {/* Bottom Action: Mark As Read Button (exactly like mobile app) */}
      {!isPlainOnly && (
        <div className="pt-2.5 border-t border-[#172A22]">
          <button
            onClick={() => toggleDuaRead(dua.id)}
            className={`w-full py-2.5 px-4 rounded-xl border font-semibold text-xs md:text-sm flex items-center justify-center space-x-2 transition-all active:scale-[0.99] ${
              isRead
                ? 'bg-[#065F46] border-[#10B981] text-white'
                : 'bg-[#162821] border-[#244237] text-[#CBD5E1] hover:border-[#10B981]/50'
            }`}
          >
            {isRead ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>পড়া হয়েছে</span>
              </>
            ) : (
              <>
                <Circle className="w-4 h-4 text-[#10B981]" />
                <span>পড়া হিসেবে চিহ্নিত করুন</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
