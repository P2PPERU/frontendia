import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Target, Trophy, Clock, Zap, CheckCircle, AlertCircle, 
  RefreshCw, Star, TrendingUp, Award, Users, Calendar, Play
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import tournamentsService from '../../services/api/tournaments';
import PredictionSubmit from '../../components/tournaments/PredictionSubmit';
import { MiniLeaderBoard } from '../../components/tournaments/LeaderBoard';
import TournamentTimer from '../../components/tournaments/TournamentTimer';

const TournamentPlay = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [tournament, setTournament] = useState(null);
  const [matches, setMatches] = useState([]);
  const [userPredictions, setUserPredictions] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [userRanking, setUserRanking] = useState(null);

  // Cargar datos del torneo y partidos
  const loadTournamentData = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      // Cargar detalles del torneo
      const tournamentResult = await tournamentsService.getTournament(id);
      
      if (!tournamentResult.success) {
        setError(tournamentResult.message || 'Error al cargar el torneo');
        return;
      }

      setTournament(tournamentResult.tournament);

      // Verificar que el usuario esté registrado
      if (!tournamentResult.userEntry) {
        setError('No estás registrado en este torneo');
        return;
      }

      // Verificar que el torneo esté activo
      if (tournamentResult.tournament.status !== 'ACTIVE') {
        setError('El torneo no está activo actualmente');
        return;
      }

      // Cargar partidos disponibles para predicciones
      const matchesResult = await tournamentsService.getTournamentMatches(id);
      
      if (matchesResult.success) {
        setMatches(matchesResult.matches || []);
        setUserPredictions(matchesResult.userPredictions || []);
      }

      // Cargar participantes para mini ranking
      const participantsResult = await tournamentsService.getTournamentParticipants(id, 10);
      
      if (participantsResult.success) {
        setParticipants(participantsResult.participants || []);
        
        // Encontrar posición del usuario
        const userPosition = participantsResult.participants.findIndex(p => p.userId === user?.id);
        if (userPosition !== -1) {
          setUserRanking({
            position: userPosition + 1,
            points: participantsResult.participants[userPosition].points || 0
          });
        }
      }

    } catch (err) {
      setError('Error de conexión. Verifica tu internet.');
    } finally {
      setLoading(false);
    }
  }, [id, user?.id]);

  useEffect(() => {
    loadTournamentData();
  }, [loadTournamentData]);

  // Auto-refresh cada 30 segundos
  useEffect(() => {
    if (!tournament || tournament.status !== 'ACTIVE') return;

    const interval = setInterval(() => {
      loadTournamentData();
    }, 30000);

    return () => clearInterval(interval);
  }, [tournament, loadTournamentData]);

  // Enviar predicción
  const handleSubmitPrediction = async (predictionData) => {
    setSubmitting(true);
    setError('');

    try {
      const result = await tournamentsService.submitPrediction(id, predictionData);
      
      if (result.success) {
        // Actualizar lista de predicciones del usuario
        setUserPredictions(prev => [
          ...prev.filter(p => p.matchId !== predictionData.matchId),
          result.prediction
        ]);

        // Actualizar ranking si se proporcionó
        if (result.ranking) {
          setUserRanking(result.ranking);
        }

        // Cerrar modal de predicción
        setSelectedMatch(null);

        // Mostrar mensaje de éxito
        alert(result.message || 'Predicción enviada exitosamente');

        // Recargar datos para actualizar ranking
        setTimeout(() => {
          loadTournamentData();
        }, 1000);

      } else {
        throw new Error(result.message || 'Error al enviar predicción');
      }
    } catch (err) {
      setError(err.message || 'Error al enviar predicción');
    } finally {
      setSubmitting(false);
    }
  };

  // Verificar si ya envió predicción para un partido
  const hasPredictionForMatch = (matchId) => {
    return userPredictions.some(p => p.matchId === matchId);
  };

  // Obtener predicción para un partido
  const getPredictionForMatch = (matchId) => {
    return userPredictions.find(p => p.matchId === matchId);
  };

  // Verificar si puede enviar predicción
  const canPredictMatch = (match) => {
    return new Date() < new Date(match.deadline);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando torneo...</p>
        </div>
      </div>
    );
  }

  if (error && !tournament) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={loadTournamentData}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700"
            >
              Intentar de nuevo
            </button>
            <button
              onClick={() => navigate(`/app/tournaments/${id}`)}
              className="w-full bg-gray-200 text-gray-800 py-3 rounded-xl font-bold hover:bg-gray-300"
            >
              Volver al torneo
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!tournament) return null;

  const pendingMatches = matches.filter(m => canPredictMatch(m) && !hasPredictionForMatch(m.id));
  const submittedMatches = matches.filter(m => hasPredictionForMatch(m.id));
  const expiredMatches = matches.filter(m => !canPredictMatch(m) && !hasPredictionForMatch(m.id));

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 pt-12 pb-6">
        <div className="flex items-center mb-4">
          <button
            onClick={() => navigate(`/app/tournaments/${id}`)}
            className="p-2 rounded-lg bg-white/20 backdrop-blur-sm text-white mr-3 hover:bg-white/30"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white mb-1 line-clamp-1">
              {tournament.name}
            </h1>
            <p className="text-blue-100 text-sm">Modo Competición</p>
          </div>
          
          <button
            onClick={loadTournamentData}
            className="p-2 rounded-lg bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        {/* Tu posición actual */}
        {userRanking && (
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Trophy className="w-5 h-5 text-yellow-300 mr-2" />
                <div>
                  <div className="text-blue-100 text-sm">Tu posición</div>
                  <div className="text-xl font-bold text-white">#{userRanking.position}</div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-blue-100 text-sm">Puntos</div>
                <div className="text-xl font-bold text-white">{userRanking.points}</div>
              </div>
            </div>
          </div>
        )}

        {/* Timer del torneo */}
        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Clock className="w-5 h-5 text-blue-200 mr-2" />
              <span className="text-blue-100 text-sm">Tiempo restante:</span>
            </div>
            <TournamentTimer 
              targetDate={tournament.endTime}
              size="small"
              showLabels={false}
              className="text-white"
            />
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mx-4 mt-4 bg-red-50 border border-red-200 rounded-xl p-3 flex items-center">
          <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0" />
          <span className="text-sm text-red-800">{error}</span>
        </div>
      )}

      {/* Mini Ranking */}
      {participants.length > 0 && (
        <div className="px-4 mt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-800">Top 5 Jugadores</h2>
            <button
              onClick={() => navigate(`/app/tournaments/${id}/ranking`)}
              className="text-blue-600 font-medium text-sm hover:underline"
            >
              Ver todos
            </button>
          </div>
          
          <MiniLeaderBoard
            players={participants}
            currentUserId={user?.id}
            maxVisible={5}
          />
        </div>
      )}

      {/* Partidos pendientes */}
      {pendingMatches.length > 0 && (
        <div className="px-4 mt-6">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-bold text-gray-800">
              Predicciones Pendientes ({pendingMatches.length})
            </h2>
          </div>
          
          <div className="space-y-4">
            {pendingMatches.map((match) => (
              <div
                key={match.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
              >
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800 text-lg">
                        {match.homeTeam} vs {match.awayTeam}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(match.startTime).toLocaleString('es-PE')}
                        </div>
                        <span className="text-blue-600">{match.league}</span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm text-gray-600 mb-1">Deadline:</div>
                      <div className="text-sm font-bold text-orange-600">
                        {new Date(match.deadline).toLocaleTimeString('es-PE', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedMatch(match)}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-xl font-bold hover:opacity-90 transition-all flex items-center justify-center"
                  >
                    <Target className="w-5 h-5 mr-2" />
                    Enviar Predicción
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Predicciones enviadas */}
      {submittedMatches.length > 0 && (
        <div className="px-4 mt-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-bold text-gray-800">
              Predicciones Enviadas ({submittedMatches.length})
            </h2>
          </div>
          
          <div className="space-y-4">
            {submittedMatches.map((match) => {
              const prediction = getPredictionForMatch(match.id);
              
              return (
                <div
                  key={match.id}
                  className="bg-green-50 border border-green-200 rounded-2xl p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800">
                        {match.homeTeam} vs {match.awayTeam}
                      </h3>
                      <div className="text-sm text-gray-600">{match.league}</div>
                    </div>
                    
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>

                  {prediction && (
                    <div className="bg-white rounded-xl p-4">
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Predicción:</span>
                          <div className="font-bold text-gray-800">{prediction.prediction}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Confianza:</span>
                          <div className="font-bold text-gray-800">{prediction.confidence}%</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Puntos:</span>
                          <div className="font-bold text-blue-600">{prediction.points || 0}</div>
                        </div>
                      </div>
                      
                      {prediction.result && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${
                            prediction.result === 'WON' ? 'bg-green-100 text-green-800' :
                            prediction.result === 'LOST' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {prediction.result === 'WON' ? '✓ Acertado' :
                             prediction.result === 'LOST' ? '✗ Fallado' :
                             '⏳ Pendiente'}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sin partidos disponibles */}
      {matches.length === 0 && (
        <div className="px-4 mt-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <Play className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-800 mb-2">No hay partidos disponibles</h3>
            <p className="text-gray-600 mb-4">
              Esperando que se agreguen nuevos partidos para predicciones
            </p>
            <button
              onClick={loadTournamentData}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700"
            >
              Actualizar
            </button>
          </div>
        </div>
      )}

      {/* Estadísticas rápidas */}
      <div className="px-4 mt-8 mb-8">
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-6 text-white">
          <h3 className="text-lg font-bold mb-4">Tu Progreso</h3>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {userPredictions.filter(p => p.result === 'WON').length}
              </div>
              <div className="text-sm text-gray-400">Acertadas</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">
                {userPredictions.filter(p => p.result === 'LOST').length}
              </div>
              <div className="text-sm text-gray-400">Falladas</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">
                {userPredictions.filter(p => !p.result || p.result === 'PENDING').length}
              </div>
              <div className="text-sm text-gray-400">Pendientes</div>
            </div>
          </div>
          
          {userRanking && (
            <div className="mt-4 pt-4 border-t border-gray-700 text-center">
              <div className="text-sm text-gray-400 mb-1">Total de puntos</div>
              <div className="text-2xl font-bold text-blue-400">{userRanking.points}</div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de predicción */}
      {selectedMatch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800">Nueva Predicción</h3>
              <button
                onClick={() => setSelectedMatch(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <AlertCircle className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4">
              <PredictionSubmit
                match={selectedMatch}
                onSubmit={handleSubmitPrediction}
                loading={submitting}
                timeLimit={selectedMatch.deadline}
                showConfidence={true}
                showOdds={true}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TournamentPlay;