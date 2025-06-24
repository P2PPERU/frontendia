import React, { useState, useEffect } from 'react';
import { 
  Users, Search, Filter, Download, Trash2, Eye, Mail, 
  Trophy, Target, TrendingUp, Calendar, AlertCircle, RefreshCw
} from 'lucide-react';
import tournamentsAdminService from '../../../../services/api/tournamentsAdmin';

const TournamentParticipantsTab = ({ tournament, participants = [], onRefresh }) => {
  const [filteredParticipants, setFilteredParticipants] = useState(participants);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('registrationDate');
  const [sortOrder, setSortOrder] = useState('desc');
  const [loading, setLoading] = useState(false);
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [participantToRemove, setParticipantToRemove] = useState(null);

  // Filtrar y ordenar participantes
  useEffect(() => {
    let filtered = [...participants];

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por estado
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(p => p.status === statusFilter);
    }

    // Ordenar
    filtered.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      
      if (sortBy === 'registrationDate') {
        aVal = new Date(a.createdAt || a.registrationDate);
        bVal = new Date(b.createdAt || b.registrationDate);
      }
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    setFilteredParticipants(filtered);
  }, [participants, searchTerm, statusFilter, sortBy, sortOrder]);

  // Manejar selección de participantes
  const handleSelectParticipant = (participantId) => {
    setSelectedParticipants(prev => {
      if (prev.includes(participantId)) {
        return prev.filter(id => id !== participantId);
      } else {
        return [...prev, participantId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedParticipants.length === filteredParticipants.length) {
      setSelectedParticipants([]);
    } else {
      setSelectedParticipants(filteredParticipants.map(p => p.id));
    }
  };

  // Remover participante
  const handleRemoveParticipant = async (participant) => {
    if (tournament.status === 'ACTIVE' || tournament.status === 'FINISHED') {
      alert('No puedes remover participantes de un torneo activo o finalizado');
      return;
    }

    setParticipantToRemove(participant);
    setShowRemoveConfirm(true);
  };

  const confirmRemoveParticipant = async () => {
    if (!participantToRemove) return;

    setLoading(true);
    
    try {
      const result = await tournamentsAdminService.removeParticipant(
        tournament.id, 
        participantToRemove.id
      );
      
      if (result.success) {
        onRefresh(); // Recargar la lista
        alert('Participante removido exitosamente');
      } else {
        alert(result.message || 'Error al remover participante');
      }
    } catch (error) {
      alert('Error de conexión al remover participante');
    } finally {
      setLoading(false);
      setShowRemoveConfirm(false);
      setParticipantToRemove(null);
    }
  };

  // Exportar participantes
  const handleExport = async () => {
    try {
      await tournamentsAdminService.exportParticipants(tournament.id, {
        format: 'csv',
        includeStats: true
      });
    } catch (error) {
      alert('Error al exportar participantes');
    }
  };

  // Ver predicciones de un participante
  const handleViewPredictions = (participant) => {
    // TODO: Implementar modal o navegación para ver predicciones
    console.log('Ver predicciones de:', participant);
  };

  const canRemoveParticipants = ['UPCOMING', 'REGISTRATION'].includes(tournament.status);

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{participants.length}</div>
          <div className="text-sm text-blue-600">Total Inscritos</div>
        </div>
        
        <div className="bg-green-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {participants.filter(p => p.predictions > 0).length}
          </div>
          <div className="text-sm text-green-600">Con Predicciones</div>
        </div>
        
        <div className="bg-purple-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">
            {Math.round((participants.length / tournament.maxPlayers) * 100)}%
          </div>
          <div className="text-sm text-purple-600">Ocupación</div>
        </div>
        
        <div className="bg-orange-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">
            S/ {(participants.length * (tournament.buyIn || 0)).toFixed(0)}
          </div>
          <div className="text-sm text-orange-600">Recaudado</div>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-gray-50 rounded-xl p-4">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          {/* Búsqueda */}
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nombre o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Filtros */}
          <div className="flex gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="ALL">Todos los estados</option>
              <option value="ACTIVE">Activos</option>
              <option value="ELIMINATED">Eliminados</option>
            </select>

            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="registrationDate-desc">Más recientes</option>
              <option value="registrationDate-asc">Más antiguos</option>
              <option value="name-asc">Nombre A-Z</option>
              <option value="name-desc">Nombre Z-A</option>
              <option value="predictions-desc">Más predicciones</option>
              <option value="points-desc">Más puntos</option>
            </select>

            <button
              onClick={handleExport}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Exportar
            </button>
          </div>
        </div>

        {/* Acciones masivas */}
        {selectedParticipants.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-center justify-between">
            <span className="text-sm text-blue-800">
              {selectedParticipants.length} participante{selectedParticipants.length !== 1 ? 's' : ''} seleccionado{selectedParticipants.length !== 1 ? 's' : ''}
            </span>
            <div className="flex gap-2">
              <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                Enviar mensaje
              </button>
              {canRemoveParticipants && (
                <button className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700">
                  Remover seleccionados
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Lista de participantes */}
      {filteredParticipants.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-800 mb-2">
            {participants.length === 0 ? 'No hay participantes' : 'No se encontraron participantes'}
          </h3>
          <p className="text-gray-600">
            {participants.length === 0 
              ? 'Aún no hay participantes inscritos en este torneo'
              : 'Intenta ajustar los filtros de búsqueda'
            }
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedParticipants.length === filteredParticipants.length}
                      onChange={handleSelectAll}
                      className="rounded"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Participante
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Inscripción
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Predicciones
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Puntos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredParticipants.map((participant, index) => (
                  <tr key={participant.id || index} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedParticipants.includes(participant.id)}
                        onChange={() => handleSelectParticipant(participant.id)}
                        className="rounded"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                          {(participant.name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {participant.name || 'Sin nombre'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {participant.email || 'Sin email'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div>
                        {participant.createdAt ? new Date(participant.createdAt).toLocaleDateString('es-PE') : 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {participant.createdAt ? new Date(participant.createdAt).toLocaleTimeString('es-PE', {
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="flex items-center">
                        <Target className="w-4 h-4 text-blue-500 mr-1" />
                        {participant.predictions || 0}/{tournament.predictionsCount || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900">
                      {participant.points || 0}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        (participant.status || 'ACTIVE') === 'ACTIVE' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {(participant.status || 'ACTIVE') === 'ACTIVE' ? 'Activo' : 'Eliminado'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewPredictions(participant)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="Ver predicciones"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => window.open(`mailto:${participant.email}`)}
                          className="text-green-600 hover:text-green-900 p-1"
                          title="Enviar email"
                        >
                          <Mail className="w-4 h-4" />
                        </button>
                        
                        {canRemoveParticipants && (
                          <button
                            onClick={() => handleRemoveParticipant(participant)}
                            className="text-red-600 hover:text-red-900 p-1"
                            title="Remover participante"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de confirmación de remoción */}
      {showRemoveConfirm && participantToRemove && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center mb-4">
              <AlertCircle className="w-8 h-8 text-red-500 mr-3" />
              <h3 className="text-lg font-bold text-gray-800">Confirmar Remoción</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que deseas remover a <strong>{participantToRemove.name}</strong> del torneo?
              {tournament.buyIn > 0 && (
                <span className="block mt-2 text-sm">
                  Se procesará un reembolso de S/ {tournament.buyIn * 0.9} (penalización del 10%).
                </span>
              )}
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowRemoveConfirm(false)}
                className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-xl font-bold hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={confirmRemoveParticipant}
                disabled={loading}
                className="flex-1 bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? 'Removiendo...' : 'Remover'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TournamentParticipantsTab;