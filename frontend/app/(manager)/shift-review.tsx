import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function ShiftReviewScreen() {
  const router = useRouter();
  const [selectedWeek, setSelectedWeek] = useState('2025-10-27'); // Mock week

  const handleGenerateSchedule = () => {
    Alert.alert(
      'AI Shift Oluştur',
      'Llama AI kullanarak bu hafta için shift planı oluşturulsun mu?\n\nTüm çalışan tercihleri ve notları analiz edilecek.',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Oluştur',
          onPress: () => {
            Alert.alert('Başarılı', 'AI shift planı oluşturuluyor... (Phase 7\'de tamamlanacak)');
          },
        },
      ]
    );
  };

  const handleApproveSchedule = () => {
    Alert.alert(
      'Shift Planını Onayla',
      'Bu shift planını onaylayıp çalışanlara göndermek istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Onayla ve Gönder',
          style: 'default',
          onPress: () => {
            Alert.alert('Başarılı', 'Shift planı onaylandı ve çalışanlara gönderildi!');
          },
        },
      ]
    );
  };

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
          <TouchableOpacity style={styles.weekButton}>
            <MaterialIcons name="chevron-left" size={24} color="#1193d4" />
          </TouchableOpacity>
          <View style={styles.weekInfo}>
            <Text style={styles.weekText}>27 Ekim - 2 Kasım 2025</Text>
            <Text style={styles.weekSubtext}>Hafta 44</Text>
          </View>
          <TouchableOpacity style={styles.weekButton}>
            <MaterialIcons name="chevron-right" size={24} color="#1193d4" />
          </TouchableOpacity>
        </View>

        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <MaterialIcons name="pending-actions" size={28} color="#F0AD4E" />
            <View style={styles.statusTextContainer}>
              <Text style={styles.statusTitle}>Bekleyen Tercihler</Text>
              <Text style={styles.statusSubtitle}>12 çalışandan 8'i tercih bildirdi</Text>
            </View>
          </View>
          <View style={styles.statusProgress}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '67%' }]} />
            </View>
            <Text style={styles.progressText}>67%</Text>
          </View>
        </View>

        {/* AI Generate Button */}
        <TouchableOpacity 
          style={styles.aiButton}
          onPress={handleGenerateSchedule}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#00cd81', '#004dd6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.aiButtonGradient}
          >
            <MaterialIcons name="auto-awesome" size={28} color="#ffffff" />
            <View style={styles.aiButtonTextContainer}>
              <Text style={styles.aiButtonTitle}>AI ile Shift Oluştur</Text>
              <Text style={styles.aiButtonSubtitle}>Llama AI tercihlerinizi analiz edecek</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <MaterialIcons name="people" size={32} color="#1193d4" />
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Çalışan</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialIcons name="schedule" size={32} color="#078836" />
            <Text style={styles.statNumber}>156</Text>
            <Text style={styles.statLabel}>Toplam Saat</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialIcons name="event" size={32} color="#F0AD4E" />
            <Text style={styles.statNumber}>7</Text>
            <Text style={styles.statLabel}>Gün</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.secondaryButton}>
            <MaterialIcons name="edit" size={20} color="#1193d4" />
            <Text style={styles.secondaryButtonText}>Manuel Düzenle</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={handleApproveSchedule}
          >
            <MaterialIcons name="check-circle" size={20} color="#ffffff" />
            <Text style={styles.primaryButtonText}>Onayla ve Gönder</Text>
          </TouchableOpacity>
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <MaterialIcons name="info" size={20} color="#1193d4" />
          <Text style={styles.infoText}>
            AI shift planı, çalışan tercihlerini, yönetici notlarını ve geçmiş performans 
            verilerini analiz ederek en adil ve verimli dağılımı oluşturur.
          </Text>
        </View>
      </ScrollView>
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
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
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
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111618',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#617c89',
    marginTop: 4,
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
});
