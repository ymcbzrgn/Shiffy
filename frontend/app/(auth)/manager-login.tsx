import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  StyleSheet, 
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { validateEmail, validatePassword } from '../../utils/validation';
import { loginManager } from '../../services/auth';
import { saveUserSession } from '../../utils/storage';
import { clearToken } from '../../services/api-client';

const { width, height } = Dimensions.get('window');
const isSmallDevice = width < 375;

export default function ManagerLoginScreen() {
  const router = useRouter();
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  
  const [form, setForm] = useState({
    email: '',
    password: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleEmailChange = (text: string) => {
    setForm(prev => ({ ...prev, email: text }));
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: '' }));
    }
  };

  const handlePasswordChange = (text: string) => {
    setForm(prev => ({ ...prev, password: text }));
    if (errors.password) {
      setErrors(prev => ({ ...prev, password: '' }));
    }
  };

  const handleLogin = async () => {
    // Validate
    const emailError = validateEmail(form.email);
    const passwordError = validatePassword(form.password);
    
    if (emailError || passwordError) {
      setErrors({
        email: emailError || '',
        password: passwordError || '',
      });
      return;
    }
    
    setErrors({});
    setLoading(true);
    
    try {
      // CRITICAL: Clear employee token BEFORE any API calls
      // This prevents stale employee tokens from being used
      console.log('[Manager Login] Clearing any existing employee tokens...');
      await clearToken();
      console.log('[Manager Login] ✅ Tokens cleared, proceeding with Supabase login');

      const { manager, token } = await loginManager(form.email, form.password);

      // Store user session in AsyncStorage
      await saveUserSession({
        user: {
          id: manager.id,
          email: manager.email,
          store_name: manager.store_name,
          created_at: manager.created_at,
          subscription_status: manager.subscription_status,
          subscription_tier: manager.subscription_tier,
        },
        userType: 'manager',
        accessToken: token,
      });
      
      // Navigate to manager dashboard
      Alert.alert('Hoş Geldiniz', `Merhaba ${manager.store_name}!`, [
        {
          text: 'Tamam',
          onPress: () => {
            router.replace('/(manager)/dashboard' as any);
          },
        },
      ]);
    } catch (error) {
      Alert.alert('Hata', error instanceof Error ? error.message : 'Giriş başarısız');
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
        showsVerticalScrollIndicator={false}
      >
        {/* Back Button */}
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#617c89" />
        </TouchableOpacity>

        {/* Logo & Title */}
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <Image 
              source={require('../../assets/images/shiffy-logo.png')} 
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.title}>Yönetici Girişi</Text>
          <Text style={styles.subtitle}>Email ve şifrenizle giriş yapın</Text>
        </View>

        {/* Login Form */}
        <View style={styles.form}>
          {/* Email Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputContainer}>
              <TextInput
                ref={emailInputRef}
                style={[styles.input, errors.email && styles.inputError]}
                defaultValue=""
                onChangeText={handleEmailChange}
                placeholder="ornek@isletme.com"
                placeholderTextColor="#9ca3af"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                textContentType="emailAddress"
                returnKeyType="next"
                onSubmitEditing={() => passwordInputRef.current?.focus()}
                editable={!loading}
              />
              <MaterialIcons
                name="email"
                size={20}
                color="#617c89"
                style={styles.inputIcon}
                pointerEvents="none"
              />
            </View>
            {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
          </View>

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Şifre</Text>
            <View style={styles.inputContainer}>
              <TextInput
                ref={passwordInputRef}
                style={[styles.input, errors.password && styles.inputError]}
                defaultValue=""
                onChangeText={handlePasswordChange}
                placeholder="••••••••"
                placeholderTextColor="#9ca3af"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="password"
                textContentType="password"
                returnKeyType="done"
                onSubmitEditing={handleLogin}
                editable={!loading}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.inputIcon}
              >
                <MaterialIcons
                  name={showPassword ? 'visibility' : 'visibility-off'}
                  size={20}
                  color="#617c89"
                />
              </TouchableOpacity>
            </View>
            {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
          </View>

          {/* Login Button */}
          <TouchableOpacity
            onPress={handleLogin}
            style={[styles.loginButtonContainer, loading && styles.loginButtonDisabled]}
            disabled={loading}
          >
            <LinearGradient
              colors={['#00cd81', '#004dd6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.loginButton}
            >
              <Text style={styles.loginButtonText}>
                {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Register Link */}
          <TouchableOpacity
            onPress={() => router.push('/(auth)/manager-register' as any)}
            style={styles.registerButton}
          >
            <Text style={styles.registerText}>
              Hesabınız yok mu? <Text style={styles.registerLink}>Kayıt Ol</Text>
            </Text>
          </TouchableOpacity>

          {/* Back to Select Button */}
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backToSelectButton}
          >
            <Text style={styles.backToSelectText}>Giriş Türü Seç</Text>
          </TouchableOpacity>
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
    padding: width * 0.05,
    paddingTop: height * 0.06,
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: 8,
    marginBottom: height * 0.02,
  },
  header: {
    alignItems: 'center',
    marginBottom: height * 0.04,
  },
  logoCircle: {
    width: width * 0.24,
    height: width * 0.24,
    maxWidth: 100,
    maxHeight: 100,
    borderRadius: width * 0.12,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: height * 0.02,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  logoImage: {
    width: '80%',
    height: '80%',
  },
  logoText: {
    fontSize: isSmallDevice ? 40 : 48,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  title: {
    fontSize: isSmallDevice ? 24 : 28,
    fontWeight: 'bold',
    color: '#111618',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: isSmallDevice ? 13 : 14,
    color: '#617c89',
    textAlign: 'center',
    paddingHorizontal: width * 0.1,
  },
  form: {
    marginBottom: height * 0.02,
  },
  inputGroup: {
    marginBottom: height * 0.025,
  },
  label: {
    fontSize: isSmallDevice ? 13 : 14,
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
    paddingVertical: height * 0.018,
    paddingHorizontal: 16,
    paddingRight: 48,
    fontSize: isSmallDevice ? 15 : 16,
    color: '#111618',
    backgroundColor: '#ffffff',
  },
  inputError: {
    borderColor: '#D9534F',
  },
  inputIcon: {
    position: 'absolute',
    right: 16,
    top: '50%',
    marginTop: -10,
  },
  errorText: {
    fontSize: 12,
    color: '#D9534F',
    marginTop: 4,
  },
  loginButtonContainer: {
    marginTop: height * 0.01,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButton: {
    paddingVertical: height * 0.02,
    alignItems: 'center',
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: isSmallDevice ? 15 : 16,
    fontWeight: 'bold',
  },
  registerButton: {
    alignItems: 'center',
    marginTop: height * 0.025,
  },
  registerText: {
    fontSize: isSmallDevice ? 13 : 14,
    color: '#617c89',
  },
  registerLink: {
    color: '#1193d4',
    fontWeight: '600',
  },
  backToSelectButton: {
    borderWidth: 2,
    borderColor: '#e5e7eb',
    paddingVertical: height * 0.018,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: height * 0.015,
    backgroundColor: '#ffffff',
  },
  backToSelectText: {
    color: '#617c89',
    fontSize: isSmallDevice ? 15 : 16,
    fontWeight: '600',
  },
});
