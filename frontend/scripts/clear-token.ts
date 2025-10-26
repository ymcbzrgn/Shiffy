import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Clear AsyncStorage - Use this to logout employee
 */
async function clearEmployeeToken() {
  try {
    await AsyncStorage.removeItem('auth_token');
    console.log('✅ Employee token cleared from AsyncStorage');
  } catch (error) {
    console.error('Error clearing token:', error);
  }
}

// Run it
clearEmployeeToken();
