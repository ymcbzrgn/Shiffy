// LinearGradient component wrapper for headers
import { LinearGradient } from 'expo-linear-gradient';
import { ViewStyle } from 'react-native';

interface GradientHeaderProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function GradientHeader({ children, style }: GradientHeaderProps) {
  return (
    <LinearGradient
      colors={['#00cd81', '#004dd6']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={style}
    >
      {children}
    </LinearGradient>
  );
}
