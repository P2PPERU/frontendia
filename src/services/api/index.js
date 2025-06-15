import axios from 'axios';
import { API_CONFIG, STORAGE_KEYS, API_ROUTES } from '../../utils/constants';

// Crear instancia de axios
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Agregar token a todas las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Manejo de errores global
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Si el error es 401 y no es una petición de login
    if (error.response?.status === 401 && !originalRequest.url.includes('/auth/')) {
      // Token expirado - intentar refresh o logout
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // Manejo de errores de red
    if (!error.response) {
      // Verificar si hay datos en caché para modo offline
      const cachedData = getCachedData(originalRequest.url);
      if (cachedData) {
        return { data: cachedData, cached: true };
      }
      
      error.message = 'Error de conexión. Verifica tu internet.';
    }

    return Promise.reject(error);
  }
);

// Helper para obtener datos cacheados
const getCachedData = (url) => {
  try {
    const cached = localStorage.getItem(STORAGE_KEYS.CACHED_PREDICTIONS);
    if (cached && url.includes('/predictions')) {
      return JSON.parse(cached);
    }
  } catch (e) {
    console.error('Error reading cache:', e);
  }
  return null;
};

// Funciones helper para las peticiones
const apiHelpers = {
  // GET con caché opcional
  get: async (url, options = {}) => {
    try {
      const response = await api.get(url, options);
      
      // Cachear predicciones para offline
      if (url.includes('/predictions') && response.data) {
        localStorage.setItem(
          STORAGE_KEYS.CACHED_PREDICTIONS, 
          JSON.stringify(response.data)
        );
        localStorage.setItem(
          STORAGE_KEYS.LAST_SYNC,
          new Date().toISOString()
        );
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  },

  // POST
  post: async (url, data, options = {}) => {
    return api.post(url, data, options);
  },

  // PUT
  put: async (url, data, options = {}) => {
    return api.put(url, data, options);
  },

  // DELETE
  delete: async (url, options = {}) => {
    return api.delete(url, options);
  },

  // Helper para manejar errores
  handleError: (error) => {
    if (error.response) {
      // Error del servidor
      return {
        success: false,
        message: error.response.data.message || 'Error en el servidor',
        status: error.response.status,
      };
    } else if (error.request) {
      // Error de red
      return {
        success: false,
        message: error.message || 'Error de conexión',
        offline: true,
      };
    } else {
      // Error general
      return {
        success: false,
        message: error.message || 'Error desconocido',
      };
    }
  },

  // Helper para construir URLs con parámetros
  buildUrl: (route, params = {}) => {
    let url = route;
    Object.keys(params).forEach(key => {
      url = url.replace(`:${key}`, params[key]);
    });
    return url;
  },
};

export default apiHelpers;
export { api, API_ROUTES };