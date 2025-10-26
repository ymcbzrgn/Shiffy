import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Alert, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { logoutManager } from '@/services/auth';

export default function SettingsScreen() {
  const router = useRouter();
  
  const [storeName, setStoreName] = useState('Kahve Dükkanı');
  const [email, setEmail] = useState('yonetici@kahve.com');
  const [deadlineDay, setDeadlineDay] = useState(4); // Thursday (0=Mon, 4=Thu)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoApproval, setAutoApproval] = useState(false);

  const weekDays = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma'];

  const handleSave = () => {
    Alert.alert(
      'Ayarlar Kaydedildi',
      'Değişiklikler başarıyla kaydedildi.',
      [{ text: 'Tamam' }]
    );
  };

  const handleLogout = async () => {
    Alert.alert(
      'Çıkış Yap',
      'Çıkış yapmak istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Çıkış Yap',
          style: 'destructive',
          onPress: async () => {
            try {
              // Logout from Supabase and clear AsyncStorage
              await logoutManager();
              console.log('✅ Logout successful - both Supabase and AsyncStorage cleared');
              router.replace('/(auth)/user-select' as any);
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Hata', 'Çıkış yapılırken bir hata oluştu');
            }
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
        <Text style={styles.headerTitle}>Ayarlar</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Store Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mağaza Bilgileri</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mağaza Adı</Text>
            <TextInput
              style={styles.input}
              value={storeName}
              onChangeText={setStoreName}
              placeholder="Mağaza adını girin"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, styles.inputDisabled]}
              value={email}
              editable={false}
              placeholderTextColor="#9ca3af"
            />
            <Text style={styles.inputHint}>Email değiştirilemez</Text>
          </View>
        </View>

        {/* Shift Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shift Ayarları</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tercih Son Günü</Text>
            <Text style={styles.labelHint}>
              Çalışanların tercihlerini bildirmesi gereken son gün
            </Text>
            <View style={styles.daySelector}>
              {weekDays.map((day, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dayButton,
                    deadlineDay === index && styles.dayButtonActive,
                  ]}
                  onPress={() => setDeadlineDay(index)}
                >
                  <Text
                    style={[
                      styles.dayButtonText,
                      deadlineDay === index && styles.dayButtonTextActive,
                    ]}
                  >
                    {day.substring(0, 3)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.switchRow}>
            <View style={styles.switchInfo}>
              <Text style={styles.switchLabel}>Otomatik Onay</Text>
              <Text style={styles.switchHint}>
                AI shift planı otomatik onaylansın
              </Text>
            </View>
            <Switch
              value={autoApproval}
              onValueChange={setAutoApproval}
              trackColor={{ false: '#e5e7eb', true: '#00cd81' }}
              thumbColor={autoApproval ? '#ffffff' : '#f4f4f4'}
            />
          </View>
        </View>

        {/* Notification Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bildirimler</Text>
          
          <View style={styles.switchRow}>
            <View style={styles.switchInfo}>
              <Text style={styles.switchLabel}>Push Bildirimleri</Text>
              <Text style={styles.switchHint}>
                Yeni tercih ve güncellemelerden haberdar olun
              </Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#e5e7eb', true: '#00cd81' }}
              thumbColor={notificationsEnabled ? '#ffffff' : '#f4f4f4'}
            />
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <LinearGradient
            colors={['#00cd81', '#004dd6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.saveButtonGradient}
          >
            <MaterialIcons name="save" size={20} color="#ffffff" />
            <Text style={styles.saveButtonText}>Değişiklikleri Kaydet</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Danger Zone */}
        <View style={styles.dangerZone}>
          <Text style={styles.sectionTitle}>Tehlikeli Bölge</Text>
          
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <MaterialIcons name="logout" size={20} color="#D9534F" />
            <Text style={styles.logoutButtonText}>Çıkış Yap</Text>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>Shiffy v1.0.0</Text>
          <Text style={styles.appInfoText}>© 2025 Golden Head</Text>
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
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111618',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#617c89',
    marginBottom: 8,
  },
  labelHint: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 12,
  },
  input: {
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#111618',
    backgroundColor: '#ffffff',
  },
  inputDisabled: {
    backgroundColor: '#f6f7f8',
    color: '#9ca3af',
  },
  inputHint: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 4,
    fontStyle: 'italic',
  },
  daySelector: {
    flexDirection: 'row',
    gap: 8,
  },
  dayButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f6f7f8',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  dayButtonActive: {
    backgroundColor: '#1193d4',
    borderColor: '#1193d4',
  },
  dayButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#617c89',
  },
  dayButtonTextActive: {
    color: '#ffffff',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  switchInfo: {
    flex: 1,
    marginRight: 16,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111618',
    marginBottom: 4,
  },
  switchHint: {
    fontSize: 13,
    color: '#617c89',
  },
  saveButton: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#00cd81',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  dangerZone: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#fee2e2',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#fee2e2',
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#D9534F',
  },
  appInfo: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  appInfoText: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4,
  },
});
