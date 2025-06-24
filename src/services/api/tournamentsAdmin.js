import api, { API_ROUTES } from './index';

class TournamentsAdminService {
  // Obtener estadísticas generales de torneos
  async getStats() {
    try {
      const response = await api.get('/admin/tournaments/stats');
      return response.data;
    } catch (error) {
      return api.handleError(error);
    }
  }

  // Obtener lista completa de torneos para admin
  async getTournaments(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      // Filtros disponibles
      if (filters.status) params.append('status', filters.status);
      if (filters.type) params.append('type', filters.type);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.search) params.append('search', filters.search);
      if (filters.minBuyIn !== undefined) params.append('minBuyIn', filters.minBuyIn);
      if (filters.maxBuyIn !== undefined) params.append('maxBuyIn', filters.maxBuyIn);
      if (filters.featured !== undefined) params.append('featured', filters.featured);
      if (filters.requiresPremium !== undefined) params.append('requiresPremium', filters.requiresPremium);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit || '50');
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
      
      const queryString = params.toString();
      const url = queryString ? `/admin/tournaments?${queryString}` : '/admin/tournaments';
      
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      return api.handleError(error);
    }
  }

  // Validar datos del torneo antes de enviar
  validateTournamentData(data) {
    const errors = {};
    
    // Validaciones básicas
    if (!data.name?.trim()) {
      errors.name = 'El nombre es requerido';
    } else if (data.name.length < 3) {
      errors.name = 'El nombre debe tener al menos 3 caracteres';
    }
    
    if (!data.description?.trim()) {
      errors.description = 'La descripción es requerida';
    }
    
    if (data.buyIn < 0) {
      errors.buyIn = 'El buy-in no puede ser negativo';
    }
    
    if (data.prizePool < 0) {
      errors.prizePool = 'El prize pool no puede ser negativo';
    }
    
    if (data.maxPlayers < data.minPlayers) {
      errors.maxPlayers = 'El máximo debe ser mayor al mínimo';
    }
    
    if (data.minPlayers < 2) {
      errors.minPlayers = 'Mínimo 2 jugadores requeridos';
    }
    
    // Validaciones de fechas
    const now = new Date();
    const startTime = new Date(data.startTime);
    const endTime = new Date(data.endTime);
    const regDeadline = new Date(data.registrationDeadline);
    
    if (!data.startTime) {
      errors.startTime = 'Fecha de inicio requerida';
    } else if (startTime <= now) {
      errors.startTime = 'La fecha de inicio debe ser futura';
    }
    
    if (!data.endTime) {
      errors.endTime = 'Fecha de fin requerida';
    } else if (endTime <= startTime) {
      errors.endTime = 'La fecha de fin debe ser posterior al inicio';
    }
    
    if (!data.registrationDeadline) {
      errors.registrationDeadline = 'Deadline de registro requerido';
    } else if (regDeadline >= startTime) {
      errors.registrationDeadline = 'El registro debe cerrar antes del inicio';
    }
    
    // Validar distribución de premios
    if (data.prizeDistribution) {
      const total = data.prizeDistribution.reduce((sum, p) => sum + Number(p), 0);
      if (Math.abs(total - 100) > 0.01) {
        errors.prizeDistribution = `La distribución debe sumar 100% (actual: ${total.toFixed(1)}%)`;
      }
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // Preparar datos para el backend
  prepareTournamentData(formData) {
    return {
      // Información básica
      name: formData.name?.trim(),
      description: formData.description?.trim(),
      status: formData.status,
      type: formData.type,
      sport: formData.sport,
      
      // Configuración financiera
      buyIn: Number(formData.buyIn) || 0,
      prizePool: Number(formData.prizePool) || 0,
      currency: formData.currency,
      guaranteed: formData.guaranteed || false,
      
      // Participantes
      maxPlayers: Number(formData.maxPlayers) || 100,
      minPlayers: Number(formData.minPlayers) || 10,
      
      // Fechas (convertir a ISO)
      startTime: new Date(formData.startTime).toISOString(),
      endTime: new Date(formData.endTime).toISOString(),
      registrationDeadline: new Date(formData.registrationDeadline).toISOString(),
      
      // Configuración de acceso
      featured: formData.featured || false,
      requiresPremium: formData.requiresPremium || false,
      growing: formData.growing || false,
      
      // Distribución de premios (convertir porcentajes a montos)
      prizeDistribution: formData.prizeDistribution?.map(percentage => 
        Math.round((formData.prizePool * Number(percentage)) / 100)
      ) || [],
      
      // Configuración adicional
      rules: formData.rules?.trim() || '',
      allowLateRegistration: formData.allowLateRegistration || false,
      predictionsRequired: Number(formData.predictionsRequired) || 5,
      confidenceBonus: formData.confidenceBonus !== false,
      streakBonus: formData.streakBonus !== false,
      difficulty: formData.difficulty || 'MEDIUM',
      
      // Metadatos
      tags: formData.tags || [],
      metadata: {
        createdBy: 'admin',
        formVersion: '2.0'
      }
    };
  }

  // Crear nuevo torneo con validación
  async createTournament(formData) {
    try {
      // Validar datos
      const validation = this.validateTournamentData(formData);
      if (!validation.isValid) {
        return {
          success: false,
          message: 'Datos de torneo inválidos',
          errors: validation.errors
        };
      }
      
      // Preparar datos
      const tournamentData = this.prepareTournamentData(formData);
      
      const response = await api.post('/admin/tournaments', tournamentData);
      
      if (response.data.success) {
        return {
          success: true,
          data: this.normalizeTournamentData(response.data.data),
          message: response.data.message || 'Torneo creado exitosamente'
        };
      }
      
      return response.data;
    } catch (error) {
      return api.handleError(error);
    }
  }

  // Actualizar torneo existente con validación
  async updateTournament(id, formData) {
    try {
      // Validar datos (menos estricto para edición)
      const validation = this.validateTournamentData(formData);
      if (!validation.isValid) {
        return {
          success: false,
          message: 'Datos de torneo inválidos',
          errors: validation.errors
        };
      }
      
      // Preparar datos
      const tournamentData = this.prepareTournamentData(formData);
      
      const url = `/admin/tournaments/${id}`;
      const response = await api.put(url, tournamentData);
      
      if (response.data.success) {
        return {
          success: true,
          data: this.normalizeTournamentData(response.data.data),
          message: response.data.message || 'Torneo actualizado exitosamente'
        };
      }
      
      return response.data;
    } catch (error) {
      return api.handleError(error);
    }
  }

  // Eliminar torneo
  async deleteTournament(id) {
    try {
      const url = `/admin/tournaments/${id}`;
      const response = await api.delete(url);
      return response.data;
    } catch (error) {
      return api.handleError(error);
    }
  }

  // Cambiar estado de torneo
  async updateTournamentStatus(id, status) {
    try {
      const url = `/admin/tournaments/${id}/status`;
      const response = await api.put(url, { status });
      return response.data;
    } catch (error) {
      return api.handleError(error);
    }
  }

  // Obtener participantes de un torneo
  async getTournamentParticipants(id, limit = 100) {
    try {
      const url = `/admin/tournaments/${id}/participants?limit=${limit}`;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      return api.handleError(error);
    }
  }

  // Obtener plantillas de torneo
  async getTournamentTemplates() {
    try {
      const response = await api.get('/admin/tournaments/templates');
      return response.data;
    } catch (error) {
      return api.handleError(error);
    }
  }

  // Duplicar torneo
  async duplicateTournament(id) {
    try {
      const response = await api.post(`/admin/tournaments/${id}/duplicate`);
      
      if (response.data.success) {
        return {
          success: true,
          data: this.normalizeTournamentData(response.data.data),
          message: 'Torneo duplicado exitosamente'
        };
      }
      
      return response.data;
    } catch (error) {
      return api.handleError(error);
    }
  }

  // Validar disponibilidad de nombre
  async checkNameAvailability(name, excludeId = null) {
    try {
      const params = new URLSearchParams({ name });
      if (excludeId) params.append('excludeId', excludeId);
      
      const response = await api.get(`/admin/tournaments/check-name?${params.toString()}`);
      return response.data;
    } catch (error) {
      return { success: false, available: false };
    }
  }

  // Exportar datos de torneos
  async exportTournaments(filters = {}, format = 'csv') {
    try {
      const params = new URLSearchParams();
      
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== '') {
          params.append(key, filters[key]);
        }
      });
      
      params.append('format', format);
      
      const queryString = params.toString();
      const url = queryString ? `/admin/tournaments/export?${queryString}` : `/admin/tournaments/export?format=${format}`;
      
      const response = await api.get(url, {
        responseType: 'blob'
      });
      
      // Crear link de descarga
      const blob = new Blob([response.data], { 
        type: format === 'csv' ? 'text/csv' : 'application/json' 
      });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `tournaments-export-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
      
      return { success: true };
    } catch (error) {
      return api.handleError(error);
    }
  }

  // Operaciones masivas
  async bulkUpdateStatus(tournamentIds, status) {
    try {
      const response = await api.put('/admin/tournaments/bulk/status', {
        tournamentIds,
        status
      });
      return response.data;
    } catch (error) {
      return api.handleError(error);
    }
  }

  async bulkDelete(tournamentIds) {
    try {
      const response = await api.delete('/admin/tournaments/bulk', {
        data: { tournamentIds }
      });
      return response.data;
    } catch (error) {
      return api.handleError(error);
    }
  }

  // Calcular estadísticas predictivas
  calculateTournamentProjections(formData) {
    const buyIn = Number(formData.buyIn) || 0;
    const maxPlayers = Number(formData.maxPlayers) || 0;
    const prizePool = Number(formData.prizePool) || 0;
    
    // Estimaciones
    const maxRevenue = buyIn * maxPlayers;
    const expectedParticipants = Math.round(maxPlayers * 0.7); // 70% ocupación esperada
    const expectedRevenue = buyIn * expectedParticipants;
    const rake = maxRevenue - prizePool;
    const rakePercentage = maxRevenue > 0 ? (rake / maxRevenue) * 100 : 0;
    
    // ROI para diferentes posiciones
    const firstPlaceRoi = prizePool > 0 && formData.prizeDistribution?.length > 0 
      ? (((prizePool * formData.prizeDistribution[0] / 100) - buyIn) / buyIn) * 100 
      : 0;
    
    return {
      maxRevenue,
      expectedRevenue,
      expectedParticipants,
      rake,
      rakePercentage: Math.round(rakePercentage * 10) / 10,
      firstPlaceRoi: Math.round(firstPlaceRoi * 10) / 10,
      breakEvenParticipants: prizePool > 0 ? Math.ceil(prizePool / buyIn) : 0
    };
  }

  // Normalizar datos del torneo para la tabla
  normalizeTournamentData(tournament) {
    if (!tournament) return null;
    
    return {
      id: tournament.id,
      name: tournament.name || 'Sin nombre',
      description: tournament.description || '',
      status: tournament.status || 'UPCOMING',
      type: tournament.type || 'REGULAR',
      sport: tournament.sport || 'football',
      buyIn: Number(tournament.buyIn) || 0,
      prizePool: Number(tournament.prizePool) || 0,
      currency: tournament.currency || 'S/',
      maxPlayers: Number(tournament.maxPlayers) || 0,
      currentPlayers: Number(tournament.currentPlayers) || 0,
      minPlayers: Number(tournament.minPlayers) || 0,
      featured: tournament.featured || false,
      requiresPremium: tournament.requiresPremium || false,
      guaranteed: tournament.guaranteed || false,
      growing: tournament.growing || false,
      startTime: tournament.startTime,
      endTime: tournament.endTime,
      registrationDeadline: tournament.registrationDeadline,
      prizeDistribution: tournament.prizeDistribution || tournament.payoutStructure || [],
      rules: tournament.rules || '',
      allowLateRegistration: tournament.allowLateRegistration || false,
      predictionsRequired: tournament.predictionsRequired || 5,
      confidenceBonus: tournament.confidenceBonus !== false,
      streakBonus: tournament.streakBonus !== false,
      difficulty: tournament.difficulty || 'MEDIUM',
      tags: tournament.tags || [],
      createdAt: tournament.createdAt || tournament.created_at,
      updatedAt: tournament.updatedAt || tournament.updated_at,
      
      // Campos calculados
      occupancy: (Number(tournament.maxPlayers) || 0) > 0 
        ? Math.round(((Number(tournament.currentPlayers) || 0) / (Number(tournament.maxPlayers) || 0)) * 100) 
        : 0,
      
      spotsLeft: Math.max(0, (Number(tournament.maxPlayers) || 0) - (Number(tournament.currentPlayers) || 0)),
      
      statusBadge: this.getStatusBadge(tournament.status),
      typeBadge: this.getTypeBadge(tournament.type, tournament.buyIn),
      
      // Para la tabla
      searchableText: `${tournament.name} ${tournament.type} ${tournament.status}`.toLowerCase()
    };
  }

  // Helper para badge de estado
  getStatusBadge(status) {
    const badges = {
      'UPCOMING': { color: 'blue', text: 'Próximo', icon: '⏳' },
      'REGISTRATION': { color: 'green', text: 'Registro', icon: '✅' },
      'ACTIVE': { color: 'orange', text: 'En Vivo', icon: '🔴' },
      'FINISHED': { color: 'gray', text: 'Finalizado', icon: '🏁' },
      'CANCELLED': { color: 'red', text: 'Cancelado', icon: '❌' }
    };
    
    return badges[status] || badges['UPCOMING'];
  }

  // Helper para badge de tipo
  getTypeBadge(type, buyIn = 0) {
    if (Number(buyIn) === 0) {
      return { color: 'blue', text: 'Gratis', icon: '🆓' };
    }
    
    const badges = {
      'FREEROLL': { color: 'blue', text: 'Freeroll', icon: '🆓' },
      'GUARANTEED': { color: 'green', text: 'Garantizado', icon: '💎' },
      'SATELLITE': { color: 'purple', text: 'Satélite', icon: '🛰️' },
      'REGULAR': { color: 'gray', text: 'Regular', icon: '🏆' }
    };
    
    return badges[type] || badges['REGULAR'];
  }

  // Calcular estadísticas de la lista de torneos
  calculateStats(tournaments) {
    const total = tournaments.length;
    const active = tournaments.filter(t => t.status === 'ACTIVE').length;
    const registration = tournaments.filter(t => t.status === 'REGISTRATION').length;
    const finished = tournaments.filter(t => t.status === 'FINISHED').length;
    const cancelled = tournaments.filter(t => t.status === 'CANCELLED').length;
    
    const totalPrizePool = tournaments.reduce((sum, t) => sum + (Number(t.prizePool) || 0), 0);
    const totalBuyIns = tournaments.reduce((sum, t) => sum + ((Number(t.buyIn) || 0) * (Number(t.currentPlayers) || 0)), 0);
    const totalParticipants = tournaments.reduce((sum, t) => sum + (Number(t.currentPlayers) || 0), 0);
    
    const avgOccupancy = total > 0 
      ? Math.round(tournaments.reduce((sum, t) => sum + (t.occupancy || 0), 0) / total)
      : 0;
    
    const freerolls = tournaments.filter(t => (Number(t.buyIn) || 0) === 0).length;
    const paidTournaments = tournaments.filter(t => (Number(t.buyIn) || 0) > 0).length;
    const featuredTournaments = tournaments.filter(t => t.featured).length;
    const premiumTournaments = tournaments.filter(t => t.requiresPremium).length;
    
    return {
      total,
      active,
      registration,
      finished,
      cancelled,
      totalPrizePool,
      totalBuyIns,
      totalParticipants,
      avgOccupancy,
      freerolls,
      paidTournaments,
      featuredTournaments,
      premiumTournaments,
      roi: totalBuyIns > 0 ? Math.round(((totalBuyIns - totalPrizePool) / totalBuyIns) * 100) : 0
    };
  }

  // Filtrar torneos localmente
  filterTournaments(tournaments, filters) {
    let filtered = [...tournaments];
    
    // Búsqueda por texto
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(t => 
        t.searchableText && t.searchableText.includes(searchTerm)
      );
    }
    
    // Filtro por estado
    if (filters.status && filters.status !== 'ALL') {
      filtered = filtered.filter(t => t.status === filters.status);
    }
    
    // Filtro por tipo
    if (filters.type && filters.type !== 'ALL') {
      if (filters.type === 'FREEROLL') {
        filtered = filtered.filter(t => (Number(t.buyIn) || 0) === 0);
      } else if (filters.type === 'PAID') {
        filtered = filtered.filter(t => (Number(t.buyIn) || 0) > 0);
      } else if (filters.type === 'FEATURED') {
        filtered = filtered.filter(t => t.featured);
      } else if (filters.type === 'PREMIUM') {
        filtered = filtered.filter(t => t.requiresPremium);
      } else {
        filtered = filtered.filter(t => t.type === filters.type);
      }
    }
    
    // Filtro por rango de buy-in
    if (filters.minBuyIn !== undefined) {
      filtered = filtered.filter(t => (Number(t.buyIn) || 0) >= filters.minBuyIn);
    }
    
    if (filters.maxBuyIn !== undefined) {
      filtered = filtered.filter(t => (Number(t.buyIn) || 0) <= filters.maxBuyIn);
    }
    
    return filtered;
  }

  // Ordenar torneos
  sortTournaments(tournaments, sortBy = 'createdAt', sortOrder = 'desc') {
    return [...tournaments].sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      
      // Manejar valores nulos/undefined
      if (aVal === null || aVal === undefined) aVal = 0;
      if (bVal === null || bVal === undefined) bVal = 0;
      
      // Manejar fechas
      if (sortBy.includes('Time') || sortBy.includes('At')) {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }
      
      // Manejar números
      if (typeof aVal === 'string' && !isNaN(Number(aVal))) {
        aVal = Number(aVal);
        bVal = Number(bVal);
      }
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
  }
}

const tournamentsAdminService = new TournamentsAdminService();
export default tournamentsAdminService;