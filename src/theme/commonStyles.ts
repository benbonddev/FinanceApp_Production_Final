import { StyleSheet } from 'react-native';
import { spacing, borderRadius, shadows, layout } from './theme';

// Common styles that can be reused across components
export const commonStyles = StyleSheet.create({
  // Container styles
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.md,
  },
  card: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.light.small,
  },
  
  // Text styles
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: spacing.md,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: spacing.sm,
  },
  paragraph: {
    fontSize: 16,
    marginBottom: spacing.md,
  },
  caption: {
    fontSize: 14,
    marginBottom: spacing.sm,
  },
  errorText: {
    fontSize: 14,
    marginTop: spacing.xs,
    marginLeft: spacing.sm,
  },
  
  // Form styles
  formGroup: {
    marginBottom: spacing.md,
  },
  input: {
    borderWidth: 1,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: 16,
    marginBottom: spacing.xs,
  },
  
  // Button styles
  button: {
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    ...layout.center,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  
  // Layout styles
  row: {
    ...layout.row,
  },
  column: {
    ...layout.column,
  },
  center: {
    ...layout.center,
  },
  spaceBetween: {
    ...layout.spaceBetween,
  },
  
  // Action styles
  actions: {
    ...layout.row,
    ...layout.spaceBetween,
    marginTop: spacing.lg,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  
  // List styles
  listItem: {
    ...layout.row,
    padding: spacing.md,
    borderBottomWidth: 1,
  },
  listItemContent: {
    flex: 1,
  },
  
  // Icon styles
  icon: {
    marginRight: spacing.sm,
  },
  
  // Chart styles
  chartContainer: {
    height: 200,
    marginVertical: spacing.md,
  },
  
  // Progress styles
  progressContainer: {
    marginVertical: spacing.sm,
  },
  
  // Modal styles
  modalContainer: {
    padding: spacing.lg,
    borderRadius: borderRadius.md,
  },
  modalHeader: {
    ...layout.row,
    ...layout.spaceBetween,
    marginBottom: spacing.md,
  },
  
  // Tab styles
  tabContainer: {
    ...layout.row,
    marginBottom: spacing.md,
  },
  tab: {
    flex: 1,
    padding: spacing.md,
    ...layout.center,
  },
});

export default commonStyles;
