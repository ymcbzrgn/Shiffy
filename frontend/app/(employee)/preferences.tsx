import { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import type { SlotStatus, DayOfWeek } from '@/types';
import { ShiftGrid } from '@/components/features/ShiftGrid';
import { 
  initializeEmptyGrid, 
  cycleSlotStatus, 
  getWeekStart, 
  formatWeekRange,
  formatDateISO,
  countSlotsByStatus,
  getSlotKey
} from '@/utils/shift-grid-helpers';
import { 
  saveShiftPreferences, 
  loadShiftPreferences, 
  saveDraft, 
  loadDraft,
  getUserSession
} from '@/utils/storage';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function PreferencesScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [grid, setGrid] = useState<Record<string, SlotStatus>>(initializeEmptyGrid());
  const [weekOffset, setWeekOffset] = useState(0);
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(new Date());
  const [hasChanges, setHasChanges] = useState(false);
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Load user session on mount
  useEffect(() => {
    getUserSession().then(session => {
      if (session && session.userType === 'employee') {
        setEmployeeId(session.user.id);
      }
    });
  }, []);
  
  // Load saved preferences when week or employee changes
  useEffect(() => {
    if (!employeeId) return;
    
    const weekStartStr = formatDateISO(currentWeekStart);
    
    // Try to load saved preferences first
    loadShiftPreferences(employeeId, weekStartStr).then(saved => {
      if (saved) {
        setGrid(saved.grid);
        setHasChanges(false);
        return;
      }
      
      // If no saved preferences, try to load draft
      loadDraft(employeeId, weekStartStr).then(draft => {
        if (draft) {
          setGrid(draft.grid);
          setHasChanges(true);
        } else {
          setGrid(initializeEmptyGrid());
          setHasChanges(false);
        }
      });
    });
  }, [employeeId, currentWeekStart]);
  
  // Auto-save draft every 3 seconds when there are changes
  useEffect(() => {
    if (!employeeId || !hasChanges) return;
    
    // Clear existing timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    
    // Set new timer
    autoSaveTimerRef.current = setTimeout(() => {
      const weekStartStr = formatDateISO(currentWeekStart);
      saveDraft(employeeId, weekStartStr, grid);
    }, 3000);
    
    // Cleanup
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [grid, hasChanges, employeeId, currentWeekStart]);
  
  // Update week start when offset changes
  useEffect(() => {
    const today = new Date();
    const baseWeekStart = getWeekStart(today);
    baseWeekStart.setDate(baseWeekStart.getDate() + (weekOffset * 7));
    setCurrentWeekStart(baseWeekStart);
  }, [weekOffset]);
  
  const handleSlotPress = (day: DayOfWeek, time: string) => {
    const key = getSlotKey(day, time);
    const currentStatus = grid[key];
    const nextStatus = cycleSlotStatus(currentStatus);
    
    setGrid(prev => ({
      ...prev,
      [key]: nextStatus
    }));
    setHasChanges(true);
  };
  
  const handlePreviousWeek = () => {
    setWeekOffset(prev => prev - 1);
  };
  
  const handleNextWeek = () => {
    setWeekOffset(prev => prev + 1);
  };
  
  const handleSave = async () => {
    if (!employeeId) return;
    
    const stats = countSlotsByStatus(grid);
    
    if (stats.available === 0 && stats.unavailable === 0 && stats.offRequest === 0) {
      Alert.alert(
        'Boş Tercih',
        'Hiçbir slot seçmediniz. Tercihinizi belirtmek için hücrelere dokunun.',
        [{ text: 'Tamam' }]
      );
      return;
    }
    
    try {
      const weekStartStr = formatDateISO(currentWeekStart);
      await saveShiftPreferences(employeeId, weekStartStr, grid);
      
      Alert.alert(
        'Tercihler Kaydedildi',
        `Haftanın tercihleri başarıyla kaydedildi.\n\nMüsait: ${stats.available}\nMüsait Değil: ${stats.unavailable}\nİzin: ${stats.offRequest}`,
        [{ text: 'Tamam' }]
      );
      
      setHasChanges(false);
    } catch (error) {
      Alert.alert(
        'Hata',
        'Tercihler kaydedilemedi. Lütfen tekrar deneyin.',
        [{ text: 'Tamam' }]
      );
    }
  };
  
  const handleReset = () => {
    Alert.alert(
      'Tercihleri Sıfırla',
      'Bu haftanın tüm tercihlerini silmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sıfırla',
          style: 'destructive',
          onPress: () => {
            setGrid(initializeEmptyGrid());
            setHasChanges(false);
          }
        }
      ]
    );
  };
  
  return (
    <View style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <TouchableOpacity 
              onPress={() => router.back()} 
              style={styles.backButton}
            >
              <MaterialIcons name="arrow-back" size={24} color="#ffffff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Shift Tercihlerim</Text>
          </View>
          <TouchableOpacity 
            onPress={handleSave} 
            style={[styles.saveButton, !hasChanges && styles.saveButtonDisabled]}
            disabled={!hasChanges}
          >
            <Text style={styles.saveButtonText}>Kaydet</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView style={styles.content}>
        {/* Week Navigation */}
        <View style={[styles.weekNav, isDark ? styles.weekNavDark : styles.weekNavLight]}>
          <TouchableOpacity onPress={handlePreviousWeek} style={styles.weekButton}>
            <MaterialIcons name="chevron-left" size={28} color="#1193d4" />
          </TouchableOpacity>
          <View style={styles.weekInfo}>
            <Text style={[styles.weekText, isDark ? styles.weekTextDark : styles.weekTextLight]}>
              {formatWeekRange(currentWeekStart)}
            </Text>
            {weekOffset === 0 && (
              <Text style={[styles.weekLabel, isDark ? styles.weekLabelDark : styles.weekLabelLight]}>
                Bu Hafta
              </Text>
            )}
            {weekOffset > 0 && (
              <Text style={[styles.weekLabel, isDark ? styles.weekLabelDark : styles.weekLabelLight]}>
                {weekOffset} hafta sonra
              </Text>
            )}
            {weekOffset < 0 && (
              <Text style={[styles.weekLabel, isDark ? styles.weekLabelDark : styles.weekLabelLight]}>
                {Math.abs(weekOffset)} hafta önce
              </Text>
            )}
          </View>
          <TouchableOpacity onPress={handleNextWeek} style={styles.weekButton}>
            <MaterialIcons name="chevron-right" size={28} color="#1193d4" />
          </TouchableOpacity>
        </View>
        
        {/* Legend */}
        <View style={[styles.legend, isDark ? styles.legendDark : styles.legendLight]}>
          <Text style={[styles.legendTitle, isDark ? styles.legendTitleDark : styles.legendTitleLight]}>
            Dokunarak Durum Seç:
          </Text>
          <View style={styles.legendItems}>
            <View style={styles.legendItem}>
              <View style={[styles.legendBox, styles.legendBoxAvailable]} />
              <Text style={[styles.legendText, isDark ? styles.legendTextDark : styles.legendTextLight]}>
                Müsaitim
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendBox, styles.legendBoxUnavailable]} />
              <Text style={[styles.legendText, isDark ? styles.legendTextDark : styles.legendTextLight]}>
                Müsait Değilim
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendBox, styles.legendBoxOffRequest]} />
              <Text style={[styles.legendText, isDark ? styles.legendTextDark : styles.legendTextLight]}>
                İzin Talebi
              </Text>
            </View>
          </View>
        </View>
        
        {/* Grid */}
        <View style={[styles.gridContainer, isDark ? styles.gridContainerDark : styles.gridContainerLight]}>
          <ShiftGrid grid={grid} onSlotPress={handleSlotPress} />
        </View>
        
        {/* Reset Button */}
        <TouchableOpacity 
          onPress={handleReset} 
          style={[styles.resetButton, isDark ? styles.resetButtonDark : styles.resetButtonLight]}
        >
          <MaterialIcons name="refresh" size={20} color={isDark ? '#f0f3f4' : '#111618'} />
          <Text style={[styles.resetButtonText, isDark ? styles.resetButtonTextDark : styles.resetButtonTextLight]}>
            Tercihleri Sıfırla
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerDark: {
    backgroundColor: '#101c22',
  },
  containerLight: {
    backgroundColor: '#f6f7f8',
  },
  header: {
    backgroundColor: '#1193d4',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  saveButton: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#1193d4',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: '#1193d4',
    fontSize: 14,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  weekNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  weekNavDark: {
    backgroundColor: '#1a2a33',
  },
  weekNavLight: {
    backgroundColor: '#ffffff',
  },
  weekButton: {
    padding: 8,
  },
  weekInfo: {
    alignItems: 'center',
    flex: 1,
  },
  weekText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  weekTextDark: {
    color: '#f0f3f4',
  },
  weekTextLight: {
    color: '#111618',
  },
  weekLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  weekLabelDark: {
    color: '#a0b8c4',
  },
  weekLabelLight: {
    color: '#617c89',
  },
  legend: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  legendDark: {
    backgroundColor: '#1a2a33',
  },
  legendLight: {
    backgroundColor: '#ffffff',
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  legendTitleDark: {
    color: '#f0f3f4',
  },
  legendTitleLight: {
    color: '#111618',
  },
  legendItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendBox: {
    width: 24,
    height: 24,
    borderRadius: 4,
  },
  legendBoxAvailable: {
    backgroundColor: '#078836',
  },
  legendBoxUnavailable: {
    backgroundColor: '#D9534F',
  },
  legendBoxOffRequest: {
    backgroundColor: '#9ca3af',
  },
  legendText: {
    fontSize: 12,
  },
  legendTextDark: {
    color: '#a0b8c4',
  },
  legendTextLight: {
    color: '#617c89',
  },
  gridContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  gridContainerDark: {
    backgroundColor: '#1a2a33',
  },
  gridContainerLight: {
    backgroundColor: '#ffffff',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
    marginBottom: 32,
  },
  resetButtonDark: {
    backgroundColor: '#1a2a33',
  },
  resetButtonLight: {
    backgroundColor: '#ffffff',
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  resetButtonTextDark: {
    color: '#f0f3f4',
  },
  resetButtonTextLight: {
    color: '#111618',
  },
});
