// src/components/tournaments/TournamentsScreen.js
import React, { useState, useEffect } from 'react';
import TournamentsMain from './TournamentsMain';
import TournamentJoin from './TournamentJoin';
import TournamentLive from './TournamentLive';
import { generateTournamentMockData, generateTournamentUserStats } from '../../data/tournamentMockData';
import authService from '../../services/api/auth';

const TournamentsScreen = () => {
  const [currentView, setCurrentView] = useState('main'); // 'main', 'join', 'live'
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [tournamentsData, setTournamentsData] = useState({});
  const [userStats, setUserStats] = useState({});
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Cargar datos iniciales
  useEffect(() => {
    loadTournamentData();
    loadUserData();
  }, []);

  const loadUserData = () => {
    const user = authService.getCurrentUser();
    setUserData(user);
  };

  const loadTournamentData = async () => {
    setLoading(true);
    try {
      // En producción, esto vendría de tu API
      // const response = await tournamentsService.getTournaments();
      
      // Por ahora usar datos mock
      const mockData = generateTournamentMockData();
      const mockUserStats = generateTournamentUserStats();
      
      setTournamentsData(mockData);
      setUserStats(mockUserStats);
      setError('');
      
      console.log('Datos de torneos cargados:', mockData);
      console.log('Estadísticas de usuario cargadas:', mockUserStats);
    } catch (err) {
      console.error('Error cargando datos de torneos:', err);
      setError('Error al cargar los torneos. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleTournamentSelect = (tournament) => {
    console.log('Torneo seleccionado:', tournament);
    setSelectedTournament(tournament);
    
    if (tournament.status === 'LIVE' || tournament.status === 'ACTIVE') {
      setCurrentView('live');
    } else {
      setCurrentView('join');
    }
  };

  const handleBackToMain = () => {
    setCurrentView('main');
    setSelectedTournament(null);
  };

  const handleTournamentJoin = async (tournament, predictions) => {
    try {
      console.log('Inscribiéndose en torneo:', tournament.id);
      console.log('Predicciones:', predictions);
      
      // Aquí conectarías con tu API
      // const result = await tournamentsService.joinTournament(tournament.id, predictions);
      
      // Simular inscripción exitosa
      const joinResult = {
        success: true,
        message: `¡Inscrito exitosamente en ${tournament.name}!`,
        tournament: {
          ...tournament,
          status: 'JOINED',
          myPosition: Math.floor(Math.random() * tournament.participants) + 1,
          myPoints: 0,
          timeLeft: '3h 45m',
          joinedAt: new Date().toISOString()
        }
      };

      if (joinResult.success) {
        // Actualizar datos locales
        const updatedTournaments = { ...tournamentsData };
        
        // Mover de available a active
        updatedTournaments.available = updatedTournaments.available.filter(t => t.id !== tournament.id);
        updatedTournaments.active = [...(updatedTournaments.active || []), joinResult.tournament];
        
        setTournamentsData(updatedTournaments);
        
        // Cambiar a vista live
        setSelectedTournament(joinResult.tournament);
        setCurrentView('live');
        
        // Mostrar notificación de éxito
        if (window.showSuccessToast) {
          window.showSuccessToast(joinResult.message);
        } else {
          alert(joinResult.message);
        }
      } else {
        throw new Error(joinResult.message || 'Error al inscribirse');
      }
      
    } catch (error) {
      console.error('Error joining tournament:', error);
      const errorMessage = error.message || 'Error al inscribirse en el torneo. Intenta de nuevo.';
      
      if (window.showErrorToast) {
        window.showErrorToast(errorMessage);
      } else {
        alert(errorMessage);
      }
    }
  };

  const handleHalftimeChange = async (tournamentId, matchId, newPrediction) => {
    try {
      console.log('Cambio de medio tiempo:', { tournamentId, matchId, newPrediction });
      
      // Aquí conectarías con tu API
      // const result = await tournamentsService.makeHalftimeChange(tournamentId, matchId, newPrediction);
      
      // Simular cambio exitoso
      const changeResult = {
        success: true,
        message: 'Cambio realizado exitosamente',
        updatedMatch: {
          matchId,
          newPrediction,
          pointsAdjustment: Math.floor(Math.random() * 20) - 10 // Simulado
        }
      };

      if (changeResult.success) {
        // Actualizar datos locales del torneo activo
        if (selectedTournament) {
          const updatedTournament = { ...selectedTournament };
          if (updatedTournament.matches) {
            updatedTournament.matches = updatedTournament.matches.map(match => {
              if (match.id === matchId) {
                return {
                  ...match,
                  prediction: newPrediction.option,
                  points: newPrediction.points,
                  changed: true
                };
              }
              return match;
            });
          }
          
          // Actualizar posición y puntos simulados
          updatedTournament.myPoints += changeResult.updatedMatch.pointsAdjustment;
          setSelectedTournament(updatedTournament);
        }
        
        if (window.showSuccessToast) {
          window.showSuccessToast(changeResult.message);
        }
      }
      
      return changeResult;
    } catch (error) {
      console.error('Error en cambio de medio tiempo:', error);
      const errorResult = {
        success: false,
        message: 'Error al realizar el cambio. Intenta de nuevo.'
      };
      
      if (window.showErrorToast) {
        window.showErrorToast(errorResult.message);
      }
      
      return errorResult;
    }
  };

  const handleRefreshTournament = async () => {
    if (selectedTournament && currentView === 'live') {
      try {
        // Aquí harías una llamada a la API para obtener datos actualizados
        // const updatedTournament = await tournamentsService.getTournament(selectedTournament.id);
        
        // Por ahora simular actualización
        const updatedTournament = {
          ...selectedTournament,
          myPoints: selectedTournament.myPoints + Math.floor(Math.random() * 20) - 10,
          myPosition: Math.max(1, selectedTournament.myPosition + Math.floor(Math.random() * 6) - 3),
          leaderPoints: selectedTournament.leaderPoints + Math.floor(Math.random() * 15),
          lastUpdated: new Date().toISOString()
        };
        
        setSelectedTournament(updatedTournament);
        console.log('Torneo actualizado:', updatedTournament);
      } catch (error) {
        console.error('Error refreshing tournament:', error);
      }
    }
  };

  // Auto-refresh para torneos en vivo cada 30 segundos
  useEffect(() => {
    let interval;
    
    if (currentView === 'live' && selectedTournament) {
      interval = setInterval(() => {
        handleRefreshTournament();
      }, 30000); // 30 segundos
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [currentView, selectedTournament]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando torneos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">⚠️</span>
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">Error de Carga</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={loadTournamentData}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // Renderizar vista correspondiente
  switch (currentView) {
    case 'join':
      return (
        <TournamentJoin
          tournament={selectedTournament}
          onBack={handleBackToMain}
          onJoin={handleTournamentJoin}
          userData={userData}
          isPremium={userData?.isPremium || false}
        />
      );
    
    case 'live':
      return (
        <TournamentLive
          tournament={selectedTournament}
          onBack={handleBackToMain}
          onHalftimeChange={handleHalftimeChange}
          onRefresh={handleRefreshTournament}
          userData={userData}
        />
      );
    
    default:
      return (
        <TournamentsMain
          tournaments={tournamentsData}
          userStats={userStats}
          onTournamentSelect={handleTournamentSelect}
          isPremium={userData?.isPremium || false}
          userData={userData}
        />
      );
  }
};

export default TournamentsScreen;