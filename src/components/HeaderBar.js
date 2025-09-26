import React from 'react';
import { View, Text, StyleSheet, Platform, StatusBar } from 'react-native';

export default function HeaderBar({ title }) {
  const top = Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0;
  return (
    <View style={[styles.wrap]}> 
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#EAEAEA', paddingHorizontal: 12, paddingVertical: 6 },
  title: { color: '#111', fontSize: 15, fontWeight: '800' },
});
