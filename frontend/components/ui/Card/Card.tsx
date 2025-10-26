import React from 'react';
import { View, ViewProps, StyleProp, ViewStyle } from 'react-native';
import { styles } from './Card.styles';

export interface CardProps extends ViewProps {
  children: React.ReactNode;
  variant?: 'default' | 'compact' | 'spacious';
  style?: StyleProp<ViewStyle>;
}

export function Card({ 
  children, 
  variant = 'default',
  style,
  ...props 
}: CardProps) {
  const cardStyle = [
    styles.card,
    variant === 'compact' && styles.cardCompact,
    variant === 'spacious' && styles.cardSpacious,
    style,
  ];

  return (
    <View style={cardStyle} {...props}>
      {children}
    </View>
  );
}
