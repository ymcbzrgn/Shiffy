// App Entry Point - Splash Screen with Logo

import { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      // Show splash for 1.5 seconds
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Always go to user select screen
      // User will choose manager or employee login
      router.replace('/(auth)/user-select' as any);
    };

    checkAuth();
  }, []);

  return (
    <LinearGradient
      colors={['#00cd81', '#004dd6']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.logoContainer}>
        <Image 
          source={require('@/assets/images/shiffy-logo.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
        <Text style={styles.logoTitle}>Shiffy</Text>
        <Text style={styles.logoSubtitle}>Shift Yönetim Sistemi</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoImage: {
    width: 120,
    height: 120,
    marginBottom: 24,
  },
  logoTitle: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
    letterSpacing: 2,
  },
  logoSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    letterSpacing: 1,
  },
});
