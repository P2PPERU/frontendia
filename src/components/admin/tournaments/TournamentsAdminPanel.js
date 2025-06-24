import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, RefreshCw, Download, BarChart3, AlertCircle, Trophy,
  Users, DollarSign, TrendingUp, Eye, Calendar, Zap
} from 'lucide-react';
import tournamentsAdminService from '../../../services/api/tournamentsAdmin';
import TournamentFilters from './components/TournamentFilters';
import TournamentsTable from './components/TournamentsTable';
import TournamentForm from './components/TournamentForm';

const TournamentsAdminPanel = () => {
  // Estados principales
  const [tournaments, setTournaments] = useState([]);
  const [filteredTournaments, setFilteredTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  
  // Estados de filtros y ordenamiento
  const [filters, setFilters] = useState({
    search: '',
    status: 'ALL',
    type: 'ALL',
    startDate: '',
    endDate: '',
    minBuyIn: undefined,
    maxBuyIn: undefined,
    featured: undefined,
    requiresPremium: undefined,
    guaranteed: undefined
  });
  
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // Estados de selección masiva
  const [selectedTournaments, setSelectedTournaments] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  
  // Estados de estadísticas
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    registration: 0,
    finished: 0,
    cancelled: 0,
    totalPrizePool: 0,
    totalBuyIns: 0,
    totalParticipants: 0,
    avgOccupancy: 0,
    freerolls: 0,
    paidTournaments: 0,
    featuredTournaments: 0,
    premiumTournaments: 0,
    roi: 0
  });
  
  // Estados de modales (para futuras implementaciones)
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [editingTournament, setEditingTournament] = useState(null);

  // Cargar torneos
  const loadTournaments = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      console.log('🎯 Cargando torneos admin...');
      
      const result = await tournamentsAdminService.getTournaments({
        sortBy,
        sortOrder,
        limit: 100 // Cargar más torneos para admin
      });

      if (result.success) {
        console.log('✅ Torneos cargados:', result.data);
        
        const normalizedTournaments = (result.data || []).map(t => 
          tournamentsAdminService.normalizeTournamentData(t)
        ).filter(Boolean);
        
        setTournaments(normalizedTournaments);
        
        // Calcular estadísticas
        const calculatedStats = tournamentsAdminService.calculateStats(normalizedTournaments);
        setStats(calculatedStats);
        
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
  }, [sortBy, sortOrder]);

  // Cargar datos al montar
  useEffect(() => {
    loadTournaments();
  }, [loadTournaments]);

  // Aplicar filtros localmente
  useEffect(() => {
    let filtered = tournamentsAdminService.filterTournaments(tournaments, filters);
    filtered = tournamentsAdminService.sortTournaments(filtered, sortBy, sortOrder);
    setFilteredTournaments(filtered);
  }, [tournaments, filters, sortBy, sortOrder]);

  // Auto-refresh cada 30 segundos para torneos activos
  useEffect(() => {
    const interval = setInterval(() => {
      if (stats.active > 0) {
        setRefreshing(true);
        loadTournaments();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [stats.active, loadTournaments]);

  // Manejar refresh manual
  const handleRefresh = () => {
    setRefreshing(true);
    loadTournaments();
  };

  // Manejar cambio de filtros
  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    setSelectedTournaments([]); // Limpiar selección
  };

  // Limpiar filtros
  const handleClearFilters = () => {
    setFilters({
      search: '',
      status: 'ALL',
      type: 'ALL',
      startDate: '',
      endDate: '',
      minBuyIn: undefined,
      maxBuyIn: undefined,
      featured: undefined,
      requiresPremium: undefined,
      guaranteed: undefined
    });
    setSelectedTournaments([]);
  };

  // Manejar ordenamiento
  const handleSort = (columnKey, newSortOrder) => {
    setSortBy(columnKey);
    setSortOrder(newSortOrder);
  };

  // Seleccionar/deseleccionar torneo
  const handleSelectTournament = (tournamentId) => {
    setSelectedTournaments(prev => {
      const isSelected = prev.includes(tournamentId);
      if (isSelected) {
        return prev.filter(id => id !== tournamentId);
      } else {
        return [...prev, tournamentId];
      }
    });
  };

  // Seleccionar todos los torneos visibles
  const handleSelectAll = () => {
    if (selectedTournaments.length === filteredTournaments.length) {
      setSelectedTournaments([]);
    } else {
      setSelectedTournaments(filteredTournaments.map(t => t.id));
    }
  };

  // Acciones de torneo
  const handleViewTournament = (tournament) => {
    console.log('👁️ Ver torneo:', tournament.id);
    // TODO: Implementar navegación a vista detallada
  };

  // Funciones para manejar el formulario
  const handleCreateTournament = () => {
    setEditingTournament(null);
    setShowCreateModal(true);
  };

  const handleEditTournament = (tournament) => {
    setEditingTournament(tournament);
    setShowEditModal(true);
  };

  const handleFormSave = async (tournamentData) => {
    // Recargar la lista de torneos
    await loadTournaments();
    // Mostrar notificación de éxito
    alert(editingTournament ? 'Torneo actualizado exitosamente' : 'Torneo creado exitosamente');
  };

  const handleCloseForm = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setEditingTournament(null);
  };

  const handleDeleteTournament = async (tournament) => {
    if (!window.confirm(`¿Estás seguro de eliminar el torneo "${tournament.name}"?`)) {
      return;
    }

    try {
      const result = await tournamentsAdminService.deleteTournament(tournament.id);
      
      if (result.success) {
        await loadTournaments();
        setSelectedTournaments(prev => prev.filter(id => id !== tournament.id));
      } else {
        alert(result.message || 'Error al eliminar torneo');
      }
    } catch (error) {
      alert('Error de conexión al eliminar torneo');
    }
  };

  const handleStatusChange = async (tournamentId, newStatus) => {
    try {
      const result = await tournamentsAdminService.updateTournamentStatus(tournamentId, newStatus);
      
      if (result.success) {
        await loadTournaments();
      } else {
        alert(result.message || 'Error al cambiar estado');
      }
    } catch (error) {
      alert('Error de conexión al cambiar estado');
    }
  };

  // Exportar datos
  const handleExport = async (format = 'csv') => {
    try {
      await tournamentsAdminService.exportTournaments(filters, format);
    } catch (error) {
      alert('Error al exportar datos');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-1">Gestión de Torneos</h1>
            <p className="text-gray-600">Administra y supervisa todos los torneos</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowStatsModal(true)}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              Estadísticas
            </button>
            
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className={`bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-medium hover:bg-blue-200 transition-colors flex items-center gap-2 ${refreshing ? 'animate-spin' : ''}`}
            >
              <RefreshCw className="w-4 h-4" />
              Actualizar
            </button>
          </div>
        </div>

        {/* Cards de estadísticas */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="bg-blue-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-blue-600">Total</div>
          </div>
          
          <div className="bg-green-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <div className="text-sm text-green-600">Activos</div>
          </div>
          
          <div className="bg-orange-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.registration}</div>
            <div className="text-sm text-orange-600">Registro</div>
          </div>
          
          <div className="bg-purple-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              S/ {stats.totalPrizePool.toLocaleString()}
            </div>
            <div className="text-sm text-purple-600">Premios</div>
          </div>
          
          <div className="bg-yellow-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.totalParticipants}</div>
            <div className="text-sm text-yellow-600">Jugadores</div>
          </div>
          
          <div className="bg-indigo-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-indigo-600">{stats.avgOccupancy}%</div>
            <div className="text-sm text-indigo-600">Ocupación</div>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center">
          <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0" />
          <span className="text-sm text-red-800">{error}</span>
        </div>
      )}

      {/* Filtros */}
      <TournamentFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onClearFilters={handleClearFilters}
        loading={loading}
      />

      {/* Barra de acciones */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={handleCreateTournament}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nuevo Torneo
          </button>
          
          <button
            onClick={handleSelectAll}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            {selectedTournaments.length === filteredTournaments.length ? 'Deseleccionar' : 'Seleccionar'} Todo
          </button>
          
          {selectedTournaments.length > 0 && (
            <span className="text-sm text-gray-600">
              {selectedTournaments.length} seleccionado{selectedTournaments.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleExport('csv')}
            className="bg-green-100 text-green-700 px-4 py-2 rounded-lg font-medium hover:bg-green-200 transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Exportar CSV
          </button>
          
          <button
            onClick={() => handleExport('json')}
            className="bg-green-100 text-green-700 px-4 py-2 rounded-lg font-medium hover:bg-green-200 transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Exportar JSON
          </button>
        </div>
      </div>

      {/* Información de resultados */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          Mostrando {filteredTournaments.length} de {tournaments.length} torneos
        </span>
        
        {filters.search && (
          <span>
            Resultados para: "{filters.search}"
          </span>
        )}
      </div>

      {/* Tabla de torneos */}
      <TournamentsTable
        tournaments={filteredTournaments}
        loading={loading}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        onEdit={handleEditTournament}
        onDelete={handleDeleteTournament}
        onView={handleViewTournament}
        onStatusChange={handleStatusChange}
        onSelectTournament={handleSelectTournament}
        selectedTournaments={selectedTournaments}
        showBulkActions={showBulkActions}
      />

      {/* Resumen inferior */}
      {filteredTournaments.length > 0 && (
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Resumen de Resultados</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.freerolls}</div>
              <div className="text-sm text-gray-600">Torneos Gratis</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.paidTournaments}</div>
              <div className="text-sm text-gray-600">Torneos Pagados</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.featuredTournaments}</div>
              <div className="text-sm text-gray-600">Destacados</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.premiumTournaments}</div>
              <div className="text-sm text-gray-600">Solo Premium</div>
            </div>
          </div>
        </div>
      )}

      {/* Modales */}
      {showCreateModal && (
        <TournamentForm
          isOpen={showCreateModal}
          onClose={handleCloseForm}
          onSave={handleFormSave}
        />
      )}

      {showEditModal && (
        <TournamentForm
          tournament={editingTournament}
          isOpen={showEditModal}
          onClose={handleCloseForm}
          onSave={handleFormSave}
        />
      )}
    </div>
  );
};

export default TournamentsAdminPanel;