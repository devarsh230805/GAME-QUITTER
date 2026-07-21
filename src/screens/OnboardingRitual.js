import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  Keyboard,
  StyleSheet,
} from "react-native";
import { createStyles } from "./OnboardingRitual.styles";
import { useApp } from "../store/AppContext";
import { getThemeColors, spacing, radii, typography } from "../theme/tokens";
import OnboardingProgress from "../components/OnboardingProgress";
import StyledButton from "../components/StyledButton";
import { Ionicons } from "@expo/vector-icons";

const headline =
  "Before playing any game, I will always open the Game Mode in this app.";
const phrase = "I commit";

export default function OnboardingRitual({ onCommitted, onSkip, onBack }) {
  const { running, themeMode } = useApp();
  const colors = useMemo(
    () => getThemeColors(running, themeMode),
    [running, themeMode],
  );
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [progress, setProgress] = useState(0);
  const [input, setInput] = useState("");
  const [showMistype, setShowMistype] = useState(false);
  const inputRef = React.useRef(null);

  const fullyMatched = progress === phrase.length;

  const focusRitualInput = React.useCallback(() => {
    const node = inputRef.current;
    if (!node) return;
    try {
      Keyboard.dismiss();
    } catch {}
    try {
      node.focus?.();
    } catch {}
    if (global?.requestAnimationFrame) {
      requestAnimationFrame(() => {
        try {
          node.focus?.();
        } catch {}
      });
    }
    setTimeout(() => {
      try {
        node.focus?.();
      } catch {}
    }, 0);
  }, []);

  function handleChange(text) {
    // Calculate matching characters from start
    let matchedLength = 0;
    for (let i = 0; i < text.length; i += 1) {
      if (
        i < phrase.length &&
        text[i].toLowerCase() === phrase[i].toLowerCase()
      ) {
        matchedLength += 1;
      } else {
        break;
      }
    }

    setProgress(matchedLength);

    if (text.length > matchedLength) {
      setShowMistype(true);
      setInput(text.slice(0, matchedLength)); // Revert to only valid characters
      setTimeout(() => setShowMistype(false), 800);
    } else {
      setShowMistype(false);
      setInput(text);
    }
  }

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
          justifyContent: "space-between",
          marginBottom: spacing.xs,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {!!onBack && (
            <Pressable
              onPress={onBack}
              style={{ padding: 4, marginRight: spacing.sm }}
            >
              <Ionicons name="arrow-back" size={20} color={colors.text} />
            </Pressable>
          )}
          <View
            style={{
              backgroundColor: colors.primary,
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
                color: colors.surface,
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
        <Pressable onPress={() => onSkip?.()}>
          <Text style={{ ...typography.body, color: colors.textDim }}>
            Skip
          </Text>
        </Pressable>
      </View>

      {/* Main Flow Bar */}
      <OnboardingProgress currentStep={5} totalSteps={7} colors={colors} />

      {/* Commitment Content Area - Vertically Centered */}
      <View
        style={{ flex: 1, justifyContent: "center", paddingBottom: spacing.xl }}
      >
        <View style={{ marginBottom: spacing.lg, alignItems: "center" }}>
          <View
            style={{
              backgroundColor: colors.primary + "20",
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.xs,
              borderRadius: radii.full,
              marginBottom: spacing.lg,
            }}
          >
            <Text
              style={{
                ...typography.caption,
                color: colors.primary,
                fontWeight: "800",
                letterSpacing: 1.2,
              }}
            >
              STEP 5 OF 7 · COMMITMENT RITUAL
            </Text>
          </View>
          <Text style={[styles.title, { textAlign: "center" }]}>
            Your Commitment
          </Text>
          <Text
            style={[
              styles.body,
              { textAlign: "center", paddingHorizontal: spacing.md },
            ]}
          >
            {headline}
          </Text>
        </View>

        {/* Typing Box */}
        <Pressable
          style={[
            styles.typeBox,
            showMistype && styles.typeBoxError,
            {
              marginBottom: spacing.lg,
              paddingVertical: spacing.xl,
              backgroundColor: colors.surface,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.08,
              shadowRadius: 12,
              elevation: 4,
            },
          ]}
          onPressIn={focusRitualInput}
          onPress={focusRitualInput}
          onPressOut={focusRitualInput}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel="Ritual input"
        >
          <Text
            style={{
              ...typography.caption,
              color: colors.textDim,
              marginBottom: spacing.sm,
            }}
          >
            Tap and type:
          </Text>
          <Text style={[styles.typeLine, { fontSize: 22, letterSpacing: 1 }]}>
            <Text style={styles.matched}>{phrase.slice(0, progress)}</Text>
            <Text style={styles.remaining}>{phrase.slice(progress)}</Text>
          </Text>
          {showMistype && (
            <Text style={[styles.hint, { marginTop: spacing.md }]}>
              Type exactly as shown above.
            </Text>
          )}
        </Pressable>

        <TextInput
          ref={inputRef}
          value={input}
          onChangeText={handleChange}
          autoFocus
          autoCapitalize="none"
          autoCorrect={false}
          blurOnSubmit={false}
          showSoftInputOnFocus
          style={[styles.hiddenInput]}
        />

        <StyledButton
          title={fullyMatched ? "✓  Continue" : 'Type "I commit" to continue'}
          onPress={onCommitted}
          colors={colors}
          disabled={!fullyMatched}
          rectangular
          style={{ marginTop: spacing.md }}
        />
      </View>
    </View>
  );
}

// styles imported from './OnboardingRitual.styles'
