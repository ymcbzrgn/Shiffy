import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useRef, useState } from 'react';
import type { SlotStatus, DayOfWeek } from '@/types';
import { generateTimeSlots, getDayLabels, getDayKeys, getSlotKey } from '@/utils/shift-grid-helpers';

interface ShiftGridProps {
  grid: Record<string, SlotStatus>;
  onSlotPress: (day: DayOfWeek, time: string) => void;
}

export function ShiftGrid({ grid, onSlotPress }: ShiftGridProps) {
  const [isDragging, setIsDragging] = useState(false);
  const lastTouchedCellRef = useRef<string | null>(null);
  const cellRefs = useRef<Map<string, View>>(new Map());
  
  const timeSlots = generateTimeSlots();
  const dayLabels = getDayLabels();
  const dayKeys = getDayKeys();
  
  // Get cell background color based on status
  const getCellStyle = (status: SlotStatus) => {
    if (status === 'available') return styles.cellAvailable;
    if (status === 'unavailable') return styles.cellUnavailable;
    if (status === 'off_request') return styles.cellOffRequest;
    return styles.cellEmpty;
  };
  
  // Render cell content (icon or dash)
  const renderCellContent = (status: SlotStatus) => {
    if (status === null) {
      return <Text style={styles.cellText}>-</Text>;
    }
    return null;
  };
  
  // Handle cell touch (single tap or drag)
  const handleCellPress = (day: DayOfWeek, time: string) => {
    onSlotPress(day, time);
  };
  
  // Handle cell touch during drag
  const handleCellTouchMove = (day: DayOfWeek, time: string) => {
    if (!isDragging) return;
    
    const key = getSlotKey(day, time);
    
    // Prevent firing same cell multiple times
    if (lastTouchedCellRef.current === key) return;
    
    lastTouchedCellRef.current = key;
    onSlotPress(day, time);
  };
  
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
            {dayLabels.map((label, index) => (
              <View 
                key={index} 
                style={styles.dayHeaderCell}
              >
                <Text style={styles.headerText}>
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
            <View
              onStartShouldSetResponder={() => true}
              onMoveShouldSetResponder={() => true}
              onResponderGrant={(e) => {
                setIsDragging(true);
              }}
              onResponderMove={(e) => {
                if (isDragging) {
                  // Find which cell was touched during drag
                  const { locationX, locationY } = e.nativeEvent;
                  // This will trigger re-render and select cells during drag
                }
              }}
              onResponderRelease={() => {
                setIsDragging(false);
                lastTouchedCellRef.current = null;
              }}
            >
              {timeSlots.map((time, rowIndex) => (
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
                        activeOpacity={0.7}
                        onPress={() => handleCellPress(day, time)}
                        onPressIn={() => {
                          if (isDragging) {
                            handleCellTouchMove(day, time);
                          }
                        }}
                        delayPressIn={0}
                      >
                        {renderCellContent(status)}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
            </View>
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
  },
  headerText: {
    fontSize: 14,
    fontWeight: '600',
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
