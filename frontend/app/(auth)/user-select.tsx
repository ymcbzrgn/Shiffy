import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

export default function UserSelectScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Logo Section */}
      <View style={styles.logoSection}>
        <View style={styles.logoCircle}>
          <MaterialIcons name="schedule" size={80} color="#1193d4" />
        </View>
        <Text style={styles.title}>Shiffy</Text>
        <Text style={styles.subtitle}>Akıllı Vardiya Yönetim Sistemi</Text>
      </View>

      {/* Buttons Section */}
      <View style={styles.buttonsSection}>
        {/* Manager Button */}
        <TouchableOpacity
          style={styles.buttonWrapper}
          onPress={() => router.push('/manager-login' as any)}
          activeOpacity={0.8}
        >
          <View style={[styles.button, styles.primaryButton]}>
            <MaterialIcons name="admin-panel-settings" size={32} color="#ffffff" />
            <Text style={styles.primaryButtonText}>Yönetici Girişi</Text>
          </View>
        </TouchableOpacity>

        {/* Employee Button */}
        <TouchableOpacity
          style={styles.buttonWrapper}
          onPress={() => router.push('/employee-login' as any)}
          activeOpacity={0.8}
        >
          <View style={[styles.button, styles.secondaryButton]}>
            <MaterialIcons name="person" size={32} color="#1193d4" />
            <Text style={styles.secondaryButtonText}>Çalışan Girişi</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2025 Golden Head - Shiffy v1.0</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f7f8',
    justifyContent: 'space-between',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  logoSection: {
    alignItems: 'center',
    marginTop: 40,
  },
  logoCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#E6F4FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#1193d4',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#111618',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#617c89',
    textAlign: 'center',
  },
  buttonsSection: {
    gap: 16,
  },
  buttonWrapper: {
    width: '100%',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    borderRadius: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButton: {
    backgroundColor: '#1193d4',
  },
  secondaryButton: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#1193d4',
  },
  primaryButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  secondaryButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1193d4',
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#617c89',
  },
});
