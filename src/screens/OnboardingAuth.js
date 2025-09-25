import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, Animated, Easing } from 'react-native';
import AnimatedBlobs from '../components/AnimatedBlobs';

export default function OnboardingAuth({ onDone }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>MVP local profile only. No backend yet.</Text>
      </Animated.View>

      <View style={styles.field}> 
        <Text style={styles.label}>Email</Text>
        <TextInput style={styles.input} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="you@example.com" placeholderTextColor="#6B7C8E" />
      </View>

      <View style={styles.field}> 
        <Text style={styles.label}>Password</Text>
        <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry placeholder="••••••••" placeholderTextColor="#6B7C8E" />
      </View>

      <Animated.View style={{ transform: [{ scale: pulse }] }}>
        <Pressable style={styles.cta} onPress={onDone}>
          <Text style={styles.ctaText}>Continue</Text>
        </Pressable>
      </Animated.View>

      <View style={styles.row}>
        <Pressable style={styles.oauth}><Text style={styles.oauthText}>Continue with Google</Text></Pressable>
        <Pressable style={styles.oauth}><Text style={styles.oauthText}>Continue with Apple</Text></Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', padding: 24, justifyContent: 'center' },
  title: { color: '#111', fontSize: 22, fontWeight: '800', marginBottom: 6, textAlign: 'center' },
  subtitle: { color: '#444', textAlign: 'center', marginBottom: 18 },
  field: { marginBottom: 12 },
  label: { color: '#111', marginBottom: 6 },
  input: { backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB', color: '#111', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12 },
  cta: { backgroundColor: '#111', paddingVertical: 14, borderRadius: 999, alignItems: 'center', marginTop: 8 },
  ctaText: { color: '#fff', fontWeight: '800' },
  row: { flexDirection: 'row', marginTop: 16 },
  oauth: { flex: 1, backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB', paddingVertical: 12, borderRadius: 12, alignItems: 'center', marginRight: 8 },
  oauthText: { color: '#111', fontWeight: '700', fontSize: 12 },
});
