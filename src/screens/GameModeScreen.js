import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import HeaderBar from "../components/HeaderBar";
import StyledButton from "../components/StyledButton";
import { useApp } from "../store/AppContext";
import {
  getThemeColors,
  typography,
  spacing,
  radii,
  shadows,
} from "../theme/tokens";

const CONFESSION = "I broke";

export default function GameModeScreen({ onClose, onGoToStats }) {
  const {
    running,
    startSession,
    stopSession,
    shouldGatePlay,
    remainingBudgetMs,
    tasks,
    isNowInScheduledSlot,
    themeMode,
    startGamingOnPlan,
    forceStartGamingUnplanned,
  } = useApp();

  const themeColors = useMemo(
    () => getThemeColors(running, themeMode),
    [running, themeMode],
  );
  const styles = useMemo(
    () => createStyles(themeColors, running),
    [themeColors, running],
  );

  const [step, setStep] = useState("main");
  const [reason, setReason] = useState("");
  const [otherReason, setOtherReason] = useState("");
  const [tasksDone, setTasksDone] = useState(null); // true | false | null
  const [sessionHours, setSessionHours] = useState(0.5);
  // Confession ritual (progressive typing gate, like OnboardingRitual)
  const [confessionProgress, setConfessionProgress] = useState(0);
  const [confessionInput, setConfessionInput] = useState("");
  const [showConfMistype, setShowConfMistype] = useState(false);

  const fullyMatchedConfession = confessionProgress === CONFESSION.length;
  const confessionInputRef = React.useRef(null);
  const canProceedReason = !!reason; // must pick a reason option before continuing

  const focusConfessionInput = React.useCallback(() => {
    const node = confessionInputRef.current;
    if (!node) return;
    // Some Android keyboards need a dismiss before refocus
    try {
      Keyboard.dismiss();
    } catch {}
    // Try focus immediately
    try {
      node.focus?.();
    } catch {}
    // Try again on next frame
    if (global?.requestAnimationFrame) {
      requestAnimationFrame(() => {
        try {
          node.focus?.();
        } catch {}
      });
    }
    // And once more in a microtask
    setTimeout(() => {
      try {
        node.focus?.();
      } catch {}
    }, 0);
  }, []);

  function getSessionSummary(h) {
    const active = isNowInScheduledSlot();
    const fmt = { hour: "numeric", minute: "2-digit" };
    if (active) {
      const d = new Date();
      const start = new Date(d);
      start.setHours(
        Math.floor(active.startMin / 60),
        active.startMin % 60,
        0,
        0,
      );
      const end = new Date(d);
      end.setHours(Math.floor(active.endMin / 60), active.endMin % 60, 0, 0);
      const startStr = start.toLocaleTimeString(undefined, fmt);
      const endStr = end.toLocaleTimeString(undefined, fmt);
      return `From ${startStr} to ${endStr} you have scheduled a game time.`;
    }
    const now = new Date();
    const end = new Date(now.getTime() + h * 60 * 60 * 1000);
    const startStr = now.toLocaleTimeString(undefined, fmt);
    const endStr = end.toLocaleTimeString(undefined, fmt);
    return `From ${startStr} to ${endStr} you have scheduled a game time.`;
  }

  function startPlanned() {
    const r = startGamingOnPlan();
    if (r.ok) onClose && onClose();
  }

  function proceedUnplanned() {
    const baseReason =
      reason === "Other" ? otherReason.trim() || "Other" : reason || "Other";
    const finalReason = `${baseReason} (session ${sessionHours}h)`;
    forceStartGamingUnplanned(finalReason);
    onClose && onClose();
  }

  function handleConfessionChange(text) {
    let matchedLength = 0;
    for (let i = 0; i < text.length; i += 1) {
      if (
        i < CONFESSION.length &&
        text[i].toLowerCase() === CONFESSION[i].toLowerCase()
      ) {
        matchedLength += 1;
      } else {
        break;
      }
    }
    setConfessionProgress(matchedLength);

    if (text.length > matchedLength) {
      setShowConfMistype(true);
      setConfessionInput(text.slice(0, matchedLength));
      setTimeout(() => setShowConfMistype(false), 800);
    } else {
      setShowConfMistype(false);
      setConfessionInput(text);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={[styles.wrap, { backgroundColor: "transparent" }]}
    >
      <HeaderBar title="Game Mode" />
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.card}>
            {/* Budget-based session controls */}
            {step === "main" && (
              <>
                <View style={{ alignItems: "center", marginBottom: 20 }}>
                  <Text
                    style={[
                      styles.body,
                      running && { color: themeColors.textDim },
                      { fontSize: 14, marginBottom: 8 },
                    ]}
                  >
                    Remaining today
                  </Text>
                  <Text
                    style={[
                      styles.title,
                      running && { color: themeColors.text },
                      { fontSize: 36, fontWeight: "800" },
                    ]}
                  >
                    {Math.floor(remainingBudgetMs() / 3600000)}h{" "}
                    {Math.floor((remainingBudgetMs() % 3600000) / 60000)}m
                  </Text>
                </View>

                {/* Session hour adjustment */}
                {!running && (
                  <View style={styles.sessionControl}>
                    <Text style={styles.sessionLabel}>Session length:</Text>
                    <View style={styles.sessionAdjust}>
                      <Pressable
                        style={({ pressed }) => [
                          styles.hourBtn,
                          pressed && styles.hourBtnPressed,
                        ]}
                        onPress={() =>
                          setSessionHours(Math.max(0.5, sessionHours - 0.5))
                        }
                      >
                        <Text style={styles.hourBtnTxt}>-</Text>
                      </Pressable>
                      <Text style={styles.sessionVal}>{sessionHours}h</Text>
                      <Pressable
                        style={({ pressed }) => [
                          styles.hourBtn,
                          pressed && styles.hourBtnPressed,
                        ]}
                        onPress={() =>
                          setSessionHours(
                            Math.min(
                              Math.ceil(remainingBudgetMs() / 1800000) / 2,
                              sessionHours + 0.5,
                            ),
                          )
                        }
                      >
                        <Text style={styles.hourBtnTxt}>+</Text>
                      </Pressable>
                    </View>
                  </View>
                )}

                {/* Main Action Trigger */}
                <Pressable
                  style={({ pressed }) => [
                    styles.actionBtn,
                    running && styles.actionStopBtn,
                    pressed && { opacity: 0.9 },
                  ]}
                  onPress={running ? stopSession : startSession}
                >
                  <Text style={styles.actionText}>
                          alignItems: "center",
                          marginTop: 10,
                        }
                      : styles.actionBlack,
                    pressed && { opacity: 0.9 },
                  ]}
                  onPress={() => startSession()}
                >
                  <Text style={styles.actionText}>Start Game</Text>
                </Pressable>
              )}
            </>
          )}

          {step === "ask" && (
            <>
              <Text
                style={[styles.title, running && { color: themeColors.text }]}
              >
                Do you really want to play now?
              </Text>
              <View style={styles.row}>
                {!!onClose && (
                  <Pressable
                    style={({ pressed }) => [
                      styles.btn,
                      styles.no,
                      running && {
                        backgroundColor: themeColors.primary,
                        borderColor: themeColors.primary,
                      },
                      pressed && styles.btnPressed,
                    ]}
                    onPress={onClose}
                  >
                    <Text style={styles.btnTxt}>No</Text>
                  </Pressable>
                )}
                <Pressable
                  style={({ pressed }) => [
                    styles.btn,
                    styles.yesRed,
                    pressed && styles.btnPressed,
                  ]}
                  onPress={() => setStep("reason")}
                >
                  <Text style={styles.btnTxt}>Yes</Text>
                </Pressable>
              </View>
            </>
          )}
          {step === "reason" && (
            <>
              <Text
                style={[styles.title, running && { color: themeColors.text }]}
              >
                Reason for playing
              </Text>
              <View style={styles.options}>
                {["Bored", "Stress", "Avoiding tasks", "Other"].map((opt) => (
                  <Pressable
                    key={opt}
                    style={[styles.opt, reason === opt && styles.optActive]}
                    onPress={() => {
                      setReason(opt);
                      if (opt !== "Other") setOtherReason("");
                    }}
                  >
                    <Text style={styles.optTxt}>{opt}</Text>
                  </Pressable>
                ))}
              </View>
              {reason === "Other" && (
                <TextInput
                  style={styles.otherInput}
                  value={otherReason}
                  onChangeText={setOtherReason}
                  placeholder="what's the reason"
                  placeholderTextColor="#6B7C8E"
                />
              )}
              <Pressable
                disabled={!canProceedReason}
                style={({ pressed }) => [
                  styles.primary,
                  running && { backgroundColor: themeColors.primary },
                  pressed &&
                    (running
                      ? { backgroundColor: themeColors.primaryDim }
                      : styles.primaryPressed),
                  !canProceedReason && { opacity: 0.5 },
                ]}
                onPress={() => setStep("tasks")}
              >
                <Text style={styles.primaryTxt}>Next</Text>
              </Pressable>
            </>
          )}

          {step === "tasks" && (
            <>
              <Text
                style={[styles.title, running && { color: themeColors.text }]}
              >
                Have you completed your to-do list / tasks?
              </Text>
              <View style={styles.row}>
                <Pressable
                  style={({ pressed }) => [
                    styles.btn,
                    styles.no,
                    pressed && styles.btnPressed,
                  ]}
                  onPress={() => {
                    setTasksDone(false);
                    setStep("decide");
                  }}
                >
                  <Text style={styles.btnTxt}>No</Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [
                    styles.btn,
                    styles.no,
                    { marginLeft: 8, marginRight: 0 },
                    pressed && styles.btnPressed,
                  ]}
                  onPress={() => {
                    setTasksDone(true);
                    setStep("decide");
                  }}
                >
                  <Text style={styles.btnTxt}>Yes</Text>
                </Pressable>
              </View>
              <Text style={styles.note}>
                Tasks today:{" "}
                {tasks.filter((t) => !t.completed).length === 0
                  ? "All done"
                  : `${tasks.filter((t) => !t.completed).length} pending`}
              </Text>
            </>
          )}

          {step === "decide" && (
            <>
              <Text
                style={[styles.title, running && { color: themeColors.text }]}
              >
                {tasksDone
                  ? "You are going good, then why to ruin your day by playing in non gaming hours?"
                  : "Then complete your tasks and make your day productive."}
              </Text>
              <View style={styles.row}>
                {!!onClose && (
                  <Pressable
                    style={({ pressed }) => [
                      styles.btn,
                      styles.no,
                      pressed && styles.btnPressed,
                    ]}
                    onPress={onClose}
                  >
                    <Text style={styles.btnTxt}>OK, let&apos;s not play</Text>
                  </Pressable>
                )}
                <Pressable
                  style={({ pressed }) => [
                    styles.btn,
                    styles.yesRed,
                    { marginLeft: 8 },
                    pressed && styles.btnPressed,
                  ]}
                  onPress={() => setStep("confess")}
                >
                  <Text style={styles.btnTxt}>I still wanted to play</Text>
                </Pressable>
              </View>
              <Text
                style={[
                  styles.body,
                  running && { color: themeColors.textDim },
                  { marginTop: 10 },
                ]}
              >
                If you still want to play, you must answer the next question.
              </Text>
            </>
          )}

          {step === "confess" && (
            <>
              <Text
                style={[styles.title, running && { color: themeColors.text }]}
              >
                If you still want to play, type this confession exactly to
                unlock:
              </Text>
              <Pressable
                style={[
                  styles.typeBox,
                  running && {
                    backgroundColor: "transparent",
                    borderColor: themeColors.border,
                  },
                  showConfMistype &&
                    (running
                      ? { borderColor: themeColors.danger }
                      : styles.typeBoxError),
                ]}
                onPressIn={focusConfessionInput}
                onPress={focusConfessionInput}
                onPressOut={focusConfessionInput}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="button"
                accessibilityLabel="Confession input"
              >
                <Text
                  style={[
                    styles.typeLine,
                    running && { color: themeColors.text },
                  ]}
                >
                  <Text
                    style={[
                      styles.matched,
                      running && { color: themeColors.text },
                    ]}
                  >
                    {CONFESSION.slice(0, confessionProgress)}
                  </Text>
                  <Text
                    style={[
                      styles.remaining,
                      running && { color: themeColors.textDim },
                    ]}
                  >
                    {CONFESSION.slice(confessionProgress)}
                  </Text>
                </Text>
              </Pressable>
              <TextInput
                ref={confessionInputRef}
                value={confessionInput}
                onChangeText={handleConfessionChange}
                autoFocus
                autoCapitalize="none"
                autoCorrect={false}
                blurOnSubmit={false}
                showSoftInputOnFocus
                style={[
                  styles.hiddenInput,
                  { width: 1, height: 1, opacity: 0.01 },
                ]}
              />
              {showConfMistype && (
                <Text
                  style={[
                    styles.hint,
                    running && { color: themeColors.danger },
                  ]}
                >
                  Type exactly as shown above.
                </Text>
              )}
              <Pressable
                disabled={!fullyMatchedConfession}
                style={({ pressed }) => [
                  {
                    backgroundColor: "#DC2626",
                    paddingVertical: 12,
                    paddingHorizontal: 18,
                    borderRadius: 8,
                    alignItems: "center",
                    marginTop: 12,
                  },
                  pressed ? { opacity: 0.9 } : {},
                  !fullyMatchedConfession ? { opacity: 0.5 } : {},
                ]}
                onPress={() => {
                  startSession();
                  setStep("main");
                }}
              >
                <Text style={styles.actionText}>I still want to play</Text>
              </Pressable>
              {!!onClose && (
                <Pressable
                  style={({ pressed }) => [
                    styles.actionBlack,
                    running && { backgroundColor: themeColors.primary },
                    pressed && { opacity: 0.9 },
                  ]}
                  onPress={onClose}
                >
                  <Text style={styles.actionText}>Stop</Text>
                </Pressable>
              )}
            </>
          )}
        </View>
      </View>
    </View>
  );
}

const createStyles = (colors, running) =>
  StyleSheet.create({
    wrap: { flex: 1, backgroundColor: "transparent" },
    content: { flex: 1, padding: spacing.lg },
    card: {
      backgroundColor: colors.surface,
      padding: spacing.xl,
      borderRadius: radii.lg,
      borderWidth: 1,
      borderColor: colors.border,
      ...(!running ? shadows.card : shadows.cyber),
    },
    title: {
      ...typography.subtitle,
      color: colors.text,
      marginBottom: spacing.sm,
    },
    body: {
      ...typography.body,
      color: colors.textDim,
      marginTop: 6,
    },
    primary: {
      backgroundColor: colors.primary,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.xl,
      borderRadius: radii.md,
      alignItems: "center",
      marginTop: spacing.xl,
    },
    primaryPressed: { backgroundColor: colors.primaryDim },
    primaryTxt: {
      ...typography.body,
      color: colors.surface,
      fontWeight: "800",
    },
    secondaryTxt: {
      ...typography.caption,
      color: colors.textDim,
      textDecorationLine: "underline",
    },
    row: { flexDirection: "row", marginTop: spacing.md },
    btn: {
      flex: 1,
      paddingVertical: spacing.md,
      borderRadius: radii.md,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    btnPressed: { opacity: 0.9 },
    no: { backgroundColor: colors.primary, marginRight: spacing.sm },
    yesRed: {
      backgroundColor: colors.danger,
      marginLeft: spacing.sm,
      marginRight: 0,
    },
    btnTxt: {
      ...typography.body,
      color: colors.surface,
      fontWeight: "700",
    },
    options: { flexDirection: "row", flexWrap: "wrap", marginTop: spacing.md },
    opt: {
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: radii.pill,
      borderWidth: 1,
      borderColor: colors.border,
      marginRight: spacing.sm,
      marginBottom: spacing.sm,
      backgroundColor: colors.background,
    },
    optActive: { borderColor: colors.primary, backgroundColor: colors.surface },
    optTxt: {
      ...typography.caption,
      color: colors.text,
    },
    otherInput: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      color: colors.text,
      borderRadius: radii.md,
      padding: spacing.md,
      marginTop: spacing.sm,
      ...typography.body,
    },
    note: {
      ...typography.caption,
      color: colors.textDim,
      marginTop: spacing.sm,
    },
    typeBox: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radii.md,
      padding: spacing.md,
      marginTop: spacing.sm,
    },
    typeBoxError: { borderColor: colors.danger },
    typeLine: {
      ...typography.body,
      color: colors.text,
      fontSize: 14,
    },
    matched: { color: colors.primary, fontWeight: "700" },
    remaining: { color: colors.textDim },
    hiddenInput: { position: "absolute", opacity: 0.01, width: 1, height: 1 },
    hint: {
      ...typography.caption,
      color: colors.danger,
      marginTop: spacing.sm,
    },
    actionRed: {
      backgroundColor: colors.danger,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.xl,
      borderRadius: radii.md,
      alignItems: "center",
      marginTop: spacing.md,
    },
    actionBlack: {
      backgroundColor: colors.primary,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.xl,
      borderRadius: radii.md,
      alignItems: "center",
      marginTop: spacing.sm,
    },
    actionText: {
      ...typography.body,
      color: colors.surface,
      fontWeight: "800",
    },
    durationRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginTop: spacing.lg,
      marginBottom: spacing.sm,
    },
    durationValue: {
      ...typography.title,
      marginHorizontal: spacing.xl,
      color: colors.text,
      minWidth: 70,
      textAlign: "center",
    },
    hourBtn: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    hourBtnPressed: { backgroundColor: colors.primaryDim },
    hourBtnTxt: {
      fontSize: 24,
      color: colors.surface,
      fontWeight: "800",
    },
  });
