import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const OLD_KEYS = [
  '@SafeBank:hasPreviousAuth',
  '@SafeBank:lastEmail', 
  '@SafeBank:lastAuthToken',
  '@SafeBank:biometricEnabled',
  '@SafeBank:userPreferences',
  '@SafeBank:refresh_token',
  '@SafeBank:user_email',
  '@SafeBank:biometric_enabled',
  '@SafeBank:device_token',
  '@SafeBank:has_previous_auth',
];

export const cleanupOldAuthData = async (): Promise<void> => {
  try {
    for (const key of OLD_KEYS) {
      try {
        await AsyncStorage.removeItem(key);
      } catch (error) {
      }
    }

    const oldSecureKeys = [
      '@SafeBank:refresh_token',
      '@SafeBank:user_email', 
      '@SafeBank:biometric_enabled',
      '@SafeBank:device_token',
      '@SafeBank:has_previous_auth',
    ];

    for (const key of oldSecureKeys) {
      try {
        await SecureStore.deleteItemAsync(key);
      } catch (error) {
      }
    }
  } catch (error) {
  }
}; 