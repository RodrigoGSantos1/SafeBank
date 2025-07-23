import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  getDocs,
  updateDoc,
  deleteDoc,
  Timestamp 
} from 'firebase/firestore';
import { db } from './config';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  balance?: number;
  profilePicture?: string;
  isActive: boolean;
}

export interface Transaction {
  id?: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  description: string;
  type: 'transfer' | 'deposit' | 'withdraw';
  status: 'pending' | 'completed' | 'failed';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Notification {
  id?: string;
  userId: string;
  title: string;
  body: string;
  type: 'transaction' | 'security' | 'general';
  isRead: boolean;
  createdAt: Timestamp;
  data?: any;
}

export interface UserSettings {
  id?: string;
  userId: string;
  theme: 'dark' | 'light';
  biometricEnabled: boolean;
  notificationsEnabled: boolean;
  language: 'pt' | 'en';
  updatedAt: Timestamp;
}

export const createUserProfile = async (
  userId: string, 
  email: string, 
  name: string
): Promise<{ success: boolean; message?: string }> => {
  try {
    const userProfile: UserProfile = {
      id: userId,
      email: email.toLowerCase().trim(),
      name: name.trim(),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      balance: 1000.00,
      isActive: true
    };

    await setDoc(doc(db, 'users', userId), userProfile);

    const defaultSettings: UserSettings = {
      userId: userId,
      theme: 'dark',
      biometricEnabled: false,
      notificationsEnabled: true,
      language: 'pt',
      updatedAt: Timestamp.now()
    };

    await setDoc(doc(db, 'user_settings', userId), defaultSettings);

    return { success: true, message: 'User profile created successfully' };

  } catch (error) {
    return { 
      success: false, 
      message: 'Failed to create user profile. Please try again.' 
    };
  }
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data() as UserProfile;
      return userData;
    } else {
      return null;
    }
  } catch (error) {
    return null;
  }
};

export const updateUserProfile = async (
  userId: string, 
  updates: Partial<UserProfile>
): Promise<{ success: boolean; message?: string }> => {
  try {
    const userRef = doc(db, 'users', userId);
    
    const updateData = {
      ...updates,
      updatedAt: Timestamp.now()
    };

    await updateDoc(userRef, updateData);

    return { success: true, message: 'Profile updated successfully' };

  } catch (error) {
    return { 
      success: false, 
      message: 'Failed to update profile. Please try again.' 
    };
  }
};

export const getAllUsers = async (excludeUserId?: string): Promise<UserProfile[]> => {
  try {
    const usersQuery = query(
      collection(db, 'users'),
      where('isActive', '==', true)
    );

    const querySnapshot = await getDocs(usersQuery);
    const users: UserProfile[] = [];

    querySnapshot.forEach((doc) => {
      const userData = doc.data() as UserProfile;
      if (!excludeUserId || userData.id !== excludeUserId) {
        users.push(userData);
      }
    });

    return users;

  } catch (error) {
    return [];
  }
};

export const createTransferBetweenUsers = async (
  fromUserId: string,
  toUserId: string,
  amount: number,
  description: string
): Promise<{ success: boolean; message?: string; transactionId?: string }> => {
  try {

    const senderProfile = await getUserProfile(fromUserId);
    if (!senderProfile || (senderProfile.balance || 0) < amount) {
      return {
        success: false,
        message: 'Insufficient balance for this transfer',
      };
    }

    const recipientProfile = await getUserProfile(toUserId);
    if (!recipientProfile) {
      return {
        success: false,
        message: 'Recipient user not found',
      };
    }

    const transaction: Omit<Transaction, 'id'> = {
      fromUserId,
      toUserId,
      amount,
      description,
      type: 'transfer',
      status: 'completed',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const transactionRef = await addDoc(collection(db, 'transactions'), transaction);

    await updateUserProfile(fromUserId, {
      balance: (senderProfile.balance || 0) - amount,
    });

    await updateUserProfile(toUserId, {
      balance: (recipientProfile.balance || 0) + amount,
    });

    const senderNotification = {
      userId: fromUserId,
      title: '💸 Transferência Enviada',
      body: `Você enviou R$ ${amount.toFixed(2)} para ${recipientProfile.name}`,
      type: 'transaction' as const,
      isRead: false,
      data: {
        transactionId: transactionRef.id,
        transactionType: 'sent',
        amount: amount,
        recipientName: recipientProfile.name,
        recipientId: toUserId
      }
    };

    const recipientNotification = {
      userId: toUserId,
      title: '💰 Transferência Recebida',
      body: `Você recebeu R$ ${amount.toFixed(2)} de ${senderProfile.name}`,
      type: 'transaction' as const,
      isRead: false,
      data: {
        transactionId: transactionRef.id,
        transactionType: 'received',
        amount: amount,
        senderName: senderProfile.name,
        senderId: fromUserId
      }
    };

    try {
      const [senderResult, recipientResult] = await Promise.all([
        createNotification(senderNotification),
        createNotification(recipientNotification)
      ]);
      
      if (!senderResult.success) {
      }
      
      if (!recipientResult.success) {
      }
      
    } catch (error) {
    }

    return {
      success: true,
      message: `Transfer of $${amount.toFixed(2)} completed successfully`,
      transactionId: transactionRef.id,
    };

  } catch (error) {
    return {
      success: false,
      message: 'Failed to complete transfer. Please try again.',
    };
  }
};

export const createTransaction = async (
  transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>
): Promise<{ success: boolean; message?: string; transactionId?: string }> => {
  try {
    const newTransaction: Omit<Transaction, 'id'> = {
      ...transaction,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    const docRef = await addDoc(collection(db, 'transactions'), newTransaction);

    return { 
      success: true, 
      message: 'Transaction completed successfully',
      transactionId: docRef.id 
    };

  } catch (error) {
    return { 
      success: false, 
      message: 'Failed to process transaction. Please try again.' 
    };
  }
};

export const createTransactionWithBalanceUpdate = async (
  userId: string,
  transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>
): Promise<{ success: boolean; message?: string; transactionId?: string }> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return { 
        success: false, 
        message: 'User not found' 
      };
    }

    const currentUser = userDoc.data() as UserProfile;
    const currentBalance = currentUser.balance || 0;
    
    const newBalance = currentBalance + transaction.amount;
    
    if (newBalance < 0) {
      return { 
        success: false, 
        message: 'Insufficient balance for this transaction' 
      };
    }

    const newTransaction: Omit<Transaction, 'id'> = {
      ...transaction,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    const transactionRef = await addDoc(collection(db, 'transactions'), newTransaction);

    await updateDoc(userRef, {
      balance: newBalance,
      updatedAt: Timestamp.now()
    });

    return { 
      success: true, 
      message: 'Transaction completed and balance updated successfully',
      transactionId: transactionRef.id 
    };

  } catch (error) {
    return { 
      success: false, 
      message: 'Failed to process transaction. Please try again.' 
    };
  }
};

export const getUserTransactions = async (
  userId: string
): Promise<Transaction[]> => {
  try {
    const sentQuery = query(
      collection(db, 'transactions'),
      where('fromUserId', '==', userId)
    );

    const receivedQuery = query(
      collection(db, 'transactions'),
      where('toUserId', '==', userId)
    );

    const [sentSnapshot, receivedSnapshot] = await Promise.all([
      getDocs(sentQuery),
      getDocs(receivedQuery)
    ]);

    const transactions: Transaction[] = [];

    sentSnapshot.forEach((doc) => {
      const data = doc.data();
      
      const isDepositToSelf = data.type === 'deposit' && data.fromUserId === data.toUserId;
      const adjustedAmount = isDepositToSelf ? Math.abs(data.amount) : -Math.abs(data.amount);
      
      transactions.push({ 
        id: doc.id, 
        ...data,
        amount: adjustedAmount
      } as Transaction);
    });

    receivedSnapshot.forEach((doc) => {
      const data = doc.data();
      
      const isDuplicateDeposit = data.type === 'deposit' && data.fromUserId === data.toUserId;
      
      if (!isDuplicateDeposit) {
        transactions.push({ 
          id: doc.id, 
          ...data,
          amount: Math.abs(data.amount)
        } as Transaction);
      }
    });

    transactions.sort((a, b) => {
      const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
      const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
      return timeB - timeA;
    });

    return transactions;

  } catch (error) {
    return [];
  }
};

export const createNotification = async (
  notification: Omit<Notification, 'id' | 'createdAt'>
): Promise<{ success: boolean; message?: string }> => {
  try {
    const newNotification: Omit<Notification, 'id'> = {
      ...notification,
      createdAt: Timestamp.now()
    };

    const docRef = await addDoc(collection(db, 'notifications'), newNotification);

    return { success: true, message: 'Notification created successfully' };

  } catch (error) {
    return { 
      success: false, 
      message: 'Failed to create notification' 
    };
  }
};

export const getUserNotifications = async (userId: string): Promise<Notification[]> => {
  try {
    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('userId', '==', userId)
    );

    const querySnapshot = await getDocs(notificationsQuery);
    const notifications: Notification[] = [];

    querySnapshot.forEach((doc) => {
      const notificationData = doc.data();
      notifications.push({ id: doc.id, ...notificationData } as Notification);
    });

    notifications.sort((a, b) => {
      const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
      const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
      return timeB - timeA;
    });

    return notifications;

  } catch (error) {
    return [];
  }
};

export const getUserSettings = async (userId: string): Promise<UserSettings | null> => {
  try {
    const settingsRef = doc(db, 'user_settings', userId);
    const settingsDoc = await getDoc(settingsRef);
    
    if (settingsDoc.exists()) {
      return settingsDoc.data() as UserSettings;
    } else {
      return null;
    }
  } catch (error) {
    return null;
  }
};

export const updateUserSettings = async (
  userId: string, 
  settings: Partial<UserSettings>
): Promise<{ success: boolean; message?: string }> => {
  try {
    const settingsRef = doc(db, 'user_settings', userId);
    
    const updateData = {
      ...settings,
      updatedAt: Timestamp.now()
    };

    await updateDoc(settingsRef, updateData);

    return { success: true, message: 'Settings updated successfully' };

  } catch (error) {
    return { 
      success: false, 
      message: 'Failed to update settings. Please try again.' 
    };
  }
};

export const updateUserBalance = async (
  userId: string, 
  newBalance: number
): Promise<{ success: boolean; message?: string }> => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      balance: newBalance,
      updatedAt: Timestamp.now()
    });

    return { success: true, message: 'Balance updated successfully' };

  } catch (error) {
    return { 
      success: false, 
      message: 'Failed to update balance. Please try again.' 
    };
  }
}; 