import React from 'react';
import { Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { GRADIENTS } from '@/constants/design-tokens';
import { styles } from './GradientButton.styles';

interface GradientButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: keyof typeof MaterialIcons.glyphMap;
  variant?: 'primary' | 'success' | 'disabled';
}

export function GradientButton({
  title,
  onPress,
  disabled = false,
  loading = false,
  icon,
  variant = 'primary',
}: GradientButtonProps) {
  const isDisabled = disabled || loading;

  const getGradientColors = () => {
    if (isDisabled) return GRADIENTS.disabled;
    if (variant === 'success') return GRADIENTS.success;
    return GRADIENTS.primary;
  };

  return (
    <TouchableOpacity
      style={[styles.button, isDisabled && styles.disabled]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={getGradientColors()}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        {loading ? (
          <ActivityIndicator color="#ffffff" size="small" />
        ) : (
          <>
            {icon && <MaterialIcons name={icon} size={20} color="#ffffff" />}
            <Text style={styles.text}>{title}</Text>
          </>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}
