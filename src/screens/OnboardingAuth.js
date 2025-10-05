import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Easing } from 'react-native';

export default function OnboardingAuth({ onDone }) {
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(16)).current;
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 450,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(slide, {
        toValue: 0,
        duration: 450,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
    
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.03, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1.0, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [fade, slide, pulse]);

  return (
    <View style={styles.container}>
      <View style={styles.spacer} />
      <Animated.View 
        style={[styles.bottomContent, { 
          opacity: fade, 
          transform: [{ translateY: slide }] 
        }]}
      >
        <Text style={styles.title}>Sign in to continue</Text>
        <Text style={styles.subtitle}>Choose your preferred sign-in method</Text>

        <View style={styles.row}>
          <Pressable style={styles.oauth}>
            <Text style={styles.oauthText}>Google</Text>
          </Pressable>
          <Pressable style={styles.oauth}>
            <Text style={styles.oauthText}>Apple</Text>
          </Pressable>
        </View>

        <Animated.View style={{ transform: [{ scale: pulse }] }}>
          <Pressable 
            style={styles.continueButton}
            onPress={onDone}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#FFFFFF', 
    padding: 24 
  },
  spacer: { 
    flex: 1 
  },
  bottomContent: { 
    alignItems: 'center', 
    justifyContent: 'flex-end', 
    paddingBottom: 40 
  },
  title: { 
    color: '#111', 
    fontSize: 22, 
    fontWeight: '800', 
    marginBottom: 6, 
    textAlign: 'center' 
  },
  subtitle: { 
    color: '#444', 
    textAlign: 'center', 
    marginBottom: 24 
  },
  row: { 
    flexDirection: 'row', 
    width: '100%', 
    marginBottom: 24,
    justifyContent: 'space-between'
  },
  oauth: {
    flex: 1,
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#111',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  oauthText: { 
    color: '#fff', 
    fontWeight: '700', 
    fontSize: 14 
  },
  continueButton: {
    backgroundColor: '#25D366',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
    marginTop: 16,
  },
  continueButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
