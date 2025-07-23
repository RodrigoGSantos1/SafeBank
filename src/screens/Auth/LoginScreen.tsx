import React, { useState, useEffect } from "react";import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { Input } from "../../components";
import { useSecureAuth as useAuth } from "../../contexts/SecureAuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { useAnimations } from "../../hooks";

const LoginScreen = ({ navigation }: { navigation: any }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const {
    signIn,
    loading,
    biometricCapabilities,
    canUseBiometrics,
    lastAuthEmail,
  } = useAuth();
  const { colors } = useTheme();
  const { animateIn, animateButton } = useAnimations();
  const [biometricButtonText, setBiometricButtonText] = useState(
    "Access with biometrics"
  );

  useEffect(() => {
    if (biometricCapabilities) {
      if (!biometricCapabilities.isAvailable) {
        if (biometricCapabilities.environmentLimitation) {
          setBiometricButtonText(
            "Biometric unavailable in current environment"
          );
        } else {
          setBiometricButtonText("Biometric authentication unavailable");
        }
      } else if (!canUseBiometrics) {
        setBiometricButtonText("Sign in first to enable biometrics");
      } else {
        const types = biometricCapabilities.biometricNames.join(" or ");

        setBiometricButtonText(`Access with ${types} or PIN`);
      }
    }
  }, [biometricCapabilities, canUseBiometrics, lastAuthEmail]);

  const handleSignUp = () => {
    navigation.navigate("Register");
  };

  useEffect(() => {
    animateIn();
  }, []);

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    const result = await signIn(email, password);

    if (result.success) {
      Alert.alert("Success", result.message || "Login successful!");
    } else {
      Alert.alert("Error", result.message || "Login failed");
    }
  };

  const handleBiometricLogin = () => {
    if (!biometricCapabilities?.isAvailable) {
      const message =
        biometricCapabilities?.environmentLimitation ||
        "Biometric authentication is not available on this device or not set up.";

      Alert.alert("Biometric Authentication", message, [{ text: "OK" }]);
      return;
    }

    navigation.navigate("BiometricLogin");
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

  const isBiometricEnabled =
    biometricCapabilities?.isAvailable && canUseBiometrics;

  return (
    <View style={{ backgroundColor: colors.background }} className="flex-1">
      <View className="flex-1 items-center justify-center p-6">
        <View className="items-center mb-8">
          <View 
            className="rounded-full p-4 mb-4"
            style={{ backgroundColor: colors.primary }}
          >
            <MaterialIcons name="fingerprint" size={50} color="white" />
          </View>
          <Text style={{ color: colors.textPrimary }} className="text-4xl font-bold">SafeBank</Text>
          <Text style={{ color: colors.textSecondary }} className="text-base mt-2">
            Sign in to your account
          </Text>
        </View>

        <View className="w-full max-w-sm space-y-4">
          <View>
            <Text style={{ color: colors.textSecondary }} className="text-sm mb-2 ml-1">
              Email Address
            </Text>
            <Input
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              theme={colors.background === '#FFFFFF' ? "light" : "dark"}
              editable={!loading}
            />
          </View>

          <View className="mt-4">
            <Text style={{ color: colors.textSecondary }} className="text-sm mb-2 ml-1">Password</Text>
            <View className="relative">
              <Input
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                theme={colors.background === '#FFFFFF' ? "light" : "dark"}
                editable={!loading}
              />
              <TouchableOpacity
                className="absolute right-4 top-4"
                onPress={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                <Ionicons
                  name={showPassword ? "eye-off" : "eye"}
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity className="self-end mt-2">
            <Text style={{ color: colors.primary }} className="text-sm">Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`rounded-lg p-4 w-full items-center justify-center mt-6 ${
              loading ? "opacity-50" : ""
            }`}
            style={{ backgroundColor: loading ? colors.border : colors.primary }}
            onPress={handleSignIn}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-base font-bold">Sign In</Text>
            )}
          </TouchableOpacity>

          <View className="flex-row justify-center mt-6">
            <Text style={{ color: colors.textSecondary }} className="text-base">
              Don't have an account?{" "}
            </Text>
            <TouchableOpacity onPress={handleSignUp} disabled={loading}>
              <Text style={{ color: colors.primary }} className="text-base font-bold">Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View className="p-6 pb-8">
        <TouchableOpacity
          className={`p-4 w-full items-center justify-center flex-row ${
            isBiometricEnabled ? "" : "opacity-50"
          }`}
          onPress={handleBiometricLogin}
          disabled={loading}
        >
          <MaterialIcons
            name={getBiometricIcon()}
            size={20}
            color={isBiometricEnabled ? colors.primary : colors.textSecondary}
          />
          <Text
            className="text-base font-bold ml-2"
            style={{ 
              color: isBiometricEnabled ? colors.primary : colors.textSecondary,
              textDecorationLine: isBiometricEnabled ? 'underline' : 'none'
            }}
          >
            {biometricButtonText}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LoginScreen;
