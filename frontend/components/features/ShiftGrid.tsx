import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import type { SlotStatus, DayOfWeek } from '@/types';
import { generateTimeSlots, getDayLabels, getDayKeys, getSlotKey } from '@/utils/shift-grid-helpers';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface ShiftGridProps {
  grid: Record<string, SlotStatus>;
  onSlotPress: (day: DayOfWeek, time: string) => void;
}

export function ShiftGrid({ grid, onSlotPress }: ShiftGridProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const timeSlots = generateTimeSlots();
  const dayLabels = getDayLabels();
  const dayKeys = getDayKeys();
  
  // Get cell background color based on status
  const getCellStyle = (status: SlotStatus) => {
    if (status === 'available') return styles.cellAvailable;
    if (status === 'unavailable') return styles.cellUnavailable;
    if (status === 'off_request') return isDark ? styles.cellOffRequestDark : styles.cellOffRequestLight;
    return isDark ? styles.cellEmptyDark : styles.cellEmptyLight;
  };
  
  // Render cell content (icon or dash)
  const renderCellContent = (status: SlotStatus) => {
    if (status === null) {
      return <Text style={[styles.cellText, isDark ? styles.cellTextDark : styles.cellTextLight]}>-</Text>;
    }
    return null;
  };
  
  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.horizontalScroll}
    >
      <View>
        {/* Header Row */}
        <View style={styles.headerRow}>
          <View style={[styles.timeHeaderCell, isDark ? styles.headerDark : styles.headerLight]}>
            <Text style={[styles.headerText, isDark ? styles.headerTextDark : styles.headerTextLight]}>
              Saat
            </Text>
          </View>
          {dayLabels.map((label, index) => (
            <View 
              key={index} 
              style={[styles.dayHeaderCell, isDark ? styles.headerDark : styles.headerLight]}
            >
              <Text style={[styles.headerText, isDark ? styles.headerTextDark : styles.headerTextLight]}>
                {label}
              </Text>
            </View>
          ))}
        </View>
        
        {/* Grid Rows */}
        <ScrollView 
          showsVerticalScrollIndicator={true}
          style={styles.verticalScroll}
        >
          {timeSlots.map((time, rowIndex) => (
            <View key={time} style={styles.gridRow}>
              {/* Time Label */}
              <View style={[styles.timeCell, isDark ? styles.timeCellDark : styles.timeCellLight]}>
                <Text style={[styles.timeText, isDark ? styles.timeTextDark : styles.timeTextLight]}>
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
                    onPress={() => onSlotPress(day, time)}
                    style={[styles.cell, getCellStyle(status)]}
                    activeOpacity={0.7}
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
  );
}

const styles = StyleSheet.create({
  horizontalScroll: {
    flex: 1,
  },
  verticalScroll: {
    maxHeight: 600, // Limit height for scrolling
  },
  headerRow: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: '#1193d4',
  },
  timeHeaderCell: {
    width: 70,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayHeaderCell: {
    width: 60,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerDark: {
    backgroundColor: '#1a2a33',
  },
  headerLight: {
    backgroundColor: '#ffffff',
  },
  headerText: {
    fontSize: 14,
    fontWeight: '600',
  },
  headerTextDark: {
    color: '#a0b8c4',
  },
  headerTextLight: {
    color: '#617c89',
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
  },
  timeCellDark: {
    backgroundColor: '#1a2a33',
  },
  timeCellLight: {
    backgroundColor: '#ffffff',
  },
  timeText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  timeTextDark: {
    color: '#f0f3f4',
  },
  timeTextLight: {
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
  // Status colors
  cellAvailable: {
    backgroundColor: '#078836',
  },
  cellUnavailable: {
    backgroundColor: '#D9534F',
  },
  cellOffRequestLight: {
    backgroundColor: '#9ca3af',
  },
  cellOffRequestDark: {
    backgroundColor: '#6b7280',
  },
  cellEmptyLight: {
    backgroundColor: '#f3f4f6',
  },
  cellEmptyDark: {
    backgroundColor: '#374151',
  },
  cellText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cellTextDark: {
    color: '#a0b8c4',
  },
  cellTextLight: {
    color: '#9ca3af',
  },
});
