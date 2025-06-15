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
        const timeA = new Date(`2000-01-01 ${a.time || a.matchTime}`);
        const timeB = new Date(`2000-01-01 ${b.time || b.matchTime}`);
        return timeA - timeB;
      });
    }
    
    return filtered;
  }

  // Calcular estadísticas de predicciones
  calculateStats(predictions) {
    const total = predictions.length;
    const results = predictions.filter(p => p.result !== null);
    const won = results.filter(p => p.result === true).length;
    const lost = results.filter(p => p.result === false).length;
    const pending = predictions.filter(p => p.result === null).length;
    
    const avgConfidence = total > 0 
      ? predictions.reduce((acc, p) => acc + p.confidence, 0) / total 
      : 0;
      
    const avgOdds = total > 0 
      ? predictions.reduce((acc, p) => acc + p.odds, 0) / total 
      : 0;
    
    const accuracy = results.length > 0 
      ? (won / results.length) * 100 
      : 0;
    
    const roi = results.length > 0
      ? ((won * avgOdds - results.length) / results.length) * 100
      : 0;
    
    return {
      total,
      won,
      lost,
      pending,
      accuracy: accuracy.toFixed(1),
      avgConfidence: avgConfidence.toFixed(1),
      avgOdds: avgOdds.toFixed(2),
      roi: roi.toFixed(1),
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

  // Obtener predicciones destacadas
  getFeaturedPredictions(predictions, limit = 3) {
    return predictions
      .filter(p => (p.isHot || p.hot) && p.result === null)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, limit);
  }
}

export default new PredictionsService();