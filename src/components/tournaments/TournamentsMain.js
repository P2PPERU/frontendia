// src/components/tournaments/TournamentsMain.js
import React, { useState, useEffect } from 'react';
import { Trophy, Users, Clock, Zap, Star, Target, PlayCircle, Crown, Timer, TrendingUp, Sword, DollarSign, Calendar, ArrowUp, ArrowDown } from 'lucide-react';

const TournamentsMain = ({ tournaments = {}, userStats = {}, onTournamentSelect, isPremium = false, userData = {} }) => {
  const [activeTab, setActiveTab] = useState('available');
  const [timeLeft, setTimeLeft] = useState({});

  // Datos por defecto si no se pasan props
  const defaultTournaments = {
    available: [],
    active: [],
    completed: []
  };

  const defaultUserStats = {
    totalTournaments: 0,
    prizesWon: 0,
    totalEarnings: 0,
    roi: 0,
    currentStreak: { type: 'winning', count: 0 },
    achievements: []
  };

  const tournamentsData = { ...defaultTournaments, ...tournaments };
  const userTournamentStats = { ...defaultUserStats, ...userStats };

  // Calcular tiempo restante para torneos
  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = {};
      
      if (tournamentsData.available) {
        tournamentsData.available.forEach(tournament => {
          const now = new Date().getTime();
          const start = new Date(tournament.startTime).getTime();
          const difference = start - now;
          
          if (difference > 0) {
            const hours = Math.floor(difference / (1000 * 60 * 60));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            newTimeLeft[tournament.id] = `${hours}h ${minutes}m`;
          } else {
            newTimeLeft[tournament.id] = 'Iniciado';
          }
        });
      }
      
      setTimeLeft(newTimeLeft);
    }, 60000);

    return () => clearInterval(timer);
  }, [tournamentsData.available]);

  const getTournamentTypeColor = (type) => {
    const colors = {
      'FREE': 'bg-gray-500',
      'STANDARD': 'bg-blue-500', 
      'PREMIUM': 'bg-purple-500',
      'VIP': 'bg-gradient-to-r from-yellow-400 to-orange-500'
    };
    return colors[type] || 'bg-gray-500';
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      'BEGINNER': 'text-green-600',
      'INTERMEDIATE': 'text-yellow-600',
      'PRO': 'text-orange-600',
      'EXPERT': 'text-red-600'
    };
    return colors[difficulty] || 'text-gray-600';
  };

  const getPrizeColor = (position, total) => {
    const percentage = (position / total) * 100;
    if (percentage <= 5) return 'text-yellow-600'; // Top 5% - Oro
    if (percentage <= 10) return 'text-gray-600';  // Top 10% - Plata
    if (percentage <= 15) return 'text-orange-600'; // Top 15% - Bronce
    return 'text-gray-400'; // Sin premio
  };

  const getPositionIcon = (position) => {
    if (position === 1) return '👑';
    if (position <= 3) return '🏆';
    if (position <= 10) return '⭐';
    if (position <= 20) return '🎯';
    return '🔸';
  };

  const AvailableTournaments = () => (
    <div className="space-y-4">
      {tournamentsData.available.length === 0 ? (
        <div className="text-center py-12">
          <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-600 mb-2">No hay torneos disponibles</h3>
          <p className="text-gray-500">Pronto habrán nuevos torneos emocionantes</p>
        </div>
      ) : (
        tournamentsData.available.map(tournament => (
          <div 
            key={tournament.id} 
            className={`bg-white rounded-2xl shadow-lg border-2 transition-all hover:shadow-xl cursor-pointer transform hover:scale-[1.02] ${
              tournament.featured ? 'border-orange-300 bg-gradient-to-r from-orange-50 to-yellow-50' : 'border-gray-200'
            }`}
            onClick={() => onTournamentSelect && onTournamentSelect(tournament)}
          >
            {tournament.featured && (
              <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-3 py-1 flex items-center justify-center">
                <Zap className="w-3 h-3 mr-1" />
                TORNEO DESTACADO - ¡GRANDES PREMIOS!
              </div>
            )}
            
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <span className={`text-xs font-bold px-2 py-1 rounded text-white mr-2 ${getTournamentTypeColor(tournament.type)}`}>
                      {tournament.type}
                    </span>
                    <span className={`text-xs font-bold ${getDifficultyColor(tournament.difficulty)}`}>
                      {tournament.difficulty}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-800 mb-1">{tournament.name}</h3>
                  <div className="flex items-center text-sm text-gray-600 space-x-4">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {timeLeft[tournament.id] || 'Calculando...'}
                    </div>
                    <div className="flex items-center">
                      <Target className="w-4 h-4 mr-1" />
                      {tournament.matches} partidos
                    </div>
                    <div className="flex items-center">
                      <Timer className="w-4 h-4 mr-1" />
                      {tournament.duration}
                    </div>
                  </div>
                  {tournament.description && (
                    <p className="text-xs text-gray-500 mt-1">{tournament.description}</p>
                  )}
                </div>
                
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">S/ {tournament.prizePool.toLocaleString()}</div>
                  <div className="text-sm text-gray-500">Premio total</div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-lg font-bold text-blue-600">
                    {tournament.entryFee === 0 ? 'GRATIS' : `S/ ${tournament.entryFee}`}
                  </div>
                  <div className="text-xs text-gray-600">Entry Fee</div>
                </div>
                
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-lg font-bold text-purple-600">{tournament.participants}/{tournament.maxParticipants}</div>
                  <div className="text-xs text-gray-600">Jugadores</div>
                </div>
                
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-lg font-bold text-green-600">{tournament.winnerPercent}%</div>
                  <div className="text-xs text-gray-600">Gana premio</div>
                </div>
                
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-lg font-bold text-orange-600">{tournament.bonusMultiplier}</div>
                  <div className="text-xs text-gray-600">Big Master</div>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2 flex-1">
                  <div className="w-full bg-gray-200 rounded-full h-2 max-w-48">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (tournament.participants / tournament.maxParticipants) * 100)}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 min-w-fit">
                    {Math.round((tournament.participants / tournament.maxParticipants) * 100)}% lleno
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {tournament.leagues && tournament.leagues.length > 0 && (
                    <span>🏆 {tournament.leagues.slice(0, 2).join(', ')}{tournament.leagues.length > 2 ? ' +' + (tournament.leagues.length - 2) : ''}</span>
                  )}
                </div>
                
                <button 
                  className={`px-6 py-2 rounded-lg font-bold text-white transition-all ${
                    tournament.entryFee === 0 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  } hover:shadow-lg transform hover:scale-105`}
                >
                  <PlayCircle className="w-4 h-4 mr-2 inline" />
                  {tournament.entryFee === 0 ? 'Jugar Gratis' : 'Inscribirse'}
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const ActiveTournaments = () => (
    <div className="space-y-6">
      {tournamentsData.active.length === 0 ? (
        <div className="text-center py-12">
          <Zap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-600 mb-2">No hay torneos activos</h3>
          <p className="text-gray-500">Inscríbete en un torneo para verlo aquí</p>
        </div>
      ) : (
        tournamentsData.active.map(tournament => (
          <div 
            key={tournament.id} 
            className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white cursor-pointer hover:shadow-2xl transition-all transform hover:scale-[1.02]"
            onClick={() => onTournamentSelect && onTournamentSelect({ ...tournament, status: 'LIVE' })}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center mb-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse mr-2"></div>
                  <span className="text-xs bg-red-500/20 text-red-200 px-2 py-1 rounded font-bold">EN VIVO</span>
                </div>
                <h3 className="text-xl font-bold mb-1">{tournament.name}</h3>
                <div className="flex items-center space-x-4 text-blue-100">
                  <span>🏆 Posición {tournament.myPosition}/{tournament.participants}</span>
                  <span>⏱️ {tournament.timeLeft} restante</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{tournament.myPoints} pts</div>
                <div className="text-sm text-blue-200">Líder: {tournament.leaderPoints} pts</div>
                <div className="text-xs text-blue-300 mt-1">
                  Faltan {tournament.leaderPoints - tournament.myPoints} pts
                </div>
              </div>
            </div>

            {tournament.matches && (
              <div className="bg-white/10 backdrop-blur rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold">Tus Predicciones:</span>
                  <div className="flex items-center space-x-2">
                    <Sword className="w-4 h-4" />
                    <span className="text-sm">Cambios: {tournament.halfTimeChangesAvailable - tournament.halfTimeChangesUsed}</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {tournament.matches.slice(0, 3).map((match, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-white/10 rounded-lg p-3">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{match.match}</div>
                        <div className="text-xs text-blue-200 flex items-center">
                          {match.bigMaster && <Star className="w-3 h-3 mr-1 text-yellow-300" />}
                          {match.prediction}
                          {match.bigMaster && (
                            <span className="ml-1 bg-yellow-500 text-black text-xs px-1 rounded font-bold">
                              BM {match.multiplier}
                            </span>
                          )}
                        </div>
                        {match.actualScore && (
                          <div className="text-xs text-blue-300">
                            {match.actualScore} ({match.minute}')
                          </div>
                        )}
                      </div>
                      
                      <div className="text-right">
                        <div className={`text-sm font-bold ${
                          match.status === 'WON' ? 'text-green-300' :
                          match.status === 'LOST' ? 'text-red-300' :
                          match.status === 'WINNING' ? 'text-green-200' :
                          match.status === 'LOSING' ? 'text-red-200' : 'text-yellow-300'
                        }`}>
                          {match.status === 'WON' || match.status === 'LOST' ? 
                            (match.points > 0 ? '+' : '') + match.points : 
                            match.originalPoints} pts
                        </div>
                        <div className={`text-xs px-2 py-1 rounded ${
                          match.status === 'WON' ? 'bg-green-500/20 text-green-300' :
                          match.status === 'LOST' ? 'bg-red-500/20 text-red-300' :
                          match.status === 'WINNING' ? 'bg-green-500/20 text-green-200' :
                          match.status === 'LOSING' ? 'bg-red-500/20 text-red-200' :
                          'bg-yellow-500/20 text-yellow-300'
                        }`}>
                          {match.status}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {tournament.matches.length > 3 && (
                    <div className="text-center text-xs text-blue-200">
                      +{tournament.matches.length - 3} predicciones más
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex space-x-3">
              <div className="flex-1 bg-white/20 hover:bg-white/30 rounded-lg py-3 px-4 text-center transition-all">
                <div className="font-bold">S/ {tournament.prizePool}</div>
                <div className="text-xs text-blue-200">Premio Total</div>
              </div>
              <div className="flex-1 bg-white/20 hover:bg-white/30 rounded-lg py-3 px-4 text-center transition-all">
                <div className="font-bold">{tournament.participants}</div>
                <div className="text-xs text-blue-200">Jugadores</div>
              </div>
              <div className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black rounded-lg py-3 px-4 font-bold transition-all text-center">
                <div>⚡ VER EN VIVO</div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const CompletedTournaments = () => (
    <div className="space-y-4">
      {tournamentsData.completed.length === 0 ? (
        <div className="text-center py-12">
          <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-600 mb-2">No hay torneos completados</h3>
          <p className="text-gray-500">Tus torneos completados aparecerán aquí</p>
        </div>
      ) : (
        tournamentsData.completed.map(tournament => (
          <div key={tournament.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">{tournament.name}</h3>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>🏆 Posición {tournament.position}/{tournament.totalPositions}</span>
                  <span>🎯 {tournament.accuracy}% precisión</span>
                  {tournament.bigMasterHits > 0 && (
                    <span>⭐ {tournament.bigMasterHits} Big Masters</span>
                  )}
                </div>
                {tournament.completedAt && (
                  <div className="text-xs text-gray-500 mt-1">
                    Completado el {new Date(tournament.completedAt).toLocaleDateString('es-PE', {
                      day: 'numeric',
                      month: 'long'
                    })}
                  </div>
                )}
              </div>
              
              <div className="text-right">
                <div className={`text-2xl font-bold ${
                  parseFloat(tournament.profit?.replace('+', '').replace('-', '')) > 0 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {tournament.prize > 0 ? `+S/ ${tournament.prize}` : 'S/ 0'}
                </div>
                <div className="text-sm text-gray-500">
                  {tournament.profit || `Entrada: S/ ${tournament.entryFee || 0}`}
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  tournament.position <= tournament.totalPositions * 0.05 ? 'bg-yellow-500' :
                  tournament.position <= tournament.totalPositions * 0.1 ? 'bg-gray-400' :
                  tournament.position <= tournament.totalPositions * 0.15 ? 'bg-orange-500' :
                  'bg-gray-300'
                }`}></div>
                <span className="text-sm font-medium">
                  {getPositionIcon(tournament.position)} {
                    tournament.position <= tournament.totalPositions * 0.05 ? 'Top 5%' :
                    tournament.position <= tournament.totalPositions * 0.1 ? 'Top 10%' :
                    tournament.position <= tournament.totalPositions * 0.15 ? 'Top 15%' :
                    'Sin premio'
                  }
                </span>
                {tournament.finalLeaderboard?.winner && (
                  <span className="text-xs text-gray-500">
                    👑 Ganó: {tournament.finalLeaderboard.winner}
                  </span>
                )}
              </div>
              
              <div className="flex space-x-2">
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  Ver Detalles
                </button>
                <button className="text-green-600 hover:text-green-800 text-sm font-medium">
                  Compartir
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-b-3xl shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold mb-1">🏆 Torneos PredicMaster</h1>
            <p className="text-blue-100 text-sm">Compite, gana y demuestra tu habilidad</p>
          </div>
          <div className="text-right">
            <div className="bg-white/20 backdrop-blur rounded-lg p-3">
              <div className="text-lg font-bold">
                S/ {(userTournamentStats.totalEarnings || 0).toLocaleString()}
              </div>
              <div className="text-xs text-blue-200">Ganancias totales</div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/10 backdrop-blur rounded-lg p-3 text-center">
            <div className="text-lg font-bold">{userTournamentStats.totalTournaments || 0}</div>
            <div className="text-xs text-blue-200">Torneos jugados</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-3 text-center">
            <div className="text-lg font-bold">{userTournamentStats.prizesWon || 0}</div>
            <div className="text-xs text-blue-200">Premios ganados</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-3 text-center">
            <div className="text-lg font-bold">
              {userTournamentStats.roi > 0 ? '+' : ''}{userTournamentStats.roi || 0}%
            </div>
            <div className="text-xs text-blue-200">ROI total</div>
          </div>
        </div>

        {/* Achievement highlight */}
        {userTournamentStats.currentStreak && userTournamentStats.currentStreak.count > 0 && (
          <div className="mt-4 bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Flame className="w-5 h-5 text-orange-300 mr-2" />
                <span className="font-bold text-orange-200">
                  Racha {userTournamentStats.currentStreak.type === 'winning' ? 'Ganadora' : 'Perdedora'}
                </span>
              </div>
              <span className="text-xl font-bold text-orange-100">
                {userTournamentStats.currentStreak.count}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="px-4 mt-6">
        <div className="flex space-x-1 bg-white rounded-xl p-1 shadow-sm">
          {[
            { 
              id: 'available', 
              label: '🎯 Disponibles', 
              count: tournamentsData.available?.length || 0 
            },
            { 
              id: 'active', 
              label: '⚡ En Juego', 
              count: tournamentsData.active?.length || 0 
            },
            { 
              id: 'completed', 
              label: '✅ Completados', 
              count: tournamentsData.completed?.length || 0 
            }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                  activeTab === tab.id ? 'bg-white/20' : 'bg-gray-200'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 mt-6">
        {activeTab === 'available' && <AvailableTournaments />}
        {activeTab === 'active' && <ActiveTournaments />}
        {activeTab === 'completed' && <CompletedTournaments />}
      </div>

      {/* Premium Upsell */}
      {!isPremium && activeTab === 'available' && (
        <div className="mx-4 mt-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-6 text-white">
          <div className="flex items-center mb-4">
            <Crown className="w-8 h-8 mr-3" />
            <div>
              <h3 className="text-lg font-bold">¡Hazte Premium!</h3>
              <p className="text-sm text-yellow-100">Acceso a torneos VIP y más premios</p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-3 mb-4 text-center text-sm">
            <div className="bg-white/20 rounded-lg p-2">
              <div className="font-bold">Torneos VIP</div>
              <div className="text-xs text-yellow-200">Exclusivos</div>
            </div>
            <div className="bg-white/20 rounded-lg p-2">
              <div className="font-bold">Sin anuncios</div>
              <div className="text-xs text-yellow-200">Experiencia pura</div>
            </div>
            <div className="bg-white/20 rounded-lg p-2">
              <div className="font-bold">Análisis IA</div>
              <div className="text-xs text-yellow-200">Ventaja extra</div>
            </div>
          </div>
          
          <button className="w-full bg-white text-orange-600 font-bold py-3 rounded-lg hover:shadow-lg transition-all">
            Actualizar a Premium - S/ 7/semana
          </button>
        </div>
      )}

      {/* Floating Action Button */}
      {tournamentsData.available && tournamentsData.available.length > 0 && (
        <div className="fixed bottom-24 right-6">
          <button 
            onClick={() => {
              const featuredTournament = tournamentsData.available.find(t => t.featured) || tournamentsData.available[0];
              onTournamentSelect && onTournamentSelect(featuredTournament);
            }}
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all transform hover:scale-110"
          >
            <Crown className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
};

export default TournamentsMain;