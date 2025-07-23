import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../screens/Auth/LoginScreen";
import RegisterScreen from "../screens/Auth/RegisterScreen";
import BiometricLoginScreen from "../screens/Auth/BiometricLoginScreen";

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  BiometricLogin: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
      }}
    >
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{
          title: "Sign in",
        }}
      />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{
          title: "Sign up",
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="BiometricLogin"
        component={BiometricLoginScreen}
        options={{
          title: "Biometric Login",
          presentation: "modal",
        }}
      />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
