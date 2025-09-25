import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, Animated, Easing } from 'react-native';
import { useApp } from '../store/AppContext';

const HOURS = Array.from({ length: 13 }, (_, i) => i); // 0..12 hours cap
const DAY_HOURS = Array.from({ length: 24 }, (_, i) => i); // 0..23

export default function DailyGoalsSetup({ onDone }) {
  const { setSchedule, tasks, setTasks, setDailyTargetHours } = useApp();
  const [targetHours, setTargetHours] = useState(3);
  const [slots, setSlots] = useState([]); // {start: hourInt, dur: hourInt}
  const [todo, setTodo] = useState('');
  const [showHoursModal, setShowHoursModal] = useState(false);
  const [showClockModal, setShowClockModal] = useState(false);
  const [centerError, setCenterError] = useState('');

  const totalPlanned = useMemo(() => slots.reduce((s, x) => s + x.dur, 0), [slots]);
  const remaining = Math.max(0, targetHours - totalPlanned);
  const overLimit = totalPlanned > targetHours;

  function addSlot(startHour, dur) {
    if (dur <= 0) return;
    const endHour = startHour + dur;
    if (endHour > 24) return;
    // prevent overlap
    for (const s of slots) {
      const a1 = s.start, a2 = s.start + s.dur;
      const b1 = startHour, b2 = endHour;
      const overlap = Math.max(0, Math.min(a2, b2) - Math.max(a1, b1));
      if (overlap > 0) {
        setCenterError('This overlaps another slot.');
        setTimeout(() => setCenterError(''), 1500);
        return;
      }
    }
    const nextPlanned = totalPlanned + dur;
    if (nextPlanned > targetHours) {
      setCenterError("You can't go above your gaming hours.");
      setTimeout(() => setCenterError(''), 1500);
      return;
    }
    setSlots((prev) => [...prev, { start: startHour, dur }].sort((a, b) => a.start - b.start));
  }

  function removeSlot(idx) {
    setSlots((prev) => prev.filter((_, i) => i !== idx));
  }

  function save() {
    if (overLimit) return; // block save
    const nextSchedule = slots.map((s, i) => ({ id: 'slot-' + i, startMin: s.start * 60, endMin: (s.start + s.dur) * 60, status: 'planned' }));
    setSchedule(nextSchedule);
    setDailyTargetHours(targetHours);
    if (todo.trim()) setTasks([...tasks, { id: 'task-init', text: todo.trim(), completed: false }]);
    onDone && onDone({ hours: targetHours, slots: nextSchedule });
  }

  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(16)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 350, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 350, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, [fade, slide]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.containerContent}>
      <Animated.View style={[styles.header, { opacity: fade, transform: [{ translateY: slide }] }]}> 
        <Text style={styles.h1}>Daily Goals</Text>
        <Text style={styles.sub}>Plan your gaming hours and schedule focused slots.</Text>
      </Animated.View>

      <Animated.View style={[styles.card, { opacity: fade, transform: [{ translateY: slide }] }]}> 
        <Text style={styles.cardTitle}>Total gaming today</Text>
        <Pressable style={styles.selectBtn} onPress={() => setShowHoursModal(true)}>
          <Text style={styles.selectBtnTxt}>{targetHours} hours ▾</Text>
        </Pressable>
        <Text style={styles.note}>Choose only what you can keep.</Text>
      </Animated.View>

      <Animated.View style={[styles.card, { opacity: fade, transform: [{ translateY: slide }] }]}> 
        <Text style={styles.cardTitle}>Scheduled slots</Text>
        <Pressable style={styles.addSlotBtn} onPress={() => setShowClockModal(true)}>
          <Text style={styles.addSlotTxt}>Add Scheduled Slot</Text>
        </Pressable>

        {slots.length === 0 && <Text style={styles.muted}>No slots yet.</Text>}
        {slots.map((s, idx) => (
          <View key={idx} style={styles.slotRow}>
            <Text style={styles.slotTxt}>{toHM(s.start)} - {toHM(s.start + s.dur)} ({s.dur}h)</Text>
            <Pressable onPress={() => removeSlot(idx)}><Text style={styles.remove}>Remove</Text></Pressable>
          </View>
        ))}

        <Text style={styles.note}>Planned: {totalPlanned}h / {targetHours}h</Text>
        {overLimit && <Text style={styles.error}>You can’t go above your gaming hours.</Text>}
      </Animated.View>

      <Animated.View style={[styles.card, { opacity: fade, transform: [{ translateY: slide }] }]}> 
        <Text style={styles.cardTitle}>Optional task</Text>
        <TextInput style={styles.input} value={todo} onChangeText={setTodo} placeholder="e.g., Read 10 pages" placeholderTextColor="#9CA3AF" />
      </Animated.View>

      <Pressable style={[styles.cta, overLimit && { opacity: 0.4 }]} onPress={save} disabled={overLimit}>
        <Text style={styles.ctaTxt}>Start your first day</Text>
      </Pressable>

      {!!centerError && (
        <View style={styles.centerError}><Text style={styles.centerErrorTxt}>{centerError}</Text></View>
      )}

      {showHoursModal && (
        <ModalSheet onClose={() => setShowHoursModal(false)} title="Select total hours">
          <WheelPicker data={HOURS} value={targetHours} onChange={setTargetHours} />
          <Pressable style={[styles.cta, { marginTop: 12 }]} onPress={() => setShowHoursModal(false)}>
            <Text style={styles.ctaTxt}>Confirm</Text>
          </Pressable>
        </ModalSheet>
      )}

      {showClockModal && (
        <ClockModal
          remaining={remaining}
          onCancel={() => setShowClockModal(false)}
          onConfirm={(startHour, endHour) => {
            const dur = endHour - startHour;
            addSlot(startHour, dur);
            setShowClockModal(false);
          }}
        />
      )}
    </ScrollView>
  );
}

function toHM(h) {
  return `${String(h).padStart(2, '0')}:00`;
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

function ModalSheet({ title, children, onClose }) {
  return (
    <View style={styles.sheetWrap}>
      <View style={styles.sheet}>
        <Text style={styles.sheetTitle}>{title}</Text>
        {children}
        <Text onPress={onClose} style={styles.sheetClose}>Close</Text>
      </View>
    </View>
  );
}

function ClockModal({ remaining, onCancel, onConfirm }) {
  const R = 100;
  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);
  const hours = Array.from({ length: 24 }, (_, i) => i);

  function pick(h) {
    if (start == null) setStart(h);
    else if (end == null) setEnd(h);
    else { setStart(h); setEnd(null); }
  }

  const canConfirm = start != null && end != null && end > start && (end - start) <= Math.max(1, remaining || 24);

  return (
    <View style={styles.sheetWrap}>
      <View style={styles.sheet}>
        <Text style={styles.sheetTitle}>Pick start and end</Text>
        <View style={[styles.clock, { width: R * 2 + 20, height: R * 2 + 20 }]}> 
          {hours.map((h, i) => {
            const angle = (Math.PI * 2 * i) / 24 - Math.PI / 2;
            const x = R + Math.cos(angle) * R;
            const y = R + Math.sin(angle) * R;
            const selected = h === start || h === end;
            return (
              <Pressable key={h} onPress={() => pick(h)} style={[styles.clockDot, { left: x, top: y, backgroundColor: selected ? '#111' : '#FFF', borderColor: '#E5E7EB' }]}>
                <Text style={[styles.clockTxt, { color: selected ? '#FFF' : '#111' }]}>{h}</Text>
              </Pressable>
            );
          })}
          <View style={styles.clockCenter} />
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
          <Pressable style={[styles.cta, { flex: 1, backgroundColor: '#F3F4F6' }]} onPress={onCancel}><Text style={[styles.ctaTxt, { color: '#111' }]}>Cancel</Text></Pressable>
          <View style={{ width: 10 }} />
          <Pressable disabled={!canConfirm} style={[styles.cta, { flex: 1, opacity: canConfirm ? 1 : 0.4 }]} onPress={() => onConfirm(start, end)}><Text style={styles.ctaTxt}>Confirm</Text></Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', padding: 20 },
  containerContent: { paddingTop: 72, paddingBottom: 28 },
  h1: { fontSize: 22, fontWeight: '800', color: '#111', marginBottom: 10 },
  header: { marginBottom: 8 },
  sub: { color: '#6B7280' },
  h2: { fontSize: 16, fontWeight: '700', color: '#111' },
  label: { color: '#111', marginBottom: 6 },
  note: { color: '#6B7280', marginTop: 6 },
  error: { color: '#DC2626', marginTop: 6, fontWeight: '700' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 14, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, borderWidth: 1, borderColor: '#F3F4F6' },
  cardTitle: { color: '#111', fontSize: 16, fontWeight: '700', marginBottom: 10 },
  muted: { color: '#9CA3AF' },
  input: { backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB', color: '#111', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, marginTop: 8 },
  cta: { backgroundColor: '#111', paddingVertical: 14, borderRadius: 999, alignItems: 'center', marginTop: 24 },
  ctaTxt: { color: '#fff', fontWeight: '800' },
  selectBtn: { backgroundColor: '#111', borderRadius: 12, paddingVertical: 12, alignItems: 'center', marginBottom: 8 },
  selectBtnTxt: { color: '#fff', fontWeight: '800' },
  addSlotBtn: { backgroundColor: '#111', borderRadius: 12, paddingVertical: 12, alignItems: 'center', marginBottom: 8 },
  addSlotTxt: { color: '#fff', fontWeight: '800' },
  slotRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  slotTxt: { color: '#111', fontWeight: '600' },
  remove: { color: '#111' },
  wheelWrap: { height: 120, borderRadius: 12, backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', overflow: 'hidden' },
  wheelItem: { alignItems: 'center', justifyContent: 'center' },
  wheelTxt: { color: '#111', fontSize: 16, fontWeight: '700' },
  wheelOverlay: { position: 'absolute', left: 0, right: 0, height: 40, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#E5E7EB' },
  sheetWrap: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  sheet: { width: '92%', backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', padding: 18 },
  sheetTitle: { color: '#111', fontWeight: '800', marginBottom: 10 },
  sheetClose: { textAlign: 'center', color: '#111', marginTop: 10 },
  centerError: { position: 'absolute', left: 20, right: 20, bottom: 40, backgroundColor: '#111', paddingVertical: 10, borderRadius: 999, alignItems: 'center' },
  centerErrorTxt: { color: '#fff', fontWeight: '800' },
  clock: { alignSelf: 'center', position: 'relative', backgroundColor: '#FFF', borderRadius: 999, borderWidth: 1, borderColor: '#E5E7EB', marginVertical: 10 },
  clockDot: { position: 'absolute', width: 40, height: 40, marginLeft: -20, marginTop: -20, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  clockTxt: { fontSize: 12, fontWeight: '700' },
});
