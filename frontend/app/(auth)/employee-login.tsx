import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { employeeLogin } from '../../services/employee-auth';
import { setCurrentUser } from '../../utils/mock-storage';

export default function EmployeeLoginScreen() {
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    // Validation
    if (!username.trim()) {
      Alert.alert('Hata', 'Kullanıcı adını girin');
      return;
    }

    if (!password) {
      Alert.alert('Hata', 'Şifrenizi girin');
      return;
    }

    try {
      setLoading(true);
      const response = await employeeLogin(username.trim(), password);

      if (!response.success) {
        Alert.alert('Giriş Başarısız', response.message || 'Kullanıcı adı veya şifre hatalı');
        return;
      }

      // Store token and user data (mock for now)
      // await AsyncStorage.setItem('shiffy_access_token', response.token!);
      // await AsyncStorage.setItem('shiffy_user_type', 'employee');

      // Store user in mock storage (Phase 10'da AsyncStorage olacak)
      if (response.employee) {
        setCurrentUser({
          id: response.employee.id,
          full_name: response.employee.full_name,
          username: response.employee.username,
          email: `${response.employee.username}@email.com`, // Mock email
          user_type: 'employee',
        });
      }

      // Check if first login
      if (response.employee?.first_login) {
        Alert.alert(
          'İlk Giriş',
          'Güvenliğiniz için şifrenizi değiştirmeniz gerekmektedir.',
          [
            {
              text: 'Tamam',
              onPress: () => router.push('/(auth)/employee-password-reset' as any),
            },
          ]
        );
      } else {
        // Navigate to employee home
        Alert.alert('Hoş Geldiniz', `Merhaba ${response.employee?.full_name}!`, [
          {
            text: 'Tamam',
            onPress: () => {
              router.replace('/(employee)/home' as any);
            },
          },
        ]);
      }
    } catch (error) {
      Alert.alert('Hata', 'Giriş sırasında bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Back Button */}
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#617c89" />
        </TouchableOpacity>

        {/* Logo & Title */}
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>S</Text>
          </View>
          <Text style={styles.title}>Çalışan Girişi</Text>
          <Text style={styles.subtitle}>Kullanıcı adı ve şifrenizle giriş yapın</Text>
        </View>

        {/* Login Form */}
        <View style={styles.form}>
          {/* Username Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Kullanıcı Adı</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={username}
                onChangeText={setUsername}
                placeholder="kullanici.adi"
                placeholderTextColor="#9ca3af"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
              <MaterialIcons
                name="person"
                size={20}
                color="#617c89"
                style={styles.inputIcon}
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Şifre</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor="#9ca3af"
                secureTextEntry={!showPassword}
                editable={!loading}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.inputIcon}
              >
                <MaterialIcons
                  name={showPassword ? 'visibility-off' : 'visibility'}
                  size={20}
                  color="#617c89"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
          >
            <Text style={styles.loginButtonText}>
              {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
            </Text>
          </TouchableOpacity>

          {/* Back to User Select */}
          <TouchableOpacity
            onPress={() => router.back()}
            disabled={loading}
            style={styles.backToSelectButton}
          >
            <Text style={styles.backToSelectText}>Geri Dön</Text>
          </TouchableOpacity>
        </View>

        {/* Test Credentials Info */}
        <View style={styles.testInfo}>
          <Text style={styles.testInfoTitle}>Test Kullanıcıları:</Text>
          <Text style={styles.testInfoText}>ahmet.ergun / Password123!</Text>
          <Text style={styles.testInfoText}>zeynep.yilmaz / Shf9kL2pQx (İlk giriş)</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f7f8',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: 8,
    marginBottom: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#1193d4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  logoText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111618',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#617c89',
    textAlign: 'center',
  },
  form: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#617c89',
    marginBottom: 8,
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    paddingRight: 48,
    fontSize: 16,
    color: '#111618',
    backgroundColor: '#ffffff',
  },
  inputIcon: {
    position: 'absolute',
    right: 16,
    top: 16,
  },
  loginButton: {
    backgroundColor: '#1193d4',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#1193d4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backToSelectButton: {
    borderWidth: 2,
    borderColor: '#e5e7eb',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
    backgroundColor: '#ffffff',
  },
  backToSelectText: {
    color: '#617c89',
    fontSize: 16,
    fontWeight: '600',
  },
  testInfo: {
    backgroundColor: 'rgba(17, 147, 212, 0.1)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(17, 147, 212, 0.2)',
  },
  testInfoTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1193d4',
    marginBottom: 8,
  },
  testInfoText: {
    fontSize: 11,
    color: '#617c89',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginBottom: 4,
  },
});
