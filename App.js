import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { AppProvider, useApp } from './src/store/AppContext';
import { colors, spacing, typography } from './src/theme/tokens';
import SplashScreen from './src/screens/SplashScreen';
import OnboardingWelcome from './src/screens/OnboardingWelcome';
import OnboardingRitual from './src/screens/OnboardingRitual';
import OnboardingAuth from './src/screens/OnboardingAuth';
import DailyGoalsSetup from './src/screens/DailyGoalsSetup';
import HomeLightScreen from './src/screens/HomeLightScreen';
import ProgressLightScreen from './src/screens/ProgressLightScreen';
import CommunityLightScreen from './src/screens/CommunityLightScreen';
import ProfileLightScreen from './src/screens/ProfileLightScreen';
import GameModeScreen from './src/screens/GameModeScreen';
import RetroLogScreen from './src/screens/RetroLogScreen';
import StatsHistoryScreen from './src/screens/StatsHistoryScreen';
import ProfileEditorScreen from './src/screens/ProfileEditorScreen';

export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  );
}

function AppInner() {
  const { firstOpenDone, setFirstOpenDone } = useApp();
  const [tab, setTab] = useState('home');
  const [flow, setFlow] = useState('splash'); // splash | onboarding | main
  const [step, setStep] = useState('welcome'); // welcome | ritual | auth | goals

  const [showGameMode, setShowGameMode] = useState(false);
  const [showRetro, setShowRetro] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    if (flow === 'splash') {
      // Splash finishes and decides next step
      // Decision happens in SplashScreen onDone
    }
  }, [flow]);

  const renderMain = () => {
    switch (tab) {
      case 'home':
      default:
        return (
          <HomeLightScreen
            onStart={() => setShowStats(true)}
            openGameMode={() => setShowGameMode(true)}
            openRetro={() => setShowRetro(true)}
            openStats={() => setShowStats(true)}
            openProfile={() => setShowProfile(true)}
          />
        );
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      {flow === 'splash' && (
        <SplashScreen onDone={() => setFlow(firstOpenDone ? 'main' : 'onboarding')} />
      )}

      {flow === 'onboarding' && (
        <View style={{ flex: 1 }}>
          {step === 'welcome' && (
            <OnboardingWelcome onSkip={() => setStep('ritual')} onNext={() => setStep('ritual')} />
          )}
          {step === 'ritual' && (
            <OnboardingRitual onCommitted={() => setStep('auth')} />
          )}
          {step === 'auth' && (
            <OnboardingAuth onDone={() => setStep('goals')} />
          )}
          {step === 'goals' && (
            <DailyGoalsSetup onDone={() => { setFirstOpenDone(true); setFlow('main'); }} />
          )}
        </View>
      )}

      {flow === 'main' && (
        <>
          <View style={styles.content}>{renderMain()}</View>
          <View style={styles.tabbar}>
            <TabButton icon="⌂" active={true} onPress={() => setTab('home')} />
            <TabButton icon="▶" active={false} onPress={() => setShowGameMode(true)} />
            <TabButton icon="✓" active={false} onPress={() => setShowRetro(true)} />
            <TabButton icon="≣" active={false} onPress={() => setShowStats(true)} />
          </View>

          {showGameMode && <GameModeScreen onClose={() => setShowGameMode(false)} />}
          {showRetro && <RetroLogScreen onClose={() => setShowRetro(false)} />}
          {showStats && <StatsHistoryScreen onClose={() => setShowStats(false)} />}
          {showProfile && <ProfileEditorScreen onClose={() => setShowProfile(false)} />}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  tabbar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#EDEDED',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -2 },
  },
});

function TabButton({ icon, onPress, active }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [
      tabBtnStyles.btn,
      active && tabBtnStyles.active,
      pressed && tabBtnStyles.pressed,
    ]}>
      <Text style={[tabBtnStyles.icon, active && tabBtnStyles.iconActive]}>{icon}</Text>
    </Pressable>
  );
}

const tabBtnStyles = StyleSheet.create({
  btn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
    borderRadius: 12,
    marginHorizontal: spacing.xs,
  },
  active: {
    backgroundColor: '#F5F5F5',
  },
  pressed: {
    opacity: 0.8,
  },
  icon: {
    fontSize: 18,
    color: '#000',
  },
  iconActive: {
    color: '#000',
    fontWeight: '900',
  },
});
