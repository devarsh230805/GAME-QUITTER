import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

export default function SplashScreen({ onDone }) {
  useEffect(() => {
    const t = setTimeout(() => onDone && onDone(), 2200);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <View style={styles.container}>
      <Image source={require('../../assets/icon.png')} style={styles.logo} resizeMode="contain" />
      <Text style={styles.title}>GameQuittr</Text>
      <Text style={styles.tagline}>Your coach for controlling gaming urges</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0F14', alignItems: 'center', justifyContent: 'center' },
  logo: { width: 120, height: 120, marginBottom: 16 },
  title: { color: '#E6EDF3', fontSize: 24, fontWeight: '800' },
  tagline: { color: '#9FB0C0', marginTop: 8 },
});
