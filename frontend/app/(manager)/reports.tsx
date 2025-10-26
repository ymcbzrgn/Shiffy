import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { saveSalesReport, getWeeklySalesReports, type WeeklySalesData } from '@/services/sales-reports';
import { getWeekStart, formatWeekRange, formatDateISO } from '@/utils/shift-grid-helpers';

export default function SalesReportsScreen() {
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(getWeekStart(new Date()));
  const [weeklyData, setWeeklyData] = useState<WeeklySalesData | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state for today's entry
  const [todayRevenue, setTodayRevenue] = useState('');
  const [todayTransactions, setTodayTransactions] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadWeeklyData();
  }, [currentWeekStart]);

  const loadWeeklyData = async () => {
    try {
      setLoading(true);
      const weekStartStr = formatDateISO(currentWeekStart);
      const data = await getWeeklySalesReports(weekStartStr);
      setWeeklyData(data);

      // Load today's data if exists
      const today = formatDateISO(new Date());
      const todayReport = data?.daily_reports.find(r => r.report_date === today);
      if (todayReport) {
        setTodayRevenue(todayReport.total_revenue.toString());
        setTodayTransactions(todayReport.total_transactions.toString());
        setNotes(todayReport.notes || '');
      }
    } catch (error) {
      console.error('Failed to load weekly data:', error);
      Alert.alert('Hata', 'Veriler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToday = async () => {
    const revenue = parseFloat(todayRevenue);
    const transactions = parseInt(todayTransactions, 10);

    if (isNaN(revenue) || revenue < 0) {
      Alert.alert('Hata', 'Geçerli bir ciro miktarı giriniz');
      return;
    }

    if (isNaN(transactions) || transactions < 0) {
      Alert.alert('Hata', 'Geçerli bir satış sayısı giriniz');
      return;
    }

    try {
      setSaving(true);
      const today = formatDateISO(new Date());
      await saveSalesReport(today, revenue, transactions, notes || undefined);
      Alert.alert('Başarılı', 'Günlük rapor kaydedildi');
      await loadWeeklyData(); // Reload to show updated data
    } catch (error) {
      console.error('Failed to save report:', error);
      Alert.alert('Hata', 'Rapor kaydedilemedi');
    } finally {
      setSaving(false);
    }
  };

  const handlePreviousWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeekStart(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeekStart(newDate);
  };

  const handleThisWeek = () => {
    setCurrentWeekStart(getWeekStart(new Date()));
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <MaterialIcons name="assessment" size={28} color="#004dd6" />
        <Text style={styles.headerTitle}>Satış Raporları</Text>
      </View>

      {/* Today's Entry Form */}
      <View style={styles.entryCard}>
        <View style={styles.entryHeader}>
          <MaterialIcons name="edit" size={20} color="#10b981" />
          <Text style={styles.entryTitle}>Bugünün Raporu</Text>
        </View>

        <View style={styles.formRow}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Günlük Ciro (₺)</Text>
            <TextInput
              style={styles.input}
              value={todayRevenue}
              onChangeText={setTodayRevenue}
              placeholder="0.00"
              keyboardType="decimal-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Satış Sayısı</Text>
            <TextInput
              style={styles.input}
              value={todayTransactions}
              onChangeText={setTodayTransactions}
              placeholder="0"
              keyboardType="number-pad"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Notlar (Opsiyonel)</Text>
          <TextInput
            style={[styles.input, styles.notesInput]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Bugün hakkında notlar..."
            multiline
            numberOfLines={3}
          />
        </View>

        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSaveToday}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <MaterialIcons name="save" size={20} color="#ffffff" />
              <Text style={styles.saveButtonText}>Kaydet</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Week Navigation */}
      <View style={styles.weekNav}>
        <TouchableOpacity style={styles.weekNavButton} onPress={handlePreviousWeek}>
          <MaterialIcons name="chevron-left" size={24} color="#004dd6" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.weekNavCurrent} onPress={handleThisWeek}>
          <Text style={styles.weekNavText}>{formatWeekRange(currentWeekStart)}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.weekNavButton} onPress={handleNextWeek}>
          <MaterialIcons name="chevron-right" size={24} color="#004dd6" />
        </TouchableOpacity>
      </View>

      {/* Weekly Summary */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#004dd6" />
        </View>
      ) : weeklyData ? (
        <>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Haftalık Özet</Text>
            <View style={styles.summaryGrid}>
              <View style={styles.summaryItem}>
                <MaterialIcons name="attach-money" size={24} color="#10b981" />
                <Text style={styles.summaryLabel}>Toplam Ciro</Text>
                <Text style={styles.summaryValue}>
                  ₺{weeklyData.total_revenue.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                </Text>
              </View>

              <View style={styles.summaryItem}>
                <MaterialIcons name="shopping-cart" size={24} color="#3b82f6" />
                <Text style={styles.summaryLabel}>Toplam Satış</Text>
                <Text style={styles.summaryValue}>{weeklyData.total_transactions}</Text>
              </View>

              <View style={styles.summaryItem}>
                <MaterialIcons name="trending-up" size={24} color="#f59e0b" />
                <Text style={styles.summaryLabel}>Günlük Ortalama</Text>
                <Text style={styles.summaryValue}>
                  ₺{weeklyData.average_daily_revenue.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                </Text>
              </View>

              <View style={styles.summaryItem}>
                <MaterialIcons name="calendar-today" size={24} color="#8b5cf6" />
                <Text style={styles.summaryLabel}>Veri Girilen Gün</Text>
                <Text style={styles.summaryValue}>{weeklyData.days_with_data}/7</Text>
              </View>
            </View>
          </View>

          {/* Daily Breakdown */}
          {weeklyData.daily_reports.length > 0 && (
            <View style={styles.dailyCard}>
              <Text style={styles.dailyTitle}>Günlük Detaylar</Text>
              {weeklyData.daily_reports.map((report, index) => {
                const dayNames = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
                const date = new Date(report.report_date);
                const dayName = dayNames[date.getDay() === 0 ? 6 : date.getDay() - 1];
                const dayDate = date.getDate();

                return (
                  <View key={report.id} style={styles.dailyRow}>
                    <View style={styles.dailyDate}>
                      <Text style={styles.dailyDayName}>{dayName}</Text>
                      <Text style={styles.dailyDayNumber}>{dayDate}</Text>
                    </View>

                    <View style={styles.dailyData}>
                      <Text style={styles.dailyRevenue}>
                        ₺{report.total_revenue.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                      </Text>
                      <Text style={styles.dailyTransactions}>
                        {report.total_transactions} satış
                      </Text>
                    </View>

                    {report.notes && (
                      <View style={styles.dailyNotes}>
                        <MaterialIcons name="note" size={14} color="#9ca3af" />
                        <Text style={styles.dailyNotesText}>{report.notes}</Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          )}
        </>
      ) : (
        <View style={styles.emptyState}>
          <MaterialIcons name="inbox" size={64} color="#d1d5db" />
          <Text style={styles.emptyText}>Bu hafta için henüz veri yok</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  entryCard: {
    backgroundColor: '#ffffff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  entryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827',
  },
  notesInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#10b981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 8,
    marginTop: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  weekNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  weekNavButton: {
    padding: 8,
  },
  weekNavCurrent: {
    flex: 1,
    alignItems: 'center',
  },
  weekNavText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  summaryItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
    marginBottom: 4,
    textAlign: 'center',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  dailyCard: {
    backgroundColor: '#ffffff',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dailyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  dailyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  dailyDate: {
    width: 60,
    alignItems: 'center',
  },
  dailyDayName: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  dailyDayNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  dailyData: {
    flex: 1,
    marginLeft: 16,
  },
  dailyRevenue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#10b981',
    marginBottom: 2,
  },
  dailyTransactions: {
    fontSize: 14,
    color: '#6b7280',
  },
  dailyNotes: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 12,
  },
  dailyNotesText: {
    fontSize: 12,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
    marginTop: 12,
  },
});
