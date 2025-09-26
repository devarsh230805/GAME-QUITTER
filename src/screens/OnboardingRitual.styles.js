import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', padding: 24, justifyContent: 'center' },
  title: { color: '#111', fontSize: 22, fontWeight: '800', marginBottom: 12, textAlign: 'center' },
  body: { color: '#444', fontSize: 16, textAlign: 'center', marginBottom: 24 },
  typeBox: { backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingVertical: 16, paddingHorizontal: 18, alignSelf: 'stretch', alignItems: 'center' },
  typeBoxError: { borderColor: '#DC2626' },
  typeLine: { fontSize: 18, fontWeight: '700', letterSpacing: 0.3 },
  matched: { color: '#111' },
  remaining: { color: '#9CA3AF' },
  hiddenInput: { position: 'absolute', width: 1, height: 1, opacity: 0 },
  hint: { color: '#DC2626', fontWeight: '700', marginTop: 8 },
  cta: { backgroundColor: '#111', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 24, alignSelf: 'stretch' },
  ctaDisabled: { opacity: 0.5 },
  ctaText: { color: '#fff', fontWeight: '800' },
});
