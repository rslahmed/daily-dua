import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, RotateCcw } from 'lucide-react';
import { useDua } from '../context/DuaContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const fontSizes = [
  { label: 'ছোট', size: 22 },
  { label: 'সাধারণ', size: 26 },
  { label: 'বড়', size: 30 },
  { label: 'খুব বড়', size: 34 },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettings, resetTodayProgress } = useDua();

  // Prevent background scroll when settings is active
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-[#111D19] border border-[#1E332B] rounded-3xl w-full max-w-md max-h-[85vh] flex flex-col shadow-2xl relative overflow-hidden text-white animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 md:px-6 py-4 border-b border-[#172721] flex-shrink-0 bg-[#111D19]">
          <h3 className="text-lg font-bold text-white">অ্যাপ সেটিংস</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#94A3B8] hover:text-white hover:bg-[#162721] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 md:px-6 py-4 space-y-5 custom-scrollbar">
          {/* Display Toggles */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-[#10B981] uppercase tracking-wider">
              প্রদর্শন কাস্টমাইজেশন
            </h4>

            {/* Uccharon */}
            <div className="flex items-center justify-between py-2 border-b border-[#172721]/60">
              <div>
                <p className="text-sm font-medium text-white">উচ্চারণ প্রদর্শন</p>
                <p className="text-xs text-[#94A3B8]">বাংলা উচ্চারণ দেখাবে কি না</p>
              </div>
              <button
                onClick={() => updateSettings({ showUccharon: !settings.showUccharon })}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                  settings.showUccharon ? 'bg-[#10B981]' : 'bg-[#1A2D25]'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    settings.showUccharon ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Ortho */}
            <div className="flex items-center justify-between py-2 border-b border-[#172721]/60">
              <div>
                <p className="text-sm font-medium text-white">অর্থ প্রদর্শন</p>
                <p className="text-xs text-[#94A3B8]">বাংলা অনুবাদ দেখাবে কি না</p>
              </div>
              <button
                onClick={() => updateSettings({ showOrtho: !settings.showOrtho })}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                  settings.showOrtho ? 'bg-[#10B981]' : 'bg-[#1A2D25]'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    settings.showOrtho ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Fazilat */}
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-white">ফযীলত প্রদর্শন</p>
                <p className="text-xs text-[#94A3B8]">হাদিসভিত্তিক ফজিলত ও উপকারিতা</p>
              </div>
              <button
                onClick={() => updateSettings({ showFazilat: !settings.showFazilat })}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                  settings.showFazilat ? 'bg-[#10B981]' : 'bg-[#1A2D25]'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    settings.showFazilat ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Arabic Font Size */}
          <div className="space-y-3 pt-2 border-t border-[#172721]">
            <h4 className="text-xs font-semibold text-[#10B981] uppercase tracking-wider">
              আরবি ফন্ট সাইজ
            </h4>
            <div className="grid grid-cols-4 gap-2">
              {fontSizes.map((f) => (
                <button
                  key={f.size}
                  onClick={() => updateSettings({ arabicFontSize: f.size })}
                  className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                    settings.arabicFontSize === f.size
                      ? 'bg-[#065F46] border-[#10B981] text-white shadow-sm'
                      : 'bg-[#0D1613] border-[#192C25] text-[#94A3B8] hover:text-white hover:border-[#234438]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Live Preview */}
            <div className="bg-[#0D1613] border border-[#192C25] rounded-xl p-3 text-center">
              <span className="text-[10px] text-[#94A3B8] block mb-1">লাইভ প্রিভিউ:</span>
              <p
                className="font-arabic text-[#34D399]"
                style={{
                  fontSize: `${settings.arabicFontSize}px`,
                  lineHeight: `${settings.arabicFontSize * 1.8}px`,
                }}
              >
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </p>
            </div>
          </div>

          {/* Reset Progress */}
          <div className="pt-2 border-t border-[#172721]">
            <button
              onClick={() => {
                if (confirm('আপনি কি আজকের সমস্ত পড়ার অগ্রগতি রিসেট করতে চান?')) {
                  resetTodayProgress();
                  onClose();
                }
              }}
              className="w-full py-2.5 rounded-xl border border-red-900/40 bg-red-950/20 text-red-400 hover:bg-red-900/30 text-xs font-semibold flex items-center justify-center space-x-2 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>আজকের আমল রিসেট করুন</span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
