import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../theme/tokens';

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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0F18', alignItems: 'center', justifyContent: 'center' },
  ring: { width: 220, height: 220, borderRadius: 110, borderWidth: 10, borderColor: '#13314A', alignItems: 'center', justifyContent: 'center', borderRightColor: colors.primary, borderBottomColor: colors.primary },
  percent: { ...typography.title, color: '#E6FFF6', fontSize: 40 },
  title: { ...typography.title, color: '#E6FFF6', marginTop: spacing.xl },
  sub: { ...typography.body, color: '#9FB0C0' },
});
