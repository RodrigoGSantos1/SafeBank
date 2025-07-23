import { getUserNotifications, createNotification } from './firebase/firestore';

interface FirestoreNotification {
  id?: string;
  title: string;
  body: string;
  type: string;
  data?: any;
  createdAt: any;
  isRead: boolean;
}

class NotificationSyncService {
  private static instance: NotificationSyncService;

  private constructor() {}

  static getInstance(): NotificationSyncService {
    if (!NotificationSyncService.instance) {
      NotificationSyncService.instance = new NotificationSyncService();
    }
    return NotificationSyncService.instance;
  }

  async syncNotificationsFromFirestore(userId: string, addNotification: (notification: any) => void): Promise<void> {
    try {
      const firestoreNotifications = await getUserNotifications(userId);
      
      firestoreNotifications.forEach((firestoreNotification: FirestoreNotification) => {
        const localNotification = {
          id: firestoreNotification.id || `firestore-${Date.now()}-${Math.random()}`,
          title: firestoreNotification.title,
          body: firestoreNotification.body,
          type: firestoreNotification.type,
          data: firestoreNotification.data,
          createdAt: firestoreNotification.createdAt.toDate(),
          isRead: firestoreNotification.isRead,
        };
        
        addNotification(localNotification);
      });
    } catch (error) {
    }
  }

  async markNotificationAsRead(notificationId: string, userId: string): Promise<void> {
    try {
    } catch (error) {
    }
  }

  async sendNotificationToUser(
    userId: string,
    title: string,
    body: string,
    type: 'transaction' | 'security' | 'general',
    data?: any
  ): Promise<void> {
    try {
      const notification = {
        userId,
        title,
        body,
        type,
        isRead: false,
        data
      };

      await createNotification(notification);
    } catch (error) {
    }
  }

  async startNotificationPolling(
    userId: string,
    addNotification: (notification: any) => void,
    intervalMs: number = 30000
  ): Promise<() => void> {
    let isPolling = true;
    
    const poll = async () => {
      if (!isPolling) return;
      
      try {
        await this.syncNotificationsFromFirestore(userId, addNotification);
      } catch (error) {
      }
      
      if (isPolling) {
        setTimeout(poll, intervalMs);
      }
    };
    
    poll();
    
    return () => {
      isPolling = false;
    };
  }
}

export default NotificationSyncService; 