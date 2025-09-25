import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Easing } from 'react-native';
import AnimatedBlobs from '../components/AnimatedBlobs';

const headline = 'Before playing any game, I will always open the Game Mode in this app.';

export default function OnboardingRitual({ onCommitted }) {
  const [tapped, setTapped] = useState(false);
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(16)).current;
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 450, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 450, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
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
      <Animated.View style={{ opacity: fade, transform: [{ translateY: slide }], alignItems: 'center' }}>
        <Text style={styles.title}>Ritual Commitment</Text>
        <Text style={styles.body}>{headline}</Text>

        <Animated.View style={{ transform: [{ scale: pulse }], alignSelf: 'stretch' }}>
          <Pressable style={[styles.primary, tapped && styles.primaryActive]} onPress={() => setTapped(true)}>
            <Text style={styles.primaryText}>Say it with me: I commit</Text>
          </Pressable>
        </Animated.View>

        <Pressable disabled={!tapped} style={[styles.cta, !tapped && styles.ctaDisabled]} onPress={onCommitted}>
          <Text style={styles.ctaText}>{tapped ? 'Continue' : 'Tap commit to continue'}</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', padding: 24, justifyContent: 'center' },
  title: { color: '#111', fontSize: 22, fontWeight: '800', marginBottom: 12, textAlign: 'center' },
  body: { color: '#444', fontSize: 16, textAlign: 'center', marginBottom: 24 },
  primary: { backgroundColor: '#F3F4F6', paddingVertical: 14, borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', alignItems: 'center' },
  primaryActive: { borderColor: '#111' },
  primaryText: { color: '#111', fontWeight: '700' },
  cta: { backgroundColor: '#111', paddingVertical: 14, borderRadius: 999, alignItems: 'center', marginTop: 24 },
  ctaDisabled: { opacity: 0.5 },
  ctaText: { color: '#fff', fontWeight: '800' },
});
