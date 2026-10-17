import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getFormattedBanglaDate } from '../utils/date';

interface HeaderProps {
  onOpenSettings: () => void;
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSettings,
  title,
  showBack = false,
  onBack,
  subtitle,
}) => {
  const currentDate = getFormattedBanglaDate();

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        {showBack ? (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onBack}
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="arrow-back" size={24} color="#F8FAFC" />
          </TouchableOpacity>
        ) : (
          <View style={styles.logoRow}>
            <View style={styles.logoBadge}>
              <Ionicons name="book" size={18} color="#10B981" />
            </View>
            <View>
              <Text style={styles.appName}>Daily Dua</Text>
              <Text style={styles.appBangla}>দৈনিক দোয়া</Text>
            </View>
          </View>
        )}

        {showBack && (
          <View style={styles.titleContainer}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {title}
            </Text>
            {subtitle && (
              <Text style={styles.headerSubtitle} numberOfLines={1}>
                {subtitle}
              </Text>
            )}
          </View>
        )}

        <TouchableOpacity
          style={styles.iconButton}
          onPress={onOpenSettings}
          activeOpacity={0.7}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="settings-outline" size={22} color="#94A3B8" />
        </TouchableOpacity>
      </View>

      {!showBack && (
        <View style={styles.dateBanner}>
          <Ionicons name="calendar-outline" size={14} color="#10B981" style={{ marginRight: 6 }} />
          <Text style={styles.dateText}>{currentDate}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 16,
    backgroundColor: '#0A0F0D',
    borderBottomWidth: 1,
    borderBottomColor: '#16221D',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  appBangla: {
    fontSize: 12,
    color: '#10B981',
    fontFamily: 'HindSiliguri_500Medium',
  },
  titleContainer: {
    flex: 1,
    marginHorizontal: 12,
  },
  headerTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    fontFamily: 'HindSiliguri_700Bold',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    fontFamily: 'HindSiliguri_400Regular',
    marginTop: 2,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#131F1C',
    borderWidth: 1,
    borderColor: '#1F332E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    backgroundColor: '#101B17',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#192C25',
  },
  dateText: {
    fontSize: 12,
    color: '#CBD5E1',
    fontFamily: 'HindSiliguri_500Medium',
  },
});
