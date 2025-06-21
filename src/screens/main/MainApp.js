import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, TrendingUp, Target, Clock, Home, BarChart3, Trophy, User, Check, Star, Brain, Zap, Calendar, RefreshCw, Lock, Video, Gift, AlertCircle, X, WifiOff, LogOut, ChevronDown, ChevronLeft } from 'lucide-react';
import predictionsService from '../../services/api/predictions';
import authService from '../../services/api/auth';
import { APP_CONFIG } from '../../utils/constants';

// Componente para selector de fechas
const DateSelector = ({ selectedDate, onDateChange, availableDates }) => {
  const [showDatePicker, setShowDatePicker] = useState(false);

  const formatDisplayDate = (date) => {
    return new Date(date).toLocaleDateString('es-PE', { 
      day: 'numeric', 
      month: 'short' 
    });
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDatePicker(!showDatePicker)}
        className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 text-white"
      >
        <Calendar className="w-4 h-4" />
        <span className="text-sm font-medium">{formatDisplayDate(selectedDate)}</span>
        <ChevronDown className="w-4 h-4" />
      </button>

      {showDatePicker && (
        <div className="absolute top-full mt-2 right-0 bg-white rounded-lg shadow-xl border border-gray-200 z-50 min-w-48">
          <div className="p-2">
            <div className="text-sm font-medium text-gray-700 px-3 py-2 border-b border-gray-100">
              Fechas Disponibles
            </div>
            <div className="max-h-48 overflow-y-auto">
              {availableDates.map((date) => (
                <button
                  key={date}
                  onClick={() => {
                    onDateChange(date);
                    setShowDatePicker(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded transition-colors ${
                    date === selectedDate ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'
                  }`}
                >
                  {new Date(date).toLocaleDateString('es-PE', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long'
                  })}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const MainApp = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('home');
  const [predictions, setPredictions] = useState([]);
  const [allPredictions, setAllPredictions] = useState([]); // Para histórico
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [freeViewsLeft, setFreeViewsLeft] = useState(0);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPrediction, setSelectedPrediction] = useState(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState('');
  const [realStats, setRealStats] = useState({
    accuracy: 0,
    avgOdds: 0,
    totalPredictions: 0,
    wonPredictions: 0,
    lostPredictions: 0,
    pendingPredictions: 0
  });

  // Verificar autenticación
  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user || !authService.isAuthenticated()) {
      navigate('/login', { replace: true });
    } else {
      setUserData(user);
      setIsPremium(user?.isPremium || false);
    }
  }, []);

  // Detector de conexión
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Cargar predicciones por fecha
  const loadPredictionsByDate = useCallback(async (date) => {
    setLoading(true);
    setError('');
    
    try {
      const result = await predictionsService.getPredictionsByDate(date);
      
      if (result.success) {
        const datePredictions = result.predictions || [];
        setPredictions(datePredictions);
        setFreeViewsLeft(result.freeViewsLeft || 0);
        setIsPremium(result.isPremium || false);
        
        // Calcular estadísticas reales para la fecha seleccionada
        const stats = calculateRealStats(datePredictions);
        setRealStats(stats);
        
        if (result.cached) {
          setError('Mostrando predicciones guardadas. Conecta a internet para actualizar.');
        }
      } else {
        setError(result.message || 'Error al cargar predicciones');
      }
    } catch (error) {
      setError('Error de conexión. Verifica tu internet.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Cargar fechas disponibles y predicciones iniciales
  const loadInitialData = useCallback(async () => {
    try {
      // Cargar fechas disponibles (últimos 30 días con predicciones)
      const datesResult = await predictionsService.getAvailableDates();
      if (datesResult.success) {
        const dates = datesResult.dates || [];
        setAvailableDates(dates);
        
        // Si no hay predicciones para hoy, seleccionar la fecha más reciente
        const today = new Date().toISOString().split('T')[0];
        const dateToLoad = dates.includes(today) ? today : (dates[0] || today);
        setSelectedDate(dateToLoad);
        
        // Cargar predicciones para la fecha seleccionada
        await loadPredictionsByDate(dateToLoad);
      } else {
        // Fallback: cargar predicciones de hoy
        await loadPredictionsByDate(selectedDate);
      }
    } catch (error) {
      setError('Error al cargar datos iniciales');
      setLoading(false);
    }
  }, [loadPredictionsByDate, selectedDate]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Cargar predicciones cuando cambie la fecha
  useEffect(() => {
    if (selectedDate && availableDates.includes(selectedDate)) {
      loadPredictionsByDate(selectedDate);
    }
  }, [selectedDate, loadPredictionsByDate, availableDates]);

  // Calcular estadísticas reales
  const calculateRealStats = (predictionsList) => {
    const total = predictionsList.length;
    const completed = predictionsList.filter(p => p.result === 'WON' || p.result === 'LOST');
    const won = predictionsList.filter(p => p.result === 'WON').length;
    const lost = predictionsList.filter(p => p.result === 'LOST').length;
    const pending = predictionsList.filter(p => p.result === 'PENDING' || !p.result).length;
    
    const accuracy = completed.length > 0 ? Math.round((won / completed.length) * 100) : 0;
    const avgOdds = total > 0 ? (predictionsList.reduce((sum, p) => sum + (p.odds || 0), 0) / total) : 0;
    
    return {
      accuracy,
      avgOdds: parseFloat(avgOdds.toFixed(2)),
      totalPredictions: total,
      wonPredictions: won,
      lostPredictions: lost,
      pendingPredictions: pending
    };
  };

  // Auto-rotate carousel
  useEffect(() => {
    const resultsToShow = predictions.filter(p => p.result !== null && p.result !== 'PENDING');
    if (resultsToShow.length > 0) {
      const interval = setInterval(() => {
        setCarouselIndex((prev) => (prev + 1) % resultsToShow.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [predictions]);

  // Pull to refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPredictionsByDate(selectedDate);
  };

  // Manejar cambio de fecha
  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
  };

  // Manejar click en predicción
  const handlePredictionClick = async (pred) => {
    // Si no es premium o ya está desbloqueada, no hacer nada
    if (!pred.isPremium || isPremium || !pred.locked || pred.unlocked) {
      return;
    }
    
    // Si tiene vistas gratis
    if (freeViewsLeft > 0) {
      setSelectedPrediction(pred);
      setShowVideoModal(true);
    } else {
      setShowPaymentModal(true);
    }
  };

  // Desbloquear predicción
  const unlockPrediction = async () => {
    if (!selectedPrediction) return;
    
    setShowVideoModal(false);
    
    try {
      const result = await predictionsService.unlockPrediction(selectedPrediction.id);
      
      if (result.success) {
        // Actualizar predicción con datos desbloqueados según tu backend
        setPredictions(prevPredictions => 
          prevPredictions.map(p => 
            p.id === selectedPrediction.id 
              ? { 
                  ...p, 
                  ...result.prediction,
                  locked: false, 
                  unlocked: true,
                  // Tu backend devuelve la predicción completa desbloqueada
                  prediction: result.prediction.prediction,
                  confidence: result.prediction.confidence,
                  odds: result.prediction.odds
                }
              : p
          )
        );
        
        setFreeViewsLeft(result.freeViewsLeft);
        
        // Limpiar selección
        setSelectedPrediction(null);
      } else {
        alert(result.message || 'Error al desbloquear predicción');
        
        if (result.requiresPremium) {
          setShowPaymentModal(true);
        }
      }
    } catch (error) {
      alert('Error de conexión. Verifica tu internet.');
    }
  };

  // Cerrar sesión
  const handleLogout = () => {
    if (window.confirm('¿Estás seguro de cerrar sesión?')) {
      authService.logout();
    }
  };

  const VideoModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-bold text-gray-800">Ver Video para Desbloquear</h3>
          <button onClick={() => setShowVideoModal(false)}>
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        <div className="bg-gray-100 rounded-xl p-8 mb-4 flex flex-col items-center">
          <Video className="w-12 h-12 text-gray-400 mb-2" />
          <p className="text-sm text-gray-600 text-center">Mira un video de 30 segundos para desbloquear esta predicción</p>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-600">Desbloqueos restantes hoy:</span>
          <span className="font-bold text-blue-600">{freeViewsLeft}</span>
        </div>
        
        <button 
          onClick={unlockPrediction}
          className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl flex items-center justify-center"
        >
          <Video className="w-5 h-5 mr-2" />
          Ver Video Ahora
        </button>
      </div>
    </div>
  );

  const PaymentModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-bold text-gray-800">Hazte Premium</h3>
          <button onClick={() => setShowPaymentModal(false)}>
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        <div className="text-center mb-6">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-10 h-10 text-white" />
          </div>
          <p className="text-gray-600 mb-4">Accede a todas las predicciones premium sin límites</p>
          
          <div className="bg-blue-50 rounded-xl p-4 mb-4">
            <div className="text-3xl font-bold text-blue-600 mb-1">{APP_CONFIG.CURRENCY} {APP_CONFIG.PREMIUM_PRICE.toFixed(2)}</div>
            <div className="text-sm text-gray-600">por semana</div>
          </div>
        </div>
        
        <div className="space-y-2 mb-6">
          {[
            "✅ Todas las predicciones premium",
            "✅ Sin anuncios ni videos",
            "✅ Alertas en tiempo real",
            "✅ Soporte prioritario"
          ].map((feature, idx) => (
            <div key={idx} className="text-sm text-gray-700">{feature}</div>
          ))}
        </div>
        
        <button 
          onClick={() => navigate('/premium')}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 rounded-xl mb-3"
        >
          Pagar con Yape / Plin
        </button>
        
        <button 
          onClick={() => navigate('/premium')}
          className="w-full bg-gray-100 text-gray-600 font-medium py-3 rounded-xl"
        >
          Otros Métodos de Pago
        </button>
      </div>
    </div>
  );

  const HomeScreen = () => {
    const resultsToShow = predictions.filter(p => p.result !== null && p.result !== 'PENDING');
    const isToday = selectedDate === new Date().toISOString().split('T')[0];

    return (
      <div className="pb-20">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 pt-12 pb-8 rounded-b-3xl shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">{APP_CONFIG.APP_NAME}</h1>
              <p className="text-blue-100 text-sm">Predicciones Inteligentes</p>
            </div>
            <div className="flex items-center gap-3">
              {!isOnline && (
                <div className="bg-red-500 rounded-full p-2">
                  <WifiOff className="w-5 h-5 text-white" />
                </div>
              )}
              <DateSelector 
                selectedDate={selectedDate}
                onDateChange={handleDateChange}
                availableDates={availableDates}
              />
            </div>
          </div>

          {/* Stats Cards - CON DATOS REALES */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <Target className="w-5 h-5 text-white/80" />
                <span className="text-xs text-white/80">Precisión</span>
              </div>
              <div className="text-2xl font-bold text-white">{realStats.accuracy}%</div>
              <div className={`text-xs mt-1 ${realStats.accuracy >= 80 ? 'text-green-300' : realStats.accuracy >= 60 ? 'text-yellow-300' : 'text-red-300'}`}>
                {realStats.totalPredictions > 0 ? `${realStats.wonPredictions}/${realStats.totalPredictions} acertadas` : 'Sin datos'}
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-5 h-5 text-white/80" />
                <span className="text-xs text-white/80">Cuota Media</span>
              </div>
              <div className="text-2xl font-bold text-white">{realStats.avgOdds || '0.00'}</div>
              <div className="text-xs text-yellow-300 mt-1">
                {realStats.avgOdds > 1.8 ? 'Alto valor' : realStats.avgOdds > 1.5 ? 'Valor medio' : 'Valor bajo'}
              </div>
            </div>
          </div>
        </div>

        {/* Results Carousel */}
        {resultsToShow.length > 0 && (
          <div className="mx-4 mt-4 mb-2">
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-4 shadow-lg overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-white">🔥 Resultados en Vivo</h3>
                <div className="flex gap-1">
                  {resultsToShow.map((_, idx) => (
                    <div
                      key={idx}
                      className={`w-1.5 h-1.5 rounded-full transition-all ${
                        idx === carouselIndex ? 'bg-white w-4' : 'bg-white/40'
                      }`}
                    />
                  ))}
                </div>
              </div>
              
              <div className="relative h-20">
                {resultsToShow.map((pred, idx) => (
                  <div
                    key={pred.id}
                    className={`absolute inset-0 transition-all duration-500 ${
                      idx === carouselIndex ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-2xl ${pred.result === 'WON' ? '✅' : '❌'}`}>
                            {pred.result === 'WON' ? '✅' : '❌'}
                          </span>
                          <span className={`text-sm font-bold ${pred.result === 'WON' ? 'text-green-400' : 'text-red-400'}`}>
                            {pred.result === 'WON' ? 'ACERTADO' : 'FALLADO'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-300">{pred.match}</p>
                        <p className="text-xs text-white font-medium">{pred.prediction}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-yellow-400">{pred.odds}</div>
                        <div className="text-xs text-gray-400">cuota</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Error/Offline message */}
        {error && (
          <div className="mx-4 mt-4 bg-yellow-50 border border-yellow-200 rounded-xl p-3 flex items-center">
            <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0" />
            <span className="text-sm text-yellow-800">{error}</span>
          </div>
        )}

        {/* User Status Bar */}
        {!isPremium && isToday && (
          <div className="mx-4 mt-4 bg-orange-50 border border-orange-200 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center">
              <Gift className="w-5 h-5 text-orange-600 mr-2" />
              <span className="text-sm text-orange-800">
                {freeViewsLeft > 0 ? `${freeViewsLeft} desbloqueos gratis hoy` : 'Sin desbloqueos gratis'}
              </span>
            </div>
            <button 
              onClick={() => setShowPaymentModal(true)}
              className="text-sm font-bold text-orange-600"
            >
              Hazte Premium
            </button>
          </div>
        )}

        {/* Today's Date & Refresh */}
        <div className="flex items-center justify-between px-4 mt-6 mb-4">
          <h2 className="text-lg font-bold text-gray-800">
            Predicciones de {isToday ? 'Hoy' : new Date(selectedDate).toLocaleDateString('es-PE', { day: 'numeric', month: 'long' })}
          </h2>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing || !isOnline}
              className={`p-2 rounded-lg ${refreshing ? 'animate-spin' : ''} ${!isOnline ? 'opacity-50' : ''}`}
            >
              <RefreshCw className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Predictions List */}
        <div className="px-4 space-y-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
          ) : predictions.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No hay predicciones para esta fecha</p>
              <button 
                onClick={handleRefresh}
                className="mt-4 text-blue-600 font-medium"
              >
                Intentar de nuevo
              </button>
            </div>
          ) : (
            predictions.map((pred) => {
              // Tu backend maneja locked/unlocked directamente
              const isUnlocked = !pred.locked || pred.unlocked || !pred.isPremium || isPremium;
              const isLocked = pred.locked && pred.isPremium && !isPremium && !pred.unlocked;
              
              return (
                <div 
                  key={pred.id} 
                  onClick={() => isToday && handlePredictionClick(pred)}
                  className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transform transition-all ${isLocked && isToday ? 'cursor-pointer active:scale-95' : ''}`}
                >
                  {pred.isHot && (
                    <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-3 py-1 flex items-center justify-between">
                      <div className="flex items-center">
                        <Zap className="w-3 h-3 mr-1" />
                        PREDICCIÓN CALIENTE 🔥
                      </div>
                      {pred.result && pred.result !== 'PENDING' && (
                        <span className={`font-bold ${pred.result === 'WON' ? 'text-green-300' : 'text-red-300'}`}>
                          {pred.result === 'WON' ? '✓ ACERTADO' : '✗ FALLADO'}
                        </span>
                      )}
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">{pred.league}</span>
                          {pred.result && pred.result !== 'PENDING' && !pred.isHot && (
                            <span className={`text-xs font-bold ${pred.result === 'WON' ? 'text-green-600' : 'text-red-600'}`}>
                              {pred.result === 'WON' ? '✓' : '✗'}
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-gray-800 mt-1">{pred.match}</h3>
                      </div>
                      <div className="text-right">
                        {isUnlocked ? (
                          <>
                            <div className="text-2xl font-bold text-green-600">{pred.odds}</div>
                            <div className="text-xs text-gray-500">cuota</div>
                          </>
                        ) : (
                          <Lock className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                    </div>

                    {isUnlocked ? (
                      <>
                        <div className="bg-blue-50 rounded-xl p-3 mb-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">Predicción:</span>
                            <span className="text-sm font-bold text-blue-600">{pred.prediction}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${pred.confidence >= 90 ? 'bg-green-500' : pred.confidence >= 85 ? 'bg-yellow-500' : 'bg-orange-500'}`}
                                style={{ width: `${pred.confidence}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-bold text-gray-700 ml-2">{pred.confidence}%</span>
                          </div>
                          <div className="flex items-center text-gray-500">
                            <Clock className="w-4 h-4 mr-1" />
                            <span className="text-sm">{pred.matchTime ? new Date(pred.matchTime).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }) : pred.time}</span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-center">
                        <div className="text-center">
                          <Lock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600 font-medium">
                            {isToday ? (freeViewsLeft > 0 ? 'Ver video para desbloquear' : 'Contenido Premium') : 'Contenido Premium'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Daily Summary */}
        {predictions.length > 0 && (
          <div className="mt-8 mx-4 bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-6 text-white">
            <h3 className="text-lg font-bold mb-4">
              Resumen del {isToday ? 'Día' : new Date(selectedDate).toLocaleDateString('es-PE', { day: 'numeric', month: 'long' })}
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{realStats.totalPredictions}</div>
                <div className="text-xs text-gray-400">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">
                  {predictions.filter(p => p.isHot).length}
                </div>
                <div className="text-xs text-gray-400">Calientes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {realStats.avgOdds || '0.00'}
                </div>
                <div className="text-xs text-gray-400">Cuota Avg</div>
              </div>
            </div>
            {realStats.totalPredictions > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-700">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-green-400">{realStats.wonPredictions}</div>
                    <div className="text-xs text-gray-400">Acertadas</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-red-400">{realStats.lostPredictions}</div>
                    <div className="text-xs text-gray-400">Falladas</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-yellow-400">{realStats.pendingPredictions}</div>
                    <div className="text-xs text-gray-400">Pendientes</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const StatsScreen = () => {
    const allStats = calculateRealStats(allPredictions);
    
    return (
      <div className="pb-20 px-4 pt-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Estadísticas</h1>
        
        {/* Today's Live Results */}
        {realStats.totalPredictions > 0 && (
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white mb-6">
            <h2 className="text-lg font-bold mb-4">
              Resultados del {selectedDate === new Date().toISOString().split('T')[0] ? 'Día' : new Date(selectedDate).toLocaleDateString('es-PE', { day: 'numeric', month: 'long' })}
            </h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold">{realStats.wonPredictions}</div>
                <div className="text-sm text-purple-100">Acertados</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{realStats.lostPredictions}</div>
                <div className="text-sm text-purple-100">Fallados</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{realStats.accuracy}%</div>
                <div className="text-sm text-purple-100">Precisión</div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/20">
              <div className="flex items-center justify-between">
                <span className="text-sm text-purple-100">Predicciones totales:</span>
                <span className="font-bold">{realStats.totalPredictions}</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-sm text-purple-100">Cuota promedio:</span>
                <span className="font-bold">{realStats.avgOdds}</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Stats by League */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Por Liga</h2>
          <div className="space-y-3">
            {Object.entries(predictionsService.groupByLeague(predictions)).map(([league, preds]) => {
              const leagueStats = predictionsService.calculateStats(preds);
              
              return (
                <div key={league} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="font-medium text-gray-800">{league}</p>
                    <p className="text-xs text-gray-500">{preds.length} predicciones</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">{leagueStats.accuracy}%</p>
                    <p className="text-xs text-gray-500">precisión</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Premium Upsell */}
        {!isPremium && (
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-6 text-white">
            <h3 className="text-lg font-bold mb-2">¿Quieres más estadísticas?</h3>
            <p className="text-sm mb-4">Accede a análisis detallados, histórico completo y predicciones exclusivas</p>
            <button 
              onClick={() => setShowPaymentModal(true)}
              className="bg-white text-orange-600 font-bold py-2 px-4 rounded-lg"
            >
              Hazte Premium
            </button>
          </div>
        )}
      </div>
    );
  };

  const PremiumScreen = () => (
    <div className="pb-20 px-4 pt-6">
      <div className="text-center mb-8">
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trophy className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Plan Premium</h1>
        <p className="text-gray-600">Acceso ilimitado a todas las predicciones</p>
      </div>

      {/* Pricing Card */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white mb-6">
        <div className="text-center mb-6">
          <div className="text-5xl font-bold mb-2">{APP_CONFIG.CURRENCY} {APP_CONFIG.PREMIUM_PRICE}</div>
          <div className="text-blue-100">por semana</div>
          <div className="text-xs text-blue-200 mt-2">Cancela cuando quieras</div>
        </div>
        
        <div className="space-y-3 mb-6">
          {[
            "✅ Todas las predicciones premium desbloqueadas",
            "✅ Sin anuncios ni videos obligatorios", 
            "✅ Alertas push de predicciones calientes",
            "✅ Historial completo de resultados",
            "✅ Soporte prioritario por WhatsApp"
          ].map((feature, idx) => (
            <div key={idx} className="text-sm text-white/90">{feature}</div>
          ))}
        </div>
        
        <button className="w-full bg-white text-blue-600 font-bold py-4 rounded-xl mb-3">
          Pagar con Yape
        </button>
        <button className="w-full bg-white/20 backdrop-blur text-white font-bold py-4 rounded-xl">
          Pagar con Plin
        </button>
      </div>

      {/* Payment Methods */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Métodos de Pago</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { name: 'Yape', icon: '📱' },
            { name: 'Plin', icon: '💳' },
            { name: 'BCP', icon: '🏦' },
            { name: 'Interbank', icon: '🏪' }
          ].map((method, idx) => (
            <div key={idx} className="border border-gray-200 rounded-xl p-4 text-center">
              <div className="text-2xl mb-1">{method.icon}</div>
              <div className="text-sm font-medium text-gray-700">{method.name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-gray-50 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Preguntas Frecuentes</h2>
        <div className="space-y-3">
          <div>
            <h3 className="font-medium text-gray-800 mb-1">¿Cómo funciona?</h3>
            <p className="text-sm text-gray-600">Pagas {APP_CONFIG.CURRENCY}{APP_CONFIG.PREMIUM_PRICE} semanales y obtienes acceso ilimitado a todas las predicciones premium sin ver videos.</p>
          </div>
          <div>
            <h3 className="font-medium text-gray-800 mb-1">¿Puedo cancelar?</h3>
            <p className="text-sm text-gray-600">Sí, puedes cancelar en cualquier momento y seguirás teniendo acceso hasta el final del período pagado.</p>
          </div>
          <div>
            <h3 className="font-medium text-gray-800 mb-1">¿Hay garantía?</h3>
            <p className="text-sm text-gray-600">Si no estás satisfecho en los primeros 3 días, te devolvemos tu dinero.</p>
          </div>
        </div>
      </div>
    </div>
  );

  const ProfileScreen = () => (
    <div className="pb-20 px-4 pt-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Mi Perfil</h1>
      
      {/* User Info */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mr-4">
            {userData?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800">{userData?.name || 'Usuario'}</h2>
            <p className="text-sm text-gray-600">
              {isPremium ? (
                <span className="text-green-600 font-medium">✓ Premium activo</span>
              ) : (
                <span className="text-gray-500">Plan Gratuito</span>
              )}
            </p>
          </div>
        </div>
        
        {!isPremium && (
          <button 
            onClick={() => setShowPaymentModal(true)}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium py-3 rounded-xl"
          >
            Actualizar a Premium - {APP_CONFIG.CURRENCY}{APP_CONFIG.PREMIUM_PRICE}/semana
          </button>
        )}
      </div>

      {/* User Details */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Información</h2>
        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">Email</span>
            <span className="text-sm font-medium text-gray-800">{userData?.email || '-'}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">Teléfono</span>
            <span className="text-sm font-medium text-gray-800">{userData?.phone || '-'}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">Vistas gratis hoy</span>
            <span className="text-sm font-medium text-gray-800">{freeViewsLeft}/{APP_CONFIG.FREE_VIEWS_PER_DAY}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-sm text-gray-600">Miembro desde</span>
            <span className="text-sm font-medium text-gray-800">
              {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString('es-PE') : '-'}
            </span>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Configuración</h2>
        <div className="space-y-4">
          <button 
            onClick={() => navigate('/settings/notifications')}
            className="w-full flex items-center justify-between py-3 text-left"
          >
            <span className="text-gray-700">Notificaciones</span>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
          <button 
            onClick={() => navigate('/settings/preferences')}
            className="w-full flex items-center justify-between py-3 text-left"
          >
            <span className="text-gray-700">Preferencias</span>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
          <button 
            onClick={() => navigate('/settings/privacy')}
            className="w-full flex items-center justify-between py-3 text-left"
          >
            <span className="text-gray-700">Privacidad</span>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Logout */}
      <button 
        onClick={handleLogout}
        className="w-full bg-red-50 text-red-600 font-medium py-3 rounded-xl flex items-center justify-center"
      >
        <LogOut className="w-5 h-5 mr-2" />
        Cerrar Sesión
      </button>

      {/* Contact */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 mb-2">¿Necesitas ayuda?</p>
        <button className="text-blue-600 font-medium">Contactar Soporte</button>
      </div>
    </div>
  );

  const screens = {
    home: <HomeScreen />,
    stats: <StatsScreen />,
    premium: <PremiumScreen />,
    profile: <ProfileScreen />
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="pb-16">
        {screens[activeTab]}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="flex justify-around items-center py-2">
          {[
            { id: 'home', icon: Home, label: 'Inicio' },
            { id: 'stats', icon: BarChart3, label: 'Stats' },
            { id: 'premium', icon: Trophy, label: 'Premium' },
            { id: 'profile', icon: User, label: 'Perfil' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center py-2 px-4 ${
                activeTab === tab.id ? 'text-blue-600' : 'text-gray-400'
              }`}
            >
              <tab.icon className="w-6 h-6 mb-1" />
              <span className="text-xs">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Modals */}
      {showVideoModal && <VideoModal />}
      {showPaymentModal && <PaymentModal />}
    </div>
  );
};

export default MainApp;