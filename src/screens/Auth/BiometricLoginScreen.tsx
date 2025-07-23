import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSecureAuth as useAuth } from '../../contexts/SecureAuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { getBiometricTypeDescription } from '../../services/biometric/auth';

const BiometricLoginScreen = ({ navigation }: any) => {
  const { signInWithBiometrics, loading, biometricCapabilities, canUseBiometrics: authCanUseBiometrics, lastAuthEmail } = useAuth();
  const { colors } = useTheme();
  const [biometricType, setBiometricType] = useState<string>('Biometric');
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const initializeBiometrics = async () => {
      try {
        const description = await getBiometricTypeDescription();
        setBiometricType(description);
      } catch (error) {
        console.error('Error getting biometric description:', error);
      } finally {
        setInitializing(false);
      }
    };

    initializeBiometrics();
  }, []);

  const handleBiometricAuth = async () => {
    try {
      const result = await signInWithBiometrics();
      
      if (result.success) {
        Alert.alert("Success", result.message || "Biometric authentication successful!");
      } else {
        Alert.alert("Error", result.message || "Biometric authentication failed");
      }
    } catch (error) {
      console.error('Biometric auth error:', error);
      Alert.alert("Error", "An unexpected error occurred during biometric authentication");
    }
  };

  const getStatusMessage = () => {
    if (initializing) return "Checking biometric capabilities...";
    if (!biometricCapabilities) return "Unable to check biometric support";
    if (biometricCapabilities.environmentLimitation) return biometricCapabilities.environmentLimitation;
    if (!biometricCapabilities.hasHardware) return "No biometric hardware detected";
    if (!biometricCapabilities.isEnrolled) return "No biometric credentials enrolled";
    if (!biometricCapabilities.isAvailable) return "Biometric authentication not available";
    if (!authCanUseBiometrics) return "Please sign in with email and password first to enable biometric authentication";
    return `Use your ${biometricType} to sign in${lastAuthEmail ? ` as ${lastAuthEmail}` : ''}`;
  };

  const getBiometricIcon = () => {
    if (!biometricCapabilities) return "fingerprint";

    if (biometricCapabilities.biometricNames.includes("Face ID")) {
      return "face";
    } else if (biometricCapabilities.biometricNames.includes("Fingerprint")) {
      return "fingerprint";
    } else {
      return "fingerprint";
    }
  };

  const canUseBiometrics = authCanUseBiometrics && biometricCapabilities?.isAvailable && !initializing;

  if (initializing) {
    return (
      <View style={{ backgroundColor: colors.background }} className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.textSecondary }} className="mt-4">Initializing...</Text>
      </View>
    );
  }

  return (
    <View style={{ backgroundColor: colors.background }} className="flex-1 items-center justify-center p-6">
      <View className="items-center mb-8">
        <View 
          className={`rounded-full p-6 mb-6`}
          style={{ backgroundColor: canUseBiometrics ? colors.primary : colors.border }}
        >
          <MaterialIcons 
            name={getBiometricIcon()} 
            size={80} 
            color="white" 
          />
        </View>
        
        <Text style={{ color: colors.primary }} className="text-3xl font-bold mb-2">SafeBank</Text>
        <Text style={{ color: colors.textPrimary }} className="text-xl font-bold mb-4">
          Biometric Authentication
        </Text>
        
        <Text style={{ color: colors.textSecondary }} className="text-base text-center mb-8 px-4">
          {getStatusMessage()}
        </Text>
      </View>

      <View className="w-full max-w-sm">
        {canUseBiometrics ? (
          <>
            <TouchableOpacity
              className={`rounded-lg p-4 w-full items-center justify-center mb-4`}
              style={{ backgroundColor: loading ? colors.border : colors.primary }}
              onPress={handleBiometricAuth}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <MaterialIcons name={getBiometricIcon()} size={24} color="white" />
                  <Text className="text-white text-base font-bold mt-2">
                    Authenticate with {biometricType}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              className="p-4 w-full items-center justify-center"
              onPress={() => navigation.goBack()}
              disabled={loading}
            >
              <Text style={{ color: colors.textSecondary }} className="text-base">
                Use Email & Password
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            className="p-4 w-full items-center justify-center"
            onPress={() => navigation.goBack()}
          >
            <Text style={{ color: colors.primary }} className="text-base font-bold">
              Go Back
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default BiometricLoginScreen; 