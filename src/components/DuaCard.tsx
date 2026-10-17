import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Dua } from '../types/dua';
import { useDuaProgress } from '../context/DuaProgressContext';
import { useSettings } from '../context/SettingsContext';
import { toBanglaNumber } from '../utils/date';

interface DuaCardProps {
  dua: Dua;
  index: number;
}

export const DuaCard: React.FC<DuaCardProps> = ({ dua, index }) => {
  const { isDuaRead, toggleDuaRead, getDuaTapCount, incrementDuaTap } = useDuaProgress();
  const { showUccharon, showOrtho, showFazilat, arabicFontSize } = useSettings();

  const isRead = isDuaRead(dua.id);
  const currentTaps = getDuaTapCount(dua.id);
  const targetTaps = dua.repetitionCount;

  return (
    <View style={[styles.card, isRead && styles.cardRead]}>
      {/* Top Header: Serial & Title & Repetition Badge */}
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <View style={[styles.serialBadge, isRead && styles.serialBadgeRead]}>
            <Text style={[styles.serialText, isRead && styles.serialTextRead]}>
              {toBanglaNumber(index + 1)}
            </Text>
          </View>
          <Text style={styles.duaTitle} numberOfLines={2}>
            {dua.titleBangla}
          </Text>
        </View>

        {/* Repetition Count Badge with Interactive Tap */}
        <TouchableOpacity
          style={[styles.repetitionBadge, isRead && styles.repetitionBadgeRead]}
          onPress={() => incrementDuaTap(dua)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={isRead ? 'checkmark-circle' : 'repeat'}
            size={14}
            color={isRead ? '#34D399' : '#10B981'}
            style={{ marginRight: 4 }}
          />
          <Text style={[styles.repetitionText, isRead && styles.repetitionTextRead]}>
            {targetTaps > 1
              ? `${toBanglaNumber(currentTaps)}/${toBanglaNumber(targetTaps)} বার`
              : dua.repetitionText}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Part 1: Arabic Text (Hafs Font) */}
      <View style={styles.arabicContainer}>
        <Text
          style={[
            styles.arabicText,
            {
              fontSize: arabicFontSize,
              lineHeight: Math.round(arabicFontSize * 2.0),
            },
          ]}
        >
          {dua.arabic}
        </Text>
      </View>

      {/* Part 2: উচ্চারণ (Uccharon) */}
      {showUccharon && dua.pronunciationBangla && (
        <View style={styles.sectionRow}>
          <Text style={styles.sectionContent}>
            <Text style={styles.labelUccharon}>উচ্চারণ: </Text>
            <Text style={styles.textUccharon}>{dua.pronunciationBangla}</Text>
          </Text>
        </View>
      )}

      {/* Part 3: অর্থ (Ortho) */}
      {showOrtho && dua.meaningBangla && (
        <View style={styles.sectionRow}>
          <Text style={styles.sectionContent}>
            <Text style={styles.labelOrtho}>অর্থ: </Text>
            <Text style={styles.textOrtho}>{dua.meaningBangla}</Text>
          </Text>
        </View>
      )}

      {/* Part 4: ফযীলত (Fazilat) */}
      {showFazilat && dua.benefitBangla && (
        <View style={styles.fazilatBox}>
          <View style={styles.fazilatHeader}>
            <Ionicons name="sparkles" size={14} color="#34D399" style={{ marginRight: 6 }} />
            <Text style={styles.labelFazilat}>ফযীলত:</Text>
          </View>
          <Text style={styles.textFazilat}>{dua.benefitBangla}</Text>
        </View>
      )}

      {/* Part 5: রেফারেন্স (Reference) */}
      {dua.referenceBangla && (
        <View style={styles.referenceRow}>
          <Ionicons name="bookmark-outline" size={13} color="#6EE7B7" style={{ marginRight: 5 }} />
          <Text style={styles.referenceText}>রেফারেন্স: {dua.referenceBangla}</Text>
        </View>
      )}

      {/* Bottom Action: Mark As Read Button */}
      <View style={styles.footerRow}>
        <TouchableOpacity
          style={[styles.readButton, isRead && styles.readButtonActive]}
          onPress={() => toggleDuaRead(dua.id)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={isRead ? 'checkmark-circle' : 'radio-button-off'}
            size={18}
            color={isRead ? '#FFFFFF' : '#10B981'}
            style={{ marginRight: 8 }}
          />
          <Text style={[styles.readButtonText, isRead && styles.readButtonTextActive]}>
            {isRead ? 'পড়া হয়েছে' : 'পড়া হিসেবে চিহ্নিত করুন'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#111D19',
    borderRadius: 18,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#1C332A',
  },
  cardRead: {
    borderColor: '#065F46',
    backgroundColor: '#0F1A16',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 14,
    gap: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  serialBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#182C24',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#244237',
  },
  serialBadgeRead: {
    backgroundColor: '#064E3B',
    borderColor: '#10B981',
  },
  serialText: {
    fontSize: 13,
    color: '#94A3B8',
    fontFamily: 'HindSiliguri_600SemiBold',
  },
  serialTextRead: {
    color: '#34D399',
  },
  duaTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'HindSiliguri_700Bold',
    flex: 1,
  },
  repetitionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  repetitionBadgeRead: {
    backgroundColor: 'rgba(52, 211, 153, 0.2)',
    borderColor: '#34D399',
  },
  repetitionText: {
    fontSize: 12,
    color: '#34D399',
    fontFamily: 'HindSiliguri_600SemiBold',
  },
  repetitionTextRead: {
    color: '#6EE7B7',
  },
  arabicContainer: {
    backgroundColor: '#0A120F',
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#192C25',
  },
  arabicText: {
    color: '#FFFFFF',
    fontFamily: 'hafs',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  sectionRow: {
    marginBottom: 12,
  },
  sectionContent: {
    fontSize: 14,
    lineHeight: 23,
  },
  labelUccharon: {
    color: '#34D399',
    fontFamily: 'HindSiliguri_700Bold',
    fontSize: 14,
  },
  textUccharon: {
    color: '#E2E8F0',
    fontFamily: 'HindSiliguri_500Medium',
  },
  labelOrtho: {
    color: '#10B981',
    fontFamily: 'HindSiliguri_700Bold',
    fontSize: 14,
  },
  textOrtho: {
    color: '#CBD5E1',
    fontFamily: 'HindSiliguri_400Regular',
  },
  fazilatBox: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#10B981',
  },
  fazilatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  labelFazilat: {
    color: '#34D399',
    fontFamily: 'HindSiliguri_700Bold',
    fontSize: 13,
  },
  textFazilat: {
    color: '#E2E8F0',
    fontFamily: 'HindSiliguri_400Regular',
    fontSize: 13,
    lineHeight: 21,
  },
  referenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingTop: 4,
  },
  referenceText: {
    color: '#6EE7B7',
    fontFamily: 'HindSiliguri_400Regular',
    fontSize: 12,
  },
  footerRow: {
    borderTopWidth: 1,
    borderTopColor: '#172A22',
    paddingTop: 12,
  },
  readButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#162821',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#244237',
  },
  readButtonActive: {
    backgroundColor: '#065F46',
    borderColor: '#10B981',
  },
  readButtonText: {
    fontSize: 13,
    color: '#CBD5E1',
    fontFamily: 'HindSiliguri_600SemiBold',
  },
  readButtonTextActive: {
    color: '#FFFFFF',
  },
});
