import React, { useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput } from 'react-native';
import HeaderBar from '../components/HeaderBar';
import { useApp } from '../store/AppContext';
import { getThemeColors } from '../theme/tokens';

function msToHMS(ms) {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const pad = (n) => String(n).padStart(2, '0');
  return `${h}:${pad(m)}:${pad(s)}`;
}

export default function HomeLightScreen({ openGameMode, openStats }) {
  const {
    running,
    startSession,
    stopSession,
    msToday,
    msByDayForLast7,
    remainingBudgetMs,
    playLogs,
    tasks,
    toggleTask,
    addTask,
    removeTask,
  } = useApp();

  // Get theme colors based on whether game is running
  const themeColors = getThemeColors(running);

  const [taskInput, setTaskInput] = useState('');
  const [showTaskInput, setShowTaskInput] = useState(false);
  const inputRef = useRef(null);
  function addTaskFromInput() {
    const t = taskInput.trim();
    if (!t) return;
    addTask(t);
    setTaskInput('');
    setShowTaskInput(false);
  }

  const todayMs = msToday();
  const last7 = msByDayForLast7();
  const maxMs = useMemo(() => Math.max(1, ...last7), [last7]);
  const remainingMs = remainingBudgetMs();
  const todaysCompletedCount = useMemo(() => {
    if (!playLogs || playLogs.length === 0) return 0;
    const today = new Date();
    const y = today.getFullYear(), m = today.getMonth(), d = today.getDate();
    return playLogs.filter(l => !!l.end && (new Date(l.end)).getFullYear() === y && (new Date(l.end)).getMonth() === m && (new Date(l.end)).getDate() === d).length;
  }, [playLogs]);

  // Create dynamic styles based on theme
  const dynamicStyles = useMemo(() => createStyles(themeColors), [themeColors]);

  return (
    <View style={dynamicStyles.container}>
      {/* Shared Header */}
      <HeaderBar title="Focus Tracker" />
      <ScrollView contentContainerStyle={dynamicStyles.containerContent}>

        {/* Progress Summary Card */}
        <Pressable style={dynamicStyles.progressCard} onPress={() => openStats && openStats()}>
          <View style={dynamicStyles.progressHeader}>
            <Text style={dynamicStyles.progressTime}>
              {Math.floor(todayMs / 3600000)}h {Math.floor((todayMs % 3600000) / 60000)}m
            </Text>
            <Text style={dynamicStyles.progressLabel}>Today</Text>
          </View>
          <View style={dynamicStyles.progressBarContainer}>
            <View style={[dynamicStyles.progressBar, { width: `${Math.min(100, todayMs / Math.max(1, remainingMs + todayMs) * 100)}%` }]} />
          </View>
          <Text style={dynamicStyles.progressTarget}>Target: {Math.floor(remainingMs / 3600000) + Math.floor(todayMs / 3600000)}h</Text>
        </Pressable>

        {/* Game Mode Card */}
        <View style={dynamicStyles.card}>
          <Text style={dynamicStyles.cardTitle}>Game Mode</Text>
          <Text style={{ color: themeColors.text, marginBottom: 8 }}>
            Remaining today: {Math.floor(remainingMs / 3600000)}h {Math.floor((remainingMs % 3600000) / 60000)}m
          </Text>

          {running ? (
            <Pressable style={({ pressed }) => [dynamicStyles.cardBtn, pressed && dynamicStyles.cardBtnPressed]} onPress={stopSession}>
              <Text style={dynamicStyles.cardBtnText}>Mark as Done</Text>
            </Pressable>
          ) : remainingMs > 0 ? (
            <Pressable style={({ pressed }) => [dynamicStyles.cardBtn, pressed && dynamicStyles.cardBtnPressed]} onPress={startSession}>
              <Text style={dynamicStyles.cardBtnText}>Start</Text>
            </Pressable>
          ) : (
            <>
              <Text style={{ color: themeColors.textDim }}>Budget used. You can still override from Game Mode.</Text>
              <Pressable style={[dynamicStyles.muted, { marginTop: 8 }]} onPress={() => openGameMode && openGameMode()}>
                <Text style={{ color: themeColors.textDim }}>Open full Game Mode</Text>
              </Pressable>
            </>
          )}
        </View>

        {/* Today's Schedule */}
        <View style={dynamicStyles.card}>
          <View style={dynamicStyles.sectionHeaderRow}>
            <Text style={dynamicStyles.cardTitle}>Today's Schedule</Text>
            <Pressable onPress={() => { setShowTaskInput(true); setTimeout(() => inputRef.current?.focus(), 0); }}>
              <Text style={dynamicStyles.addHeaderLink}>Add</Text>
            </Pressable>
          </View>
          {tasks.length === 0 && <Text style={dynamicStyles.muted}>No tasks today.</Text>}
          {tasks.map((t) => (
            <View key={t.id} style={dynamicStyles.taskRow}>
              <Pressable
                onPress={() => toggleTask(t.id)}
                style={{ flexDirection: 'row', flex: 1, alignItems: 'center' }}
              >
                <View style={[dynamicStyles.checkbox, t.completed && dynamicStyles.checkboxOn]} />
                <Text style={[dynamicStyles.taskText, t.completed && dynamicStyles.taskTextDone]}>{t.text}</Text>
              </Pressable>
              <Pressable onPress={() => removeTask(t.id)}>
                <Text style={dynamicStyles.taskRemove}>x</Text>
              </Pressable>
            </View>
          ))}
          {showTaskInput && (
            <View style={dynamicStyles.addTaskForm}>
              <TextInput
                ref={inputRef}
                value={taskInput}
                onChangeText={setTaskInput}
                style={dynamicStyles.addTaskInput}
                placeholder="Add a new task"
                placeholderTextColor={themeColors.textDim}
                onSubmitEditing={addTaskFromInput}
                onBlur={() => { if (!taskInput.trim()) setShowTaskInput(false); }}
              />
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const createStyles = (colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  containerContent: { padding: 20, paddingBottom: 28 },

  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 10, textAlign: 'left' },

  timerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  timer: { fontSize: 32, fontWeight: '800', color: colors.text },

  btn: {
    borderRadius: 22,
    paddingVertical: 10,
    paddingHorizontal: 18,
    backgroundColor: colors.primary,
  },
  btnText: { color: colors.background, fontWeight: '700' },

  // Rectangular buttons for Game Mode card (match full Game Mode)
  cardBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 6,
  },
  cardBtnPressed: { backgroundColor: colors.primaryDim },
  cardBtnText: { color: colors.background, fontWeight: '800' },

  // Game Mode CTA
  gameModeBtn: { backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 12, alignItems: 'center', marginBottom: 12 },
  gameModeBtnText: { color: colors.background, fontWeight: '800' },

  // Progress Card (Android wellbeing style)
  progressCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
    alignItems: 'center',
  },
  progressHeader: { alignItems: 'center', marginBottom: 16 },
  progressTime: { fontSize: 36, fontWeight: '800', color: colors.text, marginBottom: 4 },
  progressLabel: { fontSize: 14, color: colors.textDim },
  progressBarContainer: { width: '100%', height: 8, backgroundColor: colors.border, borderRadius: 4, marginBottom: 8 },
  progressBar: { height: '100%', backgroundColor: colors.primary, borderRadius: 4 },
  progressTarget: { fontSize: 12, color: colors.textDim },

  muted: { color: colors.textDim, marginTop: 6, textAlign: 'center' },

  barRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 110, marginTop: 6 },
  barWrap: { flex: 1, alignItems: 'center' },
  bar: { width: 18, borderRadius: 9, backgroundColor: colors.primary },

  taskRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  checkbox: { width: 18, height: 18, borderRadius: 4, borderWidth: 2, borderColor: colors.primary, marginRight: 10 },
  checkboxOn: { backgroundColor: colors.primary },
  taskText: { color: colors.text },
  taskTextDone: { color: colors.textDim, textDecorationLine: 'line-through' },
  taskRemove: { color: colors.primary, fontWeight: '800', paddingHorizontal: 8, paddingVertical: 4 },

  // Header Add button and input styles
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  addHeaderLink: { color: colors.primary, fontWeight: '800' },
  addHeaderButton: { backgroundColor: colors.primary, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8 },
  addHeaderButtonPressed: { backgroundColor: colors.primaryDim },
  addHeaderButtonText: { color: colors.background, fontWeight: '800' },
  addTaskForm: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  addTaskInput: { flex: 1, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, color: colors.text, borderRadius: 12, paddingHorizontal: 15, paddingVertical: 12, fontSize: 15 },
});

