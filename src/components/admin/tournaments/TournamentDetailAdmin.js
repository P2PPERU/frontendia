import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Edit2, Trash2, RefreshCw, AlertCircle, Trophy, Users, 
  DollarSign, Clock, Calendar, Target, TrendingUp, Settings, History,
  Play, Pause, Square, CheckCircle, Star, Zap, Crown, Info
} from 'lucide-react';
import tournamentsAdminService from '../../../services/api/tournamentsAdmin';
import { TournamentStatusBadge, TournamentTypeBadge } from './components/TournamentBadges';
import TournamentForm from './components/TournamentForm';

const TournamentDetailAdmin = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Estados principales
  const [tournament, setTournament] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  
  // Estados de UI
  const [activeTab, setActiveTab] = useState('overview');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showStatusChanger, setShowStatusChanger] = useState(false);
  
  // Estados de operaciones
  const [deleting, setDeleting] = useState(false);
  const [changingStatus, setChangingStatus] = useState(false);

  // Cargar datos del torneo
  const loadTournamentData = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      console.log('🎯 Cargando detalles del torneo:', id);
      
      // Cargar detalles del torneo
      const tournamentResult = await tournamentsAdminService.getTournament(id);
      
      if (tournamentResult.success) {
        const tournamentData = tournamentsAdminService.normalizeTournamentData(tournamentResult.data);
        setTournament(tournamentData);
        
        // Cargar participantes si el torneo existe
        if (tournamentData) {
          const participantsResult = await tournamentsAdminService.getTournamentParticipants(id, 100);
          if (participantsResult.success) {
            setParticipants(participantsResult.data || []);
          }
        }
      } else {
        setError(tournamentResult.message || 'Error al cargar el torneo');
      }
    } catch (err) {
      console.error('Error loading tournament:', err);
      setError('Error de conexión. Verifica tu internet.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  // Cargar al montar y configurar auto-refresh
  useEffect(() => {
    if (id) {
      loadTournamentData();
    }
  }, [id, loadTournamentData]);

  // Auto-refresh para torneos activos cada 30 segundos
  useEffect(() => {
    if (!tournament || tournament.status !== 'ACTIVE') return;

    const interval = setInterval(() => {
      setRefreshing(true);
      loadTournamentData();
    }, 30000);

    return () => clearInterval(interval);
  }, [tournament, loadTournamentData]);

  // Manejar refresh manual
  const handleRefresh = () => {
    setRefreshing(true);
    loadTournamentData();
  };

  // Manejar edición
  const handleEdit = () => {
    setShowEditModal(true);
  };

  // Manejar guardado después de editar
  const handleEditSave = async (tournamentData) => {
    await loadTournamentData(); // Recargar datos
    setShowEditModal(false);
    alert('Torneo actualizado exitosamente');
  };

  // Manejar eliminación
  const handleDelete = async () => {
    if (tournament.currentPlayers > 0) {
      alert('No puedes eliminar un torneo con participantes inscritos');
      return;
    }

    setDeleting(true);
    
    try {
      const result = await tournamentsAdminService.deleteTournament(id);
      
      if (result.success) {
        alert('Torneo eliminado exitosamente');
        navigate('/admin/tournaments');
      } else {
        alert(result.message || 'Error al eliminar el torneo');
      }
    } catch (error) {
      alert('Error de conexión al eliminar el torneo');
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // Manejar cambio de estado
  const handleStatusChange = async (newStatus) => {
    setChangingStatus(true);
    
    try {
      const result = await tournamentsAdminService.updateTournamentStatus(id, newStatus);
      
      if (result.success) {
        await loadTournamentData(); // Recargar para ver el nuevo estado
        alert(`Estado cambiado a ${newStatus} exitosamente`);
      } else {
        alert(result.message || 'Error al cambiar el estado');
      }
    } catch (error) {
      alert('Error de conexión al cambiar el estado');
    } finally {
      setChangingStatus(false);
      setShowStatusChanger(false);
    }
  };

  // Tabs disponibles
  const tabs = [
    { id: 'overview', label: 'Resumen', icon: Info },
    { id: 'participants', label: 'Participantes', icon: Users, count: participants.length },
    { id: 'predictions', label: 'Predicciones', icon: Target },
    { id: 'history', label: 'Historial', icon: History },
    { id: 'settings', label: 'Configuración', icon: Settings }
  ];

  // Estados de transición válidos
  const getValidTransitions = (currentStatus) => {
    const transitions = {
      'UPCOMING': ['REGISTRATION', 'CANCELLED'],
      'REGISTRATION': ['ACTIVE', 'CANCELLED'],
      'ACTIVE': ['FINISHED', 'CANCELLED'],
      'FINISHED': [],
      'CANCELLED': []
    };
    
    return transitions[currentStatus] || [];
  };

  // Calcular estadísticas
  const calculateStats = () => {
    if (!tournament) return {};
    
    const occupancyPercentage = tournament.maxPlayers > 0 
      ? Math.round((tournament.currentPlayers / tournament.maxPlayers) * 100)
      : 0;
    
    const revenueGenerated = tournament.currentPlayers * (tournament.buyIn || 0);
    const projectedRevenue = tournament.maxPlayers * (tournament.buyIn || 0);
    
    return {
      occupancyPercentage,
      revenueGenerated,
      projectedRevenue,
      spotsLeft: tournament.maxPlayers - tournament.currentPlayers,
      prizeDistributed: tournament.status === 'FINISHED' ? tournament.prizePool : 0
    };
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando detalles del torneo...</p>
        </div>
      </div>
    );
  }

  // Error state
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
              onClick={() => navigate('/admin')}
              className="w-full bg-gray-200 text-gray-800 py-3 rounded-xl font-bold hover:bg-gray-300"
            >
              Volver al panel
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!tournament) return null;

  const stats = calculateStats();
  const validTransitions = getValidTransitions(tournament.status);

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 pt-8 pb-6">
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumb y acciones */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/admin')}
                className="p-2 rounded-lg bg-white/20 backdrop-blur-sm text-white mr-3 hover:bg-white/30"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              
              <div>
                <div className="text-blue-100 text-sm">Panel Admin / Torneos</div>
                <h1 className="text-2xl font-bold text-white">{tournament.name}</h1>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className={`p-2 rounded-lg bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 ${refreshing ? 'animate-spin' : ''}`}
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              
              <button
                onClick={handleEdit}
                className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 flex items-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                Editar
              </button>
              
              {validTransitions.length > 0 && (
                <button
                  onClick={() => setShowStatusChanger(true)}
                  disabled={changingStatus}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Cambiar Estado
                </button>
              )}
              
              {tournament.currentPlayers === 0 && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Eliminar
                </button>
              )}
            </div>
          </div>

          {/* Info principal del torneo */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <TournamentStatusBadge status={tournament.status} />
                {tournament.isHot && <span className="text-orange-300">🔥</span>}
                {tournament.isFeatured && <span className="text-yellow-300">⭐</span>}
              </div>
              <div className="text-white text-sm">Estado del Torneo</div>
            </div>
            
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <div className="text-2xl font-bold text-white">{tournament.currentPlayers}/{tournament.maxPlayers}</div>
              <div className="text-blue-100 text-sm">Participantes</div>
              <div className="text-xs text-blue-200">{stats.occupancyPercentage}% ocupación</div>
            </div>
            
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <div className="text-2xl font-bold text-white">S/ {tournament.prizePool}</div>
              <div className="text-blue-100 text-sm">Premio Total</div>
              <div className="text-xs text-blue-200">
                {tournament.buyIn === 0 ? 'Gratis' : `Buy-in: S/ ${tournament.buyIn}`}
              </div>
            </div>
            
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <div className="text-2xl font-bold text-white">S/ {stats.revenueGenerated}</div>
              <div className="text-blue-100 text-sm">Ingresos Generados</div>
              <div className="text-xs text-blue-200">Proyectado: S/ {stats.projectedRevenue}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="max-w-6xl mx-auto px-6 mt-4">
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0" />
            <span className="text-sm text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="max-w-6xl mx-auto px-6 mt-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex border-b border-gray-200 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {tab.count !== undefined && (
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Información general */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Información General</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tipo:</span>
                        <TournamentTypeBadge type={tournament.type} buyIn={tournament.buyIn} />
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Predicciones requeridas:</span>
                        <span className="font-medium">{tournament.predictionsCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Moneda:</span>
                        <span className="font-medium">{tournament.currency}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Creado:</span>
                        <span className="font-medium">
                          {tournament.createdAt ? new Date(tournament.createdAt).toLocaleDateString('es-PE') : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Cronograma</h3>
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-4 ${
                          tournament.status === 'REGISTRATION' ? 'bg-green-500' : 
                          new Date() > new Date(tournament.registrationDeadline) ? 'bg-gray-500' : 'bg-blue-500'
                        }`}></div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-800">Registro</div>
                          <div className="text-sm text-gray-600">
                            Hasta: {new Date(tournament.registrationDeadline).toLocaleString('es-PE')}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-4 ${
                          tournament.status === 'ACTIVE' ? 'bg-green-500' : 
                          tournament.status === 'FINISHED' ? 'bg-blue-500' : 'bg-gray-300'
                        }`}></div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-800">Inicio</div>
                          <div className="text-sm text-gray-600">
                            {new Date(tournament.startTime).toLocaleString('es-PE')}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-4 ${
                          tournament.status === 'FINISHED' ? 'bg-green-500' : 'bg-gray-300'
                        }`}></div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-800">Finalización</div>
                          <div className="text-sm text-gray-600">
                            {new Date(tournament.endTime).toLocaleString('es-PE')}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Distribución de premios */}
                {tournament.payoutStructure && (
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Distribución de Premios</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {Object.entries(tournament.payoutStructure).map(([position, percentage]) => {
                        const amount = (tournament.prizePool * percentage) / 100;
                        
                        return (
                          <div key={position} className="bg-white rounded-lg p-4 text-center">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${
                              position === '1' ? 'bg-yellow-500' :
                              position === '2' ? 'bg-gray-400' :
                              position === '3' ? 'bg-amber-600' :
                              'bg-blue-500'
                            } text-white font-bold`}>
                              {position}
                            </div>
                            <div className="font-bold text-gray-800">S/ {amount.toFixed(2)}</div>
                            <div className="text-sm text-gray-600">{percentage}%</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Descripción */}
                {tournament.description && (
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Descripción</h3>
                    <p className="text-gray-700">{tournament.description}</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'participants' && (
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4">Participantes ({participants.length})</h3>
                {participants.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No hay participantes inscritos aún</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Participante</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Inscripción</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {participants.map((participant, index) => (
                          <tr key={participant.id || index} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div>
                                <div className="font-medium text-gray-900">{participant.name || 'Sin nombre'}</div>
                                <div className="text-sm text-gray-500">{participant.email || 'Sin email'}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {participant.createdAt ? new Date(participant.createdAt).toLocaleDateString('es-PE') : 'N/A'}
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Activo
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm font-medium">
                              <button className="text-blue-600 hover:text-blue-900 mr-3">
                                Ver predicciones
                              </button>
                              <button className="text-red-600 hover:text-red-900">
                                Eliminar
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'predictions' && (
              <div className="text-center py-12">
                <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-800 mb-2">Gestión de Predicciones</h3>
                <p className="text-gray-600">Funcionalidad en desarrollo</p>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="text-center py-12">
                <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-800 mb-2">Historial de Cambios</h3>
                <p className="text-gray-600">Funcionalidad en desarrollo</p>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="text-center py-12">
                <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-800 mb-2">Configuración Avanzada</h3>
                <p className="text-gray-600">Funcionalidad en desarrollo</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modales */}
      
      {/* Modal de edición */}
      {showEditModal && (
        <TournamentForm
          tournament={tournament}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSave={handleEditSave}
        />
      )}

      {/* Modal de confirmación de eliminación */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center mb-4">
              <AlertCircle className="w-8 h-8 text-red-500 mr-3" />
              <h3 className="text-lg font-bold text-gray-800">Confirmar Eliminación</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que deseas eliminar el torneo "{tournament.name}"? 
              Esta acción no se puede deshacer.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-xl font-bold hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de cambio de estado */}
      {showStatusChanger && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center mb-4">
              <Play className="w-8 h-8 text-green-500 mr-3" />
              <h3 className="text-lg font-bold text-gray-800">Cambiar Estado</h3>
            </div>
            
            <p className="text-gray-600 mb-4">
              Estado actual: <strong>{tournament.status}</strong>
            </p>
            
            <p className="text-gray-600 mb-6">
              Selecciona el nuevo estado para el torneo:
            </p>
            
            <div className="space-y-3 mb-6">
              {validTransitions.map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  disabled={changingStatus}
                  className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  <TournamentStatusBadge status={status} />
                </button>
              ))}
            </div>
            
            <button
              onClick={() => setShowStatusChanger(false)}
              className="w-full bg-gray-200 text-gray-800 py-3 rounded-xl font-bold hover:bg-gray-300"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TournamentDetailAdmin;