import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Easing } from 'react-native';
import AnimatedBlobs from '../components/AnimatedBlobs';
import { colors, spacing, typography, radii } from '../theme/tokens';

export default function OnboardingWelcome({ onSkip, onNext }) {
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(20)).current;
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 500, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.03, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1.0, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [fade, slide, pulse]);

  return (
    <View style={styles.container}>
      <AnimatedBlobs intensity={1} />
      <View style={styles.spacer} />
      <Animated.View style={[styles.bottomContent, { opacity: fade, transform: [{ translateY: slide }] }]}>
        <Text style={styles.title}>Take control of your gaming habits.</Text>
        <Text style={styles.body}>We will guide you with a simple ritual and daily plan.</Text>
        <Animated.View style={{ transform: [{ scale: pulse }], alignSelf: 'stretch' }}>
          <Pressable style={styles.primary} onPress={onNext}>
            <Text style={styles.primaryText}>Get Started</Text>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', padding: spacing.xl },
  spacer: { flex: 1 },
  bottomContent: { alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 40 },
  title: { ...typography.title, color: '#111', marginBottom: spacing.sm, textAlign: 'center' },
  body: { ...typography.body, color: '#444', textAlign: 'center', marginBottom: spacing.lg },
  primary: { backgroundColor: '#111', borderRadius: radii.pill, paddingVertical: spacing.md, paddingHorizontal: spacing.xl, alignItems: 'center', marginTop: spacing.md },
  primaryText: { ...typography.subtitle, color: '#fff' },
});
