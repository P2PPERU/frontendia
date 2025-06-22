import React from 'react';
import { Trophy, Users, Clock, DollarSign, Star, Zap, Lock, CheckCircle } from 'lucide-react';
import TournamentTimer from './TournamentTimer';
import PrizePoolDisplay from './PrizePoolDisplay';

const TournamentCard = ({ 
  tournament, 
  userBalance = 0,
  isPremium = false,
  isRegistered = false,
  onClick,
  showStatus = true 
}) => {
  // Determinar si puede unirse
  const canJoin = () => {
    if (tournament.status !== 'REGISTRATION') return false;
    if (tournament.currentPlayers >= tournament.maxPlayers) return false;
    if (new Date() > new Date(tournament.registrationDeadline)) return false;
    if (tournament.buyIn > userBalance) return false;
    if (tournament.requiresPremium && !isPremium) return false;
    return true;
  };

  // Determinar el color del borde según el estado
  const getBorderColor = () => {
    if (isRegistered) return 'border-green-500';
    if (tournament.type === 'FREEROLL') return 'border-blue-500';
    if (tournament.buyIn > 20) return 'border-purple-500';
    if (tournament.status === 'ACTIVE') return 'border-orange-500';
    return 'border-gray-200';
  };

  // Determinar el estado visual
  const getStatusInfo = () => {
    switch (tournament.status) {
      case 'UPCOMING':
        return { text: 'Próximamente', color: 'text-gray-600', bg: 'bg-gray-100' };
      case 'REGISTRATION':
        return { text: 'Registro Abierto', color: 'text-green-600', bg: 'bg-green-100' };
      case 'ACTIVE':
        return { text: 'En Vivo', color: 'text-orange-600', bg: 'bg-orange-100' };
      case 'FINISHED':
        return { text: 'Finalizado', color: 'text-gray-600', bg: 'bg-gray-100' };
      case 'CANCELLED':
        return { text: 'Cancelado', color: 'text-red-600', bg: 'bg-red-100' };
      default:
        return { text: 'Desconocido', color: 'text-gray-600', bg: 'bg-gray-100' };
    }
  };

  const statusInfo = getStatusInfo();
  const canUserJoin = canJoin();
  const isFull = tournament.currentPlayers >= tournament.maxPlayers;
  const fillPercentage = (tournament.currentPlayers / tournament.maxPlayers) * 100;

  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-2xl shadow-sm border-2 ${getBorderColor()} overflow-hidden cursor-pointer transform transition-all hover:scale-[1.02] hover:shadow-md active:scale-95`}
    >
      {/* Header */}
      <div className="relative p-4 pb-2">
        {/* Badges superiores */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {tournament.type === 'FREEROLL' && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                <Star className="w-3 h-3 mr-1" />
                GRATIS
              </span>
            )}
            
            {tournament.featured && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800">
                <Zap className="w-3 h-3 mr-1" />
                DESTACADO
              </span>
            )}
            
            {tournament.requiresPremium && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800">
                <Lock className="w-3 h-3 mr-1" />
                PREMIUM
              </span>
            )}
          </div>
          
          {isRegistered && (
            <div className="flex items-center text-green-600">
              <CheckCircle className="w-5 h-5" />
            </div>
          )}
        </div>

        {/* Título y descripción */}
        <h3 className="text-lg font-bold text-gray-800 mb-1 line-clamp-1">
          {tournament.name}
        </h3>
        
        {tournament.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {tournament.description}
          </p>
        )}

        {/* Prize Pool */}
        <PrizePoolDisplay 
          prizePool={tournament.prizePool}
          currency={tournament.currency || 'S/'}
          size="large"
        />
      </div>

      {/* Stats Grid */}
      <div className="px-4 py-3 bg-gray-50">
        <div className="grid grid-cols-2 gap-4">
          {/* Buy-in */}
          <div className="flex items-center">
            <DollarSign className="w-4 h-4 text-green-600 mr-2" />
            <div>
              <div className="text-xs text-gray-500">Buy-in</div>
              <div className="font-bold text-gray-800">
                {tournament.buyIn === 0 ? 'GRATIS' : `S/ ${tournament.buyIn}`}
              </div>
            </div>
          </div>

          {/* Participantes */}
          <div className="flex items-center">
            <Users className="w-4 h-4 text-blue-600 mr-2" />
            <div>
              <div className="text-xs text-gray-500">Jugadores</div>
              <div className="font-bold text-gray-800">
                {tournament.currentPlayers}/{tournament.maxPlayers}
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar de jugadores */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
            <span>Espacios ocupados</span>
            <span>{Math.round(fillPercentage)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all ${
                fillPercentage >= 90 ? 'bg-red-500' : 
                fillPercentage >= 70 ? 'bg-yellow-500' : 
                'bg-green-500'
              }`}
              style={{ width: `${fillPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Timer y Estado */}
      <div className="px-4 py-3 border-t border-gray-100">
        {tournament.status === 'REGISTRATION' && (
          <div className="mb-2">
            <div className="flex items-center text-xs text-gray-600 mb-1">
              <Clock className="w-3 h-3 mr-1" />
              Registro termina en:
            </div>
            <TournamentTimer 
              targetDate={tournament.registrationDeadline}
              size="small"
              showLabels={false}
            />
          </div>
        )}

        {tournament.status === 'UPCOMING' && (
          <div className="mb-2">
            <div className="flex items-center text-xs text-gray-600 mb-1">
              <Clock className="w-3 h-3 mr-1" />
              Inicia en:
            </div>
            <TournamentTimer 
              targetDate={tournament.startTime}
              size="small"
              showLabels={false}
            />
          </div>
        )}

        {tournament.status === 'ACTIVE' && (
          <div className="mb-2">
            <div className="flex items-center text-xs text-gray-600 mb-1">
              <Clock className="w-3 h-3 mr-1" />
              Termina en:
            </div>
            <TournamentTimer 
              targetDate={tournament.endTime}
              size="small"
              showLabels={false}
            />
          </div>
        )}

        {/* Estado y acción */}
        <div className="flex items-center justify-between">
          {showStatus && (
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusInfo.bg} ${statusInfo.color}`}>
              {statusInfo.text}
            </span>
          )}

          {/* Indicadores de acceso */}
          <div className="flex items-center gap-2">
            {!canUserJoin && tournament.status === 'REGISTRATION' && (
              <div className="text-xs text-red-600 font-medium">
                {isFull ? 'Lleno' : 
                 tournament.buyIn > userBalance ? 'Sin balance' :
                 tournament.requiresPremium && !isPremium ? 'Premium' :
                 'No disponible'}
              </div>
            )}
            
            {isRegistered && (
              <div className="text-xs text-green-600 font-medium">
                Registrado
              </div>
            )}

            {canUserJoin && !isRegistered && (
              <div className="text-xs text-blue-600 font-medium">
                Disponible
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overlay para torneos no disponibles */}
      {tournament.requiresPremium && !isPremium && (
        <div className="absolute inset-0 bg-black bg-opacity-10 flex items-center justify-center">
          <div className="bg-white rounded-full p-3 shadow-lg">
            <Lock className="w-6 h-6 text-purple-600" />
          </div>
        </div>
      )}
    </div>
  );
};

export default TournamentCard;