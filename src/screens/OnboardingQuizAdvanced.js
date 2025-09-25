import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors, spacing, typography, radii } from '../theme/tokens';

const QUESTIONS = [
  {
    id: 'hours',
    title: 'Question #1',
    prompt: 'How many hours do you typically game per day?',
    options: ['< 1 hour', '1-2 hours', '2-4 hours', '4+ hours'],
  },
  {
    id: 'frequency',
    title: 'Question #2',
    prompt: 'How often do you feel the urge to game?',
    options: ['Rarely', 'Once a day', 'A few times/week', 'Multiple times/day'],
  },
  {
    id: 'triggers',
    title: 'Question #3',
    prompt: 'Which triggers apply most?',
    options: ['Boredom', 'Stress', 'Social pressure', 'Escape/avoidance'],
  },
  {
    id: 'sleep',
    title: 'Question #4',
    prompt: 'Does gaming affect your sleep?',
    options: ['No', 'Sometimes', 'Often', 'Severely'],
  },
];

export default function OnboardingQuizAdvanced({ onComplete, onSkip }) {
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState({});
  const progress = useMemo(() => (i + 1) / QUESTIONS.length, [i]);

  const q = QUESTIONS[i];

  function choose(idx) {
    setAnswers((prev) => ({ ...prev, [q.id]: idx }));
    if (i < QUESTIONS.length - 1) setI(i + 1);
    else onComplete(answers);
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => (i > 0 ? setI(i - 1) : onSkip && onSkip())}>
          <Text style={styles.navTxt}>{i > 0 ? 'Back' : 'Close'}</Text>
        </Pressable>
        <View style={styles.progressWrap}>
          <View style={[styles.progressBar, { width: `${Math.round(progress * 100)}%` }]} />
        </View>
        <Text style={styles.lang}>EN</Text>
      </View>

      <Text style={styles.qTitle}>{q.title}</Text>
      <Text style={styles.prompt}>{q.prompt}</Text>

      {q.options.map((opt, idx) => (
        <Pressable key={idx} onPress={() => choose(idx)} style={({ pressed }) => [styles.option, pressed && { opacity: 0.9 }]}>
          <View style={styles.badge}><Text style={styles.badgeTxt}>{idx + 1}</Text></View>
          <Text style={styles.optionTxt}>{opt}</Text>
        </Pressable>
      ))}

      <Pressable onPress={onSkip} style={styles.skipArea}>
        <Text style={styles.skipTxt}>Skip test</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0F18', padding: spacing.xl },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg },
  navTxt: { ...typography.body, color: colors.text },
  progressWrap: { flex: 1, height: 6, backgroundColor: '#1C2735', borderRadius: 4, marginHorizontal: spacing.md, overflow: 'hidden' },
  progressBar: { height: 6, backgroundColor: colors.primary },
  lang: { ...typography.body, color: colors.textDim },
  qTitle: { ...typography.subtitle, color: colors.text, marginBottom: spacing.sm },
  prompt: { ...typography.title, color: colors.text, marginBottom: spacing.lg },
  option: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0E1420', borderWidth: 1, borderColor: '#1E2A3A', padding: spacing.lg, borderRadius: radii.lg, marginBottom: spacing.md },
  badge: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#172130', alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  badgeTxt: { ...typography.body, color: colors.text },
  optionTxt: { ...typography.body, color: colors.text },
  skipArea: { alignItems: 'center', marginTop: spacing.lg },
  skipTxt: { ...typography.body, color: colors.textDim },
});
