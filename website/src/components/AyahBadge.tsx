import React from 'react';

interface AyahBadgeProps {
  number: string;
  size?: number;
}

export const AyahBadge: React.FC<AyahBadgeProps> = ({ number, size = 26 }) => {
  return (
    <span
      className="inline-flex items-center justify-center align-middle mx-1.5 rounded-full border-[1.4px] border-[#10B981] bg-[#10B981]/15 text-[#34D399] font-bold select-none"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        fontSize: `${Math.max(10, Math.round(size * 0.44))}px`,
        verticalAlign: 'middle',
        lineHeight: 1,
        fontFamily: "'Noto Sans Bengali', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        fontFeatureSettings: 'normal',
        letterSpacing: 0,
        direction: 'ltr',
        unicodeBidi: 'isolate',
      }}
    >
      {number}
    </span>
  );
};
