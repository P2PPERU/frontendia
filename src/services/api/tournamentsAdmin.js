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

  // Crear nuevo torneo
  async createTournament(tournamentData) {
    try {
      const response = await api.post('/admin/tournaments', tournamentData);
      return response.data;
    } catch (error) {
      return api.handleError(error);
    }
  }

  // Actualizar torneo existente
  async updateTournament(id, data) {
    try {
      const url = `/admin/tournaments/${id}`;
      const response = await api.put(url, data);
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

  // Normalizar datos del torneo para la tabla
  normalizeTournamentData(tournament) {
    if (!tournament) return null;
    
    return {
      id: tournament.id,
      name: tournament.name || 'Sin nombre',
      status: tournament.status || 'UPCOMING',
      type: tournament.type || 'REGULAR',
      buyIn: Number(tournament.buyIn) || 0,
      prizePool: Number(tournament.prizePool) || 0,
      maxPlayers: Number(tournament.maxPlayers) || 0,
      currentPlayers: Number(tournament.currentPlayers) || 0,
      featured: tournament.featured || false,
      requiresPremium: tournament.requiresPremium || false,
      guaranteed: tournament.guaranteed || false,
      startTime: tournament.startTime,
      endTime: tournament.endTime,
      registrationDeadline: tournament.registrationDeadline,
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