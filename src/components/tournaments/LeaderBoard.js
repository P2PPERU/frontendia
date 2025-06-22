import React, { useState } from 'react';
import { Trophy, Medal, Award, TrendingUp, TrendingDown, Minus, Crown, Star, Target } from 'lucide-react';

const LeaderBoard = ({ 
  players = [],
  currentUserId = null,
  showPrizes = true,
  prizeDistribution = [],
  maxVisible = 10,
  highlightUser = true,
  showStats = true,
  className = ''
}) => {
  const [expanded, setExpanded] = useState(false);
  
  // Determinar cuántos jugadores mostrar
  const visiblePlayers = expanded ? players : players.slice(0, maxVisible);
  const hasMore = players.length > maxVisible;

  // Obtener el icono de posición
  const getPositionIcon = (position) => {
    switch (position) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return null;
    }
  };

  // Obtener el color de fondo según la posición
  const getPositionBg = (position, isCurrentUser) => {
    if (isCurrentUser && highlightUser) {
      return 'bg-blue-50 border-blue-200 border-2';
    }
    
    switch (position) {
      case 1:
        return 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200';
      case 2:
        return 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200';
      case 3:
        return 'bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200';
      default:
        return 'bg-white border-gray-100';
    }
  };

  // Obtener el premio para una posición
  const getPrize = (position) => {
    if (!showPrizes || !prizeDistribution.length) return null;
    return prizeDistribution[position - 1] || 0;
  };

  // Formatear puntos
  const formatPoints = (points) => {
    if (points >= 1000000) {
      return `${(points / 1000000).toFixed(1)}M`;
    } else if (points >= 1000) {
      return `${(points / 1000).toFixed(1)}K`;
    } else {
      return points.toFixed(0);
    }
  };

  // Obtener indicador de tendencia
  const getTrendIcon = (trend) => {
    if (trend > 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (trend < 0) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Trophy className="w-6 h-6 mr-2" />
            <h2 className="text-lg font-bold">Clasificación</h2>
          </div>
          <div className="text-sm opacity-90">
            {players.length} jugadores
          </div>
        </div>
      </div>

      {/* Podio Top 3 */}
      {players.length >= 3 && (
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-end justify-center gap-4">
            {/* 2do lugar */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-gradient-to-b from-gray-300 to-gray-400 rounded-full flex items-center justify-center mb-2">
                <span className="text-white font-bold text-lg">2</span>
              </div>
              <div className="text-center">
                <div className="font-bold text-gray-800 text-sm truncate max-w-20">
                  {players[1]?.name || 'Jugador 2'}
                </div>
                <div className="text-xs text-gray-600">
                  {formatPoints(players[1]?.points || 0)} pts
                </div>
                {showPrizes && getPrize(2) > 0 && (
                  <div className="text-xs text-green-600 font-medium">
                    S/ {getPrize(2)}
                  </div>
                )}
              </div>
            </div>

            {/* 1er lugar */}
            <div className="flex flex-col items-center -mt-4">
              <div className="w-20 h-20 bg-gradient-to-b from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center mb-2 shadow-lg">
                <Crown className="w-8 h-8 text-white" />
              </div>
              <div className="text-center">
                <div className="font-bold text-gray-800 text-base truncate max-w-24">
                  {players[0]?.name || 'Líder'}
                </div>
                <div className="text-sm text-gray-600">
                  {formatPoints(players[0]?.points || 0)} pts
                </div>
                {showPrizes && getPrize(1) > 0 && (
                  <div className="text-sm text-green-600 font-bold">
                    S/ {getPrize(1)}
                  </div>
                )}
              </div>
            </div>

            {/* 3er lugar */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-gradient-to-b from-amber-400 to-amber-500 rounded-full flex items-center justify-center mb-2">
                <span className="text-white font-bold text-lg">3</span>
              </div>
              <div className="text-center">
                <div className="font-bold text-gray-800 text-sm truncate max-w-20">
                  {players[2]?.name || 'Jugador 3'}
                </div>
                <div className="text-xs text-gray-600">
                  {formatPoints(players[2]?.points || 0)} pts
                </div>
                {showPrizes && getPrize(3) > 0 && (
                  <div className="text-xs text-green-600 font-medium">
                    S/ {getPrize(3)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lista de jugadores */}
      <div className="divide-y divide-gray-100">
        {visiblePlayers.map((player, index) => {
          const position = index + 1;
          const isCurrentUser = player.userId === currentUserId;
          const prize = getPrize(position);
          
          return (
            <div
              key={player.userId || index}
              className={`p-4 border-l-4 ${getPositionBg(position, isCurrentUser)} transition-all hover:shadow-sm`}
            >
              <div className="flex items-center justify-between">
                {/* Posición y jugador */}
                <div className="flex items-center flex-1">
                  <div className="flex items-center justify-center w-8 h-8 mr-3">
                    {getPositionIcon(position) || (
                      <span className={`font-bold text-lg ${
                        position <= 3 ? 'text-gray-600' : 'text-gray-500'
                      }`}>
                        {position}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center">
                      <h3 className={`font-bold truncate ${
                        isCurrentUser ? 'text-blue-600' : 'text-gray-800'
                      }`}>
                        {player.name}
                        {isCurrentUser && (
                          <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-1 rounded-full">
                            TÚ
                          </span>
                        )}
                      </h3>
                      
                      {player.isVIP && (
                        <Star className="w-4 h-4 text-yellow-500 ml-2" />
                      )}
                    </div>
                    
                    {showStats && (
                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-600">
                        {player.predictions !== undefined && (
                          <div className="flex items-center">
                            <Target className="w-3 h-3 mr-1" />
                            {player.correctPredictions || 0}/{player.predictions || 0}
                          </div>
                        )}
                        
                        {player.accuracy !== undefined && (
                          <div>
                            {player.accuracy}% precisión
                          </div>
                        )}
                        
                        {player.streak !== undefined && player.streak > 0 && (
                          <div className="text-green-600 font-medium">
                            {player.streak} racha
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Puntos y premio */}
                <div className="text-right ml-4">
                  <div className="flex items-center">
                    <span className={`font-bold text-lg ${
                      isCurrentUser ? 'text-blue-600' : 'text-gray-800'
                    }`}>
                      {formatPoints(player.points || 0)}
                    </span>
                    {player.trend !== undefined && getTrendIcon(player.trend)}
                  </div>
                  
                  <div className="text-xs text-gray-500">puntos</div>
                  
                  {showPrizes && prize > 0 && (
                    <div className="text-sm text-green-600 font-bold mt-1">
                      S/ {prize}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Botón para mostrar más */}
      {hasMore && (
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full text-center text-blue-600 font-medium hover:text-blue-700 transition-colors"
          >
            {expanded ? 'Mostrar menos' : `Ver todos (${players.length})`}
          </button>
        </div>
      )}

      {/* Estadísticas adicionales */}
      {showStats && players.length > 0 && (
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-gray-800">
                {formatPoints(players[0]?.points || 0)}
              </div>
              <div className="text-xs text-gray-600">Puntos líder</div>
            </div>
            
            <div>
              <div className="text-lg font-bold text-gray-800">
                {players.reduce((sum, p) => sum + (p.predictions || 0), 0)}
              </div>
              <div className="text-xs text-gray-600">Predicciones totales</div>
            </div>
            
            <div>
              <div className="text-lg font-bold text-gray-800">
                {Math.round(players.reduce((sum, p) => sum + (p.accuracy || 0), 0) / players.length) || 0}%
              </div>
              <div className="text-xs text-gray-600">Precisión promedio</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Componente simplificado para rankings pequeños
export const MiniLeaderBoard = ({ players = [], currentUserId = null, maxVisible = 5 }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-3 bg-gray-50 border-b border-gray-200">
        <h3 className="font-bold text-gray-800 text-sm">Top {maxVisible}</h3>
      </div>
      
      <div className="divide-y divide-gray-100">
        {players.slice(0, maxVisible).map((player, index) => {
          const position = index + 1;
          const isCurrentUser = player.userId === currentUserId;
          
          return (
            <div
              key={player.userId || index}
              className={`p-3 flex items-center justify-between ${
                isCurrentUser ? 'bg-blue-50' : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-3 ${
                  position === 1 ? 'bg-yellow-500 text-white' :
                  position === 2 ? 'bg-gray-400 text-white' :
                  position === 3 ? 'bg-amber-500 text-white' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {position}
                </span>
                
                <span className={`font-medium text-sm truncate ${
                  isCurrentUser ? 'text-blue-600' : 'text-gray-800'
                }`}>
                  {player.name}
                </span>
              </div>
              
              <span className="font-bold text-sm text-gray-800">
                {(player.points || 0).toFixed(0)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LeaderBoard;