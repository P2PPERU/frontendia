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