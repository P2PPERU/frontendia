import React, { useState, useEffect } from 'react';
import { 
  Target, Plus, Edit2, Trash2, Clock, Trophy, TrendingUp,
  CheckCircle, X, AlertCircle, Calendar, Users, Filter, Search
} from 'lucide-react';
import tournamentsAdminService from '../../../../services/api/tournamentsAdmin';

const TournamentPredictionsTab = ({ tournament, onRefresh }) => {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPrediction, setEditingPrediction] = useState(null);

  // Cargar predicciones del torneo
  const loadPredictions = async () => {
    setLoading(true);
    setError('');

    try {
      const result = await tournamentsAdminService.getTournamentPredictions(tournament.id);
      
      if (result.success) {
        setPredictions(result.data || []);
      } else {
        setError(result.message || 'Error al cargar predicciones');
      }
    } catch (err) {
      setError('Error de conexión al cargar predicciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tournament?.id) {
      loadPredictions();
    }
  }, [tournament?.id]);

  // Filtrar predicciones
  const filteredPredictions = predictions.filter(prediction => {
    const matchesSearch = !searchTerm || 
      prediction.match?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prediction.prediction?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || prediction.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Agregar predicción al torneo
  const handleAddPrediction = async (predictionData) => {
    try {
      const result = await tournamentsAdminService.addPredictionToTournament(
        tournament.id, 
        predictionData
      );
      
      if (result.success) {
        await loadPredictions();
        setShowAddModal(false);
        alert('Predicción agregada al torneo exitosamente');
      } else {
        alert(result.message || 'Error al agregar predicción');
      }
    } catch (error) {
      alert('Error de conexión al agregar predicción');
    }
  };

  // Remover predicción del torneo
  const handleRemovePrediction = async (predictionId) => {
    if (!window.confirm('¿Estás seguro de remover esta predicción del torneo?')) {
      return;
    }

    try {
      const result = await tournamentsAdminService.removePredictionFromTournament(
        tournament.id, 
        predictionId
      );
      
      if (result.success) {
        await loadPredictions();
        alert('Predicción removida del torneo');
      } else {
        alert(result.message || 'Error al remover predicción');
      }
    } catch (error) {
      alert('Error de conexión al remover predicción');
    }
  };

  // Actualizar resultado de predicción
  const handleUpdateResult = async (predictionId, result) => {
    try {
      const response = await tournamentsAdminService.updatePredictionResult(
        predictionId, 
        result
      );
      
      if (response.success) {
        await loadPredictions();
        await onRefresh(); // Actualizar datos del torneo
      } else {
        alert(response.message || 'Error al actualizar resultado');
      }
    } catch (error) {
      alert('Error de conexión al actualizar resultado');
    }
  };

  const canManagePredictions = ['UPCOMING', 'REGISTRATION'].includes(tournament.status);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{predictions.length}</div>
          <div className="text-sm text-blue-600">Total Predicciones</div>
        </div>
        
        <div className="bg-green-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {predictions.filter(p => p.result === 'WON').length}
          </div>
          <div className="text-sm text-green-600">Acertadas</div>
        </div>
        
        <div className="bg-red-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-red-600">
            {predictions.filter(p => p.result === 'LOST').length}
          </div>
          <div className="text-sm text-red-600">Falladas</div>
        </div>
        
        <div className="bg-orange-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">
            {predictions.filter(p => !p.result || p.result === 'PENDING').length}
          </div>
          <div className="text-sm text-orange-600">Pendientes</div>
        </div>
      </div>

      {/* Filtros y acciones */}
      <div className="bg-gray-50 rounded-xl p-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex gap-4 items-center flex-1">
            {/* Búsqueda */}
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar predicciones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Filtro por estado */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="ALL">Todos los estados</option>
              <option value="PENDING">Pendientes</option>
              <option value="WON">Acertadas</option>
              <option value="LOST">Falladas</option>
            </select>
          </div>

          {/* Botón agregar */}
          {canManagePredictions && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Agregar Predicción
            </button>
          )}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center">
          <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0" />
          <span className="text-sm text-red-800">{error}</span>
        </div>
      )}

      {/* Lista de predicciones */}
      {filteredPredictions.length === 0 ? (
        <div className="text-center py-12">
          <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-800 mb-2">
            {predictions.length === 0 ? 'No hay predicciones' : 'No se encontraron predicciones'}
          </h3>
          <p className="text-gray-600 mb-4">
            {predictions.length === 0 
              ? 'Aún no hay predicciones asignadas a este torneo'
              : 'Intenta ajustar los filtros de búsqueda'
            }
          </p>
          {canManagePredictions && predictions.length === 0 && (
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700"
            >
              Agregar Primera Predicción
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPredictions.map((prediction) => (
            <div
              key={prediction.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-bold text-gray-800">{prediction.match}</h3>
                    {prediction.isHot && (
                      <span className="bg-orange-100 text-orange-800 text-xs font-bold px-2 py-1 rounded-full">
                        🔥 HOT
                      </span>
                    )}
                    {prediction.isPremium && (
                      <span className="bg-purple-100 text-purple-800 text-xs font-bold px-2 py-1 rounded-full">
                        Premium
                      </span>
                    )}
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-2">{prediction.league}</div>
                  
                  <div className="bg-blue-50 rounded-xl p-3 mb-3">
                    <div className="font-medium text-blue-800">{prediction.prediction}</div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Confianza:</span>
                      <span className="font-bold text-gray-800 ml-1">{prediction.confidence}%</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Cuota:</span>
                      <span className="font-bold text-green-600 ml-1">{prediction.odds}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Hora:</span>
                      <span className="font-bold text-gray-800 ml-1">
                        {prediction.matchTime ? new Date(prediction.matchTime).toLocaleTimeString('es-PE', {
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Predicciones:</span>
                      <span className="font-bold text-blue-600 ml-1">
                        {prediction.participantPredictions || 0}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Estado y acciones */}
                <div className="flex flex-col items-end gap-3">
                  {/* Estado del resultado */}
                  <div>
                    {prediction.result === 'PENDING' || !prediction.result ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateResult(prediction.id, 'WON')}
                          className="p-2 rounded-lg bg-green-100 text-green-600 hover:bg-green-200"
                          title="Marcar como acertado"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleUpdateResult(prediction.id, 'LOST')}
                          className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200"
                          title="Marcar como fallado"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${
                        prediction.result === 'WON' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {prediction.result === 'WON' ? '✓ Acertado' : '✗ Fallado'}
                      </span>
                    )}
                  </div>

                  {/* Acciones de gestión */}
                  {canManagePredictions && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingPrediction(prediction)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="Editar predicción"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRemovePrediction(prediction.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Remover del torneo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TODO: Modales para agregar/editar predicciones */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Agregar Predicción</h3>
            <p className="text-gray-600 mb-4">Funcionalidad en desarrollo</p>
            <button
              onClick={() => setShowAddModal(false)}
              className="w-full bg-gray-200 text-gray-800 py-3 rounded-xl font-bold"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TournamentPredictionsTab;