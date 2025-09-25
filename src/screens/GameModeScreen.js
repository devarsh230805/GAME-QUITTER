import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput } from 'react-native';
import { useApp } from '../store/AppContext';

const CONFESSION = 'I broke the rule. The urges won today. My future and motivation are lost. But tomorrow will be a different day.';

export default function GameModeScreen({ onClose }) {
  const { isNowInScheduledSlot, startGamingOnPlan, forceStartGamingUnplanned, tasks } = useApp();
  const inSlot = !!isNowInScheduledSlot();

  const [step, setStep] = useState(inSlot ? 'in-slot' : 'ask');
  const [reason, setReason] = useState('');
  const [tasksDone, setTasksDone] = useState(null); // true | false | null
  const [confession, setConfession] = useState('');

  const canProceedConfession = confession.trim() === CONFESSION;

  function startPlanned() {
    const r = startGamingOnPlan();
    if (r.ok) onClose && onClose();
  }

  function proceedUnplanned() {
    forceStartGamingUnplanned(reason || 'Other');
    onClose && onClose();
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.card}>
        {step === 'in-slot' && (
          <>
            <Text style={styles.title}>Yes! Scheduled gaming. Have fun! ✅</Text>
            <Text style={styles.body}>This session will be logged as on-plan.</Text>
            <Pressable style={styles.primary} onPress={startPlanned}><Text style={styles.primaryTxt}>Start Gaming</Text></Pressable>
            <Pressable style={styles.secondary} onPress={onClose}><Text style={styles.secondaryTxt}>Close</Text></Pressable>
          </>
        )}

        {step === 'ask' && (
          <>
            <Text style={styles.title}>Do you really want to play now?</Text>
            <View style={styles.row}>
              <Pressable style={[styles.btn, styles.no]} onPress={onClose}><Text style={styles.btnTxt}>No</Text></Pressable>
              <Pressable style={[styles.btn, styles.yes]} onPress={() => setStep('reason')}><Text style={styles.btnTxt}>Yes</Text></Pressable>
            </View>
          </>
        )}

        {step === 'reason' && (
          <>
            <Text style={styles.title}>Reason for playing</Text>
            <View style={styles.options}>
              {['Bored', 'Stress', 'Avoiding tasks', 'Other'].map((opt) => (
                <Pressable key={opt} style={[styles.opt, reason === opt && styles.optActive]} onPress={() => setReason(opt)}>
                  <Text style={styles.optTxt}>{opt}</Text>
                </Pressable>
              ))}
            </View>
            <Pressable style={styles.primary} onPress={() => setStep('tasks')}><Text style={styles.primaryTxt}>Next</Text></Pressable>
          </>
        )}

        {step === 'tasks' && (
          <>
            <Text style={styles.title}>Have you completed your to-do list / tasks?</Text>
            <View style={styles.row}>
              <Pressable style={[styles.btn, styles.no]} onPress={() => { setTasksDone(false); setStep('confess'); }}><Text style={styles.btnTxt}>No</Text></Pressable>
              <Pressable style={[styles.btn, styles.yes]} onPress={() => { setTasksDone(true); setStep('confess'); }}><Text style={styles.btnTxt}>Yes</Text></Pressable>
            </View>
            <Text style={styles.note}>Tasks today: {tasks.filter(t => !t.completed).length === 0 ? 'All done' : `${tasks.filter(t => !t.completed).length} pending`}</Text>
          </>
        )}

        {step === 'confess' && (
          <>
            <Text style={styles.title}>{tasksDone ? "You're doing good. Why feel guilty?" : 'Then complete your tasks first!'}</Text>
            <Text style={[styles.body, { marginTop: 8 }]}>If you still want to play, type this confession exactly to unlock:</Text>
            <View style={styles.confBox}><Text style={styles.confText}>{CONFESSION}</Text></View>
            <TextInput style={styles.input} value={confession} onChangeText={setConfession} placeholder="Type confession exactly..." placeholderTextColor="#6B7C8E" multiline />
            <Pressable disabled={!canProceedConfession} style={[styles.primary, !canProceedConfession && { opacity: 0.5 }]} onPress={proceedUnplanned}><Text style={styles.primaryTxt}>I still want to play</Text></Pressable>
            <Pressable style={styles.secondary} onPress={onClose}><Text style={styles.secondaryTxt}>Stop</Text></Pressable>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  card: { width: '90%', backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', padding: 18 },
  title: { color: '#111', fontSize: 18, fontWeight: '800' },
  body: { color: '#444', marginTop: 6 },
  primary: { backgroundColor: '#111', paddingVertical: 12, borderRadius: 999, alignItems: 'center', marginTop: 16 },
  primaryTxt: { color: '#fff', fontWeight: '800' },
  secondary: { alignItems: 'center', marginTop: 10 },
  secondaryTxt: { color: '#111' },
  row: { flexDirection: 'row', marginTop: 14 },
  btn: { flex: 1, paddingVertical: 12, borderRadius: 999, alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB' },
  no: { backgroundColor: '#F3F4F6', marginRight: 8 },
  yes: { backgroundColor: '#111', marginLeft: 8 },
  btnTxt: { color: '#111', fontWeight: '700' },
  options: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 },
  opt: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1, borderColor: '#E5E7EB', marginRight: 8, marginBottom: 8 },
  optActive: { backgroundColor: '#111' },
  optTxt: { color: '#111' },
  note: { color: '#6B7280', marginTop: 10 },
  confBox: { backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 10, marginTop: 10 },
  confText: { color: '#444', fontSize: 12 },
  input: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', color: '#111', borderRadius: 12, padding: 12, marginTop: 10, minHeight: 60 },
});
