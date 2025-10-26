import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Modal } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getShiftRequests, type ShiftRequest } from '@/services/shift';
import { generateSchedule, approveSchedule, getManagerSchedule, type ScheduleResponse } from '@/services/schedule';
import { getWeekStart, formatWeekRange, formatDateISO } from '@/utils/shift-grid-helpers';
import { getUserSession } from '@/utils/storage';
import { getEmployees } from '@/services/employee';
import type { Employee } from '@/types';

// Time slots for pickers
const TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
  '20:00', '20:30', '21:00', '21:30', '22:00',
];

export default function ShiftReviewScreen() {
  const router = useRouter();

  // State
  const [weekOffset, setWeekOffset] = useState(1);
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(new Date());
  const [preferences, setPreferences] = useState<ShiftRequest[]>([]);
  const [schedule, setSchedule] = useState<ScheduleResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Edit mode state
  const [editMode, setEditMode] = useState(false);
  const [editedShifts, setEditedShifts] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  // Add/Edit modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [newShift, setNewShift] = useState({
    employee_id: '',
    day: 'monday',
    start_time: '09:00',
    end_time: '17:00',
  });
  const [activePicker, setActivePicker] = useState<'employee' | 'day' | 'start' | 'end' | null>(null);

  // Update week start when offset changes
  useEffect(() => {
    const today = new Date();
    const baseWeekStart = getWeekStart(today);
    baseWeekStart.setDate(baseWeekStart.getDate() + (weekOffset * 7));
    setCurrentWeekStart(baseWeekStart);
  }, [weekOffset]);

  // Load employees when modal opens (if not already loaded)
  useEffect(() => {
    if (showAddModal && employees.length === 0) {
      getEmployees().then(setEmployees).catch(console.error);
    }
  }, [showAddModal]);

  // Load preferences and schedule when week changes
  useEffect(() => {
    loadData();
  }, [currentWeekStart]);

  const loadData = async () => {
    try {
      setLoading(true);
      const weekStartStr = formatDateISO(currentWeekStart);

      // Load preferences and schedule in parallel
      const [prefsData, scheduleData] = await Promise.all([
        getShiftRequests(weekStartStr),
        getManagerSchedule(weekStartStr),
      ]);

      setPreferences(prefsData);
      setSchedule(scheduleData);

      // Exit edit mode if week changes
      if (editMode) {
        setEditMode(false);
        setEditedShifts([]);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      Alert.alert('Hata', 'Veriler yüklenemedi. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const handlePreviousWeek = () => {
    setWeekOffset(prev => prev - 1);
    // Loading will be triggered by useEffect when currentWeekStart changes
  };

  const handleNextWeek = () => {
    setWeekOffset(prev => prev + 1);
    // Loading will be triggered by useEffect when currentWeekStart changes
  };

  const handleGenerateSchedule = () => {
    // Check if there are any preferences
    if (preferences.length === 0) {
      Alert.alert(
        'Tercih Yok',
        'Henüz hiçbir çalışan tercih bildirmedi. AI shift planı oluşturmak için en az bir çalışanın tercih bildirmesi gerekiyor.'
      );
      return;
    }

    // Determine if this is regeneration
    const isRegenerate = !!schedule;
    const isApproved = schedule?.status === 'approved';

    // Build appropriate alert message
    const title = isRegenerate ? 'AI Planı Yeniden Oluştur' : 'AI Shift Oluştur';
    let message = `Llama AI kullanarak bu hafta için shift planı ${isRegenerate ? 'yeniden ' : ''}oluşturulsun mu?\n\n${preferences.length} çalışanın tercihleri ve notları analiz edilecek.\n\nBu işlem 30-60 saniye sürebilir.`;
    
    if (isApproved) {
      message += '\n\n⚠️ DİKKAT: Mevcut onaylanmış plan silinecek ve yeni plan oluşturulacak!';
    } else if (isRegenerate) {
      message += '\n\nMevcut plan silinecek ve yeni plan oluşturulacak.';
    }

    Alert.alert(
      title,
      message,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: isRegenerate ? 'Yeniden Oluştur' : 'Oluştur',
          style: isApproved ? 'destructive' : 'default',
          onPress: async () => {
            try {
              setGenerating(true);
              const weekStartStr = formatDateISO(currentWeekStart);
              const result = await generateSchedule(weekStartStr, isRegenerate); // forceRegenerate if exists
              setSchedule(result);
              
              // Exit edit mode if active
              if (editMode) {
                setEditMode(false);
                setEditedShifts([]);
              }
              
              Alert.alert(
                'Başarılı!',
                `AI shift planı ${isRegenerate ? 'yeniden ' : ''}oluşturuldu!\n\nToplam Shift: ${result.summary?.total_shifts || 0}\nToplam Saat: ${result.summary?.total_hours || 0}\nKapsama Skoru: ${((result.summary?.coverage_score || 0) * 100).toFixed(0)}%`
              );
            } catch (error) {
              Alert.alert('Hata', error instanceof Error ? error.message : 'Shift planı oluşturulamadı');
            } finally {
              setGenerating(false);
            }
          },
        },
      ]
    );
  };

  const handleApproveSchedule = () => {
    if (!schedule) {
      Alert.alert('Hata', 'Onaylanacak bir shift planı yok');
      return;
    }

    if (schedule.status === 'approved') {
      Alert.alert('Bilgi', 'Bu shift planı zaten onaylanmış');
      return;
    }

    Alert.alert(
      'Shift Planını Onayla',
      'Bu shift planını onaylayıp çalışanlara göndermek istediğinize emin misiniz?\n\nOnaylandıktan sonra çalışanlar kendi vardiyalarını görebilecek.',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Onayla ve Gönder',
          style: 'default',
          onPress: async () => {
            try {
              const updated = await approveSchedule(schedule.id);
              setSchedule(updated);
              Alert.alert('Başarılı', 'Shift planı onaylandı ve çalışanlara gönderildi!');
            } catch (error) {
              Alert.alert('Hata', error instanceof Error ? error.message : 'Shift planı onaylanamadı');
            }
          },
        },
      ]
    );
  };

  const handleEnterEditMode = () => {
    if (!schedule || !schedule.shifts) return;
    setEditedShifts([...schedule.shifts]); // Clone shifts for editing
    setEditMode(true);
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setEditedShifts([]);
  };

  const handleSaveChanges = async () => {
    if (!schedule) return;

    try {
      setSaving(true);

      // Get manager token from session
      const session = await getUserSession();
      if (!session || session.userType !== 'manager') {
        throw new Error('Yönetici oturumu bulunamadı');
      }

      const url = `${process.env.EXPO_PUBLIC_API_BASE_URL}/api/schedules/${schedule.id}/shifts`;

      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({ shifts: editedShifts }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Değişiklikler kaydedilemedi');
      }

      setSchedule(data.data);
      setEditMode(false);
      setEditedShifts([]);
      Alert.alert('Başarılı', 'Değişiklikler kaydedildi!');
    } catch (error) {
      Alert.alert('Hata', error instanceof Error ? error.message : 'Değişiklikler kaydedilemedi');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteShift = (index: number) => {
    setEditedShifts(prev => prev.filter((_, i) => i !== index));
  };

  // Helper: Calculate hours between times
  const calculateHours = (start: string, end: string): number => {
    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    return (endMinutes - startMinutes) / 60;
  };

  // Reset new shift form
  const resetNewShift = () => {
    setNewShift({
      employee_id: '',
      day: 'monday',
      start_time: '09:00',
      end_time: '17:00',
    });
    setEditingIndex(null);
  };

  // Open modal for adding new shift
  const handleOpenAddModal = () => {
    resetNewShift();
    setShowAddModal(true);
  };

  // Open modal for editing existing shift
  const handleEditShift = (index: number) => {
    const shift = editedShifts[index];
    setNewShift({
      employee_id: shift.employee_id,
      day: shift.day,
      start_time: shift.start_time,
      end_time: shift.end_time,
    });
    setEditingIndex(index);
    setShowAddModal(true);
  };

  // Add or update shift
  const handleSaveShiftModal = () => {
    if (!newShift.employee_id) {
      Alert.alert('Hata', 'Lütfen çalışan seçin');
      return;
    }

    const employee = employees.find(e => e.id === newShift.employee_id);
    if (!employee) {
      Alert.alert('Hata', 'Çalışan bulunamadı');
      return;
    }

    const hours = calculateHours(newShift.start_time, newShift.end_time);
    if (hours <= 0) {
      Alert.alert('Hata', 'Bitiş saati başlangıç saatinden sonra olmalıdır');
      return;
    }

    const shiftData = {
      employee_id: newShift.employee_id,
      employee_name: employee.full_name,
      job_description: employee.job_description || 'Çalışan',
      day: newShift.day,
      start_time: newShift.start_time,
      end_time: newShift.end_time,
      hours,
    };

    if (editingIndex !== null) {
      // Update existing shift
      setEditedShifts(prev => prev.map((s, i) => i === editingIndex ? shiftData : s));
    } else {
      // Add new shift
      setEditedShifts(prev => [...prev, shiftData]);
    }

    setShowAddModal(false);
    resetNewShift();
  };

  // Helper: Get Turkish day name
  const getDayName = (day: string): string => {
    const dayMap: Record<string, string> = {
      monday: 'Pazartesi',
      tuesday: 'Salı',
      wednesday: 'Çarşamba',
      thursday: 'Perşembe',
      friday: 'Cuma',
      saturday: 'Cumartesi',
      sunday: 'Pazar',
    };
    return dayMap[day.toLowerCase()] || day;
  };

  // Calculate current shifts dynamically (edit mode uses edited, view mode uses schedule)
  const currentShifts = editMode ? editedShifts : (schedule?.shifts || []);
  
  // 1. Toplam Shift: Kaç kişinin shifti var
  const uniqueEmployeesWithShifts = new Set(currentShifts.map(s => s.employee_id));
  const employeesWithShiftsCount = uniqueEmployeesWithShifts.size;
  
  // 2. Toplam Saat: Bu haftaya özel tüm kişilerin çalışma saatlerinin toplamı
  const calculatedTotalHours = currentShifts.reduce((sum, shift) => {
    const hours = shift.hours || calculateHours(shift.start_time, shift.end_time);
    return sum + hours;
  }, 0);
  
  // 3. Mağaza Doluluk: 7/24 çalışan yer - haftanın saatlerine göre doluluk
  const HOURS_PER_DAY = 24; // 7/24 çalışıyor
  const OPERATING_DAYS = 7; // Monday-Sunday
  const TOTAL_WEEK_HOURS = HOURS_PER_DAY * OPERATING_DAYS; // 168 hours (7×24)
  
  // Mağaza doluluk oranı: Toplam çalışılan saat / 168 saat
  const storeCoveragePercent = TOTAL_WEEK_HOURS > 0 
    ? (calculatedTotalHours / TOTAL_WEEK_HOURS) * 100 
    : 0;
  
  // 4. Toplam Ekip & Çalışan Katılım: Bu hafta kaç kişi çalıştı
  const totalActiveEmployees = employees.length > 0 ? employees.length : preferences.length;
  const employeeParticipationPercent = totalActiveEmployees > 0 
    ? (employeesWithShiftsCount / totalActiveEmployees) * 100
    : 0;

  // Advanced Metrics
  // Average hours per employee (who worked)
  const avgHoursPerEmployee = employeesWithShiftsCount > 0 
    ? calculatedTotalHours / employeesWithShiftsCount 
    : 0;
  
  // Average shifts per employee (who worked)
  const avgShiftsPerEmployee = employeesWithShiftsCount > 0 
    ? currentShifts.length / employeesWithShiftsCount 
    : 0;
  
  // Daily coverage - how many days have at least 1 shift
  const daysWithShifts = new Set(currentShifts.map(s => s.day.toLowerCase())).size;
  const dailyCoveragePercent = (daysWithShifts / 7) * 100;
  
  // Peak coverage - max simultaneous employees
  const shiftsPerDay = {
    monday: currentShifts.filter(s => s.day.toLowerCase() === 'monday').length,
    tuesday: currentShifts.filter(s => s.day.toLowerCase() === 'tuesday').length,
    wednesday: currentShifts.filter(s => s.day.toLowerCase() === 'wednesday').length,
    thursday: currentShifts.filter(s => s.day.toLowerCase() === 'thursday').length,
    friday: currentShifts.filter(s => s.day.toLowerCase() === 'friday').length,
    saturday: currentShifts.filter(s => s.day.toLowerCase() === 'saturday').length,
    sunday: currentShifts.filter(s => s.day.toLowerCase() === 'sunday').length,
  };
  const maxShiftsPerDay = Math.max(...Object.values(shiftsPerDay));
  const minShiftsPerDay = Math.min(...Object.values(shiftsPerDay).filter(v => v > 0), Infinity);
  const avgShiftsPerDay = currentShifts.length / daysWithShifts || 0;
  
  // Calculate stats for preferences
  const totalEmployees = preferences.length; // This would ideally come from employee count
  const submittedCount = preferences.filter(p => p.submitted_at).length;
  const submissionRate = totalEmployees > 0 ? (submittedCount / totalEmployees) * 100 : 0;

  if (loading && !schedule && preferences.length === 0) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#00cd81', '#004dd6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.header}
        >
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Shift İnceleme</Text>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1193d4" />
          <Text style={styles.loadingText}>Yükleniyor...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with Gradient */}
      <LinearGradient
        colors={['#00cd81', '#004dd6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Shift İnceleme</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Week Selector */}
        <View style={styles.weekSelector}>
          <TouchableOpacity style={styles.weekButton} onPress={handlePreviousWeek}>
            <MaterialIcons name="chevron-left" size={24} color="#1193d4" />
          </TouchableOpacity>
          <View style={styles.weekInfo}>
            <Text style={styles.weekText}>{formatWeekRange(currentWeekStart)}</Text>
            {weekOffset === 0 && <Text style={styles.weekSubtext}>Bu Hafta</Text>}
            {weekOffset > 0 && <Text style={styles.weekSubtext}>{weekOffset} hafta sonra</Text>}
            {weekOffset < 0 && <Text style={styles.weekSubtext}>{Math.abs(weekOffset)} hafta önce</Text>}
          </View>
          <TouchableOpacity style={styles.weekButton} onPress={handleNextWeek}>
            <MaterialIcons name="chevron-right" size={24} color="#1193d4" />
          </TouchableOpacity>
        </View>

        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <MaterialIcons
              name={submittedCount === 0 ? "pending-actions" : submissionRate === 100 ? "check-circle" : "pending-actions"}
              size={28}
              color={submittedCount === 0 ? "#9ca3af" : submissionRate === 100 ? "#078836" : "#F0AD4E"}
            />
            <View style={styles.statusTextContainer}>
              <Text style={styles.statusTitle}>
                {submittedCount === 0 ? 'Tercih Yok' : submissionRate === 100 ? 'Tüm Tercihler Alındı' : 'Tercih Durumu'}
              </Text>
              <Text style={styles.statusSubtitle}>
                {submittedCount}/{totalEmployees} çalışan tercih paylaştı
              </Text>
            </View>
          </View>
          <View style={styles.statusProgress}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${Math.round(submissionRate)}%` }]} />
            </View>
            <Text style={styles.progressText}>{Math.round(submissionRate)}%</Text>
          </View>
        </View>

        {/* Generating Indicator */}
        {generating && (
          <View style={styles.generatingCard}>
            <ActivityIndicator size="large" color="#00cd81" />
            <Text style={styles.generatingText}>AI shift planı oluşturuluyor...</Text>
            <Text style={styles.generatingSubtext}>Bu işlem 30-60 saniye sürebilir</Text>
          </View>
        )}

        {/* AI Generate Button - Always visible, smart behavior */}
        <TouchableOpacity
          style={styles.aiButton}
          onPress={handleGenerateSchedule}
          activeOpacity={0.8}
          disabled={generating || preferences.length === 0}
        >
          <LinearGradient
            colors={generating || preferences.length === 0 ? ['#9ca3af', '#6b7280'] : ['#00cd81', '#004dd6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.aiButtonGradient}
          >
            <MaterialIcons name="auto-awesome" size={28} color="#ffffff" />
            <View style={styles.aiButtonTextContainer}>
              <Text style={styles.aiButtonTitle}>
                {generating 
                  ? 'Oluşturuluyor...' 
                  : schedule 
                    ? 'AI ile Yeniden Oluştur' 
                    : 'AI ile Shift Oluştur'
                }
              </Text>
              <Text style={styles.aiButtonSubtitle}>
                {generating 
                  ? 'Lütfen bekleyin' 
                  : schedule
                    ? `Mevcut plan silinip yenisi oluşturulacak${schedule.status === 'approved' ? ' (Onaylı plan!)' : ''}`
                    : 'Llama AI tercihlerinizi analiz edecek'
                }
              </Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Schedule Summary (if generated) */}
        {schedule && schedule.summary && (
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <MaterialIcons name="analytics" size={24} color="#1193d4" />
              <Text style={styles.summaryTitle}>Shift Planı Özeti</Text>
              <View style={[
                styles.statusBadge,
                schedule.status === 'approved' ? styles.statusApproved : styles.statusGenerated
              ]}>
                <Text style={styles.statusBadgeText}>
                  {schedule.status === 'approved' ? 'ONAYLANDI' : 'OLUŞTURULDU'}
                </Text>
              </View>
            </View>

            <View style={styles.summaryStats}>
              <View style={styles.summaryStatItem}>
                <Text style={styles.summaryStatLabel}>Toplam Shift</Text>
                <Text style={styles.summaryStatValue}>{currentShifts.length}</Text>
                <Text style={styles.summaryStatSubtext}>
                  {employeesWithShiftsCount} kişi çalışıyor
                </Text>
              </View>
              <View style={styles.summaryStatItem}>
                <Text style={styles.summaryStatLabel}>Toplam Saat</Text>
                <Text style={styles.summaryStatValue}>{calculatedTotalHours.toFixed(1)}</Text>
                <Text style={styles.summaryStatSubtext}>
                  Bu hafta çalışılan saat
                </Text>
              </View>
              <View style={styles.summaryStatItem}>
                <Text style={styles.summaryStatLabel}>Mağaza Doluluk</Text>
                <Text style={styles.summaryStatValue}>
                  {storeCoveragePercent.toFixed(1)}%
                </Text>
                <Text style={styles.summaryStatSubtext}>
                  {calculatedTotalHours.toFixed(0)}h / {TOTAL_WEEK_HOURS}h (7×24)
                </Text>
              </View>
              <View style={styles.summaryStatItem}>
                <Text style={styles.summaryStatLabel}>Ekip Katılımı</Text>
                <Text style={styles.summaryStatValue}>
                  {employeeParticipationPercent.toFixed(0)}%
                </Text>
                <Text style={styles.summaryStatSubtext}>
                  {employeesWithShiftsCount}/{totalActiveEmployees} çalışan
                </Text>
              </View>
            </View>

            {schedule.summary.warnings && schedule.summary.warnings.length > 0 && (
              <View style={styles.warningsContainer}>
                <Text style={styles.warningsTitle}>⚠️ Uyarılar:</Text>
                {schedule.summary.warnings.map((warning, idx) => (
                  <Text key={idx} style={styles.warningText}>• {warning}</Text>
                ))}
              </View>
            )}

            {/* Advanced Metrics */}
            <View style={styles.advancedMetricsContainer}>
              <Text style={styles.advancedMetricsTitle}>📊 Detaylı İstatistikler</Text>
              
              <View style={styles.metricRow}>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Ortalama Saat/Çalışan</Text>
                  <Text style={styles.metricValue}>{avgHoursPerEmployee.toFixed(1)}h</Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Ortalama Shift/Çalışan</Text>
                  <Text style={styles.metricValue}>{avgShiftsPerEmployee.toFixed(1)}</Text>
                </View>
              </View>

              <View style={styles.metricRow}>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Günlük Kapsama</Text>
                  <Text style={styles.metricValue}>{dailyCoveragePercent.toFixed(0)}%</Text>
                  <Text style={styles.metricSubtext}>{daysWithShifts}/7 gün</Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Gün Başı Shift</Text>
                  <Text style={styles.metricValue}>{avgShiftsPerDay.toFixed(1)}</Text>
                  <Text style={styles.metricSubtext}>
                    Min: {minShiftsPerDay === Infinity ? 0 : minShiftsPerDay} | Max: {maxShiftsPerDay}
                  </Text>
                </View>
              </View>
            </View>

            {/* Employee Hours Distribution */}
            {schedule.summary.hours_per_employee && Object.keys(schedule.summary.hours_per_employee).length > 0 && (
              <View style={styles.employeeHoursContainer}>
                <Text style={styles.employeeHoursTitle}>👥 Çalışan Saat Dağılımı</Text>
                <Text style={styles.employeeHoursSubtitle}>
                  Her çalışanın bu haftaki çalışma saati ÷ max haftalık çalışma saati oranı
                </Text>
                {Object.entries(schedule.summary.hours_per_employee)
                  .sort(([, a], [, b]) => (b as number) - (a as number))
                  .map(([employeeId, hours], idx) => {
                    const shift = currentShifts.find(s => s.employee_id === employeeId);
                    const employee = employees.find(e => e.id === employeeId);
                    const employeeName = shift?.employee_name || employee?.full_name || `Çalışan ${idx + 1}`;
                    const hoursNum = hours as number;
                    
                    // Get employee max_weekly_hours
                    const maxWeeklyHours = employee?.max_weekly_hours || 40; // Default 40h
                    const usagePercent = maxWeeklyHours > 0 ? (hoursNum / maxWeeklyHours) * 100 : 0;
                    
                    // Bar shows usage percentage (capped at 100% for display)
                    const barPercentage = Math.min(usagePercent, 100);
                    
                    // Color based on usage percentage
                    const getBarColor = () => {
                      if (usagePercent > 100) return '#dc2626'; // Red - over limit
                      if (usagePercent > 90) return '#f59e0b'; // Orange - near limit
                      if (usagePercent > 75) return '#10b981'; // Green - good
                      return '#1193d4'; // Blue - low usage
                    };

                    const getStatusIcon = () => {
                      if (usagePercent > 100) return '🔴';
                      if (usagePercent > 90) return '🟡';
                      if (usagePercent > 75) return '🟢';
                      return '🔵';
                    };

                    return (
                      <View key={employeeId} style={styles.employeeHourRow}>
                        <View style={styles.employeeHourInfo}>
                          <Text style={styles.employeeHourName} numberOfLines={1}>
                            {getStatusIcon()} {employeeName}
                          </Text>
                          <Text style={styles.employeeHourLimit}>
                            {hoursNum}h / {maxWeeklyHours}h
                          </Text>
                        </View>
                        <View style={styles.employeeHourBarContainer}>
                          {/* Background 100% bar */}
                          <View style={styles.employeeHourBarBackground} />
                          {/* Filled bar based on usage */}
                          <View style={[
                            styles.employeeHourBar, 
                            { width: `${barPercentage}%`, backgroundColor: getBarColor() }
                          ]} />
                          {/* Percentage label on the bar */}
                          <Text style={styles.employeeHourBarLabel}>
                            {usagePercent.toFixed(0)}%
                          </Text>
                        </View>
                      </View>
                    );
                  })}
              </View>
            )}
          </View>
        )}

        {/* Weekly Calendar Grid - Show all employee shifts */}
        {schedule && schedule.shifts.length > 0 && (
          <View style={styles.calendarCard}>
            <View style={styles.calendarHeader}>
              <Text style={styles.calendarTitle}>📅 Haftalık Takvim</Text>
            </View>
            
            {/* Day Headers */}
            <View style={styles.calendarDayHeaders}>
              {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map((day, idx) => {
                const dayCount = currentShifts.filter(s => s.day.toLowerCase() === 
                  ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'][idx]
                ).length;
                
                return (
                  <View key={idx} style={styles.calendarDayHeader}>
                    <Text style={styles.calendarDayHeaderText}>{day}</Text>
                    <View style={styles.calendarDayHeaderBadge}>
                      <Text style={styles.calendarDayHeaderCount}>{dayCount}</Text>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Shifts Grid by Day */}
            <View style={styles.calendarGrid}>
              {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day, dayIndex) => {
                const dayShifts = currentShifts.filter(s => s.day.toLowerCase() === day).sort((a, b) => {
                  // Sort by start time
                  return a.start_time.localeCompare(b.start_time);
                });
                
                return (
                  <View key={day} style={styles.calendarDayColumn}>
                    {dayShifts.length > 0 ? (
                      dayShifts.map((shift, idx) => {
                        // Assign colors based on employee
                        const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#ef4444'];
                        const colorIndex = currentShifts.findIndex(s => s.employee_id === shift.employee_id) % colors.length;
                        const shiftColor = colors[colorIndex];
                        
                        return (
                          <View key={idx} style={[styles.calendarShiftItem, { backgroundColor: shiftColor + '15', borderLeftColor: shiftColor }]}>
                            <Text style={[styles.calendarShiftTime, { color: shiftColor }]}>
                              {shift.start_time} • {shift.hours || calculateHours(shift.start_time, shift.end_time)}h
                            </Text>
                            <Text style={styles.calendarShiftEmployee} numberOfLines={1}>
                              {shift.employee_name}
                            </Text>
                            <Text style={styles.calendarShiftJob} numberOfLines={1}>
                              {shift.job_description}
                            </Text>
                          </View>
                        );
                      })
                    ) : (
                      <View style={styles.calendarEmptyDay}>
                        <Text style={styles.calendarEmptyText}>—</Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Action Buttons */}
        {schedule && !editMode && (
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.secondaryButton} onPress={handleEnterEditMode}>
              <MaterialIcons name="edit" size={20} color="#1193d4" />
              <Text style={styles.secondaryButtonText}>Manuel Düzenle</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.primaryButton, schedule.status === 'approved' && styles.primaryButtonDisabled]}
              onPress={handleApproveSchedule}
              disabled={schedule.status === 'approved'}
            >
              <MaterialIcons name="check-circle" size={20} color="#ffffff" />
              <Text style={styles.primaryButtonText}>
                {schedule.status === 'approved' ? 'Onaylandı' : 'Onayla ve Gönder'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Edit Mode - Shift List */}
        {editMode && editedShifts.length > 0 && (
          <View style={styles.editContainer}>
            <View style={styles.editHeader}>
              <Text style={styles.editTitle}>Shift Düzenleme</Text>
              <Text style={styles.editSubtitle}>{editedShifts.length} shift</Text>
            </View>

            {editedShifts.map((shift, index) => (
              <View key={index} style={styles.shiftRow}>
                <View style={styles.shiftInfo}>
                  <Text style={styles.shiftEmployee}>
                    {shift.employee_name} - {shift.job_description || 'Çalışan'}
                  </Text>
                  <Text style={styles.shiftDetails}>
                    {getDayName(shift.day)} • {shift.start_time}-{shift.end_time}
                  </Text>
                </View>
                <View style={styles.shiftActions}>
                  <TouchableOpacity
                    onPress={() => handleEditShift(index)}
                    style={styles.iconButton}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <MaterialIcons name="edit" size={24} color="#1193d4" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDeleteShift(index)}
                    style={styles.iconButton}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <MaterialIcons name="delete" size={24} color="#D9534F" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            <TouchableOpacity
              onPress={handleOpenAddModal}
              style={styles.addShiftButton}
            >
              <MaterialIcons name="add-circle" size={24} color="#078836" />
              <Text style={styles.addShiftText}>Yeni Shift Ekle</Text>
            </TouchableOpacity>

            <View style={styles.editActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancelEdit}
                disabled={saving}
              >
                <Text style={styles.cancelButtonText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                onPress={handleSaveChanges}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <>
                    <MaterialIcons name="save" size={20} color="#ffffff" />
                    <Text style={styles.saveButtonText}>Kaydet</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Info Box */}
        <View style={styles.infoBox}>
          <MaterialIcons name="info" size={20} color="#1193d4" />
          <Text style={styles.infoText}>
            AI shift planı, çalışan tercihlerini, maksimum haftalık saatlerini, yönetici notlarını
            analiz ederek en adil ve verimli dağılımı oluşturur.
          </Text>
        </View>
      </ScrollView>

      {/* Add/Edit Shift Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setShowAddModal(false);
          setActivePicker(null);
          resetNewShift();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingIndex !== null ? 'Shift Düzenle' : 'Yeni Shift Ekle'}
            </Text>

            {/* Employee Selector */}
            <TouchableOpacity
              style={styles.selectorButton}
              onPress={() => setActivePicker('employee')}
            >
              <View style={styles.selectorLeft}>
                <Text style={styles.selectorLabel}>Çalışan</Text>
                <Text style={styles.selectorValue}>
                  {employees.find(e => e.id === newShift.employee_id)?.full_name || 'Seçin...'}
                </Text>
              </View>
              <MaterialIcons name="arrow-drop-down" size={24} color="#617c89" />
            </TouchableOpacity>

            {/* Day Selector */}
            <TouchableOpacity
              style={styles.selectorButton}
              onPress={() => setActivePicker('day')}
            >
              <View style={styles.selectorLeft}>
                <Text style={styles.selectorLabel}>Gün</Text>
                <Text style={styles.selectorValue}>{getDayName(newShift.day)}</Text>
              </View>
              <MaterialIcons name="arrow-drop-down" size={24} color="#617c89" />
            </TouchableOpacity>

            {/* Time Range */}
            <View style={styles.timeRow}>
              <TouchableOpacity
                style={styles.timeSelectorButton}
                onPress={() => setActivePicker('start')}
              >
                <Text style={styles.selectorLabel}>Başlangıç</Text>
                <Text style={styles.selectorValue}>{newShift.start_time}</Text>
                <MaterialIcons name="arrow-drop-down" size={20} color="#617c89" />
              </TouchableOpacity>

              <View style={styles.timeSeparator}>
                <MaterialIcons name="arrow-forward" size={20} color="#617c89" />
              </View>

              <TouchableOpacity
                style={styles.timeSelectorButton}
                onPress={() => setActivePicker('end')}
              >
                <Text style={styles.selectorLabel}>Bitiş</Text>
                <Text style={styles.selectorValue}>{newShift.end_time}</Text>
                <MaterialIcons name="arrow-drop-down" size={20} color="#617c89" />
              </TouchableOpacity>
            </View>

            {/* Active Picker */}
            {activePicker && (
              <View style={styles.activePickerContainer}>
                <View style={styles.pickerWrapper}>
                  {activePicker === 'employee' && (
                    <Picker
                      selectedValue={newShift.employee_id}
                      onValueChange={(value) => {
                        setNewShift({...newShift, employee_id: value});
                        setActivePicker(null);
                      }}
                      style={styles.picker}
                      itemStyle={styles.pickerItem}
                    >
                      <Picker.Item label="Seçin..." value="" color="#111618" />
                      {employees.map(emp => (
                        <Picker.Item
                          key={emp.id}
                          label={`${emp.full_name} (${emp.job_description || 'Çalışan'})`}
                          value={emp.id}
                          color="#111618"
                        />
                      ))}
                    </Picker>
                  )}

                  {activePicker === 'day' && (
                    <Picker
                      selectedValue={newShift.day}
                      onValueChange={(value) => {
                        setNewShift({...newShift, day: value});
                        setActivePicker(null);
                      }}
                      style={styles.picker}
                      itemStyle={styles.pickerItem}
                    >
                      <Picker.Item label="Pazartesi" value="monday" color="#111618" />
                      <Picker.Item label="Salı" value="tuesday" color="#111618" />
                      <Picker.Item label="Çarşamba" value="wednesday" color="#111618" />
                      <Picker.Item label="Perşembe" value="thursday" color="#111618" />
                      <Picker.Item label="Cuma" value="friday" color="#111618" />
                      <Picker.Item label="Cumartesi" value="saturday" color="#111618" />
                      <Picker.Item label="Pazar" value="sunday" color="#111618" />
                    </Picker>
                  )}

                  {activePicker === 'start' && (
                    <Picker
                      selectedValue={newShift.start_time}
                      onValueChange={(value) => {
                        setNewShift({...newShift, start_time: value});
                        setActivePicker(null);
                      }}
                      style={styles.picker}
                      itemStyle={styles.pickerItem}
                    >
                      {TIME_SLOTS.map(time => (
                        <Picker.Item key={time} label={time} value={time} color="#111618" />
                      ))}
                    </Picker>
                  )}

                  {activePicker === 'end' && (
                    <Picker
                      selectedValue={newShift.end_time}
                      onValueChange={(value) => {
                        setNewShift({...newShift, end_time: value});
                        setActivePicker(null);
                      }}
                      style={styles.picker}
                      itemStyle={styles.pickerItem}
                    >
                      {TIME_SLOTS.map(time => (
                        <Picker.Item key={time} label={time} value={time} color="#111618" />
                      ))}
                    </Picker>
                  )}
                </View>
                <TouchableOpacity
                  style={styles.pickerDoneButton}
                  onPress={() => setActivePicker(null)}
                >
                  <Text style={styles.pickerDoneText}>Tamam</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Modal Buttons */}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  setShowAddModal(false);
                  setActivePicker(null);
                  resetNewShift();
                }}
              >
                <Text style={styles.modalCancelButtonText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSaveButton}
                onPress={handleSaveShiftModal}
              >
                <Text style={styles.modalSaveButtonText}>
                  {editingIndex !== null ? 'Güncelle' : 'Ekle'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#617c89',
  },
  content: {
    padding: 20,
  },
  weekSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  weekButton: {
    padding: 8,
  },
  weekInfo: {
    alignItems: 'center',
  },
  weekText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111618',
  },
  weekSubtext: {
    fontSize: 12,
    color: '#617c89',
    marginTop: 2,
  },
  statusCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111618',
  },
  statusSubtitle: {
    fontSize: 14,
    color: '#617c89',
    marginTop: 2,
  },
  statusProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#F0AD4E',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#617c89',
    minWidth: 40,
  },
  generatingCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 32,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#00cd81',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  generatingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111618',
    marginTop: 16,
  },
  generatingSubtext: {
    fontSize: 14,
    color: '#617c89',
    marginTop: 4,
  },
  aiButton: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#00cd81',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  aiButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  aiButtonTextContainer: {
    flex: 1,
  },
  aiButtonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  aiButtonSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111618',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusGenerated: {
    backgroundColor: 'rgba(240, 173, 78, 0.2)',
  },
  statusApproved: {
    backgroundColor: 'rgba(7, 136, 54, 0.2)',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#078836',
  },
  summaryStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  summaryStatItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#f6f7f8',
    borderRadius: 12,
  },
  summaryStatLabel: {
    fontSize: 12,
    color: '#617c89',
    marginBottom: 4,
  },
  summaryStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111618',
  },
  summaryStatSubtext: {
    fontSize: 10,
    color: '#617c89',
    marginTop: 2,
  },
  warningsContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: 'rgba(240, 173, 78, 0.1)',
    borderRadius: 12,
  },
  warningsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#F0AD4E',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 13,
    color: '#617c89',
    marginLeft: 4,
    marginBottom: 4,
  },
  // Calendar Grid Styles
  calendarCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
  },
  calendarTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#111618',
    flex: 1,
  },
  calendarDayHeaders: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    gap: 4,
  },
  calendarDayHeader: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  calendarDayHeaderText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#374151',
    textTransform: 'uppercase',
  },
  calendarDayHeaderBadge: {
    backgroundColor: '#1193d4',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  calendarDayHeaderCount: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  calendarGrid: {
    flexDirection: 'row',
    gap: 6,
  },
  calendarDayColumn: {
    flex: 1,
    gap: 6,
  },
  calendarShiftItem: {
    borderLeftWidth: 3,
    borderRadius: 6,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  calendarShiftTime: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  calendarShiftEmployee: {
    fontSize: 11,
    fontWeight: '600',
    color: '#111618',
    marginBottom: 2,
  },
  calendarShiftJob: {
    fontSize: 9,
    color: '#6b7280',
  },
  calendarEmptyDay: {
    alignItems: 'center',
    paddingVertical: 16,
    opacity: 0.3,
  },
  calendarEmptyText: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 4,
  },
  // Advanced Metrics
  advancedMetricsContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  advancedMetricsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111618',
    marginBottom: 12,
  },
  metricRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  metricItem: {
    flex: 1,
    backgroundColor: '#f6f7f8',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 11,
    color: '#617c89',
    marginBottom: 4,
    textAlign: 'center',
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1193d4',
    marginBottom: 2,
  },
  metricSubtext: {
    fontSize: 9,
    color: '#617c89',
    textAlign: 'center',
  },
  // Employee Hours Distribution
  employeeHoursContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  employeeHoursTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111618',
    marginBottom: 4,
  },
  employeeHoursSubtitle: {
    fontSize: 11,
    color: '#617c89',
    marginBottom: 12,
  },
  employeeHourRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  employeeHourInfo: {
    width: 160,
  },
  employeeHourName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111618',
    marginBottom: 2,
  },
  employeeHourLimit: {
    fontSize: 10,
    color: '#617c89',
  },
  employeeHourBarContainer: {
    flex: 1,
    height: 28,
    position: 'relative',
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
  },
  employeeHourBarBackground: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#e5e7eb',
  },
  employeeHourBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#1193d4',
    borderRadius: 14,
  },
  employeeHourBarLabel: {
    position: 'absolute',
    right: 8,
    fontSize: 11,
    fontWeight: 'bold',
    color: '#111618',
    zIndex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#1193d4',
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1193d4',
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#078836',
    shadowColor: '#078836',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(17, 147, 212, 0.1)',
    padding: 16,
    borderRadius: 12,
    alignItems: 'flex-start',
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#1193d4',
    lineHeight: 20,
  },
  editContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  editHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  editTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111618',
  },
  editSubtitle: {
    fontSize: 14,
    color: '#617c89',
  },
  shiftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f6f7f8',
    borderRadius: 12,
    marginBottom: 8,
  },
  shiftInfo: {
    flex: 1,
  },
  shiftEmployee: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111618',
    marginBottom: 4,
  },
  shiftDetails: {
    fontSize: 13,
    color: '#617c89',
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
  editActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#9ca3af',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#617c89',
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#078836',
    shadowColor: '#078836',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  shiftActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    padding: 8,
  },
  addShiftButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(7, 136, 54, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(7, 136, 54, 0.3)',
    borderStyle: 'dashed',
    marginTop: 12,
    marginBottom: 16,
  },
  addShiftText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#078836',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111618',
    marginBottom: 24,
    textAlign: 'center',
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111618',
    marginBottom: 8,
    marginTop: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    backgroundColor: '#f6f7f8',
    overflow: 'hidden',
    marginBottom: 8,
  },
  picker: {
    height: 180,
    width: '100%',
  },
  pickerItem: {
    height: 120,
    fontSize: 18,
    color: '#111618',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 32,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#9ca3af',
    alignItems: 'center',
  },
  modalCancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#617c89',
  },
  modalSaveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#078836',
    alignItems: 'center',
    shadowColor: '#078836',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  modalSaveButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  selectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#f6f7f8',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 12,
  },
  selectorLeft: {
    flex: 1,
  },
  selectorLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#617c89',
    marginBottom: 4,
  },
  selectorValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111618',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  timeSelectorButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#f6f7f8',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  timeSeparator: {
    paddingHorizontal: 4,
  },
  activePickerContainer: {
    marginTop: 8,
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: '#f6f7f8',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
  },
  pickerWrapper: {
    backgroundColor: '#ffffff',
  },
  pickerDoneButton: {
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#1193d4',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  pickerDoneText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
  },
});
