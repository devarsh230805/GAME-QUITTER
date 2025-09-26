import React, { useMemo, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { styles } from './OnboardingQuizAdvanced.styles';

const QUESTIONS = [
  {
    id: 'hours',
    title: 'Question 1',
    prompt: 'How many hours do you typically game per day?',
    options: ['< 2 hour', '2-4 hours', '4-8 hours', '8+ hours'],
  },
  {
    id: 'games',
    title: 'Question 2',
    prompt: 'Which games do you play most?',
    options: ['MOBA', 'Shooter', 'RPG', 'Sports'],
  },
  {
    id: 'peakHours',
    title: 'Question 3',
    prompt: 'When are your peak gaming hours?',
    options: ['Morning', 'Afternoon', 'Evening', 'Night'],
  },
  {
    id: 'platform',
    title: 'Question 4',
    prompt: 'At which platforms you play games?',
    options: ['PC', 'Mobile', 'Console', 'Other'],
  },
];

/**
 * OnboardingQuizAdvanced
 * Multi-step quiz showing a single question per screen.
 * Styles extracted to OnboardingQuizAdvanced.styles.js (no UI changes).
 */
export default function OnboardingQuizAdvanced({ onComplete, onSkip }) {
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState({});
  const progress = useMemo(() => (i + 1) / QUESTIONS.length, [i]);

  const q = QUESTIONS[i];

  function choose(idx) {
    const nextAnswers = { ...answers, [q.id]: idx };
    setAnswers(nextAnswers);
    if (i < QUESTIONS.length - 1) setI(i + 1);
    else onComplete(nextAnswers);
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
        <Pressable
          key={idx}
          onPress={() => choose(idx)}
          style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}
        >
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

// styles imported from './OnboardingQuizAdvanced.styles'
