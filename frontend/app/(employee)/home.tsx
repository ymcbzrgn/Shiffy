// Employee Home Screen - Dashboard with this week's status

import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getUserSession } from '../../utils/storage';
import { getMyPreferences } from '../../services/shift';
import { getWeekStart, formatWeekRange, formatDateISO } from '../../utils/shift-grid-helpers';

export default function EmployeeHomeScreen() {
  const router = useRouter();
  const [userName, setUserName] = useState('Çalışan');
  const [userInitials, setUserInitials] = useState('C');
  const [weekStatus, setWeekStatus] = useState({
    week: '',
    daysRemaining: 0,
    hasSubmittedPreferences: false
  });
  const [loading, setLoading] = useState(true);

  // Load user session on mount
  useEffect(() => {
    loadEmployeeData();
  }, []);

  const loadEmployeeData = async () => {
    try {
      setLoading(true);

      // Get user session
      const session = await getUserSession();
      if (session && session.userType === 'employee') {
        const employee = session.user as any;
        setUserName(employee.full_name || 'Çalışan');
        setUserInitials(getInitials(employee.full_name || 'C'));
      }

      // Calculate next week (offset +1)
      const today = new Date();
      const nextWeekStart = getWeekStart(today);
      nextWeekStart.setDate(nextWeekStart.getDate() + 7);

      const weekRange = formatWeekRange(nextWeekStart);

      // Calculate days to Friday (deadline)
      const friday = new Date(nextWeekStart);
      friday.setDate(friday.getDate() + 4); // Monday + 4 = Friday
      const daysRemaining = Math.ceil((friday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      // Check if preferences submitted
      const weekStartStr = formatDateISO(nextWeekStart);
      const preferences = await getMyPreferences(weekStartStr).catch(() => null);

      setWeekStatus({
        week: weekRange,
        daysRemaining: Math.max(0, daysRemaining),
        hasSubmittedPreferences: preferences?.submitted_at !== null
      });
    } catch (error) {
      console.error('Failed to load employee data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string): string => {
    const words = name.split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Employee data
  const employee = {
    name: userName,
    initials: userInitials,
    hasUnreadNotifications: true,
  };

  const handleGoToPreferences = () => {
    router.push('/(employee)/preferences' as any);
  };

  const handleViewPreferences = () => {
    router.push('/(employee)/preferences' as any);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#00cd81', '#004dd6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.userSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{employee.initials}</Text>
          </View>
          <View>
            <Text style={styles.greeting}>Hoşgeldin,</Text>
            <Text style={styles.userName}>{employee.name}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.notificationButton}>
          <MaterialIcons name="notifications" size={24} color="#ffffff" />
          {employee.hasUnreadNotifications && <View style={styles.notificationDot} />}
        </TouchableOpacity>
      </LinearGradient>

      {/* Main Content */}
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Bu Haftanın Durumu</Text>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1193d4" />
            <Text style={styles.loadingText}>Yükleniyor...</Text>
          </View>
        ) : (
          <>
            {/* Conditional Card - Action Required or Pending */}
            {!weekStatus.hasSubmittedPreferences ? (
              // Action Required Card
              <View style={styles.actionRequiredCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.iconContainer}>
                    <MaterialIcons name="error" size={28} color="#D9534F" />
                  </View>
                  <View style={styles.cardContent}>
                    <Text style={styles.cardBadge}>TERCİHLERİN BEKLENİYOR</Text>
                    <Text style={styles.cardTitle}>
                      Bu haftaki shift tercihlerini henüz girmedin
                    </Text>
                    <Text style={styles.cardSubtitle}>
                      {weekStatus.week} · Son gün:{' '}
                      <Text style={styles.daysRemainingText}>{weekStatus.daysRemaining} gün</Text>
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={handleGoToPreferences}
                  style={styles.actionButton}
                >
                  <MaterialIcons name="edit-calendar" size={20} color="#ffffff" />
                  <Text style={styles.actionButtonText}>Tercihleri Gir</Text>
                </TouchableOpacity>
              </View>
            ) : (
              // Pending Approval Card
              <View style={styles.pendingCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.iconContainerPending}>
                    <MaterialIcons name="pending" size={28} color="#F0AD4E" />
                  </View>
                  <View style={styles.cardContent}>
                    <Text style={styles.cardBadgePending}>TERCİHLER GÖNDERİLDİ</Text>
                    <Text style={styles.cardTitle}>
                      Tercihlerin yönetici onayı bekliyor
                    </Text>
                    <Text style={styles.cardSubtitle}>
                      {weekStatus.week}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={handleViewPreferences}
                  style={styles.viewButton}
                >
                  <MaterialIcons name="visibility" size={20} color="#F0AD4E" />
                  <Text style={styles.viewButtonText}>Tercihleri Görüntüle</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}

        {/* Quick Actions */}
        <Text style={[styles.sectionTitle, styles.quickActionsTitle]}>Hızlı Erişim</Text>

        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => router.push('/(employee)/my-shifts' as any)}
            activeOpacity={0.7}
          >
            <View style={styles.quickActionIcon}>
              <MaterialIcons name="event" size={28} color="#1193d4" />
            </View>
            <Text style={styles.quickActionText}>Shiftlerim</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => router.push('/(employee)/preferences' as any)}
            activeOpacity={0.7}
          >
            <View style={styles.quickActionIcon}>
              <MaterialIcons name="edit-calendar" size={28} color="#1193d4" />
            </View>
            <Text style={styles.quickActionText}>Tercihlerim</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => router.push('/(employee)/profile' as any)}
            activeOpacity={0.7}
          >
            <View style={styles.quickActionIcon}>
              <MaterialIcons name="person" size={28} color="#1193d4" />
            </View>
            <Text style={styles.quickActionText}>Profilim</Text>
          </TouchableOpacity>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#004dd6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  greeting: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ffffff',
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D9534F',
  },
  content: {
    padding: 16,
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111618',
    marginBottom: 12,
  },
  quickActionsTitle: {
    marginTop: 16,
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
  actionRequiredCard: {
    backgroundColor: 'rgba(217, 83, 79, 0.05)',
    borderWidth: 2,
    borderColor: 'rgba(217, 83, 79, 0.3)',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  pendingCard: {
    backgroundColor: 'rgba(240, 173, 78, 0.05)',
    borderWidth: 2,
    borderColor: 'rgba(240, 173, 78, 0.3)',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  iconContainer: {
    backgroundColor: 'rgba(217, 83, 79, 0.2)',
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconContainerPending: {
    backgroundColor: 'rgba(240, 173, 78, 0.2)',
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardBadge: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#D9534F',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  cardBadgePending: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#F0AD4E',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111618',
    marginBottom: 8,
    lineHeight: 22,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#617c89',
  },
  daysRemainingText: {
    fontWeight: '600',
    color: '#D9534F',
  },
  actionButton: {
    backgroundColor: '#D9534F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#D9534F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  viewButton: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: 'rgba(240, 173, 78, 0.3)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
  },
  viewButtonText: {
    color: '#F0AD4E',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  quickActionButton: {
    width: '31%',
    margin: '1%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  quickActionIcon: {
    backgroundColor: 'rgba(0, 205, 129, 0.1)',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111618',
    textAlign: 'center',
  },
});
