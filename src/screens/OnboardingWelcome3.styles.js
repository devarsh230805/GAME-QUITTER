import { StyleSheet } from 'react-native';
import { spacing, typography } from '../theme/tokens';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', padding: spacing.xl },
  spacer: { flex: 1 },
  bottomContent: { alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 40 },
  hero: { width: '100%', height: 220, marginBottom: spacing.lg },
  title: { ...typography.title, color: '#111', marginBottom: spacing.sm, textAlign: 'center' },
  body: { ...typography.body, color: '#444', textAlign: 'center', marginBottom: spacing.lg },
  primary: { backgroundColor: '#111', borderRadius: 8, paddingVertical: spacing.md, paddingHorizontal: spacing.xl, alignItems: 'center', marginTop: spacing.md, alignSelf: 'stretch' },
  primaryPressed: { backgroundColor: '#4B5563' },
  primaryText: { ...typography.subtitle, color: '#fff' },
});
