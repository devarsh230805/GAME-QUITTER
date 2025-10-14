import { StyleSheet } from 'react-native';
import { spacing, typography } from '../theme/tokens';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', padding: spacing.xl },
  spacer: { height: spacing.sm },
  heroContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  bottomContent: { marginTop: spacing.lg },
  hero: { width: '100%', height: 220 },
  title: { ...typography.title, color: '#111', marginBottom: spacing.sm, textAlign: 'left' },
  body: { ...typography.body, color: '#444', textAlign: 'left', marginBottom: spacing.lg },
  primary: { backgroundColor: '#111', borderRadius: 8, paddingVertical: spacing.md, paddingHorizontal: spacing.xl, alignItems: 'center', marginTop: spacing.md, alignSelf: 'stretch' },
  primaryPressed: { backgroundColor: '#4B5563' },
  primaryText: { ...typography.subtitle, color: '#fff' },
});
