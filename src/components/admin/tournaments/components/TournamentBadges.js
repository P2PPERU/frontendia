import React from 'react';
import { Star, Crown, Zap, Lock, Shield, Wifi } from 'lucide-react';

// Badge de estado del torneo
export const TournamentStatusBadge = ({ status, size = 'sm' }) => {
  const statusConfig = {
    'UPCOMING': {
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      text: 'Próximo',
      icon: '⏳'
    },
    'REGISTRATION': {
      color: 'bg-green-100 text-green-800 border-green-200',
      text: 'Registro',
      icon: '✅'
    },
    'ACTIVE': {
      color: 'bg-orange-100 text-orange-800 border-orange-200',
      text: 'En Vivo',
      icon: '🔴'
    },
    'FINISHED': {
      color: 'bg-gray-100 text-gray-800 border-gray-200',
      text: 'Finalizado',
      icon: '🏁'
    },
    'CANCELLED': {
      color: 'bg-red-100 text-red-800 border-red-200',
      text: 'Cancelado',
      icon: '❌'
    }
  };

  const config = statusConfig[status] || statusConfig['UPCOMING'];
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-1' : 'text-sm px-3 py-1.5';

  return (
    <span className={`inline-flex items-center rounded-full border font-medium ${config.color} ${sizeClass}`}>
      <span className="mr-1">{config.icon}</span>
      {config.text}
    </span>
  );
};

// Badge de tipo de torneo
export const TournamentTypeBadge = ({ type, buyIn = 0, size = 'sm' }) => {
  let config;

  if (Number(buyIn) === 0) {
    config = {
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      text: 'Gratis',
      icon: '🆓'
    };
  } else {
    const typeConfig = {
      'FREEROLL': {
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        text: 'Freeroll',
        icon: '🆓'
      },
      'GUARANTEED': {
        color: 'bg-green-100 text-green-800 border-green-200',
        text: 'Garantizado',
        icon: '💎'
      },
      'SATELLITE': {
        color: 'bg-purple-100 text-purple-800 border-purple-200',
        text: 'Satélite',
        icon: '🛰️'
      },
      'REGULAR': {
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        text: 'Regular',
        icon: '🏆'
      }
    };
    
    config = typeConfig[type] || typeConfig['REGULAR'];
  }

  const sizeClass = size === 'sm' ? 'text-xs px-2 py-1' : 'text-sm px-3 py-1.5';

  return (
    <span className={`inline-flex items-center rounded-full border font-medium ${config.color} ${sizeClass}`}>
      <span className="mr-1">{config.icon}</span>
      {config.text}
    </span>
  );
};

// Badge de características especiales
export const TournamentFeatureBadge = ({ feature, size = 'sm' }) => {
  const featureConfig = {
    'featured': {
      color: 'bg-orange-100 text-orange-800 border-orange-200',
      text: 'Destacado',
      icon: <Zap className="w-3 h-3" />
    },
    'premium': {
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      text: 'Premium',
      icon: <Lock className="w-3 h-3" />
    },
    'guaranteed': {
      color: 'bg-green-100 text-green-800 border-green-200',
      text: 'Garantizado',
      icon: <Shield className="w-3 h-3" />
    },
    'live': {
      color: 'bg-red-100 text-red-800 border-red-200',
      text: 'En Vivo',
      icon: <Wifi className="w-3 h-3" />
    }
  };

  const config = featureConfig[feature];
  if (!config) return null;

  const sizeClass = size === 'sm' ? 'text-xs px-2 py-1' : 'text-sm px-3 py-1.5';

  return (
    <span className={`inline-flex items-center rounded-full border font-medium ${config.color} ${sizeClass}`}>
      <span className="mr-1">{config.icon}</span>
      {config.text}
    </span>
  );
};

// Indicador de ocupación
export const OccupancyIndicator = ({ current, max, showPercentage = true }) => {
  const percentage = max > 0 ? Math.round((current / max) * 100) : 0;
  
  let colorClass = 'bg-green-500';
  if (percentage >= 90) colorClass = 'bg-red-500';
  else if (percentage >= 70) colorClass = 'bg-yellow-500';

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-gray-200 rounded-full h-2 min-w-[60px]">
        <div 
          className={`h-2 rounded-full transition-all ${colorClass}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        ></div>
      </div>
      <span className="text-xs text-gray-600 min-w-[45px]">
        {showPercentage ? `${percentage}%` : `${current}/${max}`}
      </span>
    </div>
  );
};

// Badge de buy-in con formato
export const BuyInBadge = ({ amount, currency = 'S/' }) => {
  if (Number(amount) === 0) {
    return (
      <span className="inline-flex items-center bg-blue-100 text-blue-800 text-sm font-bold px-3 py-1 rounded-lg">
        GRATIS
      </span>
    );
  }

  return (
    <span className="inline-flex items-center bg-green-100 text-green-800 text-sm font-bold px-3 py-1 rounded-lg">
      {currency} {Number(amount).toFixed(2)}
    </span>
  );
};

// Badge de premio con formato
export const PrizeBadge = ({ amount, currency = 'S/', guaranteed = false }) => {
  const bgColor = guaranteed ? 'bg-yellow-100 text-yellow-800' : 'bg-purple-100 text-purple-800';
  
  return (
    <span className={`inline-flex items-center text-sm font-bold px-3 py-1 rounded-lg ${bgColor}`}>
      {guaranteed && <Crown className="w-3 h-3 mr-1" />}
      {currency} {Number(amount).toFixed(0)}
    </span>
  );
};

// Indicador de tiempo relativo
export const TimeIndicator = ({ date, label = '' }) => {
  const now = new Date();
  const targetDate = new Date(date);
  const diffInMinutes = Math.floor((targetDate - now) / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  let text, colorClass;

  if (diffInMinutes < 0) {
    text = 'Pasado';
    colorClass = 'text-gray-500';
  } else if (diffInMinutes < 60) {
    text = `${diffInMinutes}min`;
    colorClass = 'text-red-600';
  } else if (diffInHours < 24) {
    text = `${diffInHours}h`;
    colorClass = 'text-orange-600';
  } else if (diffInDays < 7) {
    text = `${diffInDays}d`;
    colorClass = 'text-blue-600';
  } else {
    text = targetDate.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' });
    colorClass = 'text-gray-600';
  }

  return (
    <div className="text-center">
      <div className={`text-sm font-medium ${colorClass}`}>
        {text}
      </div>
      {label && (
        <div className="text-xs text-gray-500">
          {label}
        </div>
      )}
    </div>
  );
};

// Componente combinado para mostrar todos los badges de un torneo
export const TournamentBadges = ({ tournament, showFeatures = true }) => {
  return (
    <div className="flex flex-wrap gap-2">
      <TournamentStatusBadge status={tournament.status} />
      <TournamentTypeBadge type={tournament.type} buyIn={tournament.buyIn} />
      
      {showFeatures && tournament.featured && (
        <TournamentFeatureBadge feature="featured" />
      )}
      
      {showFeatures && tournament.requiresPremium && (
        <TournamentFeatureBadge feature="premium" />
      )}
      
      {showFeatures && tournament.guaranteed && (
        <TournamentFeatureBadge feature="guaranteed" />
      )}
      
      {showFeatures && tournament.status === 'ACTIVE' && (
        <TournamentFeatureBadge feature="live" />
      )}
    </div>
  );
};

export default {
  TournamentStatusBadge,
  TournamentTypeBadge,
  TournamentFeatureBadge,
  OccupancyIndicator,
  BuyInBadge,
  PrizeBadge,
  TimeIndicator,
  TournamentBadges
};