import React, { useState, useEffect } from 'react';
import { 
  History, Calendar, User, Settings, Trophy, AlertCircle, 
  Clock, Edit2, Trash2, Play, Pause, Square, RefreshCw
} from 'lucide-react';
import tournamentsAdminService from '../../../../services/api/tournamentsAdmin';

const TournamentHistoryTab = ({ tournament }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('ALL');

  // Cargar historial del torneo
  const loadHistory = async () => {
    setLoading(true);
    setError('');

    try {
      const result = await tournamentsAdminService.getTournamentHistory(tournament.id);
      
      if (result.success) {
        setHistory(result.data || []);
      } else {
        setError(result.message || 'Error al cargar historial');
      }
    } catch (err) {
      // Simular datos de historial para development
      const mockHistory = [
        {
          id: 1,
          action: 'CREATED',
          description: 'Torneo creado',
          user: 'Admin System',
          timestamp: tournament.createdAt || new Date().toISOString(),
          details: {
            name: tournament.name,
            type: tournament.type,
            buyIn: tournament.buyIn
          }
        },
        {
          id: 2,
          action: 'STATUS_CHANGED',
          description: 'Estado cambiado a REGISTRATION',
          user: 'Admin User',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          details: {
            from: 'UPCOMING',
            to: 'REGISTRATION'
          }
        },
        {
          id: 3,
          action: 'PARTICIPANT_JOINED',
          description: 'Nuevo participante inscrito',
          user: 'System',
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          details: {
            participantName: 'Juan Pérez',
            participantEmail: 'juan@example.com'
          }
        }
      ];
      
      setHistory(mockHistory);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tournament?.id) {
      loadHistory();
    }
  }, [tournament?.id]);

  // Filtrar historial
  const filteredHistory = history.filter(item => {
    if (filter === 'ALL') return true;
    return item.action === filter;
  });

  // Obtener icono según el tipo de acción
  const getActionIcon = (action) => {
    const icons = {
      'CREATED': Trophy,
      'UPDATED': Edit2,
      'STATUS_CHANGED': Play,
      'PARTICIPANT_JOINED': User,
      'PARTICIPANT_LEFT': User,
      'PREDICTION_ADDED': Settings,
      'PREDICTION_REMOVED': Trash2,
      'DELETED': Trash2,
      'CANCELLED': Pause,
      'FINISHED': Square
    };
    
    const IconComponent = icons[action] || AlertCircle;
    return <IconComponent className="w-4 h-4" />;
  };

  // Obtener color según el tipo de acción
  const getActionColor = (action) => {
    const colors = {
      'CREATED': 'text-green-600 bg-green-100',
      'UPDATED': 'text-blue-600 bg-blue-100',
      'STATUS_CHANGED': 'text-purple-600 bg-purple-100',
      'PARTICIPANT_JOINED': 'text-emerald-600 bg-emerald-100',
      'PARTICIPANT_LEFT': 'text-orange-600 bg-orange-100',
      'PREDICTION_ADDED': 'text-indigo-600 bg-indigo-100',
      'PREDICTION_REMOVED': 'text-red-600 bg-red-100',
      'DELETED': 'text-red-600 bg-red-100',
      'CANCELLED': 'text-gray-600 bg-gray-100',
      'FINISHED': 'text-blue-600 bg-blue-100'
    };
    
    return colors[action] || 'text-gray-600 bg-gray-100';
  };

  // Formatear descripción con detalles
  const formatDescription = (item) => {
    let description = item.description;
    
    if (item.details) {
      switch (item.action) {
        case 'STATUS_CHANGED':
          description += ` (de ${item.details.from} a ${item.details.to})`;
          break;
        case 'PARTICIPANT_JOINED':
          description += ` - ${item.details.participantName}`;
          break;
        case 'PARTICIPANT_LEFT':
          description += ` - ${item.details.participantName}`;
          break;
        case 'PREDICTION_ADDED':
          description += ` - ${item.details.match}`;
          break;
        default:
          break;
      }
    }
    
    return description;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con filtros */}
      <div className="bg-gray-50 rounded-xl p-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-4">
            <h3 className="font-bold text-gray-800">Filtrar por tipo:</h3>
            
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="ALL">Todas las acciones</option>
              <option value="CREATED">Creación</option>
              <option value="UPDATED">Actualizaciones</option>
              <option value="STATUS_CHANGED">Cambios de estado</option>
              <option value="PARTICIPANT_JOINED">Nuevos participantes</option>
              <option value="PARTICIPANT_LEFT">Participantes que salieron</option>
              <option value="PREDICTION_ADDED">Predicciones agregadas</option>
              <option value="PREDICTION_REMOVED">Predicciones removidas</option>
            </select>
          </div>

          <button
            onClick={loadHistory}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Actualizar
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center">
          <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0" />
          <span className="text-sm text-red-800">{error}</span>
        </div>
      )}

      {/* Timeline de historial */}
      {filteredHistory.length === 0 ? (
        <div className="text-center py-12">
          <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-800 mb-2">Sin historial</h3>
          <p className="text-gray-600">
            {filter === 'ALL' 
              ? 'No hay eventos registrados para este torneo'
              : 'No hay eventos de este tipo registrados'
            }
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6">
            <div className="relative">
              {/* Línea temporal */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>
              
              {/* Eventos */}
              <div className="space-y-6">
                {filteredHistory.map((item, index) => (
                  <div key={item.id || index} className="relative flex items-start">
                    {/* Icono del evento */}
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full ${getActionColor(item.action)} relative z-10`}>
                      {getActionIcon(item.action)}
                    </div>
                    
                    {/* Contenido del evento */}
                    <div className="ml-6 flex-1">
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-800 mb-1">
                              {formatDescription(item)}
                            </h4>
                            
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center">
                                <User className="w-4 h-4 mr-1" />
                                {item.user || 'Sistema'}
                              </div>
                              
                              <div className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                {new Date(item.timestamp).toLocaleString('es-PE')}
                              </div>
                            </div>
                          </div>
                          
                          {/* Badge del tipo de acción */}
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getActionColor(item.action)}`}>
                            {item.action.replace('_', ' ')}
                          </span>
                        </div>
                        
                        {/* Detalles adicionales */}
                        {item.details && Object.keys(item.details).length > 0 && (
                          <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200">
                            <div className="text-xs text-gray-600 mb-2">Detalles:</div>
                            <div className="space-y-1">
                              {Object.entries(item.details).map(([key, value]) => (
                                <div key={key} className="flex justify-between text-sm">
                                  <span className="text-gray-600 capitalize">
                                    {key.replace(/([A-Z])/g, ' $1').toLowerCase()}:
                                  </span>
                                  <span className="font-medium text-gray-800">
                                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resumen de actividad */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-6 text-white">
        <h3 className="text-lg font-bold mb-4">Resumen de Actividad</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              {history.filter(h => h.action === 'PARTICIPANT_JOINED').length}
            </div>
            <div className="text-sm text-gray-400">Inscripciones</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">
              {history.filter(h => h.action === 'STATUS_CHANGED').length}
            </div>
            <div className="text-sm text-gray-400">Cambios Estado</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">
              {history.filter(h => h.action === 'UPDATED').length}
            </div>
            <div className="text-sm text-gray-400">Actualizaciones</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-400">
              {history.filter(h => h.action === 'PREDICTION_ADDED').length}
            </div>
            <div className="text-sm text-gray-400">Predicciones</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TournamentHistoryTab;