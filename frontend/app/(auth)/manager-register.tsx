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
import { PasswordStrengthIndicator } from '../../components/ui/PasswordStrengthIndicator';
import { 
  validateEmail, 
  validatePassword, 
  validateRequired,
  validatePasswordMatch,
  calculatePasswordStrength 
} from '../../utils/validation';
import { registerManager } from '../../services/auth';
import { saveUserSession } from '../../utils/storage';

const { width, height } = Dimensions.get('window');
const isSmallDevice = width < 375;

export default function ManagerRegisterScreen() {
  const router = useRouter();
  const storeNameInputRef = useRef<TextInput>(null);
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const confirmPasswordInputRef = useRef<TextInput>(null);
  
  const [form, setForm] = useState({
    storeName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const passwordStrength = calculatePasswordStrength(form.password);

  const handleRegister = async () => {
    // Validate
    const storeNameError = validateRequired(form.storeName, 'İşletme adı');
    const emailError = validateEmail(form.email);
    const passwordError = validatePassword(form.password);
    const confirmError = validatePasswordMatch(form.password, form.confirmPassword);
    
    if (storeNameError || emailError || passwordError || confirmError) {
      setErrors({
        storeName: storeNameError || '',
        email: emailError || '',
        password: passwordError || '',
        confirmPassword: confirmError || '',
      });
      return;
    }
    
    setErrors({});
    setLoading(true);
    
    try {
      const { manager, token } = await registerManager(
        form.storeName,
        form.email,
        form.password
      );

      // Store user session
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
      Alert.alert('Kayıt Başarılı', `Hoş geldiniz ${manager.store_name}!`, [
        {
          text: 'Tamam',
          onPress: () => {
            router.replace('/(manager)/dashboard' as any);
          },
        },
      ]);
    } catch (error) {
      Alert.alert('Hata', error instanceof Error ? error.message : 'Kayıt başarısız');
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
          <Text style={styles.title}>Yönetici Kaydı</Text>
          <Text style={styles.subtitle}>Shift yönetim hesabınızı oluşturun</Text>
        </View>

        {/* Register Form */}
        <View style={styles.form}>
          {/* Store Name Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>İşletme Adı</Text>
            <View style={styles.inputContainer}>
              <TextInput
                ref={storeNameInputRef}
                style={[styles.input, errors.storeName && styles.inputError]}
                value={form.storeName}
                onChangeText={(text) => setForm({ ...form, storeName: text })}
                placeholder="Örn: Kahve Dükkanı"
                placeholderTextColor="#9ca3af"
                autoCapitalize="words"
                returnKeyType="next"
                onSubmitEditing={() => emailInputRef.current?.focus()}
                editable={!loading}
              />
            </View>
            {errors.storeName && (
              <Text style={styles.errorText}>{errors.storeName}</Text>
            )}
          </View>

          {/* Email Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputContainer}>
              <TextInput
                ref={emailInputRef}
                style={[styles.input, errors.email && styles.inputError]}
                value={form.email}
                onChangeText={(text) => setForm({ ...form, email: text })}
                placeholder="ornek@isletme.com"
                placeholderTextColor="#9ca3af"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
                onSubmitEditing={() => passwordInputRef.current?.focus()}
                editable={!loading}
              />
            </View>
            {errors.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}
          </View>

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Şifre</Text>
            <View style={styles.inputContainer}>
              <TextInput
                ref={passwordInputRef}
                style={[styles.input, errors.password && styles.inputError]}
                value={form.password}
                onChangeText={(text) => setForm({ ...form, password: text })}
                placeholder="En az 6 karakter"
                placeholderTextColor="#9ca3af"
                secureTextEntry={!showPassword}
                returnKeyType="next"
                onSubmitEditing={() => confirmPasswordInputRef.current?.focus()}
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
            {errors.password && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}
            {form.password.length > 0 && (
              <PasswordStrengthIndicator strength={passwordStrength} />
            )}
          </View>

          {/* Confirm Password Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Şifre Tekrar</Text>
            <View style={styles.inputContainer}>
              <TextInput
                ref={confirmPasswordInputRef}
                style={[styles.input, errors.confirmPassword && styles.inputError]}
                value={form.confirmPassword}
                onChangeText={(text) => setForm({ ...form, confirmPassword: text })}
                placeholder="Şifrenizi tekrar girin"
                placeholderTextColor="#9ca3af"
                secureTextEntry={!showConfirmPassword}
                returnKeyType="done"
                onSubmitEditing={handleRegister}
                editable={!loading}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.inputIcon}
              >
                <MaterialIcons
                  name={showConfirmPassword ? 'visibility-off' : 'visibility'}
                  size={20}
                  color="#617c89"
                />
              </TouchableOpacity>
            </View>
            {errors.confirmPassword && (
              <Text style={styles.errorText}>{errors.confirmPassword}</Text>
            )}
          </View>

          {/* Register Button */}
          <TouchableOpacity
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={loading ? ['#9ca3af', '#9ca3af'] : ['#00cd81', '#004dd6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.registerButton}
            >
              <Text style={styles.registerButtonText}>
                {loading ? 'Kayıt Ediliyor...' : 'Kayıt Ol'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Login Link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Zaten hesabınız var mı? </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.link}>Giriş Yap</Text>
            </TouchableOpacity>
          </View>
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
    marginBottom: height * 0.02,
  },
  logoImage: {
    width: 120,
    height: 120,
  },
  title: {
    fontSize: isSmallDevice ? 22 : 24,
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
  registerButton: {
    paddingVertical: height * 0.02,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: height * 0.01,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  registerButtonText: {
    color: '#ffffff',
    fontSize: isSmallDevice ? 15 : 16,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: height * 0.025,
  },
  footerText: {
    fontSize: isSmallDevice ? 13 : 14,
    color: '#617c89',
  },
  link: {
    fontSize: isSmallDevice ? 13 : 14,
    color: '#1193d4',
    fontWeight: '600',
  },
});
