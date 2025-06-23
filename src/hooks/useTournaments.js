// src/hooks/useTournaments.js
import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import tournamentsService from '../services/api/tournaments';

export const useTournaments = (options = {}) => {
  const { user, isPremium } = useAuth();
  const {
    autoRefresh = false,
    refreshInterval = 30000,
    loadOnMount = true
  } = options;

  // Estados principales
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userBalance, setUserBalance] = useState(0);

  // Estados de operaciones
  const [joining, setJoining] = useState(false);
  const [leaving, setLeaving] = useState(false);

  // Cargar torneos
  const loadTournaments = useCallback(async (filters = {}) => {
    setLoading(true);
    setError('');

    try {
      const result = await tournamentsService.getTournaments(filters);
      
      if (result.success) {
        setTournaments(result.tournaments);
        setUserBalance(result.userBalance || 0);
        return result;
      } else {
        setError(result.message || 'Error al cargar torneos');
        return result;
      }
    } catch (err) {
      const errorMsg = 'Error de conexión. Verifica tu internet.';
      setError(errorMsg);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar torneo específico
  const loadTournament = useCallback(async (id) => {
    try {
      const result = await tournamentsService.getTournament(id);
      return result;
    } catch (err) {
      return { 
        success: false, 
        message: 'Error al cargar el torneo' 
      };
    }
  }, []);

  // Inscribirse en torneo
  const joinTournament = useCallback(async (tournamentId) => {
    setJoining(true);
    setError('');

    try {
      const result = await tournamentsService.joinTournament(tournamentId);
      
      if (result.success) {
        // Actualizar balance local
        setUserBalance(result.newBalance);
        
        // Actualizar lista de torneos si está cargada
        setTournaments(prev => prev.map(t => 
          t.id === tournamentId 
            ? { ...t, currentPlayers: t.currentPlayers + 1 }
            : t
        ));
      }
      
      return result;
    } catch (err) {
      return { 
        success: false, 
        message: 'Error al inscribirse en el torneo' 
      };
    } finally {
      setJoining(false);
    }
  }, []);

  // Salir de torneo
  const leaveTournament = useCallback(async (tournamentId) => {
    setLeaving(true);
    setError('');

    try {
      const result = await tournamentsService.leaveTournament(tournamentId);
      
      if (result.success) {
        // Actualizar balance local
        setUserBalance(result.newBalance);
        
        // Actualizar lista de torneos si está cargada
        setTournaments(prev => prev.map(t => 
          t.id === tournamentId 
            ? { ...t, currentPlayers: t.currentPlayers - 1 }
            : t
        ));
      }
      
      return result;
    } catch (err) {
      return { 
        success: false, 
        message: 'Error al salir del torneo' 
      };
    } finally {
      setLeaving(false);
    }
  }, []);

  // Enviar predicción
  const submitPrediction = useCallback(async (tournamentId, predictionData) => {
    try {
      const result = await tournamentsService.submitPrediction(tournamentId, predictionData);
      return result;
    } catch (err) {
      return { 
        success: false, 
        message: 'Error al enviar predicción' 
      };
    }
  }, []);

  // Obtener ranking
  const getRanking = useCallback(async (period = 'monthly', limit = 50) => {
    try {
      const result = await tournamentsService.getGlobalRanking(period, limit);
      return result;
    } catch (err) {
      return { 
        success: false, 
        message: 'Error al cargar ranking' 
      };
    }
  }, []);

  // Obtener estadísticas del usuario
  const getUserStats = useCallback(async () => {
    try {
      const result = await tournamentsService.getUserStats();
      return result;
    } catch (err) {
      return { 
        success: false, 
        message: 'Error al cargar estadísticas' 
      };
    }
  }, []);

  // Obtener historial del usuario
  const getUserHistory = useCallback(async (filters = {}) => {
    try {
      const result = await tournamentsService.getUserHistory(filters);
      return result;
    } catch (err) {
      return { 
        success: false, 
        message: 'Error al cargar historial' 
      };
    }
  }, []);

  // Filtrar torneos localmente
  const filterTournaments = useCallback((filters = {}) => {
    return tournamentsService.filterTournaments(tournaments, filters);
  }, [tournaments]);

  // Verificar si puede unirse a un torneo
  const canJoinTournament = useCallback((tournament) => {
    return tournamentsService.canJoinTournament(tournament, userBalance, isPremium);
  }, [userBalance, isPremium]);

  // Calcular estadísticas de torneos
  const getTournamentStats = useCallback(() => {
    return tournamentsService.calculateTournamentStats(tournaments);
  }, [tournaments]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh || tournaments.length === 0) return;

    const interval = setInterval(() => {
      loadTournaments();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, tournaments.length, loadTournaments]);

  // Cargar al montar si está habilitado
  useEffect(() => {
    if (loadOnMount) {
      loadTournaments();
    }
  }, [loadOnMount, loadTournaments]);

  return {
    // Estados
    tournaments,
    loading,
    error,
    userBalance,
    joining,
    leaving,

    // Acciones
    loadTournaments,
    loadTournament,
    joinTournament,
    leaveTournament,
    submitPrediction,
    getRanking,
    getUserStats,
    getUserHistory,

    // Utilidades
    filterTournaments,
    canJoinTournament,
    getTournamentStats,

    // Métodos de conveniencia
    refresh: () => loadTournaments(),
    clearError: () => setError(''),
    
    // Información del usuario
    user,
    isPremium
  };
};

// Hook especializado para un torneo específico
export const useTournament = (tournamentId, options = {}) => {
  const { autoRefresh = false, refreshInterval = 30000 } = options;
  
  const [tournament, setTournament] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [userEntry, setUserEntry] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadTournamentData = useCallback(async () => {
    if (!tournamentId) return;

    setLoading(true);
    setError('');

    try {
      // Cargar detalles del torneo
      const tournamentResult = await tournamentsService.getTournament(tournamentId);
      
      if (tournamentResult.success) {
        setTournament(tournamentResult.tournament);
        setUserEntry(tournamentResult.userEntry);

        // Cargar participantes si está activo
        if (tournamentResult.tournament.status === 'ACTIVE' || 
            tournamentResult.tournament.status === 'FINISHED') {
          const participantsResult = await tournamentsService.getTournamentParticipants(tournamentId);
          if (participantsResult.success) {
            setParticipants(participantsResult.participants);
          }
        }
      } else {
        setError(tournamentResult.message || 'Error al cargar el torneo');
      }
    } catch (err) {
      setError('Error de conexión. Verifica tu internet.');
    } finally {
      setLoading(false);
    }
  }, [tournamentId]);

  // Auto-refresh para torneos activos
  useEffect(() => {
    if (!autoRefresh || !tournament || tournament.status !== 'ACTIVE') return;

    const interval = setInterval(() => {
      loadTournamentData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, tournament, loadTournamentData]);

  // Cargar al montar
  useEffect(() => {
    loadTournamentData();
  }, [loadTournamentData]);

  return {
    tournament,
    participants,
    userEntry,
    loading,
    error,
    refresh: loadTournamentData,
    clearError: () => setError(''),
    isRegistered: !!userEntry
  };
};

// Hook para manejo de predicciones en torneos
export const useTournamentPredictions = (tournamentId) => {
  const [matches, setMatches] = useState([]);
  const [userPredictions, setUserPredictions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadMatches = useCallback(async () => {
    if (!tournamentId) return;

    setLoading(true);
    setError('');

    try {
      const result = await tournamentsService.getTournamentMatches(tournamentId);
      
      if (result.success) {
        setMatches(result.matches || []);
        setUserPredictions(result.userPredictions || []);
      } else {
        setError(result.message || 'Error al cargar partidos');
      }
    } catch (err) {
      setError('Error de conexión. Verifica tu internet.');
    } finally {
      setLoading(false);
    }
  }, [tournamentId]);

  const submitPrediction = useCallback(async (predictionData) => {
    try {
      const result = await tournamentsService.submitPrediction(tournamentId, predictionData);
      
      if (result.success) {
        // Actualizar predicciones locales
        setUserPredictions(prev => [
          ...prev.filter(p => p.matchId !== predictionData.matchId),
          result.prediction
        ]);
      }
      
      return result;
    } catch (err) {
      return { 
        success: false, 
        message: 'Error al enviar predicción' 
      };
    }
  }, [tournamentId]);

  const hasPredictionForMatch = useCallback((matchId) => {
    return userPredictions.some(p => p.matchId === matchId);
  }, [userPredictions]);

  const getPredictionForMatch = useCallback((matchId) => {
    return userPredictions.find(p => p.matchId === matchId);
  }, [userPredictions]);

  useEffect(() => {
    loadMatches();
  }, [loadMatches]);

  return {
    matches,
    userPredictions,
    loading,
    error,
    submitPrediction,
    hasPredictionForMatch,
    getPredictionForMatch,
    refresh: loadMatches,
    clearError: () => setError('')
  };
};

export default useTournaments;