import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { validateEmail, validatePassword } from '../../utils/validation';
import { loginManager, storeAuthToken } from '../../services/auth';

export default function ManagerLoginScreen() {
  const router = useRouter();
  
  const [form, setForm] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

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
      const { manager, token } = await loginManager(form.email, form.password);
      
      // Store token
      await storeAuthToken(token, 'manager');
      
      // Navigate to manager dashboard (Phase 4)
      Alert.alert('Başarılı', `Hoş geldin ${manager.store_name}!`);
      // router.push('/(manager)/dashboard');
    } catch (error) {
      Alert.alert('Hata', error instanceof Error ? error.message : 'Giriş başarısız');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Yönetici Girişi</Text>
        <Text style={styles.subtitle}>Shift yönetim panelinize giriş yapın</Text>
      </View>

      <View style={styles.form}>
        <Input
          label="Email"
          value={form.email}
          onChangeText={(text) => setForm({ ...form, email: text })}
          placeholder="ornek@isletme.com"
          keyboardType="email-address"
          autoCapitalize="none"
          error={errors.email}
        />

        <Input
          label="Şifre"
          value={form.password}
          onChangeText={(text) => setForm({ ...form, password: text })}
          placeholder="••••••••"
          secureTextEntry
          error={errors.password}
        />

        <TouchableOpacity 
          onPress={() => setForm({ ...form, rememberMe: !form.rememberMe })}
          style={styles.checkboxRow}
        >
          <View style={[styles.checkbox, form.rememberMe && styles.checkboxChecked]}>
            {form.rememberMe && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.checkboxLabel}>Beni Hatırla</Text>
        </TouchableOpacity>

        <Button
          title="Giriş Yap"
          onPress={handleLogin}
          loading={loading}
          variant="primary"
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>Hesabınız yok mu? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/manager-register' as any)}>
            <Text style={styles.link}>Kayıt Ol</Text>
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
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#1193d4',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#1193d4',
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#111618',
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
