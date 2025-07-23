import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  RefreshControl,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNotifications } from "../../contexts/NotificationContext";
import { useSecureAuth as useAuth } from "../../contexts/SecureAuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { useAnimations } from "../../hooks";
import NotificationItem from "../../components/NotificationItem";
import { NotificationSettings } from "../../types";

const NotificationsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuth();
  const { colors } = useTheme();
  const { animateIn } = useAnimations();
  const {
    notifications,
    unreadCount,
    settings,
    markAllAsRead,
    clearAllNotifications,
    updateSettings,
    sendTestNotification,
    syncNotifications,
  } = useNotifications();

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      if (user?.id) {
        await syncNotifications();
      }
    } catch (error) {
      console.error("❌ Error syncing notifications:", error);
    } finally {
      setTimeout(() => setRefreshing(false), 1000);
    }
  };

  const handleMarkAllAsRead = () => {
    Alert.alert(
      "Mark as Read",
      "Do you want to mark all notifications as read?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Confirm", onPress: markAllAsRead },
      ]
    );
  };

  const handleClearAll = () => {
    Alert.alert(
      "Clear Notifications",
      "Do you want to delete all notifications? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: clearAllNotifications,
        },
      ]
    );
  };

  const handleSettingChange = (
    key: keyof NotificationSettings,
    value: boolean
  ) => {
    updateSettings({ [key]: value });
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
          Notifications
        </Text>
        <View className="w-10" />
      </View>

      <View
        className="rounded-2xl p-4 border"
        style={{
          backgroundColor: colors.card,
          borderColor: colors.border,
        }}
      >
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center">
            <View
              className="rounded-full p-2 mr-3"
              style={{ backgroundColor: `${colors.primary}20` }}
            >
              <MaterialIcons
                name="notifications"
                size={20}
                color={colors.primary}
              />
            </View>
            <View>
              <Text
                style={{ color: colors.textPrimary }}
                className="font-semibold text-base"
              >
                {unreadCount} unread
              </Text>
              <Text style={{ color: colors.textSecondary }} className="text-sm">
                {notifications.length} notifications
              </Text>
            </View>
          </View>
          <View className="flex-row space-x-2">
            {unreadCount > 0 && (
              <TouchableOpacity
                onPress={handleMarkAllAsRead}
                className="px-3 py-1 rounded-lg"
                style={{ backgroundColor: `${colors.primary}20` }}
              >
                <Text
                  style={{ color: colors.primary }}
                  className="text-sm font-medium"
                >
                  Mark Read
                </Text>
              </TouchableOpacity>
            )}
            {notifications.length > 0 && (
              <TouchableOpacity
                onPress={handleClearAll}
                className="px-3 py-1 rounded-lg"
                style={{ backgroundColor: `${colors.error}20` }}
              >
                <Text
                  style={{ color: colors.error }}
                  className="text-sm font-medium"
                >
                  Clear
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </View>
  );

  const renderSettingsSection = () => (
    <View className="px-6 mb-6">
      <Text
        style={{ color: colors.textPrimary }}
        className="text-lg font-bold mb-4"
      >
        Settings
      </Text>

      <View
        className="rounded-2xl border"
        style={{
          backgroundColor: colors.card,
          borderColor: colors.border,
        }}
      >
        <View
          className="p-4 border-b"
          style={{ borderBottomColor: colors.border }}
        >
          <View className="flex-row justify-between items-center">
            <View className="flex-1">
              <Text
                style={{ color: colors.textPrimary }}
                className="font-medium"
              >
                Transactions
              </Text>
              <Text style={{ color: colors.textSecondary }} className="text-sm">
                Payment notifications
              </Text>
            </View>
            <Switch
              value={settings?.transactions || false}
              onValueChange={(value) =>
                handleSettingChange("transactions", value)
              }
              trackColor={{ false: `${colors.border}`, true: colors.primary }}
              thumbColor={settings?.transactions ? "#ffffff" : "#f3f4f6"}
            />
          </View>
        </View>

        <View
          className="p-4 border-b"
          style={{ borderBottomColor: colors.border }}
        >
          <View className="flex-row justify-between items-center">
            <View className="flex-1">
              <Text
                style={{ color: colors.textPrimary }}
                className="font-medium"
              >
                Security
              </Text>
              <Text style={{ color: colors.textSecondary }} className="text-sm">
                Security alerts
              </Text>
            </View>
            <Switch
              value={settings.security}
              onValueChange={(value) => handleSettingChange("security", value)}
              trackColor={{ false: `${colors.border}`, true: colors.primary }}
              thumbColor={settings.security ? "#ffffff" : "#f3f4f6"}
            />
          </View>
        </View>

        <View
          className="p-4 border-b"
          style={{ borderBottomColor: colors.border }}
        >
          <View className="flex-row justify-between items-center">
            <View className="flex-1">
              <Text
                style={{ color: colors.textPrimary }}
                className="font-medium"
              >
                System
              </Text>
              <Text style={{ color: colors.textSecondary }} className="text-sm">
                App updates
              </Text>
            </View>
            <Switch
              value={settings.system}
              onValueChange={(value) => handleSettingChange("system", value)}
              trackColor={{ false: `${colors.border}`, true: colors.primary }}
              thumbColor={settings.system ? "#ffffff" : "#f3f4f6"}
            />
          </View>
        </View>

        <View className="p-4">
          <View className="flex-row justify-between items-center">
            <View className="flex-1">
              <Text
                style={{ color: colors.textPrimary }}
                className="font-medium"
              >
                Sound
              </Text>
              <Text style={{ color: colors.textSecondary }} className="text-sm">
                Play sound for notifications
              </Text>
            </View>
            <Switch
              value={settings.sound}
              onValueChange={(value) => handleSettingChange("sound", value)}
              trackColor={{ false: `${colors.border}`, true: colors.primary }}
              thumbColor={settings.sound ? "#ffffff" : "#f3f4f6"}
            />
          </View>
        </View>
      </View>
    </View>
  );

  const renderNotificationsList = () => (
    <View className="px-6 mb-8">
      <View className="flex-row items-center justify-between mb-4">
        <Text
          style={{ color: colors.textPrimary }}
          className="text-lg font-bold"
        >
          History
        </Text>
        {notifications.length > 0 && (
          <TouchableOpacity
            onPress={sendTestNotification}
            className="px-3 py-1 rounded-lg"
            style={{ backgroundColor: `${colors.primary}20` }}
          >
            <Text
              style={{ color: colors.primary }}
              className="text-sm font-medium"
            >
              Test
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {notifications.length === 0 ? (
        <View
          className="rounded-2xl p-8 items-center justify-center border"
          style={{
            backgroundColor: colors.card,
            borderColor: colors.border,
          }}
        >
          <MaterialIcons
            name="notifications-none"
            size={48}
            color={colors.textSecondary}
          />
          <Text
            style={{ color: colors.textSecondary }}
            className="text-base text-center mt-4 font-medium"
          >
            No notifications
          </Text>
          <Text
            style={{ color: colors.textSecondary }}
            className="text-sm text-center mt-2"
          >
            Your notifications will appear here
          </Text>
        </View>
      ) : (
        <View className="space-y-3">
          {notifications.map((notification, index) => (
            <NotificationItem
              key={notification.id || index}
              notification={notification}
            />
          ))}
        </View>
      )}
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
            title="Updating..."
            titleColor={colors.primary}
          />
        }
      >
        {renderSettingsSection()}
        {renderNotificationsList()}
      </ScrollView>
    </View>
  );
};

export default NotificationsScreen;
