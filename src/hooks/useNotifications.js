// src/hooks/useNotifications.js
import { useState, useEffect, useCallback } from 'react';
import notificationService from '../services/notifications';
import { useApp } from '../contexts/AppContext';

export const useNotifications = () => {
  const { addNotification } = useApp();
  const [permission, setPermission] = useState(notificationService.getPermissionState());
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    const subscribed = await notificationService.isSubscribed();
    setIsSubscribed(subscribed);
  };

  const requestPermission = useCallback(async () => {
    setLoading(true);
    
    try {
      const result = await notificationService.requestPermission();
      
      if (result.success) {
        setPermission('granted');
      }
      
      return result;
    } finally {
      setLoading(false);
    }
  }, []);

  const subscribe = useCallback(async () => {
    setLoading(true);
    
    try {
      const result = await notificationService.subscribe();
      
      if (result.success) {
        setIsSubscribed(true);
        addNotification({
          type: 'success',
          title: 'Notificaciones activadas',
          body: 'Recibirás alertas de predicciones calientes'
        });
      }
      
      return result;
    } finally {
      setLoading(false);
    }
  }, [addNotification]);

  const unsubscribe = useCallback(async () => {
    setLoading(true);
    
    try {
      const result = await notificationService.unsubscribe();
      
      if (result.success) {
        setIsSubscribed(false);
        addNotification({
          type: 'info',
          title: 'Notificaciones desactivadas',
          body: 'Ya no recibirás alertas push'
        });
      }
      
      return result;
    } finally {
      setLoading(false);
    }
  }, [addNotification]);

  const showNotification = useCallback(async (title, body, options) => {
    return await notificationService.showLocalNotification(title, body, options);
  }, []);

  return {
    permission,
    isSubscribed,
    loading,
    isSupported: notificationService.isSupported,
    requestPermission,
    subscribe,
    unsubscribe,
    showNotification,
    checkSubscription
  };
};