import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  Animated,
  Easing,
  Platform,
} from "react-native";
import HeaderBar from "../components/HeaderBar";
import { useApp } from "../store/AppContext";
import { SafeAreaView } from "react-native-safe-area-context";

const HOURS = Array.from({ length: 9 }, (_, i) => i); // 0..8 hours cap
const DAY_HOURS = Array.from({ length: 24 }, (_, i) => i); // 0..23

export default function DailyGoalsSetup({ onDone }) {
  const { setSchedule, tasks, setTasks, setDailyTargetHours } = useApp();
  const [targetHours, setTargetHours] = useState(3);
  const [slots, setSlots] = useState([]); // {startMin: int, endMin: int}
  const [todo, setTodo] = useState("");
  const [showHoursModal, setShowHoursModal] = useState(false);
  const [showClockModal, setShowClockModal] = useState(false);
  const [centerError, setCenterError] = useState("");

  // Try to load native Android DateTimePicker at runtime
  let DateTimePicker = null;
  try {
    // eslint-disable-next-line global-require
    DateTimePicker = require("@react-native-community/datetimepicker").default;
  } catch (e) {
    DateTimePicker = null;
  }

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [tempStartDate, setTempStartDate] = useState(new Date());
  const [tempEndDate, setTempEndDate] = useState(new Date());

  const totalPlannedMin = useMemo(
    () => slots.reduce((s, x) => s + (x.endMin - x.startMin), 0),
    [slots]
  );
  const remainingMin = Math.max(0, targetHours * 60 - totalPlannedMin);
  const overLimit = totalPlannedMin > targetHours * 60;

  function decHours() {
    const next = Math.max(0, targetHours - 1);
    if (next * 60 < totalPlannedMin) {
      setCenterError("Planned slots exceed hours. Remove a slot first.");
      setTimeout(() => setCenterError(""), 1500);
      return;
    }
    setTargetHours(next);
  }

  function incHours() {
    if (targetHours >= 8) {
      setCenterError("you should not use our app.");
      setTimeout(() => setCenterError(""), 1500);
      return;
    }
    const next = Math.min(8, targetHours + 1);
    setTargetHours(next);
  }

  function addSlotMin(startMin, endMin) {
    const durMin = endMin - startMin;
    if (durMin <= 0) return;
    if (endMin > 24 * 60) return;
    // prevent overlap (minutes)
    for (const s of slots) {
      const a1 = s.startMin, a2 = s.endMin;
      const b1 = startMin, b2 = endMin;
      const overlap = Math.max(0, Math.min(a2, b2) - Math.max(a1, b1));
      if (overlap > 0) {
        setCenterError("This overlaps another slot.");
        setTimeout(() => setCenterError(""), 1500);
        return;
      }
    }
    const nextPlannedMin = totalPlannedMin + durMin;
    if (nextPlannedMin > targetHours * 60) {
      setCenterError("You can't go above your gaming hours.");
      setTimeout(() => setCenterError(""), 1500);
      return;
    }
    setSlots((prev) =>
      [...prev, { startMin, endMin }].sort((a, b) => a.startMin - b.startMin)
    );
  }

  function removeSlot(idx) {
    setSlots((prev) => prev.filter((_, i) => i !== idx));
  }

  function save() {
    if (overLimit) return; // block save
    const nextSchedule = slots.map((s, i) => ({
      id: "slot-" + i,
      startMin: s.startMin,
      endMin: s.endMin,
      status: "planned",
    }));
    setSchedule(nextSchedule);
    setDailyTargetHours(targetHours);
    onDone && onDone({ hours: targetHours, slots: nextSchedule });
  }

  function addTodoFromInput() {
    const t = todo.trim();
    if (!t) return;
    setTasks([
      ...tasks,
      { id: "task-" + Date.now(), text: t, completed: false },
    ]);
    setTodo("");
  }

  function removeTask(id) {
    setTasks(tasks.filter((x) => x.id !== id));
  }

  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(16)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 350,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(slide, {
        toValue: 0,
        duration: 350,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [fade, slide]);

  return (
    <SafeAreaView
      style={styles.container}
    >
      <HeaderBar title="Daily Goals" />

      <ScrollView style={styles.mainContent}>
        <Animated.View
          style={[
            styles.card,
            { opacity: fade, transform: [{ translateY: slide }] },
          ]}
        >
          <Text style={styles.cardTitle}>Select total daily hours</Text>
          <View style={styles.hoursStepper}>
            <Pressable
              style={({ pressed }) => [
                styles.hourBtn,
                pressed && styles.hourBtnPressed,
              ]}
              onPress={decHours}
            >
              <Text style={styles.hourBtnTxt}>−</Text>
            </Pressable>
            <Text style={styles.hourValue}>{targetHours} h</Text>
            <Pressable
              style={({ pressed }) => [
                styles.hourBtn,
                pressed && styles.hourBtnPressed,
              ]}
              onPress={incHours}
            >
              <Text style={styles.hourBtnTxt}>＋</Text>
            </Pressable>
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.card,
            { opacity: fade, transform: [{ translateY: slide }] },
          ]}
        >
          <Text style={styles.cardTitle}>Scheduled slots</Text>
          <Pressable
            disabled={totalPlannedMin >= targetHours * 60}
            style={({ pressed }) => [
              styles.addSlotBtn,
              pressed && styles.addSlotBtnPressed,
              totalPlannedMin >= targetHours * 60 && styles.addSlotBtnDisabled,
            ]}
            onPress={() => {
              const remainingHours = Math.max(0, targetHours - totalPlannedMin / 60);
              if (remainingHours <= 0 || remainingMin <= 0) {
                setCenterError("No hours remaining. Increase hours or remove a slot.");
                setTimeout(() => setCenterError(""), 1500);
                return;
              }
              if (Platform.OS === "android" && DateTimePicker) {
                // Initialize defaults to current hour
                const now = new Date();
                now.setMinutes(0, 0, 0);
                setTempStartDate(now);
                setShowStartPicker(true);
              } else {
                setShowClockModal(true);
              }
            }}
          >
            <Text style={styles.addSlotTxt}>Add Scheduled Slot</Text>
          </Pressable>

          {slots.length === 0 && (
            <Text style={styles.muted}>No slots yet.</Text>
          )}
          {slots.map((s, idx) => (
            <View key={idx} style={styles.slotRow}>
              <Text style={styles.slotTxt}>
                {toHMMin(s.startMin)} - {toHMMin(s.endMin)} ({durationLabel(s.endMin - s.startMin)})
              </Text>
              <Pressable onPress={() => removeSlot(idx)}>
                <Text style={styles.remove}>Remove</Text>
              </Pressable>
            </View>
          ))}

          <Text style={styles.note}>
            Planned: {durationLabel(totalPlannedMin)} / {targetHours}h
          </Text>
          {overLimit && (
            <Text style={styles.error}>
              You can’t go above your gaming hours.
            </Text>
          )}
        </Animated.View>

        <Animated.View
          style={[
            styles.card,
            { opacity: fade, transform: [{ translateY: slide }] },
          ]}
        >
          <Text style={styles.cardTitle}>To-do tasks</Text>
          <View style={styles.inlineForm}>
            <TextInput
              style={styles.taskInput}
              value={todo}
              onChangeText={setTodo}
              placeholder="tasks you like to do instead of gaming"
              placeholderTextColor="#9CA3AF"
            />
            <Pressable
              style={({ pressed }) => [
                styles.addSmall,
                pressed && styles.addSmallPressed,
              ]}
              onPress={addTodoFromInput}
            >
              <Text style={styles.addSmallTxt}>Add</Text>
            </Pressable>
          </View>
          {[...tasks].map((t) => (
            <View key={t.id} style={styles.taskRow}>
              <Text style={styles.taskTxt}>{t.text}</Text>
              <Pressable onPress={() => removeTask(t.id)}>
                <Text style={styles.taskRemove}>x</Text>
              </Pressable>
            </View>
          ))}
        </Animated.View>

        <Pressable
          style={({ pressed }) => [
            styles.cta,
            overLimit && { opacity: 0.4 },
            pressed && styles.ctaPressed,
          ]}
          onPress={save}
          disabled={overLimit}
        >
          <Text style={styles.ctaTxt}>Start your first day</Text>
        </Pressable>

        {!!centerError && (
          <View style={styles.centerError}>
            <Text style={styles.centerErrorTxt}>{centerError}</Text>
          </View>
        )}

        {showHoursModal && (
          <ModalSheet
            onClose={() => setShowHoursModal(false)}
            title="Select total hours"
          >
            <WheelPicker
              data={HOURS}
              value={targetHours}
              onChange={setTargetHours}
            />
            <Pressable
              style={[styles.cta, { marginTop: 12 }]}
              onPress={() => setShowHoursModal(false)}
            >
              <Text style={styles.ctaTxt}>Confirm</Text>
            </Pressable>
          </ModalSheet>
        )}

        {showClockModal && (
          <ClockModal
            remaining={Math.floor(remainingMin / 60)}
            onCancel={() => setShowClockModal(false)}
            onConfirm={(startHour, endHour) => {
              const startMin = startHour * 60;
              const endMin = endHour * 60;
              addSlotMin(startMin, endMin);
              setShowClockModal(false);
            }}
          />
        )}

        {Platform.OS === "android" && DateTimePicker && showStartPicker && (
          <DateTimePicker
            value={tempStartDate}
            mode="time"
            is24Hour
            display="default"
            onChange={(event, date) => {
              setShowStartPicker(false);
              if (!date || event?.type === 'dismissed') return;
              const start = new Date(date);
              // Snap to nearest 15 minutes
              const m = start.getMinutes();
              const snapped = Math.round(m / 15) * 15;
              start.setMinutes(snapped, 0, 0);
              const remainingHours = Math.max(0, targetHours - totalPlannedMin / 60);
              const end = new Date(start);
              // Default end = start + min(remaining, 1h) rounded to 15m, cap to 23:45
              const stepMin = Math.max(15, Math.min(60, Math.round(remainingHours * 60 / 15) * 15));
              const endMinutes = Math.min(23 * 60 + 45, start.getHours() * 60 + start.getMinutes() + stepMin);
              end.setHours(Math.floor(endMinutes / 60), endMinutes % 60, 0, 0);
              setTempStartDate(start);
              setTempEndDate(end);
              setShowEndPicker(true);
            }}
          />
        )}
        {Platform.OS === "android" && DateTimePicker && showEndPicker && (
          <DateTimePicker
            value={tempEndDate}
            mode="time"
            is24Hour
            display="default"
            onChange={(event, date) => {
              setShowEndPicker(false);
              if (!date || event?.type === 'dismissed') return;
              const picked = new Date(date);
              // Snap to nearest 15 minutes
              const m = picked.getMinutes();
              const snapped = Math.round(m / 15) * 15;
              picked.setMinutes(snapped, 0, 0);
              const startMin = tempStartDate.getHours() * 60 + tempStartDate.getMinutes();
              const endMin = picked.getHours() * 60 + picked.getMinutes();
              if (endMin <= startMin) {
                setCenterError("End time must be after start time.");
                setTimeout(() => setCenterError(""), 1500);
                return;
              }
              const durMin = endMin - startMin;
              if (durMin > remainingMin) {
                setCenterError("Exceeds remaining hours.");
                setTimeout(() => setCenterError(""), 1500);
                return;
              }
              addSlotMin(startMin, endMin);
            }}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function toHM(h) {
  return `${String(h).padStart(2, "0")}:00`;
}

// Format minutes since 00:00 into HH:MM
function toHMMin(min) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// Human label for a duration in minutes, e.g., 0 -> 0m, 15 -> 15m, 90 -> 1h 30m
function durationLabel(min) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  const parts = [];
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  if (parts.length === 0) return '0m';
  return parts.join(' ');
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
    scrollRef.current?.scrollTo({ y: i * ITEM_H, animated: true });
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
        <Text onPress={onClose} style={styles.sheetClose}>
          Close
        </Text>
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
    else {
      setStart(h);
      setEnd(null);
    }
  }

  const canConfirm =
    start != null &&
    end != null &&
    end > start &&
    end - start <= Math.max(1, remaining || 24);

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
              <Pressable
                key={h}
                onPress={() => pick(h)}
                style={[
                  styles.clockDot,
                  {
                    left: x,
                    top: y,
                    backgroundColor: selected ? "#111" : "#FFF",
                    borderColor: "#E5E7EB",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.clockTxt,
                    { color: selected ? "#FFF" : "#111" },
                  ]}
                >
                  {h}
                </Text>
              </Pressable>
            );
          })}
          <View style={styles.clockCenter} />
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: 12,
          }}
        >
          <Pressable
            style={[styles.cta, { flex: 1, backgroundColor: "#F3F4F6" }]}
            onPress={onCancel}
          >
            <Text style={[styles.ctaTxt, { color: "#111" }]}>Cancel</Text>
          </Pressable>
          <View style={{ width: 10 }} />
          <Pressable
            disabled={!canConfirm}
            style={[styles.cta, { flex: 1, opacity: canConfirm ? 1 : 0.4 }]}
            onPress={() => onConfirm(start, end)}
          >
            <Text style={styles.ctaTxt}>Confirm</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF"},
  mainContent: { padding: 20 },
  h2: { fontSize: 16, fontWeight: "700", color: "#111" },
  label: { color: "#111", marginBottom: 6 },
  note: { color: "#6B7280", marginTop: 6 },
  error: { color: "#DC2626", marginTop: 6, fontWeight: "700" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    borderWidth: 1,
    borderColor: "#F3F4F6",
    marginBottom: 16,
  },
  cardTitle: {
    color: "#111",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 10,
  },
  muted: { color: "#9CA3AF" },
  input: {
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    color: "#111",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 8,
  },
  cta: {
    backgroundColor: "#111",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 30,
  },
  ctaPressed: { backgroundColor: "#4B5563" },
  ctaTxt: { color: "#fff", fontWeight: "800" },
  hoursStepper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
    marginBottom: 4,
  },
  hourBtn: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: "#111",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 10,
  },
  hourBtnPressed: { backgroundColor: "#4B5563" },
  hourBtnTxt: { color: "#fff", fontSize: 20, fontWeight: "800" },
  hourValue: {
    minWidth: 64,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "800",
    color: "#111",
  },
  inlineForm: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  taskInput: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    color: "#111",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginRight: 8,
  },
  addSmall: {
    backgroundColor: "#111",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  addSmallPressed: { backgroundColor: "#4B5563" },
  addSmallTxt: { color: "#fff", fontWeight: "800" },
  selectBtn: {
    backgroundColor: "#111",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 8,
  },
  selectBtnPressed: { backgroundColor: "#4B5563" },
  selectBtnTxt: { color: "#fff", fontWeight: "800" },
  addSlotBtn: {
    backgroundColor: "#111",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 8,
  },
  addSlotBtnPressed: { backgroundColor: "#4B5563" },
  addSlotBtnDisabled: { opacity: 0.4 },
  addSlotTxt: { color: "#fff", fontWeight: "800" },
  slotRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  slotTxt: { color: "#111", fontWeight: "600" },
  remove: { color: "#111" },

  taskTxt: { color: "#111", flex: 1, marginRight: 10 },
  taskRemove: {
    color: "#111",
    fontWeight: "800",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  wheelWrap: {
    height: 120,
    borderRadius: 12,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
  },
  wheelItem: { alignItems: "center", justifyContent: "center" },
  wheelTxt: { color: "#111", fontSize: 16, fontWeight: "700" },
  wheelOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 40,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
  },
  sheetWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  sheet: {
    width: "92%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 18,
  },
  sheetTitle: { color: "#111", fontWeight: "800", marginBottom: 10 },
  sheetClose: { textAlign: "center", color: "#111", marginTop: 10 },
  centerError: {
    position: "absolute",
    left: 20,
    right: 20,
    top: "45%",
    backgroundColor: "#DC2626",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  centerErrorTxt: { color: "#fff", fontWeight: "800" },
  clock: {
    alignSelf: "center",
    position: "relative",
    backgroundColor: "#FFF",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginVertical: 10,
  },
  clockDot: {
    position: "absolute",
    width: 40,
    height: 40,
    marginLeft: -20,
    marginTop: -20,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  clockTxt: { fontSize: 12, fontWeight: "700" },
  taskRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
});
