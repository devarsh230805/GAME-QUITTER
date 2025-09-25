import React, { useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, ScrollView } from 'react-native';
import { useApp } from '../store/AppContext';

const DAY_HOURS = Array.from({ length: 24 }, (_, i) => i);

function toHM(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export default function ProfileEditorScreen({ onClose }) {
  const { schedule, addSlot, removeSlot, tasks, addTask, toggleTask, motivations, setMotivations, remainingPlannedHours, dailyTargetHours } = useApp();
  const [taskInput, setTaskInput] = useState('');

  const [start, setStart] = useState(10);
  const [dur, setDur] = useState(1);
  const [err, setErr] = useState('');

  function addSlotWheel() {
    const startMin = start * 60;
    const endMin = (start + dur) * 60;
    // block over remaining hours
    if (dur > Math.max(0, remainingPlannedHours)) {
      setErr("You can't go above your gaming hours.");
      setTimeout(() => setErr(''), 1500);
      return;
    }
    // prevent overlap
    for (const s of schedule) {
      const a1 = s.startMin / 60, a2 = s.endMin / 60;
      const b1 = start, b2 = start + dur;
      const overlap = Math.max(0, Math.min(a2, b2) - Math.max(a1, b1));
      if (overlap > 0) {
        setErr('This overlaps another slot.');
        setTimeout(() => setErr(''), 1500);
        return;
      }
    }
    addSlot(startMin, endMin);
  }

  function addTaskFromInput() {
    const t = taskInput.trim();
    if (!t) return;
    addTask(t);
    setTaskInput('');
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.cardShell}>
        <Text style={styles.title}>Profile / Settings</Text>
        <ScrollView style={{ maxHeight: 520 }} contentContainerStyle={{ paddingBottom: 8 }}>
          <View style={styles.cardSection}>
            <Text style={styles.cardTitle}>Motivations</Text>
            <TextInput
              style={styles.textarea}
              multiline
              value={motivations}
              onChangeText={setMotivations}
              placeholder="Why do you want to change?"
              placeholderTextColor="#6B7280"
            />
          </View>

          <View style={styles.cardSection}>
            <Text style={styles.cardTitle}>Scheduled Slots</Text>
            {dailyTargetHours > 0 && (
              <Text style={styles.note}>Remaining today: {Math.max(0, remainingPlannedHours)}h / {dailyTargetHours}h</Text>
            )}
            {schedule.length === 0 && <Text style={styles.muted}>No slots yet.</Text>}
            {schedule.map((s) => (
              <View key={s.id} style={styles.row}>
                <Text style={styles.cell}>{toHM(s.startMin)} - {toHM(s.endMin)}</Text>
                <Pressable style={styles.badBtn} onPress={() => removeSlot(s.id)}><Text style={styles.badBtnTxt}>Remove</Text></Pressable>
              </View>
            ))}

            <View style={styles.slotBuilder}>
              <View style={styles.wheelCol}>
                <Text style={styles.small}>Start</Text>
                <WheelPicker data={DAY_HOURS} value={start} onChange={setStart} />
              </View>
              <View style={styles.wheelCol}>
                <Text style={styles.small}>Duration (h)</Text>
                <WheelPicker data={[1,2,3,4,5,6,7,8,9,10,11,12]} value={dur} onChange={setDur} />
              </View>
              <Pressable style={styles.addBtn} onPress={addSlotWheel}><Text style={styles.addTxt}>Add</Text></Pressable>
            </View>
            {!!err && <Text style={styles.error}>{err}</Text>}
          </View>

          <View style={styles.cardSection}>
            <Text style={styles.cardTitle}>Daily Tasks</Text>
            {tasks.length === 0 && <Text style={styles.muted}>No tasks yet.</Text>}
            {tasks.map((t) => (
              <Pressable key={t.id} style={styles.row} onPress={() => toggleTask(t.id)}>
                <View style={[styles.checkbox, t.completed && styles.checkboxOn]} />
                <Text style={[styles.cell, t.completed && styles.done]}>{t.text}</Text>
              </Pressable>
            ))}
            <View style={styles.inlineForm}>
              <TextInput value={taskInput} onChangeText={setTaskInput} style={styles.input} placeholder="Add a task" placeholderTextColor="#6B7280" />
              <Pressable style={styles.primarySmall} onPress={addTaskFromInput}><Text style={styles.primaryTxt}>Add</Text></Pressable>
            </View>
          </View>
        </ScrollView>
        <Pressable style={styles.secondary} onPress={onClose}><Text style={styles.secondaryTxt}>Close</Text></Pressable>
      </View>
    </View>
  );
}

function WheelPicker({ data, value, onChange }) {
  const ITEM_H = 40;
  const scrollRef = useRef(null);
  const idx = Math.max(0, data.indexOf(value));

  function onMomentumEnd(e) {
    const y = e.nativeEvent.contentOffset.y;
    const i = Math.round(y / ITEM_H);
    const v = data[Math.min(data.length - 1, Math.max(0, i))];
    onChange(v);
    scrollRef.current?.scrollTo({ y: (i) * ITEM_H, animated: true });
  }

  return (
    <View style={styles.wheelWrap}>
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_H}
        decelerationRate="fast"
        onMomentumScrollEnd={onMomentumEnd}
        contentOffset={{ x: 0, y: idx * ITEM_H }}
      >
        {data.map((d, i) => (
          <View key={i} style={[styles.wheelItem, { height: ITEM_H }]}>
            <Text style={styles.wheelTxt}>{d}</Text>
          </View>
        ))}
      </ScrollView>
      <View style={[styles.wheelOverlay, { top: ITEM_H }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  cardShell: { width: '92%', backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', padding: 18 },
  title: { color: '#111827', fontSize: 18, fontWeight: '800', marginBottom: 10 },
  cardSection: { backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#F3F4F6', padding: 12, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } },
  cardTitle: { color: '#111827', fontSize: 16, fontWeight: '700', marginBottom: 8 },
  textarea: { backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB', color: '#111827', borderRadius: 12, padding: 12, minHeight: 80 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 },
  cell: { color: '#111827', flex: 1 },
  done: { textDecorationLine: 'line-through', color: '#6B7280' },
  inlineForm: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  input: { flex: 1, backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB', color: '#111827', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginRight: 8 },
  primarySmall: { backgroundColor: '#111827', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12 },
  primaryTxt: { color: '#FFFFFF', fontWeight: '800' },
  badBtn: { backgroundColor: '#F3F4F6', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12, marginLeft: 12 },
  badBtnTxt: { color: '#111827' },
  checkbox: { width: 18, height: 18, borderRadius: 4, borderWidth: 2, borderColor: '#111827', marginRight: 10 },
  checkboxOn: { backgroundColor: '#111827' },
  secondary: { alignItems: 'center', marginTop: 12 },
  secondaryTxt: { color: '#111827' },
  slotBuilder: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  wheelCol: { flex: 1, marginRight: 10 },
  small: { color: '#6B7280', marginBottom: 6 },
  addBtn: { backgroundColor: '#111827', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12 },
  addTxt: { color: '#FFFFFF', fontWeight: '800' },
  wheelWrap: { height: 120, borderRadius: 12, backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', overflow: 'hidden' },
  wheelItem: { alignItems: 'center', justifyContent: 'center' },
  wheelTxt: { color: '#111827', fontSize: 16, fontWeight: '700' },
  wheelOverlay: { position: 'absolute', left: 0, right: 0, height: 40, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#E5E7EB' },
  note: { color: '#6B7280', marginBottom: 6 },
  error: { color: '#DC2626', marginTop: 6, fontWeight: '700' },
});
