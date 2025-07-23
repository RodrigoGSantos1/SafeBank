import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNotifications } from '../contexts/NotificationContext';
import { useTheme } from '../contexts/ThemeContext';

interface NotificationItemProps {
  notification: {
    id: string;
    title: string;
    body: string;
    type: 'transaction' | 'security' | 'system' | 'promotion';
    isRead: boolean;
    createdAt: Date;
    data?: any;
  };
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification }) => {
  const { markAsRead, deleteNotification } = useNotifications();
  const { colors } = useTheme();

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'transaction':
        return 'account-balance-wallet';
      case 'security':
        return 'security';
      case 'system':
        return 'settings';
      case 'promotion':
        return 'local-offer';
      default:
        return 'notifications';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'transaction':
        return colors.success;
      case 'security':
        return colors.warning;
      case 'system':
        return colors.info;
      case 'promotion':
        return colors.primary;
      default:
        return colors.textSecondary;
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString('en-US');
  };

  const handlePress = () => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
  };

  const handleLongPress = () => {
    Alert.alert(
      'Notification Options',
      'What would you like to do?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteNotification(notification.id),
        },
      ]
    );
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      onLongPress={handleLongPress}
      className={`p-4 rounded-2xl border mb-2 ${
        notification.isRead ? 'opacity-60' : ''
      }`}
      style={{ 
        backgroundColor: colors.card,
        borderColor: colors.border
      }}
    >
      <View className="flex-row items-start">
        <View 
          className="rounded-full p-2 mr-3"
          style={{ backgroundColor: `${getTypeColor(notification.type)}20` }}
        >
          <MaterialIcons 
            name={getTypeIcon(notification.type) as any} 
            size={20} 
            color={getTypeColor(notification.type)} 
          />
        </View>
        
        <View className="flex-1">
          <View className="flex-row justify-between items-start mb-2">
            <Text 
              className="font-semibold text-base flex-1 mr-2"
              style={{ color: colors.textPrimary }}
            >
              {notification.title}
            </Text>
            {!notification.isRead && (
              <View 
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: colors.primary }}
              />
            )}
          </View>
          
          <Text 
            className="text-sm mb-2"
            style={{ color: colors.textSecondary }}
          >
            {notification.body}
          </Text>
          
          <Text 
            className="text-xs"
            style={{ color: colors.textSecondary }}
          >
            {formatTime(notification.createdAt)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default NotificationItem; 