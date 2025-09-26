import { StyleSheet } from 'react-native';
import { colors, spacing, typography, radii } from '../theme/tokens';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', padding: spacing.xl },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg },
  navTxt: { ...typography.body, color: '#111' },
  progressWrap: { flex: 1, height: 6, backgroundColor: '#F3F4F6', borderRadius: 4, marginHorizontal: spacing.md, overflow: 'hidden' },
  progressBar: { height: 6, backgroundColor: '#111' },
  lang: { ...typography.body, color: '#6B7280' },
  qTitle: { ...typography.subtitle, color: '#111', marginBottom: spacing.sm },
  prompt: { ...typography.title, color: '#111', marginBottom: spacing.lg, textAlign: 'left' },
  option: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', padding: spacing.lg, borderRadius: radii.lg, marginBottom: spacing.md, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 1 },
  optionPressed: { backgroundColor: '#F3F4F6' },
  badge: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center', marginRight: spacing.md, borderWidth: 1, borderColor: '#E5E7EB' },
  badgeTxt: { ...typography.body, color: '#111' },
  optionTxt: { ...typography.body, color: '#111' },
  skipArea: { alignItems: 'center', marginTop: spacing.lg },
  skipTxt: { ...typography.body, color: '#6B7280' },
});
