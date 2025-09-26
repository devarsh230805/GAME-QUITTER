import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import HeaderBar from '../components/HeaderBar';
import { useApp } from '../store/AppContext';

function msToH(ms) { return (ms / 3600000).toFixed(2); }

export default function StatsHistoryScreen({ onClose }) {
  const { playLogs } = useApp();

  return (
    <View style={styles.wrap}>
      <HeaderBar title="Stats" />
      <View style={styles.card}>
        <Text style={styles.title}>Stats & History</Text>
        <ScrollView style={{ maxHeight: 280 }}>
          {playLogs.length === 0 && <Text style={styles.empty}>No sessions yet.</Text>}
          {playLogs.slice().reverse().map((l) => (
            <View key={l.id} style={styles.row}>
              <Text style={styles.cell}>{l.onPlan ? 'On Plan' : 'Unplanned'}</Text>
              <Text style={styles.cell}>{new Date(l.start).toLocaleString()}</Text>
              <Text style={styles.cell}>{l.end ? msToH(l.end - l.start) + ' h' : 'Running'}</Text>
            </View>
          ))}
        </ScrollView>
        <Text style={[styles.sub, { marginTop: 10 }]}>Confessions</Text>
        <ScrollView style={{ maxHeight: 140 }}>
          {playLogs.filter(l => !!l.confession).length === 0 && <Text style={styles.empty}>No confessions yet.</Text>}
          {playLogs.filter(l => !!l.confession).map((l) => (
            <View key={l.id + '-c'} style={{ marginBottom: 10 }}>
              <Text style={styles.confTs}>{new Date(l.end || l.start).toLocaleString()}</Text>
              <Text style={styles.conf}>{l.confession}</Text>
            </View>
          ))}
        </ScrollView>
        {!!onClose && (
          <Pressable style={({ pressed }) => [styles.closeBtn, pressed && styles.closeBtnPressed]} onPress={onClose}>
            <Text style={styles.closeTxt}>Close</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#FFFFFF', padding: 18 },
  card: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', padding: 18 },
  title: { color: '#111', fontSize: 18, fontWeight: '800', marginBottom: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  cell: { color: '#111', flex: 1 },
  sub: { color: '#111', fontWeight: '700' },
  empty: { color: '#6B7280', textAlign: 'center', paddingVertical: 10 },
  confTs: { color: '#6B7280', fontSize: 12 },
  conf: { color: '#111' },
  closeBtn: { alignItems: 'center', marginTop: 12, backgroundColor: '#111', paddingVertical: 12, borderRadius: 8 },
  closeBtnPressed: { backgroundColor: '#666' },
  closeTxt: { color: '#fff', fontWeight: '800' },
});
