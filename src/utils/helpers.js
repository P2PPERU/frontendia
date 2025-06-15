// Formatear fecha
export const formatDate = (date, format = 'short') => {
  const d = new Date(date);
  
  if (format === 'short') {
    return d.toLocaleDateString('es-PE', {
      day: 'numeric',
      month: 'short'
    });
  }
  
  if (format === 'long') {
    return d.toLocaleDateString('es-PE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  
  if (format === 'time') {
    return d.toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  return d.toLocaleDateString('es-PE');
};

// Formatear moneda
export const formatCurrency = (amount, currency = 'S/') => {
  return `${currency} ${parseFloat(amount).toFixed(2)}`;
};

// Formatear número de teléfono
export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.startsWith('51') && cleaned.length === 11) {
    return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
  }
  
  return phone;
};

// Validar email
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validar teléfono peruano
export const isValidPeruvianPhone = (phone) => {
  const cleaned = phone.replace(/\D/g, '');
  return /^51[9]\d{8}$/.test(cleaned);
};

// Calcular tiempo relativo
export const getRelativeTime = (date) => {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now - past) / 1000);
  
  if (diffInSeconds < 60) {
    return 'hace un momento';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `hace ${diffInMinutes} ${diffInMinutes === 1 ? 'minuto' : 'minutos'}`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `hace ${diffInHours} ${diffInHours === 1 ? 'hora' : 'horas'}`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `hace ${diffInDays} ${diffInDays === 1 ? 'día' : 'días'}`;
  }
  
  return formatDate(date);
};

// Debounce function
export const debounce = (func, wait) => {
  let timeout;
  
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle function
export const throttle = (func, limit) => {
  let inThrottle;
  
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Copiar al portapapeles
export const copyToClipboard = async (text) => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback para navegadores antiguos
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand('copy');
      textArea.remove();
      
      return successful;
    }
  } catch (error) {
    console.error('Error al copiar:', error);
    return false;
  }
};

// Compartir
export const share = async (data) => {
  try {
    if (navigator.share) {
      await navigator.share(data);
      return true;
    } else {
      // Fallback: copiar URL
      if (data.url) {
        return await copyToClipboard(data.url);
      }
      return false;
    }
  } catch (error) {
    if (error.name !== 'AbortError') {
      console.error('Error al compartir:', error);
    }
    return false;
  }
};

// Generar ID único
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Ordenar predicciones
export const sortPredictions = (predictions, sortBy = 'time') => {
  const sorted = [...predictions];
  
  switch (sortBy) {
    case 'time':
      return sorted.sort((a, b) => new Date(a.matchTime) - new Date(b.matchTime));
    
    case 'confidence':
      return sorted.sort((a, b) => b.confidence - a.confidence);
    
    case 'odds':
      return sorted.sort((a, b) => b.odds - a.odds);
    
    case 'hot':
      return sorted.sort((a, b) => (b.isHot ? 1 : 0) - (a.isHot ? 1 : 0));
    
    default:
      return sorted;
  }
};

// Calcular ROI
export const calculateROI = (predictions) => {
  const completed = predictions.filter(p => p.result === 'WON' || p.result === 'LOST');
  
  if (completed.length === 0) return 0;
  
  const totalStake = completed.length;
  const totalReturn = completed
    .filter(p => p.result === 'WON')
    .reduce((sum, p) => sum + (p.odds || 0), 0);
  
  const roi = ((totalReturn - totalStake) / totalStake) * 100;
  
  return Math.round(roi * 10) / 10;
};

// Verificar si es dispositivo móvil
export const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Verificar si es iOS
export const isIOS = () => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
};

// Verificar si es Android
export const isAndroid = () => {
  return /Android/i.test(navigator.userAgent);
};

// Verificar si la app está instalada como PWA
export const isPWAInstalled = () => {
  return window.matchMedia('(display-mode: standalone)').matches || 
         window.navigator.standalone === true;
};

// Vibrar dispositivo
export const vibrate = (pattern = [200]) => {
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern);
  }
};

// Local storage helpers con fallback
export const storage = {
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return defaultValue;
    }
  },
  
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Error writing to localStorage:', error);
      return false;
    }
  },
  
  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error removing from localStorage:', error);
      return false;
    }
  },
  
  clear: () => {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  }
};

// Clase para manejar errores
export class AppError extends Error {
  constructor(message, code = 'UNKNOWN_ERROR', statusCode = 500) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

// Helper para manejar errores de forma consistente
export const handleError = (error) => {
  console.error('Error:', error);
  
  if (error.response) {
    // Error del servidor
    return {
      message: error.response.data?.message || 'Error del servidor',
      code: error.response.data?.code || 'SERVER_ERROR',
      statusCode: error.response.status
    };
  } else if (error.request) {
    // Error de red
    return {
      message: 'Error de conexión. Verifica tu internet.',
      code: 'NETWORK_ERROR',
      statusCode: 0
    };
  } else {
    // Error general
    return {
      message: error.message || 'Ha ocurrido un error',
      code: error.code || 'UNKNOWN_ERROR',
      statusCode: error.statusCode || 500
    };
  }
};