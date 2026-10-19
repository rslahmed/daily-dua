import React from 'react';
import { ArrowLeft, Settings, Shield } from 'lucide-react';

interface HeaderProps {
  showBack?: boolean;
  onBack?: () => void;
  title?: string;
  subtitle?: string;
  onOpenSettings: () => void;
  onOpenAdmin?: () => void;
  isAdmin?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  showBack = false,
  onBack,
  title,
  subtitle,
  onOpenSettings,
  onOpenAdmin,
  isAdmin = false,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0A0F0D]/95 backdrop-blur-md border-b border-[#14231E] px-4 py-3 transition-colors">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {showBack && onBack ? (
            <button
              onClick={onBack}
              className="p-2 rounded-xl bg-[#111D19] border border-[#192C25] text-[#34D399] hover:bg-[#162721] active:scale-95 transition-all"
              title="ফিরে যান"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          ) : (
            <div className="flex items-center space-x-3">
              <img
                src="/logo.png"
                alt="Daily Dua"
                className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-[#10B981]/15 border border-[#10B981]/30 object-contain shadow-sm"
              />
              <div>
                <h1 className="text-base font-bold text-white tracking-wide leading-tight">দৈনিক দোয়া</h1>
                <p className="text-[11px] text-[#34D399] font-medium leading-tight">Daily Dua & Masnoon Azkar</p>
              </div>
            </div>
          )}

          {title && (
            <div className="pl-1">
              <h2 className="text-base font-bold text-white leading-tight">{title}</h2>
              {subtitle && <p className="text-[11px] text-[#94A3B8] leading-tight">{subtitle}</p>}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {onOpenAdmin && (
            <button
              onClick={onOpenAdmin}
              className={`p-2 rounded-xl border transition-all ${
                isAdmin
                  ? 'bg-[#065F46] border-[#10B981] text-white'
                  : 'bg-[#111D19] border-[#192C25] text-[#94A3B8] hover:text-[#34D399] hover:border-[#234438]'
              }`}
              title="অ্যাডমিন প্যানেল"
            >
              <Shield className="w-5 h-5" />
            </button>
          )}

          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl bg-[#111D19] border border-[#192C25] text-[#94A3B8] hover:text-[#34D399] hover:border-[#234438] active:scale-95 transition-all"
            title="সেটিংস"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
