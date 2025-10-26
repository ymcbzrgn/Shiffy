import { View, ActivityIndicator } from 'react-native';
import { COLORS } from '@/constants/design-tokens';

interface LoadingProps {
  size?: 'small' | 'large';
  color?: string;
}

export function Loading({ size = 'large', color = COLORS.primary }: LoadingProps) {
  return (
    <View className="flex-1 items-center justify-center bg-[#f6f7f8] dark:bg-[#101c22]">
      <ActivityIndicator size={size} color={color} />
    </View>
  );
}
