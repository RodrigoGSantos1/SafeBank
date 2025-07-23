export interface User {
  id: string;
  email: string;
  name: string;
  isEmailVerified: boolean;
}

export interface Transaction {
  id: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  description?: string;
  createdAt: Date;
  status: 'pending' | 'completed' | 'failed';
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  type: 'transaction' | 'security' | 'system' | 'promotion';
  data?: {
    transactionId?: string;
    userId?: string;
    amount?: number;
    [key: string]: any;
  };
  isRead: boolean;
  createdAt: Date;
  expiresAt?: Date;
}

export interface NotificationSettings {
  transactions: boolean;
  security: boolean;
  system: boolean;
  promotions: boolean;
  sound: boolean;
  vibration: boolean;
}

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Register: undefined;
  BiometricLogin: undefined;
  Home: undefined;
  Transfer: undefined;
  Users: undefined;
  History: undefined;
  Profile: undefined;
  Notifications: undefined;
}; 