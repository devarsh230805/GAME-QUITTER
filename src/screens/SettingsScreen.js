import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { colors, spacing, typography } from '../theme/tokens';
import { useApp } from '../store/AppContext';

export default function SettingsScreen() {
  const { themeMode, setThemeMode } = useApp();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <View style={styles.row}>
        <Text style={styles.body}>Dark Mode</Text>
        <Switch
          value={themeMode === 'dark'}
          onValueChange={(v) => setThemeMode(v ? 'dark' : 'light')}
          thumbColor={themeMode === 'dark' ? colors.primary : '#ccc'}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.xl },
  title: { ...typography.title, color: colors.text, marginBottom: spacing.lg },
  body: { ...typography.body, color: colors.textDim },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
