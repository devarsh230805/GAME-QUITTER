import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useApp } from '../store/AppContext';
import { getThemeColors } from '../theme/tokens';

export default function HeaderBar({ title }) {
  const { running } = useApp();
  const colors = getThemeColors(running);
  const styles = useMemo(() => createStyles(colors, running), [colors, running]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const createStyles = (colors, running) => StyleSheet.create({
  container: {
    height: 56,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingLeft: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    shadowColor: 'transparent',
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
  },
  title: { color: colors.text, fontSize: 18, fontWeight: '700' },
});
