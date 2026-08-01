import React, { useMemo, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { createStyles } from "./OnboardingQuizAdvanced.styles";
import { useApp } from "../store/AppContext";
import { getThemeColors, spacing, radii, typography } from "../theme/tokens";
import OnboardingProgress from "../components/OnboardingProgress";

const QUESTIONS = [
  {
    id: "hours",
    title: "Question 1",
    prompt: "How many hours do you typically game per day?",
    options: ["< 2 hour", "2-4 hours", "4-8 hours", "8+ hours"],
  },
  {
    id: "games",
    title: "Question 2",
    prompt: "Which games do you play most?",
    options: ["MOBA", "Shooter", "RPG", "Sports"],
  },
  {
    id: "peakHours",
    title: "Question 3",
    prompt: "When are your peak gaming hours?",
    options: ["Morning", "Afternoon", "Evening", "Night"],
  },
  {
    id: "platform",
    title: "Question 4",
    prompt: "At which platforms you play games?",
    options: ["PC", "Mobile", "Console", "Other"],
  },
];

export default function OnboardingQuizAdvanced({ onComplete, onSkip, onBack }) {
  const { running, themeMode } = useApp();
  const colors = useMemo(
    () => getThemeColors(running, themeMode),
    [running, themeMode],
  );
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState({});
  const qProgress = useMemo(() => (i + 1) / QUESTIONS.length, [i]);

  const q = QUESTIONS[i];

  function choose(idx) {
    const nextAnswers = { ...answers, [q.id]: idx };
    setAnswers(nextAnswers);
    if (i < QUESTIONS.length - 1) setI(i + 1);
    else onComplete(nextAnswers);
  }

  const handleBack = () => {
    if (i > 0) {
      setI(i - 1);
    } else {
      onBack?.();
    }
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: spacing.xxl, backgroundColor: "transparent" },
      ]}
    >
      {/* App Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          width: "100%",
          height: 32,
          position: "relative",
          marginBottom: spacing.xs,
        }}
      >
        <Pressable
          onPress={handleBack}
          style={{
            position: "absolute",
            left: 0,
            padding: 4,
            zIndex: 10,
          }}
        >
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </Pressable>

        <View style={{ flexDirection: "row", alignItems: "center", marginLeft: 36 }}>
          <View
            style={{
              backgroundColor: "#0F172A",
              width: 28,
              height: 28,
              borderRadius: radii.sm,
              alignItems: "center",
              justifyContent: "center",
              marginRight: spacing.sm,
            }}
          >
            <Text
              style={{
                color: "#FFFFFF",
                fontSize: 10,
                fontWeight: "bold",
              }}
            >
              GQ
            </Text>
          </View>
          <Text
            style={{
              ...typography.subtitle,
              color: colors.text,
              fontWeight: "700",
            }}
          >
            GameQuitter
          </Text>
        </View>

        {!!onSkip && (
          <Pressable
            onPress={onSkip}
            style={{
              position: "absolute",
              right: 0,
              padding: 4,
              zIndex: 10,
            }}
          >
            <Text style={{ ...typography.body, color: colors.textDim }}>
              Skip
            </Text>
          </Pressable>
        )}
      </View>

      {/* Main Flow Bar */}
      <OnboardingProgress currentStep={4 + (i / QUESTIONS.length)} totalSteps={7} colors={colors} />

      <View style={{ marginTop: spacing.lg, marginBottom: spacing.sm }}>
        <Text
          style={{
            ...typography.caption,
            color: colors.primary,
            fontWeight: "700",
          }}
        >
          DISCOVERY QUIZ
        </Text>
      </View>

      <View style={{ flex: 1, justifyContent: "center" }}>
        <Text style={styles.prompt}>{q.prompt}</Text>

        <View>
          {q.options.map((opt, idx) => (
            <Pressable
              key={idx}
              onPress={() => choose(idx)}
              style={({ pressed }) => [
                styles.option,
                pressed && styles.optionPressed,
                { transform: [{ scale: pressed ? 0.98 : 1 }] },
              ]}
            >
              <View style={styles.badge}>
                <Text style={styles.badgeTxt}>{idx + 1}</Text>
              </View>
              <Text style={styles.optionTxt}>{opt}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}

// styles imported from './OnboardingQuizAdvanced.styles'
