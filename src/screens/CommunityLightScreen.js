import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

const FEED = [
  { id: '1', name: 'Alex', time: '2 hours ago', text: "Just reached my goal for the week. Feeling proud and motivated! Keep pushing, everyone!", avatar: null },
  { id: '2', name: 'Jamie', time: 'Yesterday', text: "Remember, slow and steady wins the race. Stay consistent, folks!", avatar: null },
  { id: '3', name: 'Taylor', time: '3 days ago', text: "I've discovered a new technique to stay focused. Happy to share if anyone's interested!", avatar: null },
];

function Card({ item }) {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.avatar} />
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>
      </View>
      <Text style={styles.text}>{item.text}</Text>
    </View>
  );
}

export default function CommunityLightScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Community Support</Text>
      {FEED.map((f) => (
        <Card key={f.id} item={f} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  header: { fontSize: 22, fontWeight: '700', color: '#111', marginBottom: 12 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 3 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#DDD', marginRight: 10 },
  name: { color: '#111', fontWeight: '600' },
  time: { color: '#777', fontSize: 12 },
  text: { color: '#333' },
});
