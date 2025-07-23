import React from 'react';
import { View, Text } from 'react-native';
import { useNotifications } from '../contexts/NotificationContext';

interface NotificationBadgeProps {
  size?: 'small' | 'medium' | 'large';
  showNumber?: boolean;
  className?: string;
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  size = 'medium',
  showNumber = true,
  className = '',
}) => {
  const { unreadCount } = useNotifications();

  if (unreadCount === 0) return null;

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'w-4 h-4';
      case 'large':
        return 'w-6 h-6';
      default:
        return 'w-4 h-4';
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'small':
        return 'text-xs';
      case 'large':
        return 'text-sm';
      default:
        return 'text-xs';
    }
  };

  return (
    <View
      className={`absolute -top-1 -right-1 bg-red-500 rounded-full items-center justify-center ${getSizeClasses()} ${className}`}
    >
      {showNumber && unreadCount > 0 && (
        <Text className={`text-white font-bold ${getTextSize()}`}>
          {unreadCount > 99 ? '99+' : unreadCount.toString()}
        </Text>
      )}
    </View>
  );
};

export default NotificationBadge; 