import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import NotificationService from '../services/notifications';
import NotificationSyncService from '../services/notificationsSync';

interface Notification {
  id: string;
  title: string;
  body: string;
  type: 'transaction' | 'security' | 'system' | 'promotion';
  isRead: boolean;
  createdAt: Date;
  data?: any;
}

interface NotificationSettings {
  transactions: boolean;
  security: boolean;
  system: boolean;
  promotions: boolean;
  sound: boolean;
  vibration: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  settings: NotificationSettings;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;
  updateSettings: (settings: Partial<NotificationSettings>) => void;
  sendTestNotification: () => void;
  syncNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>({
    transactions: true,
    security: true,
    system: true,
    promotions: false,
    sound: true,
    vibration: true,
  });

  useEffect(() => {
    if (!settings) {
      setSettings({
        transactions: true,
        security: true,
        system: true,
        promotions: false,
        sound: true,
        vibration: true,
      });
    }
  }, [settings]);
  const [notificationService] = useState(() => NotificationService.getInstance());
  const [syncService] = useState(() => NotificationSyncService.getInstance());

  useEffect(() => {
    notificationService.initialize();
  }, [notificationService]);

  useEffect(() => {
    const interval = setInterval(() => {
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const addNotification = useCallback((notificationData: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => {
    const newNotification: Notification = {
      id: `local-${Date.now()}-${Math.random()}`,
      title: notificationData.title,
      body: notificationData.body,
      type: notificationData.type,
      isRead: false,
      createdAt: new Date(),
      data: notificationData.data,
    };

    setNotifications(prev => {
      const existingIndex = prev.findIndex(n => n.id === newNotification.id);
      if (existingIndex >= 0) {
        return prev;
      }
      return [newNotification, ...prev];
    });
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, isRead: true }))
    );
  }, []);

  const deleteNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const updateSettings = useCallback(async (newSettings: Partial<NotificationSettings>) => {
    try {
      await notificationService.saveSettings(newSettings);
      setSettings(prev => ({ ...prev, ...newSettings }));
    } catch (error) {
    }
  }, [notificationService]);

  const sendTestNotification = useCallback(async () => {
    try {
      await notificationService.sendLocalNotification(
        'Test Notification',
        'This is a test notification from SafeBank',
        { type: 'system' }
      );
    } catch (error) {
    }
  }, [notificationService]);

  const syncNotifications = useCallback(async () => {
    try {
      const currentUser = null;
      if (currentUser && typeof currentUser === 'object' && 'uid' in currentUser) {
        await syncService.syncNotificationsFromFirestore(
          (currentUser as any).uid,
          addNotification
        );
      }
    } catch (error) {
    }
  }, [syncService, addNotification]);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    settings: settings || {
      transactions: true,
      security: true,
      system: true,
      promotions: false,
      sound: true,
      vibration: true,
    },
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    updateSettings,
    sendTestNotification,
    syncNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }

  if (!context.settings) {
    context.settings = {
      transactions: true,
      security: true,
      system: true,
      promotions: false,
      sound: true,
      vibration: true,
    };
  }
  
  return context;
}; 