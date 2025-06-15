import api, { API_ROUTES } from './index';
import authService from './auth';

class UserService {
  // Obtener perfil del usuario
  async getProfile() {
    try {
      const response = await api.get(API_ROUTES.PROFILE);
      
      if (response.data.success) {
        // Actualizar datos locales del usuario
        authService.updateUserData(response.data.data);
        return {
          success: true,
          user: response.data.data
        };
      }
      
      return response.data;
    } catch (error) {
      return api.handleError(error);
    }
  }

  // Actualizar preferencias
  async updatePreferences(preferences) {
    try {
      const response = await api.put(API_ROUTES.PREFERENCES, preferences);
      
      if (response.data.success) {
        // Actualizar preferencias locales
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
          authService.updateUserData({
            preferences: { ...currentUser.preferences, ...preferences }
          });
        }
        
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      }
      
      return response.data;
    } catch (error) {
      return api.handleError(error);
    }
  }

  // Actualizar perfil
  async updateProfile(profileData) {
    try {
      const response = await api.put('/users/profile', profileData);
      
      if (response.data.success) {
        // Actualizar datos locales
        authService.updateUserData(profileData);
        
        return {
          success: true,
          user: response.data.data,
          message: response.data.message
        };
      }
      
      return response.data;
    } catch (error) {
      return api.handleError(error);
    }
  }

  // Cambiar contraseña
  async changePassword(currentPassword, newPassword) {
    try {
      const response = await api.post('/users/change-password', {
        currentPassword,
        newPassword
      });
      
      return response.data;
    } catch (error) {
      return api.handleError(error);
    }
  }

  // Obtener historial de predicciones vistas
  async getPredictionHistory(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.result) params.append('result', filters.result);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit || '20');
      
      const queryString = params.toString();
      const url = queryString ? `/users/predictions/history?${queryString}` : '/users/predictions/history';
      
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      return api.handleError(error);
    }
  }

  // Obtener estadísticas del usuario
  async getUserStats() {
    try {
      const response = await api.get('/users/stats');
      return response.data;
    } catch (error) {
      return api.handleError(error);
    }
  }

  // Suscribirse a premium
  async subscribeToPremium(paymentData) {
    try {
      const response = await api.post('/users/subscribe', paymentData);
      
      if (response.data.success) {
        // Actualizar estado premium local
        authService.updateUserData({ isPremium: true });
        
        return {
          success: true,
          subscription: response.data.subscription,
          message: response.data.message
        };
      }
      
      return response.data;
    } catch (error) {
      return api.handleError(error);
    }
  }

  // Cancelar suscripción
  async cancelSubscription() {
    try {
      const response = await api.post('/users/unsubscribe');
      
      if (response.data.success) {
        // Actualizar estado premium local
        authService.updateUserData({ isPremium: false });
        
        return response.data;
      }
      
      return response.data;
    } catch (error) {
      return api.handleError(error);
    }
  }

  // Obtener estado de suscripción
  async getSubscriptionStatus() {
    try {
      const response = await api.get('/users/subscription');
      return response.data;
    } catch (error) {
      return api.handleError(error);
    }
  }

  // Reportar problema con predicción
  async reportPrediction(predictionId, reason, details) {
    try {
      const response = await api.post('/users/report', {
        predictionId,
        reason,
        details
      });
      
      return response.data;
    } catch (error) {
      return api.handleError(error);
    }
  }

  // Agregar predicción a favoritos
  async addToFavorites(predictionId) {
    try {
      const response = await api.post(`/users/favorites/${predictionId}`);
      return response.data;
    } catch (error) {
      return api.handleError(error);
    }
  }

  // Remover de favoritos
  async removeFromFavorites(predictionId) {
    try {
      const response = await api.delete(`/users/favorites/${predictionId}`);
      return response.data;
    } catch (error) {
      return api.handleError(error);
    }
  }

  // Obtener favoritos
  async getFavorites() {
    try {
      const response = await api.get('/users/favorites');
      return response.data;
    } catch (error) {
      return api.handleError(error);
    }
  }

  // Solicitar eliminación de cuenta
  async requestAccountDeletion(password) {
    try {
      const response = await api.post('/users/delete-account', { password });
      return response.data;
    } catch (error) {
      return api.handleError(error);
    }
  }
}

const userService = new UserService();
export default userService;