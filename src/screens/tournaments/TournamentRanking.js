import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Trophy, RefreshCw, TrendingUp, Target, Crown, Medal, Award,
  Filter, Users, Star, Clock, AlertCircle, Search, Download
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import tournamentsService from '../../services/api/tournaments';
import LeaderBoard from '../../components/tournaments/LeaderBoard';
import TournamentTimer from '../../components/tournaments/TournamentTimer';

const TournamentRanking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [tournament, setTournament] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [filteredParticipants, setFilteredParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('ALL');
  const [userPosition, setUserPosition] = useState(null);

  // Opciones de filtro
  const filterOptions = [
    { value: 'ALL', label: 'Todos', icon: Users },
    { value: 'TOP_10', label: 'Top 10', icon: Trophy },
    { value: 'TOP_50', label: 'Top 50', icon: Medal },
    { value: 'WINNERS', label: 'Ganadores', icon: Crown },
    { value: 'AROUND_ME', label: 'Cerca de mí', icon: Target }
  ];

  // Cargar ranking
  const loadRanking = useCallback(async () => {
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

      // Cargar todos los participantes
      const participantsResult = await tournamentsService.getTournamentParticipants(id, 200);
      
      if (participantsResult.success) {
        const allParticipants = participantsResult.participants || [];
        setParticipants(allParticipants);
        
        // Encontrar posición del usuario
        const userPos = allParticipants.findIndex(p => p.userId === user?.id);
        if (userPos !== -1) {
          setUserPosition({
            position: userPos + 1,
            player: allParticipants[userPos]
          });
        }
      } else {
        setError('Error al cargar participantes');
      }

    } catch (err) {
      setError('Error de conexión. Verifica tu internet.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id, user?.id]);

  useEffect(() => {
    loadRanking();
  }, [loadRanking]);

  // Auto-refresh para torneos activos
  useEffect(() => {
    if (!tournament || tournament.status !== 'ACTIVE') return;

    const interval = setInterval(() => {
      setRefreshing(true);
      loadRanking();
    }, 30000); // Cada 30 segundos

    return () => clearInterval(interval);
  }, [tournament, loadRanking]);

  // Aplicar filtros y búsqueda
  useEffect(() => {
    let filtered = [...participants];

    // Aplicar búsqueda
    if (searchTerm.trim()) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Aplicar filtro
    switch (filterBy) {
      case 'TOP_10':
        filtered = filtered.slice(0, 10);
        break;
      case 'TOP_50':
        filtered = filtered.slice(0, 50);
        break;
      case 'WINNERS':
        // Mostrar solo posiciones que ganan premio
        const winnerCount = tournament?.prizeDistribution?.length || 3;
        filtered = filtered.slice(0, winnerCount);
        break;
      case 'AROUND_ME':
        if (userPosition) {
          const startIndex = Math.max(0, userPosition.position - 6);
          const endIndex = Math.min(participants.length, userPosition.position + 5);
          filtered = filtered.slice(startIndex, endIndex);
        }
        break;
      default:
        // Mostrar todos
        break;
    }

    setFilteredParticipants(filtered);
  }, [participants, searchTerm, filterBy, userPosition, tournament]);

  // Manejar refresh
  const handleRefresh = () => {
    setRefreshing(true);
    loadRanking();
  };

  // Exportar ranking (funcionalidad futura)
  const handleExport = () => {
    // Por ahora solo mostrar alerta
    alert('Función de exportación próximamente disponible');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando ranking...</p>
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
              onClick={loadRanking}
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
            <h1 className="text-xl font-bold text-white mb-1">Ranking</h1>
            <p className="text-blue-100 text-sm line-clamp-1">{tournament.name}</p>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="p-2 rounded-lg bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
            >
              <Download className="w-5 h-5" />
            </button>
            
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className={`p-2 rounded-lg bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 ${refreshing ? 'animate-spin' : ''}`}
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Estado del torneo */}
        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-blue-100 text-sm">Estado del torneo</div>
              <div className="text-white font-bold capitalize">
                {tournament.status === 'ACTIVE' ? 'En Vivo' :
                 tournament.status === 'FINISHED' ? 'Finalizado' :
                 tournament.status === 'REGISTRATION' ? 'Registro' :
                 tournament.status}
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-blue-100 text-sm">Participantes</div>
              <div className="text-white font-bold">{participants.length}</div>
            </div>
          </div>
          
          {tournament.status === 'ACTIVE' && (
            <div className="mt-3 pt-3 border-t border-white/20">
              <div className="flex items-center justify-between">
                <span className="text-blue-100 text-sm">Tiempo restante:</span>
                <TournamentTimer 
                  targetDate={tournament.endTime}
                  size="small"
                  showLabels={false}
                  className="text-white"
                />
              </div>
            </div>
          )}
        </div>

        {/* Tu posición */}
        {userPosition && (
          <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                  userPosition.position <= 3 ? 'bg-yellow-500' : 'bg-white/20'
                }`}>
                  {userPosition.position <= 3 ? (
                    <Crown className="w-5 h-5 text-white" />
                  ) : (
                    <span className="text-white font-bold">#{userPosition.position}</span>
                  )}
                </div>
                
                <div>
                  <div className="text-yellow-200 text-sm">Tu posición actual</div>
                  <div className="text-white font-bold">
                    #{userPosition.position} de {participants.length}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-yellow-200 text-sm">Tus puntos</div>
                <div className="text-white font-bold text-xl">
                  {userPosition.player.points || 0}
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

      {/* Controles */}
      <div className="px-4 mt-6">
        {/* Búsqueda */}
        <div className="relative mb-4">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar jugador..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Filtros */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setFilterBy(option.value)}
              disabled={option.value === 'AROUND_ME' && !userPosition}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                filterBy === option.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              <option.icon className="w-4 h-4" />
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Estadísticas rápidas */}
      {tournament.status === 'ACTIVE' && participants.length > 0 && (
        <div className="px-4 mb-6">
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-6 text-white">
            <h3 className="text-lg font-bold mb-4">Estadísticas en Vivo</h3>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">
                  {participants[0]?.points || 0}
                </div>
                <div className="text-sm text-gray-400">Puntos líder</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {Math.round(participants.reduce((sum, p) => sum + (p.accuracy || 0), 0) / participants.length) || 0}%
                </div>
                <div className="text-sm text-gray-400">Precisión promedio</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {participants.reduce((sum, p) => sum + (p.predictions || 0), 0)}
                </div>
                <div className="text-sm text-gray-400">Predicciones totales</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ranking */}
      <div className="px-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredParticipants.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              {searchTerm ? 'No se encontraron jugadores' : 'No hay participantes'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm 
                ? `No hay resultados para "${searchTerm}"`
                : 'Esperando participantes en el torneo'}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-blue-600 font-medium hover:underline"
              >
                Limpiar búsqueda
              </button>
            )}
          </div>
        ) : (
          <LeaderBoard
            players={filteredParticipants}
            currentUserId={user?.id}
            showPrizes={true}
            prizeDistribution={tournament.prizeDistribution}
            maxVisible={filteredParticipants.length}
            highlightUser={true}
            showStats={true}
          />
        )}

        {/* Información adicional */}
        {filterBy !== 'ALL' && participants.length > filteredParticipants.length && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600 mb-2">
              Mostrando {filteredParticipants.length} de {participants.length} participantes
            </p>
            <button
              onClick={() => setFilterBy('ALL')}
              className="text-blue-600 font-medium hover:underline"
            >
              Ver todos los participantes
            </button>
          </div>
        )}
      </div>

      {/* Actualización automática */}
      {tournament.status === 'ACTIVE' && (
        <div className="px-4 mt-6">
          <div className="bg-blue-50 rounded-xl p-4 flex items-center">
            <RefreshCw className={`w-5 h-5 text-blue-600 mr-3 ${refreshing ? 'animate-spin' : ''}`} />
            <div className="flex-1">
              <div className="text-sm font-medium text-blue-800">
                Actualización automática activa
              </div>
              <div className="text-xs text-blue-600">
                El ranking se actualiza cada 30 segundos
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TournamentRanking;