import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { AppProvider, useApp } from "./src/store/AppContext";
import { getThemeColors, spacing, typography } from "./src/theme/tokens";
import SplashScreen from "./src/screens/SplashScreen";
import OnboardingWelcome from "./src/screens/OnboardingWelcome";
import OnboardingWelcome2 from "./src/screens/OnboardingWelcome2";
import OnboardingWelcome3 from "./src/screens/OnboardingWelcome3";
import OnboardingQuizAdvanced from "./src/screens/OnboardingQuizAdvanced";
import OnboardingRitual from "./src/screens/OnboardingRitual";
import OnboardingAuth from "./src/screens/OnboardingAuth";
import DailyGoalsSetup from "./src/screens/DailyGoalsSetup";
import HomeLightScreen from "./src/screens/HomeLightScreen";
import GameModeScreen from "./src/screens/GameModeScreen";
import StatsHistoryScreen from "./src/screens/StatsHistoryScreen";
import ProfileEditorScreen from "./src/screens/ProfileEditorScreen";
import SettingsScreen from "./src/screens/SettingsScreen";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { AuthProvider, useAuth } from "./src/context/AuthContext";

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
  const { firstOpenDone, setFirstOpenDone, running, themeMode } = useApp();
  const themeColors = getThemeColors(running, themeMode);
  const [tab, setTab] = useState("home");
  const [flow, setFlow] = useState("splash");
  const [step, setStep] = useState("welcome");
  const { user, loading } = useAuth();
  const [showEditor, setShowEditor] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (flow === "splash") return;

    if (user) {
      // If user exists, go to main flow only if onboarding is fully complete
      if (firstOpenDone) {
        setFlow("main");
      } else {
        setFlow("onboarding");
        setStep("goals");
      }
    } else {
      // No user session
      if (firstOpenDone) {
        // Only redirect to welcome when first entering onboarding
        if (flow !== "onboarding") {
          setFlow("onboarding");
          setStep("welcome");
        }
      } else {
        // Fresh install, not onboarded
        setFlow("onboarding");
        // If they are in the onboarding flow, maintain their current step unless they just finished one
        if (step === "goals") {
          // If they were at goals but logged out, go back to auth
          setStep("auth");
        }
      }
    }
  }, [user, loading, firstOpenDone, flow, step]);

  const renderMain = () => {
    switch (tab) {
      case "home":
        return (
          <HomeLightScreen
            onStart={() => setTab("stats")}
            openGameMode={() => setTab("game")}
            openStats={() => setTab("stats")}
            openProfile={() => setTab("profile")}
          />
        );
      case "game":
        return (
          <GameModeScreen
            onClose={() => setTab("home")}
            onGoToStats={() => setTab("stats")}
          />
        );
      case "stats":
        return <StatsHistoryScreen />;
      case "profile":
        return <SettingsScreen openEditor={() => setShowEditor(true)} />;
      default:
        return <HomeLightScreen />;
    }
  };

  const isGameMode = running || tab === "game";
  const isDark = themeMode === "dark";

  const getBackgroundGradient = () => {
    if (isDark) return ["#0F172A", "#1E293B"]; // Slate Dark
    return ["#F8FAFC", "#E2E8F0"]; // Slate Light
  };

  const dynamicStyles = {
    container: {
      flex: 1,
    },
    content: {
      flex: 1,
    },
    tabbar: {
      flexDirection: "row",
      backgroundColor: isDark
        ? "rgba(30, 41, 59, 0.95)"
        : "rgba(255, 255, 255, 0.95)",
      borderTopWidth: 1,
      borderTopColor: themeColors.border,
      paddingVertical: 10,
      paddingHorizontal: 14,
      justifyContent: "space-between",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.08,
      shadowRadius: 14,
      elevation: 10,
    },
  };

  // Remove early loading return to prevent "Loading..." hang.
  // SplashScreen will be shown while auth is loading.

  return (
    <LinearGradient
      colors={getBackgroundGradient()}
      style={dynamicStyles.container}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: "transparent" }}>
        <StatusBar style={running || themeMode === "dark" ? "light" : "dark"} />

        {flow === "splash" && (
          <SplashScreen
            themeColors={themeColors}
            onDone={() => {
              if (user) {
                if (firstOpenDone) {
                  setFlow("main");
                } else {
                  setFlow("onboarding");
                  setStep("goals");
                }
              } else {
                setFlow("onboarding");
                setStep("welcome");
              }
            }}
          />
        )}

        {flow === "onboarding" && (
          <View
            style={{
              flex: 1,
              backgroundColor: themeColors.background,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <View style={{ width: "100%", maxWidth: 480, flex: 1 }}>
              {step === "welcome" && (
                <OnboardingWelcome onNext={() => setStep("welcome2")} />
              )}
              {step === "welcome2" && (
                <OnboardingWelcome2
                  onNext={() => setStep("welcome3")}
                  onSkip={() => setStep("auth")}
                  onBack={() => setStep("welcome")}
                />
              )}
              {step === "welcome3" && (
                <OnboardingWelcome3
                  onNext={() => setStep("quiz")}
                  onSkip={() => setStep("auth")}
                  onBack={() => setStep("welcome2")}
                />
              )}
              {step === "quiz" && (
                <OnboardingQuizAdvanced
                  onComplete={() => setStep("ritual")}
                  onSkip={() => setStep("ritual")}
                  onBack={() => setStep("welcome3")}
                />
              )}
              {step === "ritual" && (
                <OnboardingRitual
                  onCommitted={() => setStep("auth")}
                  onSkip={() => setStep("auth")}
                  onBack={() => setStep("quiz")}
                />
              )}
              {step === "auth" && (
                <OnboardingAuth
                  onDone={() => setStep("goals")}
                  onBack={() => setStep("ritual")}
                />
              )}
              {step === "goals" && (
                <DailyGoalsSetup
                  themeColors={themeColors}
                  onDone={() => {
                    setFirstOpenDone(true);
                    setFlow("main");
                  }}
                  onBack={() => setStep("auth")}
                />
              )}
            </View>
          </View>
        )}

        {flow === "main" && (
          <>
            <View style={dynamicStyles.content}>{renderMain()}</View>
            <View style={dynamicStyles.tabbar}>
              <TabButton
                icon={<Ionicons name="home" size={24} />}
                active={tab === "home"}
                onPress={() => setTab("home")}
                themeColors={themeColors}
              />
              <TabButton
                icon={<Ionicons name="game-controller" size={24} />}
                active={tab === "game"}
                onPress={() => setTab("game")}
                themeColors={themeColors}
              />
              <TabButton
                icon={<Ionicons name="stats-chart" size={24} />}
                active={tab === "stats"}
                onPress={() => setTab("stats")}
                themeColors={themeColors}
              />
              <TabButton
                icon={<Ionicons name="person" size={24} />}
                active={tab === "profile"}
                onPress={() => setTab("profile")}
                themeColors={themeColors}
              />
            </View>
            {showEditor && (
              <View style={StyleSheet.absoluteFill}>
                <ProfileEditorScreen onClose={() => setShowEditor(false)} />
              </View>
            )}
          </>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

function TabButton({ icon, onPress, active, themeColors }) {
  const { running } = useApp();

  const iconColor = active ? themeColors.primary : themeColors.textDim;

  const dynamicTabStyles = {
    btn: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 8,
      paddingHorizontal: 10,
      borderRadius: 16,
      marginHorizontal: 4,
      backgroundColor: "transparent",
    },
    active: {
      backgroundColor: "transparent",
    },
    pressed: {
      transform: [{ scale: 0.96 }],
    },
    iconWrap: {
      borderRadius: 16,
      paddingVertical: 8,
      paddingHorizontal: 12,
      minWidth: 48,
      alignItems: "center",
      justifyContent: "center",
    },
  };

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        dynamicTabStyles.btn,
        pressed && dynamicTabStyles.pressed,
      ]}
    >
      <LinearGradient
        colors={
          active
            ? [themeColors.primary, themeColors.primaryDim]
            : ["transparent", "transparent"]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={dynamicTabStyles.iconWrap}
      >
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          {React.cloneElement(icon, {
            color: active ? "#FFFFFF" : iconColor,
            weight: active ? "fill" : "regular",
            size: 22,
          })}
        </View>
      </LinearGradient>
    </Pressable>
  );
}
