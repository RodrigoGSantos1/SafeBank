import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

const SECURE_STORAGE_KEYS = {
  REFRESH_TOKEN: '@SafeBank_refresh_token',
  USER_EMAIL: '@SafeBank_user_email',
  BIOMETRIC_ENABLED: '@SafeBank_biometric_enabled',
  DEVICE_TOKEN: '@SafeBank_device_token',
  HAS_PREVIOUS_AUTH: '@SafeBank_has_previous_auth',
};

export interface SecureAuthData {
  email: string;
  encryptedPassword: string;
  deviceToken?: string;
  timestamp: string;
}

export interface BiometricAuthStatus {
  canUse: boolean;
  reason?: string;
  authData?: SecureAuthData;
}

const isExpoGo = () => {
  return Constants.appOwnership === 'expo' ||
    Constants.executionEnvironment === 'standalone' === false;
};

const SECURE_STORE_OPTIONS = {
  keychainService: 'SafeBankKeychain',
  requireAuthentication: false,
  authenticationPrompt: 'Authenticate to access your SafeBank credentials',
  ...(Platform.OS === 'ios' && {
    accessGroup: 'com.safebank.app.shared',
  }),
};

const secureSetItem = async (key: string, value: string, options = SECURE_STORE_OPTIONS) => {
  if (isExpoGo()) {
    await AsyncStorage.setItem(key, value);
  } else {
    await SecureStore.setItemAsync(key, value, options);
  }
};

const secureGetItem = async (key: string, options = SECURE_STORE_OPTIONS): Promise<string | null> => {
  if (isExpoGo()) {
    return await AsyncStorage.getItem(key);
  } else {
    return await SecureStore.getItemAsync(key, options);
  }
};

const secureDeleteItem = async (key: string, options = SECURE_STORE_OPTIONS) => {
  if (isExpoGo()) {
    await AsyncStorage.removeItem(key);
  } else {
    await SecureStore.deleteItemAsync(key, options);
  }
};

const simpleEncrypt = (text: string): string => {
  return btoa(text);
};

const simpleDecrypt = (encryptedText: string): string => {
  return atob(encryptedText);
};

export const saveSecureAuthData = async (
  email: string,
  password: string,
  deviceToken?: string
): Promise<void> => {
  try {
    const authData: SecureAuthData = {
      encryptedPassword: simpleEncrypt(password),
      email: email.toLowerCase().trim(),
      deviceToken,
      timestamp: new Date().toISOString(),
    };

    await secureSetItem(
      SECURE_STORAGE_KEYS.REFRESH_TOKEN,
      JSON.stringify(authData)
    );

    await secureSetItem(
      SECURE_STORAGE_KEYS.USER_EMAIL,
      email.toLowerCase().trim()
    );

    await secureSetItem(
      SECURE_STORAGE_KEYS.BIOMETRIC_ENABLED,
      'true'
    );

    await secureSetItem(
      SECURE_STORAGE_KEYS.HAS_PREVIOUS_AUTH,
      'true'
    );

    if (deviceToken) {
      await secureSetItem(
        SECURE_STORAGE_KEYS.DEVICE_TOKEN,
        deviceToken
      );
    }
  } catch (error) {
    throw error;
  }
};

export const getSecureAuthData = async (): Promise<SecureAuthData | null> => {
  try {
    const authDataString = await secureGetItem(SECURE_STORAGE_KEYS.REFRESH_TOKEN);
    
    if (!authDataString) {
      return null;
    }

    const authData: SecureAuthData = JSON.parse(authDataString);

    const maxAge = 30 * 24 * 60 * 60 * 1000;
    const dataAge = Date.now() - new Date(authData.timestamp).getTime();

    if (dataAge > maxAge) {
      await clearSecureAuthData();
      return null;
    }

    return authData;
  } catch (error) {
    await clearSecureAuthData();
    return null;
  }
};

export const canUseSecureBiometricAuth = async (): Promise<BiometricAuthStatus> => {
  try {
    const [hasPreviousAuth, biometricEnabled, authData] = await Promise.all([
      secureGetItem(SECURE_STORAGE_KEYS.HAS_PREVIOUS_AUTH),
      secureGetItem(SECURE_STORAGE_KEYS.BIOMETRIC_ENABLED),
      getSecureAuthData(),
    ]);

    if (hasPreviousAuth !== 'true') {
      return {
        canUse: false,
        reason: 'Please sign in with email and password first',
      };
    }

    if (biometricEnabled !== 'true') {
      return {
        canUse: false,
        reason: 'Biometric authentication is disabled',
      };
    }

    if (!authData) {
      return {
        canUse: false,
        reason: 'No secure authentication data found',
      };
    }

    return {
      canUse: true,
      authData,
    };
  } catch (error) {
    return {
      canUse: false,
      reason: 'Error accessing secure storage',
    };
  }
};

export const getLastSecureEmail = async (): Promise<string | null> => {
  try {
    return await secureGetItem(SECURE_STORAGE_KEYS.USER_EMAIL);
  } catch (error) {
    return null;
  }
};

export const setSecureBiometricEnabled = async (enabled: boolean): Promise<void> => {
  try {
    await secureSetItem(
      SECURE_STORAGE_KEYS.BIOMETRIC_ENABLED,
      enabled.toString()
    );
  } catch (error) {
    throw error;
  }
};

export const clearSecureAuthData = async (): Promise<void> => {
  try {
    const keys = Object.values(SECURE_STORAGE_KEYS);

    await Promise.all(
      keys.map(key =>
        secureDeleteItem(key).catch(error =>
          console.warn(`Warning: Could not delete key ${key}:`, error)
        )
      )
    );

  } catch (error) {
    throw error;
  }
};

export const validateSecureAuthData = async (): Promise<boolean> => {
  try {
    const authData = await getSecureAuthData();

    if (!authData) {
      return false;
    }

    if (!authData.email || !authData.encryptedPassword) {
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(authData.email)) {
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
};

export const isSecureStoreAvailable = async (): Promise<boolean> => {
  try {
    const testKey = '@SafeBank_test_key';
    const testValue = 'test_value';

    await secureSetItem(testKey, testValue);
    const retrievedValue = await secureGetItem(testKey);
    await secureDeleteItem(testKey);

    return retrievedValue === testValue;
  } catch (error) {
    return false;
  }
};

export const getDecryptedPassword = async (): Promise<string | null> => {
  try {
    const authData = await getSecureAuthData();
    
    if (!authData || !authData.encryptedPassword) {
      return null;
    }

    return simpleDecrypt(authData.encryptedPassword);
  } catch (error) {
    return null;
  }
}; 