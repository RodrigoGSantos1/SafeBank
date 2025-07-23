import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface NotificationSettings {
  transactions: boolean;
  security: boolean;
  system: boolean;
  promotions: boolean;
  sound: boolean;
  vibration: boolean;
}

class NotificationService {
  private static instance: NotificationService;
  private expoPushToken: string | null = null;
  private settings: NotificationSettings = {
    transactions: true,
    security: true,
    system: true,
    promotions: false,
    sound: true,
    vibration: true,
  };

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async initialize(): Promise<void> {
    try {
      await this.loadSettings();
      
      const { status } = await Notifications.requestPermissionsAsync();
      
      if (status !== 'granted') {
        return;
      }

      const token = await Notifications.getExpoPushTokenAsync({
        projectId: process.env.EXPO_PROJECT_ID,
      });

      this.expoPushToken = token.data;

      this.setupNotificationListeners();
    } catch (error) {
    }
  }

  private setupNotificationListeners(): void {
    Notifications.addNotificationReceivedListener((notification) => {
      this.handleNotificationReceived(notification);
    });

    Notifications.addNotificationResponseReceivedListener((response) => {
      this.handleNotificationResponse(response);
    });
  }

  async sendLocalNotification(
    title: string,
    body: string,
    data?: any,
    sound: boolean = true
  ): Promise<string> {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: sound && this.settings.sound ? 'default' : undefined,
        },
        trigger: null,
      });

      return notificationId;
    } catch (error) {
      throw error;
    }
  }

  async scheduleNotification(
    title: string,
    body: string,
    trigger: Notifications.NotificationTriggerInput,
    data?: any
  ): Promise<string> {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: this.settings.sound ? 'default' : undefined,
        },
        trigger,
      });

      return notificationId;
    } catch (error) {
      throw error;
    }
  }

  async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
    }
  }

  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
    }
  }

  async notifyTransaction(
    type: 'received' | 'sent' | 'failed',
    amount: number,
    fromUser?: string,
    toUser?: string
  ): Promise<void> {
    if (!this.settings.transactions) return;

    let title = '';
    let body = '';

    switch (type) {
      case 'received':
        title = '💰 Transfer Received';
        body = `You received $${amount.toFixed(2)}${fromUser ? ` from ${fromUser}` : ''}`;
        break;
      case 'sent':
        title = '💸 Transfer Sent';
        body = `You sent $${amount.toFixed(2)}${toUser ? ` to ${toUser}` : ''}`;
        break;
      case 'failed':
        title = '❌ Transfer Failed';
        body = `The transfer of $${amount.toFixed(2)} failed`;
        break;
    }

    await this.sendLocalNotification(title, body, {
      type: 'transaction',
      transactionType: type,
      amount,
    });
  }

  async notifySecurity(
    type: 'login' | 'logout' | 'biometric' | 'password_change',
    location?: string
  ): Promise<void> {
    if (!this.settings.security) return;

    let title = '';
    let body = '';

    switch (type) {
      case 'login':
        title = '🔐 Login Successful';
        body = `Login completed successfully${location ? ` in ${location}` : ''}`;
        break;
      case 'logout':
        title = '🚪 Logout Completed';
        body = 'You have been disconnected from SafeBank';
        break;
      case 'biometric':
        title = '👆 Biometric Login';
        body = 'Login completed using biometrics';
        break;
      case 'password_change':
        title = '🔑 Password Changed';
        body = 'Your password has been changed successfully';
        break;
    }

    await this.sendLocalNotification(title, body, {
      type: 'security',
      securityType: type,
      location,
    });
  }

  async notifySystem(
    title: string,
    body: string,
    data?: any
  ): Promise<void> {
    if (!this.settings.system) return;

    await this.sendLocalNotification(title, body, {
      type: 'system',
      ...data,
    });
  }

  async notifyPromotion(
    title: string,
    body: string,
    data?: any
  ): Promise<void> {
    if (!this.settings.promotions) return;

    await this.sendLocalNotification(title, body, {
      type: 'promotion',
      ...data,
    });
  }

  async loadSettings(): Promise<void> {
    try {
      const savedSettings = await AsyncStorage.getItem('notificationSettings');
      if (savedSettings) {
        this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
      }
    } catch (error) {
    }
  }

  async saveSettings(settings: Partial<NotificationSettings>): Promise<void> {
    try {
      this.settings = { ...this.settings, ...settings };
      await AsyncStorage.setItem('notificationSettings', JSON.stringify(this.settings));
    } catch (error) {
    }
  }

  getSettings(): NotificationSettings {
    return { ...this.settings };
  }

  getExpoPushToken(): string | null {
    return this.expoPushToken;
  }

  private handleNotificationReceived(notification: Notifications.Notification): void {
  }

  private handleNotificationResponse(response: Notifications.NotificationResponse): void {
    const data = response.notification.request.content.data;
  }
}

export default NotificationService; 