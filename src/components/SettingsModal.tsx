import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '../context/SettingsContext';
import { useDuaProgress } from '../context/DuaProgressContext';
import { toBanglaNumber } from '../utils/date';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ visible, onClose }) => {
  const {
    showUccharon,
    showOrtho,
    showFazilat,
    arabicFontSize,
    setShowUccharon,
    setShowOrtho,
    setShowFazilat,
    setArabicFontSize,
  } = useSettings();

  const { resetTodayProgress } = useDuaProgress();

  const handleResetProgress = () => {
    Alert.alert(
      'অগ্রগতি রিসেট করুন',
      'আপনি কি আজকের সমস্ত পড়ার চিহ্ন মুছে ফেলতে চান?',
      [
        { text: 'বাতিল', style: 'cancel' },
        {
          text: 'হ্যাঁ, রিসেট করুন',
          style: 'destructive',
          onPress: async () => {
            await resetTodayProgress();
          },
        },
      ]
    );
  };

  const fontSizes = [
    { label: 'ছোট', size: 22 },
    { label: 'সাধারণ', size: 26 },
    { label: 'বড়', size: 30 },
    { label: 'খুব বড়', size: 34 },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconBox}>
                <Ionicons name="settings" size={20} color="#10B981" />
              </View>
              <Text style={styles.headerTitle}>অ্যাপ সেটিংস</Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={22} color="#CBD5E1" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Display Preferences Section */}
            <View style={styles.section}>
              <Text style={styles.sectionHeader}>দোয়া প্রদর্শনী কাস্টমাইজেশন</Text>
              <Text style={styles.sectionDesc}>
                আপনার সুবিধা অনুযায়ী দোয়ার বিবরণ প্রদর্শন বা লুকান:
              </Text>

              {/* Toggle Uccharon */}
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>উচ্চারণ প্রদর্শন করুন</Text>
                  <Text style={styles.settingSubtitle}>বাংলায় উচ্চারণ দেখতে অন রাখুন</Text>
                </View>
                <Switch
                  value={showUccharon}
                  onValueChange={setShowUccharon}
                  trackColor={{ false: '#263832', true: '#10B981' }}
                  thumbColor={showUccharon ? '#FFFFFF' : '#94A3B8'}
                />
              </View>

              {/* Toggle Ortho */}
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>অর্থ প্রদর্শন করুন</Text>
                  <Text style={styles.settingSubtitle}>বাংলা অনুবাদ দেখতে অন রাখুন</Text>
                </View>
                <Switch
                  value={showOrtho}
                  onValueChange={setShowOrtho}
                  trackColor={{ false: '#263832', true: '#10B981' }}
                  thumbColor={showOrtho ? '#FFFFFF' : '#94A3B8'}
                />
              </View>

              {/* Toggle Fazilat */}
              <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>ফযীলত প্রদর্শন করুন</Text>
                  <Text style={styles.settingSubtitle}>দোয়ার ফজিলত ও তাৎপর্য প্রদর্শন</Text>
                </View>
                <Switch
                  value={showFazilat}
                  onValueChange={setShowFazilat}
                  trackColor={{ false: '#263832', true: '#10B981' }}
                  thumbColor={showFazilat ? '#FFFFFF' : '#94A3B8'}
                />
              </View>
            </View>

            {/* Arabic Font Size Section */}
            <View style={styles.section}>
              <Text style={styles.sectionHeader}>আরবি ফন্ট সাইজ (Al Majeed Quranic Font)</Text>
              <View style={styles.fontSizeOptions}>
                {fontSizes.map((f) => {
                  const isSelected = arabicFontSize === f.size;
                  return (
                    <TouchableOpacity
                      key={f.size}
                      style={[
                        styles.fontSizeButton,
                        isSelected && styles.fontSizeButtonSelected,
                      ]}
                      onPress={() => setArabicFontSize(f.size)}
                    >
                      <Text
                        style={[
                          styles.fontSizeButtonText,
                          isSelected && styles.fontSizeButtonTextSelected,
                        ]}
                      >
                        {f.label} ({toBanglaNumber(f.size)})
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Preview Box */}
              <View style={styles.previewBox}>
                <Text style={styles.previewLabel}>লাইভ প্রিভিউ:</Text>
                <Text
                  style={[
                    styles.previewArabic,
                    {
                      fontSize: arabicFontSize,
                      lineHeight: Math.round(arabicFontSize * 1.9),
                    },
                  ]}
                >
                  بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                </Text>
              </View>
            </View>

            {/* Reset Today's Progress */}
            <View style={styles.section}>
              <Text style={styles.sectionHeader}>অগ্রগতি ব্যবস্থাপনা</Text>
              <TouchableOpacity
                style={styles.resetButton}
                onPress={handleResetProgress}
                activeOpacity={0.7}
              >
                <Ionicons name="refresh" size={18} color="#EF4444" style={{ marginRight: 8 }} />
                <Text style={styles.resetButtonText}>আজকের পড়ার অগ্রগতি রিসেট করুন</Text>
              </TouchableOpacity>
            </View>

            {/* App Info */}
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>Daily Dua (দৈনিক দোয়া) • সংস্করণ ১.০.০</Text>
              <Text style={styles.infoSubtext}>
                সম্পূর্ণ অফলাইন ইসলামিক দোয়া অ্যাপ • কোনো লগইন প্রয়োজন নেই
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#0E1714',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    borderWidth: 1,
    borderColor: '#1C332A',
    borderBottomWidth: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#1A2E26',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    fontFamily: 'HindSiliguri_700Bold',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#162520',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    padding: 20,
  },
  section: {
    backgroundColor: '#121E19',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1D352B',
  },
  sectionHeader: {
    fontSize: 15,
    color: '#FFFFFF',
    fontFamily: 'HindSiliguri_700Bold',
    marginBottom: 4,
  },
  sectionDesc: {
    fontSize: 12,
    color: '#94A3B8',
    fontFamily: 'HindSiliguri_400Regular',
    marginBottom: 14,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#192C24',
  },
  settingInfo: {
    flex: 1,
    paddingRight: 12,
  },
  settingTitle: {
    fontSize: 14,
    color: '#E2E8F0',
    fontFamily: 'HindSiliguri_600SemiBold',
  },
  settingSubtitle: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: 'HindSiliguri_400Regular',
    marginTop: 2,
  },
  fontSizeOptions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
    marginBottom: 14,
  },
  fontSizeButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#172721',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#243D32',
  },
  fontSizeButtonSelected: {
    backgroundColor: '#065F46',
    borderColor: '#10B981',
  },
  fontSizeButtonText: {
    fontSize: 12,
    color: '#94A3B8',
    fontFamily: 'HindSiliguri_600SemiBold',
  },
  fontSizeButtonTextSelected: {
    color: '#FFFFFF',
  },
  previewBox: {
    backgroundColor: '#0A120F',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1B2E26',
  },
  previewLabel: {
    fontSize: 11,
    color: '#10B981',
    fontFamily: 'HindSiliguri_500Medium',
    marginBottom: 6,
  },
  previewArabic: {
    color: '#FFFFFF',
    fontFamily: 'AlMajeed',
    textAlign: 'center',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 8,
  },
  resetButtonText: {
    color: '#F87171',
    fontSize: 13,
    fontFamily: 'HindSiliguri_600SemiBold',
  },
  infoBox: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingBottom: 36,
  },
  infoText: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: 'HindSiliguri_500Medium',
  },
  infoSubtext: {
    fontSize: 11,
    color: '#475569',
    fontFamily: 'HindSiliguri_400Regular',
    marginTop: 3,
  },
});
