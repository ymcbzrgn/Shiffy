// Employee Password Reset/Change Screen

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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { employeeChangePassword } from '../../services/employee-auth';
import { validatePassword, getPasswordStrength } from '../../utils/validation';

export default function EmployeePasswordResetScreen() {
  const router = useRouter();
  const { firstLogin } = useLocalSearchParams<{ firstLogin?: string }>();
  
  const isFirstLogin = firstLogin === 'true';

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const passwordStrength = getPasswordStrength(newPassword);

  const handleChangePassword = async () => {
    // Validation
    if (!isFirstLogin && !currentPassword) {
      Alert.alert('Hata', 'Mevcut şifrenizi girin');
      return;
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      Alert.alert('Geçersiz Şifre', passwordError);
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Hata', 'Yeni şifreler eşleşmiyor');
      return;
    }

    if (passwordStrength < 2) {
      Alert.alert('Zayıf Şifre', 'Lütfen daha güçlü bir şifre seçin');
      return;
    }

    try {
      setLoading(true);
      const response = await employeeChangePassword(
        currentPassword,
        newPassword,
        isFirstLogin
      );

      if (!response.success) {
        Alert.alert('Hata', response.message);
        return;
      }

      Alert.alert('Başarılı', 'Şifreniz değiştirildi', [
        {
          text: 'Tamam',
          onPress: () => {
            if (isFirstLogin) {
              // After first login password change, redirect to login
              router.replace('/(auth)/employee-login' as any);
            } else {
              // Regular password change, go back
              router.back();
            }
          },
        },
      ]);
    } catch (error) {
      Alert.alert('Hata', 'Şifre değiştirilemedi');
    } finally {
      setLoading(false);
    }
  };

  const getStrengthColor = () => {
    if (passwordStrength === 0) return '#e5e7eb';
    if (passwordStrength === 1) return '#D9534F'; // Weak - Red
    if (passwordStrength === 2) return '#F0AD4E'; // Medium - Orange
    if (passwordStrength === 3) return '#078836'; // Strong - Green
    return '#e5e7eb';
  };

  const getStrengthWidth = () => {
    if (passwordStrength === 0) return '0%';
    if (passwordStrength === 1) return '25%';
    if (passwordStrength === 2) return '50%';
    if (passwordStrength === 3) return '100%';
    return '0%';
  };

  const getStrengthText = () => {
    if (passwordStrength === 0) return '';
    if (passwordStrength === 1) return 'Zayıf';
    if (passwordStrength === 2) return 'Orta';
    if (passwordStrength === 3) return 'Güçlü';
    return '';
  };

  // Password requirements
  const hasMinLength = newPassword.length >= 6;
  const hasUpperCase = /[A-Z]/.test(newPassword);
  const hasLowerCase = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            disabled={loading}
          >
            <MaterialIcons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Şifre Değiştir</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>S</Text>
            </View>
          </View>

          {/* First Login Warning */}
          {isFirstLogin && (
            <View style={styles.warningCard}>
              <MaterialIcons name="info" size={24} color="#F0AD4E" />
              <View style={styles.warningTextContainer}>
                <Text style={styles.warningTitle}>İlk Giriş Şifre Değişikliği</Text>
                <Text style={styles.warningText}>
                  Güvenliğiniz için yöneticinizin oluşturduğu geçici şifrenizi değiştirmeniz
                  gerekmektedir.
                </Text>
              </View>
            </View>
          )}

          {/* Form */}
          <View style={styles.form}>
            {/* Current Password (only for non-first-login) */}
            {!isFirstLogin && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Mevcut Şifre</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    placeholder="Mevcut şifrenizi girin"
                    placeholderTextColor="#9ca3af"
                    secureTextEntry={!showCurrent}
                    editable={!loading}
                  />
                  <TouchableOpacity
                    onPress={() => setShowCurrent(!showCurrent)}
                    style={styles.inputIcon}
                  >
                    <MaterialIcons
                      name={showCurrent ? 'visibility-off' : 'visibility'}
                      size={20}
                      color="#617c89"
                    />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* New Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Yeni Şifre</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="Yeni şifrenizi girin"
                  placeholderTextColor="#9ca3af"
                  secureTextEntry={!showNew}
                  editable={!loading}
                />
                <TouchableOpacity
                  onPress={() => setShowNew(!showNew)}
                  style={styles.inputIcon}
                >
                  <MaterialIcons
                    name={showNew ? 'visibility-off' : 'visibility'}
                    size={20}
                    color="#617c89"
                  />
                </TouchableOpacity>
              </View>

              {/* Password Strength Bar */}
              {newPassword.length > 0 && (
                <View style={styles.strengthContainer}>
                  <View style={styles.strengthBarBg}>
                    <View
                      style={[
                        styles.strengthBar,
                        {
                          width: getStrengthWidth(),
                          backgroundColor: getStrengthColor(),
                        },
                      ]}
                    />
                  </View>
                  {getStrengthText() && (
                    <Text style={[styles.strengthText, { color: getStrengthColor() }]}>
                      {getStrengthText()}
                    </Text>
                  )}
                </View>
              )}
            </View>

            {/* Confirm Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Yeni Şifre Tekrar</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Yeni şifrenizi tekrar girin"
                  placeholderTextColor="#9ca3af"
                  secureTextEntry={!showConfirm}
                  editable={!loading}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirm(!showConfirm)}
                  style={styles.inputIcon}
                >
                  <MaterialIcons
                    name={showConfirm ? 'visibility-off' : 'visibility'}
                    size={20}
                    color="#617c89"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Password Requirements */}
            <View style={styles.requirementsCard}>
              <Text style={styles.requirementsTitle}>Şifre Gereksinimleri:</Text>
              <View style={styles.requirementsList}>
                <View style={styles.requirement}>
                  <View
                    style={[
                      styles.requirementIcon,
                      hasMinLength ? styles.requirementChecked : styles.requirementUnchecked,
                    ]}
                  >
                    <MaterialIcons
                      name={hasMinLength ? 'check' : 'close'}
                      size={14}
                      color="#ffffff"
                    />
                  </View>
                  <Text style={styles.requirementText}>En az 6 karakter</Text>
                </View>
                <View style={styles.requirement}>
                  <View
                    style={[
                      styles.requirementIcon,
                      hasUpperCase ? styles.requirementChecked : styles.requirementUnchecked,
                    ]}
                  >
                    <MaterialIcons
                      name={hasUpperCase ? 'check' : 'close'}
                      size={14}
                      color="#ffffff"
                    />
                  </View>
                  <Text style={styles.requirementText}>Büyük harf (A-Z)</Text>
                </View>
                <View style={styles.requirement}>
                  <View
                    style={[
                      styles.requirementIcon,
                      hasLowerCase ? styles.requirementChecked : styles.requirementUnchecked,
                    ]}
                  >
                    <MaterialIcons
                      name={hasLowerCase ? 'check' : 'close'}
                      size={14}
                      color="#ffffff"
                    />
                  </View>
                  <Text style={styles.requirementText}>Küçük harf (a-z)</Text>
                </View>
                <View style={styles.requirement}>
                  <View
                    style={[
                      styles.requirementIcon,
                      hasNumber ? styles.requirementChecked : styles.requirementUnchecked,
                    ]}
                  >
                    <MaterialIcons
                      name={hasNumber ? 'check' : 'close'}
                      size={14}
                      color="#ffffff"
                    />
                  </View>
                  <Text style={styles.requirementText}>Rakam (0-9)</Text>
                </View>
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleChangePassword}
              disabled={loading}
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            >
              <Text style={styles.submitButtonText}>
                {loading ? 'Değiştiriliyor...' : 'Şifreyi Değiştir'}
              </Text>
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
  },
  header: {
    backgroundColor: '#1193d4',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  content: {
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#1193d4',
    alignItems: 'center',
    justifyContent: 'center',
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
  warningCard: {
    backgroundColor: 'rgba(240, 173, 78, 0.1)',
    borderWidth: 2,
    borderColor: '#F0AD4E',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    marginBottom: 24,
  },
  warningTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111618',
    marginBottom: 4,
  },
  warningText: {
    fontSize: 13,
    color: '#617c89',
    lineHeight: 18,
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
  strengthContainer: {
    marginTop: 8,
  },
  strengthBarBg: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
  },
  strengthBar: {
    height: '100%',
    borderRadius: 3,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  requirementsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111618',
    marginBottom: 12,
  },
  requirementsList: {
    gap: 8,
  },
  requirement: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  requirementIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  requirementChecked: {
    backgroundColor: '#078836',
  },
  requirementUnchecked: {
    backgroundColor: '#9ca3af',
  },
  requirementText: {
    fontSize: 13,
    color: '#617c89',
  },
  submitButton: {
    backgroundColor: '#1193d4',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#1193d4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
