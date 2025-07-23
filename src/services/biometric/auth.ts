import * as LocalAuthentication from 'expo-local-authentication';
import { Platform, Alert } from 'react-native';
import { shouldEnableBiometrics, isPhysicalIOSExpoGo, getBiometricLimitationMessage, getEnvironmentInfo } from '../../utils/deviceDetection';

export interface BiometricAuthResult {
  success: boolean;
  message: string;
  biometricType?: string;
  error?: string;
}

export interface BiometricCapabilities {
  isAvailable: boolean;
  hasHardware: boolean;
  isEnrolled: boolean;
  supportedTypes: LocalAuthentication.AuthenticationType[];
  biometricNames: string[];
  environmentLimitation?: string;
}

export const checkBiometricCapabilities = async (): Promise<BiometricCapabilities> => {
  try {
    const envInfo = getEnvironmentInfo();
    
    if (!shouldEnableBiometrics()) {
      const limitationMessage = getBiometricLimitationMessage();
      
      return {
        isAvailable: false,
        hasHardware: false,
        isEnrolled: false,
        supportedTypes: [],
        biometricNames: [],
        environmentLimitation: limitationMessage || undefined
      };
    }
    
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
    
    const biometricNames = supportedTypes.map(type => {
      switch (type) {
        case LocalAuthentication.AuthenticationType.FINGERPRINT:
          return 'Fingerprint';
        case LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION:
          return 'Face ID';
        case LocalAuthentication.AuthenticationType.IRIS:
          return 'Iris';
        default:
          return 'Biometric';
      }
    });

    const isAvailable = hasHardware && isEnrolled && supportedTypes.length > 0;

    return {
      isAvailable,
      hasHardware,
      isEnrolled,
      supportedTypes,
      biometricNames
    };
  } catch (error) {
    return {
      isAvailable: false,
      hasHardware: false,
      isEnrolled: false,
      supportedTypes: [],
      biometricNames: []
    };
  }
};

export const diagnoseFaceIDIssues = async (): Promise<string[]> => {
  const issues: string[] = [];
  
  if (Platform.OS === 'ios') {
    try {
      const capabilities = await checkBiometricCapabilities();
      
      if (!capabilities.hasHardware) {
        issues.push('Este dispositivo não possui hardware de Face ID');
      }
      
      if (!capabilities.isEnrolled) {
        issues.push('Face ID não está configurado nas configurações do dispositivo');
      }
      
      if (!capabilities.supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        issues.push('Face ID não está disponível neste dispositivo');
      }
      
      if (capabilities.isAvailable && issues.length === 0) {
        issues.push('Face ID deveria estar funcionando - possível problema de permissões');
      }
    } catch (error) {
      issues.push(`Erro ao verificar Face ID: ${error}`);
    }
  }
  
  return issues;
};

export const authenticateWithBiometrics = async (
  reason?: string
): Promise<BiometricAuthResult> => {
  try {
    if (!shouldEnableBiometrics()) {
      const limitationMessage = getBiometricLimitationMessage();
      
      return {
        success: false,
        message: limitationMessage || 'Biometric authentication is not available in this environment',
        error: 'ENVIRONMENT_LIMITATION'
      };
    }
    
    const capabilities = await checkBiometricCapabilities();
    
    if (!capabilities.isAvailable) {
      if (!capabilities.hasHardware) {
        return {
          success: false,
          message: 'Biometric authentication is not supported on this device.',
          error: 'NO_HARDWARE'
        };
      }
      
      if (!capabilities.isEnrolled) {
        if (Platform.OS === 'ios') {
          await diagnoseFaceIDIssues();
        }
        
        return {
          success: false,
          message: 'No biometric credentials are enrolled. Please set up biometric authentication in your device settings.',
          error: 'NOT_ENROLLED'
        };
      }
      
      return {
        success: false,
        message: 'Biometric authentication is not available.',
        error: 'NOT_AVAILABLE'
      };
    }

    const biometricType = capabilities.biometricNames.join(' or ');
    
    const authReason = reason || `Use your ${biometricType} to authenticate`;

    const authOptions = {
      promptMessage: authReason,
      cancelLabel: 'Cancel',
      disableDeviceFallback: false,
      requireConfirmation: false,
      ...(Platform.OS === 'ios' && {
        fallbackLabel: 'Use PIN',
      })
    };
    
    const result = await LocalAuthentication.authenticateAsync(authOptions);

    if (result.success) {
      return {
        success: true,
        message: 'Authentication successful!',
        biometricType
      };
    } else {
      
      let errorMessage = 'Authentication failed';
      let errorCode = 'UNKNOWN';

      if (result.error === 'user_cancel') {
        errorMessage = 'Authentication was cancelled by user';
        errorCode = 'USER_CANCEL';
      } else if (result.error === 'user_fallback') {
        return {
          success: true,
          message: 'Authentication successful with PIN!',
          biometricType: 'PIN'
        };
      } else if (result.error === 'system_cancel') {
        errorMessage = 'Authentication was cancelled by the system';
        errorCode = 'SYSTEM_CANCEL';
      } else if (result.error === 'not_available') {
        errorMessage = 'Biometric authentication is not available';
        errorCode = 'NOT_AVAILABLE';
      } else if (result.error === 'not_enrolled') {
        errorMessage = 'No biometric credentials enrolled';
        errorCode = 'NOT_ENROLLED';
      } else if (result.error === 'lockout') {
        errorMessage = 'Too many failed attempts. Please try again later.';
        errorCode = 'LOCKOUT';
      } else if (result.error === 'app_cancel') {
        errorMessage = 'Authentication cancelled by app';
        errorCode = 'APP_CANCEL';
      } else {
        errorMessage = `Authentication failed: ${result.error || 'Unknown error'}`;
        errorCode = result.error || 'UNKNOWN';
      }

      return {
        success: false,
        message: errorMessage,
        error: errorCode
      };
    }
  } catch (error: any) {
    if (error?.message?.includes('missing_usage_description') || 
        error?.code === 'missing_usage_description') {
      
      try {
        const fallbackOptions = {
          promptMessage: 'Use your device PIN to authenticate',
          cancelLabel: 'Cancel',
          disableDeviceFallback: false,
          requireConfirmation: false,
        };
        
        const fallbackResult = await LocalAuthentication.authenticateAsync(fallbackOptions);
        
        if (fallbackResult.success) {
          return {
            success: true,
            message: 'Authentication successful with PIN!',
            biometricType: 'PIN'
          };
        }
      } catch (fallbackError) {
      }
      
      return {
        success: false,
        message: 'Biometric authentication not available. Please use email and password.',
        error: 'MISSING_PERMISSION'
      };
    }
    
    if (error?.message?.includes('UserCancel') || error?.code === 'UserCancel') {
      return {
        success: false,
        message: 'Authentication was cancelled by user',
        error: 'USER_CANCEL'
      };
    }
    
    return {
      success: false,
      message: `Authentication error: ${error?.message || 'Unknown error occurred'}`,
      error: 'UNEXPECTED_ERROR'
    };
  }
};

export const getBiometricTypeDescription = async (): Promise<string> => {
  const capabilities = await checkBiometricCapabilities();
  
  if (!capabilities.isAvailable) {
    return 'Biometric authentication not available';
  }
  
  if (capabilities.biometricNames.length === 0) {
    return 'Biometric authentication';
  }
  
  if (capabilities.biometricNames.length === 1) {
    return capabilities.biometricNames[0];
  }
  
  return capabilities.biometricNames.join(' or ');
};

export const isBiometricTypeAvailable = async (
  type: LocalAuthentication.AuthenticationType
): Promise<boolean> => {
  const capabilities = await checkBiometricCapabilities();
  return capabilities.supportedTypes.includes(type);
};

export const isFaceIDAvailable = async (): Promise<boolean> => {
  if (Platform.OS !== 'ios') return false;
  return await isBiometricTypeAvailable(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION);
};

export const isFingerprintAvailable = async (): Promise<boolean> => {
  return await isBiometricTypeAvailable(LocalAuthentication.AuthenticationType.FINGERPRINT);
}; 