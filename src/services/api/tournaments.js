import api, { API_ROUTES } from './index';
import authService from './auth';

class TournamentsService {
  // Obtener lista de torneos activos
  async getTournaments(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filters.status) params.append('status', filters.status);
      if (filters.type) params.append('type', filters.type);
      if (filters.sport) params.append('sport', filters.sport);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit || '20');
      
      const queryString = params.toString();
      const url = queryString ? `${API_ROUTES.TOURNAMENTS}?${queryString}` : API_ROUTES.TOURNAMENTS;
      
      const response = await api.get(url);
      
      if (response.data.success) {
        return {
          success: true,
          tournaments: response.data.data || [],
          userBalance: response.data.userBalance || 0,
          meta: response.data.meta || {},
          cached: response.cached || false
        };
      }
      
      return response.data;
    } catch (error) {
      return api.handleError(error);
    }
  }

  // Obtener detalles de un torneo específico
  async getTournament(id) {
    try {
      const url = api.buildUrl(API_ROUTES.TOURNAMENT_DETAIL, { id });
      const response = await api.get(url);
      
      if (response.data.success) {
        return {
          success: true,
          tournament: response.data.data,
          userEntry: response.data.userEntry || null,
          userBalance: response.data.userBalance || 0,
          isRegistered: !!response.data.userEntry
        };
      }
      
      return response.data;
    } catch (error) {
      return api.handleError(error);
    }
  }

  // Inscribirse en un torneo
  async joinTournament(tournamentId) {
    try {
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
          newBalance: response.data.newBalance,
          message: response.data.message || 'Te has inscrito exitosamente'
        };
      }
      
      return response.data;
    } catch (error) {
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
      
      return api.handleError(error);
    }
  }

  // Salir de un torneo
  async leaveTournament(tournamentId) {
    try {
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
          refunded: response.data.refunded || 0,
          newBalance: response.data.newBalance,
          message: response.data.message || 'Has salido del torneo exitosamente'
        };
      }
      
      return response.data;
    } catch (error) {
      return api.handleError(error);
    }
  }

  // Enviar predicción en un torneo
  async submitPrediction(tournamentId, predictionData) {
    try {
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
          points: response.data.points || 0,
          ranking: response.data.ranking || null,
          message: response.data.message || 'Predicción enviada exitosamente'
        };
      }
      
      return response.data;
    } catch (error) {
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
      
      return api.handleError(error);
    }
  }

  // Obtener ranking global
  async getGlobalRanking(period = 'monthly', limit = 50) {
    try {
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
      return api.handleError(error);
    }
  }

  // Obtener estadísticas del usuario
  async getUserStats() {
    try {
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
      return api.handleError(error);
    }
  }

  // Obtener historial de torneos del usuario
  async getUserHistory(filters = {}) {
    try {
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
      return api.handleError(error);
    }
  }

  // Obtener participantes de un torneo
  async getTournamentParticipants(tournamentId, limit = 20) {
    try {
      const url = api.buildUrl(`${API_ROUTES.TOURNAMENTS}/:id/participants`, { id: tournamentId });
      const response = await api.get(`${url}?limit=${limit}`);
      
      if (response.data.success) {
        return {
          success: true,
          participants: response.data.data || [],
          totalParticipants: response.data.count || 0
        };
      }
      
      return response.data;
    } catch (error) {
      return api.handleError(error);
    }
  }

  // Obtener predicciones disponibles para un torneo
  async getTournamentMatches(tournamentId) {
    try {
      const url = api.buildUrl(`${API_ROUTES.TOURNAMENTS}/:id/matches`, { id: tournamentId });
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
      return api.handleError(error);
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
      filtered = filtered.filter(t => t.buyIn === 0);
    }
    
    // Filtrar solo pagados
    if (filters.paidOnly) {
      filtered = filtered.filter(t => t.buyIn > 0);
    }
    
    // Filtrar por rango de buy-in
    if (filters.minBuyIn !== undefined) {
      filtered = filtered.filter(t => t.buyIn >= filters.minBuyIn);
    }
    
    if (filters.maxBuyIn !== undefined) {
      filtered = filtered.filter(t => t.buyIn <= filters.maxBuyIn);
    }
    
    // Filtrar por deporte
    if (filters.sport) {
      filtered = filtered.filter(t => t.sport === filters.sport);
    }
    
    // Ordenar
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'prize':
          filtered.sort((a, b) => b.prizePool - a.prizePool);
          break;
        case 'participants':
          filtered.sort((a, b) => b.currentPlayers - a.currentPlayers);
          break;
        case 'time':
          filtered.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
          break;
        case 'buyIn':
          filtered.sort((a, b) => a.buyIn - b.buyIn);
          break;
        default:
          break;
      }
    }
    
    return filtered;
  }

  // Calcular estadísticas de torneos
  calculateTournamentStats(tournaments) {
    const total = tournaments.length;
    const active = tournaments.filter(t => t.status === 'ACTIVE').length;
    const registration = tournaments.filter(t => t.status === 'REGISTRATION').length;
    const finished = tournaments.filter(t => t.status === 'FINISHED').length;
    
    const totalPrizePool = tournaments.reduce((sum, t) => sum + (t.prizePool || 0), 0);
    const avgBuyIn = total > 0 ? tournaments.reduce((sum, t) => sum + (t.buyIn || 0), 0) / total : 0;
    const totalParticipants = tournaments.reduce((sum, t) => sum + (t.currentPlayers || 0), 0);
    
    return {
      total,
      active,
      registration,
      finished,
      totalPrizePool,
      avgBuyIn: parseFloat(avgBuyIn.toFixed(2)),
      totalParticipants,
      freerolls: tournaments.filter(t => t.buyIn === 0).length,
      paidTournaments: tournaments.filter(t => t.buyIn > 0).length
    };
  }

  // Verificar si puede inscribirse
  canJoinTournament(tournament, userBalance = 0, isPremium = false) {
    // Verificar estado
    if (tournament.status !== 'REGISTRATION') {
      return { canJoin: false, reason: 'El torneo no está en registro' };
    }
    
    // Verificar límite de jugadores
    if (tournament.currentPlayers >= tournament.maxPlayers) {
      return { canJoin: false, reason: 'Torneo lleno' };
    }
    
    // Verificar deadline
    if (new Date() > new Date(tournament.registrationDeadline)) {
      return { canJoin: false, reason: 'Registro cerrado' };
    }
    
    // Verificar balance
    if (tournament.buyIn > userBalance) {
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
    if (!tournament.prizeDistribution || tournament.buyIn === 0) {
      return 0;
    }
    
    const prize = tournament.prizeDistribution[position - 1] || 0;
    const roi = tournament.buyIn > 0 ? ((prize - tournament.buyIn) / tournament.buyIn) * 100 : 0;
    
    return Math.round(roi);
  }
}

export default new TournamentsService();