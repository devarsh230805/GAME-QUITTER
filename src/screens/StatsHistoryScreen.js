import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
} from "react-native";
import HeaderBar from "../components/HeaderBar";
import { useApp } from "../store/AppContext";
import {
  getThemeColors,
  typography,
  spacing,
  radii,
  shadows,
} from "../theme/tokens";

function toTime(ts) {
  try {
    return new Date(ts).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "-";
  }
}

export default function StatsHistoryScreen() {
  const { playLogs, dailyTargetHours, running, themeMode } = useApp();

  const colors = getThemeColors(running, themeMode);
  const styles = useMemo(
    () => createStyles(colors, running),
    [colors, running],
  );

  const currentDayIdx = useMemo(() => {
    const now = new Date();
    const day = now.getDay();
    return day === 0 ? 6 : day - 1; // 0 = Monday, 6 = Sunday
  }, []);

  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState(currentDayIdx); // Default to today's day of the week

  const days = useMemo(() => {
    const arr = [];
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Get distance to the Monday of the current week (0 = Sunday, 1 = Monday, etc.)
    const currentDayOfWeek = today.getDay();
    const distanceToMonday = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;

    // Get the Monday of the target week (with weekOffset applied)
    const mondayOfWeek = new Date(today);
    mondayOfWeek.setDate(today.getDate() - distanceToMonday - weekOffset * 7);

    for (let i = 0; i < 7; i++) {
      const d = new Date(mondayOfWeek);
      d.setDate(mondayOfWeek.getDate() + i);
      const start = d.getTime();
      const end = start + 24 * 3600 * 1000;
      arr.push({
        start,
        end,
        label: d.toLocaleDateString([], { weekday: "narrow" }),
        fullLabel: d.toLocaleDateString([], {
          weekday: "short",
          month: "short",
          day: "numeric",
        }),
      });
    }
    return arr;
  }, [weekOffset]);

  const selectedDayMs = useMemo(() => {
    const current = days[selectedIdx];
    if (!current || !playLogs) return 0;
    return playLogs.reduce((acc, log) => {
      const overlap = Math.max(
        0,
        Math.min(log.end || Date.now(), current.end) -
          Math.max(log.start, current.start),
      );
      return acc + overlap;
    }, 0);
  }, [days, selectedIdx, playLogs]);

  const h = Math.floor(selectedDayMs / 3600000);
  const m = Math.floor((selectedDayMs % 3600000) / 60000);

  return (
    <View style={styles.container}>
      <HeaderBar title="Activity" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Weekly Comparison Card */}
        <View style={[styles.card, shadows.card]}>
          <View style={styles.cardHeader}>
            <Pressable
              onPress={() => setWeekOffset((w) => w + 1)}
              style={styles.navBtn}
            >
              <Text style={styles.navText}>Prev</Text>
            </Pressable>
            <Text style={styles.weekLabel}>
              {weekOffset === 0 ? "This Week" : `${weekOffset}w Ago`}
            </Text>
            <Pressable
              onPress={() => setWeekOffset((w) => Math.max(0, w - 1))}
              style={[styles.navBtn, weekOffset === 0 && { opacity: 0.3 }]}
              disabled={weekOffset === 0}
            >
              <Text style={styles.navText}>Next</Text>
            </Pressable>
          </View>

          <View style={styles.chartArea}>
            {days.map((day, idx) => {
              const dayMs = playLogs
                ? playLogs.reduce((acc, log) => {
                    const overlap = Math.max(
                      0,
                      Math.min(log.end || Date.now(), day.end) -
                        Math.max(log.start, day.start),
                    );
                    return acc + overlap;
                  }, 0)
                : 0;
              const maxPossible = (dailyTargetHours || 1) * 3600000;
              const ratio = Math.min(1, dayMs / maxPossible);
              const isSelected = idx === selectedIdx;

              return (
                <Pressable
                  key={idx}
                  style={styles.barColumn}
                  onPress={() => setSelectedIdx(idx)}
                >
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        { height: `${Math.max(5, ratio * 100)}%` },
                        isSelected
                          ? { backgroundColor: colors.primary }
                          : { backgroundColor: colors.border },
                      ]}
                    />
                  </View>
                  <Text
                    style={[
                      styles.barLabel,
                      isSelected && {
                        color: colors.primary,
                        fontWeight: "700",
                      },
                    ]}
                  >
                    {day.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Selected Day Details */}
        <View style={[styles.detailsCard, shadows.card]}>
          <Text style={styles.dayTitle}>{days[selectedIdx]?.fullLabel}</Text>

          <View style={styles.statBox}>
            <Text style={styles.statValue}>
              {h}h {m}m
            </Text>
            <Text style={styles.statLabel}>Total Play Time</Text>
          </View>

          <View style={styles.divider} />

          <Text style={styles.listTitle}>Session History</Text>
          {playLogs &&
          playLogs.filter(
            (l) =>
              l.start >= days[selectedIdx].start &&
              l.start < days[selectedIdx].end,
          ).length > 0 ? (
            playLogs
              .filter(
                (l) =>
                  l.start >= days[selectedIdx].start &&
                  l.start < days[selectedIdx].end,
              )
              .map((log, i) => (
                <View key={i} style={styles.logRow}>
                  <View>
                    <Text style={styles.logTime}>
                      {toTime(log.start)} - {log.end ? toTime(log.end) : "Now"}
                    </Text>
                  </View>
                  <Text style={styles.logDuration}>
                    {Math.round(((log.end || Date.now()) - log.start) / 60000)}{" "}
                    min
                  </Text>
                </View>
              ))
          ) : (
            <Text style={styles.emptyText}>
              No activity recorded for this day.
            </Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const createStyles = (colors, running) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: "transparent" },
    scrollContent: { padding: spacing.lg },
    card: {
      backgroundColor: colors.surface,
      padding: spacing.lg,
      borderRadius: radii.lg,
      marginBottom: spacing.lg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: spacing.xl,
    },
    navBtn: {
      padding: spacing.xs,
    },
    navText: {
      ...typography.caption,
      color: colors.primary,
      fontWeight: "700",
    },
    weekLabel: {
      ...typography.label,
      color: colors.text,
    },
    chartArea: {
      flexDirection: "row",
      height: 160,
      alignItems: "flex-end",
      justifyContent: "space-between",
      paddingHorizontal: spacing.sm,
    },
    barColumn: {
      flex: 1,
      alignItems: "center",
    },
    barTrack: {
      width: 14,
      height: 120,
      backgroundColor: colors.background,
      borderRadius: 7,
      justifyContent: "flex-end",
      overflow: "hidden",
    },
    barFill: {
      width: "100%",
      borderRadius: 7,
    },
    barLabel: {
      ...typography.caption,
      fontSize: 10,
      color: colors.textDim,
      marginTop: spacing.sm,
    },
    detailsCard: {
      backgroundColor: colors.surface,
      padding: spacing.xl,
      borderRadius: radii.lg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    dayTitle: {
      ...typography.subtitle,
      color: colors.text,
      marginBottom: spacing.lg,
      textAlign: "center",
    },
    statBox: {
      alignItems: "center",
      marginBottom: spacing.xl,
    },
    statValue: {
      ...typography.title,
      fontSize: 44,
      color: colors.text,
    },
    statLabel: {
      ...typography.caption,
      color: colors.textDim,
      marginTop: spacing.xs,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginBottom: spacing.xl,
    },
    listTitle: {
      ...typography.label,
      color: colors.textDim,
      marginBottom: spacing.md,
    },
    logRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    logTime: {
      ...typography.body,
      color: colors.text,
    },
    logDuration: {
      ...typography.body,
      color: colors.textDim,
      fontWeight: "700",
    },
    emptyText: {
      ...typography.caption,
      color: colors.textDim,
      fontStyle: "italic",
      textAlign: "center",
      marginTop: spacing.lg,
    },
  });
