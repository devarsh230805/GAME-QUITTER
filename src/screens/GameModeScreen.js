import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, Keyboard } from 'react-native';
import HeaderBar from '../components/HeaderBar';
import { useApp } from '../store/AppContext';
import { getThemeColors } from '../theme/tokens';

const CONFESSION = 'I broke';

export default function GameModeScreen({ onClose, onGoToStats }) {
  const { running, startSession, stopSession, shouldGatePlay, remainingBudgetMs, tasks } = useApp();

  const themeColors = useMemo(() => getThemeColors(running), [running]);

  const [step, setStep] = useState('main');
  const [reason, setReason] = useState('');
  const [otherReason, setOtherReason] = useState('');
  const [tasksDone, setTasksDone] = useState(null); // true | false | null
  const [sessionHours, setSessionHours] = useState(0.5);
  // Confession ritual (progressive typing gate, like OnboardingRitual)
  const [confessionProgress, setConfessionProgress] = useState(0);
  const [confessionInput, setConfessionInput] = useState('');
  const [showConfMistype, setShowConfMistype] = useState(false);

  const fullyMatchedConfession = confessionProgress === CONFESSION.length;
  const confessionInputRef = React.useRef(null);
  const canProceedReason = !!reason; // must pick a reason option before continuing

  const focusConfessionInput = React.useCallback(() => {
    const node = confessionInputRef.current;
    if (!node) return;
    // Some Android keyboards need a dismiss before refocus
    try { Keyboard.dismiss(); } catch {}
    // Try focus immediately
    try { node.focus?.(); } catch {}
    // Try again on next frame
    if (global?.requestAnimationFrame) {
      requestAnimationFrame(() => { try { node.focus?.(); } catch {} });
    }
    // And once more in a microtask
    setTimeout(() => { try { node.focus?.(); } catch {} }, 0);
  }, []);

  function getSessionSummary(h) {
    const active = isNowInScheduledSlot();
    const fmt = { hour: 'numeric', minute: '2-digit' };
    if (active) {
      const d = new Date();
      const start = new Date(d);
      start.setHours(Math.floor(active.startMin / 60), active.startMin % 60, 0, 0);
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
    const baseReason = reason === 'Other' ? (otherReason.trim() || 'Other') : (reason || 'Other');
    const finalReason = `${baseReason} (session ${sessionHours}h)`;
    forceStartGamingUnplanned(finalReason);
    onClose && onClose();
  }

  function handleConfessionChange(text) {
    if (!text) return setConfessionInput('');
    const ch = text[text.length - 1];
    if (
      confessionProgress < CONFESSION.length &&
      ch.toLowerCase() === CONFESSION[confessionProgress].toLowerCase()
    ) {
      setConfessionProgress(confessionProgress + 1);
    } else {
      setShowConfMistype(true);
      setTimeout(() => setShowConfMistype(false), 500);
    }
    setConfessionInput('');
  }

  return (
    <View style={[styles.wrap, running && { backgroundColor: themeColors.background }]}>
      <HeaderBar title="Game Mode" />
      <View style={styles.content}>
        <View style={styles.card}>
        {/* Budget-based session controls */}
        {step === 'main' && (
          <>
            <Text style={[styles.title, running && { color: themeColors.text }]}>Game Mode</Text>
            <Text style={[styles.body, running && { color: themeColors.textDim }, { marginBottom: 16 }]}>
              Remaining today: {Math.floor(remainingBudgetMs() / 3600000)}h {Math.floor((remainingBudgetMs() % 3600000) / 60000)}m
            </Text>
            
            {running ? (
              <Pressable
                style={({ pressed }) => [
                  { backgroundColor: themeColors.primary, paddingVertical: 12, paddingHorizontal: 18, borderRadius: 8, alignItems: 'center', marginTop: 10 },
                  pressed && { opacity: 0.9 }
                ]}
                onPress={() => {
                  stopSession();
                  onGoToStats && onGoToStats();
                }}
              >
                <Text style={styles.actionText}>Stop & Mark as Done</Text>
              </Pressable>
            ) : (
              shouldGatePlay() ? (
                <Pressable
                  style={({ pressed }) => [styles.actionRed, pressed && { opacity: 0.9 }]}
                  onPress={() => setStep('ask')}
                >
                  <Text style={styles.actionText}>Budget Exhausted - Tap to Override</Text>
                </Pressable>
              ) : (
                <Pressable
                  style={({ pressed }) => [
                    running
                      ? { backgroundColor: themeColors.primary, paddingVertical: 12, paddingHorizontal: 18, borderRadius: 8, alignItems: 'center', marginTop: 10 }
                      : styles.actionBlack,
                    pressed && { opacity: 0.9 },
                  ]}
                  onPress={() => startSession()}
                >
                  <Text style={styles.actionText}>Start Game</Text>
                </Pressable>
              )
            )}
          </>
        )}

        {step === 'ask' && (
          <>
            <Text style={[styles.title, running && { color: themeColors.text }]}>Do you really want to play now?</Text>
            <View style={styles.row}>
              {!!onClose && (
                <Pressable
                  style={({ pressed }) => [
                    styles.btn,
                    styles.no,
                    running && { backgroundColor: themeColors.primary, borderColor: themeColors.primary },
                    pressed && styles.btnPressed,
                  ]}
                  onPress={onClose}
                >
                  <Text style={styles.btnTxt}>No</Text>
                </Pressable>
              )}
              <Pressable style={({ pressed }) => [styles.btn, styles.yes, pressed && styles.btnPressed]} onPress={() => setStep('reason')}><Text style={styles.btnTxt}>Yes</Text></Pressable>
            </View>
          </>
        )}
        {step === 'reason' && (
          <>
            <Text style={[styles.title, running && { color: themeColors.text }]}>Reason for playing</Text>
            <View style={styles.options}>
              {['Bored', 'Stress', 'Avoiding tasks', 'Other'].map((opt) => (
                <Pressable
                  key={opt}
                  style={[styles.opt, reason === opt && styles.optActive]}
                  onPress={() => {
                    setReason(opt);
                    if (opt !== 'Other') setOtherReason('');
                  }}
                >
                  <Text style={styles.optTxt}>{opt}</Text>
                </Pressable>
              ))}
            </View>
            {reason === 'Other' && (
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
                pressed && styles.primaryPressed,
                !canProceedReason && { opacity: 0.5 },
              ]}
              onPress={() => setStep('tasks')}
            >
              <Text style={styles.primaryTxt}>Next</Text>
            </Pressable>
          </>
        )}

        {step === 'tasks' && (
          <>
            <Text style={[styles.title, running && { color: themeColors.text }]}>Have you completed your to-do list / tasks?</Text>
            <View style={styles.row}>
              <Pressable style={({ pressed }) => [styles.btn, styles.no, pressed && styles.btnPressed]} onPress={() => { setTasksDone(false); setStep('decide'); }}><Text style={styles.btnTxt}>No</Text></Pressable>
              <Pressable style={({ pressed }) => [styles.btn, styles.no, { marginLeft: 8, marginRight: 0 }, pressed && styles.btnPressed]} onPress={() => { setTasksDone(true); setStep('decide'); }}><Text style={styles.btnTxt}>Yes</Text></Pressable>
            </View>
            <Text style={styles.note}>Tasks today: {tasks.filter(t => !t.completed).length === 0 ? 'All done' : `${tasks.filter(t => !t.completed).length} pending`}</Text>
          </>
        )}

        {step === 'decide' && (
          <>
            <Text style={[styles.title, running && { color: themeColors.text }]}>
              {tasksDone
                ? 'You are going good, then why to ruin your day by playing in non gaming hours?'
                : 'Then complete your tasks and make your day productive.'}
            </Text>
            <View style={styles.row}>
              {!!onClose && (
                <Pressable style={({ pressed }) => [styles.btn, styles.no, pressed && styles.btnPressed]} onPress={onClose}>
                  <Text style={styles.btnTxt}>OK, let&apos;s not play</Text>
                </Pressable>
              )}
              <Pressable style={({ pressed }) => [styles.btn, styles.yes, { marginLeft: 8 }, pressed && styles.btnPressed]} onPress={() => setStep('confess')}>
                <Text style={styles.btnTxt}>I still wanted to play</Text>
              </Pressable>
            </View>
            <Text style={[styles.body, running && { color: themeColors.textDim }, { marginTop: 10 }]}>If you still want to play, you must answer the next question.</Text>
          </>
        )}

        {step === 'confess' && (
          <>
            <Text style={[styles.title, running && { color: themeColors.text }]}>If you still want to play, type this confession exactly to unlock:</Text>
            <Pressable
              style={[styles.typeBox, showConfMistype && styles.typeBoxError]}
              onPressIn={focusConfessionInput}
              onPress={focusConfessionInput}
              onPressOut={focusConfessionInput}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityRole="button"
              accessibilityLabel="Confession input"
            >
              <Text style={styles.typeLine}>
                <Text style={styles.matched}>{CONFESSION.slice(0, confessionProgress)}</Text>
                <Text style={styles.remaining}>{CONFESSION.slice(confessionProgress)}</Text>
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
              style={[styles.hiddenInput, { width: 1, height: 1, opacity: 0.01 }]}
            />
            {showConfMistype && (
              <Text style={styles.hint}>Type exactly as shown above.</Text>
            )}
            <Pressable
              disabled={!fullyMatchedConfession}
              style={({ pressed }) => [
                styles.actionRed,
                pressed ? { opacity: 0.9 } : {},
                !fullyMatchedConfession ? { opacity: 0.5 } : {},
              ]}
              onPress={() => {
                startSession();
                setStep('main');
              }}
            >
              <Text style={styles.actionText}>I still want to play</Text>
            </Pressable>
            {!!onClose && (
              <Pressable style={({ pressed }) => [styles.actionBlack, pressed && { opacity: 0.9 }]} onPress={onClose}>
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

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { flex: 1, padding: 20 },
  card: {
    flex: 1,
    backgroundColor: 'transparent',
    borderRadius: 0,
    padding: 0,
    shadowColor: 'transparent',
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
  },
  title: { color: '#111', fontSize: 18, fontWeight: '800', marginBottom: 8 },
  body: { color: '#666', marginTop: 6 },
  primary: { backgroundColor: '#111', paddingVertical: 12, paddingHorizontal: 18, borderRadius: 8, alignItems: 'center', marginTop: 16 },
  primaryPressed: { backgroundColor: '#666' },
  primaryTxt: { color: '#fff', fontWeight: '800' },
  secondaryTxt: { color: '#111' },
  row: { flexDirection: 'row', marginTop: 14 },
  btn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#fff' },
  btnPressed: { opacity: 0.9 },
  no: { backgroundColor: '#111', marginRight: 8 },
  btnTxt: { color: '#fff', fontWeight: '700' },
  options: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 },
  opt: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB', marginRight: 8, marginBottom: 8, backgroundColor: '#FFF' },
  optActive: { borderColor: '#111' },
  optTxt: { color: '#111' },
  otherInput: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', color: '#111', borderRadius: 12, padding: 12, marginTop: 10 },
  note: { color: '#6B7280', marginTop: 10 },
  // Ritual typing UI (mirrors OnboardingRitual styles)
  typeBox: { backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 12, marginTop: 10 },
  typeBoxError: { borderColor: '#DC2626' },
  typeLine: { color: '#111', fontSize: 14 },
  matched: { color: '#111', fontWeight: '700' },
  remaining: { color: '#6B7280' },
  hiddenInput: { position: 'absolute', opacity: 0.01, width: 1, height: 1 },
  hint: { color: '#DC2626', marginTop: 8 },
  // Final action buttons
  actionRed: { backgroundColor: '#DC2626', paddingVertical: 12, paddingHorizontal: 18, borderRadius: 8, alignItems: 'center', marginTop: 12 },
  actionBlack: { backgroundColor: '#111', paddingVertical: 12, paddingHorizontal: 18, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  actionText: { color: '#fff', fontWeight: '800' },
  // Duration controls
  durationRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 10, marginBottom: 6 },
  durationValue: { marginHorizontal: 16, fontSize: 18, fontWeight: '800', color: '#111', minWidth: 70, textAlign: 'center' },
  hourBtn: { width: 44, height: 44, borderRadius: 8, backgroundColor: '#111', alignItems: 'center', justifyContent: 'center' },
  hourBtnPressed: { backgroundColor: '#4B5563' },
  hourBtnTxt: { color: '#fff', fontSize: 20, fontWeight: '800', lineHeight: 20 },
});
