/**
 * Shiffy color palette and theme configuration
 * Used throughout the app for consistent styling
 */

import { Platform } from 'react-native';

// Shiffy Brand Colors
export const colors = {
  // Primary
  primary: '#1193d4',
  primaryDark: '#0d7ab8',
  
  // Status Colors
  success: '#078836',
  warning: '#F0AD4E',
  danger: '#D9534F',
  
  // Light Mode
  light: {
    background: '#f6f7f8',
    surface: '#ffffff',
    text: '#111618',
    textSecondary: '#617c89',
    border: '#e5e7eb',
  },
  
  // Dark Mode
  dark: {
    background: '#101c22',
    surface: '#1a2a33',
    text: '#f0f3f4',
    textSecondary: '#a0b8c4',
    border: '#374151',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
};

// Legacy Colors (for backward compatibility with existing components)
const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
