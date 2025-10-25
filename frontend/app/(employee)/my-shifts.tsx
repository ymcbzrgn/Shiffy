import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

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

// Mock data
const MOCK_SHIFTS: Shift[] = [
  {
    id: '1',
    date: '2025-01-28',
    dayName: 'Salı',
    startTime: '09:00',
    endTime: '17:00',
    duration: '8 saat',
    status: 'approved',
    statusText: 'Onaylandı',
    location: 'Starbucks Şişli'
  },
  {
    id: '2',
    date: '2025-01-30',
    dayName: 'Perşembe',
    startTime: '14:00',
    endTime: '22:00',
    duration: '8 saat',
    status: 'approved',
    statusText: 'Onaylandı',
    location: 'Starbucks Şişli'
  },
  {
    id: '3',
    date: '2025-02-01',
    dayName: 'Cumartesi',
    startTime: '10:00',
    endTime: '18:00',
    duration: '8 saat',
    status: 'pending',
    statusText: 'Beklemede',
    location: 'Starbucks Şişli'
  },
  {
    id: '4',
    date: '2025-01-25',
    dayName: 'Cumartesi',
    startTime: '09:00',
    endTime: '17:00',
    duration: '8 saat',
    status: 'past',
    statusText: 'Tamamlandı',
    location: 'Starbucks Şişli'
  },
  {
    id: '5',
    date: '2025-01-22',
    dayName: 'Çarşamba',
    startTime: '14:00',
    endTime: '22:00',
    duration: '8 saat',
    status: 'past',
    statusText: 'Tamamlandı',
    location: 'Starbucks Şişli'
  }
];

type TabType = 'upcoming' | 'past' | 'all';

export default function MyShiftsScreen() {
  const router = useRouter();
  const [currentTab, setCurrentTab] = useState<TabType>('upcoming');
  
  // Filter shifts based on current tab
  const filteredShifts = MOCK_SHIFTS.filter(shift => {
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
      key={shift.id}
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
  
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <MaterialIcons name="event-busy" size={48} color="#ffffff" />
      </View>
      <Text style={styles.emptyTitle}>
        Shift Bulunamadı
      </Text>
      <Text style={styles.emptyText}>
        Bu kategoride henüz shift bulunmuyor.
      </Text>
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
      </LinearGradient>
      
      <ScrollView style={styles.content}>
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
          {filteredShifts.length === 0 ? renderEmptyState() : filteredShifts.map(renderShiftCard)}
        </View>
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
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginLeft: 12,
  },
  content: {
    flex: 1,
    padding: 16,
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
    backgroundColor: 'rgba(17, 147, 212, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#111618',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#617c89',
  },
});
