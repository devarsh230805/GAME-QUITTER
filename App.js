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
import { SafeAreaProvider,SafeAreaView } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/context/AuthContext';

export default function App() {
  return (
   <SafeAreaProvider>
    <AuthProvider>
      <AppProvider>
        <AppInner />
      </AppProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

function AppInner() {
  const { firstOpenDone, setFirstOpenDone, running } = useApp();
  
  // Get theme colors based on whether game is actually running
  const themeColors = getThemeColors(running);
  const [tab, setTab] = useState('home');
  const [flow, setFlow] = useState('splash'); // splash | onboarding | main
  const [step, setStep] = useState('welcome'); // welcome | welcome2 | welcome3 | quiz | ritual | auth | goals
  const { user, loading } = useAuth();


  useEffect(() => {
    if (loading) return; // Wait until user session loads

    if (user) {
      // ✅ Logged-in user → go directly to main
      setFlow('main');
    } else if (firstOpenDone) {
      // ✅ Already opened before → go to auth directly
      setFlow('onboarding');
      setStep('auth');
    } else {
      // 🆕 First time user → go through onboarding flow
      setFlow('splash');
    }
  }, [user, loading, firstOpenDone]);

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
  const bgColor = running ? themeColors.background : '#FFFFFF';
  
  const dynamicStyles = {
    container: {
      flex: 1,
      backgroundColor: bgColor,
    },
    content: {
      flex: 1,
    },
    tabbar: {
      flexDirection: 'row',
      backgroundColor: bgColor,
      borderTopWidth: 1,
      borderTopColor: running ? themeColors.border : '#E5E7EB',
      paddingVertical: 6,
      paddingHorizontal: 16,
      justifyContent: 'space-between',
    },
  };

  return (
    <SafeAreaView style={[dynamicStyles.container, { backgroundColor: bgColor }]}>
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
            <TabButton icon={<HouseIcon size={22} />} active={tab === 'home'} onPress={() => setTab('home')} themeColors={themeColors} /> 
            <TabButton icon={<GameControllerIcon size={22} />} active={tab === 'game'} onPress={() => setTab('game')} themeColors={themeColors} />
            <TabButton icon={<ChartLineIcon size={22} />} active={tab === 'stats'} onPress={() => setTab('stats')} themeColors={themeColors} />
            <TabButton icon={<UserIcon size={22} />} active={tab === 'profile'} onPress={() => setTab('profile')} themeColors={themeColors} />
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

function TabButton({ icon, onPress, active, themeColors }) {
  const { running } = useApp();
  
  const iconColor = active 
    ? (running ? '#0D0D0D' : themeColors.primary)
    : (running ? themeColors.textDim : '#666');

  const dynamicTabStyles = {
    btn: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 16,
      marginHorizontal: 4,
      backgroundColor: 'transparent',
    },
    active: {
      backgroundColor: 'transparent',
    },
    pressed: {
      backgroundColor: running ? themeColors.border : '#E5E5E5',
      opacity: 0.5,
    },
  };

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [
      dynamicTabStyles.btn,
      pressed && dynamicTabStyles.pressed,
    ]}>
      {React.cloneElement(icon, {
        color: iconColor,
        weight: active ? 'fill' : 'regular',
        size: 22
      })}
    </Pressable>
  );
}
