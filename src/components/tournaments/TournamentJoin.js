import React, { useState, useEffect } from 'react';
import { ArrowLeft, Star, Target, Zap, Crown, Users, DollarSign, Clock, Trophy, AlertCircle, CheckCircle, Flame, Brain, Shield, Sword } from 'lucide-react';

const TournamentJoin = ({ tournament, onBack }) => {
  const [selectedPredictions, setSelectedPredictions] = useState({});
  const [bigMasterChoice, setBigMasterChoice] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [totalPoints, setTotalPoints] = useState(0);
  const [showBigMasterModal, setShowBigMasterModal] = useState(false);
  const [joinConfirmation, setJoinConfirmation] = useState(false);

  // Predicciones disponibles para el torneo
  const tournamentMatches = [
    {
      id: 1,
      match: 'Real Madrid vs Barcelona',
      league: 'La Liga',
      time: '15:00',
      markets: [
        { id: '1x2_home', type: '1X2', option: 'Gana Real Madrid', odds: 2.10, probability: 47, points: 53 },
        { id: '1x2_draw', type: '1X2', option: 'Empate', odds: 3.20, probability: 31, points: 69 },
        { id: '1x2_away', type: '1X2', option: 'Gana Barcelona', odds: 3.40, probability: 29, points: 71 },
        { id: 'over25', type: 'Goles', option: 'Más de 2.5 Goles', odds: 1.75, probability: 57, points: 43 },
        { id: 'under25', type: 'Goles', option: 'Menos de 2.5 Goles', odds: 2.05, probability: 49, points: 51 },
        { id: 'btts_yes', type: 'BTTS', option: 'Ambos Marcan', odds: 1.65, probability: 61, points: 39 }
      ]
    },
    {
      id: 2,
      match: 'Manchester City vs Liverpool',
      league: 'Premier League',
      time: '17:30',
      markets: [
        { id: '1x2_home', type: '1X2', option: 'Gana Man City', odds: 1.85, probability: 54, points: 46 },
        { id: '1x2_draw', type: '1X2', option: 'Empate', odds: 3.50, probability: 29, points: 71 },
        { id: '1x2_away', type: '1X2', option: 'Gana Liverpool', odds: 4.20, probability: 24, points: 76 },
        { id: 'over25', type: 'Goles', option: 'Más de 2.5 Goles', odds: 1.55, probability: 65, points: 35 },
        { id: 'under25', type: 'Goles', option: 'Menos de 2.5 Goles', odds: 2.40, probability: 42, points: 58 }
      ]
    },
    {
      id: 3,
      match: 'PSG vs Bayern Munich',
      league: 'Champions League',
      time: '20:00',
      markets: [
        { id: '1x2_home', type: '1X2', option: 'Gana PSG', odds: 2.30, probability: 43, points: 57 },
        { id: '1x2_draw', type: '1X2', option: 'Empate', odds: 3.10, probability: 32, points: 68 },
        { id: '1x2_away', type: '1X2', option: 'Gana Bayern', odds: 2.80, probability: 36, points: 64 },
        { id: 'over35', type: 'Goles', option: 'Más de 3.5 Goles', odds: 2.60, probability: 38, points: 62 },
        { id: 'btts_yes', type: 'BTTS', option: 'Ambos Marcan', odds: 1.45, probability: 69, points: 31 }
      ]
    },
    {
      id: 4,
      match: 'Universitario vs Alianza Lima',
      league: 'Liga 1 Perú',
      time: '19:00',
      markets: [
        { id: '1x2_home', type: '1X2', option: 'Gana Universitario', odds: 1.95, probability: 51, points: 49 },
        { id: '1x2_draw', type: '1X2', option: 'Empate', odds: 2.90, probability: 34, points: 66 },
        { id: '1x2_away', type: '1X2', option: 'Gana Alianza', odds: 3.80, probability: 26, points: 74 },
        { id: 'under25', type: 'Goles', option: 'Menos de 2.5 Goles', odds: 1.70, probability: 59, points: 41 }
      ]
    }
  ];

  const bigMasterMultipliers = {
    '1.5x': { multiplier: 1.5, risk: 'Bajo', penalty: -10, color: 'bg-green-500' },
    '2x': { multiplier: 2.0, risk: 'Medio', penalty: -25, color: 'bg-yellow-500' },
    '2.5x': { multiplier: 2.5, risk: 'Alto', penalty: -40, color: 'bg-orange-500' },
    '3x': { multiplier: 3.0, risk: 'Extremo', penalty: -60, color: 'bg-red-500' }
  };

  // Calcular puntos totales
  useEffect(() => {
    const selectedKeys = Object.keys(selectedPredictions);
    let points = 0;
    
    selectedKeys.forEach(key => {
      const prediction = selectedPredictions[key];
      if (prediction) {
        points += prediction.points;
      }
    });
    
    setTotalPoints(points);
  }, [selectedPredictions]);

  const handlePredictionSelect = (matchId, prediction) => {
    setSelectedPredictions(prev => ({
      ...prev,
      [matchId]: prediction
    }));
  };

  const handleBigMasterSelect = (matchId, multiplier) => {
    setBigMasterChoice({ matchId, multiplier });
    setShowBigMasterModal(false);
  };

  const getPointsColor = (points) => {
    if (points >= 70) return 'text-red-600 font-bold';
    if (points >= 60) return 'text-orange-600 font-bold'; 
    if (points >= 50) return 'text-yellow-600 font-bold';
    return 'text-green-600';
  };

  const canProceed = () => {
    return Object.keys(selectedPredictions).length === tournamentMatches.length;
  };

  const BigMasterModal = () => (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <div className="text-center mb-6">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">¡Elige tu Big Master!</h2>
          <p className="text-gray-600">Multiplica los puntos de UNA predicción, pero cuidado con el riesgo</p>
        </div>

        <div className="space-y-3 mb-6">
          {Object.entries(bigMasterMultipliers).map(([key, data]) => (
            <button
              key={key}
              onClick={() => handleBigMasterSelect(bigMasterChoice?.matchId, key)}
              className={`w-full p-4 rounded-xl border-2 transition-all hover:shadow-lg ${data.color} text-white`}
            >
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <div className="text-lg font-bold">{key} Multiplicador</div>
                  <div className="text-sm opacity-90">Riesgo {data.risk}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm">Si falla:</div>
                  <div className="font-bold">{data.penalty} puntos</div>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setShowBigMasterModal(false)}
            className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-bold"
          >
            Cancelar
          </button>
          <button
            onClick={() => setBigMasterChoice(null)}
            className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold"
          >
            Sin Big Master
          </button>
        </div>
      </div>
    </div>
  );

  const PredictionStep = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <div className="flex items-center mb-2">
          <Brain className="w-5 h-5 text-blue-600 mr-2" />
          <span className="font-bold text-blue-800">Sistema de Puntuación Inteligente</span>
        </div>
        <p className="text-sm text-blue-700">
          <strong>Puntos = 100 - Probabilidad del mercado</strong><br/>
          Las predicciones más difíciles dan más puntos. ¡Busca el value!
        </p>
      </div>

      {tournamentMatches.map(match => (
        <div key={match.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-gray-800">{match.match}</h3>
              <div className="flex items-center text-sm text-gray-600">
                <span className="bg-gray-100 px-2 py-1 rounded mr-2">{match.league}</span>
                <Clock className="w-4 h-4 mr-1" />
                {match.time}
              </div>
            </div>
            
            {bigMasterChoice?.matchId === match.id && (
              <div className="flex items-center bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-lg">
                <Crown className="w-4 h-4 mr-1" />
                <span className="text-sm font-bold">BIG MASTER {bigMasterChoice.multiplier}</span>
              </div>
            )}
          </div>

          <div className="grid gap-2">
            {match.markets.map(market => {
              const isSelected = selectedPredictions[match.id]?.id === market.id;
              
              return (
                <button
                  key={market.id}
                  onClick={() => handlePredictionSelect(match.id, market)}
                  className={`p-3 rounded-lg border-2 transition-all text-left ${
                    isSelected 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded mr-2">
                          {market.type}
                        </span>
                        <span className="font-medium text-gray-800">{market.option}</span>
                      </div>
                      <div className="flex items-center mt-1 text-sm text-gray-600">
                        <span className="mr-3">Cuota: <strong>{market.odds}</strong></span>
                        <span>Prob: <strong>{market.probability}%</strong></span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`text-lg font-bold ${getPointsColor(market.points)}`}>
                        {market.points}
                      </div>
                      <div className="text-xs text-gray-500">puntos</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {selectedPredictions[match.id] && (
            <div className="mt-3 flex justify-between items-center">
              <span className="text-sm text-gray-600">Predicción seleccionada</span>
              <button
                onClick={() => {
                  setBigMasterChoice({ matchId: match.id });
                  setShowBigMasterModal(true);
                }}
                className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-lg text-sm font-bold hover:shadow-lg transition-all"
              >
                <Crown className="w-4 h-4 mr-1 inline" />
                Big Master
              </button>
            </div>
          )}
        </div>
      ))}

      <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Resumen de Tu Estrategia</h3>
          <div className="flex items-center">
            <Target className="w-5 h-5 mr-2" />
            <span className="text-xl font-bold">{totalPoints} puntos base</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <div className="text-lg font-bold">{Object.keys(selectedPredictions).length}/4</div>
            <div className="text-sm text-gray-300">Predicciones</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <div className="text-lg font-bold">
              {bigMasterChoice ? bigMasterChoice.multiplier : 'No'}
            </div>
            <div className="text-sm text-gray-300">Big Master</div>
          </div>
        </div>

        {bigMasterChoice && (
          <div className="bg-orange-500/20 border border-orange-500/30 rounded-lg p-3 mb-4">
            <div className="flex items-center mb-1">
              <Flame className="w-4 h-4 mr-2 text-orange-300" />
              <span className="font-bold text-orange-300">Big Master Activado</span>
            </div>
            <p className="text-sm text-orange-100">
              {selectedPredictions[bigMasterChoice.matchId]?.option} será multiplicado por {bigMasterChoice.multiplier}
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const ConfirmationStep = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg border-2 border-green-200 p-6">
        <div className="text-center mb-6">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">¡Listo para Competir!</h2>
          <p className="text-gray-600">Revisa tu estrategia antes de unirte al torneo</p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex justify-between items-center">
            <span>Torneo:</span>
            <span className="font-bold">{tournament.name}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Entry Fee:</span>
            <span className="font-bold text-red-600">S/ {tournament.entryFee}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Premio Total:</span>
            <span className="font-bold text-green-600">S/ {tournament.prizePool.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Jugadores:</span>
            <span className="font-bold">{tournament.participants}/{tournament.maxParticipants}</span>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <h3 className="font-bold text-gray-800 mb-3">Tus Predicciones:</h3>
          <div className="space-y-2">
            {Object.entries(selectedPredictions).map(([matchId, prediction]) => (
              <div key={matchId} className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  {tournamentMatches.find(m => m.id == matchId)?.match}
                </span>
                <div className="flex items-center">
                  <span className="text-sm font-medium mr-2">{prediction.option}</span>
                  <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                    {prediction.points} pts
                  </span>
                  {bigMasterChoice?.matchId == matchId && (
                    <Crown className="w-4 h-4 text-orange-500 ml-1" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <label className="flex items-center mb-6">
          <input
            type="checkbox"
            checked={joinConfirmation}
            onChange={(e) => setJoinConfirmation(e.target.checked)}
            className="mr-2"
          />
          <span className="text-sm text-gray-700">
            Acepto los términos del torneo y confirmo mi participación
          </span>
        </label>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-lg">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="text-center flex-1">
            <h1 className="font-bold text-lg">Unirse a Torneo</h1>
            <p className="text-sm text-blue-100">Paso {currentStep} de 2</p>
          </div>
          <div className="w-10"></div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="w-full bg-white/20 rounded-full h-2">
            <div 
              className="bg-white h-2 rounded-full transition-all duration-500"
              style={{ width: `${(currentStep / 2) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {currentStep === 1 && <PredictionStep />}
        {currentStep === 2 && <ConfirmationStep />}
      </div>

      {/* Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
        <div className="flex gap-3">
          {currentStep > 1 && (
            <button
              onClick={() => setCurrentStep(currentStep - 1)}
              className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-bold"
            >
              Anterior
            </button>
          )}
          
          <button
            onClick={() => {
              if (currentStep === 1 && canProceed()) {
                setCurrentStep(2);
              } else if (currentStep === 2 && joinConfirmation) {
                alert('¡Inscrito exitosamente al torneo!');
                onBack();
              }
            }}
            disabled={
              (currentStep === 1 && !canProceed()) || 
              (currentStep === 2 && !joinConfirmation)
            }
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentStep === 1 ? 'Continuar' : `Pagar S/ ${tournament.entryFee}`}
          </button>
        </div>
      </div>

      {showBigMasterModal && <BigMasterModal />}
    </div>
  );
};

export default TournamentJoin;