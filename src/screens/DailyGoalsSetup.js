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

import { spacing, typography, radii, shadows } from "../theme/tokens";
import StyledButton from "../components/StyledButton";
import { Ionicons } from "@expo/vector-icons";

export default function DailyGoalsSetup({ onDone, themeColors, onBack }) {
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);
  const HOURS = Array.from({ length: 9 }, (_, i) => i);
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
    [slots],
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
      const a1 = s.startMin,
        a2 = s.endMin;
      const b1 = startMin,
        b2 = endMin;
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
      [...prev, { startMin, endMin }].sort((a, b) => a.startMin - b.startMin),
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
      style={[styles.container, { backgroundColor: "transparent" }]}
    >
      {/* App Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: spacing.sm,
          paddingHorizontal: spacing.lg,
          paddingTop: spacing.md,
        }}
      >
        {!!onBack && (
          <Pressable
            onPress={onBack}
            style={{ padding: 4, marginRight: spacing.sm }}
          >
            <Ionicons name="arrow-back" size={20} color={themeColors.text} />
          </Pressable>
        )}
        <View
          style={{
            backgroundColor: themeColors.primary,
            width: 28,
            height: 28,
            borderRadius: radii.sm,
            alignItems: "center",
            justifyContent: "center",
            marginRight: spacing.sm,
          }}
        >
          <Text
            style={{
              color: themeColors.surface,
              fontSize: 10,
              fontWeight: "bold",
            }}
          >
            GQ
          </Text>
        </View>
        <Text
          style={{
            ...typography.subtitle,
            color: themeColors.text,
            fontWeight: "700",
          }}
        >
          GameQuitter
        </Text>
      </View>

      {/* Step Completion Bar - All 7 steps filled (final step) */}
      <View
        style={{
          flexDirection: "row",
          paddingHorizontal: spacing.lg,
          marginBottom: spacing.md,
          gap: 4,
        }}
      >
        {[1, 2, 3, 4, 5, 6, 7].map((step) => (
          <View
            key={step}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 2,
              backgroundColor: themeColors.primary,
              opacity: step === 7 ? 1 : 0.4,
            }}
          />
        ))}
      </View>

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
              const remainingHours = Math.max(
                0,
                targetHours - totalPlannedMin / 60,
              );
              if (remainingHours <= 0 || remainingMin <= 0) {
                setCenterError(
                  "No hours remaining. Increase hours or remove a slot.",
                );
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
                {toHMMin(s.startMin)} - {toHMMin(s.endMin)} (
                {durationLabel(s.endMin - s.startMin)})
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

        <StyledButton
          title="Start your first day"
          onPress={save}
          colors={themeColors}
          disabled={overLimit}
          rectangular
          style={{ marginTop: spacing.md, marginBottom: spacing.xl }}
        />

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
              if (!date || event?.type === "dismissed") return;
              const start = new Date(date);
              // Snap to nearest 15 minutes
              const m = start.getMinutes();
              const snapped = Math.round(m / 15) * 15;
              start.setMinutes(snapped, 0, 0);
              const remainingHours = Math.max(
                0,
                targetHours - totalPlannedMin / 60,
              );
              const end = new Date(start);
              // Default end = start + min(remaining, 1h) rounded to 15m, cap to 23:45
              const stepMin = Math.max(
                15,
                Math.min(60, Math.round((remainingHours * 60) / 15) * 15),
              );
              const endMinutes = Math.min(
                23 * 60 + 45,
                start.getHours() * 60 + start.getMinutes() + stepMin,
              );
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
              if (!date || event?.type === "dismissed") return;
              const picked = new Date(date);
              // Snap to nearest 15 minutes
              const m = picked.getMinutes();
              const snapped = Math.round(m / 15) * 15;
              picked.setMinutes(snapped, 0, 0);
              const startMin =
                tempStartDate.getHours() * 60 + tempStartDate.getMinutes();
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
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

// Human label for a duration in minutes, e.g., 0 -> 0m, 15 -> 15m, 90 -> 1h 30m
function durationLabel(min) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  const parts = [];
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  if (parts.length === 0) return "0m";
  return parts.join(" ");
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

const createStyles = (colors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    mainContent: { padding: spacing.lg },
    h2: { ...typography.subtitle, color: colors.text },
    label: { color: colors.text, marginBottom: spacing.xs },
    note: {
      ...typography.caption,
      color: colors.textDim,
      marginTop: spacing.xs,
    },
    error: { color: colors.danger, marginTop: spacing.xs, fontWeight: "700" },
    card: {
      backgroundColor: colors.surface,
      borderRadius: radii.lg,
      padding: spacing.lg,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: spacing.lg,
      ...shadows.card,
    },
    cardTitle: {
      color: colors.text,
      ...typography.subtitle,
      marginBottom: spacing.sm,
    },
    muted: { color: colors.textDim },
    input: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      color: colors.text,
      borderRadius: radii.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      marginTop: spacing.xs,
    },
    cta: {
      backgroundColor: colors.primary,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.xl,
      borderRadius: radii.full,
      alignItems: "center",
      marginBottom: spacing.xl,
      ...shadows.md,
    },
    ctaPressed: { opacity: 0.8 },
    ctaTxt: { color: colors.background, fontWeight: "800", fontSize: 16 },
    hoursStepper: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginTop: spacing.sm,
      marginBottom: spacing.xs,
    },
    hourBtn: {
      width: 48,
      height: 48,
      borderRadius: radii.md,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      marginHorizontal: spacing.md,
    },
    hourBtnPressed: { opacity: 0.7 },
    hourBtnTxt: { color: colors.background, fontSize: 24, fontWeight: "800" },
    hourValue: {
      minWidth: 64,
      textAlign: "center",
      fontSize: 22,
      fontWeight: "800",
      color: colors.text,
    },
    inlineForm: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: spacing.sm,
    },
    taskInput: {
      flex: 1,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      color: colors.text,
      borderRadius: radii.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      marginRight: spacing.sm,
    },
    addSmall: {
      backgroundColor: colors.primary,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      borderRadius: radii.md,
      alignItems: "center",
      justifyContent: "center",
    },
    addSmallPressed: { opacity: 0.7 },
    addSmallTxt: { color: colors.background, fontWeight: "800" },
    addSlotBtn: {
      backgroundColor: colors.primary,
      borderRadius: radii.md,
      paddingVertical: spacing.md,
      alignItems: "center",
      marginBottom: spacing.sm,
    },
    addSlotBtnPressed: { opacity: 0.7 },
    addSlotBtnDisabled: { opacity: 0.3 },
    addSlotTxt: { color: colors.background, fontWeight: "800" },
    slotRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: spacing.sm,
      paddingVertical: spacing.xs,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    slotTxt: { color: colors.text, fontWeight: "600" },
    remove: { color: colors.danger, fontWeight: "600" },

    taskTxt: { color: colors.text, flex: 1, marginRight: spacing.md },
    taskRemove: {
      color: colors.danger,
      fontWeight: "800",
      paddingHorizontal: spacing.sm,
    },
    wheelWrap: {
      height: 120,
      borderRadius: radii.md,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
    },
    wheelItem: { alignItems: "center", justifyContent: "center" },
    wheelTxt: { color: colors.text, fontSize: 16, fontWeight: "700" },
    wheelOverlay: {
      position: "absolute",
      left: 0,
      right: 0,
      height: 40,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: colors.border,
    },
    sheetWrap: {
      position: "absolute",
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.7)",
      alignItems: "center",
      justifyContent: "center",
    },
    sheet: {
      width: "90%",
      backgroundColor: colors.surface,
      borderRadius: radii.lg,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.lg,
      ...shadows.lg,
    },
    sheetTitle: {
      color: colors.text,
      ...typography.subtitle,
      marginBottom: spacing.md,
    },
    sheetClose: {
      textAlign: "center",
      color: colors.textDim,
      marginTop: spacing.md,
      fontWeight: "600",
    },
    centerError: {
      position: "absolute",
      left: 20,
      right: 20,
      top: "45%",
      backgroundColor: colors.danger,
      paddingVertical: spacing.md,
      borderRadius: radii.md,
      alignItems: "center",
      ...shadows.lg,
    },
    centerErrorTxt: { color: "#fff", fontWeight: "800" },
    clock: {
      alignSelf: "center",
      position: "relative",
      backgroundColor: colors.background,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.border,
      marginVertical: spacing.md,
    },
    clockDot: {
      position: "absolute",
      width: 44,
      height: 44,
      marginLeft: -22,
      marginTop: -22,
      borderRadius: 22,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    clockTxt: { fontSize: 14, fontWeight: "700" },
    taskRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: spacing.sm,
      paddingVertical: spacing.xs,
    },
  });
