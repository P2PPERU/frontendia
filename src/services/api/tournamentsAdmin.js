import api, { API_ROUTES } from './index';

class TournamentsAdminService {
  // =====================================================
  // OBTENER ESTADÍSTICAS DE TORNEOS
  // =====================================================
  async getStats() {
    try {
      const response = await api.get('/admin/tournaments/stats');
      return response.data;
    } catch (error) {
      return api.handleError(error);
    }
  }

  // =====================================================
  // OBTENER LISTA DE TORNEOS (CORREGIDO)
  // =====================================================
  async getTournaments(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      // Filtros que soporta el backend real
      if (filters.status) params.append('status', filters.status);
      if (filters.type) params.append('type', filters.type);
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.append('dateTo', filters.dateTo);
      if (filters.limit) params.append('limit', filters.limit || '50');
      if (filters.offset) params.append('offset', filters.offset || '0');
      
      const queryString = params.toString();
      const url = queryString ? `/admin/tournaments?${queryString}` : '/admin/tournaments';
      
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      return api.handleError(error);
    }
  }

  // =====================================================
  // VALIDAR DATOS SEGÚN BACKEND REAL
  // =====================================================
  validateTournamentData(data) {
    const errors = {};
    
    // Campos obligatorios según el backend real
    if (!data.name?.trim()) {
      errors.name = 'El nombre es requerido';
    } else if (data.name.length > 255) {
      errors.name = 'El nombre no puede exceder 255 caracteres';
    }
    
    if (!data.type) {
      errors.type = 'El tipo es requerido';
    }
    
    if (!data.maxPlayers || data.maxPlayers <= 1) {
      errors.maxPlayers = 'Debe haber al menos 2 jugadores';
    }
    
    if (!data.startTime) {
      errors.startTime = 'Fecha de inicio requerida';
    }
    
    if (!data.endTime) {
      errors.endTime = 'Fecha de fin requerida';
    }
    
    if (!data.registrationDeadline) {
      errors.registrationDeadline = 'Fecha límite de registro requerida';
    }
    
    // Validaciones de fechas
    if (data.startTime && data.endTime && data.registrationDeadline) {
      const now = new Date();
      const startTime = new Date(data.startTime);
      const endTime = new Date(data.endTime);
      const regDeadline = new Date(data.registrationDeadline);

      if (startTime <= now) {
        errors.startTime = 'La fecha de inicio debe ser futura';
      }

      if (endTime <= startTime) {
        errors.endTime = 'La fecha de fin debe ser posterior al inicio';
      }

      if (regDeadline >= startTime) {
        errors.registrationDeadline = 'La fecha límite debe ser anterior al inicio';
      }
    }
    
    // Validación de buy-in para torneos pagados
    if (data.type !== 'FREEROLL' && (!data.buyIn || data.buyIn <= 0)) {
      errors.buyIn = 'El buy-in debe ser mayor a 0 para torneos pagados';
    }
    
    // Validación de estructura de premios
    if (data.payoutStructure) {
      const total = Object.values(data.payoutStructure).reduce((sum, val) => sum + (parseInt(val) || 0), 0);
      if (total !== 100) {
        errors.payoutStructure = 'La distribución de premios debe sumar exactamente 100%';
      }
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // =====================================================
  // PREPARAR DATOS PARA BACKEND REAL (CORREGIDO)
  // =====================================================
  prepareTournamentData(formData) {
    return {
      // ✅ Campos que SÍ existen en el backend real
      name: formData.name?.trim(),
      description: formData.description?.trim() || '',
      type: formData.type,
      buyIn: Number(formData.buyIn) || 0,
      currency: formData.currency || 'PEN',
      maxPlayers: Number(formData.maxPlayers),
      predictionsCount: Number(formData.predictionsCount) || 4,
      
      // ✅ Fechas en formato ISO
      startTime: new Date(formData.startTime).toISOString(),
      endTime: new Date(formData.endTime).toISOString(),
      registrationDeadline: new Date(formData.registrationDeadline).toISOString(),
      
      // ✅ Estructura de premios
      payoutStructure: formData.payoutStructure || {
        "1": 50,
        "2": 30,
        "3": 20
      },
      
      // ✅ Configuración especial
      isHot: formData.isHot || false,
      isFeatured: formData.isFeatured || false,
      
      // ✅ Reglas (sistema de scoring)
      rules: formData.rules || {
        scoring: 'CONFIDENCE_BASED',
        bonusMultipliers: {
          streak: 1.1,
          perfectPick: 1.5,
          roi: 1.15
        }
      }
      
      // ❌ NO enviar campos que no existen en el backend:
      // - sport (no existe)
      // - minPlayers (no existe)
      // - guaranteed (no existe)
      // - requiresPremium (no existe)
      // - prizeDistribution (se llama payoutStructure)
      // - growing (no existe)
      // - allowLateRegistration (no existe)
      // - tags (no existe)
    };
  }

  // =====================================================
  // CREAR TORNEO (CORREGIDO)
  // =====================================================
  async createTournament(formData) {
    try {
      console.log('📝 Datos del formulario:', formData);
      
      // Validar datos
      const validation = this.validateTournamentData(formData);
      if (!validation.isValid) {
        console.error('❌ Validación fallida:', validation.errors);
        return {
          success: false,
          message: 'Datos de torneo inválidos',
          errors: validation.errors
        };
      }
      
      // Preparar datos según el formato del backend
      const tournamentData = this.prepareTournamentData(formData);
      console.log('🚀 Datos a enviar al backend:', tournamentData);
      
      const response = await api.post('/admin/tournaments', tournamentData);
      console.log('✅ Respuesta del backend:', response.data);
      
      if (response.data.success) {
        return {
          success: true,
          data: this.normalizeTournamentData(response.data.data),
          message: response.data.message || 'Torneo creado exitosamente'
        };
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ Error creando torneo:', error);
      return api.handleError(error);
    }
  }

  // =====================================================
  // ACTUALIZAR TORNEO (CORREGIDO)
  // =====================================================
  async updateTournament(id, formData) {
    try {
      console.log('📝 Actualizando torneo:', id, formData);
      
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
      console.log('🚀 Datos a enviar:', tournamentData);
      
      const response = await api.put(`/admin/tournaments/${id}`, tournamentData);
      
      if (response.data.success) {
        return {
          success: true,
          data: this.normalizeTournamentData(response.data.data),
          message: response.data.message || 'Torneo actualizado exitosamente'
        };
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ Error actualizando torneo:', error);
      return api.handleError(error);
    }
  }

  // =====================================================
  // ELIMINAR TORNEO
  // =====================================================
  async deleteTournament(id) {
    try {
      const response = await api.delete(`/admin/tournaments/${id}`);
      return response.data;
    } catch (error) {
      return api.handleError(error);
    }
  }

  // =====================================================
  // CAMBIAR ESTADO
  // =====================================================
  async updateTournamentStatus(id, status) {
    try {
      const response = await api.put(`/admin/tournaments/${id}/status`, { status });
      return response.data;
    } catch (error) {
      return api.handleError(error);
    }
  }

  // =====================================================
  // OBTENER PARTICIPANTES
  // =====================================================
  async getTournamentParticipants(id, limit = 100) {
    try {
      const response = await api.get(`/admin/tournaments/${id}/participants?limit=${limit}`);
      return response.data;
    } catch (error) {
      return api.handleError(error);
    }
  }

  // =====================================================
  // NORMALIZAR DATOS DEL BACKEND (CORREGIDO)
  // =====================================================
  normalizeTournamentData(tournament) {
    if (!tournament) return null;
    
    console.log('🔄 Normalizando datos:', tournament);
    
    return {
      // ✅ Mapeo correcto de campos del backend
      id: tournament.id,
      name: tournament.name || 'Sin nombre',
      description: tournament.description || '',
      status: tournament.status || 'UPCOMING',
      type: tournament.type || 'FREEROLL',
      
      // ✅ Campos financieros
      buyIn: Number(tournament.buyIn || tournament.buy_in) || 0,
      prizePool: Number(tournament.prizePool || tournament.prize_pool) || 0,
      currency: tournament.currency || 'PEN',
      
      // ✅ Participantes
      maxPlayers: Number(tournament.maxPlayers || tournament.max_players) || 0,
      currentPlayers: Number(tournament.currentPlayers || tournament.current_players || tournament.actualPlayers) || 0,
      predictionsCount: Number(tournament.predictionsCount || tournament.predictions_count) || 4,
      
      // ✅ Fechas
      startTime: tournament.startTime || tournament.start_time,
      endTime: tournament.endTime || tournament.end_time,
      registrationDeadline: tournament.registrationDeadline || tournament.registration_deadline,
      
      // ✅ Configuración especial
      isHot: tournament.isHot || tournament.is_hot || false,
      isFeatured: tournament.isFeatured || tournament.is_featured || false,
      
      // ✅ Estructura de premios
      payoutStructure: tournament.payoutStructure || tournament.payout_structure || {
        "1": 50,
        "2": 30,
        "3": 20
      },
      
      // ✅ Reglas
      rules: tournament.rules || {
        scoring: 'CONFIDENCE_BASED',
        bonusMultipliers: {
          streak: 1.1,
          perfectPick: 1.5,
          roi: 1.15
        }
      },
      
      // ✅ Metadatos
      metadata: tournament.metadata || {},
      createdAt: tournament.createdAt || tournament.created_at,
      updatedAt: tournament.updatedAt || tournament.updated_at,
      
      // ✅ Campos calculados
      occupancy: (Number(tournament.maxPlayers || tournament.max_players) || 0) > 0 
        ? Math.round(((Number(tournament.currentPlayers || tournament.current_players || tournament.actualPlayers) || 0) / (Number(tournament.maxPlayers || tournament.max_players) || 0)) * 100) 
        : 0,
      
      spotsLeft: Math.max(0, (Number(tournament.maxPlayers || tournament.max_players) || 0) - (Number(tournament.currentPlayers || tournament.current_players || tournament.actualPlayers) || 0)),
      
      // ✅ Para búsqueda
      searchableText: `${tournament.name} ${tournament.type} ${tournament.status}`.toLowerCase()
    };
  }

  // =====================================================
  // HELPERS PARA BADGES
  // =====================================================
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

  getTypeBadge(type, buyIn = 0) {
    if (Number(buyIn) === 0) {
      return { color: 'blue', text: 'Gratis', icon: '🆓' };
    }
    
    const badges = {
      'FREEROLL': { color: 'blue', text: 'Freeroll', icon: '🆓' },
      'HYPER_TURBO': { color: 'red', text: 'Hiper Turbo', icon: '⚡' },
      'DAILY_CLASSIC': { color: 'green', text: 'Clásico', icon: '🏆' },
      'WEEKLY_MASTERS': { color: 'purple', text: 'Masters', icon: '👑' },
      'SPECIAL': { color: 'orange', text: 'Especial', icon: '⭐' }
    };
    
    return badges[type] || badges['FREEROLL'];
  }

  // =====================================================
  // CALCULAR ESTADÍSTICAS
  // =====================================================
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
    const featuredTournaments = tournaments.filter(t => t.isFeatured).length;
    const hotTournaments = tournaments.filter(t => t.isHot).length;
    
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
      hotTournaments,
      roi: totalBuyIns > 0 ? Math.round(((totalPrizePool - totalBuyIns) / totalBuyIns) * 100) : 0
    };
  }

  // =====================================================
  // FILTRAR TORNEOS LOCALMENTE
  // =====================================================
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
        filtered = filtered.filter(t => t.isFeatured);
      } else if (filters.type === 'HOT') {
        filtered = filtered.filter(t => t.isHot);
      } else {
        filtered = filtered.filter(t => t.type === filters.type);
      }
    }
    
    return filtered;
  }

  // =====================================================
  // ORDENAR TORNEOS
  // =====================================================
  sortTournaments(tournaments, sortBy = 'createdAt', sortOrder = 'desc') {
    return [...tournaments].sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      
      // Manejar valores nulos
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