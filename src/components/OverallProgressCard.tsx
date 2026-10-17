import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDuaProgress } from '../context/DuaProgressContext';
import { ProgressBar } from './ProgressBar';
import { toBanglaNumber } from '../utils/date';

export const OverallProgressCard: React.FC = () => {
  const { getOverallProgress } = useDuaProgress();
  const { completed, total, percentage } = getOverallProgress();

  const isAllCompleted = total > 0 && completed === total;

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.titleWithIcon}>
          <View style={[styles.iconBox, isAllCompleted && styles.iconBoxCompleted]}>
            <Ionicons
              name={isAllCompleted ? 'checkmark-circle' : 'flame-outline'}
              size={20}
              color={isAllCompleted ? '#34D399' : '#10B981'}
            />
          </View>
          <View>
            <Text style={styles.cardTitle}>আজকের আমল ও অগ্রগতি</Text>
            <Text style={styles.cardSubtitle}>
              {toBanglaNumber(completed)}/{toBanglaNumber(total)} টি দোয়া পাঠ সম্পন্ন
            </Text>
          </View>
        </View>

        <View style={styles.percentageBadge}>
          <Text style={styles.percentageText}>{toBanglaNumber(percentage)}%</Text>
        </View>
      </View>

      <View style={styles.progressSection}>
        <ProgressBar progress={percentage} height={8} color="#10B981" backgroundColor="#1A2D25" />
      </View>

      <View style={styles.footerRow}>
        <View style={styles.resetNotice}>
          <Ionicons name="time-outline" size={13} color="#6EE7B7" style={{ marginRight: 5 }} />
          <Text style={styles.resetNoticeText}>প্রতি মধ্যরাতে পড়া স্বয়ংক্রিয়ভাবে রিসেট হবে</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#111D19',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#1C332A',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBoxCompleted: {
    backgroundColor: 'rgba(52, 211, 153, 0.2)',
    borderColor: '#34D399',
  },
  cardTitle: {
    fontSize: 15,
    color: '#FFFFFF',
    fontFamily: 'HindSiliguri_600SemiBold',
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    fontFamily: 'HindSiliguri_400Regular',
    marginTop: 1,
  },
  percentageBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  percentageText: {
    color: '#34D399',
    fontSize: 14,
    fontFamily: 'HindSiliguri_700Bold',
  },
  progressSection: {
    marginTop: 14,
    marginBottom: 10,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  resetNotice: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resetNoticeText: {
    fontSize: 11,
    color: '#6EE7B7',
    fontFamily: 'HindSiliguri_400Regular',
  },
});
