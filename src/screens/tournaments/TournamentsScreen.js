import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Filter, RefreshCw, Zap, Users, DollarSign, Clock, Star, Plus, TrendingUp, AlertCircle, WifiOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import tournamentsService from '../../services/api/tournaments';
import TournamentCard from '../../components/tournaments/TournamentCard';
import { SimplePrizeDisplay } from '../../components/tournaments/PrizePoolDisplay';

const TournamentsScreen = () => {
  const navigate = useNavigate();
  const { user, isPremium } = useAuth();
  
  const [tournaments, setTournaments] = useState([]);
  const [filteredTournaments, setFilteredTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [userBalance, setUserBalance] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Estados de filtros
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('time');

  // Filtros disponibles
  const filters = [
    { id: 'ALL', label: 'Todos', icon: Trophy },
    { id: 'REGISTRATION', label: 'Registro', icon: Plus },
    { id: 'ACTIVE', label: 'En Vivo', icon: Zap },
    { id: 'FREEROLL', label: 'Gratis', icon: Star },
    { id: 'PREMIUM', label: 'Premium', icon: DollarSign }
  ];

  // Opciones de ordenamiento
  const sortOptions = [
    { value: 'time', label: 'Por tiempo' },
    { value: 'prize', label: 'Por premio' },
    { value: 'participants', label: 'Por jugadores' },
    { value: 'buyIn', label: 'Por buy-in' }
  ];

  // Detector de conexión
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Cargar torneos
  const loadTournaments = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      console.log('🎯 Cargando torneos desde TournamentsScreen...');
      const result = await tournamentsService.getTournaments({
        limit: 50
      });

      if (result.success) {
        console.log('✅ Torneos cargados:', result.tournaments);
        setTournaments(result.tournaments || []);
        setUserBalance(Number(result.userBalance) || 0);
        
        if (result.cached) {
          setError('Mostrando torneos guardados. Conecta a internet para actualizar.');
        }
      } else {
        console.error('❌ Error cargando torneos:', result.message);
        setError(result.message || 'Error al cargar torneos');
      }
    } catch (err) {
      console.error('❌ Error de conexión:', err);
      setError('Error de conexión. Verifica tu internet.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Cargar al montar
  useEffect(() => {
    loadTournaments();
  }, [loadTournaments]);

  // Aplicar filtros y ordenamiento
  useEffect(() => {
    let filtered = [...tournaments];

    // Aplicar filtro
    switch (activeFilter) {
      case 'REGISTRATION':
        filtered = filtered.filter(t => t.status === 'REGISTRATION');
        break;
      case 'ACTIVE':
        filtered = filtered.filter(t => t.status === 'ACTIVE');
        break;
      case 'FREEROLL':
        filtered = filtered.filter(t => (Number(t.buyIn) || 0) === 0);
        break;
      case 'PREMIUM':
        filtered = filtered.filter(t => (Number(t.buyIn) || 0) > 0);
        break;
      default:
        // Mostrar todos
        break;
    }

    // Aplicar ordenamiento
    filtered = tournamentsService.filterTournaments(filtered, { sortBy });

    setFilteredTournaments(filtered);
  }, [tournaments, activeFilter, sortBy]);

  // Manejar refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTournaments();
  };

  // Manejar click en torneo
  const handleTournamentClick = (tournament) => {
    navigate(`/app/tournaments/${tournament.id}`);
  };

  // Calcular estadísticas rápidas - CON VALIDACIÓN SEGURA
  const calculateStats = (tournamentsList) => {
    const validTournaments = tournamentsList.filter(t => t && typeof t === 'object');
    
    const stats = {
      total: validTournaments.length,
      active: validTournaments.filter(t => t.status === 'ACTIVE').length,
      registration: validTournaments.filter(t => t.status === 'REGISTRATION').length,
      finished: validTournaments.filter(t => t.status === 'FINISHED').length,
      freerolls: validTournaments.filter(t => (Number(t.buyIn) || 0) === 0).length,
      paidTournaments: validTournaments.filter(t => (Number(t.buyIn) || 0) > 0).length,
      totalParticipants: validTournaments.reduce((sum, t) => sum + (Number(t.currentPlayers) || 0), 0),
      totalPrizePool: validTournaments.reduce((sum, t) => sum + (Number(t.prizePool) || 0), 0),
      avgBuyIn: 0
    };

    // Calcular promedio de buy-in de forma segura
    if (stats.total > 0) {
      const totalBuyIn = validTournaments.reduce((sum, t) => sum + (Number(t.buyIn) || 0), 0);
      stats.avgBuyIn = totalBuyIn / stats.total;
    }

    return stats;
  };

  const stats = calculateStats(tournaments);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 pt-12 pb-8 rounded-b-3xl shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Torneos</h1>
            <p className="text-blue-100 text-sm">Compite y gana premios</p>
          </div>
          
          <div className="flex items-center gap-3">
            {!isOnline && (
              <div className="bg-red-500 rounded-full p-2">
                <WifiOff className="w-5 h-5 text-white" />
              </div>
            )}
            
            <button
              onClick={handleRefresh}
              disabled={refreshing || !isOnline}
              className={`p-2 rounded-lg bg-white/20 backdrop-blur-sm text-white ${refreshing ? 'animate-spin' : ''}`}
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Balance del usuario */}
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-blue-100 text-sm">Tu balance</div>
              <div className="text-2xl font-bold text-white">S/ {userBalance.toFixed(2)}</div>
            </div>
            <button 
              onClick={() => navigate('/app/wallet')}
              className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg text-white font-medium hover:bg-white/30 transition-colors"
            >
              Recargar
            </button>
          </div>
        </div>

        {/* Stats rápidas - CON VALIDACIÓN */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-white">{stats.active}</div>
            <div className="text-xs text-blue-100">En Vivo</div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-white">{stats.registration}</div>
            <div className="text-xs text-blue-100">Registro</div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-white">
              S/ {Number(stats.totalPrizePool).toFixed(0)}
            </div>
            <div className="text-xs text-blue-100">Premios</div>
          </div>
        </div>
      </div>

      {/* Error/Offline message */}
      {error && (
        <div className="mx-4 mt-4 bg-yellow-50 border border-yellow-200 rounded-xl p-3 flex items-center">
          <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0" />
          <span className="text-sm text-yellow-800">{error}</span>
        </div>
      )}

      {/* Filtros */}
      <div className="px-4 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">
            {activeFilter === 'ALL' ? 'Todos los Torneos' : 
             filters.find(f => f.id === activeFilter)?.label || 'Torneos'}
          </h2>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Filter className="w-4 h-4" />
            Filtros
          </button>
        </div>

        {/* Panel de filtros */}
        {showFilters && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
            {/* Filtros principales */}
            <div className="mb-4">
              <div className="text-sm font-medium text-gray-700 mb-2">Categoría</div>
              <div className="flex gap-2 flex-wrap">
                {filters.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setActiveFilter(filter.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeFilter === filter.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <filter.icon className="w-4 h-4" />
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Ordenamiento */}
            <div>
              <div className="text-sm font-medium text-gray-700 mb-2">Ordenar por</div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Torneos destacados */}
        {activeFilter === 'ALL' && tournaments.some(t => t.featured || t.isFeatured) && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-5 h-5 text-orange-500" />
              <h3 className="font-bold text-gray-800">Torneos Destacados</h3>
            </div>
            
            <div className="space-y-4">
              {tournaments
                .filter(t => t.featured || t.isFeatured)
                .slice(0, 2)
                .map((tournament) => (
                  <TournamentCard
                    key={tournament.id}
                    tournament={tournament}
                    userBalance={userBalance}
                    isPremium={isPremium}
                    onClick={() => handleTournamentClick(tournament)}
                  />
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Lista de torneos */}
      <div className="px-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredTournaments.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">
              {activeFilter === 'ALL' 
                ? 'No hay torneos disponibles' 
                : `No hay torneos en ${filters.find(f => f.id === activeFilter)?.label.toLowerCase()}`}
            </p>
            <button 
              onClick={handleRefresh}
              className="text-blue-600 font-medium hover:underline"
            >
              Intentar de nuevo
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTournaments.map((tournament) => (
              <TournamentCard
                key={tournament.id}
                tournament={tournament}
                userBalance={userBalance}
                isPremium={isPremium}
                onClick={() => handleTournamentClick(tournament)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Promoción para usuarios no premium */}
      {!isPremium && tournaments.some(t => t.requiresPremium) && (
        <div className="mx-4 mt-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white">
          <div className="flex items-center mb-3">
            <Star className="w-6 h-6 mr-2" />
            <h3 className="text-lg font-bold">Desbloquea Torneos Premium</h3>
          </div>
          
          <p className="text-purple-100 mb-4 text-sm">
            Accede a torneos exclusivos con premios más grandes y menos competencia
          </p>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold">
                {tournaments.filter(t => t.requiresPremium).length}
              </div>
              <div className="text-xs text-purple-200">Torneos Exclusivos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                S/ {tournaments
                  .filter(t => t.requiresPremium)
                  .reduce((sum, t) => sum + (Number(t.prizePool) || 0), 0)
                  .toFixed(0)}
              </div>
              <div className="text-xs text-purple-200">Premios Adicionales</div>
            </div>
          </div>
          
          <button 
            onClick={() => navigate('/app/premium')}
            className="w-full bg-white text-purple-600 font-bold py-3 rounded-xl hover:bg-gray-100 transition-colors"
          >
            Hazte Premium
          </button>
        </div>
      )}

      {/* Resumen final */}
      {tournaments.length > 0 && (
        <div className="mx-4 mt-8 bg-gray-800 rounded-2xl p-6 text-white">
          <h3 className="text-lg font-bold mb-4">Resumen de Torneos</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {stats.freerolls}
              </div>
              <div className="text-sm text-gray-400">Torneos Gratis</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {stats.totalParticipants}
              </div>
              <div className="text-sm text-gray-400">Jugadores Activos</div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-700 text-center">
            <div className="text-sm text-gray-400 mb-1">Premio promedio</div>
            <div className="text-xl font-bold text-yellow-400">
              S/ {stats.total > 0 ? (stats.totalPrizePool / stats.total).toFixed(0) : '0'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TournamentsScreen;