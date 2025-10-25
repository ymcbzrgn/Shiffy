import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatCard } from '../../components/features/StatCard';
import { QuickActionButton } from '../../components/features/QuickActionButton';

export default function ManagerDashboardScreen() {
  const router = useRouter();

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
            // Clear auth token (Phase 7'de implement edilecek)
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
            <Text style={styles.headerSubtitle}>Hoş geldiniz, Kahve Dükkanı</Text>
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
        {/* Stat Cards */}
        <View style={styles.statsGrid}>
          <StatCard
            title="Toplam Çalışan"
            value="24"
            icon="group"
            color="#1193d4"
            bgColor="rgba(17, 147, 212, 0.1)"
          />
          <StatCard
            title="Bekleyen Tercihler"
            value="12"
            icon="pending-actions"
            color="#F0AD4E"
            bgColor="rgba(240, 173, 78, 0.1)"
          />
          <StatCard
            title="Bu Hafta Shift"
            value="156"
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
              title="Ayarlar"
              icon="settings"
              onPress={() => router.push('/(manager)/settings' as any)}
            />
            <QuickActionButton
              title="Raporlar"
              icon="analytics"
              onPress={() => Alert.alert('Raporlar', 'Gelecek versiyonda')}
            />
            <QuickActionButton
              title="Yardım"
              icon="help"
              onPress={() => Alert.alert('Yardım', 'Gelecek versiyonda')}
            />
          </View>
        </View>
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
