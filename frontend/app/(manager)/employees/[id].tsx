// Employee Detail Screen - View and edit employee info + manager notes

import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Employee } from '../../../types';
import { getEmployeeById, updateEmployeeNotes, toggleEmployeeStatus } from '../../../services/employee';
import { Loading } from '../../../components/ui/Loading';

export default function EmployeeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [togglingStatus, setTogglingStatus] = useState(false);

  useEffect(() => {
    loadEmployee();
  }, [id]);

  const loadEmployee = async () => {
    try {
      setLoading(true);
      const data = await getEmployeeById(id);
      setEmployee(data);
      setNotes(data.manager_notes || '');
    } catch (error) {
      Alert.alert('Hata', 'Çalışan bilgileri yüklenemedi');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!employee) return;
    
    try {
      setSavingNotes(true);
      const updated = await updateEmployeeNotes(employee.id, notes);
      setEmployee(updated);
      Alert.alert('Başarılı', 'Notlar kaydedildi');
    } catch (error) {
      Alert.alert('Hata', 'Notlar kaydedilemedi');
    } finally {
      setSavingNotes(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!employee) return;
    
    const newStatus = employee.status === 'active' ? 'inactive' : 'active';
    const confirmMessage = newStatus === 'active' 
      ? 'Çalışanı aktif hale getirmek istediğinize emin misiniz?'
      : 'Çalışanı pasif hale getirmek istediğinize emin misiniz?';
    
    Alert.alert(
      'Durum Değiştir',
      confirmMessage,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Evet',
          onPress: async () => {
            try {
              setTogglingStatus(true);
              const updated = await toggleEmployeeStatus(employee.id);
              setEmployee(updated);
              Alert.alert('Başarılı', 'Durum güncellendi');
            } catch (error) {
              Alert.alert('Hata', 'Durum güncellenemedi');
            } finally {
              setTogglingStatus(false);
            }
          },
        },
      ]
    );
  };

  const getInitials = (name: string): string => {
    const words = name.split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'Hiç giriş yapmadı';
    
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    };
    return date.toLocaleDateString('tr-TR', options);
  };

  const formatDateTime = (dateString: string | null): string => {
    if (!dateString) return 'Hiç giriş yapmadı';
    
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return date.toLocaleDateString('tr-TR', options);
  };

  if (loading || !employee) {
    return <Loading />;
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Çalışan Detayları</Text>
      </View>

      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <View style={styles.profileInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials(employee.full_name)}</Text>
            </View>
            <View style={styles.nameContainer}>
              <Text style={styles.fullName}>{employee.full_name}</Text>
              <Text style={styles.username}>@{employee.username}</Text>
              <View style={styles.badgeContainer}>
                <View style={[
                  styles.statusBadge,
                  employee.status === 'active' ? styles.statusActive : styles.statusInactive
                ]}>
                  <MaterialIcons 
                    name={employee.status === 'active' ? 'check-circle' : 'block'} 
                    size={16} 
                    color={employee.status === 'active' ? '#078836' : '#9ca3af'} 
                  />
                  <Text style={[
                    styles.statusText,
                    employee.status === 'active' ? styles.statusTextActive : styles.statusTextInactive
                  ]}>
                    {employee.status === 'active' ? 'Aktif' : 'Pasif'}
                  </Text>
                </View>
                {employee.first_login && (
                  <View style={styles.firstLoginBadge}>
                    <MaterialIcons name="warning" size={16} color="#F0AD4E" />
                    <Text style={styles.firstLoginText}>İlk Giriş Bekleniyor</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
          <TouchableOpacity
            onPress={handleToggleStatus}
            disabled={togglingStatus}
            style={styles.toggleButton}
          >
            <MaterialIcons 
              name={employee.status === 'active' ? 'block' : 'check-circle'} 
              size={24} 
              color="#1193d4" 
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Personal Information */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <MaterialIcons name="person" size={20} color="#1193d4" />
          <Text style={styles.sectionTitle}>Kişisel Bilgiler</Text>
        </View>
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Ad Soyad</Text>
            <Text style={styles.infoValue}>{employee.full_name}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Kullanıcı Adı</Text>
            <Text style={styles.infoValue}>{employee.username}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Katılım Tarihi</Text>
            <Text style={styles.infoValue}>{formatDate(employee.created_at)}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Son Giriş</Text>
            <Text style={styles.infoValue}>{formatDateTime(employee.last_login)}</Text>
          </View>
        </View>
      </View>

      {/* Manager Notes */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <MaterialIcons name="notes" size={20} color="#1193d4" />
          <Text style={styles.sectionTitle}>Yönetici Notları</Text>
        </View>
        <TextInput
          style={styles.notesInput}
          value={notes}
          onChangeText={setNotes}
          placeholder="Çalışan hakkında notlarınızı buraya yazabilirsiniz..."
          placeholderTextColor="#9ca3af"
          multiline
          textAlignVertical="top"
        />
        <TouchableOpacity
          onPress={handleSaveNotes}
          disabled={savingNotes}
          style={[styles.saveButton, savingNotes && styles.saveButtonDisabled]}
        >
          <Text style={styles.saveButtonText}>
            {savingNotes ? 'Kaydediliyor...' : 'Notları Kaydet'}
          </Text>
        </TouchableOpacity>
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
    backgroundColor: '#1193d4',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  profileCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginTop: -20,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1193d4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  nameContainer: {
    marginLeft: 16,
    flex: 1,
  },
  fullName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111618',
  },
  username: {
    fontSize: 14,
    color: '#617c89',
    marginTop: 2,
  },
  badgeContainer: {
    flexDirection: 'row',
    marginTop: 8,
    flexWrap: 'wrap',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  statusActive: {
    backgroundColor: 'rgba(7, 136, 54, 0.1)',
  },
  statusInactive: {
    backgroundColor: 'rgba(156, 163, 175, 0.1)',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  statusTextActive: {
    color: '#078836',
  },
  statusTextInactive: {
    color: '#9ca3af',
  },
  firstLoginBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(240, 173, 78, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 4,
  },
  firstLoginText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F0AD4E',
    marginLeft: 4,
  },
  toggleButton: {
    backgroundColor: 'rgba(17, 147, 212, 0.1)',
    padding: 12,
    borderRadius: 12,
  },
  section: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111618',
    marginLeft: 8,
  },
  infoGrid: {
    gap: 16,
  },
  infoItem: {
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: 12,
    color: '#617c89',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111618',
  },
  notesInput: {
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: '#111618',
    minHeight: 120,
    backgroundColor: '#ffffff',
  },
  saveButton: {
    backgroundColor: '#1193d4',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
