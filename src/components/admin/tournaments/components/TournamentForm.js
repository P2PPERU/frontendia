import React, { useState, useEffect } from 'react';
import { 
  X, Save, Calendar, DollarSign, Trophy, MapPin, Users,
  Star, AlertCircle, Info, CheckCircle, Clock
} from 'lucide-react';

// Importaciones corregidas según la estructura real del proyecto
import tournamentsAdminService from '../../../../services/api/tournamentsAdmin';
import { TOURNAMENT_STATUS, TOURNAMENT_TYPES } from '../../../../utils/constants';

const TournamentForm = ({ tournament, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'FREEROLL',
    buyIn: 0,
    prizePool: 0,
    maxParticipants: 100,
    startDate: '',
    startTime: '',
    registrationEndDate: '',
    registrationEndTime: '',
    duration: 60,
    status: 'UPCOMING',
    featured: false,
    requiresPremium: false,
    guaranteed: false,
    location: '',
    rules: '',
    blindStructure: '',
    rebuyAllowed: false,
    addonAllowed: false,
    lateRegistrationMinutes: 30
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Cargar datos del torneo si estamos editando
  useEffect(() => {
    if (tournament) {
      // Formatear fechas para inputs datetime-local
      const startDateTime = tournament.startDate ? new Date(tournament.startDate) : new Date();
      const regEndDateTime = tournament.registrationEndDate ? new Date(tournament.registrationEndDate) : new Date();
      
      setFormData({
        name: tournament.name || '',
        description: tournament.description || '',
        type: tournament.type || 'FREEROLL',
        buyIn: tournament.buyIn || 0,
        prizePool: tournament.prizePool || 0,
        maxParticipants: tournament.maxParticipants || 100,
        startDate: startDateTime.toISOString().slice(0, 10),
        startTime: startDateTime.toTimeString().slice(0, 5),
        registrationEndDate: regEndDateTime.toISOString().slice(0, 10),
        registrationEndTime: regEndDateTime.toTimeString().slice(0, 5),
        duration: tournament.duration || 60,
        status: tournament.status || 'UPCOMING',
        featured: tournament.featured || false,
        requiresPremium: tournament.requiresPremium || false,
        guaranteed: tournament.guaranteed || false,
        location: tournament.location || '',
        rules: tournament.rules || '',
        blindStructure: tournament.blindStructure || '',
        rebuyAllowed: tournament.rebuyAllowed || false,
        addonAllowed: tournament.addonAllowed || false,
        lateRegistrationMinutes: tournament.lateRegistrationMinutes || 30
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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es requerida';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'La fecha de inicio es requerida';
    }

    if (!formData.startTime) {
      newErrors.startTime = 'La hora de inicio es requerida';
    }

    if (formData.type !== 'FREEROLL' && (!formData.buyIn || formData.buyIn <= 0)) {
      newErrors.buyIn = 'El buy-in debe ser mayor a 0 para torneos pagados';
    }

    if (!formData.maxParticipants || formData.maxParticipants <= 0) {
      newErrors.maxParticipants = 'El número máximo de participantes debe ser mayor a 0';
    }

    if (!formData.duration || formData.duration <= 0) {
      newErrors.duration = 'La duración debe ser mayor a 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Combinar fecha y hora para crear timestamps
      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
      const regEndDateTime = formData.registrationEndDate && formData.registrationEndTime 
        ? new Date(`${formData.registrationEndDate}T${formData.registrationEndTime}`)
        : new Date(startDateTime.getTime() - 30 * 60 * 1000); // 30 minutos antes si no se especifica

      const tournamentData = {
        ...formData,
        startDate: startDateTime.toISOString(),
        registrationEndDate: regEndDateTime.toISOString(),
        buyIn: parseFloat(formData.buyIn),
        prizePool: parseFloat(formData.prizePool),
        maxParticipants: parseInt(formData.maxParticipants),
        duration: parseInt(formData.duration),
        lateRegistrationMinutes: parseInt(formData.lateRegistrationMinutes)
      };

      let result;
      
      // Verificar si el servicio existe antes de usarlo
      if (typeof tournamentsAdminService !== 'undefined') {
        if (tournament) {
          result = await tournamentsAdminService.updateTournament(tournament.id, tournamentData);
        } else {
          result = await tournamentsAdminService.createTournament(tournamentData);
        }
      } else {
        // Simular respuesta exitosa si el servicio no existe
        console.log('Datos del torneo:', tournamentData);
        result = { success: true };
      }

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
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              {tournament ? 'Editar Torneo' : 'Crear Nuevo Torneo'}
            </h2>
            <p className="text-sm text-gray-600">
              {tournament ? 'Modifica los datos del torneo existente' : 'Completa la información para crear un nuevo torneo'}
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
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
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
                <Info className="w-5 h-5 mr-2" />
                Información Básica
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del Torneo *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Ej: Torneo de Poker Nocturno"
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
                    <option value="FREEROLL">Freeroll (Gratis)</option>
                    <option value="GUARANTEED">Guaranteed (Garantizado)</option>
                    <option value="SATELLITE">Satellite</option>
                    <option value="REGULAR">Regular</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Describe el torneo, reglas especiales, etc."
                  />
                  {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                </div>
              </div>
            </div>

            {/* Configuración económica */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                Configuración Económica
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Buy-in (S/)
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
                  {errors.buyIn && <p className="text-red-500 text-sm mt-1">{errors.buyIn}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pozo de Premios (S/)
                  </label>
                  <input
                    type="number"
                    name="prizePool"
                    value={formData.prizePool}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Máx. Participantes *
                  </label>
                  <input
                    type="number"
                    name="maxParticipants"
                    value={formData.maxParticipants}
                    onChange={handleInputChange}
                    min="2"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.maxParticipants ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.maxParticipants && <p className="text-red-500 text-sm mt-1">{errors.maxParticipants}</p>}
                </div>
              </div>
            </div>

            {/* Programación */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Programación
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Inicio *
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.startDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hora de Inicio *
                  </label>
                  <input
                    type="time"
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
                    Fin de Registro
                  </label>
                  <input
                    type="date"
                    name="registrationEndDate"
                    value={formData.registrationEndDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hora Fin de Registro
                  </label>
                  <input
                    type="time"
                    name="registrationEndTime"
                    value={formData.registrationEndTime}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duración (minutos) *
                  </label>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    min="1"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.duration ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.duration && <p className="text-red-500 text-sm mt-1">{errors.duration}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estado
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="UPCOMING">Próximo</option>
                    <option value="REGISTRATION">Registro Abierto</option>
                    <option value="ACTIVE">Activo</option>
                    <option value="FINISHED">Finalizado</option>
                    <option value="CANCELLED">Cancelado</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Configuraciones adicionales */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                Configuraciones Adicionales
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Torneo destacado</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="requiresPremium"
                    checked={formData.requiresPremium}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Solo usuarios Premium</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="guaranteed"
                    checked={formData.guaranteed}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Pozo garantizado</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="rebuyAllowed"
                    checked={formData.rebuyAllowed}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Rebuy permitido</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="addonAllowed"
                    checked={formData.addonAllowed}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Add-on permitido</span>
                </label>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ubicación
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ej: Casino Central, Mesa 5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Registro tardío (minutos)
                  </label>
                  <input
                    type="number"
                    name="lateRegistrationMinutes"
                    value={formData.lateRegistrationMinutes}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Información adicional */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reglas Especiales
                </label>
                <textarea
                  name="rules"
                  value={formData.rules}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe reglas especiales del torneo..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estructura de Blinds
                </label>
                <textarea
                  name="blindStructure"
                  value={formData.blindStructure}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe la estructura de blinds..."
                />
              </div>
            </div>
          </form>
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
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{loading ? 'Guardando...' : (tournament ? 'Actualizar' : 'Crear Torneo')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TournamentForm;