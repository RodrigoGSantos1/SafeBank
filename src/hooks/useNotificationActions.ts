import { useCallback } from 'react';
import NotificationService from '../services/notifications';
import { useNotifications } from '../contexts/NotificationContext';

export const useNotificationActions = () => {
  const { addNotification } = useNotifications();
  const notificationService = NotificationService.getInstance();

  const notifyTransaction = useCallback(async (
    type: 'received' | 'sent' | 'failed',
    amount: number,
    fromUser?: string,
    toUser?: string
  ) => {
    try {
      await notificationService.notifyTransaction(type, amount, fromUser, toUser);

      let title = '';
      let body = '';

      switch (type) {
        case 'received':
          title = '💰 Transferência Recebida';
          body = `Você recebeu R$ ${amount.toFixed(2)}${fromUser ? ` de ${fromUser}` : ''}`;
          break;
        case 'sent':
          title = '💸 Transferência Enviada';
          body = `Você enviou R$ ${amount.toFixed(2)}${toUser ? ` para ${toUser}` : ''}`;
          break;
        case 'failed':
          title = '❌ Transferência Falhou';
          body = `A transferência de R$ ${amount.toFixed(2)} falhou`;
          break;
      }

      addNotification({
        title,
        body,
        type: 'transaction',
        data: {
          transactionType: type,
          amount,
          fromUser,
          toUser,
        },
      });
    } catch (error) {
      console.error('Erro ao enviar notificação de transação:', error);
    }
  }, [addNotification]);

  const notifySecurity = useCallback(async (
    type: 'login' | 'logout' | 'biometric' | 'password_change',
    location?: string
  ) => {
    try {
      await notificationService.notifySecurity(type, location);

      let title = '';
      let body = '';

      switch (type) {
        case 'login':
          title = '🔐 Login Realizado';
          body = `Login realizado com sucesso${location ? ` em ${location}` : ''}`;
          break;
        case 'logout':
          title = '🚪 Logout Realizado';
          body = 'Você foi desconectado do SafeBank';
          break;
        case 'biometric':
          title = '👆 Login Biométrico';
          body = 'Login realizado usando biometria';
          break;
        case 'password_change':
          title = '🔑 Senha Alterada';
          body = 'Sua senha foi alterada com sucesso';
          break;
      }

      addNotification({
        title,
        body,
        type: 'security',
        data: {
          securityType: type,
          location,
        },
      });
    } catch (error) {
      console.error('Erro ao enviar notificação de segurança:', error);
    }
  }, [addNotification]);

  const notifySystem = useCallback(async (
    title: string,
    body: string,
    data?: any
  ) => {
    try {
      await notificationService.notifySystem(title, body, data);

      addNotification({
        title,
        body,
        type: 'system',
        data,
      });
    } catch (error) {
      console.error('Erro ao enviar notificação do sistema:', error);
    }
  }, [addNotification]);

  const notifyPromotion = useCallback(async (
    title: string,
    body: string,
    data?: any
  ) => {
    try {
      await notificationService.notifyPromotion(title, body, data);

      addNotification({
        title,
        body,
        type: 'promotion',
        data,
      });
    } catch (error) {
      console.error('Erro ao enviar notificação promocional:', error);
    }
  }, [addNotification]);

  return {
    notifyTransaction,
    notifySecurity,
    notifySystem,
    notifyPromotion,
  };
}; 