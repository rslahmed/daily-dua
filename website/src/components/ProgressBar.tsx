import React from 'react';

interface ProgressBarProps {
  progress: number; // 0 - 100
  height?: number;
  color?: string;
  backgroundColor?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  height = 6,
  color = '#10B981',
  backgroundColor = '#1A2D25',
}) => {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div
      className="w-full rounded-full overflow-hidden transition-all duration-300"
      style={{ height, backgroundColor }}
    >
      <div
        className="h-full rounded-full transition-all duration-500 ease-out"
        style={{
          width: `${clampedProgress}%`,
          backgroundColor: color,
        }}
      />
    </div>
  );
};
