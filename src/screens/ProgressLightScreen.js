import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import HeaderBar from '../components/HeaderBar';

export default function ProgressLightScreen() {
  return (
    <View style={styles.container}>
      <HeaderBar title="Progress" />
      <View style={styles.card}>
        <View style={styles.mockChart} />
      </View>

      <Text style={styles.header}>Motivational Quotes</Text>
      <View style={styles.card}>
        <Text style={styles.quote}>
          "Success is not final, failure is not fatal: It is the courage to continue that counts."
        </Text>
        <Text style={styles.author}>— Winston Churchill</Text>
      </View>

      <Text style={styles.header}>Achievements Unlocked</Text>
      <View style={styles.achRow}>
        <View style={styles.badge}><Text style={styles.badgeText}>One Week</Text></View>
        <View style={styles.badge}><Text style={styles.badgeText}>Two Weeks</Text></View>
      </View>
      <View style={styles.achRow}>
        <View style={styles.badge}><Text style={styles.badgeText}>One Month</Text></View>
        <View style={[styles.badge, { opacity: 0.4 }]}><Text style={styles.badgeText}>Two Months</Text></View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', padding: 20 },
  header: { fontSize: 18, fontWeight: '700', color: '#111', marginTop: 10, marginBottom: 8 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 3 },
  mockChart: { height: 140, backgroundColor: '#F3F3F3', borderRadius: 12 },
  quote: { color: '#333' },
  author: { color: '#666', marginTop: 6 },
  achRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  badge: { flex: 1, backgroundColor: '#fff', borderRadius: 16, paddingVertical: 24, alignItems: 'center', justifyContent: 'center', marginRight: 12, shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 3 },
  badgeText: { color: '#111', fontWeight: '600' },
});
