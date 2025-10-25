import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { getMySchedule } from '../../services/schedule';
import type { MyScheduleResponse } from '../../services/schedule';
import type { AssignedShift, DayOfWeek } from '../../types';
import { getWeekStart, formatDateISO } from '../../utils/shift-grid-helpers';
import { getUserSession } from '../../utils/storage';

interface Shift {
  id: string;
  date: string;
  dayName: string;
  startTime: string;
  endTime: string;
  duration: string;
  status: 'approved' | 'pending' | 'past';
  statusText: string;
  location: string;
}

type TabType = 'upcoming' | 'past' | 'all';

// Turkish day names mapping
const TURKISH_DAYS: Record<DayOfWeek, string> = {
  monday: 'Pazartesi',
  tuesday: 'Salı',
  wednesday: 'Çarşamba',
  thursday: 'Perşembe',
  friday: 'Cuma',
  saturday: 'Cumartesi',
  sunday: 'Pazar',
};

// Day of week to index (Monday = 0, Sunday = 6)
const DAY_INDEX: Record<DayOfWeek, number> = {
  monday: 0,
  tuesday: 1,
  wednesday: 2,
  thursday: 3,
  friday: 4,
  saturday: 5,
  sunday: 6,
};

/**
 * Generate week start dates for multiple weeks
 * @param weeksBack - Number of weeks in the past
 * @param weeksForward - Number of weeks in the future
 */
function getWeeksToLoad(weeksBack: number, weeksForward: number): string[] {
  const today = new Date();
  const currentWeekStart = getWeekStart(today);
  const weeks: string[] = [];

  for (let i = -weeksBack; i <= weeksForward; i++) {
    const weekStart = new Date(currentWeekStart);
    weekStart.setDate(currentWeekStart.getDate() + i * 7);
    weeks.push(formatDateISO(weekStart));
  }

  return weeks;
}

/**
 * Calculate absolute date from week_start and day of week
 */
function getDateFromDayOfWeek(weekStart: string, day: DayOfWeek): string {
  const date = new Date(weekStart);
  date.setDate(date.getDate() + DAY_INDEX[day]);
  return formatDateISO(date);
}

/**
 * Calculate duration between two times
 */
function calculateDuration(startTime: string, endTime: string): string {
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);

  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;

  const durationMinutes = endMinutes - startMinutes;
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;

  if (minutes === 0) {
    return `${hours} saat`;
  }
  return `${hours} saat ${minutes} dk`;
}

/**
 * Convert backend AssignedShift to frontend Shift format
 */
function convertAssignedShiftToShift(
  assignedShift: AssignedShift,
  weekStart: string,
  storeName: string
): Shift {
  const date = getDateFromDayOfWeek(weekStart, assignedShift.day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const shiftDate = new Date(date);
  shiftDate.setHours(0, 0, 0, 0);

  const isPast = shiftDate < today;

  // Generate unique ID from date, day, and time
  const uniqueId = `${date}-${assignedShift.day}-${assignedShift.start_time}`;

  return {
    id: uniqueId,
    date,
    dayName: TURKISH_DAYS[assignedShift.day],
    startTime: assignedShift.start_time,
    endTime: assignedShift.end_time,
    duration: calculateDuration(assignedShift.start_time, assignedShift.end_time),
    status: isPast ? 'past' : 'approved',
    statusText: isPast ? 'Tamamlandı' : 'Onaylandı',
    location: storeName,
  };
}

export default function MyShiftsScreen() {
  const router = useRouter();
  const [currentTab, setCurrentTab] = useState<TabType>('upcoming');
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [storeName, setStoreName] = useState('');

  // Load shifts on mount
  useEffect(() => {
    loadShifts();
  }, []);

  const loadShifts = async () => {
    try {
      setLoading(true);

      // Get store name from user session
      const session = await getUserSession();
      const userStoreName = (session?.user as any)?.full_name || 'Mağaza';
      setStoreName(userStoreName);

      // Load schedules for 8 weeks (4 past + current + 3 future)
      const weeksToLoad = getWeeksToLoad(4, 3);
      
      console.log('📅 Loading shifts for weeks:', weeksToLoad);

      // Fetch all weeks in parallel
      const schedulePromises = weeksToLoad.map(weekStart =>
        getMySchedule(weekStart).catch((err) => {
          console.log(`❌ Failed to load week ${weekStart}:`, err);
          return null;
        })
      );

      const schedules = await Promise.all(schedulePromises);
      
      console.log('📊 Loaded schedules:', schedules.map((s, i) => ({
        week: weeksToLoad[i],
        hasData: !!s,
        shiftCount: s?.shifts?.length || 0
      })));

      // Convert all shifts to frontend format
      const allShifts: Shift[] = [];

      schedules.forEach((schedule, index) => {
        if (schedule && schedule.shifts && schedule.shifts.length > 0) {
          const weekStart = weeksToLoad[index];
          console.log(`✅ Processing ${schedule.shifts.length} shifts for week ${weekStart}`);
          schedule.shifts.forEach(assignedShift => {
            allShifts.push(
              convertAssignedShiftToShift(assignedShift, weekStart, userStoreName)
            );
          });
        }
      });

      // Sort by date (ascending)
      allShifts.sort((a, b) => a.date.localeCompare(b.date));
      
      console.log(`✅ Total shifts loaded: ${allShifts.length}`);

      setShifts(allShifts);
    } catch (error) {
      console.error('Failed to load shifts:', error);
      Alert.alert('Hata', 'Shiftler yüklenemedi. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  // Filter shifts based on current tab
  const filteredShifts = shifts.filter(shift => {
    if (currentTab === 'all') return true;
    if (currentTab === 'upcoming') return shift.status === 'approved' || shift.status === 'pending';
    if (currentTab === 'past') return shift.status === 'past';
    return true;
  });

  const getShiftCardStyle = (status: Shift['status']) => {
    if (status === 'approved') return styles.shiftApproved;
    if (status === 'pending') return styles.shiftPending;
    return styles.shiftPast;
  };

  const getStatusColor = (status: Shift['status']) => {
    if (status === 'approved') return '#078836';
    if (status === 'pending') return '#F0AD4E';
    return '#617c89';
  };

  const renderShiftCard = (shift: Shift) => (
    <View
      style={[
        styles.shiftCard,
        getShiftCardStyle(shift.status)
      ]}
    >
      <View style={styles.shiftCardHeader}>
        <View>
          <Text style={styles.shiftDate}>
            {shift.date}
          </Text>
          <Text style={styles.shiftDay}>
            {shift.dayName}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(shift.status) }]}>
          <Text style={styles.statusText}>{shift.statusText}</Text>
        </View>
      </View>

      <View style={styles.shiftCardBody}>
        <View style={styles.shiftRow}>
          <MaterialIcons name="access-time" size={18} color="#617c89" />
          <Text style={styles.shiftTime}>
            {shift.startTime} - {shift.endTime}
          </Text>
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>{shift.duration}</Text>
          </View>
        </View>

        <View style={styles.shiftRow}>
          <MaterialIcons name="location-on" size={18} color="#617c89" />
          <Text style={styles.shiftLocation}>
            {shift.location}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderEmptyState = () => {
    const getMessage = () => {
      if (shifts.length === 0) {
        // No shifts at all in any week
        return {
          icon: 'info-outline',
          title: 'Henüz Shift Atanmamış',
          message: 'Yöneticiniz henüz bu haftalara shift atamamış.\n\nShift tercihlerinizi girmeyi unutmayın.',
          color: '#1193d4',
        };
      } else if (currentTab === 'upcoming' && filteredShifts.length === 0) {
        return {
          icon: 'event-available',
          title: 'Yaklaşan Shift Yok',
          message: 'Şu anda yaklaşan bir shift bulunmuyor.',
          color: '#078836',
        };
      } else if (currentTab === 'past' && filteredShifts.length === 0) {
        return {
          icon: 'history',
          title: 'Geçmiş Shift Yok',
          message: 'Henüz tamamlanmış shift bulunmuyor.',
          color: '#617c89',
        };
      }
      return {
        icon: 'event-busy',
        title: 'Shift Bulunamadı',
        message: 'Bu kategoride shift bulunmuyor.',
        color: '#617c89',
      };
    };

    const { icon, title, message, color } = getMessage();

    return (
      <View style={styles.emptyState}>
        <View style={[styles.emptyIcon, { backgroundColor: color }]}>
          <MaterialIcons name={icon as any} size={48} color="#ffffff" />
        </View>
        <Text style={styles.emptyTitle}>{title}</Text>
        <Text style={styles.emptyText}>{message}</Text>
        {shifts.length === 0 && (
          <TouchableOpacity
            onPress={() => router.push('/(employee)/preferences' as any)}
            style={styles.emptyButton}
          >
            <MaterialIcons name="edit-calendar" size={20} color="#ffffff" />
            <Text style={styles.emptyButtonText}>Tercihleri Gir</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#1193d4" />
      <Text style={styles.loadingText}>Shiftler yükleniyor...</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header with Gradient */}
      <LinearGradient
        colors={['#00cd81', '#004dd6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => router.push('/(employee)/home' as any)} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Shiftlerim</Text>
        <TouchableOpacity onPress={loadShifts} style={styles.refreshButton}>
          <MaterialIcons name="refresh" size={24} color="#ffffff" />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={loadShifts}
            colors={['#1193d4']}
            tintColor="#1193d4"
          />
        }
      >
        {loading ? (
          renderLoadingState()
        ) : (
          <>
            <View style={styles.tabsContainer}>
              <TouchableOpacity
                onPress={() => setCurrentTab('upcoming')}
                style={[styles.tab, currentTab === 'upcoming' ? styles.tabActive : styles.tabInactive]}
              >
                <Text style={[
                  styles.tabText,
                  currentTab === 'upcoming' ? styles.tabTextActive : styles.tabTextInactive
                ]}>
                  Yaklaşan
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setCurrentTab('past')}
                style={[styles.tab, currentTab === 'past' ? styles.tabActive : styles.tabInactive]}
              >
                <Text style={[
                  styles.tabText,
                  currentTab === 'past' ? styles.tabTextActive : styles.tabTextInactive
                ]}>
                  Geçmiş
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setCurrentTab('all')}
                style={[styles.tab, currentTab === 'all' ? styles.tabActive : styles.tabInactive]}
              >
                <Text style={[
                  styles.tabText,
                  currentTab === 'all' ? styles.tabTextActive : styles.tabTextInactive
                ]}>
                  Tümü
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.shiftsList}>
              {filteredShifts.length === 0 ? renderEmptyState() : filteredShifts.map(shift => (
                <View key={shift.id}>
                  {renderShiftCard(shift)}
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    flex: 1,
    marginLeft: 12,
  },
  refreshButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 16,
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
  tabsContainer: {
    flexDirection: 'row',
    gap: 8,
    padding: 6,
    borderRadius: 12,
    marginBottom: 24,
    backgroundColor: '#ffffff',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#00cd81',
  },
  tabInactive: {
    backgroundColor: 'transparent',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#ffffff',
  },
  tabTextInactive: {
    color: '#617c89',
  },
  shiftsList: {
    gap: 16,
  },
  shiftCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 4,
    backgroundColor: '#ffffff',
  },
  shiftApproved: {
    borderLeftColor: '#078836',
  },
  shiftPending: {
    borderLeftColor: '#F0AD4E',
  },
  shiftPast: {
    borderLeftColor: '#617c89',
  },
  shiftCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  shiftDate: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#111618',
  },
  shiftDay: {
    fontSize: 14,
    color: '#617c89',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  shiftCardBody: {
    gap: 12,
  },
  shiftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  shiftTime: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    color: '#111618',
  },
  durationBadge: {
    backgroundColor: 'rgba(17, 147, 212, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  durationText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1193d4',
  },
  shiftLocation: {
    fontSize: 14,
    flex: 1,
    color: '#617c89',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#111618',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#617c89',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: '#1193d4',
  },
  emptyButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
  },
});
