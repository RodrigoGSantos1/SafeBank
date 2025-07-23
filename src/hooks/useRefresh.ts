import { useState, useCallback } from 'react';

export interface UseRefreshOptions {
  minRefreshTime?: number;
  showAlertOnError?: boolean;
}

export interface UseRefreshReturn {
  isRefreshing: boolean;
  onRefresh: (refreshFunction: () => Promise<void>) => Promise<void>;
}

export const useRefresh = (options: UseRefreshOptions = {}): UseRefreshReturn => {
  const {
    minRefreshTime = 1000,
    showAlertOnError = true
  } = options;

  const [isRefreshing, setIsRefreshing] = useState(false);

  const onRefresh = useCallback(async (refreshFunction: () => Promise<void>) => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    const startTime = Date.now();

    try {
      await refreshFunction();
      
      const elapsed = Date.now() - startTime;
      const remainingTime = minRefreshTime - elapsed;
      
      if (remainingTime > 0) {
        await new Promise(resolve => setTimeout(resolve, remainingTime));
      }
    } catch (error) {
      
      if (showAlertOnError) {
        const { Alert } = await import('react-native');
        Alert.alert(
          'Refresh Failed',
          'Unable to refresh data. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, minRefreshTime, showAlertOnError]);

  return {
    isRefreshing,
    onRefresh
  };
}; 