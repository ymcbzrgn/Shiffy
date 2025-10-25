// Employee Profile Screen - View personal info and settings

import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getUserSession, clearUserSession } from '../../utils/storage';

export default function EmployeeProfileScreen() {
  const router = useRouter();
  const [employee, setEmployee] = useState({
    id: '1',
    full_name: 'Çalışan',
    username: 'calisan',
    email: 'calisan@email.com',
    phone: '+90 555 123 4567',
    joined_date: '2025-01-15T10:00:00Z',
    last_login: '2025-10-25T09:30:00Z',
  });

  // Load user session on mount
  useEffect(() => {
    getUserSession().then(session => {
      if (session && session.userType === 'employee') {
        const emp = session.user as any;
        setEmployee({
          id: emp.id,
          full_name: emp.full_name || 'Çalışan',
          username: emp.username || 'calisan',
          email: `${emp.username}@email.com`,
          phone: '+90 555 123 4567',
          joined_date: emp.created_at || '2025-01-15T10:00:00Z',
          last_login: emp.last_login || new Date().toISOString(),
        });
      }
    });
  }, []);

  const getInitials = (name: string): string => {
    const words = name.split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    };
    return date.toLocaleDateString('tr-TR', options);
  };

  const handleChangePassword = () => {
    router.push({
      pathname: '/(auth)/employee-password-reset',
      params: { firstLogin: 'false' },
    } as any);
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
            // Clear AsyncStorage and redirect
            await clearUserSession();
            router.replace('/(auth)/user-select' as any);
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#00cd81', '#004dd6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => router.push('/(employee)/home' as any)} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profilim</Text>
      </LinearGradient>

      {/* Profile Section */}
      <View style={styles.profileSection}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(employee.full_name)}</Text>
          </View>
        </View>
        <Text style={styles.fullName}>{employee.full_name}</Text>
        <Text style={styles.username}>@{employee.username}</Text>
      </View>

      {/* Personal Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Kişisel Bilgiler</Text>
        
        <View style={styles.infoCard}>
          <View style={styles.infoItem}>
            <View style={styles.infoLabel}>
              <MaterialIcons name="person" size={20} color="#617c89" />
              <Text style={styles.infoLabelText}>Ad Soyad</Text>
            </View>
            <Text style={styles.infoValue}>{employee.full_name}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoItem}>
            <View style={styles.infoLabel}>
              <MaterialIcons name="alternate-email" size={20} color="#617c89" />
              <Text style={styles.infoLabelText}>Kullanıcı Adı</Text>
            </View>
            <Text style={styles.infoValue}>{employee.username}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoItem}>
            <View style={styles.infoLabel}>
              <MaterialIcons name="email" size={20} color="#617c89" />
              <Text style={styles.infoLabelText}>E-posta</Text>
            </View>
            <Text style={styles.infoValue}>{employee.email}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoItem}>
            <View style={styles.infoLabel}>
              <MaterialIcons name="phone" size={20} color="#617c89" />
              <Text style={styles.infoLabelText}>Telefon</Text>
            </View>
            <Text style={styles.infoValue}>{employee.phone}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoItem}>
            <View style={styles.infoLabel}>
              <MaterialIcons name="event" size={20} color="#617c89" />
              <Text style={styles.infoLabelText}>Katılım Tarihi</Text>
            </View>
            <Text style={styles.infoValue}>{formatDate(employee.joined_date)}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoItem}>
            <View style={styles.infoLabel}>
              <MaterialIcons name="login" size={20} color="#617c89" />
              <Text style={styles.infoLabelText}>Son Giriş</Text>
            </View>
            <Text style={styles.infoValue}>{formatDate(employee.last_login)}</Text>
          </View>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hesap İşlemleri</Text>

        <TouchableOpacity style={styles.actionButton} onPress={handleChangePassword}>
          <View style={styles.actionLeft}>
            <MaterialIcons name="lock" size={24} color="#1193d4" />
            <Text style={styles.actionText}>Şifre Değiştir</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color="#617c89" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <View style={styles.actionLeft}>
            <MaterialIcons name="notifications" size={24} color="#1193d4" />
            <Text style={styles.actionText}>Bildirim Ayarları</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color="#617c89" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <View style={styles.actionLeft}>
            <MaterialIcons name="dark-mode" size={24} color="#1193d4" />
            <Text style={styles.actionText}>Karanlık Mod</Text>
          </View>
          <View style={styles.switchPlaceholder}>
            <Text style={styles.switchText}>Yakında</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Logout */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <MaterialIcons name="logout" size={24} color="#ffffff" />
          <Text style={styles.logoutText}>Çıkış Yap</Text>
        </TouchableOpacity>
      </View>

      {/* App Info */}
      <View style={styles.appInfo}>
        <Text style={styles.appInfoText}>Shiffy v1.0.0</Text>
        <Text style={styles.appInfoText}>© 2025 Tüm hakları saklıdır</Text>
      </View>
    </ScrollView>
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
  profileSection: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#ffffff',
    marginBottom: 16,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#004dd6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#ffffff',
    shadowColor: '#004dd6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  avatarText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  fullName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111618',
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    color: '#617c89',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111618',
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  infoItem: {
    paddingVertical: 12,
  },
  infoLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoLabelText: {
    fontSize: 12,
    color: '#617c89',
    marginLeft: 8,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 16,
    color: '#111618',
    fontWeight: '600',
    marginLeft: 28,
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111618',
    marginLeft: 12,
  },
  switchPlaceholder: {
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  switchText: {
    fontSize: 12,
    color: '#617c89',
    fontWeight: '600',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D9534F',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#D9534F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginLeft: 12,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingBottom: 40,
  },
  appInfoText: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4,
  },
});
