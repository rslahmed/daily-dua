import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { PrayerMatIcon } from './icons/PrayerMatIcon';

export interface CategoryIconProps {
  name?: string;
  categoryId?: string;
  size?: number;
  color: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  name,
  categoryId,
  size = 24,
  color,
}) => {
  if (categoryId === 'namaz' || name === 'prayer-mat' || name === 'namaz') {
    return <PrayerMatIcon size={size} color={color} strokeWidth={1.5} />;
  }

  return (
    <Ionicons
      name={(name || 'sparkles-outline') as any}
      size={size}
      color={color}
    />
  );
};
