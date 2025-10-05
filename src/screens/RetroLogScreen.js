import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import HeaderBar from '../components/HeaderBar';
import { useApp } from '../store/AppContext';

function minToStr(m) {
  const h = Math.floor(m / 60);
  const mm = String(m % 60).padStart(2, '0');
  const hh = String(h).padStart(2, '0');
  return `${hh}:${mm}`;
}

export default function RetroLogScreen({ onClose }) {
  const { schedule, retroMarkSlotAsDone } = useApp();
  const unmarked = schedule.filter((s) => s.status === 'planned');

  return (
    <View style={styles.wrap}>
      <HeaderBar title="Log" />
      <View style={styles.content}>
        <View style={styles.card}>
        <Text style={styles.title}>Retroactive Logging</Text>
        <Text style={styles.subtitle}>Mark completed scheduled slots</Text>
        <ScrollView style={{ maxHeight: 240 }}>
          {unmarked.length === 0 && <Text style={styles.empty}>No unmarked slots.</Text>}
          {unmarked.map((s) => (
            <View key={s.id} style={styles.row}>
              <View>
                <Text style={styles.slot}>{minToStr(s.startMin)} - {minToStr(s.endMin)}</Text>
                <Text style={styles.badge}>Planned</Text>
              </View>
              <Pressable
                style={({ pressed }) => [styles.primary, pressed && styles.primaryPressed]}
                onPress={() => retroMarkSlotAsDone(s.id)}
              >
                <Text style={styles.primaryTxt}>Mark Done</Text>
              </Pressable>
            </View>
          ))}
        </ScrollView>
        {!!onClose && (<Pressable style={styles.secondary} onPress={onClose}><Text style={styles.secondaryTxt}>Close</Text></Pressable>)}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { flex: 1, padding: 20 },
  card: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 10, padding: 12, shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 3 },
  title: { color: '#111', fontSize: 18, fontWeight: '800' },
  subtitle: { color: '#666', marginTop: 6, marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  slot: { color: '#111', fontWeight: '700' },
  badge: { color: '#666', fontSize: 12, marginTop: 2 },
  primary: { backgroundColor: '#111', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 22 },
  primaryPressed: { backgroundColor: '#333' },
  primaryTxt: { color: '#fff', fontWeight: '800' },
  empty: { color: '#6B7280', textAlign: 'center', paddingVertical: 10 },
  secondary: { alignItems: 'center', marginTop: 10 },
  secondaryTxt: { color: '#111' },
});
