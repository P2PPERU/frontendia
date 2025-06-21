import api, { API_ROUTES } from './index';
import authService from './auth';

class PredictionsService {
  // Obtener todas las predicciones del día
  async getTodayPredictions() {
    try {
      const response = await api.get(API_ROUTES.PREDICTIONS);
      
      if (response.data.success) {
        // Actualizar vistas gratuitas en el usuario local
        if (response.data.freeViewsLeft !== undefined) {
          authService.updateUserData({ 
            freeViewsLeft: response.data.freeViewsLeft 
          });
        }
        
        return {
          success: true,
          predictions: response.data.data || [],
          count: response.data.count || 0,
          freeViewsLeft: response.data.freeViewsLeft,
          isPremium: response.data.isPremium,
          cached: response.cached || false,
        };
      }
      
      return response.data;
    } catch (error) {
      return api.handleError(error);
    }
  }

  // Obtener predicciones por fecha específica
  async getPredictionsByDate(date) {
    try {
      // Usar el mismo endpoint pero con parámetro date
      const response = await api.get(`${API_ROUTES.PREDICTIONS}?date=${date}`);
      
      if (response.data.success) {
        // Actualizar vistas gratuitas en el usuario local
        if (response.data.freeViewsLeft !== undefined) {
          authService.updateUserData({ 
            freeViewsLeft: response.data.freeViewsLeft 
          });
        }
        
        return {
          success: true,
          predictions: response.data.data || [],
          count: response.data.count || 0,
          freeViewsLeft: response.data.freeViewsLeft,
          isPremium: response.data.isPremium,
          cached: response.cached || false,
          date: date
        };
      }
      
      return response.data;
    } catch (error) {
      return api.handleError(error);
    }
  }

  // Generar fechas disponibles (últimos 7 días) - Tu backend no tiene endpoint específico para esto
  async getAvailableDates(limit = 7) {
    try {
      // Generar fechas de los últimos días
      const dates = [];
      for (let i = 0; i < limit; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        dates.push(date.toISOString().split('T')[0]);
      }
      
      return {
        success: true,
        dates: dates,
        count: dates.length
      };
    } catch (error) {
      return api.handleError(error);
    }
  }

  // Obtener predicción específica
  async getPrediction(id) {
    try {
      const url = api.buildUrl(API_ROUTES.PREDICTIONS + '/:id', { id });
      const response = await api.get(url);
      
      return response.data;
    } catch (error) {
      return api.handleError(error);
    }
  }

  // Desbloquear predicción premium
  async unlockPrediction(id) {
    try {
      const url = api.buildUrl(API_ROUTES.UNLOCK_PREDICTION, { id });
      const response = await api.post(url);
      
      if (response.data.success) {
        // Actualizar vistas gratuitas
        authService.updateUserData({ 
          freeViewsLeft: response.data.freeViewsLeft 
        });
        
        return {
          success: true,
          prediction: response.data.prediction,
          freeViewsLeft: response.data.freeViewsLeft,
          message: response.data.message,
        };
      }
      
      return response.data;
    } catch (error) {
      // Manejar errores específicos
      if (error.response?.status === 403) {
        return {
          success: false,
          message: 'Has alcanzado el límite diario de desbloqueos gratuitos',
          requiresPremium: true,
        };
      }
      
      return api.handleError(error);
    }
  }

  // Obtener estadísticas de rendimiento por período
  async getPerformanceStats(period = 'week') {
    try {
      const response = await api.get(`${API_ROUTES.PREDICTIONS}/stats?period=${period}`);
      
      if (response.data.success) {
        return {
          success: true,
          stats: response.data.stats || {},
          period: period
        };
      }
      
      return response.data;
    } catch (error) {
      return api.handleError(error);
    }
  }

  // Filtrar predicciones localmente
  filterPredictions(predictions, filters = {}) {
    let filtered = [...predictions];
    
    // Filtrar por liga
    if (filters.league) {
      filtered = filtered.filter(p => 
        p.league.toLowerCase().includes(filters.league.toLowerCase())
      );
    }
    
    // Filtrar por deporte
    if (filters.sport) {
      filtered = filtered.filter(p => p.sport === filters.sport);
    }
    
    // Filtrar solo calientes
    if (filters.hotOnly) {
      filtered = filtered.filter(p => p.isHot || p.hot);
    }
    
    // Filtrar solo premium
    if (filters.premiumOnly !== undefined) {
      filtered = filtered.filter(p => p.isPremium === filters.premiumOnly);
    }
    
    // Filtrar por estado
    if (filters.result !== undefined) {
      filtered = filtered.filter(p => p.result === filters.result);
    }
    
    // Filtrar por fecha
    if (filters.date) {
      filtered = filtered.filter(p => {
        const predDate = new Date(p.matchTime || p.createdAt).toISOString().split('T')[0];
        return predDate === filters.date;
      });
    }
    
    // Filtrar por rango de fechas
    if (filters.startDate && filters.endDate) {
      filtered = filtered.filter(p => {
        const predDate = new Date(p.matchTime || p.createdAt).toISOString().split('T')[0];
        return predDate >= filters.startDate && predDate <= filters.endDate;
      });
    }
    
    // Ordenar por confianza
    if (filters.sortByConfidence) {
      filtered.sort((a, b) => b.confidence - a.confidence);
    }
    
    // Ordenar por cuota
    if (filters.sortByOdds) {
      filtered.sort((a, b) => b.odds - a.odds);
    }
    
    // Ordenar por hora
    if (filters.sortByTime) {
      filtered.sort((a, b) => {
        const timeA = new Date(a.matchTime || a.createdAt);
        const timeB = new Date(b.matchTime || b.createdAt);
        return timeA - timeB;
      });
    }
    
    return filtered;
  }

  // Calcular estadísticas de predicciones
  calculateStats(predictions) {
    const total = predictions.length;
    
    // Filtrar por diferentes estados
    const completed = predictions.filter(p => p.result === 'WON' || p.result === 'LOST');
    const won = predictions.filter(p => p.result === 'WON').length;
    const lost = predictions.filter(p => p.result === 'LOST').length;
    const pending = predictions.filter(p => p.result === 'PENDING' || !p.result).length;
    
    // Calcular promedios
    const avgConfidence = total > 0 
      ? predictions.reduce((acc, p) => acc + (p.confidence || 0), 0) / total 
      : 0;
      
    const avgOdds = total > 0 
      ? predictions.reduce((acc, p) => acc + (p.odds || 0), 0) / total 
      : 0;
    
    // Calcular precisión
    const accuracy = completed.length > 0 
      ? (won / completed.length) * 100 
      : 0;
    
    // Calcular ROI
    const roi = completed.length > 0
      ? ((won * avgOdds - completed.length) / completed.length) * 100
      : 0;
    
    return {
      total,
      won,
      lost,
      pending,
      completed: completed.length,
      accuracy: parseFloat(accuracy.toFixed(1)),
      avgConfidence: parseFloat(avgConfidence.toFixed(1)),
      avgOdds: parseFloat(avgOdds.toFixed(2)),
      roi: parseFloat(roi.toFixed(1)),
      hotPredictions: predictions.filter(p => p.isHot || p.hot).length,
      premiumPredictions: predictions.filter(p => p.isPremium || p.premium).length,
    };
  }

  // Agrupar predicciones por liga
  groupByLeague(predictions) {
    const grouped = {};
    
    predictions.forEach(pred => {
      const league = pred.league || 'Otros';
      if (!grouped[league]) {
        grouped[league] = [];
      }
      grouped[league].push(pred);
    });
    
    return grouped;
  }

  // Agrupar predicciones por fecha
  groupByDate(predictions) {
    const grouped = {};
    
    predictions.forEach(pred => {
      const date = new Date(pred.matchTime || pred.createdAt).toISOString().split('T')[0];
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(pred);
    });
    
    return grouped;
  }

  // Agrupar predicciones por resultado
  groupByResult(predictions) {
    return {
      won: predictions.filter(p => p.result === 'WON'),
      lost: predictions.filter(p => p.result === 'LOST'),
      pending: predictions.filter(p => p.result === 'PENDING' || !p.result)
    };
  }

  // Obtener predicciones destacadas
  getFeaturedPredictions(predictions, limit = 3) {
    return predictions
      .filter(p => (p.isHot || p.hot) && (p.result === 'PENDING' || !p.result))
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, limit);
  }

  // Obtener predicciones premium
  getPremiumPredictions(predictions) {
    return predictions.filter(p => p.isPremium || p.premium);
  }

  // Obtener predicciones gratuitas
  getFreePredictions(predictions) {
    return predictions.filter(p => !(p.isPremium || p.premium));
  }

  // Calcular racha actual
  getCurrentStreak(predictions) {
    // Ordenar por fecha descendente
    const sortedPreds = predictions
      .filter(p => p.result === 'WON' || p.result === 'LOST')
      .sort((a, b) => new Date(b.matchTime || b.createdAt) - new Date(a.matchTime || a.createdAt));
    
    let streak = 0;
    let streakType = null;
    
    for (const pred of sortedPreds) {
      if (streakType === null) {
        streakType = pred.result;
        streak = 1;
      } else if (pred.result === streakType) {
        streak++;
      } else {
        break;
      }
    }
    
    return {
      count: streak,
      type: streakType,
      isWinning: streakType === 'WON'
    };
  }

  // Calcular mejor racha histórica
  getBestStreak(predictions) {
    const sortedPreds = predictions
      .filter(p => p.result === 'WON' || p.result === 'LOST')
      .sort((a, b) => new Date(a.matchTime || a.createdAt) - new Date(b.matchTime || b.createdAt));
    
    let bestWinStreak = 0;
    let currentWinStreak = 0;
    
    for (const pred of sortedPreds) {
      if (pred.result === 'WON') {
        currentWinStreak++;
        bestWinStreak = Math.max(bestWinStreak, currentWinStreak);
      } else {
        currentWinStreak = 0;
      }
    }
    
    return bestWinStreak;
  }

  // Obtener estadísticas por período específico
  getStatsByPeriod(predictions, days = 7) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const periodPredictions = predictions.filter(p => {
      const predDate = new Date(p.matchTime || p.createdAt);
      return predDate >= cutoffDate;
    });
    
    return this.calculateStats(periodPredictions);
  }

  // Verificar si hay nuevas predicciones
  async checkForUpdates(lastUpdateTime) {
    try {
      const response = await api.get(`${API_ROUTES.PREDICTIONS}/check-updates?since=${lastUpdateTime}`);
      
      if (response.data.success) {
        return {
          success: true,
          hasUpdates: response.data.hasUpdates,
          newCount: response.data.newCount || 0,
          lastUpdate: response.data.lastUpdate
        };
      }
      
      return response.data;
    } catch (error) {
      return api.handleError(error);
    }
  }
}

export default new PredictionsService();