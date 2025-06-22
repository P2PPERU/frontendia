import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Trophy, Users, Clock, DollarSign, Star, Zap, Lock, 
  CheckCircle, AlertCircle, Target, TrendingUp, RefreshCw, Play,
  Award, Crown, Calendar, Info, Settings
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import tournamentsService from '../../services/api/tournaments';
import TournamentTimer from '../../components/tournaments/TournamentTimer';
import PrizePoolDisplay from '../../components/tournaments/PrizePoolDisplay';
import LeaderBoard, { MiniLeaderBoard } from '../../components/tournaments/LeaderBoard';

const TournamentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isPremium } = useAuth();
  
  const [tournament, setTournament] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [userEntry, setUserEntry] = useState(null);
  const [userBalance, setUserBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  // Cargar datos del torneo
  const loadTournamentData = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      // Cargar detalles del torneo
      const tournamentResult = await tournamentsService.getTournament(id);
      
      if (tournamentResult.success) {
        setTournament(tournamentResult.tournament);
        setUserEntry(tournamentResult.userEntry);
        setUserBalance(tournamentResult.userBalance || 0);

        // Cargar participantes si el torneo está activo
        if (tournamentResult.tournament.status === 'ACTIVE' || tournamentResult.tournament.status === 'FINISHED') {
          const participantsResult = await tournamentsService.getTournamentParticipants(id, 20);
          if (participantsResult.success) {
            setParticipants(participantsResult.participants);
          }
        }
      } else {
        setError(tournamentResult.message || 'Error al cargar el torneo');
      }
    } catch (err) {
      setError('Error de conexión. Verifica tu internet.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadTournamentData();
  }, [loadTournamentData]);

  // Inscribirse en el torneo
  const handleJoin = async () => {
    if (!tournament) return;

    // Verificar si puede inscribirse
    const canJoin = tournamentsService.canJoinTournament(tournament, userBalance, isPremium);
    
    if (!canJoin.canJoin) {
      if (canJoin.requiresDeposit) {
        const shouldDeposit = window.confirm(`${canJoin.reason}. ¿Deseas recargar tu balance?`);
        if (shouldDeposit) {
          navigate('/app/wallet');
        }
        return;
      }
      
      if (canJoin.requiresPremium) {
        const shouldUpgrade = window.confirm(`${canJoin.reason}. ¿Deseas hacerte Premium?`);
        if (shouldUpgrade) {
          navigate('/app/premium');
        }
        return;
      }
      
      alert(canJoin.reason);
      return;
    }

    const confirmMessage = tournament.buyIn > 0 
      ? `¿Confirmas tu inscripción por S/ ${tournament.buyIn}?`
      : '¿Confirmas tu inscripción gratuita?';

    if (!window.confirm(confirmMessage)) return;

    setJoining(true);
    setError('');

    try {
      const result = await tournamentsService.joinTournament(id);
      
      if (result.success) {
        setUserEntry(result.entry);
        setUserBalance(result.newBalance);
        
        // Actualizar el torneo para reflejar el nuevo número de participantes
        setTournament(prev => ({
          ...prev,
          currentPlayers: prev.currentPlayers + 1
        }));
        
        // Mostrar mensaje de éxito
        alert(result.message || '¡Te has inscrito exitosamente!');
      } else {
        setError(result.message || 'Error al inscribirse');
      }
    } catch (err) {
      setError('Error de conexión. Inténtalo de nuevo.');
    } finally {
      setJoining(false);
    }
  };

  // Salir del torneo
  const handleLeave = async () => {
    if (!tournament || !userEntry) return;

    const canLeave = tournament.status === 'REGISTRATION' || tournament.status === 'UPCOMING';
    
    if (!canLeave) {
      alert('No puedes salir de un torneo que ya comenzó');
      return;
    }

    const refundAmount = tournament.buyIn * 0.9; // 10% de penalización
    const confirmMessage = tournament.buyIn > 0
      ? `¿Confirmas que deseas salir? Recibirás S/ ${refundAmount.toFixed(2)} de reembolso (penalización del 10%)`
      : '¿Confirmas que deseas salir del torneo?';

    if (!window.confirm(confirmMessage)) return;

    setLeaving(true);
    setError('');

    try {
      const result = await tournamentsService.leaveTournament(id);
      
      if (result.success) {
        setUserEntry(null);
        setUserBalance(result.newBalance);
        
        // Actualizar el torneo
        setTournament(prev => ({
          ...prev,
          currentPlayers: prev.currentPlayers - 1
        }));
        
        alert(result.message || 'Has salido del torneo exitosamente');
      } else {
        setError(result.message || 'Error al salir del torneo');
      }
    } catch (err) {
      setError('Error de conexión. Inténtalo de nuevo.');
    } finally {
      setLeaving(false);
    }
  };

  // Ir a jugar
  const handlePlay = () => {
    navigate(`/app/tournaments/${id}/play`);
  };

  // Ver ranking completo
  const handleViewRanking = () => {
    navigate(`/app/tournaments/${id}/ranking`);
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
          <h2 className="text-xl font-bold text-gray-800 mb-2">Error al cargar torneo</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={loadTournamentData}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700"
            >
              Intentar de nuevo
            </button>
            <button
              onClick={() => navigate('/app/tournaments')}
              className="w-full bg-gray-200 text-gray-800 py-3 rounded-xl font-bold hover:bg-gray-300"
            >
              Volver a torneos
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!tournament) return null;

  const isRegistered = !!userEntry;
  const canJoin = !isRegistered && tournamentsService.canJoinTournament(tournament, userBalance, isPremium).canJoin;
  const canLeave = isRegistered && (tournament.status === 'REGISTRATION' || tournament.status === 'UPCOMING');
  const canPlay = isRegistered && tournament.status === 'ACTIVE';
  const timeLeft = tournamentsService.getRegistrationTimeLeft(tournament);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 pt-12 pb-6">
        <div className="flex items-center mb-4">
          <button
            onClick={() => navigate('/app/tournaments')}
            className="p-2 rounded-lg bg-white/20 backdrop-blur-sm text-white mr-3 hover:bg-white/30"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white mb-1 line-clamp-1">
              {tournament.name}
            </h1>
            <p className="text-blue-100 text-sm">{tournament.description}</p>
          </div>
          
          <button
            onClick={loadTournamentData}
            className="p-2 rounded-lg bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        {/* Estado del usuario */}
        {isRegistered ? (
          <div className="bg-green-500/20 backdrop-blur-sm rounded-xl p-4 border border-green-400/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-300 mr-2" />
                <span className="text-green-100 font-medium">Registrado en el torneo</span>
              </div>
              {canPlay && (
                <button
                  onClick={handlePlay}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-700 flex items-center"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Jugar
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-blue-100 text-sm">Tu balance</div>
                <div className="text-xl font-bold text-white">S/ {userBalance.toFixed(2)}</div>
              </div>
              <div className="text-right">
                <div className="text-blue-100 text-sm">Costo de entrada</div>
                <div className="text-xl font-bold text-white">
                  {tournament.buyIn === 0 ? 'GRATIS' : `S/ ${tournament.buyIn}`}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="mx-4 mt-4 bg-red-50 border border-red-200 rounded-xl p-3 flex items-center">
          <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0" />
          <span className="text-sm text-red-800">{error}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="px-4 mt-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex">
            {[
              { id: 'overview', label: 'Resumen', icon: Info },
              { id: 'leaderboard', label: 'Ranking', icon: Trophy },
              { id: 'rules', label: 'Reglas', icon: Settings }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 mt-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Prize Pool */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <PrizePoolDisplay
                prizePool={tournament.prizePool}
                prizeDistribution={tournament.prizeDistribution}
                guaranteed={tournament.guaranteed}
                growing={tournament.growing}
                showDistribution={true}
                size="large"
              />
            </div>

            {/* Información principal */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Información del Torneo</h3>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Buy-in */}
                <div className="flex items-center">
                  <DollarSign className="w-5 h-5 text-green-600 mr-3" />
                  <div>
                    <div className="text-sm text-gray-600">Buy-in</div>
                    <div className="font-bold text-gray-800">
                      {tournament.buyIn === 0 ? 'GRATIS' : `S/ ${tournament.buyIn}`}
                    </div>
                  </div>
                </div>

                {/* Participantes */}
                <div className="flex items-center">
                  <Users className="w-5 h-5 text-blue-600 mr-3" />
                  <div>
                    <div className="text-sm text-gray-600">Jugadores</div>
                    <div className="font-bold text-gray-800">
                      {tournament.currentPlayers}/{tournament.maxPlayers}
                    </div>
                  </div>
                </div>

                {/* Estado */}
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-orange-600 mr-3" />
                  <div>
                    <div className="text-sm text-gray-600">Estado</div>
                    <div className="font-bold text-gray-800 capitalize">
                      {tournament.status === 'REGISTRATION' ? 'Registro Abierto' :
                       tournament.status === 'UPCOMING' ? 'Próximamente' :
                       tournament.status === 'ACTIVE' ? 'En Vivo' :
                       tournament.status === 'FINISHED' ? 'Finalizado' :
                       tournament.status}
                    </div>
                  </div>
                </div>

                {/* Tipo */}
                <div className="flex items-center">
                  <Star className="w-5 h-5 text-purple-600 mr-3" />
                  <div>
                    <div className="text-sm text-gray-600">Tipo</div>
                    <div className="font-bold text-gray-800">
                      {tournament.type === 'FREEROLL' ? 'Freeroll' :
                       tournament.type === 'GUARANTEED' ? 'Garantizado' :
                       tournament.type === 'SATELLITE' ? 'Satélite' :
                       'Regular'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Espacios ocupados</span>
                  <span>{Math.round((tournament.currentPlayers / tournament.maxPlayers) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all ${
                      tournament.currentPlayers >= tournament.maxPlayers * 0.9 ? 'bg-red-500' :
                      tournament.currentPlayers >= tournament.maxPlayers * 0.7 ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}
                    style={{ width: `${(tournament.currentPlayers / tournament.maxPlayers) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Cronograma</h3>
              
              <div className="space-y-4">
                {/* Registro */}
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-4 ${
                    tournament.status === 'REGISTRATION' ? 'bg-green-500' : 'bg-gray-300'
                  }`}></div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">Período de Registro</div>
                    <div className="text-sm text-gray-600">
                      Hasta {new Date(tournament.registrationDeadline).toLocaleString('es-PE')}
                    </div>
                    {tournament.status === 'REGISTRATION' && !timeLeft.expired && (
                      <div className="text-sm text-orange-600 font-medium">
                        Termina en {timeLeft.formatted}
                      </div>
                    )}
                  </div>
                </div>

                {/* Inicio */}
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-4 ${
                    tournament.status === 'ACTIVE' ? 'bg-green-500' : 
                    tournament.status === 'FINISHED' ? 'bg-blue-500' : 'bg-gray-300'
                  }`}></div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">Inicio del Torneo</div>
                    <div className="text-sm text-gray-600">
                      {new Date(tournament.startTime).toLocaleString('es-PE')}
                    </div>
                  </div>
                </div>

                {/* Fin */}
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-4 ${
                    tournament.status === 'FINISHED' ? 'bg-green-500' : 'bg-gray-300'
                  }`}></div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">Fin del Torneo</div>
                    <div className="text-sm text-gray-600">
                      {new Date(tournament.endTime).toLocaleString('es-PE')}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Badges y características */}
            {(tournament.featured || tournament.requiresPremium || tournament.guaranteed) && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Características</h3>
                
                <div className="flex flex-wrap gap-3">
                  {tournament.featured && (
                    <div className="flex items-center bg-orange-100 text-orange-800 px-3 py-2 rounded-full text-sm font-medium">
                      <Zap className="w-4 h-4 mr-2" />
                      Destacado
                    </div>
                  )}
                  
                  {tournament.requiresPremium && (
                    <div className="flex items-center bg-purple-100 text-purple-800 px-3 py-2 rounded-full text-sm font-medium">
                      <Lock className="w-4 h-4 mr-2" />
                      Solo Premium
                    </div>
                  )}
                  
                  {tournament.guaranteed && (
                    <div className="flex items-center bg-green-100 text-green-800 px-3 py-2 rounded-full text-sm font-medium">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Premio Garantizado
                    </div>
                  )}
                  
                  {tournament.type === 'FREEROLL' && (
                    <div className="flex items-center bg-blue-100 text-blue-800 px-3 py-2 rounded-full text-sm font-medium">
                      <Star className="w-4 h-4 mr-2" />
                      Entrada Gratuita
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="space-y-6">
            {participants.length > 0 ? (
              <>
                <LeaderBoard
                  players={participants}
                  currentUserId={user?.id}
                  showPrizes={true}
                  prizeDistribution={tournament.prizeDistribution}
                  maxVisible={10}
                  highlightUser={true}
                  showStats={true}
                />
                
                {participants.length > 10 && (
                  <div className="text-center">
                    <button
                      onClick={handleViewRanking}
                      className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700"
                    >
                      Ver Ranking Completo
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
                <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  {tournament.status === 'REGISTRATION' || tournament.status === 'UPCOMING'
                    ? 'Ranking no disponible'
                    : 'Cargando ranking...'}
                </h3>
                <p className="text-gray-600">
                  {tournament.status === 'REGISTRATION' || tournament.status === 'UPCOMING'
                    ? 'El ranking se mostrará cuando el torneo comience'
                    : 'Los datos del ranking se están actualizando'}
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'rules' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Reglas del Torneo</h3>
            
            <div className="space-y-4 text-sm text-gray-700">
              <div>
                <h4 className="font-bold text-gray-800 mb-2">Inscripción</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>El registro está abierto hasta {new Date(tournament.registrationDeadline).toLocaleString('es-PE')}</li>
                  <li>Máximo {tournament.maxPlayers} participantes</li>
                  {tournament.buyIn > 0 && <li>Costo de entrada: S/ {tournament.buyIn}</li>}
                  {tournament.requiresPremium && <li>Requiere membresía Premium activa</li>}
                </ul>
              </div>
              
              <div>
                <h4 className="font-bold text-gray-800 mb-2">Puntuación</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>Puntos base calculados según probabilidad implícita de las cuotas</li>
                  <li>Multiplicador de confianza aplicado según tu nivel de confianza</li>
                  <li>Bonificaciones por rachas de aciertos consecutivos</li>
                  <li>Puntos extra por predicciones "perfect picks" (muy difíciles)</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-bold text-gray-800 mb-2">Premios</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>Premio total: S/ {tournament.prizePool}</li>
                  {tournament.prizeDistribution && (
                    <li>Se premian las primeras {tournament.prizeDistribution.length} posiciones</li>
                  )}
                  <li>Los premios se pagan automáticamente al finalizar el torneo</li>
                  {tournament.guaranteed && <li>Premio garantizado independientemente del número de participantes</li>}
                </ul>
              </div>
              
              <div>
                <h4 className="font-bold text-gray-800 mb-2">Cancelación</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>Puedes cancelar tu participación antes del inicio del torneo</li>
                  {tournament.buyIn > 0 && <li>Reembolso del 90% del buy-in (penalización del 10%)</li>}
                  <li>No se permite cancelar una vez iniciado el torneo</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Botones de acción flotantes */}
      <div className="fixed bottom-24 left-4 right-4 z-10">
        {!isRegistered && tournament.status === 'REGISTRATION' && (
          <button
            onClick={handleJoin}
            disabled={joining || !canJoin}
            className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center transition-all ${
              canJoin
                ? 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:opacity-90'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {joining ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            ) : (
              <>
                <Trophy className="w-6 h-6 mr-2" />
                {tournament.buyIn === 0 ? 'Unirse Gratis' : `Unirse - S/ ${tournament.buyIn}`}
              </>
            )}
          </button>
        )}

        {isRegistered && canLeave && (
          <button
            onClick={handleLeave}
            disabled={leaving}
            className="w-full bg-red-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-red-700 transition-all flex items-center justify-center"
          >
            {leaving ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            ) : (
              'Salir del Torneo'
            )}
          </button>
        )}

        {canPlay && (
          <button
            onClick={handlePlay}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:opacity-90 transition-all flex items-center justify-center"
          >
            <Play className="w-6 h-6 mr-2" />
            Jugar Ahora
          </button>
        )}
      </div>
    </div>
  );
};

export default TournamentDetail;