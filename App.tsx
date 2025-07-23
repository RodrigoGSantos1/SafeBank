import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SecureAuthProvider } from './src/contexts/SecureAuthContext';
import { NotificationProvider } from './src/contexts/NotificationContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <ThemeProvider>
      <SecureAuthProvider>
        <NotificationProvider>
          <AppNavigator />
          <StatusBar style="light" />
        </NotificationProvider>
      </SecureAuthProvider>
    </ThemeProvider>
  );
}
