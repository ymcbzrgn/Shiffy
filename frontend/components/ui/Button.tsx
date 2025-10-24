import { Text, TouchableOpacity, ActivityIndicator } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export function Button({ 
  title, 
  onPress, 
  variant = 'primary', 
  disabled = false,
  loading = false,
  className = ''
}: ButtonProps) {
  
  const baseClasses = 'py-4 px-6 rounded-lg items-center justify-center';
  
  const variantClasses = {
    primary: 'bg-primary dark:bg-primary',
    secondary: 'bg-white dark:bg-[#1a2a33] border-2 border-primary',
    danger: 'bg-danger dark:bg-danger',
  };
  
  const textClasses = {
    primary: 'text-white font-bold text-base',
    secondary: 'text-primary font-bold text-base',
    danger: 'text-white font-bold text-base',
  };
  
  const disabledClasses = disabled || loading ? 'opacity-50' : '';
  
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]} ${disabledClasses} ${className}`}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'secondary' ? '#1193d4' : '#ffffff'} />
      ) : (
        <Text className={textClasses[variant]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}
