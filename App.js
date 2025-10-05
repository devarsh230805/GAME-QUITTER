import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { AppProvider, useApp } from './src/store/AppContext';
import { colors, spacing, typography, getThemeColors } from './src/theme/tokens';
import SplashScreen from './src/screens/SplashScreen';
import OnboardingWelcome from './src/screens/OnboardingWelcome';
import OnboardingWelcome2 from './src/screens/OnboardingWelcome2';
import OnboardingWelcome3 from './src/screens/OnboardingWelcome3';
import OnboardingQuizAdvanced from './src/screens/OnboardingQuizAdvanced';
import OnboardingRitual from './src/screens/OnboardingRitual';
import OnboardingAuth from './src/screens/OnboardingAuth';
import DailyGoalsSetup from './src/screens/DailyGoalsSetup';
import HomeLightScreen from './src/screens/HomeLightScreen';
import GameModeScreen from './src/screens/GameModeScreen';
import StatsHistoryScreen from './src/screens/StatsHistoryScreen';
import ProfileEditorScreen from './src/screens/ProfileEditorScreen';
import {HouseIcon, GameControllerIcon, ChartLineIcon, UserIcon} from 'phosphor-react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  );
}

function AppInner() {
  const { firstOpenDone, setFirstOpenDone, running } = useApp();
  
  // Get theme colors based on whether game is actually running
  const themeColors = getThemeColors(running);
  const [tab, setTab] = useState('home');
  const [flow, setFlow] = useState('splash'); // splash | onboarding | main
  const [step, setStep] = useState('welcome'); // welcome | welcome2 | welcome3 | quiz | ritual | auth | goals

  useEffect(() => {
    if (flow === 'splash') {
      // Splash finishes and decides next step
      // Decision happens in SplashScreen onDone
    }
  }, [flow]);

  const renderMain = () => {
    switch (tab) {
      case 'home':
        return (
          <HomeLightScreen
            onStart={() => setTab('stats')}
            openGameMode={() => setTab('game')}
            openStats={() => setTab('stats')}
            openProfile={() => setTab('profile')}
          />
        );
      case 'game':
        return <GameModeScreen onClose={() => setTab('home')} onGoToStats={() => setTab('stats')} />;
      // log screen removed; logging is now inside Game Mode
      case 'stats':
        return <StatsHistoryScreen />;
      case 'profile':
        return <ProfileEditorScreen />;
      default:
        return <HomeLightScreen />;
    }
  };

  // Create dynamic styles
  const dynamicStyles = {
    container: {
      flex: 1,
      backgroundColor: themeColors.background,
    },
    content: {
      flex: 1,
    },
    tabbar: {
      flexDirection: 'row',
      backgroundColor: running ? themeColors.surface : '#ffffff',
      borderTopWidth: 1,
      borderTopColor: running ? themeColors.border : '#E0E0E0',
      paddingVertical: 8,
      paddingHorizontal: 16,
      justifyContent: 'space-between',
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: -2 },
      elevation: 8,
    },
  };

  return (
    <SafeAreaView style={dynamicStyles.container}>
      <StatusBar style={running ? "light" : "dark"} />
      {flow === 'splash' && (
        <SplashScreen onDone={() => setFlow(firstOpenDone ? 'main' : 'onboarding')} />
      )}

      {flow === 'onboarding' && (
        <View style={{ flex: 1 }}>
          {step === 'welcome' && (
            <OnboardingWelcome onSkip={() => setStep('welcome2')} onNext={() => setStep('welcome2')} />
          )}
          {step === 'welcome2' && (
            <OnboardingWelcome2 onNext={() => setStep('welcome3')} />
          )}
          {step === 'welcome3' && (
            <OnboardingWelcome3 onNext={() => setStep('quiz')} />
          )}
          {step === 'quiz' && (
            <OnboardingQuizAdvanced onComplete={() => setStep('ritual')} onSkip={() => setStep('ritual')} />
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
          <View style={dynamicStyles.content}>{renderMain()}</View>
          <View style={dynamicStyles.tabbar}>
            <TabButton icon={<HouseIcon size={24} />} active={tab === 'home'} onPress={() => setTab('home')} themeColors={themeColors} /> 
            <TabButton icon={<GameControllerIcon size={24} />} active={tab === 'game'} onPress={() => setTab('game')} themeColors={themeColors} />
            {/* Log tab removed; logging is in Game Mode */}
            <TabButton icon={<ChartLineIcon size={24} />} active={tab === 'stats'} onPress={() => setTab('stats')} themeColors={themeColors} />
            <TabButton icon={<UserIcon size={24} />} active={tab === 'profile'} onPress={() => setTab('profile')} themeColors={themeColors} />
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

function TabButton({ icon, onPress, active, themeColors }) {
  const { running } = useApp();
  
  const dynamicTabStyles = {
    btn: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.xs,
      borderRadius: 12,
      marginHorizontal: spacing.xs,
      backgroundColor: 'transparent',
    },
    active: {
      backgroundColor: running ? themeColors.primaryDim : '#F0F0F0',
    },
    pressed: {
      backgroundColor: running ? themeColors.border : '#E5E5E5',
      opacity: 1,
    },
    icon: {
      fontSize: 20,
      color: running ? themeColors.textDim : '#666',
    },
    iconActive: {
      color: running ? themeColors.primary : '#25D366',
      fontWeight: 'bold',
    },
  };

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [
      dynamicTabStyles.btn,
      active && dynamicTabStyles.active,
      pressed && dynamicTabStyles.pressed,
    ]}>
      <Text style={[dynamicTabStyles.icon, active && dynamicTabStyles.iconActive]}>{icon}</Text>
    </Pressable>
  );
}
