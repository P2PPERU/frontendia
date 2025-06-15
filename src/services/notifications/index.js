import api, { API_ROUTES } from '../api';

class NotificationService {
  constructor() {
    this.swRegistration = null;
    this.isSupported = 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
  }

  // Inicializar servicio
  async init() {
    if (!this.isSupported) {
      console.warn('Push notifications not supported');
      return false;
    }

    try {
      // Esperar a que el service worker esté listo
      this.swRegistration = await navigator.serviceWorker.ready;
      return true;
    } catch (error) {
      console.error('Error initializing notifications:', error);
      return false;
    }
  }

  // Verificar permisos
  getPermissionState() {
    if (!this.isSupported) return 'unsupported';
    return Notification.permission;
  }

  // Solicitar permisos
  async requestPermission() {
    if (!this.isSupported) {
      return { success: false, message: 'Las notificaciones no son compatibles con tu navegador' };
    }

    try {
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        return { success: true, permission };
      } else if (permission === 'denied') {
        return { success: false, message: 'Has bloqueado las notificaciones. Habilítalas en la configuración del navegador.' };
      } else {
        return { success: false, message: 'No se otorgaron permisos de notificación' };
      }
    } catch (error) {
      return { success: false, message: 'Error al solicitar permisos' };
    }
  }

  // Obtener VAPID public key
  async getVapidPublicKey() {
    try {
      const response = await api.get(API_ROUTES.VAPID_KEY);
      
      if (response.data.success) {
        return response.data.publicKey;
      }
      
      throw new Error('No se pudo obtener la clave pública');
    } catch (error) {
      console.error('Error getting VAPID key:', error);
      return null;
    }
  }

  // Convertir VAPID key a Uint8Array
  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Suscribir a notificaciones
  async subscribe() {
    if (!this.isSupported || !this.swRegistration) {
      return { success: false, message: 'Servicio no inicializado' };
    }

    try {
      // Verificar permisos primero
      const permission = await this.requestPermission();
      if (!permission.success) {
        return permission;
      }

      // Obtener VAPID key
      const vapidPublicKey = await this.getVapidPublicKey();
      if (!vapidPublicKey) {
        return { success: false, message: 'No se pudo obtener la configuración del servidor' };
      }

      // Verificar si ya está suscrito
      let subscription = await this.swRegistration.pushManager.getSubscription();
      
      if (!subscription) {
        // Crear nueva suscripción
        subscription = await this.swRegistration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey)
        });
      }

      // Enviar suscripción al backend
      const result = await api.post(API_ROUTES.SUBSCRIBE, {
        subscription: subscription.toJSON(),
        deviceType: this.getDeviceType()
      });

      if (result.data.success) {
        // Guardar estado local
        localStorage.setItem('ia_sport_push_subscribed', 'true');
        
        // Mostrar notificación de confirmación
        this.showLocalNotification(
          '¡Notificaciones activadas!',
          'Recibirás alertas de predicciones calientes 🔥'
        );
        
        return { success: true, subscription };
      }

      return { success: false, message: result.data.message || 'Error al suscribir' };
    } catch (error) {
      console.error('Error subscribing to push:', error);
      return { success: false, message: 'Error al activar notificaciones' };
    }
  }

  // Desuscribir de notificaciones
  async unsubscribe() {
    if (!this.isSupported || !this.swRegistration) {
      return { success: false, message: 'Servicio no inicializado' };
    }

    try {
      const subscription = await this.swRegistration.pushManager.getSubscription();
      
      if (subscription) {
        // Notificar al backend
        await api.post(API_ROUTES.UNSUBSCRIBE, {
          endpoint: subscription.endpoint
        });
        
        // Desuscribir localmente
        await subscription.unsubscribe();
        
        // Limpiar estado local
        localStorage.removeItem('ia_sport_push_subscribed');
        
        return { success: true };
      }
      
      return { success: false, message: 'No hay suscripción activa' };
    } catch (error) {
      console.error('Error unsubscribing:', error);
      return { success: false, message: 'Error al desactivar notificaciones' };
    }
  }

  // Verificar si está suscrito
  async isSubscribed() {
    if (!this.isSupported || !this.swRegistration) return false;
    
    try {
      const subscription = await this.swRegistration.pushManager.getSubscription();
      return !!subscription;
    } catch (error) {
      return false;
    }
  }

  // Mostrar notificación local
  async showLocalNotification(title, body, options = {}) {
    if (!this.isSupported || Notification.permission !== 'granted') {
      return false;
    }

    try {
      const defaultOptions = {
        body,
        icon: '/logo192.png',
        badge: '/logo192.png',
        vibrate: [200, 100, 200],
        tag: 'ia-sport-notification',
        renotify: true,
        data: {
          timestamp: new Date().toISOString()
        },
        ...options
      };

      if (this.swRegistration) {
        // Usar service worker para mostrar notificación
        await this.swRegistration.showNotification(title, defaultOptions);
      } else {
        // Fallback a notificación del navegador
        new Notification(title, defaultOptions);
      }

      return true;
    } catch (error) {
      console.error('Error showing notification:', error);
      return false;
    }
  }

  // Obtener historial de notificaciones
  async getHistory(limit = 50) {
    try {
      const response = await api.get(`${API_ROUTES.HISTORY}?limit=${limit}`);
      
      if (response.data.success) {
        return {
          success: true,
          notifications: response.data.data || [],
          count: response.data.count || 0
        };
      }
      
      return { success: false, notifications: [] };
    } catch (error) {
      return { success: false, notifications: [] };
    }
  }

  // Determinar tipo de dispositivo
  getDeviceType() {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (/android/i.test(userAgent)) {
      return 'mobile-android';
    } else if (/iphone|ipad|ipod/i.test(userAgent)) {
      return 'mobile-ios';
    } else {
      return 'web';
    }
  }

  // Verificar si las notificaciones están bloqueadas
  areNotificationsBlocked() {
    return this.isSupported && Notification.permission === 'denied';
  }

  // Abrir configuración del sistema (solo informativo)
  getSystemSettingsInfo() {
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent.toLowerCase());
    const isAndroid = /android/i.test(navigator.userAgent.toLowerCase());
    
    if (isIOS) {
      return 'Ve a Ajustes > Notificaciones > Safari > IA Sport';
    } else if (isAndroid) {
      return 'Ve a Ajustes > Aplicaciones > Chrome > Notificaciones';
    } else {
      return 'Haz clic en el ícono de candado en la barra de direcciones y habilita las notificaciones';
    }
  }
}

const notificationService = new NotificationService();
export default notificationService;