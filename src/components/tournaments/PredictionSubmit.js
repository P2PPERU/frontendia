import React, { useState, useEffect } from 'react';
import { Target, Clock, TrendingUp, AlertCircle, CheckCircle, Send, Zap, Brain, Star } from 'lucide-react';

const PredictionSubmit = ({ 
  match,
  onSubmit,
  loading = false,
  disabled = false,
  existingPrediction = null,
  showConfidence = true,
  showOdds = true,
  timeLimit = null,
  className = ''
}) => {
  const [selectedPrediction, setSelectedPrediction] = useState('');
  const [confidence, setConfidence] = useState(75);
  const [customPrediction, setCustomPrediction] = useState('');
  const [predictionType, setPredictionType] = useState('1X2');
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(!!existingPrediction);

  // Opciones de predicción según el tipo
  const predictionOptions = {
    '1X2': [
      { value: `Gana ${match.homeTeam}`, label: `Victoria ${match.homeTeam}`, odds: match.odds?.home || 2.1 },
      { value: 'Empate', label: 'Empate', odds: match.odds?.draw || 3.2 },
      { value: `Gana ${match.awayTeam}`, label: `Victoria ${match.awayTeam}`, odds: match.odds?.away || 2.8 }
    ],
    'OVER_UNDER': [
      { value: 'Más de 2.5 goles', label: 'Más de 2.5 goles', odds: match.odds?.over25 || 1.8 },
      { value: 'Menos de 2.5 goles', label: 'Menos de 2.5 goles', odds: match.odds?.under25 || 1.9 },
      { value: 'Más de 1.5 goles', label: 'Más de 1.5 goles', odds: match.odds?.over15 || 1.3 },
      { value: 'Menos de 1.5 goles', label: 'Menos de 1.5 goles', odds: match.odds?.under15 || 3.1 }
    ],
    'BTTS': [
      { value: 'Ambos equipos marcan', label: 'Ambos marcan', odds: match.odds?.bttsYes || 1.7 },
      { value: 'Al menos un equipo no marca', label: 'Uno no marca', odds: match.odds?.bttsNo || 2.0 }
    ],
    'CUSTOM': []
  };

  // Calcular puntos estimados
  const calculateEstimatedPoints = () => {
    if (!selectedPrediction && !customPrediction) return 0;
    
    const option = predictionOptions[predictionType]?.find(opt => opt.value === selectedPrediction);
    const odds = option?.odds || 2.0;
    const impliedProbability = (1 / odds) * 100;
    const probabilityBonus = Math.max(0, 100 - impliedProbability);
    const confidenceMultiplier = confidence / 100;
    const typeMultiplier = {
      '1X2': 1.0,
      'OVER_UNDER': 1.1,
      'BTTS': 1.2,
      'CUSTOM': 1.3
    }[predictionType] || 1.0;
    
    const basePoints = probabilityBonus * confidenceMultiplier * typeMultiplier;
    return Math.round(basePoints);
  };

  // Verificar si la predicción es válida
  const isValidPrediction = () => {
    if (predictionType === 'CUSTOM') {
      return customPrediction.trim().length >= 10;
    }
    return selectedPrediction.length > 0;
  };

  // Manejar envío
  const handleSubmit = async () => {
    if (!isValidPrediction()) {
      setError('Selecciona una predicción válida');
      return;
    }

    if (confidence < 50) {
      setError('La confianza mínima es 50%');
      return;
    }

    setError('');

    const predictionData = {
      matchId: match.id,
      prediction: predictionType === 'CUSTOM' ? customPrediction : selectedPrediction,
      predictionType,
      confidence,
      odds: predictionType === 'CUSTOM' ? 2.0 : 
            predictionOptions[predictionType]?.find(opt => opt.value === selectedPrediction)?.odds || 2.0
    };

    try {
      await onSubmit(predictionData);
      setIsSubmitted(true);
    } catch (err) {
      setError(err.message || 'Error al enviar predicción');
    }
  };

  // Verificar si el tiempo se agotó
  const isTimeExpired = () => {
    if (!timeLimit) return false;
    return new Date() > new Date(timeLimit);
  };

  // Si ya envió predicción
  if (isSubmitted && existingPrediction) {
    return (
      <div className={`bg-green-50 border border-green-200 rounded-2xl p-6 ${className}`}>
        <div className="flex items-center justify-center mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        
        <div className="text-center">
          <h3 className="text-lg font-bold text-green-800 mb-2">
            ¡Predicción Enviada!
          </h3>
          
          <div className="bg-white rounded-xl p-4 mb-4">
            <div className="text-sm text-gray-600 mb-1">Tu predicción:</div>
            <div className="font-bold text-gray-800">{existingPrediction.prediction}</div>
            
            <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
              <div>
                <span className="text-gray-600">Confianza:</span>
                <span className="font-bold text-gray-800 ml-1">{existingPrediction.confidence}%</span>
              </div>
              <div>
                <span className="text-gray-600">Puntos:</span>
                <span className="font-bold text-blue-600 ml-1">{existingPrediction.points || 0}</span>
              </div>
            </div>
          </div>
          
          <div className="text-sm text-green-700">
            ¡Buena suerte! Los resultados se actualizarán automáticamente.
          </div>
        </div>
      </div>
    );
  }

  // Si el tiempo expiró
  if (isTimeExpired()) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-2xl p-6 ${className}`}>
        <div className="flex items-center justify-center mb-4">
          <Clock className="w-8 h-8 text-red-600" />
        </div>
        
        <div className="text-center">
          <h3 className="text-lg font-bold text-red-800 mb-2">
            Tiempo Agotado
          </h3>
          <p className="text-sm text-red-700">
            El tiempo para enviar predicciones ha expirado para este partido.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-2xl p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Target className="w-6 h-6 text-blue-600 mr-2" />
          <h3 className="text-lg font-bold text-gray-800">Enviar Predicción</h3>
        </div>
        
        {timeLimit && (
          <div className="flex items-center text-sm text-orange-600">
            <Clock className="w-4 h-4 mr-1" />
            Hasta {new Date(timeLimit).toLocaleTimeString('es-PE', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        )}
      </div>

      {/* Match info */}
      <div className="bg-gray-50 rounded-xl p-4 mb-6">
        <div className="text-center">
          <h4 className="font-bold text-gray-800 text-lg mb-1">
            {match.homeTeam} vs {match.awayTeam}
          </h4>
          <div className="text-sm text-gray-600">
            {match.league} • {new Date(match.startTime).toLocaleString('es-PE')}
          </div>
        </div>
      </div>

      {/* Tipo de predicción */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tipo de Predicción
        </label>
        <div className="grid grid-cols-2 gap-2">
          {Object.keys(predictionOptions).map((type) => (
            <button
              key={type}
              onClick={() => {
                setPredictionType(type);
                setSelectedPrediction('');
                setCustomPrediction('');
              }}
              className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                predictionType === type
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
              }`}
            >
              {type === '1X2' ? 'Resultado' :
               type === 'OVER_UNDER' ? 'Goles' :
               type === 'BTTS' ? 'Ambos Marcan' :
               'Personalizada'}
            </button>
          ))}
        </div>
      </div>

      {/* Opciones de predicción */}
      {predictionType !== 'CUSTOM' ? (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Selecciona tu predicción
          </label>
          <div className="space-y-2">
            {predictionOptions[predictionType]?.map((option, index) => (
              <button
                key={index}
                onClick={() => setSelectedPrediction(option.value)}
                className={`w-full p-4 rounded-xl border text-left transition-all ${
                  selectedPrediction === option.value
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : 'bg-white border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{option.label}</span>
                  {showOdds && (
                    <div className="flex items-center">
                      <span className="text-sm text-gray-600 mr-2">Cuota:</span>
                      <span className="font-bold text-green-600">{option.odds}</span>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Escribe tu predicción personalizada
          </label>
          <textarea
            value={customPrediction}
            onChange={(e) => setCustomPrediction(e.target.value)}
            placeholder="Ej: El partido terminará 2-1 con gol de último minuto..."
            className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            rows={3}
            minLength={10}
            maxLength={200}
          />
          <div className="text-xs text-gray-500 mt-1">
            {customPrediction.length}/200 caracteres (mínimo 10)
          </div>
        </div>
      )}

      {/* Confianza */}
      {showConfidence && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nivel de Confianza: {confidence}%
          </label>
          <div className="relative">
            <input
              type="range"
              min="50"
              max="100"
              value={confidence}
              onChange={(e) => setConfidence(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>50% (Mínimo)</span>
              <span>75% (Recomendado)</span>
              <span>100% (Máximo)</span>
            </div>
          </div>
          
          {/* Indicador visual de confianza */}
          <div className="mt-3 p-3 bg-gray-50 rounded-xl">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <Brain className="w-4 h-4 text-blue-600 mr-2" />
                <span className="text-gray-700">Puntos estimados:</span>
              </div>
              <div className="flex items-center">
                <span className="font-bold text-blue-600 text-lg mr-1">
                  {calculateEstimatedPoints()}
                </span>
                <Star className="w-4 h-4 text-yellow-500" />
              </div>
            </div>
            
            <div className="mt-2 text-xs text-gray-600">
              Basado en cuotas, confianza y tipo de predicción
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Botón de envío */}
      <button
        onClick={handleSubmit}
        disabled={disabled || loading || !isValidPrediction()}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-4 rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {loading ? (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
        ) : (
          <>
            <Send className="w-5 h-5 mr-2" />
            Enviar Predicción
            {calculateEstimatedPoints() > 0 && (
              <span className="ml-2 bg-white/20 px-2 py-1 rounded-full text-sm">
                +{calculateEstimatedPoints()} pts
              </span>
            )}
          </>
        )}
      </button>

      {/* Consejos */}
      <div className="mt-4 p-3 bg-blue-50 rounded-xl">
        <div className="flex items-start">
          <Zap className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <div className="font-medium mb-1">Consejos para maximizar puntos:</div>
            <ul className="text-xs space-y-1 text-blue-700">
              <li>• Mayor confianza = más puntos si aciertas</li>
              <li>• Predicciones con cuotas altas dan más puntos</li>
              <li>• Las predicciones personalizadas tienen bonus extra</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictionSubmit;