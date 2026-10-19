import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, BackHandler } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

import { SettingsProvider } from './src/context/SettingsContext';
import { DuaProgressProvider } from './src/context/DuaProgressContext';
import { Header } from './src/components/Header';
import { SettingsModal } from './src/components/SettingsModal';
import { HomeScreen } from './src/screens/HomeScreen';
import { CategoryDetailScreen } from './src/screens/CategoryDetailScreen';
import { Category, CategoryId } from './src/types/dua';
import categoriesDataRaw from './src/data/categories.json';

const categories: Category[] = categoriesDataRaw as Category[];

// Prevent splash screen from auto-hiding until assets are loaded
SplashScreen.preventAutoHideAsync().catch(() => {});

function MainContent() {
  const [activeCategoryId, setActiveCategoryId] = useState<CategoryId | null>(null);
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);

  useEffect(() => {
    const onBackPress = () => {
      if (isSettingsVisible) {
        setIsSettingsVisible(false);
        return true;
      }
      if (activeCategoryId !== null) {
        setActiveCategoryId(null);
        return true;
      }
      return false;
    };

    const backSubscription = BackHandler.addEventListener(
      'hardwareBackPress',
      onBackPress
    );

    return () => backSubscription.remove();
  }, [activeCategoryId, isSettingsVisible]);

  const activeCategory = categories.find((c) => c.id === activeCategoryId);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar style="light" />

      {/* Top Header */}
      <Header
        showBack={activeCategoryId !== null}
        onBack={() => setActiveCategoryId(null)}
        title={activeCategory ? activeCategory.titleBangla : undefined}
        subtitle={activeCategory ? activeCategory.timeBangla : undefined}
        onOpenSettings={() => setIsSettingsVisible(true)}
      />

      {/* Main Screens */}
      <View style={styles.screenContainer}>
        {activeCategoryId === null ? (
          <HomeScreen onSelectCategory={(catId) => setActiveCategoryId(catId)} />
        ) : (
          <CategoryDetailScreen categoryId={activeCategoryId} />
        )}
      </View>

      {/* Settings Modal */}
      <SettingsModal
        visible={isSettingsVisible}
        onClose={() => setIsSettingsVisible(false)}
      />
    </SafeAreaView>
  );
}

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    noorehuda: require('./assets/fonts/noorehuda.ttf'),
    // Primary reliable Bangla font: Noto Sans Bengali
    NotoSansBengali_400Regular: require('./assets/fonts/NotoSansBengali-Regular.ttf'),
    NotoSansBengali_500Medium: require('./assets/fonts/NotoSansBengali-Medium.ttf'),
    NotoSansBengali_600SemiBold: require('./assets/fonts/NotoSansBengali-SemiBold.ttf'),
    NotoSansBengali_700Bold: require('./assets/fonts/NotoSansBengali-Bold.ttf'),
    // Backward-compatibility aliases so all existing styles render flawlessly
    HindSiliguri_400Regular: require('./assets/fonts/NotoSansBengali-Regular.ttf'),
    HindSiliguri_500Medium: require('./assets/fonts/NotoSansBengali-Medium.ttf'),
    HindSiliguri_600SemiBold: require('./assets/fonts/NotoSansBengali-SemiBold.ttf'),
    HindSiliguri_700Bold: require('./assets/fonts/NotoSansBengali-Bold.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <SettingsProvider>
        <DuaProgressProvider>
          <MainContent />
        </DuaProgressProvider>
      </SettingsProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0A0F0D',
  },
  screenContainer: {
    flex: 1,
    backgroundColor: '#0A0F0D',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0A0F0D',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
