import api, { API_ROUTES } from './index';
import authService from './auth';

class TournamentsService {
  // Obtener lista de torneos activos
  async getTournaments(filters = {}) {
    try {
      console.log('🎯 TournamentsService.getTournaments - Iniciando...');
      
      const params = new URLSearchParams();
      
      if (filters.status) params.append('status', filters.status);
      if (filters.type) params.append('type', filters.type);
      if (filters.sport) params.append('sport', filters.sport);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit || '20');
      
      const queryString = params.toString();
      const url = queryString ? `${API_ROUTES.TOURNAMENTS}?${queryString}` : API_ROUTES.TOURNAMENTS;
      
      console.log('🌐 Haciendo petición a:', url);
      
      const response = await api.get(url);
      
      console.log('📦 Respuesta recibida:', response.data);
      
      if (response.data.success) {
        // Normalizar los datos del backend
        const tournaments = (response.data.data || []).map(tournament => this.normalizeTournamentData(tournament));
        
        console.log('✅ Torneos normalizados:', tournaments);
        
        return {
          success: true,
          tournaments: tournaments,
          userBalance: Number(response.data.userBalance) || 0,
          meta: response.data.meta || {},
          cached: response.cached || false
        };
      }
      
      console.log('❌ Respuesta no exitosa:', response.data);
      return response.data;
      
    } catch (error) {
      console.error('❌ Error en getTournaments:', error);
      return this.handleError(error);
    }
  }

  // Normalizar datos del torneo del backend
  normalizeTournamentData(tournament) {
    if (!tournament) return null;
    
    return {
      // IDs y básicos
      id: tournament.id,
      name: tournament.name || 'Torneo Sin Nombre',
      description: tournament.description || '',
      
      // Estado y tipo
      status: tournament.status || 'UPCOMING',
      type: tournament.type || 'REGULAR',
      
      // Datos financieros - VALIDACIÓN IMPORTANTE
      buyIn: Number(tournament.buyIn) || 0,
      prizePool: Number(tournament.prizePool) || 0,
      currency: tournament.currency || 'S/',
      
      // Participantes - VALIDACIÓN IMPORTANTE  
      maxPlayers: Number(tournament.maxPlayers) || 0,
      currentPlayers: Number(tournament.currentPlayers) || 0,
      
      // Fechas
      startTime: tournament.startTime,
      endTime: tournament.endTime,
      registrationDeadline: tournament.registrationDeadline,
      
      // Configuración
      featured: tournament.featured || tournament.isFeatured || false,
      requiresPremium: tournament.requiresPremium || false,
      guaranteed: tournament.guaranteed || false,
      growing: tournament.growing || false,
      
      // Datos adicionales
      prizeDistribution: tournament.prizeDistribution || tournament.payoutStructure || [],
      rules: tournament.rules || '',
      predictionsCount: Number(tournament.predictionsCount) || 0,
      
      // Metadatos
      metadata: tournament.metadata || {},
      createdAt: tournament.created_at || tournament.createdAt,
      updatedAt: tournament.updated_at || tournament.updatedAt,
      
      // Campos calculados
      spotsLeft: Math.max(0, (Number(tournament.maxPlayers) || 0) - (Number(tournament.currentPlayers) || 0)),
      fillPercentage: (Number(tournament.maxPlayers) || 0) > 0 
        ? ((Number(tournament.currentPlayers) || 0) / (Number(tournament.maxPlayers) || 0)) * 100 
        : 0
    };
  }

  // Obtener detalles de un torneo específico
  async getTournament(id) {
    try {
      console.log('🎯 Cargando torneo:', id);
      
      const url = api.buildUrl(API_ROUTES.TOURNAMENT_DETAIL, { id });
      const response = await api.get(url);
      
      if (response.data.success) {
        const tournament = this.normalizeTournamentData(response.data.data);
        
        return {
          success: true,
          tournament: tournament,
          userEntry: response.data.userEntry || null,
          userBalance: Number(response.data.userBalance) || 0,
          isRegistered: !!response.data.userEntry
        };
      }
      
      return response.data;
    } catch (error) {
      console.error('Error loading tournament:', error);
      return this.handleError(error);
    }
  }

  // Inscribirse en un torneo
  async joinTournament(tournamentId) {
    try {
      console.log('🎯 Inscribiéndose en torneo:', tournamentId);
      
      const url = api.buildUrl(API_ROUTES.TOURNAMENT_JOIN, { id: tournamentId });
      const response = await api.post(url);
      
      if (response.data.success) {
        // Actualizar balance del usuario local
        if (response.data.newBalance !== undefined) {
          authService.updateUserData({ 
            balance: response.data.newBalance 
          });
        }
        
        return {
          success: true,
          entry: response.data.entry,
          transaction: response.data.transaction,
          newBalance: Number(response.data.newBalance) || 0,
          message: response.data.message || 'Te has inscrito exitosamente'
        };
      }
      
      return response.data;
    } catch (error) {
      console.error('Error joining tournament:', error);
      
      if (error.response?.status === 400) {
        return {
          success: false,
          message: error.response.data.message || 'No puedes inscribirte en este torneo',
          code: 'INVALID_REGISTRATION'
        };
      }
      
      if (error.response?.status === 402) {
        return {
          success: false,
          message: 'Balance insuficiente para inscribirte',
          code: 'INSUFFICIENT_BALANCE',
          requiresDeposit: true
        };
      }
      
      return this.handleError(error);
    }
  }

  // Salir de un torneo
  async leaveTournament(tournamentId) {
    try {
      console.log('🎯 Saliendo del torneo:', tournamentId);
      
      const url = api.buildUrl(API_ROUTES.TOURNAMENT_LEAVE, { id: tournamentId });
      const response = await api.post(url);
      
      if (response.data.success) {
        // Actualizar balance del usuario local
        if (response.data.newBalance !== undefined) {
          authService.updateUserData({ 
            balance: response.data.newBalance 
          });
        }
        
        return {
          success: true,
          refunded: Number(response.data.refunded) || 0,
          newBalance: Number(response.data.newBalance) || 0,
          message: response.data.message || 'Has salido del torneo exitosamente'
        };
      }
      
      return response.data;
    } catch (error) {
      console.error('Error leaving tournament:', error);
      return this.handleError(error);
    }
  }

  // Enviar predicción en un torneo
  async submitPrediction(tournamentId, predictionData) {
    try {
      console.log('🎯 Enviando predicción:', tournamentId, predictionData);
      
      const url = api.buildUrl(API_ROUTES.TOURNAMENT_PREDICTIONS, { tournamentId });
      const response = await api.post(url, {
        prediction: predictionData.prediction,
        confidence: predictionData.confidence,
        matchId: predictionData.matchId,
        odds: predictionData.odds,
        predictionType: predictionData.predictionType || '1X2'
      });
      
      if (response.data.success) {
        return {
          success: true,
          prediction: response.data.prediction,
          points: Number(response.data.points) || 0,
          ranking: response.data.ranking || null,
          message: response.data.message || 'Predicción enviada exitosamente'
        };
      }
      
      return response.data;
    } catch (error) {
      console.error('Error submitting prediction:', error);
      
      if (error.response?.status === 400) {
        return {
          success: false,
          message: error.response.data.message || 'Predicción inválida',
          code: 'INVALID_PREDICTION'
        };
      }
      
      if (error.response?.status === 409) {
        return {
          success: false,
          message: 'Ya has enviado una predicción para este partido',
          code: 'DUPLICATE_PREDICTION'
        };
      }
      
      return this.handleError(error);
    }
  }

  // Obtener ranking global
  async getGlobalRanking(period = 'monthly', limit = 50) {
    try {
      console.log('🎯 Cargando ranking global...');
      
      const response = await api.get(`${API_ROUTES.TOURNAMENT_RANKING}?period=${period}&limit=${limit}`);
      
      if (response.data.success) {
        return {
          success: true,
          ranking: response.data.data || [],
          userPosition: response.data.userPosition || null,
          period
        };
      }
      
      return response.data;
    } catch (error) {
      console.error('Error loading ranking:', error);
      return this.handleError(error);
    }
  }

  // Obtener estadísticas del usuario
  async getUserStats() {
    try {
      console.log('🎯 Cargando estadísticas del usuario...');
      
      const response = await api.get(API_ROUTES.TOURNAMENT_USER_STATS);
      
      if (response.data.success) {
        return {
          success: true,
          stats: response.data.data,
          league: response.data.league || null,
          nextLeague: response.data.nextLeague || null
        };
      }
      
      return response.data;
    } catch (error) {
      console.error('Error loading user stats:', error);
      return this.handleError(error);
    }
  }

  // Obtener historial de torneos del usuario
  async getUserHistory(filters = {}) {
    try {
      console.log('🎯 Cargando historial del usuario...');
      
      const params = new URLSearchParams();
      
      if (filters.status) params.append('status', filters.status);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit || '20');
      
      const queryString = params.toString();
      const url = queryString ? `${API_ROUTES.TOURNAMENT_USER_HISTORY}?${queryString}` : API_ROUTES.TOURNAMENT_USER_HISTORY;
      
      const response = await api.get(url);
      
      if (response.data.success) {
        return {
          success: true,
          history: response.data.data || [],
          stats: response.data.stats || {},
          meta: response.data.meta || {}
        };
      }
      
      return response.data;
    } catch (error) {
      console.error('Error loading user history:', error);
      return this.handleError(error);
    }
  }

  // Obtener participantes de un torneo
  async getTournamentParticipants(tournamentId, limit = 20) {
    try {
      console.log('🎯 Cargando participantes del torneo:', tournamentId);
      
      const url = api.buildUrl(API_ROUTES.TOURNAMENT_PARTICIPANTS, { id: tournamentId });
      const response = await api.get(`${url}?limit=${limit}`);
      
      if (response.data.success) {
        return {
          success: true,
          participants: response.data.data || [],
          totalParticipants: Number(response.data.count) || 0
        };
      }
      
      return response.data;
    } catch (error) {
      console.error('Error loading participants:', error);
      return this.handleError(error);
    }
  }

  // Obtener predicciones disponibles para un torneo
  async getTournamentMatches(tournamentId) {
    try {
      console.log('🎯 Cargando partidos del torneo:', tournamentId);
      
      const url = api.buildUrl(API_ROUTES.TOURNAMENT_MATCHES, { id: tournamentId });
      const response = await api.get(url);
      
      if (response.data.success) {
        return {
          success: true,
          matches: response.data.data || [],
          userPredictions: response.data.userPredictions || []
        };
      }
      
      return response.data;
    } catch (error) {
      console.error('Error loading matches:', error);
      return this.handleError(error);
    }
  }

  // Filtrar torneos localmente
  filterTournaments(tournaments, filters = {}) {
    let filtered = [...tournaments];
    
    // Filtrar por estado
    if (filters.status) {
      filtered = filtered.filter(t => t.status === filters.status);
    }
    
    // Filtrar por tipo
    if (filters.type) {
      filtered = filtered.filter(t => t.type === filters.type);
    }
    
    // Filtrar solo freerolls
    if (filters.freeOnly) {
      filtered = filtered.filter(t => (Number(t.buyIn) || 0) === 0);
    }
    
    // Filtrar solo pagados
    if (filters.paidOnly) {
      filtered = filtered.filter(t => (Number(t.buyIn) || 0) > 0);
    }
    
    // Filtrar por rango de buy-in
    if (filters.minBuyIn !== undefined) {
      filtered = filtered.filter(t => (Number(t.buyIn) || 0) >= filters.minBuyIn);
    }
    
    if (filters.maxBuyIn !== undefined) {
      filtered = filtered.filter(t => (Number(t.buyIn) || 0) <= filters.maxBuyIn);
    }
    
    // Filtrar por deporte
    if (filters.sport) {
      filtered = filtered.filter(t => t.sport === filters.sport);
    }
    
    // Ordenar
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'prize':
          filtered.sort((a, b) => (Number(b.prizePool) || 0) - (Number(a.prizePool) || 0));
          break;
        case 'participants':
          filtered.sort((a, b) => (Number(b.currentPlayers) || 0) - (Number(a.currentPlayers) || 0));
          break;
        case 'time':
          filtered.sort((a, b) => {
            const timeA = new Date(a.startTime);
            const timeB = new Date(b.startTime);
            return timeA - timeB;
          });
          break;
        case 'buyIn':
          filtered.sort((a, b) => (Number(a.buyIn) || 0) - (Number(b.buyIn) || 0));
          break;
        default:
          break;
      }
    }
    
    return filtered;
  }

  // Calcular estadísticas de torneos
  calculateTournamentStats(tournaments) {
    const validTournaments = tournaments.filter(t => t && typeof t === 'object');
    const total = validTournaments.length;
    
    const active = validTournaments.filter(t => t.status === 'ACTIVE').length;
    const registration = validTournaments.filter(t => t.status === 'REGISTRATION').length;
    const finished = validTournaments.filter(t => t.status === 'FINISHED').length;
    
    const totalPrizePool = validTournaments.reduce((sum, t) => sum + (Number(t.prizePool) || 0), 0);
    const avgBuyIn = total > 0 ? validTournaments.reduce((sum, t) => sum + (Number(t.buyIn) || 0), 0) / total : 0;
    const totalParticipants = validTournaments.reduce((sum, t) => sum + (Number(t.currentPlayers) || 0), 0);
    
    return {
      total,
      active,
      registration,
      finished,
      totalPrizePool,
      avgBuyIn: parseFloat(avgBuyIn.toFixed(2)),
      totalParticipants,
      freerolls: validTournaments.filter(t => (Number(t.buyIn) || 0) === 0).length,
      paidTournaments: validTournaments.filter(t => (Number(t.buyIn) || 0) > 0).length
    };
  }

  // Verificar si puede inscribirse
  canJoinTournament(tournament, userBalance = 0, isPremium = false) {
    if (!tournament) return { canJoin: false, reason: 'Torneo no válido' };
    
    // Verificar estado
    if (tournament.status !== 'REGISTRATION') {
      return { canJoin: false, reason: 'El torneo no está en registro' };
    }
    
    // Verificar límite de jugadores
    if ((Number(tournament.currentPlayers) || 0) >= (Number(tournament.maxPlayers) || 0)) {
      return { canJoin: false, reason: 'Torneo lleno' };
    }
    
    // Verificar deadline
    if (tournament.registrationDeadline && new Date() > new Date(tournament.registrationDeadline)) {
      return { canJoin: false, reason: 'Registro cerrado' };
    }
    
    // Verificar balance
    if ((Number(tournament.buyIn) || 0) > userBalance) {
      return { canJoin: false, reason: 'Balance insuficiente', requiresDeposit: true };
    }
    
    // Verificar acceso premium
    if (tournament.requiresPremium && !isPremium) {
      return { canJoin: false, reason: 'Requiere membresía Premium', requiresPremium: true };
    }
    
    return { canJoin: true };
  }

  // Obtener tiempo restante para registro
  getRegistrationTimeLeft(tournament) {
    if (!tournament || !tournament.registrationDeadline) {
      return { expired: true, timeLeft: 0 };
    }
    
    const now = new Date();
    const deadline = new Date(tournament.registrationDeadline);
    const timeLeft = deadline - now;
    
    if (timeLeft <= 0) {
      return { expired: true, timeLeft: 0 };
    }
    
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
    
    return {
      expired: false,
      timeLeft,
      hours,
      minutes,
      seconds,
      formatted: `${hours}h ${minutes}m ${seconds}s`
    };
  }

  // Calcular ROI potencial
  calculatePotentialROI(tournament, position = 1) {
    if (!tournament || !tournament.prizeDistribution || (Number(tournament.buyIn) || 0) === 0) {
      return 0;
    }
    
    const prize = tournament.prizeDistribution[position - 1] || 0;
    const buyIn = Number(tournament.buyIn) || 0;
    const roi = buyIn > 0 ? ((prize - buyIn) / buyIn) * 100 : 0;
    
    return Math.round(roi);
  }

  // Manejar errores
  handleError(error) {
    console.error('TournamentsService Error:', error);
    
    if (error.response) {
      // Error del servidor
      return {
        success: false,
        message: error.response.data?.message || 'Error en el servidor',
        status: error.response.status,
      };
    } else if (error.request) {
      // Error de red
      return {
        success: false,
        message: 'Error de conexión. Verifica tu internet.',
        offline: true,
      };
    } else {
      // Error general
      return {
        success: false,
        message: error.message || 'Error desconocido',
      };
    }
  }
}

export default new TournamentsService();