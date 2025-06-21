// Configuración de la API
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
};

// Rutas de la API
export const API_ROUTES = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  VERIFY: '/auth/verify',
  FORGOT_PASSWORD: '/auth/forgot-password',
  
  // Predictions
  PREDICTIONS: '/predictions',
  PREDICTIONS_BY_DATE: '/predictions/by-date',
  PREDICTIONS_DATES: '/predictions/dates',
  PREDICTIONS_STATS: '/predictions/stats',
  UNLOCK_PREDICTION: '/predictions/:id/unlock',
  
  // User
  PROFILE: '/users/profile',
  PREFERENCES: '/users/preferences',
  
  // Notifications
  VAPID_KEY: '/notifications/vapid-public-key',
  SUBSCRIBE: '/notifications/subscribe',
  UNSUBSCRIBE: '/notifications/unsubscribe',
  HISTORY: '/notifications/history',
  
  // Admin
  ADMIN_STATS: '/admin/stats',
  ADMIN_PREDICTIONS: '/admin/predictions',
  ADMIN_RESULT: '/admin/predictions/:id/result',
  ADMIN_ANALYTICS: '/admin/analytics',
  ADMIN_USERS: '/admin/users',
  ADMIN_EXPORT: '/admin/export',
};

// Constantes de la aplicación
export const APP_CONFIG = {
  APP_NAME: 'IA SPORT',
  APP_VERSION: '1.0.0',
  FREE_VIEWS_PER_DAY: 2,
  PREMIUM_PRICE: 7.00,
  CURRENCY: 'S/',
};

// Estados de predicción
export const PREDICTION_STATUS = {
  PENDING: 'PENDING',
  WON: 'WON',
  LOST: 'LOST',
  VOID: 'VOID',
};

// Tipos de predicción
export const PREDICTION_TYPES = {
  '1X2': '1X2',
  OVER_UNDER: 'OVER_UNDER',
  BTTS: 'BTTS',
  HANDICAP: 'HANDICAP',
  CUSTOM: 'CUSTOM',
};

// Filtros de fecha para admin
export const DATE_FILTERS = {
  TODAY: 'today',
  YESTERDAY: 'yesterday',
  THIS_WEEK: 'this_week',
  LAST_WEEK: 'last_week',
  THIS_MONTH: 'this_month',
  LAST_MONTH: 'last_month',
  CUSTOM: 'custom'
};

// Configuración de notificaciones
export const NOTIFICATION_CONFIG = {
  TYPES: {
    HOT_PREDICTION: 'hot_prediction',
    PREDICTION_RESULT: 'prediction_result',
    CUSTOM: 'custom',
  },
  PERMISSION_STATES: {
    DEFAULT: 'default',
    GRANTED: 'granted',
    DENIED: 'denied',
  },
};

// Claves de localStorage
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'ia_sport_token',
  USER_DATA: 'ia_sport_user',
  PREFERENCES: 'ia_sport_preferences',
  LAST_SYNC: 'ia_sport_last_sync',
  CACHED_PREDICTIONS: 'ia_sport_cached_predictions',
  ADMIN_FILTERS: 'ia_sport_admin_filters',
};

// Configuración PWA
export const PWA_CONFIG = {
  CACHE_NAME: 'ia-sport-v1',
  STATIC_CACHE_NAME: 'ia-sport-static-v1',
  DYNAMIC_CACHE_NAME: 'ia-sport-dynamic-v1',
  MAX_CACHE_AGE: 24 * 60 * 60 * 1000, // 24 horas
};

// Timeouts y delays
export const TIMEOUTS = {
  DEBOUNCE: 300,
  LOADING_MIN: 500,
  NOTIFICATION_DURATION: 5000,
  TOKEN_REFRESH_BUFFER: 5 * 60 * 1000, // 5 minutos antes de expirar
};

// Validaciones
export const VALIDATION = {
  PHONE_REGEX: /^51[9]\d{8}$/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  MIN_PASSWORD_LENGTH: 6,
  MIN_NAME_LENGTH: 3,
  OTP_LENGTH: 6,
};

// Configuración de filtros para admin
export const ADMIN_CONFIG = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  DATE_RANGE_LIMIT: 90, // días
  EXPORT_FORMATS: ['csv', 'xlsx', 'json'],
  BULK_ACTION_LIMIT: 50,
};

// Métricas y KPIs
export const METRICS = {
  EXCELLENT_ACCURACY: 90,
  GOOD_ACCURACY: 80,
  FAIR_ACCURACY: 70,
  EXCELLENT_ROI: 20,
  GOOD_ROI: 10,
  FAIR_ROI: 5,
  HIGH_ODDS: 2.0,
  MEDIUM_ODDS: 1.5,
  LOW_ODDS: 1.2,
};

// Configuración de gráficos y visualizaciones
export const CHART_CONFIG = {
  COLORS: {
    PRIMARY: '#2563eb',
    SUCCESS: '#10b981',
    WARNING: '#f59e0b',
    ERROR: '#ef4444',
    INFO: '#06b6d4',
    PURPLE: '#8b5cf6',
  },
  GRADIENTS: {
    BLUE: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    GREEN: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    RED: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    PURPLE: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
  },
};

// Textos y mensajes comunes
export const MESSAGES = {
  LOADING: 'Cargando...',
  NO_DATA: 'No hay datos disponibles',
  ERROR_GENERIC: 'Ha ocurrido un error',
  ERROR_NETWORK: 'Error de conexión',
  SUCCESS_SAVE: 'Guardado exitosamente',
  SUCCESS_DELETE: 'Eliminado exitosamente',
  SUCCESS_UPDATE: 'Actualizado exitosamente',
  CONFIRM_DELETE: '¿Estás seguro de eliminar este elemento?',
  CONFIRM_LOGOUT: '¿Estás seguro de cerrar sesión?',
};