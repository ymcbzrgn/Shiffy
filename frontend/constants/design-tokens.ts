/**
 * Shiffy Design System Tokens
 * Tüm renk, spacing, font boyutları burada tanımlı
 * Kullanım: import { COLORS, SPACING } from '@/constants/design-tokens';
 */

// ==========================================
// COLORS
// ==========================================
export const COLORS = {
  // Brand Colors (Shiffy Gradient)
  primary: '#00cd81',
  primaryDark: '#004dd6',
  
  // Status Colors
  success: '#10b981',
  successDark: '#059669',
  warning: '#f59e0b',
  warningDark: '#d97706',
  error: '#ef4444',
  errorDark: '#dc2626',
  info: '#3b82f6',
  infoDark: '#1193d4',
  
  // Neutral Grays
  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray300: '#d1d5db',
  gray400: '#9ca3af',
  gray500: '#6b7280',
  gray600: '#4b5563',
  gray700: '#374151',
  gray800: '#1f2937',
  gray900: '#111827',
  
  // Semantic Colors
  textPrimary: '#111827',
  textSecondary: '#6b7280',
  textTertiary: '#9ca3af',
  textInverse: '#ffffff',
  
  background: '#f5f7fa',
  backgroundSecondary: '#ffffff',
  
  border: '#e5e7eb',
  borderLight: '#f3f4f6',
  borderDark: '#d1d5db',
  
  // Shift Calendar Colors
  shiftBlue: '#3b82f6',
  shiftPurple: '#8b5cf6',
  shiftPink: '#ec4899',
  shiftOrange: '#f59e0b',
  shiftGreen: '#10b981',
  shiftCyan: '#06b6d4',
  shiftRed: '#ef4444',
} as const;

// ==========================================
// SPACING
// ==========================================
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
  massive: 64,
} as const;

// ==========================================
// FONT SIZES
// ==========================================
export const FONT_SIZES = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 20,
  xxxl: 24,
  heading: 28,
  display: 32,
} as const;

// ==========================================
// FONT WEIGHTS
// ==========================================
export const FONT_WEIGHTS = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
} as const;

// ==========================================
// BORDER RADIUS
// ==========================================
export const BORDER_RADIUS = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 20,
  full: 9999,
} as const;

// ==========================================
// SHADOWS
// ==========================================
export const SHADOWS = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  xl: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
} as const;

// ==========================================
// GRADIENTS
// ==========================================
export const GRADIENTS = {
  primary: ['#00cd81', '#004dd6'] as const,
  success: ['#10b981', '#059669'] as const,
  disabled: ['#9ca3af', '#9ca3af'] as const,
} as const;

// ==========================================
// LAYOUT
// ==========================================
export const LAYOUT = {
  headerHeight: 60,
  tabBarHeight: 60,
  maxContentWidth: 1200,
  screenPaddingHorizontal: 20,
  cardPadding: 16,
} as const;

// ==========================================
// ANIMATION
// ==========================================
export const ANIMATION = {
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
  easing: {
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
} as const;

// ==========================================
// BREAKPOINTS (for responsive design)
// ==========================================
export const BREAKPOINTS = {
  small: 375,   // iPhone SE
  medium: 768,  // iPad
  large: 1024,  // iPad Pro
  xlarge: 1440, // Desktop
} as const;
