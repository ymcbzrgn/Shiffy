import { StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, SHADOWS } from '@/constants/design-tokens';

export const styles = StyleSheet.create({
  header: {
    paddingTop: 50,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    flexDirection: 'row',
    alignItems: 'center',
    ...SHADOWS.md,
  },
  backButton: {
    padding: SPACING.xs,
  },
  content: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textInverse,
  },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.regular,
    color: COLORS.textInverse,
    marginTop: SPACING.xs,
    opacity: 0.9,
  },
  rightAction: {
    marginLeft: SPACING.md,
  },
});
