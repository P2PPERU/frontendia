// src/hooks/useTournamentForm.js
import { useState, useEffect, useCallback } from 'react';
import tournamentsAdminService from '../services/api/tournamentsAdmin';

export const useTournamentForm = (initialTournament = null) => {
  const isEditing = !!initialTournament;
  
  // Estado inicial del formulario
  const getInitialFormData = () => ({
    // Información básica
    name: '',
    description: '',
    status: 'UPCOMING',
    type: 'REGULAR',
    sport: 'football',
    
    // Configuración financiera
    buyIn: 0,
    prizePool: 0,
    currency: 'S/',
    guaranteed: false,
    
    // Configuración de participantes
    maxPlayers: 100,
    minPlayers: 10,
    
    // Fechas y tiempos
    startTime: '',
    endTime: '',
    registrationDeadline: '',
    
    // Configuración de acceso
    featured: false,
    requiresPremium: false,
    growing: false,
    
    // Distribución de premios
    prizeDistribution: [50, 30, 20],
    
    // Reglas y configuración adicional
    rules: '',
    allowLateRegistration: false,
    predictionsRequired: 5,
    confidenceBonus: true,
    streakBonus: true,
    
    // Metadatos
    tags: [],
    difficulty: 'MEDIUM'
  });

  // Estados del hook
  const [formData, setFormData] = useState(getInitialFormData());
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Cargar datos del torneo para edición
  useEffect(() => {
    if (isEditing && initialTournament) {
      const tournamentData = {
        name: initialTournament.name || '',
        description: initialTournament.description || '',
        status: initialTournament.status || 'UPCOMING',
        type: initialTournament.type || 'REGULAR',
        sport: initialTournament.sport || 'football',
        buyIn: Number(initialTournament.buyIn) || 0,
        prizePool: Number(initialTournament.prizePool) || 0,
        currency: initialTournament.currency || 'S/',
        guaranteed: initialTournament.guaranteed || false,
        maxPlayers: Number(initialTournament.maxPlayers) || 100,
        minPlayers: Number(initialTournament.minPlayers) || 10,
        startTime: initialTournament.startTime 
          ? new Date(initialTournament.startTime).toISOString().slice(0, 16) 
          : '',
        endTime: initialTournament.endTime 
          ? new Date(initialTournament.endTime).toISOString().slice(0, 16) 
          : '',
        registrationDeadline: initialTournament.registrationDeadline 
          ? new Date(initialTournament.registrationDeadline).toISOString().slice(0, 16) 
          : '',
        featured: initialTournament.featured || false,
        requiresPremium: initialTournament.requiresPremium || false,
        growing: initialTournament.growing || false,
        prizeDistribution: initialTournament.prizeDistribution || [50, 30, 20],
        rules: initialTournament.rules || '',
        allowLateRegistration: initialTournament.allowLateRegistration || false,
        predictionsRequired: initialTournament.predictionsRequired || 5,
        confidenceBonus: initialTournament.confidenceBonus !== false,
        streakBonus: initialTournament.streakBonus !== false,
        tags: initialTournament.tags || [],
        difficulty: initialTournament.difficulty || 'MEDIUM'
      };
      
      setFormData(tournamentData);
      setIsDirty(false);
    }
  }, [isEditing, initialTournament]);

  // Función para actualizar campos del formulario
  const updateField = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    setIsDirty(true);
    
    // Limpiar error del campo si existe
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  }, [errors]);

  // Función para actualizar múltiples campos
  const updateFields = useCallback((updates) => {
    setFormData(prev => ({
      ...prev,
      ...updates
    }));
    
    setIsDirty(true);
    
    // Limpiar errores relacionados
    const fieldsToUpdate = Object.keys(updates);
    const hasErrors = fieldsToUpdate.some(field => errors[field]);
    
    if (hasErrors) {
      setErrors(prev => {
        const newErrors = { ...prev };
        fieldsToUpdate.forEach(field => {
          if (newErrors[field]) {
            delete newErrors[field];
          }
        });
        return newErrors;
      });
    }
  }, [errors]);

  // Calcular fechas automáticamente
  const calculateAutomaticDates = useCallback(() => {
    const now = new Date();
    const startTime = new Date(now.getTime() + 2 * 60 * 60 * 1000); // +2 horas
    const registrationDeadline = new Date(startTime.getTime() - 30 * 60 * 1000); // -30 min
    const endTime = new Date(startTime.getTime() + 3 * 60 * 60 * 1000); // +3 horas
    
    updateFields({
      startTime: startTime.toISOString().slice(0, 16),
      registrationDeadline: registrationDeadline.toISOString().slice(0, 16),
      endTime: endTime.toISOString().slice(0, 16)
    });
  }, [updateFields]);

  // Calcular prize pool automático
  const calculateAutomaticPrizePool = useCallback(() => {
    if (formData.buyIn > 0 && formData.maxPlayers > 0) {
      const totalBuyIns = formData.buyIn * formData.maxPlayers;
      const prizePool = Math.round(totalBuyIns * 0.9); // 90% del total (10% rake)
      
      updateField('prizePool', prizePool);
    }
  }, [formData.buyIn, formData.maxPlayers, updateField]);

  // Manejar cambios en distribución de premios
  const updatePrizeDistribution = useCallback((index, value) => {
    const newDistribution = [...formData.prizeDistribution];
    newDistribution[index] = Number(value) || 0;
    updateField('prizeDistribution', newDistribution);
  }, [formData.prizeDistribution, updateField]);

  // Agregar posición premiada
  const addPrizePosition = useCallback(() => {
    const newDistribution = [...formData.prizeDistribution, 5];
    updateField('prizeDistribution', newDistribution);
  }, [formData.prizeDistribution, updateField]);

  // Remover posición premiada
  const removePrizePosition = useCallback((index) => {
    if (formData.prizeDistribution.length > 1) {
      const newDistribution = formData.prizeDistribution.filter((_, i) => i !== index);
      updateField('prizeDistribution', newDistribution);
    }
  }, [formData.prizeDistribution, updateField]);

  // Validar formulario
  const validateForm = useCallback(() => {
    const validation = tournamentsAdminService.validateTournamentData(formData);
    setErrors(validation.errors);
    return validation.isValid;
  }, [formData]);

  // Resetear formulario
  const resetForm = useCallback(() => {
    setFormData(getInitialFormData());
    setErrors({});
    setIsDirty(false);
  }, []);

  // Calcular proyecciones del torneo
  const getProjections = useCallback(() => {
    return tournamentsAdminService.calculateTournamentProjections(formData);
  }, [formData]);

  // Obtener resumen del formulario para preview
  const getFormSummary = useCallback(() => {
    const projections = getProjections();
    
    return {
      basic: {
        name: formData.name || 'Torneo Sin Nombre',
        description: formData.description || 'Sin descripción',
        type: formData.type,
        sport: formData.sport,
        difficulty: formData.difficulty
      },
      financial: {
        buyIn: formData.buyIn,
        prizePool: formData.prizePool,
        currency: formData.currency,
        guaranteed: formData.guaranteed,
        projections
      },
      participants: {
        min: formData.minPlayers,
        max: formData.maxPlayers,
        expected: projections.expectedParticipants
      },
      dates: {
        registration: formData.registrationDeadline,
        start: formData.startTime,
        end: formData.endTime
      },
      prizes: {
        distribution: formData.prizeDistribution,
        positions: formData.prizeDistribution.length,
        totalPercentage: formData.prizeDistribution.reduce((sum, p) => sum + Number(p), 0)
      },
      access: {
        featured: formData.featured,
        premium: formData.requiresPremium,
        lateRegistration: formData.allowLateRegistration
      }
    };
  }, [formData, getProjections]);

  // Guardar torneo
  const saveTournament = useCallback(async () => {
    if (!validateForm()) {
      return { success: false, message: 'Formulario contiene errores' };
    }
    
    setSaving(true);
    
    try {
      let result;
      
      if (isEditing) {
        result = await tournamentsAdminService.updateTournament(
          initialTournament.id, 
          formData
        );
      } else {
        result = await tournamentsAdminService.createTournament(formData);
      }
      
      if (result.success) {
        setIsDirty(false);
        setErrors({});
      } else {
        setErrors({ submit: result.message || 'Error al guardar torneo' });
      }
      
      return result;
      
    } catch (error) {
      const errorResult = { 
        success: false, 
        message: 'Error de conexión. Inténtalo de nuevo.' 
      };
      setErrors({ submit: errorResult.message });
      return errorResult;
    } finally {
      setSaving(false);
    }
  }, [formData, isEditing, initialTournament, validateForm]);

  // Verificar si hay cambios pendientes
  const hasUnsavedChanges = useCallback(() => {
    return isDirty;
  }, [isDirty]);

  return {
    // Estado del formulario
    formData,
    errors,
    loading,
    saving,
    isDirty,
    isEditing,
    
    // Funciones de actualización
    updateField,
    updateFields,
    updatePrizeDistribution,
    addPrizePosition,
    removePrizePosition,
    
    // Funciones de utilidad
    calculateAutomaticDates,
    calculateAutomaticPrizePool,
    validateForm,
    resetForm,
    getProjections,
    getFormSummary,
    hasUnsavedChanges,
    
    // Función principal
    saveTournament
  };
};