import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PasswordStrength } from '../../utils/validation';

interface Props {
  strength: PasswordStrength;
}

export function PasswordStrengthIndicator({ strength }: Props) {
  const getColor = () => {
    if (strength === 'weak') return '#D9534F'; // Red
    if (strength === 'medium') return '#F0AD4E'; // Orange
    if (strength === 'good') return '#5BC0DE'; // Blue
    return '#078836'; // Green
  };

  const getWidth = () => {
    if (strength === 'weak') return '25%';
    if (strength === 'medium') return '50%';
    if (strength === 'good') return '75%';
    return '100%';
  };

  const getLabel = () => {
    if (strength === 'weak') return 'Zayıf';
    if (strength === 'medium') return 'Orta';
    if (strength === 'good') return 'İyi';
    return 'Güçlü';
  };

  return (
    <View style={styles.container}>
      <View style={styles.barBackground}>
        <View 
          style={[
            styles.barFill, 
            { width: getWidth(), backgroundColor: getColor() }
          ]} 
        />
      </View>
      <Text style={[styles.label, { color: getColor() }]}>
        {getLabel()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    gap: 4,
  },
  barBackground: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
});
