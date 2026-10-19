import React from 'react';

interface AyahBadgeProps {
  number: string;
  size?: number;
}

export const AyahBadge: React.FC<AyahBadgeProps> = ({ number, size = 26 }) => {
  return (
    <span
      className="inline-flex items-center justify-center align-middle mx-1.5 select-none relative"
      style={{
        width: size,
        height: size,
        verticalAlign: 'middle',
      }}
    >
      <svg
        viewBox="0 0 36 36"
        className="w-full h-full text-[#10B981] absolute inset-0"
        fill="none"
      >
        {/* Outer ornamental dot ring */}
        <circle
          cx="18"
          cy="18"
          r="16"
          stroke="#10B981"
          strokeWidth="1.2"
          strokeDasharray="2 1.5"
          opacity="0.8"
        />
        {/* Inner crisp circle with slight fill */}
        <circle
          cx="18"
          cy="18"
          r="13"
          stroke="#34D399"
          strokeWidth="1.4"
          fill="rgba(16, 185, 129, 0.15)"
        />
      </svg>
      <span
        className="relative z-10 text-[#34D399] font-bold text-center leading-none select-none"
        style={{
          fontSize: Math.max(10, Math.round(size * 0.44)),
          fontFamily: 'Noto Sans Bengali, system-ui, sans-serif',
        }}
      >
        {number}
      </span>
    </span>
  );
};
