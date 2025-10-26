import { StyleSheet } from 'react-native';
import { BORDER_RADIUS, SPACING, FONT_SIZES, FONT_WEIGHTS } from '@/constants/design-tokens';

export const styles = StyleSheet.create({
  button: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    gap: SPACING.sm,
  },
  text: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    color: '#ffffff',
  },
  disabled: {
    opacity: 0.6,
  },
});
