import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface Props {
  title: string;
  value: string | number;
  icon: keyof typeof MaterialIcons.glyphMap;
  color: string;
  bgColor: string;
}

export function StatCard({ title, value, icon, color, bgColor }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View>
          <Text style={styles.title}>{title}</Text>
          <Text style={[styles.value, { color }]}>{value}</Text>
        </View>
        <View style={[styles.iconContainer, { backgroundColor: bgColor }]}>
          <MaterialIcons name={icon} size={36} color={color} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 12,
    color: '#617c89',
    marginBottom: 8,
  },
  value: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  iconContainer: {
    padding: 16,
    borderRadius: 12,
  },
});
