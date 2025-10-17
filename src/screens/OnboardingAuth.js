import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Easing } from 'react-native';
import AnimatedBlobs from '../components/AnimatedBlobs';
import { useAuth } from '../context/AuthContext'; // ✅ use your AuthContext

export default function OnboardingAuth({ onDone }) {
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(16)).current;
  const pulse = useRef(new Animated.Value(1)).current;

  const { signInWithGoogle } = useAuth(); // ✅ only Google now

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
        <Text style={styles.title}>Welcome</Text>
        <Text style={styles.subtitle}>Sign in with Google to continue</Text>
      </Animated.View>

      {/* Google OAuth button */}
      <Animated.View style={{ transform: [{ scale: pulse }], marginTop: 20 }}>
        <Pressable
          style={styles.oauth}
          onPress={async () => {
            try {
              await signInWithGoogle(); // ✅ Google login
              onDone?.();
            } catch (err) {
              console.error('Google sign-in error:', err.message);
            }
          }}
        >
          <Text style={styles.oauthText}>Continue with Google</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', padding: 24, justifyContent: 'center' },
  title: { color: '#111', fontSize: 22, fontWeight: '800', marginBottom: 6, textAlign: 'center' },
  subtitle: { color: '#444', textAlign: 'center', marginBottom: 18 },
  oauth: { backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  oauthText: { color: '#111', fontWeight: '700', fontSize: 14 },
});
