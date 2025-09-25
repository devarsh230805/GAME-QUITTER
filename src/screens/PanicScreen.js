import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Easing } from 'react-native';
import { colors, spacing, typography, radii } from '../theme/tokens';

const DUR = 4000; // 4 seconds per phase
const CYCLES = 3; // number of full inhale-hold-exhale cycles

export default function PanicScreen() {
  const [phase, setPhase] = useState('idle'); // idle | inhale | hold | exhale | done
  const [count, setCount] = useState(4);
  const [cycle, setCycle] = useState(0);

  const scale = useRef(new Animated.Value(1)).current;
  const intervalRef = useRef(null);
  const runningRef = useRef(false);

  const clearTimers = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    runningRef.current = false;
  }, []);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const animateScale = useCallback((toValue, duration = DUR) => {
    Animated.timing(scale, {
      toValue,
      duration,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [scale]);

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

  const nextPhase = useCallback((current) => {
    if (current === 'inhale') return 'hold';
    if (current === 'hold') return 'exhale';
    if (current === 'exhale') return 'inhale';
    return 'done';
  }, []);

  const runCycle = useCallback(() => {
    if (!runningRef.current) return;
    setPhase('inhale');
    startCountdown(4);
    animateScale(1.2);
    const t1 = setTimeout(() => {
      setPhase('hold');
      startCountdown(4);
      animateScale(1.2, DUR);
      const t2 = setTimeout(() => {
        setPhase('exhale');
        startCountdown(4);
        animateScale(1.0);
        const t3 = setTimeout(() => {
          setCycle((c) => {
            const next = c + 1;
            if (next >= CYCLES) {
              runningRef.current = false;
              setPhase('done');
              return next;
            }
            // continue next cycle
            runCycle();
            return next;
          });
        }, DUR);
        // keep reference to avoid leaks
        intervalRef.current && intervalRef.current; // no-op, for symmetry
      }, DUR);
    }, DUR);
  }, [animateScale, startCountdown]);

  const startBreathing = useCallback(() => {
    clearTimers();
    setCycle(0);
    setPhase('inhale');
    runningRef.current = true;
    runCycle();
  }, [clearTimers, runCycle]);

  const stopBreathing = useCallback(() => {
    clearTimers();
    setPhase('idle');
    setCount(4);
    setCycle(0);
    scale.setValue(1);
  }, [clearTimers, scale]);

  const label = phase === 'idle' ? 'Start' : phase === 'done' ? 'Restart' : 'Stop';
  const onCta = phase === 'idle' || phase === 'done' ? startBreathing : stopBreathing;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Emergency Help</Text>
      <Text style={styles.body}>Try the 4-4-4 cycle: inhale 4s, hold 4s, exhale 4s.</Text>

      <Animated.View style={[styles.circle, { transform: [{ scale }] }]}> 
        <Text style={styles.phase}>{phase === 'idle' ? 'Ready' : phase.toUpperCase()}</Text>
        <Text style={styles.count}>{phase === 'idle' ? '—' : count}</Text>
      </Animated.View>

      <Pressable style={styles.cta} onPress={onCta}>
        <Text style={styles.ctaText}>{label}</Text>
      </Pressable>

      <Text style={[styles.body, { marginTop: spacing.lg }]}>Tip: Stretch, drink water, or do 10 pushups as a quick reset.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.xl, alignItems: 'center' },
  title: { ...typography.title, color: colors.text, alignSelf: 'flex-start', marginBottom: spacing.lg },
  body: { ...typography.body, color: colors.textDim, textAlign: 'center' },
  circle: { width: 220, height: 220, borderRadius: 110, borderWidth: 3, borderColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginTop: spacing.xl, backgroundColor: '#0E141B' },
  phase: { ...typography.subtitle, color: colors.text, marginBottom: spacing.sm },
  count: { ...typography.title, color: colors.primary },
  cta: { marginTop: spacing.xl, backgroundColor: colors.primary, paddingVertical: spacing.md, paddingHorizontal: spacing.xl, borderRadius: radii.pill },
  ctaText: { ...typography.subtitle, color: '#001219' },
});
