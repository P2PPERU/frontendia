import api, { API_ROUTES } from './index';

class AdminService {
  // Obtener estadísticas del dashboard
  async getStats() {
    try {
      const response = await api.get(API_ROUTES.ADMIN_STATS);
      return response.data;
    } catch (error) {
      return api.handleError(error);
    }
  }

  // Obtener lista de predicciones
  async getPredictions(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      // Agregar filtros si existen
      if (filters.date) params.append('date', filters.date);
      if (filters.isPremium !== undefined) params.append('isPremium', filters.isPremium);
      if (filters.isHot !== undefined) params.append('isHot', filters.isHot);
      if (filters.result) params.append('result', filters.result);
      if (filters.sport) params.append('sport', filters.sport);
      
      const queryString = params.toString();
      const url = queryString ? `${API_ROUTES.ADMIN_PREDICTIONS}?${queryString}` : API_ROUTES.ADMIN_PREDICTIONS;
      
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      return api.handleError(error);
    }
  }

  // Crear nueva predicción
  async createPrediction(data) {
    try {
      const response = await api.post(API_ROUTES.ADMIN_PREDICTIONS, data);
      return response.data;
    } catch (error) {
      return api.handleError(error);
    }
  }

  // Actualizar predicción existente
  async updatePrediction(id, data) {
    try {
      const url = `${API_ROUTES.ADMIN_PREDICTIONS}/${id}`;
      const response = await api.put(url, data);
      return response.data;
    } catch (error) {
      return api.handleError(error);
    }
  }

  // Eliminar predicción
  async deletePrediction(id) {
    try {
      const url = `${API_ROUTES.ADMIN_PREDICTIONS}/${id}`;
      const response = await api.delete(url);
      return response.data;
    } catch (error) {
      return api.handleError(error);
    }
  }

  // Actualizar resultado de predicción
  async updatePredictionResult(id, result) {
    try {
      const url = api.buildUrl(API_ROUTES.ADMIN_RESULT, { id });
      const response = await api.put(url, { result });
      return response.data;
    } catch (error) {
      return api.handleError(error);
    }
  }

  // Obtener usuarios
  async getUsers(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filters.isPremium !== undefined) params.append('isPremium', filters.isPremium);
      if (filters.isActive !== undefined) params.append('isActive', filters.isActive);
      if (filters.search) params.append('search', filters.search);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);
      
      const queryString = params.toString();
      const url = queryString ? `/admin/users?${queryString}` : '/admin/users';
      
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      return api.handleError(error);
    }
  }

  // Actualizar usuario
  async updateUser(id, data) {
    try {
      const url = `/admin/users/${id}`;
      const response = await api.put(url, data);
      return response.data;
    } catch (error) {
      return api.handleError(error);
    }
  }

  // Enviar notificación masiva
  async sendBulkNotification(data) {
    try {
      const response = await api.post('/admin/notifications/send', data);
      return response.data;
    } catch (error) {
      return api.handleError(error);
    }
  }

  // Obtener historial de pagos
  async getPayments(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filters.status) params.append('status', filters.status);
      if (filters.method) params.append('method', filters.method);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.userId) params.append('userId', filters.userId);
      
      const queryString = params.toString();
      const url = queryString ? `/admin/payments?${queryString}` : '/admin/payments';
      
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      return api.handleError(error);
    }
  }

  // Aprobar/rechazar pago
  async updatePaymentStatus(id, status, notes) {
    try {
      const url = `/admin/payments/${id}/status`;
      const response = await api.put(url, { status, notes });
      return response.data;
    } catch (error) {
      return api.handleError(error);
    }
  }

  // Obtener analytics
  async getAnalytics(period = 'week') {
    try {
      const response = await api.get(`/admin/analytics?period=${period}`);
      return response.data;
    } catch (error) {
      return api.handleError(error);
    }
  }

  // Exportar datos
  async exportData(type, filters = {}) {
    try {
      const params = new URLSearchParams(filters);
      const queryString = params.toString();
      const url = queryString ? `/admin/export/${type}?${queryString}` : `/admin/export/${type}`;
      
      const response = await api.get(url, {
        responseType: 'blob'
      });
      
      // Crear link de descarga
      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `export-${type}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
      
      return { success: true };
    } catch (error) {
      return api.handleError(error);
    }
  }

  // Bulk operations
  async bulkUpdatePredictions(ids, updates) {
    try {
      const response = await api.put('/admin/predictions/bulk', {
        ids,
        updates
      });
      return response.data;
    } catch (error) {
      return api.handleError(error);
    }
  }

  async bulkDeletePredictions(ids) {
    try {
      const response = await api.delete('/admin/predictions/bulk', {
        data: { ids }
      });
      return response.data;
    } catch (error) {
      return api.handleError(error);
    }
  }

  // Settings
  async getSettings() {
    try {
      const response = await api.get('/admin/settings');
      return response.data;
    } catch (error) {
      return api.handleError(error);
    }
  }

  async updateSettings(settings) {
    try {
      const response = await api.put('/admin/settings', settings);
      return response.data;
    } catch (error) {
      return api.handleError(error);
    }
  }
}

const adminService = new AdminService();
export default adminService;