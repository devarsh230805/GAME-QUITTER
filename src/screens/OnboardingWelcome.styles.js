import { StyleSheet } from 'react-native';
import { spacing, typography } from '../theme/tokens';

export const styles = StyleSheet.create({
  appIcon: {
    borderRadius: 12,
    marginRight: spacing.sm,
    width: 24,    
  },

  appName: {
    ...typography.subtitle,
    color: '#111',
    fontWeight: '600',
    fontSize: 20,
  },

  
  container: {
    flex: 1,
      justifyContent: 'space-between',
  backgroundColor: '#FFFFFF',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
  },

  // Header (app icon + name)
   
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  
 
  // Hero Section
  heroContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  hero: {
    width: '100%',
    height: 350, // responsive hero size
    borderRadius: 16,
  },

  // Bottom Content
  bottomContent: {
    
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.title,
    color: '#111',
    marginBottom: spacing.sm,
    textAlign: 'left',
    fontSize: 24,
    fontWeight: '700',
  },
  body: {
    ...typography.body,
    color: '#444',
    textAlign: 'left',
    marginBottom: spacing.lg,
    fontSize: 16,
  },

  // Buttons
  primary: {
    backgroundColor: '#111',
    borderRadius: 12,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
    alignSelf: 'stretch',
  },
  primaryPressed: {
    backgroundColor: '#4B5563',
  },
  primaryText: {
    ...typography.subtitle,
    color: '#fff',
    fontWeight: '600',
  },
  skipText: {
    color: '#6B7280',
    textAlign: 'center',
    marginTop: spacing.sm,
    fontSize: 14,
  },
});
