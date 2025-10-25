import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { validateRequired } from '../../../utils/validation';
import { addEmployee } from '../../../services/employee';

export default function AddEmployeeScreen() {
  const router = useRouter();
  
  const [form, setForm] = useState({
    fullName: '',
    username: '',
    jobDescription: '',
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
        form.username,
        form.jobDescription || null
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
    Alert.alert('Şifre', generatedPassword + '\n\nNot: Kopyalama özelliği Phase 6\'da eklenecek');
  };

  const handleClose = () => {
    setSuccessModal(false);
    router.back();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#00cd81', '#004dd6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Yeni Çalışan Ekle</Text>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >

        {/* Form */}
        <View style={styles.form}>
          {/* Full Name Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ad Soyad</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, errors.fullName && styles.inputError]}
                value={form.fullName}
                onChangeText={(text) => {
                  setForm({ ...form, fullName: text });
                  if (errors.fullName) setErrors({ ...errors, fullName: '' });
                }}
                placeholder="Örn: Ahmet Yılmaz"
                placeholderTextColor="#9ca3af"
                autoCapitalize="words"
                editable={!loading}
              />
              <MaterialIcons
                name="person"
                size={20}
                color="#617c89"
                style={styles.inputIcon}
              />
            </View>
            {errors.fullName ? <Text style={styles.errorText}>{errors.fullName}</Text> : null}
          </View>

          {/* Username Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Kullanıcı Adı</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, errors.username && styles.inputError]}
                value={form.username}
                onChangeText={(text) => {
                  setForm({ ...form, username: text.toLowerCase() });
                  if (errors.username) setErrors({ ...errors, username: '' });
                }}
                placeholder="Örn: ahmet.yilmaz"
                placeholderTextColor="#9ca3af"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
              <MaterialIcons
                name="alternate-email"
                size={20}
                color="#617c89"
                style={styles.inputIcon}
              />
            </View>
            {errors.username ? <Text style={styles.errorText}>{errors.username}</Text> : null}
          </View>

          {/* Job Description Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>İş Tanımı (Opsiyonel)</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={form.jobDescription}
                onChangeText={(text) => {
                  setForm({ ...form, jobDescription: text });
                }}
                placeholder="Örn: Kasiyer, Garson"
                placeholderTextColor="#9ca3af"
                autoCapitalize="words"
                editable={!loading}
              />
              <MaterialIcons
                name="work"
                size={20}
                color="#617c89"
                style={styles.inputIcon}
              />
            </View>
            <Text style={styles.hintText}>
              İpucu: Birden fazla rolü virgülle ayırarak yazabilirsiniz (Örn: "Kasiyer, Garson, Aşçı")
            </Text>
          </View>

          {/* Info Box */}
          <View style={styles.infoBox}>
            <MaterialIcons name="info" size={18} color="#1193d4" />
            <Text style={styles.infoText}>
              Kullanıcı adı sadece küçük harf, rakam, nokta (.) ve alt çizgi (_) içerebilir.
            </Text>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            style={styles.submitButtonContainer}
            disabled={loading}
          >
            <LinearGradient
              colors={['#00cd81', '#004dd6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            >
              <Text style={styles.submitButtonText}>
                {loading ? 'Ekleniyor...' : 'Çalışan Ekle'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
      </KeyboardAvoidingView>

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

            <TouchableOpacity
              onPress={handleClose}
              style={styles.modalButtonContainer}
            >
              <LinearGradient
                colors={['#00cd81', '#004dd6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.modalButton}
              >
                <Text style={styles.modalButtonText}>Tamam</Text>
              </LinearGradient>
            </TouchableOpacity>
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
  header: {
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginLeft: 12,
  },
  backButton: {
    padding: 4,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 20,
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111618',
    marginBottom: 8,
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    paddingRight: 48,
    fontSize: 16,
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
  hintText: {
    fontSize: 12,
    color: '#617c89',
    marginTop: 4,
    fontStyle: 'italic',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(17, 147, 212, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#1193d4',
    marginLeft: 8,
    lineHeight: 18,
  },
  submitButtonContainer: {
    marginTop: 12,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
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
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
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
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  passwordLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#617c89',
    marginBottom: 8,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  passwordText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1193d4',
    letterSpacing: 2,
  },
  copyButton: {
    padding: 8,
  },
  passwordHint: {
    fontSize: 12,
    color: '#617c89',
    lineHeight: 16,
  },
  modalButtonContainer: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalButton: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
