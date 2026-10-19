import React from 'react';
import { Sparkles } from 'lucide-react';
import { ProgressBar } from './ProgressBar';
import { useDua } from '../context/DuaContext';
import { toBanglaNumber } from '../utils/date';

export const OverallProgressCard: React.FC = () => {
  const { getOverallProgress } = useDua();
  const { completed, total, percentage } = getOverallProgress();

  if (total === 0) return null;

  return (
    <div className="bg-[#111D19] border border-[#192C25] rounded-2xl p-4 md:p-5 transition-all hover:border-[#234438] emerald-glow-sm">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#065F46]/50 border border-[#10B981]/30 flex items-center justify-center text-[#34D399]">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white leading-tight">আজকের আমল</h3>
            <p className="text-xs text-[#94A3B8] mt-0.5 leading-tight">প্রতিদিনের মাসনূন দোয়া পড়ে দিনকে বরকতময় করুন</p>
          </div>
        </div>

        <div className="bg-[#10B981]/15 border border-[#10B981]/30 px-2.5 py-1 rounded-lg">
          <span className="text-xs font-semibold text-[#34D399]">
            {toBanglaNumber(percentage)}% সম্পন্ন
          </span>
        </div>
      </div>

      <div className="space-y-2 mt-2">
        <ProgressBar
          progress={percentage}
          height={7}
          color={completed === total && total > 0 ? '#34D399' : '#10B981'}
          backgroundColor="#1A2D25"
        />

        <div className="flex justify-between items-center text-xs">
          <span className="text-[#94A3B8]">
            {toBanglaNumber(completed)}/{toBanglaNumber(total)} দোয়া পঠিত
          </span>
          <span className="text-[#34D399] font-medium">
            {completed === total && total > 0 ? 'মাশাআল্লাহ! আজকের আমল সম্পূর্ণ 🎉' : `বাকি আছে ${toBanglaNumber(total - completed)}টি`}
          </span>
        </div>
      </div>
    </div>
  );
};
