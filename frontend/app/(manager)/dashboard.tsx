import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatCard } from '../../components/features/StatCard';
import { QuickActionButton } from '../../components/features/QuickActionButton';
import { getEmployees } from '../../services/employee';
import { getShiftRequests } from '../../services/shift';
import { getManagerSchedule } from '../../services/schedule';
import { getUserSession } from '../../utils/storage';
import { getWeekStart, formatDateISO } from '../../utils/shift-grid-helpers';

export default function ManagerDashboardScreen() {
  const router = useRouter();

  // State
  const [storeName, setStoreName] = useState('Yönetici');
  const [stats, setStats] = useState({
    employeeCount: 0,
    pendingPreferences: 0,
    weekShifts: 0
  });
  const [loading, setLoading] = useState(true);

  // Load dashboard stats on mount
  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);

      // Get manager info
      const session = await getUserSession();
      if (session && session.userType === 'manager') {
        setStoreName(session.user.store_name || 'Yönetici');
      }

      // Calculate week dates
      const today = new Date();
      const currentWeekStart = getWeekStart(today);
      const nextWeekStart = new Date(currentWeekStart);
      nextWeekStart.setDate(currentWeekStart.getDate() + 7);

      const currentWeek = formatDateISO(currentWeekStart);
      const nextWeek = formatDateISO(nextWeekStart);

      // Load data in parallel
      const [employees, preferences, schedule] = await Promise.all([
        getEmployees().catch(() => []),
        getShiftRequests(nextWeek).catch(() => []),
        getManagerSchedule(currentWeek).catch(() => null)
      ]);

      // Calculate stats
      setStats({
        employeeCount: employees.length,
        pendingPreferences: preferences.filter(p => p.submitted_at !== null).length,
        weekShifts: schedule?.shifts?.length || 0
      });
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
      Alert.alert('Hata', 'İstatistikler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Çıkış Yap',
      'Çıkış yapmak istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Çıkış Yap',
          style: 'destructive',
          onPress: () => {
            // Clear auth token
            router.replace('/(auth)/user-select' as any);
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header with Gradient */}
      <LinearGradient
        colors={['#00cd81', '#004dd6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Yönetici Paneli</Text>
            <Text style={styles.headerSubtitle}>Hoş geldiniz, {storeName}</Text>
          </View>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <MaterialIcons name="logout" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1193d4" />
            <Text style={styles.loadingText}>İstatistikler yükleniyor...</Text>
          </View>
        ) : (
          <>
            {/* Stat Cards */}
            <View style={styles.statsGrid}>
              <StatCard
                title="Toplam Çalışan"
                value={stats.employeeCount.toString()}
                icon="group"
                color="#1193d4"
                bgColor="rgba(17, 147, 212, 0.1)"
              />
              <StatCard
                title="Bekleyen Tercihler"
                value={stats.pendingPreferences.toString()}
                icon="pending-actions"
                color="#F0AD4E"
                bgColor="rgba(240, 173, 78, 0.1)"
              />
              <StatCard
                title="Bu Hafta Shift"
                value={stats.weekShifts.toString()}
                icon="event"
                color="#078836"
                bgColor="rgba(7, 136, 54, 0.1)"
              />
            </View>

            {/* Quick Actions */}
            <View style={styles.quickActionsContainer}>
              <Text style={styles.sectionTitle}>Hızlı İşlemler</Text>
              <View style={styles.quickActionsGrid}>
                <QuickActionButton
                  title="Çalışan Ekle"
                  icon="person-add"
                  onPress={() => router.push('/(manager)/employees/add' as any)}
                />
                <QuickActionButton
                  title="Çalışan Listesi"
                  icon="groups"
                  onPress={() => router.push('/(manager)/employees' as any)}
                />
                <QuickActionButton
                  title="Shift İnceleme"
                  icon="calendar-month"
                  onPress={() => router.push('/(manager)/shift-review' as any)}
                />
                <QuickActionButton
                  title="Satış Raporu"
                  icon="assessment"
                  onPress={() => router.push('/(manager)/reports' as any)}
                />
                <QuickActionButton
                  title="Ayarlar"
                  icon="settings"
                  onPress={() => router.push('/(manager)/settings' as any)}
                />
                <QuickActionButton
                  title="Yardım"
                  icon="help"
                  onPress={() => Alert.alert('Yardım', 'Gelecek versiyonda')}
                />
              </View>
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f7f8',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
  },
  logoutButton: {
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
  },
  content: {
    padding: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#617c89',
  },
  statsGrid: {
    marginBottom: 32,
  },
  quickActionsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111618',
    marginBottom: 20,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
});
