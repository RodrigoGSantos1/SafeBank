import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/Home/HomeScreen';
import { TransactionsScreen, UsersScreen, NotificationsScreen, ProfileScreen, HistoryScreen } from '../screens';

const Stack = createNativeStackNavigator();

const MainNavigator = () => {
  return (
    <Stack.Navigator 
      initialRouteName="Home"
      screenOptions={{ 
        headerShown: false 
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Transfer" component={TransactionsScreen} />
      <Stack.Screen name="Users" component={UsersScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="History" component={HistoryScreen} />
    </Stack.Navigator>
  );
};

export default MainNavigator;