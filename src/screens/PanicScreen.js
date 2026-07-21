import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Easing,
} from "react-native";
import {
  getThemeColors,
  typography,
  spacing,
  radii,
  shadows,
} from "../theme/tokens";
import HeaderBar from "../components/HeaderBar";
import { useApp } from "../store/AppContext";

const DUR = 4000; // 4 seconds per phase
const CYCLES = 3; // number of full inhale-hold-exhale cycles

export default function PanicScreen() {
  const { running, themeMode } = useApp();
  const themeColors = getThemeColors(running, themeMode);
  const styles = useMemo(
    () => createStyles(themeColors, running),
    [themeColors, running],
  );

  const [phase, setPhase] = useState("idle"); // idle | inhale | hold | exhale | done
  const [count, setCount] = useState(4);
  const [cycle, setCycle] = useState(0);

  const scale = useRef(new Animated.Value(1)).current;
  const intervalRef = useRef(null);
  const runningStateRef = useRef(false);

  const clearTimers = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    runningStateRef.current = false;
  }, []);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const animateScale = useCallback(
    (toValue, duration = DUR) => {
      Animated.timing(scale, {
        toValue,
        duration,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }).start();
    },
    [scale],
  );

  const startCountdown = useCallback((seconds) => {
    setCount(seconds);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCount((c) => {
        if (c <= 1) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  }, []);

  const runCycle = useCallback(() => {
    if (!runningStateRef.current) return;
    setPhase("inhale");
    startCountdown(4);
    animateScale(1.2);
    setTimeout(() => {
      if (!runningStateRef.current) return;
      setPhase("hold");
      startCountdown(4);
      setTimeout(() => {
        if (!runningStateRef.current) return;
        setPhase("exhale");
        startCountdown(4);
        animateScale(1.0);
        setTimeout(() => {
          if (!runningStateRef.current) return;
          setCycle((c) => {
            const next = c + 1;
            if (next >= CYCLES) {
              runningStateRef.current = false;
              setPhase("done");
              return next;
            }
            runCycle();
            return next;
          });
        }, DUR);
      }, DUR);
    }, DUR);
  }, [animateScale, startCountdown]);

  const startBreathing = useCallback(() => {
    clearTimers();
    setCycle(0);
    setPhase("inhale");
    runningStateRef.current = true;
    runCycle();
  }, [clearTimers, runCycle]);

  const stopBreathing = useCallback(() => {
    clearTimers();
    setPhase("idle");
    setCount(4);
    setCycle(0);
    scale.setValue(1);
  }, [clearTimers, scale]);

  const label =
    phase === "idle" ? "Start" : phase === "done" ? "Restart" : "Stop";
  const onCta =
    phase === "idle" || phase === "done" ? startBreathing : stopBreathing;

  return (
    <View style={styles.container}>
      <HeaderBar title="Rescue" />
      <View style={styles.content}>
        <Text style={styles.body}>
          Find your calm. Try the 4-4-4 breathing cycle to reset your brain.
        </Text>

        <Animated.View
          style={[styles.circle, { transform: [{ scale }] }, shadows.card]}
        >
          <Text style={styles.phase}>
            {phase === "idle" ? "Ready" : phase.toUpperCase()}
          </Text>
          <Text style={styles.count}>{phase === "idle" ? "—" : count}</Text>
        </Animated.View>

        <Pressable
          style={({ pressed }) => [styles.cta, pressed && { opacity: 0.8 }]}
          onPress={onCta}
        >
          <Text style={styles.ctaText}>{label}</Text>
        </Pressable>

        <View style={styles.tipCard}>
          <Text style={styles.tipText}>
            Tip: Stretch, hydrate, or do 10 pushups as a quick physical reset.
          </Text>
        </View>
      </View>
    </View>
  );
}

const createStyles = (colors, running) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: {
      flex: 1,
      padding: spacing.xl,
      alignItems: "center",
      justifyContent: "center",
    },
    body: {
      ...typography.body,
      color: colors.textDim,
      textAlign: "center",
      marginBottom: spacing.xl,
    },
    circle: {
      width: 240,
      height: 240,
      borderRadius: 120,
      borderWidth: 2,
      borderColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.surface,
    },
    phase: {
      ...typography.label,
      color: colors.text,
      marginBottom: spacing.sm,
    },
    count: { ...typography.title, fontSize: 48, color: colors.primary },
    cta: {
      marginTop: spacing.xxl,
      backgroundColor: colors.primary,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.xxl,
      borderRadius: radii.pill,
    },
    ctaText: {
      ...typography.subtitle,
      color: colors.surface,
      fontWeight: "700",
    },
    tipCard: {
      marginTop: spacing.xxl,
      padding: spacing.lg,
      backgroundColor: colors.surface,
      borderRadius: radii.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    tipText: {
      ...typography.caption,
      color: colors.textDim,
      textAlign: "center",
    },
  });
