import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  RefreshControl,
  Image,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSecureAuth as useAuth } from '../../contexts/SecureAuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { useAnimations } from '../../hooks';

const ProfileScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, signOut } = useAuth();
  const { colors, theme, toggleTheme, setTheme } = useTheme();
  const { settings } = useNotifications();
  const { animateIn } = useAnimations();
  
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('❌ Error updating profile:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Do you really want to sign out of your account?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive', 
          onPress: signOut 
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action is irreversible. All your data will be permanently lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: () => {
            Alert.alert('Feature in Development', 'This feature will be implemented soon.');
          }
        },
      ]
    );
  };

  useEffect(() => {
    animateIn();
  }, []);

  const renderHeader = () => (
    <View 
      className="pt-12 pb-6 px-6"
      style={{ backgroundColor: colors.background }}
    >
      <View className="flex-row items-center justify-between mb-6">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="p-2 -ml-2"
        >
          <MaterialIcons
            name="arrow-back"
            size={24}
            color={colors.textPrimary}
          />
        </TouchableOpacity>
        <Text
          style={{ color: colors.textPrimary }}
          className="text-xl font-bold"
        >
          Profile
        </Text>
        <View className="w-10" />
      </View>

      <View 
        className="rounded-2xl p-6 border"
        style={{ 
          backgroundColor: colors.card,
          borderColor: colors.border
        }}
      >
        <View className="flex-row items-center mb-4">
          <View 
            className="rounded-full p-3 mr-4"
            style={{ backgroundColor: `${colors.primary}20` }}
          >
            <MaterialIcons
              name="account-circle"
              size={48}
              color={colors.primary}
            />
          </View>
          <View className="flex-1">
            <Text
              style={{ color: colors.textPrimary }}
              className="text-xl font-bold"
            >
              {user?.name || 'User'}
            </Text>
            <Text style={{ color: colors.textSecondary }} className="text-sm">
              {user?.email || 'user@email.com'}
            </Text>
            <Text style={{ color: colors.textSecondary }} className="text-xs mt-1">
              Member since {new Date().toLocaleDateString('en-US')}
            </Text>
          </View>
        </View>

        <View className="flex-row space-x-4">
          <View className="flex-1 items-center p-3 rounded-xl" style={{ backgroundColor: `${colors.success}10` }}>
            <Text style={{ color: colors.success }} className="text-lg font-bold">
              $ 0.00
            </Text>
            <Text style={{ color: colors.textSecondary }} className="text-xs">
              Balance
            </Text>
          </View>
          <View className="flex-1 items-center p-3 rounded-xl" style={{ backgroundColor: `${colors.primary}10` }}>
            <Text style={{ color: colors.primary }} className="text-lg font-bold">
              0
            </Text>
            <Text style={{ color: colors.textSecondary }} className="text-xs">
              Transactions
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderPersonalInfo = () => (
    <View className="px-6 mb-6">
      <Text
        style={{ color: colors.textPrimary }}
        className="text-lg font-bold mb-4"
      >
        Personal Information
      </Text>
      
      <View 
        className="rounded-2xl border"
        style={{ 
          backgroundColor: colors.card,
          borderColor: colors.border
        }}
      >
        <TouchableOpacity className="p-4 border-b" style={{ borderBottomColor: colors.border }}>
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center">
              <MaterialIcons name="person" size={20} color={colors.textSecondary} />
              <Text style={{ color: colors.textPrimary }} className="ml-3 font-medium">
                Full name
              </Text>
            </View>
            <View className="flex-row items-center">
              <Text style={{ color: colors.textSecondary }} className="text-sm mr-2">
                {user?.name || 'Not defined'}
              </Text>
              <MaterialIcons name="chevron-right" size={20} color={colors.textSecondary} />
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity className="p-4 border-b" style={{ borderBottomColor: colors.border }}>
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center">
              <MaterialIcons name="email" size={20} color={colors.textSecondary} />
              <Text style={{ color: colors.textPrimary }} className="ml-3 font-medium">
                Email
              </Text>
            </View>
            <View className="flex-row items-center">
              <Text style={{ color: colors.textSecondary }} className="text-sm mr-2">
                {user?.email || 'Not defined'}
              </Text>
              <MaterialIcons name="chevron-right" size={20} color={colors.textSecondary} />
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity className="p-4 border-b" style={{ borderBottomColor: colors.border }}>
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center">
              <MaterialIcons name="phone" size={20} color={colors.textSecondary} />
              <Text style={{ color: colors.textPrimary }} className="ml-3 font-medium">
                Phone
              </Text>
            </View>
            <View className="flex-row items-center">
              <Text style={{ color: colors.textSecondary }} className="text-sm mr-2">
                Not defined
              </Text>
              <MaterialIcons name="chevron-right" size={20} color={colors.textSecondary} />
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity className="p-4">
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center">
              <MaterialIcons name="location-on" size={20} color={colors.textSecondary} />
              <Text style={{ color: colors.textPrimary }} className="ml-3 font-medium">
                Address
              </Text>
            </View>
            <View className="flex-row items-center">
              <Text style={{ color: colors.textSecondary }} className="text-sm mr-2">
                Not defined
              </Text>
              <MaterialIcons name="chevron-right" size={20} color={colors.textSecondary} />
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderPreferences = () => (
    <View className="px-6 mb-6">
      <Text
        style={{ color: colors.textPrimary }}
        className="text-lg font-bold mb-4"
      >
        Preferences
      </Text>
      
      <View 
        className="rounded-2xl border"
        style={{ 
          backgroundColor: colors.card,
          borderColor: colors.border
        }}
      >
        <View className="p-4 border-b" style={{ borderBottomColor: colors.border }}>
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center">
              <MaterialIcons name="palette" size={20} color={colors.textSecondary} />
              <Text style={{ color: colors.textPrimary }} className="ml-3 font-medium">
                Theme
              </Text>
            </View>
            <View className="flex-row items-center">
              <Text style={{ color: colors.textSecondary }} className="text-sm mr-2">
                {theme === 'system' ? 'System' : theme === 'dark' ? 'Dark' : 'Light'}
              </Text>
              <MaterialIcons name="chevron-right" size={20} color={colors.textSecondary} />
            </View>
          </View>
        </View>

        <View className="p-4 border-b" style={{ borderBottomColor: colors.border }}>
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center">
              <MaterialIcons name="notifications" size={20} color={colors.textSecondary} />
              <Text style={{ color: colors.textPrimary }} className="ml-3 font-medium">
                Notifications
              </Text>
            </View>
            <Switch
              value={settings?.transactions || settings?.security || settings?.system || false}
              onValueChange={(value) => {
              }}
              trackColor={{ false: `${colors.border}`, true: colors.primary }}
              thumbColor={settings?.transactions || settings?.security || settings?.system ? '#ffffff' : '#f3f4f6'}
            />
          </View>
        </View>

        <View className="p-4 border-b" style={{ borderBottomColor: colors.border }}>
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center">
              <MaterialIcons name="security" size={20} color={colors.textSecondary} />
              <Text style={{ color: colors.textPrimary }} className="ml-3 font-medium">
                Biometrics
              </Text>
            </View>
            <Switch
              value={true}
              onValueChange={() => {
                Alert.alert('Biometrics', 'Biometric settings will be implemented soon.');
              }}
              trackColor={{ false: `${colors.border}`, true: colors.primary }}
              thumbColor={'#ffffff'}
            />
          </View>
        </View>

        <View className="p-4">
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center">
              <MaterialIcons name="language" size={20} color={colors.textSecondary} />
              <Text style={{ color: colors.textPrimary }} className="ml-3 font-medium">
                Language
              </Text>
            </View>
            <View className="flex-row items-center">
              <Text style={{ color: colors.textSecondary }} className="text-sm mr-2">
                English
              </Text>
              <MaterialIcons name="chevron-right" size={20} color={colors.textSecondary} />
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  const renderSecurity = () => (
    <View className="px-6 mb-6">
      <Text
        style={{ color: colors.textPrimary }}
        className="text-lg font-bold mb-4"
      >
        Security
      </Text>
      
      <View 
        className="rounded-2xl border"
        style={{ 
          backgroundColor: colors.card,
          borderColor: colors.border
        }}
      >
        <TouchableOpacity className="p-4 border-b" style={{ borderBottomColor: colors.border }}>
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center">
              <MaterialIcons name="lock" size={20} color={colors.textSecondary} />
              <Text style={{ color: colors.textPrimary }} className="ml-3 font-medium">
                Change password
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={20} color={colors.textSecondary} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity className="p-4 border-b" style={{ borderBottomColor: colors.border }}>
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center">
              <MaterialIcons name="fingerprint" size={20} color={colors.textSecondary} />
              <Text style={{ color: colors.textPrimary }} className="ml-3 font-medium">
                Configure biometrics
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={20} color={colors.textSecondary} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity className="p-4 border-b" style={{ borderBottomColor: colors.border }}>
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center">
              <MaterialIcons name="devices" size={20} color={colors.textSecondary} />
              <Text style={{ color: colors.textPrimary }} className="ml-3 font-medium">
                Connected devices
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={20} color={colors.textSecondary} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity className="p-4">
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center">
              <MaterialIcons name="history" size={20} color={colors.textSecondary} />
              <Text style={{ color: colors.textPrimary }} className="ml-3 font-medium">
                Login history
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={20} color={colors.textSecondary} />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderActions = () => (
    <View className="px-6 mb-8">
      <Text
        style={{ color: colors.textPrimary }}
        className="text-lg font-bold mb-4"
      >
        Actions
      </Text>
      
      <View 
        className="rounded-2xl border"
        style={{ 
          backgroundColor: colors.card,
          borderColor: colors.border
        }}
      >
        <TouchableOpacity className="p-4 border-b" style={{ borderBottomColor: colors.border }}>
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center">
              <MaterialIcons name="help" size={20} color={colors.textSecondary} />
              <Text style={{ color: colors.textPrimary }} className="ml-3 font-medium">
                Help and support
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={20} color={colors.textSecondary} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity className="p-4 border-b" style={{ borderBottomColor: colors.border }}>
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center">
              <MaterialIcons name="description" size={20} color={colors.textSecondary} />
              <Text style={{ color: colors.textPrimary }} className="ml-3 font-medium">
                Terms of use
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={20} color={colors.textSecondary} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity className="p-4 border-b" style={{ borderBottomColor: colors.border }}>
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center">
              <MaterialIcons name="privacy-tip" size={20} color={colors.textSecondary} />
              <Text style={{ color: colors.textPrimary }} className="ml-3 font-medium">
                Privacy policy
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={20} color={colors.textSecondary} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity className="p-4 border-b" style={{ borderBottomColor: colors.border }}>
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center">
              <MaterialIcons name="info" size={20} color={colors.textSecondary} />
              <Text style={{ color: colors.textPrimary }} className="ml-3 font-medium">
                About the app
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={20} color={colors.textSecondary} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={handleSignOut}
          className="p-4 border-b" 
          style={{ borderBottomColor: colors.border }}
        >
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center">
              <MaterialIcons name="logout" size={20} color={colors.warning} />
              <Text style={{ color: colors.warning }} className="ml-3 font-medium">
                Sign out
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={20} color={colors.warning} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={handleDeleteAccount}
          className="p-4"
        >
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center">
              <MaterialIcons name="delete-forever" size={20} color={colors.error} />
              <Text style={{ color: colors.error }} className="ml-3 font-medium">
                Delete account
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={20} color={colors.error} />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={{ backgroundColor: colors.background }} className="flex-1">
      {renderHeader()}
      
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
            progressBackgroundColor={colors.background}
            title="Atualizando..."
            titleColor={colors.primary}
          />
        }
      >
        {renderPersonalInfo()}
        {renderPreferences()}
        {renderSecurity()}
        {renderActions()}
      </ScrollView>
    </View>
  );
};

export default ProfileScreen; 