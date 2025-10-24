import { View, Text, StyleSheet } from 'react-native';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'expo-router';

export default function ManagerLoginScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Yönetici Girişi</Text>
      <Text style={styles.subtitle}>Bu sayfa AŞAMA 3'te yapılacak</Text>
      
      <Button
        title="Geri Dön"
        onPress={() => router.back()}
        variant="secondary"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f7f8',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111618',
  },
  subtitle: {
    fontSize: 16,
    color: '#617c89',
    textAlign: 'center',
  },
});
