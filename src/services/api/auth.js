import api, { API_ROUTES } from './index';
import { STORAGE_KEYS } from '../../utils/constants';

class AuthService {
  // Login
  async login(phoneOrEmail, password) {
    try {
      const response = await api.post(API_ROUTES.LOGIN, {
        phoneOrEmail,
        password,
      });

      if (response.data.success) {
        const { token, user } = response.data;
        
        // Guardar token y datos del usuario
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
        
        return {
          success: true,
          user,
          token,
        };
      }

      return response.data;
    } catch (error) {
      return api.handleError(error);
    }
  }

  // Registro
  async register(userData) {
    try {
      const response = await api.post(API_ROUTES.REGISTER, userData);

      if (response.data.success) {
        const { token, user } = response.data;
        
        // Guardar token y datos del usuario
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
        
        return {
          success: true,
          user,
          token,
          message: response.data.message,
        };
      }

      return response.data;
    } catch (error) {
      return api.handleError(error);
    }
  }

  // Verificar OTP
  async verifyOTP(phone, code) {
    try {
      const response = await api.post(API_ROUTES.VERIFY, {
        phone,
        code,
      });

      return response.data;
    } catch (error) {
      return api.handleError(error);
    }
  }

  // Recuperar contraseña
  async forgotPassword(phoneOrEmail) {
    try {
      const response = await api.post(API_ROUTES.FORGOT_PASSWORD, {
        phoneOrEmail,
      });

      return response.data;
    } catch (error) {
      return api.handleError(error);
    }
  }

  // Logout
  logout() {
    // Limpiar localStorage
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    localStorage.removeItem(STORAGE_KEYS.CACHED_PREDICTIONS);
    localStorage.removeItem(STORAGE_KEYS.PREFERENCES);
    
    // Desuscribir de notificaciones si está suscrito
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.ready.then(registration => {
        registration.pushManager.getSubscription().then(subscription => {
          if (subscription) {
            subscription.unsubscribe();
          }
        });
      });
    }
    
    // Redirigir a login
    window.location.href = '/login';
  }

  // Verificar si está autenticado
  isAuthenticated() {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    
    return !!(token && userData);
  }

  // Obtener usuario actual
  getCurrentUser() {
    try {
      const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }

  // Actualizar datos del usuario en localStorage
  updateUserData(updates) {
    try {
      const currentUser = this.getCurrentUser();
      if (currentUser) {
        const updatedUser = { ...currentUser, ...updates };
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(updatedUser));
        return updatedUser;
      }
      return null;
    } catch (error) {
      console.error('Error updating user data:', error);
      return null;
    }
  }

  // Verificar si es usuario premium
  isPremium() {
    const user = this.getCurrentUser();
    return user?.isPremium || false;
  }

  // Verificar si es admin
  isAdmin() {
    const user = this.getCurrentUser();
    return user?.isAdmin || false;
  }

  // Obtener vistas gratuitas restantes
  getFreeViewsLeft() {
    const user = this.getCurrentUser();
    return user?.freeViewsLeft || 0;
  }
}

export default new AuthService();