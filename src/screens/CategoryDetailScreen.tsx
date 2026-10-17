import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Category, CategoryId, Dua } from '../types/dua';
import { DuaCard } from '../components/DuaCard';
import { ProgressBar } from '../components/ProgressBar';
import { useDuaProgress } from '../context/DuaProgressContext';
import { toBanglaNumber } from '../utils/date';
import duasDataRaw from '../data/duas.json';
import categoriesDataRaw from '../data/categories.json';

const allDuas: Dua[] = duasDataRaw as Dua[];
const categories: Category[] = categoriesDataRaw as Category[];

interface CategoryDetailScreenProps {
  categoryId: CategoryId;
}

type FilterTab = 'all' | 'unread' | 'read';

export const CategoryDetailScreen: React.FC<CategoryDetailScreenProps> = ({ categoryId }) => {
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const { isDuaRead, getCategoryProgress } = useDuaProgress();

  const currentCategory = categories.find((c) => c.id === categoryId) || categories[0];
  const categoryDuas = allDuas.filter((d) => d.categoryId === categoryId);

  const { completed, total, percentage } = getCategoryProgress(categoryId);

  const filteredDuas = categoryDuas.filter((d) => {
    const isRead = isDuaRead(d.id);
    if (activeTab === 'unread') return !isRead;
    if (activeTab === 'read') return isRead;
    return true;
  });

  const unreadCount = total - completed;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Category Progress Banner */}
      <View style={styles.banner}>
        <View style={styles.bannerTop}>
          <View>
            <Text style={styles.bannerTitle}>{currentCategory.titleBangla}</Text>
            <Text style={styles.bannerSubtitle}>{currentCategory.timeBangla}</Text>
          </View>
          <View style={styles.bannerBadge}>
            <Text style={styles.bannerBadgeText}>
              {toBanglaNumber(completed)}/{toBanglaNumber(total)} সম্পন্ন
            </Text>
          </View>
        </View>

        <View style={styles.progressBarWrapper}>
          <ProgressBar
            progress={percentage}
            height={6}
            color={completed === total && total > 0 ? '#34D399' : '#10B981'}
            backgroundColor="#1A2D25"
          />
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'all' && styles.tabActive]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}>
            সব দোয়া ({toBanglaNumber(total)})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'unread' && styles.tabActive]}
          onPress={() => setActiveTab('unread')}
        >
          <Text style={[styles.tabText, activeTab === 'unread' && styles.tabTextActive]}>
            বাকি আছে ({toBanglaNumber(unreadCount)})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'read' && styles.tabActive]}
          onPress={() => setActiveTab('read')}
        >
          <Text style={[styles.tabText, activeTab === 'read' && styles.tabTextActive]}>
            পড়া হয়েছে ({toBanglaNumber(completed)})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Dua Cards List */}
      {filteredDuas.length > 0 ? (
        filteredDuas.map((dua, index) => (
          <DuaCard key={dua.id} dua={dua} index={index} />
        ))
      ) : (
        <View style={styles.emptyBox}>
          <Ionicons
            name={activeTab === 'unread' ? 'checkmark-circle-outline' : 'book-outline'}
            size={48}
            color="#10B981"
            style={{ marginBottom: 12 }}
          />
          <Text style={styles.emptyTitle}>
            {activeTab === 'unread'
              ? 'মাশাআল্লাহ! সমস্ত দোয়া পড়া সম্পন্ন হয়েছে।'
              : 'এখনো কোনো দোয়া পড়া হয়নি।'}
          </Text>
          <Text style={styles.emptySubtitle}>
            {activeTab === 'unread'
              ? 'আল্লাহ আপনার আমল কবুল করুন।'
              : 'দোয়া পড়ে "পড়া হয়েছে" বাটনে ক্লিক করুন।'}
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0F0D',
  },
  contentContainer: {
    paddingBottom: 40,
  },
  banner: {
    backgroundColor: '#111D19',
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 14,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#192C25',
  },
  bannerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bannerTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    fontFamily: 'HindSiliguri_700Bold',
  },
  bannerSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    fontFamily: 'HindSiliguri_400Regular',
    marginTop: 2,
  },
  bannerBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  bannerBadgeText: {
    fontSize: 12,
    color: '#34D399',
    fontFamily: 'HindSiliguri_600SemiBold',
  },
  progressBarWrapper: {
    marginTop: 2,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#111D19',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: '#172721',
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: '#065F46',
  },
  tabText: {
    fontSize: 12,
    color: '#94A3B8',
    fontFamily: 'HindSiliguri_500Medium',
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontFamily: 'HindSiliguri_600SemiBold',
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
    backgroundColor: '#111D19',
    marginHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1C332A',
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'HindSiliguri_600SemiBold',
    textAlign: 'center',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    fontFamily: 'HindSiliguri_400Regular',
    textAlign: 'center',
  },
});
