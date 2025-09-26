import React, { useState } from 'react';
import { View, Text, Pressable, TextInput } from 'react-native';
import { styles } from './OnboardingRitual.styles';

const headline = 'Before playing any game, I will always open the Game Mode in this app.';
const phrase = 'I commit';

/**
 * OnboardingRitual
 * Typing-gate for phrase "I commit" with tolerant case-insensitive matching.
 * Styles moved to OnboardingRitual.styles.js (no visual changes).
 */
export default function OnboardingRitual({ onCommitted }) {
  const [progress, setProgress] = useState(0); // number of correct leading chars
  const [input, setInput] = useState(''); // transient buffer to capture keystrokes
  const [showMistype, setShowMistype] = useState(false);
  const inputRef = React.useRef(null);

  const fullyMatched = progress === phrase.length;

  function handleChange(text) {
    if (!text) return setInput('');
    const ch = text[text.length - 1];
    if (progress < phrase.length && ch.toLowerCase() === phrase[progress].toLowerCase()) {
      setProgress(progress + 1);
    } else {
      setShowMistype(true);
      setTimeout(() => setShowMistype(false), 500);
    }
    // clear buffer so user never needs to backspace
    setInput('');
  }

  return (
    <View style={styles.container}>
      <View style={{ alignItems: 'center' }}>
        <Text style={styles.title}>Ritual Commitment</Text>
        <Text style={styles.body}>{headline}</Text>

        <Pressable
          style={[styles.typeBox, showMistype && styles.typeBoxError]}
          onPress={() => inputRef.current && inputRef.current.focus()}
        >
          <Text style={styles.typeLine}>
            <Text style={styles.matched}>{phrase.slice(0, progress)}</Text>
            <Text style={styles.remaining}>{phrase.slice(progress)}</Text>
          </Text>
        </Pressable>

        <TextInput
          ref={inputRef}
          value={input}
          onChangeText={handleChange}
          autoFocus
          autoCapitalize="none"
          autoCorrect={false}
          blurOnSubmit={false}
          style={styles.hiddenInput}
        />

        {showMistype && (
          <Text style={styles.hint}>Type exactly as shown above.</Text>
        )}

        <Pressable disabled={!fullyMatched} style={[styles.cta, !fullyMatched && styles.ctaDisabled]} onPress={onCommitted}>
          <Text style={styles.ctaText}>{fullyMatched ? 'Continue' : 'Type "I commit" to continue'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

// styles imported from './OnboardingRitual.styles'
