import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useApp } from '../store/AppContext';
import { getThemeColors } from '../theme/tokens';

export default function HeaderBar({ title }) {
  const { running } = useApp();
  const colors = getThemeColors(running);
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const createStyles = (colors) => StyleSheet.create({
  container: {
    height: 56,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingLeft: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  title: { color: colors.text, fontSize: 18, fontWeight: '700' },
});
