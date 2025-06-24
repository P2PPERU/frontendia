import React, { useState } from 'react';
import { 
  Play, Pause, Square, AlertCircle, CheckCircle, Clock,
  Users, DollarSign, Trophy, Settings, X
} from 'lucide-react';
import { TournamentStatusBadge } from './TournamentBadges';
import tournamentsAdminService from '../../../../services/api/tournamentsAdmin';

const TournamentStatusChanger = ({ 
  tournament, 
  isOpen, 
  onClose, 
  onStatusChanged 
}) => {
  const [changing, setChanging] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Estados de transición válidos según el estado actual
  const getValidTransitions = (currentStatus) => {
    const transitions = {
      'UPCOMING': [
        { 
          status: 'REGISTRATION', 
          label: 'Abrir Registro', 
          icon: Play, 
          color: 'green',
          description: 'Los usuarios podrán inscribirse al torneo',
          requirements: ['Configuración completa', 'Fechas válidas']
        },
        { 
          status: 'CANCELLED', 
          label: 'Cancelar Torneo', 
          icon: X, 
          color: 'red',
          description: 'El torneo será cancelado y no se podrá reactivar',
          requirements: ['Sin participantes inscritos'],
          warning: true
        }
      ],
      'REGISTRATION': [
        { 
          status: 'ACTIVE', 
          label: 'Iniciar Torneo', 
          icon: Play, 
          color: 'blue',
          description: 'El torneo comenzará y se cerrarán las inscripciones',
          requirements: ['Al menos 2 participantes', 'Predicciones configuradas']
        },
        { 
          status: 'CANCELLED', 
          label: 'Cancelar Torneo', 
          icon: X, 
          color: 'red',
          description: 'Se procesarán reembolsos automáticos para todos los participantes',
          requirements: ['Confirmar cancelación'],
          warning: true
        }
      ],
      'ACTIVE': [
        { 
          status: 'FINISHED', 
          label: 'Finalizar Torneo', 
          icon: Square, 
          color: 'purple',
          description: 'Se distribuirán los premios y se cerrará el torneo',
          requirements: ['Todas las predicciones resueltas', 'Ranking calculado']
        },
        { 
          status: 'CANCELLED', 
          label: 'Cancelar Torneo', 
          icon: X, 
          color: 'red',
          description: 'CUIDADO: Se cancelará un torneo activo y se procesarán reembolsos',
          requirements: ['Justificación requerida'],
          warning: true,
          dangerous: true
        }
      ],
      'FINISHED': [],
      'CANCELLED': []
    };
    
    return transitions[currentStatus] || [];
  };

  // Validar si se puede hacer la transición
  const validateTransition = (status) => {
    const validations = {
      'REGISTRATION': () => {
        return tournament.predictionsCount > 0 && tournament.maxPlayers > 0;
      },
      'ACTIVE': () => {
        return tournament.currentPlayers >= 2;
      },
      'FINISHED': () => {
        return tournament.status === 'ACTIVE';
      },
      'CANCELLED': () => {
        return true; // Siempre se puede cancelar con confirmación
      }
    };
    
    return validations[status] ? validations[status]() : false;
  };

  // Obtener advertencias para la transición
  const getTransitionWarnings = (status) => {
    const warnings = {
      'REGISTRATION': [],
      'ACTIVE': tournament.currentPlayers < 5 ? 
        ['Pocos participantes inscritos. ¿Seguro que deseas iniciar?'] : [],
      'FINISHED': [],
      'CANCELLED': [
        'Esta acción no se puede deshacer',
        tournament.currentPlayers > 0 ? 
          `Se procesarán ${tournament.currentPlayers} reembolsos automáticamente` : null,
        tournament.status === 'ACTIVE' ? 
          'Se cancelará un torneo en curso' : null
      ].filter(Boolean)
    };
    
    return warnings[status] || [];
  };

  // Manejar selección de estado
  const handleSelectStatus = (status) => {
    setSelectedStatus(status);
    setShowConfirmation(true);
  };

  // Confirmar cambio de estado
  const handleConfirmChange = async () => {
    if (!selectedStatus) return;

    setChanging(true);
    
    try {
      const result = await tournamentsAdminService.updateTournamentStatus(
        tournament.id, 
        selectedStatus
      );
      
      if (result.success) {
        onStatusChanged(selectedStatus);
        onClose();
      } else {
        alert(result.message || 'Error al cambiar el estado');
      }
    } catch (error) {
      alert('Error de conexión al cambiar el estado');
    } finally {
      setChanging(false);
      setShowConfirmation(false);
      setSelectedStatus('');
    }
  };

  const validTransitions = getValidTransitions(tournament.status);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {!showConfirmation ? (
          <>
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Cambiar Estado del Torneo</h3>
                  <p className="text-gray-600 mt-1">Selecciona el nuevo estado para "{tournament.name}"</p>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Estado actual */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-700">Estado actual:</span>
                <TournamentStatusBadge status={tournament.status} size="md" />
              </div>
              
              {/* Info del torneo */}
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="flex items-center">
                  <Users className="w-4 h-4 text-blue-500 mr-2" />
                  <span>{tournament.currentPlayers}/{tournament.maxPlayers} jugadores</span>
                </div>
                <div className="flex items-center">
                  <DollarSign className="w-4 h-4 text-green-500 mr-2" />
                  <span>S/ {tournament.prizePool} en premios</span>
                </div>
                <div className="flex items-center">
                  <Trophy className="w-4 h-4 text-purple-500 mr-2" />
                  <span>{tournament.predictionsCount || 0} predicciones</span>
                </div>
              </div>
            </div>

            {/* Opciones de transición */}
            <div className="p-6">
              {validTransitions.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h4 className="text-lg font-bold text-gray-800 mb-2">Estado Final</h4>
                  <p className="text-gray-600">
                    Este torneo está en un estado final y no se puede cambiar.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <h4 className="font-bold text-gray-800 mb-4">Estados disponibles:</h4>
                  
                  {validTransitions.map((transition) => {
                    const Icon = transition.icon;
                    const canTransition = validateTransition(transition.status);
                    const warnings = getTransitionWarnings(transition.status);
                    
                    return (
                      <div
                        key={transition.status}
                        className={`border-2 rounded-xl p-4 transition-all cursor-pointer ${
                          canTransition
                            ? `border-${transition.color}-200 hover:border-${transition.color}-400 hover:bg-${transition.color}-50`
                            : 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50'
                        } ${transition.warning ? 'border-red-200' : ''}`}
                        onClick={() => canTransition && handleSelectStatus(transition.status)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start">
                            <div className={`p-2 rounded-lg mr-4 ${
                              transition.color === 'green' ? 'bg-green-100 text-green-600' :
                              transition.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                              transition.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                              transition.color === 'red' ? 'bg-red-100 text-red-600' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            
                            <div className="flex-1">
                              <h5 className="font-bold text-gray-800 mb-1">
                                {transition.label}
                                {transition.dangerous && (
                                  <span className="ml-2 text-red-600 text-sm">⚠️ PELIGROSO</span>
                                )}
                              </h5>
                              <p className="text-sm text-gray-600 mb-2">
                                {transition.description}
                              </p>
                              
                              {/* Requisitos */}
                              {transition.requirements && transition.requirements.length > 0 && (
                                <div className="text-xs text-gray-500">
                                  <div className="font-medium">Requisitos:</div>
                                  <ul className="list-disc list-inside">
                                    {transition.requirements.map((req, idx) => (
                                      <li key={idx}>{req}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              {/* Advertencias */}
                              {warnings.length > 0 && (
                                <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded text-xs">
                                  <div className="flex items-center text-orange-800 font-medium mb-1">
                                    <AlertCircle className="w-3 h-3 mr-1" />
                                    Advertencias:
                                  </div>
                                  <ul className="list-disc list-inside text-orange-700">
                                    {warnings.map((warning, idx) => (
                                      <li key={idx}>{warning}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <TournamentStatusBadge status={transition.status} size="sm" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        ) : (
          /* Modal de confirmación */
          <>
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-800">Confirmar Cambio de Estado</h3>
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="text-center mb-6">
                <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
                <h4 className="text-lg font-bold text-gray-800 mb-2">
                  ¿Confirmas el cambio de estado?
                </h4>
                <p className="text-gray-600">
                  El torneo pasará de <strong>{tournament.status}</strong> a <strong>{selectedStatus}</strong>
                </p>
              </div>

              {/* Resumen del cambio */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="text-center">
                    <TournamentStatusBadge status={tournament.status} />
                    <div className="text-xs text-gray-600 mt-1">Estado actual</div>
                  </div>
                  
                  <div className="mx-4 text-gray-400">→</div>
                  
                  <div className="text-center">
                    <TournamentStatusBadge status={selectedStatus} />
                    <div className="text-xs text-gray-600 mt-1">Nuevo estado</div>
                  </div>
                </div>
              </div>

              {/* Advertencias del cambio */}
              {getTransitionWarnings(selectedStatus).length > 0 && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
                  <div className="flex items-center text-orange-800 font-medium mb-2">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    Advertencias importantes:
                  </div>
                  <ul className="list-disc list-inside text-orange-700 text-sm space-y-1">
                    {getTransitionWarnings(selectedStatus).map((warning, idx) => (
                      <li key={idx}>{warning}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Botones de confirmación */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-xl font-bold hover:bg-gray-300"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmChange}
                  disabled={changing}
                  className={`flex-1 py-3 rounded-xl font-bold text-white ${
                    selectedStatus === 'CANCELLED' 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  } disabled:opacity-50`}
                >
                  {changing ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Cambiando...
                    </div>
                  ) : (
                    'Confirmar Cambio'
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TournamentStatusChanger;