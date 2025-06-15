// src/hooks/usePredictions.js
import { useState, useCallback } from 'react';
import predictionsService from '../services/api/predictions';

export const usePredictions = () => {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadPredictions = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await predictionsService.getTodayPredictions();
      
      if (result.success) {
        setPredictions(result.predictions);
        return result;
      } else {
        setError(result.message);
        return result;
      }
    } catch (err) {
      setError('Error al cargar predicciones');
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, []);

  const unlockPrediction = useCallback(async (predictionId) => {
    try {
      const result = await predictionsService.unlockPrediction(predictionId);
      
      if (result.success) {
        // Actualizar predicción localmente
        setPredictions(prev => 
          prev.map(p => 
            p.id === predictionId 
              ? { ...p, ...result.prediction, unlocked: true }
              : p
          )
        );
      }
      
      return result;
    } catch (err) {
      return { success: false, message: 'Error al desbloquear' };
    }
  }, []);

  const filterPredictions = useCallback((filters) => {
    return predictionsService.filterPredictions(predictions, filters);
  }, [predictions]);

  const getStats = useCallback(() => {
    return predictionsService.calculateStats(predictions);
  }, [predictions]);

  return {
    predictions,
    loading,
    error,
    loadPredictions,
    unlockPrediction,
    filterPredictions,
    getStats
  };
};