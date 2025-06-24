import React, { useState, useEffect } from 'react';
import { 
  X, Save, Calendar, DollarSign, Trophy, Users,
  Star, AlertCircle, Info, CheckCircle, Clock, Target
} from 'lucide-react';

// Tipos de torneos según el backend real
const TOURNAMENT_TYPES = {
  'HYPER_TURBO': 'Hiper Turbo',
  'DAILY_CLASSIC': 'Clásico Diario', 
  'WEEKLY_MASTERS': 'Masters Semanal',
  'FREEROLL': 'Freeroll',
  'SPECIAL': 'Especial'
};

const TOURNAMENT_STATUS = {
  'UPCOMING': 'Próximo',
  'REGISTRATION': 'Inscripciones Abiertas',
  'ACTIVE': 'En Curso',
  'FINISHED': 'Finalizado',
  'CANCELLED': 'Cancelado'
};

const TournamentForm = ({ tournament, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    // Campos obligatorios
    name: '',
    type: 'FREEROLL',
    maxPlayers: 100,
    startTime: '',
    endTime: '',
    registrationDeadline: '',
    
    // Campos opcionales
    description: '',
    buyIn: 0,
    currency: 'PEN',
    predictionsCount: 4,
    isHot: false,
    isFeatured: false,
    
    // Estructura de premios
    payoutStructure: {
      "1": 50, // 1er lugar: 50%
      "2": 30, // 2do lugar: 30%
      "3": 20  // 3er lugar: 20%
    },
    
    // Reglas del sistema de scoring
    rules: {
      scoring: 'CONFIDENCE_BASED',
      bonusMultipliers: {
        streak: 1.1,
        perfectPick: 1.5,
        roi: 1.15
      }
    }
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Cargar datos del torneo si estamos editando
  useEffect(() => {
    if (tournament) {
      // Formatear fechas para inputs datetime-local
      const startTime = tournament.startTime ? new Date(tournament.startTime).toISOString().slice(0, 16) : '';
      const endTime = tournament.endTime ? new Date(tournament.endTime).toISOString().slice(0, 16) : '';
      const registrationDeadline = tournament.registrationDeadline ? new Date(tournament.registrationDeadline).toISOString().slice(0, 16) : '';
      
      setFormData({
        name: tournament.name || '',
        description: tournament.description || '',
        type: tournament.type || 'FREEROLL',
        buyIn: tournament.buyIn || 0,
        currency: tournament.currency || 'PEN',
        maxPlayers: tournament.maxPlayers || 100,
        predictionsCount: tournament.predictionsCount || 4,
        startTime,
        endTime,
        registrationDeadline,
        isHot: tournament.isHot || false,
        isFeatured: tournament.isFeatured || false,
        payoutStructure: tournament.payoutStructure || {
          "1": 50,
          "2": 30,
          "3": 20
        },
        rules: tournament.rules || {
          scoring: 'CONFIDENCE_BASED',
          bonusMultipliers: {
            streak: 1.1,
            perfectPick: 1.5,
            roi: 1.15
          }
        }
      });
    }
  }, [tournament]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Limpiar error del campo al modificarlo
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePayoutChange = (position, value) => {
    setFormData(prev => ({
      ...prev,
      payoutStructure: {
        ...prev.payoutStructure,
        [position]: parseInt(value) || 0
      }
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Validaciones obligatorias
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    } else if (formData.name.length > 255) {
      newErrors.name = 'El nombre no puede exceder 255 caracteres';
    }

    if (!formData.startTime) {
      newErrors.startTime = 'La fecha y hora de inicio son requeridas';
    }

    if (!formData.endTime) {
      newErrors.endTime = 'La fecha y hora de fin son requeridas';
    }

    if (!formData.registrationDeadline) {
      newErrors.registrationDeadline = 'La fecha límite de registro es requerida';
    }

    if (!formData.maxPlayers || formData.maxPlayers <= 1) {
      newErrors.maxPlayers = 'Debe haber al menos 2 jugadores';
    }

    if (!formData.predictionsCount || formData.predictionsCount <= 0) {
      newErrors.predictionsCount = 'Debe haber al menos 1 predicción';
    }

    // Validaciones de fechas
    if (formData.startTime && formData.endTime && formData.registrationDeadline) {
      const now = new Date();
      const startTime = new Date(formData.startTime);
      const endTime = new Date(formData.endTime);
      const regDeadline = new Date(formData.registrationDeadline);

      if (startTime <= now) {
        newErrors.startTime = 'La fecha de inicio debe ser futura';
      }

      if (endTime <= startTime) {
        newErrors.endTime = 'La fecha de fin debe ser posterior al inicio';
      }

      if (regDeadline >= startTime) {
        newErrors.registrationDeadline = 'La fecha límite debe ser anterior al inicio';
      }
    }

    // Validación de buy-in para torneos pagados
    if (formData.type !== 'FREEROLL' && (!formData.buyIn || formData.buyIn <= 0)) {
      newErrors.buyIn = 'El buy-in debe ser mayor a 0 para torneos pagados';
    }

    // Validación de estructura de premios
    const payoutTotal = Object.values(formData.payoutStructure).reduce((sum, val) => sum + (parseInt(val) || 0), 0);
    if (payoutTotal !== 100) {
      newErrors.payoutStructure = 'La distribución de premios debe sumar exactamente 100%';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const tournamentData = {
        ...formData,
        buyIn: parseFloat(formData.buyIn),
        maxPlayers: parseInt(formData.maxPlayers),
        predictionsCount: parseInt(formData.predictionsCount),
        // Convertir fechas a formato ISO
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString(),
        registrationDeadline: new Date(formData.registrationDeadline).toISOString()
      };

      console.log('Datos del torneo a enviar:', tournamentData);
      
      // Aquí iría la llamada al API
      // const result = tournament 
      //   ? await tournamentsAdminService.updateTournament(tournament.id, tournamentData)
      //   : await tournamentsAdminService.createTournament(tournamentData);

      // Simular respuesta exitosa
      const result = { success: true };

      if (result.success) {
        onSave(tournamentData);
        onClose();
      } else {
        setErrors({ submit: result.message || 'Error al guardar el torneo' });
      }
    } catch (error) {
      console.error('Error:', error);
      setErrors({ submit: 'Error de conexión al guardar el torneo' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <Trophy className="w-6 h-6 mr-2 text-yellow-600" />
              {tournament ? 'Editar Torneo' : 'Crear Nuevo Torneo'}
            </h2>
            <p className="text-sm text-gray-600">
              {tournament ? 'Modifica los datos del torneo de predicciones' : 'Completa la información para crear un nuevo torneo de predicciones'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="p-6 space-y-6">
            {/* Error general */}
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0" />
                <span className="text-sm text-red-800">{errors.submit}</span>
              </div>
            )}

            {/* Información básica */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Info className="w-5 h-5 mr-2 text-blue-600" />
                Información Básica
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del Torneo *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    maxLength="255"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Ej: Masters de Predicciones Semanales"
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Torneo *
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {Object.entries(TOURNAMENT_TYPES).map(([key, value]) => (
                      <option key={key} value={key}>{value}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Describe el torneo, reglas especiales, premios adicionales, etc."
                  />
                </div>
              </div>
            </div>

            {/* Configuración del Torneo */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Target className="w-5 h-5 mr-2 text-green-600" />
                Configuración del Torneo
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Máximo de Jugadores *
                  </label>
                  <input
                    type="number"
                    name="maxPlayers"
                    value={formData.maxPlayers}
                    onChange={handleInputChange}
                    min="2"
                    max="1000"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.maxPlayers ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.maxPlayers && <p className="text-red-500 text-sm mt-1">{errors.maxPlayers}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número de Predicciones *
                  </label>
                  <input
                    type="number"
                    name="predictionsCount"
                    value={formData.predictionsCount}
                    onChange={handleInputChange}
                    min="1"
                    max="10"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.predictionsCount ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.predictionsCount && <p className="text-red-500 text-sm mt-1">{errors.predictionsCount}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Moneda
                  </label>
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="PEN">PEN (Soles)</option>
                    <option value="USD">USD (Dólares)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Configuración económica */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                Configuración Económica
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Buy-in ({formData.currency})
                  </label>
                  <input
                    type="number"
                    name="buyIn"
                    value={formData.buyIn}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.buyIn ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={formData.type === 'FREEROLL'}
                  />
                  {formData.type === 'FREEROLL' && (
                    <p className="text-sm text-gray-500 mt-1">Los freerolls son gratuitos</p>
                  )}
                  {errors.buyIn && <p className="text-red-500 text-sm mt-1">{errors.buyIn}</p>}
                </div>
              </div>

              {/* Estructura de Premios */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estructura de Premios (%)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">1er Lugar</label>
                    <input
                      type="number"
                      value={formData.payoutStructure["1"]}
                      onChange={(e) => handlePayoutChange("1", e.target.value)}
                      min="0"
                      max="100"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">2do Lugar</label>
                    <input
                      type="number"
                      value={formData.payoutStructure["2"]}
                      onChange={(e) => handlePayoutChange("2", e.target.value)}
                      min="0"
                      max="100"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">3er Lugar</label>
                    <input
                      type="number"
                      value={formData.payoutStructure["3"]}
                      onChange={(e) => handlePayoutChange("3", e.target.value)}
                      min="0"
                      max="100"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                {errors.payoutStructure && (
                  <p className="text-red-500 text-sm mt-1">{errors.payoutStructure}</p>
                )}
                <p className="text-sm text-gray-600 mt-1">
                  Total: {Object.values(formData.payoutStructure).reduce((sum, val) => sum + (parseInt(val) || 0), 0)}%
                </p>
              </div>
            </div>

            {/* Programación */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-purple-600" />
                Programación
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Límite de Inscripciones *
                  </label>
                  <input
                    type="datetime-local"
                    name="registrationDeadline"
                    value={formData.registrationDeadline}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.registrationDeadline ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.registrationDeadline && <p className="text-red-500 text-sm mt-1">{errors.registrationDeadline}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Inicio del Torneo *
                  </label>
                  <input
                    type="datetime-local"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.startTime ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.startTime && <p className="text-red-500 text-sm mt-1">{errors.startTime}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fin del Torneo *
                  </label>
                  <input
                    type="datetime-local"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.endTime ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.endTime && <p className="text-red-500 text-sm mt-1">{errors.endTime}</p>}
                </div>
              </div>
            </div>

            {/* Configuraciones especiales */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Star className="w-5 h-5 mr-2 text-yellow-600" />
                Configuraciones Especiales
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isHot"
                    checked={formData.isHot}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700">🔥 Torneo Hot</span>
                    <p className="text-xs text-gray-500">Se enviarán notificaciones push a usuarios premium</p>
                  </div>
                </label>

                <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700">⭐ Torneo Destacado</span>
                    <p className="text-xs text-gray-500">Aparecerá en la parte superior de la lista</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Información del sistema de scoring */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="text-md font-semibold text-blue-800 mb-2 flex items-center">
                <CheckCircle className="w-4 h-4 mr-2" />
                Sistema de Puntuación
              </h4>
              <div className="text-sm text-blue-700 space-y-1">
                <p>• <strong>Puntuación base:</strong> Basada en confianza y cuotas de las predicciones</p>
                <p>• <strong>Bonus por racha:</strong> +10% por 3+ aciertos consecutivos</p>
                <p>• <strong>Perfect Pick:</strong> +50% por predicciones con cuotas muy altas</p>
                <p>• <strong>ROI positivo:</strong> +15% bonus por mantener ROI positivo</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{loading ? 'Guardando...' : (tournament ? 'Actualizar Torneo' : 'Crear Torneo')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TournamentForm;