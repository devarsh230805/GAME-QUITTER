import React from 'react';
import { View, Text, StyleSheet, TextInput, Pressable } from 'react-native';

export default function ProfileLightScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>GameQuitter</Text>

      <View style={styles.form}>
        <Text style={styles.label}>Email</Text>
        <TextInput placeholder="Enter your email" placeholderTextColor="#999" style={styles.input} />
        <Text style={styles.label}>Password</Text>
        <TextInput placeholder="Enter your password" placeholderTextColor="#999" secureTextEntry style={styles.input} />
        <Pressable style={styles.cta}><Text style={styles.ctaText}>Sign in</Text></Pressable>
        <Text style={styles.help}>Need help logging in?</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  title: { fontSize: 28, fontWeight: '800', color: '#111', marginTop: 20, marginBottom: 20 },
  form: { backgroundColor: '#fff', borderRadius: 16, padding: 16 },
  label: { color: '#111', marginBottom: 6, fontWeight: '600' },
  input: { backgroundColor: '#F7F7F7', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 12, color: '#111', marginBottom: 12, borderWidth: 1, borderColor: '#EEE' },
  cta: { backgroundColor: '#111', borderRadius: 24, paddingVertical: 12, alignItems: 'center', marginTop: 4 },
  ctaText: { color: '#fff', fontWeight: '700' },
  help: { color: '#666', textAlign: 'right', marginTop: 8 },
});
