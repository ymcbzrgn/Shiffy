import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useRef, useState, useCallback, useMemo } from 'react';
import type { SlotStatus, DayOfWeek } from '@/types';
import { generateTimeSlots, getDayLabels, getDayKeys, getSlotKey, countHoursByDayAndStatus } from '@/utils/shift-grid-helpers';

interface ShiftGridProps {
  grid: Record<string, SlotStatus>;
  onSlotPress: (day: DayOfWeek, time: string) => void;
  weekStart?: Date; // Optional: to display dates
  showHourSummary?: boolean; // Optional: to show hour counter
}

export function ShiftGrid({ grid, onSlotPress, weekStart, showHourSummary = false }: ShiftGridProps) {
  const lastTouchedCellRef = useRef<string | null>(null);
  const pressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const timeSlots = useMemo(() => generateTimeSlots(), []);
  const dayLabels = useMemo(() => getDayLabels(), []);
  const dayKeys = useMemo(() => getDayKeys(), []);
  
  // Calculate hours per day if summary is enabled
  const hoursByDay = useMemo(() => {
    if (!showHourSummary) return null;
    return countHoursByDayAndStatus(grid);
  }, [grid, showHourSummary]);
  
  // Format date for each day
  const getDayDate = useCallback((dayIndex: number): string => {
    if (!weekStart) return '';
    
    const date = new Date(weekStart);
    date.setDate(date.getDate() + dayIndex);
    
    const day = date.getDate();
    const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
    const month = months[date.getMonth()];
    
    return `${day} ${month}`;
  }, [weekStart]);
  
  // Get cell background color based on status
  const getCellStyle = useCallback((status: SlotStatus) => {
    if (status === 'available') return styles.cellAvailable;
    if (status === 'unavailable') return styles.cellUnavailable;
    if (status === 'off_request') return styles.cellOffRequest;
    return styles.cellEmpty;
  }, []);
  
  // Render cell content (icon or dash)
  const renderCellContent = useCallback((status: SlotStatus) => {
    if (status === null) {
      return <Text style={styles.cellText}>-</Text>;
    }
    return null;
  }, []);
  
  // Handle cell touch with debounce
  const handleCellPress = useCallback((day: DayOfWeek, time: string) => {
    const key = getSlotKey(day, time);
    
    // Prevent double-tap
    if (lastTouchedCellRef.current === key) {
      return;
    }
    
    lastTouchedCellRef.current = key;
    onSlotPress(day, time);
    
    // Clear after 100ms to allow next tap
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
    }
    pressTimerRef.current = setTimeout(() => {
      lastTouchedCellRef.current = null;
    }, 100);
  }, [onSlotPress]);
  
  return (
    <View>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.horizontalScroll}
      >
        <View>
          {/* Header Row */}
          <View style={styles.headerRow}>
            <View style={styles.timeHeaderCell}>
              <Text style={styles.headerText}>
                Saat
              </Text>
            </View>
            {dayLabels.map((label, index) => {
              const dateStr = getDayDate(index);
              const dayKey = dayKeys[index];
              const totalHours = hoursByDay ? 
                hoursByDay[dayKey].available + hoursByDay[dayKey].unavailable + hoursByDay[dayKey].offRequest : 0;
              
              return (
                <View 
                  key={index} 
                  style={styles.dayHeaderCell}
                >
                  {weekStart && (
                    <Text style={styles.dateText}>
                      {dateStr}
                    </Text>
                  )}
                  <Text style={styles.headerText}>
                    {label}
                  </Text>
                  {showHourSummary && totalHours > 0 && (
                    <View style={styles.hourBadge}>
                      <Text style={styles.hourBadgeText}>
                        {totalHours}s
                      </Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
          
          {/* Grid Rows */}
          <ScrollView 
            showsVerticalScrollIndicator={true}
            style={styles.verticalScroll}
          >
            {timeSlots.map((time) => (
              <View key={time} style={styles.gridRow}>
                {/* Time Label */}
                <View style={styles.timeCell}>
                  <Text style={styles.timeText}>
                    {time}
                  </Text>
                </View>
                
                {/* Day Cells */}
                {dayKeys.map((day) => {
                  const key = getSlotKey(day, time);
                  const status = grid[key];
                  
                  return (
                    <TouchableOpacity
                      key={key}
                      style={[styles.cell, getCellStyle(status)]}
                      activeOpacity={0.8}
                      onPress={() => handleCellPress(day, time)}
                      delayPressIn={0}
                      delayPressOut={0}
                    >
                      {renderCellContent(status)}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  horizontalScroll: {
    flex: 1,
  },
  verticalScroll: {
    maxHeight: 600,
  },
  headerRow: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: '#004dd6',
  },
  timeHeaderCell: {
    width: 70,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  dayHeaderCell: {
    width: 60,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    gap: 2,
  },
  dateText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#9ca3af',
  },
  headerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#617c89',
  },
  hourBadge: {
    backgroundColor: '#004dd6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 2,
  },
  hourBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
  },
  gridRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  timeCell: {
    width: 70,
    paddingVertical: 8,
    paddingHorizontal: 8,
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  timeText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    color: '#111618',
  },
  cell: {
    width: 60,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
  },
  cellAvailable: {
    backgroundColor: '#078836',
  },
  cellUnavailable: {
    backgroundColor: '#D9534F',
  },
  cellOffRequest: {
    backgroundColor: '#9ca3af',
  },
  cellEmpty: {
    backgroundColor: '#f3f4f6',
  },
  cellText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9ca3af',
  },
});
