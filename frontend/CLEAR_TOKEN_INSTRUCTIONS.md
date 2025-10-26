/**
 * MANUEL TOKEN TEMİZLEME KOMUTU
 * 
 * Expo DevTools Console'da (j tuşuna basın) şunu çalıştırın:
 */

// 1. AsyncStorage'ı import edin (konsola yapıştırın):
import('@react-native-async-storage/async-storage').then(({ default: AsyncStorage }) => {
  AsyncStorage.removeItem('auth_token').then(() => {
    console.log('✅ Token temizlendi! Şimdi logout yapıp tekrar login olun.');
  });
});

// VEYA daha basit:
// Expo app'te Settings icon'a (sağ alt köşe) tıklayın
// "Clear AsyncStorage" seçeneğine basın
// Uygulamayı restart edin
