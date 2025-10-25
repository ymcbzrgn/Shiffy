import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function UserSelectScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Logo Section */}
      <View style={styles.logoSection}>
        <View style={styles.logoCircle}>
          <Image 
            source={require('../../assets/images/shiffy-logo.png')} 
            style={styles.logoImage}
            resizeMode="contain"
          />
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
          <LinearGradient
            colors={['#00cd81', '#004dd6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.button}
          >
            <MaterialIcons name="admin-panel-settings" size={32} color="#ffffff" />
            <Text style={styles.buttonText}>Yönetici Girişi</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Employee Button */}
        <TouchableOpacity
          style={styles.buttonWrapper}
          onPress={() => router.push('/employee-login' as any)}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#00cd81', '#004dd6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.button}
          >
            <MaterialIcons name="person" size={32} color="#ffffff" />
            <Text style={styles.buttonText}>Çalışan Girişi</Text>
          </LinearGradient>
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
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#1193d4',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  logoImage: {
    width: 140,
    height: 140,
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
    marginBottom: 60,
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
  buttonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
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
