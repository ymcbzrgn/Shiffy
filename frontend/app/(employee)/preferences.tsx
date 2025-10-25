// Employee Shift Preferences Screen - Placeholder for Phase 9

import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function EmployeePreferencesScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Shift Tercihleri</Text>
      </View>
      
      <View style={styles.content}>
        <MaterialIcons name="edit-calendar" size={64} color="#9ca3af" />
        <Text style={styles.title}>Shift Grid Yakında</Text>
        <Text style={styles.subtitle}>
          Bu ekran Phase 9'da yapılacak{'\n'}
          7 gün × 48 slot interaktif grid
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f7f8',
  },
  header: {
    backgroundColor: '#1193d4',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111618',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#617c89',
    textAlign: 'center',
    lineHeight: 20,
  },
});
