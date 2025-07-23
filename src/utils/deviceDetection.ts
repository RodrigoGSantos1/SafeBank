import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Device from 'expo-device';

const ENABLE_BIOMETRICS_ON_ALL_PLATFORMS = true;

export const isExpoGo = (): boolean => {
  return Constants.appOwnership === 'expo' || 
         Constants.executionEnvironment === 'storeClient';
};

export const isSimulator = (): boolean => {
  return !Device.isDevice;
};

export const isPhysicalIOSExpoGo = (): boolean => {
  return Platform.OS === 'ios' && 
         Device.isDevice && 
         isExpoGo();
};

export const shouldEnableBiometrics = (): boolean => {
  if (ENABLE_BIOMETRICS_ON_ALL_PLATFORMS) {
  
    return true;
  }
  
  return true;
};

export const getEnvironmentInfo = () => {
  return {
    platform: Platform.OS,
    isDevice: Device.isDevice,
    isExpoGo: isExpoGo(),
    isSimulator: isSimulator(),
    isPhysicalIOSExpoGo: isPhysicalIOSExpoGo(),
    shouldEnableBiometrics: shouldEnableBiometrics(),
    deviceName: Device.deviceName,
    osVersion: Device.osVersion,
    modelName: Device.modelName,
    biometricsEnabledOnAllPlatforms: ENABLE_BIOMETRICS_ON_ALL_PLATFORMS,
    isDevelopment: __DEV__,
  };
};

export const getBiometricLimitationMessage = (): string | null => {
  return null;
};

export const diagnoseBiometricIssues = () => {
  const env = getEnvironmentInfo();
  const issues: string[] = [];
  const solutions: string[] = [];

  if (env.platform === 'ios') {
    if (!env.isDevice) {
      solutions.push('Configure Face ID in simulator: Device > Face ID > Enrolled');
      solutions.push('Device > Face ID > Matching Face (to simulate success)');
    } else {
      solutions.push('Check if Face ID is configured in iOS settings');
      solutions.push('Face ID works normally in Expo Go on physical devices');
    }
  }

  if (env.platform === 'android') {
    if (env.isDevice) {
      solutions.push('Check if biometrics is configured in Android settings');
      solutions.push('Try using password/PIN as fallback');
    } else {
      issues.push('Testing on Android emulator');
      solutions.push('Configure biometrics in Android emulator (if supported)');
      solutions.push('Or test on physical Android device');
    }
  }

  return {
    environment: env,
    issues,
    solutions,
    canUseBiometrics: env.shouldEnableBiometrics,
  };
}; 