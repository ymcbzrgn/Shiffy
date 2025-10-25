import React, { useState } from 'react';
import { View, Text, ScrollView, Modal, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { validateRequired } from '../../../utils/validation';
import { addEmployee } from '../../../services/employee';

export default function AddEmployeeScreen() {
  const router = useRouter();
  
  const [form, setForm] = useState({
    fullName: '',
    username: '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');

  const handleSubmit = async () => {
    // Validate
    const fullNameError = validateRequired(form.fullName, 'Ad Soyad');
    const usernameError = validateRequired(form.username, 'Kullanıcı adı');
    
    if (fullNameError || usernameError) {
      setErrors({
        fullName: fullNameError || '',
        username: usernameError || '',
      });
      return;
    }
    
    // Username validation (no spaces, lowercase)
    if (!/^[a-z0-9._]+$/.test(form.username)) {
      setErrors({ username: 'Kullanıcı adı sadece küçük harf, rakam, nokta ve alt çizgi içerebilir' });
      return;
    }
    
    setErrors({});
    setLoading(true);
    
    try {
      const { employee, password } = await addEmployee(
        'mgr-1', // Mock manager ID
        form.fullName,
        form.username
      );
      
      setGeneratedPassword(password);
      setSuccessModal(true);
    } catch (error) {
      Alert.alert('Hata', error instanceof Error ? error.message : 'Çalışan eklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPassword = () => {
    // TODO: Implement clipboard copy when expo-clipboard is installed
    Alert.alert('Şifre', generatedPassword + '\n\nNot: Kopyalama özelliği Phase 6\'da eklenecek');
  };

  const handleClose = () => {
    setSuccessModal(false);
    router.back();
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Logo/Icon Section */}
        <View style={styles.iconSection}>
          <View style={styles.iconCircle}>
            <MaterialIcons name="person-add" size={48} color="#1193d4" />
          </View>
          <Text style={styles.title}>Yeni Çalışan Ekle</Text>
          <Text style={styles.subtitle}>
            Çalışan bilgilerini girin. Sistem otomatik olarak güvenli bir şifre oluşturacak.
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Input
            label="Ad Soyad"
            value={form.fullName}
            onChangeText={(text) => setForm({ ...form, fullName: text })}
            placeholder="Örn: Ahmet Yılmaz"
            error={errors.fullName}
          />

          <Input
            label="Kullanıcı Adı"
            value={form.username}
            onChangeText={(text) => setForm({ ...form, username: text.toLowerCase() })}
            placeholder="Örn: ahmet.yilmaz"
            autoCapitalize="none"
            error={errors.username}
          />

          <View style={styles.infoBox}>
            <MaterialIcons name="info" size={20} color="#1193d4" />
            <Text style={styles.infoText}>
              Kullanıcı adı sadece küçük harf, rakam, nokta (.) ve alt çizgi (_) içerebilir.
            </Text>
          </View>

          <Button
            title="Çalışan Ekle"
            onPress={handleSubmit}
            loading={loading}
            variant="primary"
          />
        </View>
      </ScrollView>

      {/* Success Modal */}
      <Modal
        visible={successModal}
        transparent
        animationType="fade"
        onRequestClose={handleClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.successIcon}>
              <MaterialIcons name="check-circle" size={64} color="#078836" />
            </View>
            
            <Text style={styles.modalTitle}>Çalışan Başarıyla Eklendi!</Text>
            <Text style={styles.modalSubtitle}>
              {form.fullName} sisteme kaydedildi.
            </Text>

            <View style={styles.passwordBox}>
              <Text style={styles.passwordLabel}>Otomatik Oluşturulan Şifre:</Text>
              <View style={styles.passwordRow}>
                <Text style={styles.passwordText}>{generatedPassword}</Text>
                <TouchableOpacity onPress={handleCopyPassword} style={styles.copyButton}>
                  <MaterialIcons name="content-copy" size={20} color="#1193d4" />
                </TouchableOpacity>
              </View>
              <Text style={styles.passwordHint}>
                Bu şifreyi çalışana iletin. İlk girişte değiştirmesi gerekecek.
              </Text>
            </View>

            <Button
              title="Tamam"
              onPress={handleClose}
              variant="primary"
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f7f8',
  },
  content: {
    padding: 24,
    paddingTop: 40,
  },
  iconSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(17, 147, 212, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111618',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#617c89',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  form: {
    marginBottom: 20,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(17, 147, 212, 0.1)',
    padding: 12,
    borderRadius: 8,
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#1193d4',
    lineHeight: 18,
    marginLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  successIcon: {
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111618',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#617c89',
    marginBottom: 24,
    textAlign: 'center',
  },
  passwordBox: {
    width: '100%',
    backgroundColor: '#f6f7f8',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  passwordLabel: {
    fontSize: 12,
    color: '#617c89',
    marginBottom: 8,
    fontWeight: '600',
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  passwordText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111618',
    letterSpacing: 1,
  },
  copyButton: {
    padding: 8,
    backgroundColor: 'rgba(17, 147, 212, 0.1)',
    borderRadius: 8,
  },
  passwordHint: {
    fontSize: 11,
    color: '#617c89',
    fontStyle: 'italic',
  },
});
