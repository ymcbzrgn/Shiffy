import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Employee } from '../../types';

interface Props {
  employee: Employee;
  onPress: (id: string) => void;
}

export function EmployeeCard({ employee, onPress }: Props) {
  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(employee.id)}
      activeOpacity={0.7}
    >
      {/* Header with Avatar and Status */}
      <View style={styles.header}>
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(employee.full_name)}</Text>
          </View>
          <View>
            <Text style={styles.name}>{employee.full_name}</Text>
            <Text style={styles.username}>@{employee.username}</Text>
          </View>
        </View>
        <View style={[
          styles.statusBadge,
          employee.status === 'active' ? styles.statusActive : styles.statusInactive
        ]}>
          <Text style={[
            styles.statusText,
            employee.status === 'active' ? styles.statusTextActive : styles.statusTextInactive
          ]}>
            {employee.status === 'active' ? 'Aktif' : 'Pasif'}
          </Text>
        </View>
      </View>

      {/* Info Section */}
      <View style={styles.infoSection}>
        <View style={styles.infoItem}>
          <MaterialIcons name="event" size={16} color="#617c89" />
          <Text style={styles.infoText}>
            {employee.last_login ? 'Son giriş: ' + new Date(employee.last_login).toLocaleDateString('tr-TR') : 'Hiç giriş yapmadı'}
          </Text>
        </View>
        {employee.first_login && (
          <View style={styles.firstLoginBadge}>
            <MaterialIcons name="info" size={14} color="#F0AD4E" />
            <Text style={styles.firstLoginText}>İlk giriş bekleniyor</Text>
          </View>
        )}
      </View>

      {/* Action Button */}
      <TouchableOpacity 
        style={styles.actionButtonContainer}
        onPress={() => onPress(employee.id)}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#00cd81', '#004dd6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.actionButton}
        >
          <Text style={styles.actionButtonText}>Detayları Gör</Text>
          <MaterialIcons name="arrow-forward" size={20} color="#ffffff" />
        </LinearGradient>
      </TouchableOpacity>
    </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1193d4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111618',
  },
  username: {
    fontSize: 14,
    color: '#617c89',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusActive: {
    backgroundColor: 'rgba(7, 136, 54, 0.1)',
  },
  statusInactive: {
    backgroundColor: '#e5e7eb',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusTextActive: {
    color: '#078836',
  },
  statusTextInactive: {
    color: '#617c89',
  },
  infoSection: {
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#617c89',
    marginLeft: 6,
  },
  firstLoginBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(240, 173, 78, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  firstLoginText: {
    fontSize: 12,
    color: '#F0AD4E',
    fontWeight: '600',
    marginLeft: 6,
  },
  actionButtonContainer: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
});
