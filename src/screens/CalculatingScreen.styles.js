import { StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../theme/tokens';

// Styles for CalculatingScreen. Keep visual parity with previous inline styles.
export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0F18',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 10,
    borderColor: '#13314A',
    alignItems: 'center',
    justifyContent: 'center',
    borderRightColor: colors.primary,
    borderBottomColor: colors.primary,
  },
  percent: { ...typography.title, color: '#E6FFF6', fontSize: 40 },
  title: { ...typography.title, color: '#E6FFF6', marginTop: spacing.xl },
  sub: { ...typography.body, color: '#9FB0C0' },
});
