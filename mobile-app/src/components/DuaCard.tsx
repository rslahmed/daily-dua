import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Dua } from '../types/dua';
import { useDuaProgress } from '../context/DuaProgressContext';
import { useSettings } from '../context/SettingsContext';
import { toBanglaNumber } from '../utils/date';
import { formatArabicText } from '../utils/text';
import { ARABIC_TYPOGRAPHY, getArabicLineHeight } from '../constants/typography';

interface DuaCardProps {
  dua: Dua;
  index: number;
}

export const DuaCard: React.FC<DuaCardProps> = ({ dua, index }) => {
  const { isDuaRead, toggleDuaRead } = useDuaProgress();
  const { showUccharon, showOrtho, showFazilat, arabicFontSize } = useSettings();

  const isNamaz = dua.categoryId === 'namaz';
  const isRead = !isNamaz && isDuaRead(dua.id);

  return (
    <View style={[styles.card, isRead && styles.cardRead]}>
      {/* Top Header: Serial & Title & Repetition Tag */}
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

        {/* Repetition Tag (Static text-only) */}
        <View style={styles.repetitionBadge}>
          <Text style={styles.repetitionText}>
            {dua.repetitionText}
          </Text>
        </View>
      </View>

      {/* Part 1: Arabic Text */}
      <View style={styles.arabicContainer}>
        <Text
          style={[
            styles.arabicText,
            {
              fontFamily: ARABIC_TYPOGRAPHY.fontFamily,
              fontSize: arabicFontSize,
              lineHeight: getArabicLineHeight(arabicFontSize),
              letterSpacing: ARABIC_TYPOGRAPHY.letterSpacing,
            },
          ]}
        >
          {formatArabicText(dua.arabic)}
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

      {/* Part 5: Reference */}
      {dua.referenceBangla && (
        <View style={[styles.referenceRow, isNamaz && styles.referenceRowLast]}>
          <Ionicons name="bookmark-outline" size={13} color="#6EE7B7" style={{ marginTop: 2, marginRight: 6 }} />
          <Text style={styles.referenceText}>{dua.referenceBangla}</Text>
        </View>
      )}

      {/* Bottom Action: Mark As Read Button (not needed for namaj duas) */}
      {!isNamaz && (
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
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#111D19',
    borderRadius: 14,
    marginHorizontal: 12,
    marginBottom: 12,
    padding: 12,
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
    marginBottom: 12,
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
    fontFamily: 'NotoSansBengali_600SemiBold',
  },
  serialTextRead: {
    color: '#34D399',
  },
  duaTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'NotoSansBengali_700Bold',
    flex: 1,
  },
  repetitionBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  repetitionText: {
    fontSize: 12,
    color: '#34D399',
    fontFamily: 'NotoSansBengali_600SemiBold',
  },
  arabicContainer: {
    paddingTop: 2,
    paddingBottom: 12,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1C332A',
  },
  arabicText: {
    color: '#FFFFFF',
    fontFamily: 'noorehuda',
    textAlign: 'right',
    writingDirection: 'rtl',
    letterSpacing: ARABIC_TYPOGRAPHY.letterSpacing,
  },
  sectionRow: {
    marginBottom: 10,
  },
  sectionContent: {
    fontSize: 14,
    lineHeight: 23,
  },
  labelUccharon: {
    color: '#34D399',
    fontFamily: 'NotoSansBengali_700Bold',
    fontSize: 14,
  },
  textUccharon: {
    color: '#E2E8F0',
    fontFamily: 'NotoSansBengali_500Medium',
  },
  labelOrtho: {
    color: '#10B981',
    fontFamily: 'NotoSansBengali_700Bold',
    fontSize: 14,
  },
  textOrtho: {
    color: '#CBD5E1',
    fontFamily: 'NotoSansBengali_400Regular',
  },
  fazilatBox: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
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
    fontFamily: 'NotoSansBengali_700Bold',
    fontSize: 13,
  },
  textFazilat: {
    color: '#E2E8F0',
    fontFamily: 'NotoSansBengali_400Regular',
    fontSize: 13,
    lineHeight: 21,
  },
  referenceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingTop: 2,
  },
  referenceRowLast: {
    marginBottom: 2,
  },
  referenceText: {
    color: '#6EE7B7',
    fontFamily: 'NotoSansBengali_400Regular',
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
  },
  footerRow: {
    borderTopWidth: 1,
    borderTopColor: '#172A22',
    paddingTop: 10,
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
    fontFamily: 'NotoSansBengali_600SemiBold',
  },
  readButtonTextActive: {
    color: '#FFFFFF',
  },
});
