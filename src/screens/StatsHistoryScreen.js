import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useApp } from '../store/AppContext';

function msToH(ms) { return (ms / 3600000).toFixed(2); }

export default function StatsHistoryScreen({ onClose }) {
  const { playLogs } = useApp();

  return (
    <View style={styles.wrap}>
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
        <Text onPress={onClose} style={styles.close}>Close</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  card: { width: '92%', backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', padding: 18 },
  title: { color: '#111', fontSize: 18, fontWeight: '800', marginBottom: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  cell: { color: '#111', flex: 1 },
  sub: { color: '#111', fontWeight: '700' },
  empty: { color: '#6B7280', textAlign: 'center', paddingVertical: 10 },
  confTs: { color: '#6B7280', fontSize: 12 },
  conf: { color: '#111' },
  close: { textAlign: 'center', color: '#111', marginTop: 12 },
});
