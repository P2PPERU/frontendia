// src/components/tournaments/TournamentQuickAccess.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Zap, Users, Clock, ChevronRight, Star, DollarSign } from 'lucide-react';
import { useTournaments } from '../../hooks/useTournaments';
import TournamentTimer from './TournamentTimer';

// Componente para mostrar acceso rápido a torneos en la pantalla principal
const TournamentQuickAccess = ({ className = '' }) => {
  const navigate = useNavigate();
  const { tournaments, loading, userBalance } = useTournaments({
    loadOnMount: true,
    autoRefresh: false
  });

  const [featuredTournaments, setFeaturedTournaments] = useState([]);

  useEffect(() => {
    // Filtrar torneos destacados y activos
    const featured = tournaments
      .filter(t => 
        (t.featured || t.status === 'REGISTRATION' || t.status === 'ACTIVE') &&
        t.currentPlayers < t.maxPlayers
      )
      .sort((a, b) => {
        // Priorizar torneos destacados, luego por estado, luego por premio
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        if (a.status !== b.status) {
          const statusOrder = { 'REGISTRATION': 0, 'ACTIVE': 1, 'UPCOMING': 2 };
          return (statusOrder[a.status] || 3) - (statusOrder[b.status] || 3);
        }
        return b.prizePool - a.prizePool;
      })
      .slice(0, 3);

    setFeaturedTournaments(featured);
  }, [tournaments]);

  if (loading || featuredTournaments.length === 0) {
    return null; // No mostrar nada si está cargando o no hay torneos
  }

  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Trophy className="w-5 h-5 mr-2" />
            <h3 className="font-bold">Torneos Activos</h3>
          </div>
          <button
            onClick={() => navigate('/app/tournaments')}
            className="text-purple-100 hover:text-white transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        
        <div className="mt-2 text-purple-100 text-sm">
          Tu balance: S/ {userBalance.toFixed(2)}
        </div>
      </div>

      {/* Lista de torneos */}
      <div className="divide-y divide-gray-100">
        {featuredTournaments.map((tournament) => (
          <div
            key={tournament.id}
            onClick={() => navigate(`/app/tournaments/${tournament.id}`)}
            className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-bold text-gray-800 text-sm line-clamp-1">
                    {tournament.name}
                  </h4>
                  
                  {/* Badges */}
                  {tournament.featured && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      <Zap className="w-3 h-3 mr-1" />
                      Destacado
                    </span>
                  )}
                  
                  {tournament.type === 'FREEROLL' && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      <Star className="w-3 h-3 mr-1" />
                      Gratis
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-4 text-xs text-gray-600">
                  <div className="flex items-center">
                    <Trophy className="w-3 h-3 mr-1" />
                    S/ {tournament.prizePool}
                  </div>
                  
                  <div className="flex items-center">
                    <Users className="w-3 h-3 mr-1" />
                    {tournament.currentPlayers}/{tournament.maxPlayers}
                  </div>
                  
                  {tournament.buyIn > 0 && (
                    <div className="flex items-center">
                      <DollarSign className="w-3 h-3 mr-1" />
                      S/ {tournament.buyIn}
                    </div>
                  )}
                </div>
              </div>

              {/* Estado y timer */}
              <div className="text-right ml-3">
                <div className={`text-xs font-medium mb-1 ${
                  tournament.status === 'REGISTRATION' ? 'text-green-600' :
                  tournament.status === 'ACTIVE' ? 'text-orange-600' :
                  'text-gray-600'
                }`}>
                  {tournament.status === 'REGISTRATION' ? 'Registro' :
                   tournament.status === 'ACTIVE' ? 'En Vivo' :
                   tournament.status === 'UPCOMING' ? 'Próximo' :
                   tournament.status}
                </div>
                
                {tournament.status === 'REGISTRATION' && tournament.registrationDeadline && (
                  <TournamentTimer
                    targetDate={tournament.registrationDeadline}
                    size="small"
                    showLabels={false}
                    className="text-xs"
                  />
                )}
                
                {tournament.status === 'ACTIVE' && tournament.endTime && (
                  <TournamentTimer
                    targetDate={tournament.endTime}
                    size="small"
                    showLabels={false}
                    className="text-xs"
                  />
                )}
                
                {tournament.status === 'UPCOMING' && tournament.startTime && (
                  <TournamentTimer
                    targetDate={tournament.startTime}
                    size="small"
                    showLabels={false}
                    className="text-xs"
                  />
                )}
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-3">
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className={`h-1.5 rounded-full transition-all ${
                    tournament.currentPlayers >= tournament.maxPlayers * 0.9 ? 'bg-red-500' :
                    tournament.currentPlayers >= tournament.maxPlayers * 0.7 ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}
                  style={{ width: `${(tournament.currentPlayers / tournament.maxPlayers) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-3 bg-gray-50 border-t border-gray-100">
        <button
          onClick={() => navigate('/app/tournaments')}
          className="w-full text-center text-blue-600 font-medium text-sm hover:text-blue-700 transition-colors"
        >
          Ver todos los torneos
        </button>
      </div>
    </div>
  );
};

// Componente más simple para mostrar estadísticas rápidas
export const TournamentStats = ({ className = '' }) => {
  const { tournaments } = useTournaments({ loadOnMount: true });

  const stats = {
    active: tournaments.filter(t => t.status === 'ACTIVE').length,
    registration: tournaments.filter(t => t.status === 'REGISTRATION').length,
    totalPrizePool: tournaments.reduce((sum, t) => sum + (t.prizePool || 0), 0)
  };

  if (tournaments.length === 0) return null;

  return (
    <div className={`grid grid-cols-3 gap-3 ${className}`}>
      <div className="bg-white rounded-xl p-3 text-center shadow-sm border border-gray-200">
        <div className="text-xl font-bold text-green-600">{stats.active}</div>
        <div className="text-xs text-gray-600">En Vivo</div>
      </div>
      
      <div className="bg-white rounded-xl p-3 text-center shadow-sm border border-gray-200">
        <div className="text-xl font-bold text-blue-600">{stats.registration}</div>
        <div className="text-xs text-gray-600">Registro</div>
      </div>
      
      <div className="bg-white rounded-xl p-3 text-center shadow-sm border border-gray-200">
        <div className="text-xl font-bold text-purple-600">
          S/ {stats.totalPrizePool.toFixed(0)}
        </div>
        <div className="text-xs text-gray-600">Premios</div>
      </div>
    </div>
  );
};

export default TournamentQuickAccess;