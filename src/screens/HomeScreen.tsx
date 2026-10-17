import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Category, CategoryId } from '../types/dua';
import { OverallProgressCard } from '../components/OverallProgressCard';
import { CategoryCard } from '../components/CategoryCard';
import categoriesDataRaw from '../data/categories.json';

const categories: Category[] = categoriesDataRaw as Category[];

interface HomeScreenProps {
  onSelectCategory: (categoryId: CategoryId) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onSelectCategory }) => {
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

      {/* 3 Main Category Cards */}
      {categories.map((cat) => (
        <CategoryCard
          key={cat.id}
          category={cat}
          onPress={() => onSelectCategory(cat.id)}
        />
      ))}

      {/* Islamic Quote Card */}
      <View style={styles.quoteCard}>
        <Text style={styles.quoteArabic}>أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ</Text>
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
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    fontFamily: 'HindSiliguri_700Bold',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    fontFamily: 'HindSiliguri_400Regular',
    marginTop: 2,
  },
  quoteCard: {
    backgroundColor: '#0D1613',
    borderRadius: 16,
    padding: 18,
    marginHorizontal: 20,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#192C25',
    alignItems: 'center',
  },
  quoteArabic: {
    fontSize: 18,
    color: '#34D399',
    fontFamily: 'AlMajeed',
    textAlign: 'center',
    marginBottom: 8,
  },
  quoteBangla: {
    fontSize: 13,
    color: '#CBD5E1',
    fontFamily: 'HindSiliguri_500Medium',
    textAlign: 'center',
    lineHeight: 20,
  },
  quoteSource: {
    fontSize: 11,
    color: '#6EE7B7',
    fontFamily: 'HindSiliguri_400Regular',
    marginTop: 6,
  },
});
