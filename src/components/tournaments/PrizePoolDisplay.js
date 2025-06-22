import React from 'react';
import { Trophy, TrendingUp, Award, Star } from 'lucide-react';

const PrizePoolDisplay = ({ 
  prizePool,
  prizeDistribution = [],
  currency = 'S/',
  size = 'medium', // small, medium, large
  showDistribution = false,
  guaranteed = false,
  growing = false,
  className = ''
}) => {
  // Formatear el monto del premio
  const formatPrize = (amount) => {
    if (amount >= 1000000) {
      return `${currency} ${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `${currency} ${(amount / 1000).toFixed(1)}K`;
    } else {
      return `${currency} ${amount.toFixed(2)}`;
    }
  };

  // Estilos según el tamaño
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          container: 'text-sm',
          amount: 'text-lg font-bold',
          icon: 'w-4 h-4',
          badge: 'text-xs px-2 py-1'
        };
      case 'large':
        return {
          container: 'text-lg',
          amount: 'text-3xl font-bold',
          icon: 'w-6 h-6',
          badge: 'text-sm px-3 py-1'
        };
      default: // medium
        return {
          container: 'text-base',
          amount: 'text-2xl font-bold',
          icon: 'w-5 h-5',
          badge: 'text-xs px-2 py-1'
        };
    }
  };

  const styles = getSizeStyles();

  // Color del premio según la cantidad
  const getPrizeColor = () => {
    if (prizePool >= 1000) return 'text-purple-600';
    if (prizePool >= 500) return 'text-blue-600';
    if (prizePool >= 100) return 'text-green-600';
    return 'text-gray-600';
  };

  return (
    <div className={`${styles.container} ${className}`}>
      {/* Prize Pool Principal */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <Trophy className={`${styles.icon} ${getPrizeColor()} mr-2`} />
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">
              Premio Total
            </div>
            <div className={`${styles.amount} ${getPrizeColor()} flex items-center`}>
              {formatPrize(prizePool)}
              {growing && (
                <TrendingUp className="w-4 h-4 ml-1 text-green-500 animate-pulse" />
              )}
            </div>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-col gap-1">
          {guaranteed && (
            <span className={`inline-flex items-center ${styles.badge} rounded-full bg-green-100 text-green-800 font-medium`}>
              <Star className="w-3 h-3 mr-1" />
              Garantizado
            </span>
          )}
          
          {growing && (
            <span className={`inline-flex items-center ${styles.badge} rounded-full bg-blue-100 text-blue-800 font-medium`}>
              <TrendingUp className="w-3 h-3 mr-1" />
              Creciendo
            </span>
          )}
        </div>
      </div>

      {/* Distribución de premios */}
      {showDistribution && prizeDistribution.length > 0 && (
        <div className="mt-3 p-3 bg-gray-50 rounded-xl">
          <div className="text-xs text-gray-600 mb-2 font-medium">
            Distribución de Premios
          </div>
          <div className="space-y-1">
            {prizeDistribution.slice(0, 5).map((prize, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  {index === 0 && <Trophy className="w-3 h-3 text-yellow-500 mr-1" />}
                  {index === 1 && <Award className="w-3 h-3 text-gray-400 mr-1" />}
                  {index === 2 && <Award className="w-3 h-3 text-amber-600 mr-1" />}
                  {index > 2 && <span className="w-3 h-3 mr-1 text-center text-xs">{index + 1}</span>}
                  <span className="text-gray-700">
                    {index === 0 ? '1er lugar' :
                     index === 1 ? '2do lugar' :
                     index === 2 ? '3er lugar' :
                     `${index + 1}to lugar`}
                  </span>
                </div>
                <span className="font-bold text-gray-800">
                  {formatPrize(prize)}
                </span>
              </div>
            ))}
            
            {prizeDistribution.length > 5 && (
              <div className="text-xs text-gray-500 text-center pt-1">
                + {prizeDistribution.length - 5} posiciones más con premio
              </div>
            )}
          </div>
          
          {/* Porcentaje de pago */}
          <div className="mt-2 pt-2 border-t border-gray-200">
            <div className="flex justify-between text-xs text-gray-600">
              <span>Posiciones premiadas:</span>
              <span className="font-medium">
                {prizeDistribution.length} lugares
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Componente simplificado para listas
export const SimplePrizeDisplay = ({ prizePool, currency = 'S/', className = '' }) => {
  const formatPrize = (amount) => {
    if (amount >= 1000000) {
      return `${currency} ${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `${currency} ${(amount / 1000).toFixed(1)}K`;
    } else {
      return `${currency} ${amount.toFixed(0)}`;
    }
  };

  const getPrizeColor = () => {
    if (prizePool >= 1000) return 'text-purple-600';
    if (prizePool >= 500) return 'text-blue-600';
    if (prizePool >= 100) return 'text-green-600';
    return 'text-gray-600';
  };

  return (
    <div className={`flex items-center ${className}`}>
      <Trophy className={`w-4 h-4 ${getPrizeColor()} mr-1`} />
      <span className={`font-bold ${getPrizeColor()}`}>
        {formatPrize(prizePool)}
      </span>
    </div>
  );
};

// Componente para mostrar el ROI potencial
export const ROIDisplay = ({ buyIn, firstPrize, className = '' }) => {
  if (buyIn === 0 || !firstPrize) return null;

  const roi = Math.round(((firstPrize - buyIn) / buyIn) * 100);
  
  const getROIColor = () => {
    if (roi >= 1000) return 'text-purple-600 bg-purple-100';
    if (roi >= 500) return 'text-blue-600 bg-blue-100';
    if (roi >= 200) return 'text-green-600 bg-green-100';
    return 'text-orange-600 bg-orange-100';
  };

  return (
    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${getROIColor()} ${className}`}>
      ROI: +{roi}%
    </div>
  );
};

export default PrizePoolDisplay;