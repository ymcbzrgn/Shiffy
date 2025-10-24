import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface Props {
  title: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  onPress: () => void;
}

export function QuickActionButton({ title, icon, onPress }: Props) {
  return (
    <View style={styles.wrapper}>
      <TouchableOpacity 
        style={styles.container}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <MaterialIcons name={icon} size={48} color="#1193d4" style={styles.icon} />
        <Text style={styles.title}>{title}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '48%',
    marginBottom: 12,
    paddingHorizontal: 6,
  },
  container: {
    flexDirection: 'column',
    alignItems: 'center',
    padding: 20,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    backgroundColor: '#ffffff',
  },
  icon: {
    marginBottom: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111618',
    textAlign: 'center',
  },
});
