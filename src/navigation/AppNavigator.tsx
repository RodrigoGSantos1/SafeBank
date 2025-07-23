import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, ActivityIndicator } from 'react-native';
import { useSecureAuth as useAuth } from '../contexts/SecureAuthContext';
import { useTheme } from '../contexts/ThemeContext';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import { EnvironmentAlert } from '../components/EnvironmentAlert';

const Stack = createNativeStackNavigator();

const LoadingScreen = () => {
  const { colors } = useTheme();
  
  return (
    <View style={{ backgroundColor: colors.background }} className="flex-1 items-center justify-center">
      <View 
        className="rounded-full p-4 mb-4"
        style={{ backgroundColor: colors.primary }}
      >
        <ActivityIndicator size="large" color="white" />
      </View>
      <Text style={{ color: colors.primary }} className="text-2xl font-bold mb-2">SafeBank</Text>
      <Text style={{ color: colors.textSecondary }}>Initializing...</Text>
    </View>
  );
};

const AppNavigator = () => {
  const { user, initializing } = useAuth();
  
  if (initializing) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="Main" component={MainNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
      <EnvironmentAlert />
    </NavigationContainer>
  );
};

export default AppNavigator;