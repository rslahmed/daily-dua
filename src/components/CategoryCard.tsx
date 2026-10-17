import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Category } from '../types/dua';
import { useDuaProgress } from '../context/DuaProgressContext';
import { ProgressBar } from './ProgressBar';
import { toBanglaNumber } from '../utils/date';

interface CategoryCardProps {
  category: Category;
  onPress: () => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category, onPress }) => {
  const { getCategoryProgress } = useDuaProgress();
  const { completed, total, percentage } = getCategoryProgress(category.id);

  const isCompleted = total > 0 && completed === total;

  return (
    <TouchableOpacity
      style={[styles.card, isCompleted && styles.cardCompleted]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <View style={styles.iconAndTitle}>
            <View style={[styles.iconContainer, isCompleted && styles.iconContainerCompleted]}>
              <Ionicons
                name={category.icon as any}
                size={24}
                color={isCompleted ? '#34D399' : '#10B981'}
              />
            </View>
            <View style={styles.textContainer}>
              <View style={styles.titleRow}>
                <Text style={styles.title}>{category.titleBangla}</Text>
                <View style={styles.badgePill}>
                  <Text style={styles.badgeText}>{category.badge}</Text>
                </View>
              </View>
              <Text style={styles.subtitle} numberOfLines={1}>
                {category.subtitleBangla}
              </Text>
            </View>
          </View>

          <View style={styles.chevronBox}>
            <Ionicons name="chevron-forward" size={20} color="#64748B" />
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.progressLabelRow}>
            <Text style={styles.progressCountText}>
              সম্পন্ন: {toBanglaNumber(completed)}/{toBanglaNumber(total)} টি
            </Text>
            <Text style={[styles.percentageText, isCompleted && styles.percentageTextCompleted]}>
              {isCompleted ? '✓ সম্পূর্ণ' : `${toBanglaNumber(percentage)}%`}
            </Text>
          </View>

          <ProgressBar
            progress={percentage}
            height={5}
            color={isCompleted ? '#34D399' : '#10B981'}
            backgroundColor="#1A2D25"
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#111D19',
    borderRadius: 18,
    marginHorizontal: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#192C25',
    overflow: 'hidden',
  },
  cardCompleted: {
    borderColor: '#064E3B',
    backgroundColor: '#0F1A16',
  },
  content: {
    padding: 18,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconAndTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  iconContainerCompleted: {
    backgroundColor: 'rgba(52, 211, 153, 0.18)',
    borderColor: '#34D399',
  },
  textContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 3,
  },
  title: {
    fontSize: 17,
    color: '#FFFFFF',
    fontFamily: 'HindSiliguri_700Bold',
  },
  badgePill: {
    backgroundColor: '#192C25',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    color: '#10B981',
    fontFamily: 'HindSiliguri_500Medium',
  },
  subtitle: {
    fontSize: 12,
    color: '#94A3B8',
    fontFamily: 'HindSiliguri_400Regular',
  },
  chevronBox: {
    marginLeft: 8,
  },
  footer: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#172721',
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 7,
  },
  progressCountText: {
    fontSize: 12,
    color: '#CBD5E1',
    fontFamily: 'HindSiliguri_500Medium',
  },
  percentageText: {
    fontSize: 12,
    color: '#10B981',
    fontFamily: 'HindSiliguri_600SemiBold',
  },
  percentageTextCompleted: {
    color: '#34D399',
  },
});
