import React, { useState, useEffect } from 'react';
import { Trophy, Crown, Zap, TrendingUp, TrendingDown, Clock, Users, Star, Target, ArrowUp, ArrowDown, Flame, AlertCircle, CheckCircle, Sword, Shield, Brain, Timer } from 'lucide-react';

const TournamentLive = ({ tournament }) => {
  const [activeTab, setActiveTab] = useState('leaderboard');
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [showHalftimeModal, setShowHalftimeModal] = useState(false);
  const [halftimeChanges, setHalftimeChanges] = useState({});
  const [liveData, setLiveData] = useState({});

  // Datos del torneo en vivo
  const tournamentData = {
    id: tournament?.id || 1,
    name: '🔥 Copa Clásicos Sudamericanos',
    participants: 187,
    prizePool: 2500,
    timeLeft: '1h 23m',
    status: 'LIVE',
    myPosition: 23,
    myPoints: 287
  };

  // Leaderboard en tiempo real
  const [leaderboard, setLeaderboard] = useState([
    { 
      position: 1, 
      player: 'PredictorPro_87', 
      points: 445, 
      trend: 'up', 
      change: +23, 
      bigMasterHits: 2, 
      accuracy: 78,
      avatar: '🥇',
      prize: 750
    },
    { 
      position: 2, 
      player: 'AnalysisKing', 
      points: 423, 
      trend: 'down', 
      change: -15, 
      bigMasterHits: 1, 
      accuracy: 82,
      avatar: '🥈',
      prize: 375
    },
    { 
      position: 3, 
      player: 'FootballGuru', 
      points: 398, 
      trend: 'up', 
      change: +45, 
      bigMasterHits: 3, 
      accuracy: 71,
      avatar: '🥉',
      prize: 250
    },
    { 
      position: 4, 
      player: 'LuckySeven77', 
      points: 367, 
      trend: 'same', 
      change: 0, 
      bigMasterHits: 1, 
      accuracy: 85,
      avatar: '⭐',
      prize: 188
    },
    { 
      position: 5, 
      player: 'StatsMaster', 
      points: 345, 
      trend: 'up', 
      change: +12, 
      bigMasterHits: 2, 
      accuracy: 79,
      avatar: '🎯',
      prize: 125
    },
    // Usuario actual
    { 
      position: 23, 
      player: 'TU', 
      points: 287, 
      trend: 'up', 
      change: +18, 
      bigMasterHits: 1, 
      accuracy: 75,
      avatar: '👤',
      prize: 62,
      isCurrentUser: true
    }
  ]);

  // Partidos en vivo con estado
  const liveMatches = [
    {
      id: 1,
      match: 'Real Madrid vs Barcelona',
      status: 'LIVE',
      minute: 67,
      score: '1-1',
      myPrediction: { option: 'Gana Real Madrid', points: 53, bigMaster: false, status: 'LOSING' },
      canChange: true,
      halftime: false
    },
    {
      id: 2,
      match: 'Manchester City vs Liverpool', 
      status: 'HALFTIME',
      minute: 45,
      score: '2-0',
      myPrediction: { option: 'Más de 2.5 Goles', points: 35, bigMaster: true, multiplier: '2x', status: 'WINNING' },
      canChange: true,
      halftime: true
    },
    {
      id: 3,
      match: 'PSG vs Bayern Munich',
      status: 'FINISHED',
      minute: 90,
      score: '3-2',
      myPrediction: { option: 'Empate', points: 68, bigMaster: false, status: 'LOST' },
      canChange: false,
      halftime: false
    },
    {
      id: 4,
      match: 'Universitario vs Alianza Lima',
      status: 'PENDING',
      minute: 0,
      score: '0-0',
      myPrediction: { option: 'Gana Universitario', points: 49, bigMaster: false, status: 'PENDING' },
      canChange: false,
      halftime: false
    }
  ];

  // Alternativas para cambio en medio tiempo
  const halftimeOptions = {
    2: [
      { option: 'Menos de 2.5 Goles', points: 58, odds: 2.40, reason: 'Ya hay 2 goles, menos probable que llegue a 3' },
      { option: 'Empate Final', points: 71, odds: 8.50, reason: 'Liverpool puede empatar, cuota alta' },
      { option: 'Gana Liverpool', points: 76, odds: 12.00, reason: 'Remontada épica, máximo riesgo/recompensa' }
    ]
  };

  // Simular updates en tiempo real
  useEffect(() => {
    const interval = setInterval(() => {
      // Simular cambios en posiciones del leaderboard
      setLeaderboard(prev => prev.map(player => ({
        ...player,
        points: player.points + Math.floor(Math.random() * 10 - 2), // +/- puntos aleatorios
        change: Math.floor(Math.random() * 20 - 10)
      })).sort((a, b) => b.points - a.points).map((player, idx) => ({ ...player, position: idx + 1 })));
    }, 10000); // Update cada 10 segundos

    return () => clearInterval(interval);
  }, []);

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

  const getStatusColor = (status) => {
    const colors = {
      'WINNING': 'text-green-600 bg-green-50',
      'LOSING': 'text-red-600 bg-red-50',
      'LOST': 'text-red-700 bg-red-100',
      'WON': 'text-green-700 bg-green-100',
      'PENDING': 'text-yellow-600 bg-yellow-50'
    };
    return colors[status] || 'text-gray-600 bg-gray-50';
  };

  const HalftimeModal = () => (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <div className="text-center mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sword className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">¡Cambio Estratégico!</h2>
          <p className="text-gray-600">
            {selectedMatch?.match} - {selectedMatch?.score} en el medio tiempo
          </p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
          <div className="flex items-center mb-2">
            <AlertCircle className="w-4 h-4 text-yellow-600 mr-2" />
            <span className="font-bold text-yellow-800">Predicción Actual</span>
          </div>
          <p className="text-sm text-yellow-700">
            {selectedMatch?.myPrediction.option} - {selectedMatch?.myPrediction.points} puntos
            {selectedMatch?.myPrediction.bigMaster && (
              <span className="ml-2 bg-orange-500 text-white px-2 py-1 rounded text-xs">
                BIG MASTER {selectedMatch?.myPrediction.multiplier}
              </span>
            )}
          </p>
        </div>

        <div className="space-y-3 mb-6">
          <h3 className="font-bold text-gray-800">Nuevas Opciones:</h3>
          {halftimeOptions[selectedMatch?.id]?.map((option, idx) => (
            <button
              key={idx}
              onClick={() => {
                setHalftimeChanges({
                  ...halftimeChanges,
                  [selectedMatch.id]: option
                });
                setShowHalftimeModal(false);
              }}
              className="w-full p-4 bg-gray-50 hover:bg-blue-50 border-2 border-transparent hover:border-blue-300 rounded-xl text-left transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-gray-800">{option.option}</span>
                <span className="text-lg font-bold text-green-600">{option.points} pts</span>
              </div>
              <p className="text-xs text-gray-600 mb-1">Cuota: {option.odds}</p>
              <p className="text-xs text-blue-600">{option.reason}</p>
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setShowHalftimeModal(false)}
            className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-bold"
          >
            Mantener
          </button>
        </div>
      </div>
    </div>
  );

  const LeaderboardTab = () => (
    <div className="space-y-4">
      {/* Mi posición destacada */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center mb-1">
              <span className="text-2xl mr-2">{getPositionIcon(tournamentData.myPosition)}</span>
              <span className="text-lg font-bold">Tu Posición: #{tournamentData.myPosition}</span>
            </div>
            <div className="text-blue-100 text-sm">
              Puntos: {tournamentData.myPoints} • Premio estimado: S/ 62
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-blue-200">Distancia al líder</div>
            <div className="text-xl font-bold">-{leaderboard[0]?.points - tournamentData.myPoints}</div>
          </div>
        </div>
      </div>

      {/* Top 5 + Usuario actual */}
      <div className="bg-white rounded-2xl shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-800">🏆 Clasificación en Vivo</h3>
            <div className="flex items-center text-sm text-gray-600">
              <Users className="w-4 h-4 mr-1" />
              {tournamentData.participants} jugadores
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {leaderboard.slice(0, 5).concat(leaderboard.find(p => p.isCurrentUser) || []).map((player, idx) => (
            <div 
              key={player.position} 
              className={`p-4 transition-all ${player.isCurrentUser ? 'bg-blue-50 border-l-4 border-blue-500' : 'hover:bg-gray-50'}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-center min-w-[40px]">
                    <div className="text-lg">{getPositionIcon(player.position)}</div>
                    <div className={`text-xs font-bold ${player.isCurrentUser ? 'text-blue-600' : 'text-gray-600'}`}>
                      #{player.position}
                    </div>
                  </div>
                  
                  <div>
                    <div className={`font-bold ${player.isCurrentUser ? 'text-blue-800' : 'text-gray-800'}`}>
                      {player.isCurrentUser ? 'TU' : player.player}
                    </div>
                    <div className="flex items-center text-xs text-gray-600 space-x-2">
                      <span>🎯 {player.accuracy}%</span>
                      <span>⭐ {player.bigMasterHits} BM</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center">
                    <span className={`text-lg font-bold ${player.isCurrentUser ? 'text-blue-600' : 'text-gray-800'}`}>
                      {player.points}
                    </span>
                    {player.change !== 0 && (
                      <span className={`ml-2 text-sm flex items-center ${
                        player.change > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {player.change > 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                        {Math.abs(player.change)}
                      </span>
                    )}
                  </div>
                  <div className={`text-xs font-medium ${getPrizeColor(player.position, tournamentData.participants)}`}>
                    S/ {player.prize}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Premio breakdown */}
      <div className="bg-white rounded-2xl shadow-sm p-4">
        <h3 className="font-bold text-gray-800 mb-3">💰 Distribución de Premios</h3>
        <div className="grid grid-cols-4 gap-2 text-center text-sm">
          <div className="p-2 bg-yellow-50 rounded">
            <div className="text-yellow-600 font-bold">🥇 1°</div>
            <div className="text-xs">30%</div>
          </div>
          <div className="p-2 bg-gray-50 rounded">
            <div className="text-gray-600 font-bold">🥈 2°-3°</div>
            <div className="text-xs">20%</div>
          </div>
          <div className="p-2 bg-orange-50 rounded">
            <div className="text-orange-600 font-bold">🥉 4°-10°</div>
            <div className="text-xs">30%</div>
          </div>
          <div className="p-2 bg-blue-50 rounded">
            <div className="text-blue-600 font-bold">🎯 11°-28°</div>
            <div className="text-xs">20%</div>
          </div>
        </div>
      </div>
    </div>
  );

  const LiveMatchesTab = () => (
    <div className="space-y-4">
      {liveMatches.map(match => (
        <div key={match.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded text-xs font-bold ${
                  match.status === 'LIVE' ? 'bg-red-100 text-red-700' :
                  match.status === 'HALFTIME' ? 'bg-yellow-100 text-yellow-700' :
                  match.status === 'FINISHED' ? 'bg-gray-100 text-gray-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {match.status}
                </span>
                {match.status === 'LIVE' && (
                  <span className="text-sm text-gray-600">{match.minute}'</span>
                )}
              </div>
              
              <div className="text-lg font-bold text-gray-800">
                {match.score}
              </div>
            </div>
            
            <h3 className="font-bold text-gray-800">{match.match}</h3>
          </div>

          <div className="p-4">
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Tu predicción:</span>
                <span className={`text-xs px-2 py-1 rounded font-medium ${getStatusColor(match.myPrediction.status)}`}>
                  {match.myPrediction.status}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="font-medium text-gray-800">{match.myPrediction.option}</span>
                  {match.myPrediction.bigMaster && (
                    <span className="ml-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                      <Crown className="w-3 h-3 inline mr-1" />
                      BIG MASTER {match.myPrediction.multiplier}
                    </span>
                  )}
                </div>
                
                <div className="text-right">
                  <span className="font-bold text-blue-600">
                    {match.myPrediction.bigMaster 
                      ? match.myPrediction.points * parseFloat(match.myPrediction.multiplier) 
                      : match.myPrediction.points
                    }
                  </span>
                  <span className="text-xs text-gray-500 ml-1">pts</span>
                </div>
              </div>
            </div>

            {halftimeChanges[match.id] && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <div className="flex items-center mb-1">
                  <Sword className="w-4 h-4 text-blue-600 mr-2" />
                  <span className="font-bold text-blue-800">Cambio de Medio Tiempo</span>
                </div>
                <p className="text-sm text-blue-700">
                  Nuevo: {halftimeChanges[match.id].option} ({halftimeChanges[match.id].points} pts)
                </p>
              </div>
            )}

            {match.canChange && match.halftime && !halftimeChanges[match.id] && (
              <button
                onClick={() => {
                  setSelectedMatch(match);
                  setShowHalftimeModal(true);
                }}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-lg font-bold hover:shadow-lg transition-all flex items-center justify-center"
              >
                <Sword className="w-5 h-5 mr-2" />
                ¡Cambio Estratégico Disponible!
              </button>
            )}
          </div>
        </div>
      ))}

      {/* Resumen de cambios */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-4 text-white">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold">⚔️ Arsenal de Cambios</h3>
          <div className="text-sm text-gray-300">Medio Tiempo</div>
        </div>
        
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-white/10 rounded-lg p-2">
            <div className="text-lg font-bold">2</div>
            <div className="text-xs text-gray-300">Disponibles</div>
          </div>
          <div className="bg-white/10 rounded-lg p-2">
            <div className="text-lg font-bold">{Object.keys(halftimeChanges).length}</div>
            <div className="text-xs text-gray-300">Usados</div>
          </div>
          <div className="bg-white/10 rounded-lg p-2">
            <div className="text-lg font-bold">75%</div>
            <div className="text-xs text-gray-300">Éxito histórico</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header en vivo */}
      <div className="bg-gradient-to-r from-red-600 via-purple-600 to-blue-600 text-white p-4 sticky top-0 z-40">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse mr-2"></div>
            <span className="font-bold">EN VIVO</span>
          </div>
          <div className="text-right">
            <div className="font-bold">{tournamentData.timeLeft}</div>
            <div className="text-xs text-red-100">restante</div>
          </div>
        </div>

        <h1 className="text-xl font-bold mb-1">{tournamentData.name}</h1>
        
        <div className="flex items-center justify-between">
          <div className="text-sm text-red-100">
            🏆 S/ {tournamentData.prizePool.toLocaleString()} • {tournamentData.participants} jugadores
          </div>
          <div className="flex items-center space-x-3 text-sm">
            <div className="bg-white/20 rounded px-2 py-1">
              Pos. #{tournamentData.myPosition}
            </div>
            <div className="bg-white/20 rounded px-2 py-1">
              {tournamentData.myPoints} pts
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 mt-4">
        <div className="flex space-x-1 bg-white rounded-xl p-1 shadow-sm">
          {[
            { id: 'leaderboard', label: '🏆 Clasificación', icon: Trophy },
            { id: 'matches', label: '⚡ En Vivo', icon: Zap }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-red-500 to-purple-500 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === 'leaderboard' && <LeaderboardTab />}
        {activeTab === 'matches' && <LiveMatchesTab />}
      </div>

      {showHalftimeModal && <HalftimeModal />}
    </div>
  );
};

export default TournamentLive;