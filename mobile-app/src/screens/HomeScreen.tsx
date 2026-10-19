import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { CategoryId } from '../types/dua';
import { OverallProgressCard } from '../components/OverallProgressCard';
import { CategoryCard } from '../components/CategoryCard';
import { formatArabicText } from '../utils/text';
import { ARABIC_TYPOGRAPHY, getArabicLineHeight } from '../constants/typography';
import { useDuaData } from '../context/DuaDataContext';

interface HomeScreenProps {
  onSelectCategory: (categoryId: CategoryId) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onSelectCategory }) => {
  const { categories } = useDuaData();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Daily Overall Progress Summary */}
      <OverallProgressCard />

      {/* Categories Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>দোয়ার বিভাগসমূহ</Text>
        <Text style={styles.sectionSubtitle}>যেকোনো বিভাগে ক্লিক করে দোয়া পড়ুন</Text>
      </View>

      {/* Dynamic Category Cards */}
      {categories.map((cat) => (
        <CategoryCard
          key={cat.id}
          category={cat}
          onPress={() => onSelectCategory(cat.id)}
        />
      ))}

      {/* Islamic Quote Card */}
      <View style={styles.quoteCard}>
        <Text style={[styles.quoteArabic, { letterSpacing: ARABIC_TYPOGRAPHY.letterSpacing }]}>
          {formatArabicText('أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ')}
        </Text>
        <Text style={styles.quoteBangla}>
          "জেনে রেখো, একমাত্র আল্লাহর স্মরণেই অন্তরসমূহ প্রশান্তি লাভ করে।"
        </Text>
        <Text style={styles.quoteSource}>— সূরা আর-রা'দ, আয়াত: ২৮</Text>
      </View>
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
  sectionHeader: {
    paddingHorizontal: 12,
    marginTop: 14,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    fontFamily: 'NotoSansBengali_700Bold',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    fontFamily: 'NotoSansBengali_400Regular',
    marginTop: 2,
  },
  quoteCard: {
    backgroundColor: '#0D1613',
    borderRadius: 14,
    padding: 14,
    marginHorizontal: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#192C25',
    alignItems: 'center',
  },
  quoteArabic: {
    fontSize: 18,
    lineHeight: getArabicLineHeight(18),
    color: '#34D399',
    fontFamily: 'noorehuda',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: ARABIC_TYPOGRAPHY.letterSpacing,
  },
  quoteBangla: {
    fontSize: 13,
    color: '#CBD5E1',
    fontFamily: 'NotoSansBengali_500Medium',
    textAlign: 'center',
    lineHeight: 20,
  },
  quoteSource: {
    fontSize: 11,
    color: '#6EE7B7',
    fontFamily: 'NotoSansBengali_400Regular',
    marginTop: 6,
  },
});
