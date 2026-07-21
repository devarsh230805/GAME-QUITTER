import React, { useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
} from "react-native";
import HeaderBar from "../components/HeaderBar";
import StyledCard from "../components/StyledCard";
import StyledButton from "../components/StyledButton";
import StyledProgressBar from "../components/StyledProgressBar";
import { useApp } from "../store/AppContext";
import {
  getThemeColors,
  typography,
  spacing,
  radii,
  shadows,
} from "../theme/tokens";

function msToHMS(ms) {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const pad = (n) => String(n).padStart(2, "0");
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
    themeMode,
  } = useApp();

  // Get theme colors based on whether game is running
  const themeColors = getThemeColors(running, themeMode);

  const [taskInput, setTaskInput] = useState("");
  const [showTaskInput, setShowTaskInput] = useState(false);
  const inputRef = useRef(null);
  function addTaskFromInput() {
    const t = taskInput.trim();
    if (!t) return;
    addTask(t);
    setTaskInput("");
    setShowTaskInput(false);
  }

  const todayMs = msToday();
  const last7 = msByDayForLast7();
  const maxMs = useMemo(() => Math.max(1, ...last7), [last7]);
  const remainingMs = remainingBudgetMs();
  const todaysCompletedCount = useMemo(() => {
    if (!playLogs || playLogs.length === 0) return 0;
    const today = new Date();
    const y = today.getFullYear(),
      m = today.getMonth(),
      d = today.getDate();
    return playLogs.filter(
      (l) =>
        !!l.end &&
        new Date(l.end).getFullYear() === y &&
        new Date(l.end).getMonth() === m &&
        new Date(l.end).getDate() === d,
    ).length;
  }, [playLogs]);

  // Create dynamic styles based on theme
  const dynamicStyles = useMemo(
    () => createStyles(themeColors, running),
    [themeColors, running],
  );

  return (
    <View style={dynamicStyles.container}>
      {/* Shared Header */}
      <HeaderBar title="Focus Tracker" />
      <ScrollView contentContainerStyle={dynamicStyles.containerContent}>
        {/* Progress Summary Card */}
        <Pressable onPress={() => openStats && openStats()}>
          <StyledCard
            colors={themeColors}
            variant={running ? "game" : "default"}
          >
            <View style={dynamicStyles.progressHeader}>
              <View style={dynamicStyles.eyebrowRow}>
                <View style={dynamicStyles.eyebrowDot} />
                <Text style={dynamicStyles.cardTitle}>Stats</Text>
              </View>
              <Text style={dynamicStyles.progressTime}>
                {Math.floor(todayMs / 3600000)}h{" "}
                {Math.floor((todayMs % 3600000) / 60000)}m
              </Text>
              <Text style={dynamicStyles.progressLabel}>Today’s focus</Text>
            </View>
            <StyledProgressBar
              progress={Math.min(
                1,
                todayMs / Math.max(1, remainingMs + todayMs),
              )}
              colors={themeColors}
              variant={running ? "game" : "default"}
            />
            <Text style={dynamicStyles.progressTarget}>
              Target:{" "}
              {Math.floor(remainingMs / 3600000) +
                Math.floor(todayMs / 3600000)}
              h
            </Text>
          </StyledCard>
        </Pressable>

        {/* Game Mode Card */}
        <StyledCard colors={themeColors} variant={running ? "game" : "default"}>
          <Text style={dynamicStyles.cardTitle}>Game Mode</Text>
          <Text style={{ color: themeColors.text, marginBottom: 12 }}>
            Remaining today: {Math.floor(remainingMs / 3600000)}h{" "}
            {Math.floor((remainingMs % 3600000) / 60000)}m
          </Text>

          {running ? (
            <StyledButton
              title="Mark as Done"
              onPress={stopSession}
              colors={themeColors}
              variant="primary"
              rectangular
            />
          ) : remainingMs > 0 ? (
            <StyledButton
              title="Start"
              onPress={startSession}
              colors={themeColors}
              variant="primary"
              rectangular
            />
          ) : (
            <>
              <Text style={{ color: themeColors.textDim, marginBottom: 8 }}>
                Budget used. You can still override from Game Mode.
              </Text>
              <Pressable onPress={() => openGameMode && openGameMode()}>
                <Text
                  style={{
                    color: themeColors.textDim,
                    textDecorationLine: "underline",
                  }}
                >
                  Open full Game Mode
                </Text>
              </Pressable>
            </>
          )}
        </StyledCard>

        {/* Today's Schedule */}
        <StyledCard colors={themeColors} variant={running ? "game" : "default"}>
          <View style={dynamicStyles.sectionHeaderRow}>
            <Text style={dynamicStyles.cardTitle}>Today's Schedule</Text>
            <Pressable
              onPress={() => {
                setShowTaskInput(true);
                setTimeout(() => inputRef.current?.focus(), 0);
              }}
            >
              <Text style={dynamicStyles.addHeaderLink}>Add</Text>
            </Pressable>
          </View>
          {tasks.length === 0 && (
            <Text style={dynamicStyles.muted}>No tasks today.</Text>
          )}
          {tasks.map((t) => (
            <View key={t.id} style={dynamicStyles.taskRow}>
              <Pressable
                onPress={() => toggleTask(t.id)}
                style={{ flexDirection: "row", flex: 1, alignItems: "center" }}
              >
                <View
                  style={[
                    dynamicStyles.checkbox,
                    t.completed && dynamicStyles.checkboxOn,
                  ]}
                />
                <Text
                  style={[
                    dynamicStyles.taskText,
                    t.completed && dynamicStyles.taskTextDone,
                  ]}
                >
                  {t.text}
                </Text>
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
                onBlur={() => {
                  if (!taskInput.trim()) setShowTaskInput(false);
                }}
              />
            </View>
          )}
        </StyledCard>
      </ScrollView>
    </View>
  );
}

const createStyles = (colors, running) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: "transparent" },
    containerContent: { padding: spacing.lg, paddingBottom: spacing.xl },

    card: {
      backgroundColor: colors.surface,
      borderRadius: radii.lg,
      padding: spacing.lg,
      marginBottom: spacing.lg,
      borderWidth: 1,
      borderColor: colors.border,
      ...(!running ? shadows.card : shadows.cyber),
    },
    cardTitle: {
      ...typography.label,
      color: colors.textDim,
      marginBottom: spacing.sm,
      textAlign: "left",
    },

    timerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    timer: {
      ...typography.title,
      fontSize: 32, // Override for specific timer size
      color: colors.text,
    },

    btn: {
      borderRadius: radii.pill,
      paddingVertical: 10,
      paddingHorizontal: 20,
      backgroundColor: colors.primary,
    },
    btnText: {
      ...typography.body,
      color: colors.surface, // Background of primary is surface (white in light)
      fontWeight: "700",
    },

    // Rectangular buttons for Game Mode card
    cardBtn: {
      backgroundColor: colors.primary,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      borderRadius: radii.md,
      alignItems: "center",
      marginTop: spacing.sm,
    },
    cardBtnPressed: { backgroundColor: colors.primaryDim },
    cardBtnText: {
      ...typography.body,
      color: colors.surface,
      fontWeight: "800",
    },

    // Game Mode CTA
    gameModeBtn: {
      backgroundColor: colors.primary,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      borderRadius: radii.md,
      alignItems: "center",
      marginTop: spacing.sm,
    },
    gameModeBtnText: {
      ...typography.body,
      color: colors.surface,
      fontWeight: "800",
    },

    progressCard: {
      backgroundColor: colors.surface,
      borderRadius: radii.lg,
      padding: spacing.xl,
      marginBottom: spacing.lg,
      borderWidth: 1,
      borderColor: colors.border,
      ...(!running ? shadows.card : shadows.cyber),
    },
    progressHeader: { alignItems: "center", marginBottom: spacing.lg },
    eyebrowRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: spacing.sm,
    },
    eyebrowDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.primary,
      marginRight: spacing.sm,
    },
    progressTime: {
      ...typography.title,
      fontSize: 36,
      color: colors.text,
      marginBottom: 4,
    },
    progressLabel: {
      ...typography.caption,
      color: colors.textDim,
    },
    progressBarContainer: {
      width: "100%",
      height: 8,
      backgroundColor: colors.border,
      borderRadius: 4,
      marginBottom: spacing.sm,
    },
    progressTarget: {
      ...typography.caption,
      color: colors.textDim,
    },

    muted: {
      ...typography.caption,
      color: colors.textDim,
      marginTop: spacing.sm,
      textAlign: "center",
    },

    barRow: {
      flexDirection: "row",
      alignItems: "flex-end",
      justifyContent: "space-between",
      height: 110,
      marginTop: spacing.sm,
    },
    barWrap: { flex: 1, alignItems: "center" },
    bar: { width: 18, borderRadius: 9, backgroundColor: colors.primary },

    taskRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: spacing.sm,
    },
    checkbox: {
      width: 20,
      height: 20,
      borderRadius: 6,
      borderWidth: 2,
      borderColor: colors.border,
      marginRight: spacing.md,
    },
    checkboxOn: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    taskText: {
      ...typography.body,
      color: colors.text,
    },
    taskTextDone: {
      ...typography.body,
      color: colors.textDim,
      textDecorationLine: "line-through",
    },
    taskRemove: {
      ...typography.caption,
      color: colors.danger,
      fontWeight: "800",
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
    },

    sectionHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: spacing.sm,
    },
    addHeaderButton: {
      backgroundColor: colors.primary,
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: radii.md,
    },
    addHeaderButtonText: {
      ...typography.caption,
      color: colors.surface,
      fontWeight: "800",
    },
    addTaskForm: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: spacing.md,
    },
    addTaskInput: {
      flex: 1,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      color: colors.text,
      borderRadius: radii.md,
      paddingHorizontal: spacing.md,
      paddingVertical: 12,
      ...typography.body,
    },
  });
