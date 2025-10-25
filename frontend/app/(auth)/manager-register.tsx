import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { PasswordStrengthIndicator } from '../../components/ui/PasswordStrengthIndicator';
import { 
  validateEmail, 
  validatePassword, 
  validateRequired,
  validatePasswordMatch,
  calculatePasswordStrength 
} from '../../utils/validation';
import { registerManager } from '../../services/auth';

export default function ManagerRegisterScreen() {
  const router = useRouter();
  
  const [form, setForm] = useState({
    storeName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  
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

      // Navigate to manager dashboard
      router.replace('/(manager)/dashboard' as any);
    } catch (error) {
      Alert.alert('Hata', error instanceof Error ? error.message : 'Kayıt başarısız');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Yönetici Kaydı</Text>
        <Text style={styles.subtitle}>Shift yönetim hesabınızı oluşturun</Text>
      </View>

      <View style={styles.form}>
        <Input
          label="İşletme Adı"
          value={form.storeName}
          onChangeText={(text) => setForm({ ...form, storeName: text })}
          placeholder="Örn: Kahve Dükkanı"
          error={errors.storeName}
        />

        <Input
          label="Email"
          value={form.email}
          onChangeText={(text) => setForm({ ...form, email: text })}
          placeholder="ornek@isletme.com"
          keyboardType="email-address"
          autoCapitalize="none"
          error={errors.email}
        />

        <View>
          <Input
            label="Şifre"
            value={form.password}
            onChangeText={(text) => setForm({ ...form, password: text })}
            placeholder="En az 6 karakter"
            secureTextEntry
            error={errors.password}
          />
          {form.password.length > 0 && (
            <PasswordStrengthIndicator strength={passwordStrength} />
          )}
        </View>

        <Input
          label="Şifre Tekrar"
          value={form.confirmPassword}
          onChangeText={(text) => setForm({ ...form, confirmPassword: text })}
          placeholder="Şifrenizi tekrar girin"
          secureTextEntry
          error={errors.confirmPassword}
        />

        <Button
          title="Kayıt Ol"
          onPress={handleRegister}
          loading={loading}
          variant="primary"
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>Zaten hesabınız var mı? </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.link}>Giriş Yap</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f7f8',
  },
  content: {
    padding: 24,
    paddingTop: 60,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111618',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#617c89',
  },
  form: {
    gap: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#617c89',
  },
  link: {
    fontSize: 14,
    color: '#1193d4',
    fontWeight: '600',
  },
});
