import React, { useMemo } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import HeaderBar from "../components/HeaderBar";
import { useApp } from "../store/AppContext";
import {
  getThemeColors,
  typography,
  spacing,
  radii,
  shadows,
} from "../theme/tokens";

function minToStr(m) {
  const h = Math.floor(m / 60);
  const mm = String(m % 60).padStart(2, "0");
  const hh = String(h).padStart(2, "0");
  return `${hh}:${mm}`;
}

export default function RetroLogScreen({ onClose }) {
  const { schedule, retroMarkSlotAsDone, running } = useApp();
  const themeColors = getThemeColors(running);
  const styles = useMemo(
    () => createStyles(themeColors, running),
    [themeColors, running],
  );

  const unmarked = schedule.filter((s) => s.status === "planned");

  return (
    <View style={styles.wrap}>
      <HeaderBar title="Retro Log" />
      <View style={styles.content}>
        <View style={[styles.card, shadows.card]}>
          <Text style={styles.title}>Review Progress</Text>
          <Text style={styles.subtitle}>
            Confirm any planned slots you've completed.
          </Text>

          <ScrollView
            style={styles.scrollBlock}
            showsVerticalScrollIndicator={false}
          >
            {unmarked.length === 0 ? (
              <View style={styles.emptyWrap}>
                <Text style={styles.empty}>
                  All caught up! No unmarked slots found.
                </Text>
              </View>
            ) : (
              unmarked.map((s) => (
                <View key={s.id} style={styles.row}>
                  <View>
                    <Text style={styles.slot}>
                      {minToStr(s.startMin)} - {minToStr(s.endMin)}
                    </Text>
                    <Text style={styles.badge}>Status: Planned</Text>
                  </View>
                  <Pressable
                    style={({ pressed }) => [
                      styles.primary,
                      pressed && { opacity: 0.8 },
                    ]}
                    onPress={() => retroMarkSlotAsDone(s.id)}
                  >
                    <Text style={styles.primaryTxt}>Confirm</Text>
                  </Pressable>
                </View>
              ))
            )}
          </ScrollView>

          {!!onClose && (
            <Pressable style={styles.secondary} onPress={onClose}>
              <Text style={styles.secondaryTxt}>Dismiss</Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

const createStyles = (colors, running) =>
  StyleSheet.create({
    wrap: { flex: 1, backgroundColor: colors.background },
    content: { flex: 1, padding: spacing.lg },
    card: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: radii.lg,
      padding: spacing.lg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    title: { ...typography.subtitle, color: colors.text, fontWeight: "700" },
    subtitle: {
      ...typography.caption,
      color: colors.textDim,
      marginTop: spacing.xs,
      marginBottom: spacing.xl,
    },
    scrollBlock: { flex: 1 },
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    slot: { ...typography.label, color: colors.text, fontWeight: "700" },
    badge: {
      ...typography.caption,
      color: colors.textDim,
      marginTop: 2,
      fontSize: 10,
    },
    primary: {
      backgroundColor: colors.primary,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.lg,
      borderRadius: radii.pill,
    },
    primaryTxt: {
      ...typography.caption,
      color: colors.surface,
      fontWeight: "700",
    },
    emptyWrap: { paddingVertical: spacing.xxl, alignItems: "center" },
    empty: {
      ...typography.body,
      color: colors.textDim,
      textAlign: "center",
      fontStyle: "italic",
    },
    secondary: {
      alignItems: "center",
      marginTop: spacing.lg,
      paddingVertical: spacing.sm,
    },
    secondaryTxt: {
      ...typography.label,
      color: colors.primary,
      fontWeight: "700",
    },
  });
