import { TextInput, Text, View } from 'react-native';
import { useState } from 'react';

interface InputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  className?: string;
}

export function Input({
  value,
  onChangeText,
  placeholder,
  label,
  error,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  className = '',
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  
  const borderColor = error 
    ? 'border-danger' 
    : isFocused 
    ? 'border-primary' 
    : 'border-gray-300 dark:border-gray-600';
  
  return (
    <View className={`mb-4 ${className}`}>
      {label && (
        <Text className="text-sm font-semibold text-[#111618] dark:text-[#f0f3f4] mb-2">
          {label}
        </Text>
      )}
      
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#617c89"
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`
          w-full rounded-lg border-2 px-4 py-3
          bg-white dark:bg-[#1a2a33]
          text-[#111618] dark:text-[#f0f3f4]
          ${borderColor}
        `}
      />
      
      {error && (
        <Text className="text-danger text-xs mt-1">{error}</Text>
      )}
    </View>
  );
}
