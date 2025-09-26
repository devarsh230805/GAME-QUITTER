import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import HeaderBar from '../components/HeaderBar';
import { useApp } from '../store/AppContext';

function msToHMS(ms) {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const pad = (n) => String(n).padStart(2, '0');
  return `${h}:${pad(m)}:${pad(s)}`;
}

export default function HomeLightScreen({ onStart, openGameMode, openRetro, openStats, openProfile }) {
  const { running, startSession, stopSession, msToday, msByDayForLast7, schedule, tasks, toggleTask, plannedToday, doneToday } = useApp();

  const todayMs = msToday();
  const last7 = msByDayForLast7();
  const maxMs = useMemo(() => Math.max(1, ...last7), [last7]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.containerContent}>
      <HeaderBar title="Home" />
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }} />
        <Pressable style={styles.profileBtn} onPress={openProfile}><Text style={styles.profileBtnTxt}>Profile</Text></Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Today's Schedule</Text>
        {schedule.length === 0 && <Text style={styles.muted}>No slots yet. Add in Settings.</Text>}
        {schedule.map((s) => (
          <View key={s.id} style={styles.slotRow}>
            <Text style={styles.slotTime}>{toHM(s.startMin)} - {toHM(s.endMin)}</Text>
            <Text style={[styles.badge, s.status === 'done' ? styles.badgeDone : s.status === 'missed' ? styles.badgeMissed : styles.badgePlanned]}>{s.status.toUpperCase()}</Text>
          </View>
        ))}
        <Text style={styles.muted}>{doneToday}/{plannedToday} done</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Progress Summary</Text>
        <View style={styles.timerRow}>
          <Text style={styles.timer}>{msToHMS(todayMs)}</Text>
          {running ? (
            <Pressable style={[styles.btn, styles.btnStop]} onPress={stopSession}>
              <Text style={styles.btnText}>Stop</Text>
            </Pressable>
          ) : (
            <Pressable style={[styles.btn, styles.btnStart]} onPress={startSession}>
              <Text style={styles.btnText}>Start</Text>
            </Pressable>
          )}
        </View>
        <Text style={styles.muted}>Total time played today</Text>
        <View style={styles.barRow}>
          {last7.map((v, i) => (
            <View key={i} style={styles.barWrap}>
              <View style={[styles.bar, { height: Math.max(8, (v / maxMs) * 100) }]} />
            </View>
          ))}
        </View>
        <Text style={styles.muted}>Last 7 days — lower is better</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>To-do List</Text>
        {tasks.length === 0 && <Text style={styles.muted}>No tasks today.</Text>}
        {tasks.map((t) => (
          <Pressable key={t.id} style={styles.taskRow} onPress={() => toggleTask(t.id)}>
            <View style={[styles.checkbox, t.completed && styles.checkboxOn]} />
            <Text style={[styles.taskText, t.completed && styles.taskTextDone]}>{t.text}</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

function Action({ icon, label }) {
  return (
    <View style={styles.actionItem}>
      <View style={styles.actionCircle}><Text style={{ fontSize: 18 }}>{icon}</Text></View>
      <Text style={styles.actionLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', padding: 20 },
  containerContent: { paddingTop: 64, paddingBottom: 28 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  h1: { fontSize: 22, fontWeight: '700', color: '#111', marginBottom: 4 },
  sub: { color: '#6B7280' },
  profileBtn: { backgroundColor: '#111', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, marginBottom: 8 },
  profileBtnTxt: { color: '#fff', fontWeight: '700' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 3 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#111', marginBottom: 10, textAlign: 'left' },
  timerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  timer: { fontSize: 32, fontWeight: '800', color: '#111' },
  btn: { borderRadius: 22, paddingVertical: 10, paddingHorizontal: 18 },
  btnStart: { backgroundColor: '#1F7AEC' },
  btnStop: { backgroundColor: '#E11D48' },
  btnText: { color: '#fff', fontWeight: '700' },
  muted: { color: '#666', marginTop: 6, textAlign: 'center' },
  barRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 110, marginTop: 6 },
  barWrap: { flex: 1, alignItems: 'center' },
  bar: { width: 18, borderRadius: 9, backgroundColor: '#111' },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 8 },
  actionItem: { alignItems: 'center' },
  actionCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#111', alignItems: 'center', justifyContent: 'center' },
  actionLabel: { color: '#333', marginTop: 6, fontSize: 12 },
  cta: { backgroundColor: '#111', borderRadius: 8, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  ctaText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  slotRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6 },
  slotTime: { color: '#111', fontWeight: '700' },
  badge: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 999, fontSize: 12 },
  badgePlanned: { color: '#111', backgroundColor: '#EEE' },
  badgeDone: { color: '#FFF', backgroundColor: '#111' },
  badgeMissed: { color: '#FFF', backgroundColor: '#555' },
  taskRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  checkbox: { width: 18, height: 18, borderRadius: 4, borderWidth: 2, borderColor: '#111', marginRight: 10 },
  checkboxOn: { backgroundColor: '#111' },
  taskText: { color: '#333' },
  taskTextDone: { color: '#999', textDecorationLine: 'line-through' },
  cardActions: { backgroundColor: '#fff', borderRadius: 16, padding: 12, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 3 },
  bigBtn: { borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginBottom: 10 },
  bigBtnTxt: { color: '#fff', fontWeight: '800' },
});

function toHM(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}
