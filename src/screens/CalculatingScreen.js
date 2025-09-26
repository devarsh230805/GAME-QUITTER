import React, { useEffect, useRef, useState } from 'react';
import { View, Text } from 'react-native';
import { styles } from './CalculatingScreen.styles';

/**
 * CalculatingScreen
 * Shows a circular ring and percentage that ticks up to 100%, then calls onDone.
 * UI/behavior preserved exactly; styles extracted to CalculatingScreen.styles.js
 */

export default function CalculatingScreen({ onDone }) {
  const [pct, setPct] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setPct((p) => {
        const n = Math.min(100, p + 4);
        if (n >= 100) {
          clearInterval(timerRef.current);
          setTimeout(() => onDone && onDone(), 500);
        }
        return n;
      });
    }, 60);
    return () => timerRef.current && clearInterval(timerRef.current);
  }, [onDone]);

  return (
    <View style={styles.container}>
      <View style={styles.ring}>
        <Text style={styles.percent}>{pct}%</Text>
      </View>
      <Text style={styles.title}>Calculating</Text>
      <Text style={styles.sub}>Processing data...</Text>
    </View>
  );
}
