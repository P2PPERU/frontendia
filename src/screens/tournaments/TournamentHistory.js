import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Trophy, Calendar, DollarSign, TrendingUp, TrendingDown,
  Filter, Crown, Medal, Award, Target, RefreshCw, AlertCircle,
  Eye, BarChart3, Star, Clock, Users, ChevronDown, ChevronUp
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import tournamentsService from '../../services/api/tournaments';

const TournamentHistory = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [history, setHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedTournament, setExpandedTournament] = useState(null);
  
  // Filtros
  const [dateFilter, setDateFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');

  // Opciones de filtro
  const dateFilters = [
    { value: 'ALL', label: 'Todos los tiempos' },
    { value: 'THIS_MONTH', label: 'Este mes' },
    { value: 'LAST_MONTH', label: 'Mes pasado' },
    { value: 'THIS_YEAR', label: 'Este año' }
  ];

  const statusFilters = [
    { value: 'ALL', label: 'Todos' },
    { value: 'FINISHED', label: 'Finalizados' },
    { value: 'ACTIVE', label: 'Activos' },
    { value: 'CANCELLED', label: 'Cancelados' }
  ];

  const typeFilters = [
    { value: 'ALL', label: 'Todos los tipos' },
    { value: 'FREEROLL', label: 'Freerolls' },
    { value: 'PAID', label: 'Pagados' },
    { value: 'PREMIUM', label: 'Premium' }
  ];

  // Cargar historial
  const loadHistory = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const result = await tournamentsService.getUserHistory({
        limit: 50
      });

      if (result.success) {
        setHistory(result.history || []);
        setStats(result.stats || {});
      } else {
        setError(result.message || 'Error al cargar historial');
      }
    } catch (err) {
      setError('Error de conexión. Verifica tu internet.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // Aplicar filtros
  useEffect(() => {
    let filtered = [...history];

    // Filtro por fecha
    if (dateFilter !== 'ALL') {
      const now = new Date();
      let startDate;

      switch (dateFilter) {
        case 'THIS_MONTH':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'LAST_MONTH':
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          const endDate = new Date(now.getFullYear(), now.getMonth(), 0);
          filtered = filtered.filter(t => {
            const tournamentDate = new Date(t.createdAt);
            return tournamentDate >= startDate && tournamentDate <= endDate;
          });
          break;
        case 'THIS_YEAR':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          startDate = null;
      }

      if (startDate && dateFilter !== 'LAST_MONTH') {
        filtered = filtered.filter(t => new Date(t.createdAt) >= startDate);
      }
    }

    // Filtro por estado
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(t => t.status === statusFilter);
    }

    // Filtro por tipo
    if (typeFilter !== 'ALL') {
      switch (typeFilter) {
        case 'FREEROLL':
          filtered = filtered.filter(t => t.buyIn === 0);
          break;
        case 'PAID':
          filtered = filtered.filter(t => t.buyIn > 0);
          break;
        case 'PREMIUM':
          filtered = filtered.filter(t => t.requiresPremium);
          break;
      }
    }

    // Ordenar por fecha (más recientes primero)
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    setFilteredHistory(filtered);
  }, [history, dateFilter, statusFilter, typeFilter]);

  // Obtener icono según posición
  const getPositionIcon = (position) => {
    if (position === 1) return <Crown className="w-5 h-5 text-yellow-500" />;
    if (position === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (position === 3) return <Award className="w-5 h-5 text-amber-600" />;
    return null;
  };

  // Obtener color según resultado
  const getResultColor = (entry) => {
    if (!entry.finalPosition) return 'text-gray-600';
    
    const winnerPositions = entry.tournament?.prizeDistribution?.length || 3;
    if (entry.finalPosition <= winnerPositions) {
      return 'text-green-600';
    }
    
    const topPercentage = Math.ceil(entry.tournament?.currentPlayers * 0.2);
    if (entry.finalPosition <= topPercentage) {
      return 'text-blue-600';
    }
    
    return 'text-gray-600';
  };

  // Formatear ganancias
  const formatEarnings = (earnings) => {
    if (earnings > 0) return `+S/ ${earnings.toFixed(2)}`;
    if (earnings < 0) return `-S/ ${Math.abs(earnings).toFixed(2)}`;
    return 'S/ 0.00';
  };

  // Ver detalles del torneo
  const handleViewTournament = (tournamentId) => {
    navigate(`/app/tournaments/${tournamentId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando historial...</p>
        </div>
      </div>
    );
  }

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
            <h1 className="text-xl font-bold text-white mb-1">Mi Historial</h1>
            <p className="text-blue-100 text-sm">Torneos participados</p>
          </div>
          
          <button
            onClick={loadHistory}
            className="p-2 rounded-lg bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        {/* Estadísticas generales */}
        {Object.keys(stats).length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-white">{stats.totalTournaments || 0}</div>
              <div className="text-xs text-blue-100">Torneos jugados</div>
            </div>
            
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-white">{stats.wonTournaments || 0}</div>
              <div className="text-xs text-blue-100">Ganados</div>
            </div>
            
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className={`text-2xl font-bold ${(stats.netProfit || 0) >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                {formatEarnings(stats.netProfit || 0)}
              </div>
              <div className="text-xs text-blue-100">Ganancia neta</div>
            </div>
            
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-white">{Math.round(stats.roi || 0)}%</div>
              <div className="text-xs text-blue-100">ROI</div>
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

      {/* Filtros */}
      <div className="px-4 mt-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Filtro por fecha */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Período
              </label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                {dateFilters.map((filter) => (
                  <option key={filter.value} value={filter.value}>
                    {filter.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro por estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                {statusFilters.map((filter) => (
                  <option key={filter.value} value={filter.value}>
                    {filter.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro por tipo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                {typeFilters.map((filter) => (
                  <option key={filter.value} value={filter.value}>
                    {filter.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de torneos */}
      <div className="px-4 mt-6">
        {filteredHistory.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-800 mb-2">No hay torneos</h3>
            <p className="text-gray-600 mb-4">
              No tienes torneos que coincidan con los filtros seleccionados
            </p>
            <button
              onClick={() => {
                setDateFilter('ALL');
                setStatusFilter('ALL');
                setTypeFilter('ALL');
              }}
              className="text-blue-600 font-medium hover:underline"
            >
              Limpiar filtros
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredHistory.map((entry) => (
              <div
                key={entry.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
              >
                <div className="p-4">
                  {/* Header del torneo */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800 text-lg line-clamp-1">
                        {entry.tournament?.name || 'Torneo'}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(entry.createdAt).toLocaleDateString('es-PE')}
                        </div>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {entry.tournament?.currentPlayers || 0} jugadores
                        </div>
                        {entry.buyIn > 0 && (
                          <div className="flex items-center">
                            <DollarSign className="w-4 h-4 mr-1" />
                            S/ {entry.buyIn}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Estado */}
                    <div className="text-right">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        entry.status === 'FINISHED' ? 'bg-gray-100 text-gray-800' :
                        entry.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                        entry.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {entry.status === 'FINISHED' ? 'Finalizado' :
                         entry.status === 'ACTIVE' ? 'En Vivo' :
                         entry.status === 'CANCELLED' ? 'Cancelado' :
                         entry.status}
                      </span>
                    </div>
                  </div>

                  {/* Resultado principal */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    {/* Posición */}
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        {getPositionIcon(entry.finalPosition)}
                        {!getPositionIcon(entry.finalPosition) && (
                          <Target className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                      <div className={`text-lg font-bold ${getResultColor(entry)}`}>
                        {entry.finalPosition ? `#${entry.finalPosition}` : 'En juego'}
                      </div>
                      <div className="text-xs text-gray-600">Posición</div>
                    </div>

                    {/* Puntos */}
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-800">
                        {entry.finalPoints || entry.currentPoints || 0}
                      </div>
                      <div className="text-xs text-gray-600">Puntos</div>
                    </div>

                    {/* Ganancias */}
                    <div className="text-center">
                      <div className={`text-lg font-bold ${
                        (entry.earnings || 0) > 0 ? 'text-green-600' :
                        (entry.earnings || 0) < 0 ? 'text-red-600' :
                        'text-gray-600'
                      }`}>
                        {formatEarnings(entry.earnings || 0)}
                      </div>
                      <div className="text-xs text-gray-600">Ganancias</div>
                    </div>
                  </div>

                  {/* Estadísticas expandibles */}
                  {entry.predictions > 0 && (
                    <div className="border-t border-gray-100 pt-3">
                      <button
                        onClick={() => setExpandedTournament(
                          expandedTournament === entry.id ? null : entry.id
                        )}
                        className="w-full flex items-center justify-between text-sm text-gray-600 hover:text-gray-800"
                      >
                        <span>Ver estadísticas detalladas</span>
                        {expandedTournament === entry.id ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>

                      {expandedTournament === entry.id && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-xl">
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div className="text-center">
                              <div className="font-bold text-gray-800">
                                {entry.correctPredictions || 0}/{entry.predictions || 0}
                              </div>
                              <div className="text-xs text-gray-600">Aciertos</div>
                            </div>
                            
                            <div className="text-center">
                              <div className="font-bold text-gray-800">
                                {entry.accuracy ? `${entry.accuracy}%` : '0%'}
                              </div>
                              <div className="text-xs text-gray-600">Precisión</div>
                            </div>
                            
                            <div className="text-center">
                              <div className="font-bold text-gray-800">
                                {entry.bestStreak || 0}
                              </div>
                              <div className="text-xs text-gray-600">Mejor racha</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Acciones */}
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => handleViewTournament(entry.tournamentId)}
                      className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Ver Torneo
                    </button>
                    
                    {entry.status === 'ACTIVE' && (
                      <button
                        onClick={() => navigate(`/app/tournaments/${entry.tournamentId}/play`)}
                        className="flex-1 bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center"
                      >
                        <Target className="w-4 h-4 mr-2" />
                        Jugar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Estadísticas del período filtrado */}
      {filteredHistory.length > 0 && (
        <div className="px-4 mt-8">
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-6 text-white">
            <h3 className="text-lg font-bold mb-4">Estadísticas del Período</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {filteredHistory.filter(e => e.finalPosition === 1).length}
                </div>
                <div className="text-sm text-gray-400">Torneos ganados</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">
                  {filteredHistory.filter(e => e.finalPosition <= 3).length}
                </div>
                <div className="text-sm text-gray-400">Top 3</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {Math.round(
                    filteredHistory.reduce((sum, e) => sum + (e.accuracy || 0), 0) / 
                    filteredHistory.length
                  ) || 0}%
                </div>
                <div className="text-sm text-gray-400">Precisión promedio</div>
              </div>
              
              <div className="text-center">
                <div className={`text-2xl font-bold ${
                  filteredHistory.reduce((sum, e) => sum + (e.earnings || 0), 0) >= 0 
                    ? 'text-green-400' 
                    : 'text-red-400'
                }`}>
                  {formatEarnings(
                    filteredHistory.reduce((sum, e) => sum + (e.earnings || 0), 0)
                  )}
                </div>
                <div className="text-sm text-gray-400">Total del período</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TournamentHistory;