import { View } from 'react-native';
import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <View className={`bg-white dark:bg-[#1a2a33] rounded-lg p-4 shadow-sm ${className}`}>
      {children}
    </View>
  );
}
