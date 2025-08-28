// src/data/tournamentMockData.js

// Generar datos de torneos realistas
export const generateTournamentMockData = () => {
  const currentTime = new Date();
  
  return {
    // Torneos disponibles para inscribirse
    available: [
      {
        id: 1,
        name: '🔥 Copa Clásicos Sudamericanos',
        type: 'PREMIUM',
        entryFee: 25.00,
        prizePool: 2500,
        participants: 187,
        maxParticipants: 200,
        startTime: new Date(currentTime.getTime() + 2 * 60 * 60 * 1000).toISOString(),
        duration: '4 horas',
        matches: 8,
        status: 'OPEN',
        difficulty: 'PRO',
        winnerPercent: 15,
        bonusMultiplier: '3x',
        featured: true,
        description: 'Los mejores clásicos de Sudamérica en un torneo épico',
        leagues: ['Liga 1 Perú', 'Liga Profesional Argentina', 'Brasileirao'],
        estimatedDuration: 240 // minutos
      },
      {
        id: 2,
        name: 'Torneo Liga 1 Weekend',
        type: 'STANDARD',
        entryFee: 10.00,
        prizePool: 800,
        participants: 67,
        maxParticipants: 100,
        startTime: new Date(currentTime.getTime() + 45 * 60 * 1000).toISOString(),
        duration: '3 horas',
        matches: 6,
        status: 'FILLING',
        difficulty: 'INTERMEDIATE',
        winnerPercent: 12,
        bonusMultiplier: '2.5x',
        featured: false,
        description: 'Torneo enfocado en la Liga 1 peruana',
        leagues: ['Liga 1 Perú'],
        estimatedDuration: 180
      },
      {
        id: 3,
        name: 'Champions League Express',
        type: 'VIP',
        entryFee: 50.00,
        prizePool: 5000,
        participants: 234,
        maxParticipants: 250,
        startTime: new Date(currentTime.getTime() + 6 * 60 * 60 * 1000).toISOString(),
        duration: '5 horas',
        matches: 10,
        status: 'OPEN',
        difficulty: 'EXPERT',
        winnerPercent: 10,
        bonusMultiplier: '3x',
        featured: true,
        description: 'Lo mejor del fútbol europeo',
        leagues: ['Champions League', 'Premier League', 'La Liga'],
        estimatedDuration: 300
      },
      {
        id: 4,
        name: 'Predictor Rookie Free',
        type: 'FREE',
        entryFee: 0,
        prizePool: 200,
        participants: 445,
        maxParticipants: 500,
        startTime: new Date(currentTime.getTime() + 30 * 60 * 1000).toISOString(),
        duration: '2 horas',
        matches: 4,
        status: 'FILLING',
        difficulty: 'BEGINNER',
        winnerPercent: 20,
        bonusMultiplier: '2x',
        featured: false,
        description: 'Perfecto para principiantes',
        leagues: ['Liga 1 Perú', 'Premier League'],
        estimatedDuration: 120
      },
      {
        id: 5,
        name: '⚡ Power Hour Predictor',
        type: 'PREMIUM',
        entryFee: 15.00,
        prizePool: 1200,
        participants: 78,
        maxParticipants: 80,
        startTime: new Date(currentTime.getTime() + 90 * 60 * 1000).toISOString(),
        duration: '1 hora',
        matches: 3,
        status: 'ALMOST_FULL',
        difficulty: 'PRO',
        winnerPercent: 18,
        bonusMultiplier: '2.5x',
        featured: true,
        description: 'Torneo rápido e intenso',
        leagues: ['Premier League', 'La Liga'],
        estimatedDuration: 60
      }
    ],
    
    // Torneos donde el usuario ya está participando
    active: [
      {
        id: 6,
        name: 'Domingo de Clásicos',
        participants: 156,
        prizePool: 1560,
        status: 'LIVE',
        timeLeft: '1h 23m',
        myPosition: 23,
        myPoints: 287,
        leaderPoints: 445,
        entryFee: 10.00,
        joinedAt: new Date(currentTime.getTime() - 2 * 60 * 60 * 1000).toISOString(),
        matches: [
          { 
            match: 'Real Madrid vs Barcelona', 
            prediction: 'Gana Real Madrid', 
            status: 'LOSING', 
            bigMaster: false, 
            points: 0,
            actualScore: '0-1',
            minute: 78,
            originalPoints: 53
          },
          { 
            match: 'Man City vs Liverpool', 
            prediction: 'Más de 2.5 Goles', 
            status: 'WON', 
            bigMaster: true, 
            points: 105, // 35 * 3x
            actualScore: '2-1',
            minute: 90,
            originalPoints: 35,
            multiplier: '3x'
          },
          { 
            match: 'PSG vs Bayern', 
            prediction: 'Empate', 
            status: 'LOST', 
            bigMaster: false, 
            points: -15,
            actualScore: '3-1',
            minute: 90,
            originalPoints: 68
          }
        ],
        canChangePredictions: 1,
        halfTimeChangesUsed: 1,
        halfTimeChangesAvailable: 2
      },
      {
        id: 7,
        name: '🌟 Elite European Night',
        participants: 89,
        prizePool: 2670,
        status: 'LIVE',
        timeLeft: '2h 15m',
        myPosition: 12,
        myPoints: 342,
        leaderPoints: 425,
        entryFee: 30.00,
        joinedAt: new Date(currentTime.getTime() - 1 * 60 * 60 * 1000).toISOString(),
        matches: [
          { 
            match: 'Liverpool vs Chelsea', 
            prediction: 'Ambos Marcan', 
            status: 'WON', 
            bigMaster: false, 
            points: 65,
            actualScore: '2-1',
            minute: 90,
            originalPoints: 65
          },
          { 
            match: 'Inter vs Milan', 
            prediction: 'Menos de 2.5 Goles', 
            status: 'WINNING', 
            bigMaster: true, 
            points: 0, // Pendiente
            actualScore: '0-0',
            minute: 45,
            originalPoints: 52,
            multiplier: '2.5x'
          }
        ],
        canChangePredictions: 0,
        halfTimeChangesUsed: 0,
        halfTimeChangesAvailable: 2
      }
    ],
    
    // Torneos completados
    completed: [
      {
        id: 8,
        name: 'Copa Libertadores Nights',
        position: 8,
        totalPositions: 200,
        prize: 85.50,
        points: 412,
        accuracy: 78,
        bigMasterHits: 2,
        profit: '+65.50',
        entryFee: 20.00,
        completedAt: new Date(currentTime.getTime() - 24 * 60 * 60 * 1000).toISOString(),
        finalLeaderboard: {
          winner: 'PredictorMaster88',
          winnerPoints: 478,
          myFinalPosition: 8,
          totalParticipants: 200
        }
      },
      {
        id: 9,
        name: 'Weekend Warriors',
        position: 3,
        totalPositions: 150,
        prize: 156.75,
        points: 389,
        accuracy: 85,
        bigMasterHits: 3,
        profit: '+141.75',
        entryFee: 15.00,
        completedAt: new Date(currentTime.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        finalLeaderboard: {
          winner: 'StatsGuru2024',
          winnerPoints: 445,
          myFinalPosition: 3,
          totalParticipants: 150
        }
      },
      {
        id: 10,
        name: 'Midweek Madness',
        position: 45,
        totalPositions: 200,
        prize: 0,
        points: 234,
        accuracy: 62,
        bigMasterHits: 1,
        profit: '-12.00',
        entryFee: 12.00,
        completedAt: new Date(currentTime.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        finalLeaderboard: {
          winner: 'LuckyLion77',
          winnerPoints: 467,
          myFinalPosition: 45,
          totalParticipants: 200
        }
      }
    ]
  };
};

// Generar estadísticas del usuario en torneos
export const generateTournamentUserStats = () => {
  return {
    // Estadísticas generales
    totalTournaments: 12,
    activeTournaments: 2,
    prizesWon: 7,
    totalEarnings: 445.50,
    totalSpent: 234.00,
    netProfit: 211.50,
    roi: 34, // 34% ROI
    avgPosition: 18.5,
    
    // Rendimiento
    accuracy: 72, // 72% promedio de acierto
    bigMasterSuccess: 65, // 65% de éxito con Big Master
    averagePoints: 298,
    bestTournament: {
      name: 'Weekend Warriors',
      position: 3,
      prize: 156.75,
      points: 389
    },
    
    // Rachas
    currentStreak: {
      type: 'winning', // 'winning' o 'losing'
      count: 3,
      tournaments: ['Copa Libertadores Nights', 'Weekend Warriors', 'Elite European Night']
    },
    longestWinStreak: 5,
    
    // Por tipo de torneo
    performanceByType: {
      'FREE': { played: 3, won: 1, avgPosition: 45, roi: 0 },
      'STANDARD': { played: 4, won: 2, avgPosition: 22, roi: 28 },
      'PREMIUM': { played: 4, won: 3, avgPosition: 15, roi: 42 },
      'VIP': { played: 1, won: 1, avgPosition: 8, roi: 87 }
    },
    
    // Rankings y logros
    achievements: [
      {
        id: 'first_tournament',
        name: 'Primer Torneo',
        description: 'Completa tu primer torneo',
        earned: true,
        earnedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'big_master_expert',
        name: 'Maestro del Big Master',
        description: 'Acierta 5 Big Masters seguidos',
        earned: true,
        earnedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'top_10_finisher',
        name: 'Top 10',
        description: 'Termina en el top 10 de un torneo',
        earned: true,
        earnedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'profit_king',
        name: 'Rey de las Ganancias',
        description: 'Gana más de S/ 200 en total',
        earned: true,
        earnedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'tournament_winner',
        name: 'Campeón',
        description: 'Gana un torneo',
        earned: false,
        progress: 85 // 85% de progreso hacia ganar
      }
    ]
  };
};

// Generar leaderboard en tiempo real
export const generateLiveLeaderboard = (tournamentId) => {
  const baseNames = [
    'PredictorPro_87', 'AnalysisKing', 'FootballGuru', 'LuckySeven77', 'StatsMaster',
    'GoalHunter23', 'BetWizard', 'SoccerSage', 'OddsBreaker', 'TipsterElite',
    'ScorePredict', 'MatchMaster', 'PenaltyKing', 'CornerExpert', 'CardCounter'
  ];
  
  // Generar leaderboard de 50-200 jugadores
  const totalPlayers = Math.floor(Math.random() * 150) + 50;
  const leaderboard = [];
  
  for (let i = 0; i < totalPlayers; i++) {
    const points = Math.max(50, 500 - (i * 8) + Math.floor(Math.random() * 40 - 20));
    const change = Math.floor(Math.random() * 40 - 20);
    const trend = change > 5 ? 'up' : change < -5 ? 'down' : 'same';
    
    leaderboard.push({
      position: i + 1,
      player: i === 22 ? 'TU' : baseNames[i % baseNames.length] + Math.floor(Math.random() * 100),
      points: points,
      trend: trend,
      change: change,
      bigMasterHits: Math.floor(Math.random() * 4),
      accuracy: Math.floor(Math.random() * 30) + 65, // 65-95%
      avatar: i === 22 ? '👤' : getRandomAvatar(i + 1),
      prize: calculatePrize(i + 1, totalPlayers, 2500), // Ejemplo con prize pool 2500
      isCurrentUser: i === 22
    });
  }
  
  return leaderboard;
};

// Generar partidos en vivo con estados realistas
export const generateLiveMatches = (tournamentId) => {
  const matches = [
    { teams: ['Real Madrid', 'Barcelona'], league: 'La Liga' },
    { teams: ['Manchester City', 'Liverpool'], league: 'Premier League' },
    { teams: ['PSG', 'Bayern Munich'], league: 'Champions League' },
    { teams: ['Universitario', 'Alianza Lima'], league: 'Liga 1 Perú' },
    { teams: ['Boca Juniors', 'River Plate'], league: 'Liga Profesional' }
  ];
  
  return matches.slice(0, Math.floor(Math.random() * 3) + 3).map((match, idx) => {
    const statuses = ['PENDING', 'LIVE', 'HALFTIME', 'FINISHED'];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const score = status !== 'PENDING' ? 
      `${Math.floor(Math.random() * 4)}-${Math.floor(Math.random() * 4)}` : 
      '0-0';
    const minute = status === 'LIVE' ? Math.floor(Math.random() * 90) + 1 :
                  status === 'HALFTIME' ? 45 :
                  status === 'FINISHED' ? 90 : 0;
    
    const predictions = [
      `Gana ${match.teams[0]}`,
      `Gana ${match.teams[1]}`,
      'Empate',
      'Más de 2.5 Goles',
      'Menos de 2.5 Goles',
      'Ambos Equipos Marcan'
    ];
    
    const myPrediction = predictions[Math.floor(Math.random() * predictions.length)];
    const bigMaster = Math.random() < 0.3; // 30% chance de ser Big Master
    
    return {
      id: idx + 1,
      match: `${match.teams[0]} vs ${match.teams[1]}`,
      league: match.league,
      status: status,
      minute: minute,
      score: score,
      myPrediction: {
        option: myPrediction,
        points: Math.floor(Math.random() * 50) + 30,
        bigMaster: bigMaster,
        multiplier: bigMaster ? ['2x', '2.5x', '3x'][Math.floor(Math.random() * 3)] : null,
        status: status === 'FINISHED' ? 
          (Math.random() < 0.7 ? 'WON' : 'LOST') : 
          (Math.random() < 0.5 ? 'WINNING' : 'LOSING')
      },
      canChange: status === 'HALFTIME',
      halftime: status === 'HALFTIME'
    };
  });
};

// Helpers
const getRandomAvatar = (position) => {
  if (position === 1) return '👑';
  if (position <= 3) return '🏆';
  if (position <= 10) return '⭐';
  if (position <= 20) return '🎯';
  return ['🔸', '🔹', '🔸', '🔹'][Math.floor(Math.random() * 4)];
};

const calculatePrize = (position, totalParticipants, prizePool) => {
  const percentage = (position / totalParticipants) * 100;
  
  if (position === 1) return Math.round(prizePool * 0.30); // 30% para el ganador
  if (percentage <= 5) return Math.round(prizePool * 0.20 / Math.ceil(totalParticipants * 0.05));
  if (percentage <= 10) return Math.round(prizePool * 0.25 / Math.ceil(totalParticipants * 0.05));
  if (percentage <= 15) return Math.round(prizePool * 0.25 / Math.ceil(totalParticipants * 0.05));
  
  return 0;
};

// Opciones para cambios de medio tiempo
export const getHalftimeOptions = (matchId, currentScore, myPrediction) => {
  const [homeScore, awayScore] = currentScore.split('-').map(Number);
  const totalGoals = homeScore + awayScore;
  
  const options = [];
  
  // Opciones basadas en el contexto actual del partido
  if (totalGoals >= 2) {
    options.push({
      option: 'Menos de 2.5 Goles',
      points: 58,
      odds: 2.40,
      reason: `Ya hay ${totalGoals} goles, menos probable que llegue a 3+`
    });
  }
  
  if (totalGoals === 0) {
    options.push({
      option: 'Más de 2.5 Goles',
      points: 45,
      odds: 2.15,
      reason: 'Partido sin goles, probable que se abra en el segundo tiempo'
    });
  }
  
  if (homeScore !== awayScore) {
    const losingTeam = homeScore > awayScore ? 'Visitante' : 'Local';
    options.push({
      option: `Gana ${losingTeam}`,
      points: 85,
      odds: 8.50,
      reason: 'Remontada épica, alto riesgo/recompensa'
    });
  }
  
  // Siempre incluir opción de empate final si no está empatado
  if (homeScore !== awayScore) {
    options.push({
      option: 'Empate Final',
      points: 71,
      odds: 4.20,
      reason: 'El equipo perdedor puede empatar'
    });
  }
  
  // Agregar opciones de tarjetas/córners para variedad
  options.push({
    option: 'Más de 8.5 Córners',
    points: 62,
    odds: 1.95,
    reason: 'Segundo tiempo suele tener más córners'
  });
  
  return options.slice(0, 4); // Máximo 4 opciones
};

// Simular actualizaciones en tiempo real
export const simulateLiveUpdate = (leaderboard) => {
  return leaderboard.map(player => {
    // Simular cambios pequeños en puntos
    const pointChange = Math.floor(Math.random() * 20 - 10);
    const newPoints = Math.max(0, player.points + pointChange);
    
    return {
      ...player,
      points: newPoints,
      change: pointChange,
      trend: pointChange > 5 ? 'up' : pointChange < -5 ? 'down' : 'same'
    };
  }).sort((a, b) => b.points - a.points).map((player, idx) => ({
    ...player,
    position: idx + 1,
    prize: calculatePrize(idx + 1, leaderboard.length, 2500)
  }));
};

// Predicciones disponibles para torneos
export const generateTournamentPredictions = (matchId) => {
  const matches = [
    {
      match: 'Real Madrid vs Barcelona',
      league: 'La Liga',
      time: '15:00',
      markets: [
        { id: 'rm_win', type: '1X2', option: 'Gana Real Madrid', odds: 2.10, probability: 47 },
        { id: 'draw', type: '1X2', option: 'Empate', odds: 3.20, probability: 31 },
        { id: 'bcn_win', type: '1X2', option: 'Gana Barcelona', odds: 3.40, probability: 29 },
        { id: 'over25', type: 'Goles', option: 'Más de 2.5 Goles', odds: 1.75, probability: 57 },
        { id: 'under25', type: 'Goles', option: 'Menos de 2.5 Goles', odds: 2.05, probability: 49 },
        { id: 'btts', type: 'BTTS', option: 'Ambos Marcan', odds: 1.65, probability: 61 }
      ]
    },
    {
      match: 'Manchester City vs Liverpool',
      league: 'Premier League',
      time: '17:30',
      markets: [
        { id: 'city_win', type: '1X2', option: 'Gana Man City', odds: 1.85, probability: 54 },
        { id: 'draw', type: '1X2', option: 'Empate', odds: 3.50, probability: 29 },
        { id: 'lfc_win', type: '1X2', option: 'Gana Liverpool', odds: 4.20, probability: 24 },
        { id: 'over25', type: 'Goles', option: 'Más de 2.5 Goles', odds: 1.55, probability: 65 },
        { id: 'under25', type: 'Goles', option: 'Menos de 2.5 Goles', odds: 2.40, probability: 42 }
      ]
    }
  ];
  
  return matches[matchId - 1]?.markets.map(market => ({
    ...market,
    points: Math.max(10, 100 - market.probability) // Fórmula PredicMaster
  })) || [];
};

export default {
  generateTournamentMockData,
  generateTournamentUserStats,
  generateLiveLeaderboard,
  generateLiveMatches,
  getHalftimeOptions,
  simulateLiveUpdate,
  generateTournamentPredictions
};