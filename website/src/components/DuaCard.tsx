import React, { useState } from 'react';
import { Check, RotateCcw, Copy, CheckCheck, BookMarked } from 'lucide-react';
import { Dua } from '../types/dua';
import { useDua } from '../context/DuaContext';
import { toBanglaNumber } from '../utils/date';

interface DuaCardProps {
  dua: Dua;
  index: number;
}

export const DuaCard: React.FC<DuaCardProps> = ({ dua, index }) => {
  const {
    isDuaRead,
    toggleDuaRead,
    incrementDuaTap,
    resetDuaTap,
    getDuaTapCount,
    settings,
  } = useDua();

  const [copied, setCopied] = useState(false);

  const isRead = isDuaRead(dua.id);
  const currentCount = getDuaTapCount(dua.id);
  const targetCount = dua.repetitionCount || 1;

  const handleCopy = () => {
    const textToCopy = `${dua.titleBangla}\n\n${dua.arabic}\n\nউচ্চারণ: ${dua.pronunciationBangla}\n\nঅর্থ: ${dua.meaningBangla}\n\nরেফারেন্স: ${dua.referenceBangla}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`rounded-2xl border transition-all duration-300 p-4 md:p-6 mb-4 ${
        isRead
          ? 'bg-[#0E1A15] border-[#10B981]/40 shadow-sm'
          : 'bg-[#111D19] border-[#192C25] hover:border-[#1E3A2F]'
      }`}
    >
      {/* Top Header: Title & Counter Badge */}
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#172721]">
        <div className="flex items-start space-x-2.5">
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#162721] border border-[#1E3A2F] text-xs font-semibold text-[#34D399] flex items-center justify-center mt-0.5">
            {toBanglaNumber(index + 1)}
          </span>
          <h4 className="text-base md:text-lg font-bold text-white leading-snug">
            {dua.titleBangla}
          </h4>
        </div>

        {/* Counter Badge */}
        <div className="flex items-center space-x-1.5 flex-shrink-0">
          <button
            onClick={() => incrementDuaTap(dua)}
            className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all active:scale-95 flex items-center space-x-1.5 ${
              isRead
                ? 'bg-[#10B981] border-[#10B981] text-black shadow-sm'
                : 'bg-[#065F46]/50 border-[#10B981]/40 text-[#34D399] hover:bg-[#065F46]'
            }`}
            title="গণনা করতে ক্লিক করুন"
          >
            <span>{toBanglaNumber(currentCount)}/{toBanglaNumber(targetCount)} বার</span>
          </button>

          {currentCount > 0 && !isRead && (
            <button
              onClick={() => resetDuaTap(dua.id)}
              className="p-1 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#162721] transition-colors"
              title="কাউন্টার রিসেট করুন"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Arabic Text */}
      <div className="my-5 text-center">
        <p
          className="font-arabic text-[#34D399] leading-loose selection:bg-[#10B981]/30 selection:text-white"
          style={{
            fontSize: `${settings.arabicFontSize}px`,
            lineHeight: `${settings.arabicFontSize * 2}px`,
          }}
        >
          {dua.arabic}
        </p>
      </div>

      {/* Bangla Pronunciation (উচ্চারণ) */}
      {settings.showUccharon && dua.pronunciationBangla && (
        <div className="bg-[#0D1613] border border-[#192C25] rounded-xl p-3.5 mb-3 text-sm text-[#CBD5E1] leading-relaxed">
          <span className="text-[#34D399] font-semibold block text-xs mb-1">উচ্চারণ:</span>
          <p className="whitespace-pre-line">{dua.pronunciationBangla}</p>
        </div>
      )}

      {/* Bangla Meaning (অর্থ) */}
      {settings.showOrtho && dua.meaningBangla && (
        <div className="bg-[#0D1613] border border-[#192C25] rounded-xl p-3.5 mb-3 text-sm text-[#E2E8F0] leading-relaxed">
          <span className="text-[#34D399] font-semibold block text-xs mb-1">অর্থ:</span>
          <p className="whitespace-pre-line">{dua.meaningBangla}</p>
        </div>
      )}

      {/* Fazilat (ফজিলত) */}
      {settings.showFazilat && dua.benefitBangla && (
        <div className="bg-[#091510] border border-[#142A20] rounded-xl p-3.5 mb-3 text-xs md:text-sm text-[#94A3B8] leading-relaxed">
          <span className="text-[#FBBF24] font-semibold block text-xs mb-1">ফযীলত:</span>
          <p className="whitespace-pre-line">{dua.benefitBangla}</p>
        </div>
      )}

      {/* Footer: Reference & Actions */}
      <div className="pt-3 border-t border-[#172721] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {dua.referenceBangla ? (
          <div className="flex items-center space-x-1.5 text-xs text-[#6EE7B7]">
            <BookMarked className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="line-clamp-1">{dua.referenceBangla}</span>
          </div>
        ) : <div />}

        <div className="flex items-center justify-end space-x-2">
          <button
            onClick={handleCopy}
            className="px-2.5 py-1.5 rounded-xl bg-[#0D1613] border border-[#192C25] text-xs text-[#94A3B8] hover:text-white hover:border-[#234438] transition-colors flex items-center space-x-1"
            title="দোয়া কপি করুন"
          >
            {copied ? (
              <>
                <CheckCheck className="w-3.5 h-3.5 text-[#34D399]" />
                <span className="text-[#34D399]">কপি হয়েছে</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>কপি</span>
              </>
            )}
          </button>

          <button
            onClick={() => toggleDuaRead(dua.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all active:scale-95 flex items-center space-x-1.5 ${
              isRead
                ? 'bg-[#10B981] border-[#10B981] text-black'
                : 'bg-[#111D19] border-[#192C25] text-[#34D399] hover:bg-[#162721] hover:border-[#10B981]/40'
            }`}
          >
            <Check className="w-4 h-4" />
            <span>{isRead ? 'পড়া সম্পন্ন' : 'পড়া হয়েছে'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
