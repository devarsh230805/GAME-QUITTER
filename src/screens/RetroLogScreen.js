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
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#0B0F14', padding: 18 },
  card: { flex: 1, backgroundColor: '#0B0F14', borderRadius: 16, borderWidth: 1, borderColor: '#233040', padding: 18 },
  title: { color: '#E6EDF3', fontSize: 18, fontWeight: '800' },
  subtitle: { color: '#9FB0C0', marginTop: 6, marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#121821' },
  slot: { color: '#E6EDF3', fontWeight: '700' },
  badge: { color: '#9FB0C0', fontSize: 12, marginTop: 2 },
  primary: { backgroundColor: '#6EE7F2', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8 },
  primaryPressed: { backgroundColor: '#89EEF6' },
  primaryTxt: { color: '#001219', fontWeight: '800' },
  empty: { color: '#9FB0C0', textAlign: 'center', paddingVertical: 10 },
  secondary: { alignItems: 'center', marginTop: 10 },
  secondaryTxt: { color: '#E6EDF3' },
});
