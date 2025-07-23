import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Input } from "../../components";
import { useTheme } from "../../contexts/ThemeContext";
import { createUser } from "../../services";

const RegisterScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const { colors } = useTheme();

  const handleSignUp = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    const user = await createUser(email, password, name);

  };
  
  return (
    <View style={{ backgroundColor: colors.background }} className="flex-1 items-center justify-center p-5">
      <View className="items-center w-full mb-8">
        <Text style={{ color: colors.textPrimary }} className="text-4xl font-bold w-full text-start">
          Sign up
        </Text>
        <Text style={{ color: colors.textSecondary }} className="text-xl w-full text-start">
          Sign up to get started
        </Text>
      </View>

      <View className="w-full max-w-sm space-y-4">
        <View>
          <Text style={{ color: colors.textPrimary }} className="text-sm mb-2 ml-1">Name</Text>
          <Input
            placeholder="Enter your name"
            value={name}
            onChangeText={setName}
            keyboardType="default"
            autoCapitalize="none"
            autoCorrect={false}
            theme={colors.background === '#FFFFFF' ? "light" : "dark"}
          />
        </View>

        <View>
          <Text style={{ color: colors.textPrimary }} className="text-sm mb-2 ml-1">Email Address</Text>
          <Input
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            theme={colors.background === '#FFFFFF' ? "light" : "dark"}
          />
        </View>

        <View className="mt-4">
          <Text style={{ color: colors.textPrimary }} className="text-sm mb-2 ml-1">Password</Text>
          <View className="relative">
            <Input
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              theme={colors.background === '#FFFFFF' ? "light" : "dark"}
            />
            <TouchableOpacity
              className="absolute right-4 top-4"
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons
                name={showPassword ? "eye-off" : "eye"}
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View className="mt-10">
          <TouchableOpacity
            className="rounded-lg p-4 w-full items-center justify-center mt-10"
            style={{ backgroundColor: colors.primary }}
            onPress={handleSignUp}
          >
            <Text className="text-white text-base font-bold">Sign Up</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row justify-center mt-6">
          <Text style={{ color: colors.textPrimary }} className="text-base">Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={{ color: colors.primary }} className="text-base font-bold">Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default RegisterScreen;
