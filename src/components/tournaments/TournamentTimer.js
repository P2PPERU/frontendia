import React, { useState, useEffect } from 'react';
import { Clock, AlertCircle } from 'lucide-react';

const TournamentTimer = ({ 
  targetDate, 
  onExpire,
  size = 'medium', // small, medium, large
  showLabels = true,
  showIcon = true,
  className = '',
  urgent = false // Resaltar cuando queda poco tiempo
}) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  const [isExpired, setIsExpired] = useState(false);

  function calculateTimeLeft() {
    const difference = new Date(targetDate) - new Date();
    
    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
      total: difference
    };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);
      
      if (newTimeLeft.total <= 0 && !isExpired) {
        setIsExpired(true);
        if (onExpire) {
          onExpire();
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate, onExpire, isExpired]);

  // Determinar si está en estado urgente
  const isUrgent = urgent || (timeLeft.total <= 3600000 && timeLeft.total > 0); // Menos de 1 hora
  const isCritical = timeLeft.total <= 300000 && timeLeft.total > 0; // Menos de 5 minutos

  // Estilos según el tamaño
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          container: 'text-sm',
          number: 'text-base font-bold',
          label: 'text-xs',
          gap: 'gap-1'
        };
      case 'large':
        return {
          container: 'text-lg',
          number: 'text-2xl font-bold',
          label: 'text-sm',
          gap: 'gap-3'
        };
      default: // medium
        return {
          container: 'text-base',
          number: 'text-xl font-bold',
          label: 'text-xs',
          gap: 'gap-2'
        };
    }
  };

  const styles = getSizeStyles();

  // Si ya expiró
  if (isExpired || timeLeft.total <= 0) {
    return (
      <div className={`flex items-center ${styles.container} text-red-600 ${className}`}>
        {showIcon && <AlertCircle className="w-4 h-4 mr-2" />}
        <span className="font-bold">EXPIRADO</span>
      </div>
    );
  }

  // Determinar qué unidades mostrar
  const showDays = timeLeft.days > 0;
  const showHours = showDays || timeLeft.hours > 0;
  const showMinutes = showHours || timeLeft.minutes > 0;

  // Color según urgencia
  const getTextColor = () => {
    if (isCritical) return 'text-red-600';
    if (isUrgent) return 'text-orange-600';
    return 'text-gray-800';
  };

  // Background para números según urgencia
  const getNumberBg = () => {
    if (isCritical) return 'bg-red-100 border-red-200';
    if (isUrgent) return 'bg-orange-100 border-orange-200';
    return 'bg-gray-100 border-gray-200';
  };

  return (
    <div className={`flex items-center ${styles.container} ${getTextColor()} ${className}`}>
      {showIcon && (
        <Clock className={`w-4 h-4 mr-2 ${isCritical ? 'animate-pulse' : ''}`} />
      )}
      
      <div className={`flex items-center ${styles.gap}`}>
        {/* Días */}
        {showDays && (
          <div className="flex flex-col items-center">
            <div className={`px-2 py-1 rounded-lg border ${getNumberBg()} ${styles.number}`}>
              {timeLeft.days.toString().padStart(2, '0')}
            </div>
            {showLabels && (
              <span className={`${styles.label} text-gray-600 mt-1`}>
                {timeLeft.days === 1 ? 'día' : 'días'}
              </span>
            )}
          </div>
        )}

        {showDays && showHours && (
          <span className={`${styles.number} text-gray-400`}>:</span>
        )}

        {/* Horas */}
        {showHours && (
          <div className="flex flex-col items-center">
            <div className={`px-2 py-1 rounded-lg border ${getNumberBg()} ${styles.number}`}>
              {timeLeft.hours.toString().padStart(2, '0')}
            </div>
            {showLabels && (
              <span className={`${styles.label} text-gray-600 mt-1`}>
                {timeLeft.hours === 1 ? 'hora' : 'horas'}
              </span>
            )}
          </div>
        )}

        {showHours && showMinutes && (
          <span className={`${styles.number} text-gray-400`}>:</span>
        )}

        {/* Minutos */}
        {showMinutes && (
          <div className="flex flex-col items-center">
            <div className={`px-2 py-1 rounded-lg border ${getNumberBg()} ${styles.number}`}>
              {timeLeft.minutes.toString().padStart(2, '0')}
            </div>
            {showLabels && (
              <span className={`${styles.label} text-gray-600 mt-1`}>
                {timeLeft.minutes === 1 ? 'min' : 'mins'}
              </span>
            )}
          </div>
        )}

        {showMinutes && (
          <span className={`${styles.number} text-gray-400`}>:</span>
        )}

        {/* Segundos */}
        <div className="flex flex-col items-center">
          <div className={`px-2 py-1 rounded-lg border ${getNumberBg()} ${styles.number} ${isCritical ? 'animate-pulse' : ''}`}>
            {timeLeft.seconds.toString().padStart(2, '0')}
          </div>
          {showLabels && (
            <span className={`${styles.label} text-gray-600 mt-1`}>
              {timeLeft.seconds === 1 ? 'seg' : 'segs'}
            </span>
          )}
        </div>
      </div>

      {/* Indicador visual de urgencia */}
      {isCritical && (
        <div className="ml-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
      )}
    </div>
  );
};

// Componente simplificado para mostrar solo texto
export const SimpleTimer = ({ targetDate, className = '' }) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    const difference = new Date(targetDate) - new Date();
    
    if (difference <= 0) {
      return 'Expirado';
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((difference / 1000 / 60) % 60);

    if (days > 0) {
      return `${days}d ${hours}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 60000); // Actualizar cada minuto

    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <span className={`font-medium ${className}`}>
      {timeLeft}
    </span>
  );
};

export default TournamentTimer;