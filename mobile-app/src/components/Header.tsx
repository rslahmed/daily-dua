import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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
            <Image
              source={require('../../assets/icon.png')}
              style={styles.logoBadge}
            />
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 14,
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
    fontFamily: 'NotoSansBengali_500Medium',
  },
  titleContainer: {
    flex: 1,
    marginHorizontal: 12,
  },
  headerTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    fontFamily: 'NotoSansBengali_700Bold',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    fontFamily: 'NotoSansBengali_400Regular',
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
});
