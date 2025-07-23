import React, { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isPhysicalIOSExpoGo } from '../utils/deviceDetection';

const ALERT_SHOWN_KEY = '@SafeBank:environment_alert_shown';

export const EnvironmentAlert: React.FC = () => {
  const [alertShown, setAlertShown] = useState<boolean>(false);

  useEffect(() => {
    const checkAndShowAlert = async () => {
      if (!isPhysicalIOSExpoGo()) {
        return;
      }

      try {
        const wasShown = await AsyncStorage.getItem(ALERT_SHOWN_KEY);
        
        if (!wasShown) {
          Alert.alert(
            "🔍 Testing Environment Notice",
            "You're testing on a physical iOS device with Expo Go. Some features have limitations:\n\n" +
            "• Biometric authentication is disabled\n" +
            "• Use email/password for login\n" +
            "• All other features work normally\n\n" +
            "For full biometric testing, use the iOS Simulator or build the app natively.",
            [
              {
                text: "Got it!",
                onPress: async () => {
                  await AsyncStorage.setItem(ALERT_SHOWN_KEY, 'true');
                  setAlertShown(true);
                }
              }
            ],
            { cancelable: false }
          );
        } else {
          setAlertShown(true);
        }
      } catch (error) {
        console.error('Error checking environment alert status:', error);
      }
    };

    checkAndShowAlert();
  }, []);

  return null;
};

export default EnvironmentAlert; 