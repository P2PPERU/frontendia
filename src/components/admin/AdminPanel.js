import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Save, X, TrendingUp, Users, DollarSign, Check, AlertCircle, RefreshCw, Star, LogOut, WifiOff } from 'lucide-react';
import adminService from '../../services/api/admin';
import authService from '../../services/api/auth';
import { PREDICTION_TYPES } from '../../utils/constants';

const AdminPanel = () => {
  const navigate = useNavigate();
  const [predictions, setPredictions] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [stats, setStats] = useState({
    totalUsers: 0,
    premiumUsers: 0,
    todayPredictions: 0,
    weeklyRevenue: 0,
    successRate: 0,
    activeUsers: 0,
    wonPredictions: 0,
    lostPredictions: 0,
    pendingPredictions: 0,
    activeSubscriptions: 0,
    notificationsSent24h: 0
  });

  const [formData, setFormData] = useState({
    league: '',
    match: '',
    homeTeam: '',
    awayTeam: '',
    prediction: '',
    predictionType: '1X2',
    confidence: 85,
    odds: 1.50,
    matchTime: new Date().toISOString().slice(0, 16),
    isHot: false,
    isPremium: true,
    sport: 'football'
  });

  const leagueOptions = [
    "Liga 1 Perú",
    "Premier League",
    "La Liga",
    "Serie A",
    "Bundesliga",
    "Ligue 1",
    "Champions League",
    "Europa League",
    "Copa Libertadores",
    "Copa Sudamericana",
    "Liga MX",
    "MLS",
    "Eredivisie",
    "Liga Portugal",
    "Super Liga Argentina"
  ];

  const predictionOptions = {
    '1X2': ["Gana Local", "Gana Visitante", "Empate"],
    'OVER_UNDER': ["Más de 1.5 Goles", "Más de 2.5 Goles", "Más de 3.5 Goles", "Menos de 2.5 Goles", "Menos de 3.5 Goles"],
    'BTTS': ["Ambos Equipos Marcan", "Solo Local Marca", "Solo Visitante Marca"],
    'HANDICAP': ["Handicap Local -1.5", "Handicap Local -2.5", "Handicap Visitante +1.5", "Handicap Visitante +2.5"],
    'CUSTOM': []
  };

  // Verificar autenticación admin
  useEffect(() => {
    if (!authService.isAuthenticated() || !authService.isAdmin()) {
      navigate('/login');
      return;
    }
  }, [navigate]);

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

  // Cargar datos
  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      // Cargar estadísticas
      const statsResult = await adminService.getStats();
      if (statsResult.success) {
        setStats(statsResult.data || {});
      }

      // Cargar predicciones
      const predsResult = await adminService.getPredictions();
      if (predsResult.success) {
        setPredictions(predsResult.data || []);
      } else {
        setError(predsResult.message || 'Error al cargar predicciones');
      }
    } catch (err) {
      setError('Error de conexión. Verifica tu internet.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Agregar predicción
  const handleAdd = async () => {
    if (!validateForm()) return;

    setSaving(true);
    setError('');

    try {
      const predictionData = {
        ...formData,
        match: `${formData.homeTeam} vs ${formData.awayTeam}`,
        matchTime: new Date(formData.matchTime).toISOString()
      };

      const result = await adminService.createPrediction(predictionData);
      
      if (result.success) {
        await loadData();
        setShowAddForm(false);
        resetForm();
      } else {
        setError(result.message || 'Error al crear predicción');
      }
    } catch (err) {
      setError('Error de conexión. Verifica tu internet.');
    } finally {
      setSaving(false);
    }
  };

  // Editar predicción
  const handleEdit = (id) => {
    const prediction = predictions.find(p => p.id === id);
    if (prediction) {
      const [homeTeam, awayTeam] = prediction.match.split(' vs ');
      setFormData({
        league: prediction.league,
        homeTeam: homeTeam || '',
        awayTeam: awayTeam || '',
        prediction: prediction.prediction,
        predictionType: prediction.predictionType || '1X2',
        confidence: prediction.confidence,
        odds: prediction.odds,
        matchTime: new Date(prediction.matchTime).toISOString().slice(0, 16),
        isHot: prediction.isHot || false,
        isPremium: prediction.isPremium !== false,
        sport: prediction.sport || 'football'
      });
      setEditingId(id);
      setShowAddForm(true);
    }
  };

  // Actualizar predicción
  const handleUpdate = async () => {
    if (!validateForm()) return;

    setSaving(true);
    setError('');

    try {
      const predictionData = {
        ...formData,
        match: `${formData.homeTeam} vs ${formData.awayTeam}`,
        matchTime: new Date(formData.matchTime).toISOString()
      };

      const result = await adminService.updatePrediction(editingId, predictionData);
      
      if (result.success) {
        await loadData();
        setShowAddForm(false);
        setEditingId(null);
        resetForm();
      } else {
        setError(result.message || 'Error al actualizar predicción');
      }
    } catch (err) {
      setError('Error de conexión. Verifica tu internet.');
    } finally {
      setSaving(false);
    }
  };

  // Eliminar predicción
  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta predicción?')) return;

    try {
      const result = await adminService.deletePrediction(id);
      
      if (result.success) {
        await loadData();
      } else {
        alert(result.message || 'Error al eliminar predicción');
      }
    } catch (err) {
      alert('Error de conexión. Verifica tu internet.');
    }
  };

  // Actualizar resultado
  const handleResultUpdate = async (id, result) => {
    try {
      const response = await adminService.updatePredictionResult(id, result);
      
      if (response.success) {
        // Actualizar localmente para feedback inmediato
        setPredictions(prevPredictions =>
          prevPredictions.map(p =>
            p.id === id ? { ...p, result } : p
          )
        );
        // Recargar datos completos
        await loadData();
      } else {
        alert(response.message || 'Error al actualizar resultado');
      }
    } catch (err) {
      alert('Error de conexión. Verifica tu internet.');
    }
  };

  // Validar formulario
  const validateForm = () => {
    if (!formData.league) {
      setError('Selecciona una liga');
      return false;
    }
    if (!formData.homeTeam || !formData.awayTeam) {
      setError('Ingresa ambos equipos');
      return false;
    }
    if (!formData.prediction) {
      setError('Selecciona o ingresa una predicción');
      return false;
    }
    if (formData.odds <= 0) {
      setError('La cuota debe ser mayor a 0');
      return false;
    }
    return true;
  };

  // Resetear formulario
  const resetForm = () => {
    setFormData({
      league: '',
      match: '',
      homeTeam: '',
      awayTeam: '',
      prediction: '',
      predictionType: '1X2',
      confidence: 85,
      odds: 1.50,
      matchTime: new Date().toISOString().slice(0, 16),
      isHot: false,
      isPremium: true,
      sport: 'football'
    });
    setEditingId(null);
    setError('');
  };

  // Cerrar sesión
  const handleLogout = () => {
    if (window.confirm('¿Estás seguro de cerrar sesión?')) {
      authService.logout();
    }
  };

  const PredictionForm = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-800">
          {editingId ? 'Editar Predicción' : 'Nueva Predicción'}
        </h3>
        <button
          onClick={() => {
            setShowAddForm(false);
            setEditingId(null);
            resetForm();
          }}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Liga</label>
          <select
            value={formData.league}
            onChange={(e) => setFormData({...formData, league: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            disabled={saving}
          >
            <option value="">Selecciona una liga...</option>
            {leagueOptions.map((option, idx) => (
              <option key={idx} value={option}>{option}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Hora del Partido</label>
          <input
            type="datetime-local"
            value={formData.matchTime}
            onChange={(e) => setFormData({...formData, matchTime: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={saving}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Equipo Local</label>
          <input
            type="text"
            value={formData.homeTeam}
            onChange={(e) => setFormData({...formData, homeTeam: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ej: Real Madrid"
            disabled={saving}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Equipo Visitante</label>
          <input
            type="text"
            value={formData.awayTeam}
            onChange={(e) => setFormData({...formData, awayTeam: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ej: Barcelona"
            disabled={saving}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Predicción</label>
          <select
            value={formData.predictionType}
            onChange={(e) => setFormData({...formData, predictionType: e.target.value, prediction: ''})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            disabled={saving}
          >
            {Object.keys(PREDICTION_TYPES).map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Predicción</label>
          {formData.predictionType === 'CUSTOM' ? (
            <input
              type="text"
              value={formData.prediction}
              onChange={(e) => setFormData({...formData, prediction: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Escribe tu predicción..."
              disabled={saving}
            />
          ) : (
            <select
              value={formData.prediction}
              onChange={(e) => setFormData({...formData, prediction: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              disabled={saving}
            >
              <option value="">Selecciona una predicción...</option>
              {predictionOptions[formData.predictionType]?.map((option, idx) => (
                <option key={idx} value={option}>{option}</option>
              ))}
            </select>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Confianza: {formData.confidence}%
          </label>
          <input
            type="range"
            min="50"
            max="100"
            value={formData.confidence}
            onChange={(e) => setFormData({...formData, confidence: parseInt(e.target.value)})}
            className="w-full"
            disabled={saving}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cuota</label>
          <input
            type="number"
            step="0.05"
            value={formData.odds}
            onChange={(e) => setFormData({...formData, odds: parseFloat(e.target.value) || 0})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={saving}
          />
        </div>
      </div>
      
      <div className="mt-4 flex items-center gap-6">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.isHot}
            onChange={(e) => setFormData({...formData, isHot: e.target.checked})}
            className="mr-2"
            disabled={saving}
          />
          <span className="text-sm font-medium text-gray-700">Predicción Caliente 🔥</span>
        </label>
        
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.isPremium}
            onChange={(e) => setFormData({...formData, isPremium: e.target.checked})}
            className="mr-2"
            disabled={saving}
          />
          <span className="text-sm font-medium text-gray-700">Solo Premium</span>
        </label>
      </div>
      
      <div className="mt-6 flex gap-3">
        <button
          onClick={editingId ? handleUpdate : handleAdd}
          disabled={saving || !isOnline}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium flex items-center hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          {editingId ? 'Actualizar' : 'Guardar'}
        </button>
        
        <button
          onClick={() => {
            setShowAddForm(false);
            setEditingId(null);
            resetForm();
          }}
          disabled={saving}
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium flex items-center hover:bg-gray-300"
        >
          <X className="w-4 h-4 mr-2" />
          Cancelar
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-2">
            <div>
              <h1 className="text-2xl font-bold">Panel de Administrador</h1>
              <p className="text-blue-100">Gestión de predicciones deportivas</p>
            </div>
            <div className="flex items-center gap-3">
              {!isOnline && (
                <div className="bg-red-500 rounded-full p-2">
                  <WifiOff className="w-5 h-5 text-white" />
                </div>
              )}
              <button
                onClick={handleLogout}
                className="bg-white/20 hover:bg-white/30 rounded-lg px-4 py-2 flex items-center gap-2 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Salir
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {/* Error Message */}
        {error && !showAddForm && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700 text-sm">
            <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-blue-600" />
              <span className="text-xs text-gray-500">Total</span>
            </div>
            <div className="text-2xl font-bold text-gray-800">{stats.totalUsers || 0}</div>
            <div className="text-sm text-gray-600">Usuarios totales</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <Star className="w-8 h-8 text-yellow-500" />
              <span className="text-xs text-gray-500">Premium</span>
            </div>
            <div className="text-2xl font-bold text-gray-800">{stats.premiumUsers || 0}</div>
            <div className="text-sm text-gray-600">Usuarios Premium</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-8 h-8 text-green-600" />
              <span className="text-xs text-gray-500">Semana</span>
            </div>
            <div className="text-2xl font-bold text-gray-800">S/ {stats.weeklyRevenue || 0}</div>
            <div className="text-sm text-gray-600">Ingresos semanales</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-purple-600" />
              <span className="text-xs text-gray-500">Hoy</span>
            </div>
            <div className="text-2xl font-bold text-gray-800">{stats.todayPredictions || predictions.length}</div>
            <div className="text-sm text-gray-600">Predicciones activas</div>
          </div>
        </div>

        {/* Results Summary */}
        {(stats.wonPredictions > 0 || stats.lostPredictions > 0) && (
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-xl p-6 mb-6">
            <h3 className="text-lg font-bold mb-4">Resultados del Día</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400">{stats.wonPredictions || 0}</div>
                <div className="text-sm text-gray-300">Acertados</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-400">{stats.lostPredictions || 0}</div>
                <div className="text-sm text-gray-300">Fallados</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400">{stats.pendingPredictions || predictions.filter(p => p.result === 'PENDING').length}</div>
                <div className="text-sm text-gray-300">Pendientes</div>
              </div>
            </div>
            {stats.successRate > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-700">
                <div className="text-center">
                  <div className="text-2xl font-bold">{stats.successRate}%</div>
                  <div className="text-sm text-gray-300">Tasa de Acierto</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => {
              resetForm();
              setEditingId(null);
              setShowAddForm(true);
            }}
            disabled={!isOnline}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium flex items-center hover:bg-blue-700 disabled:opacity-50"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nueva Predicción
          </button>
          
          <button
            onClick={loadData}
            disabled={loading}
            className={`bg-gray-600 text-white px-4 py-2 rounded-lg font-medium flex items-center hover:bg-gray-700 ${loading ? 'animate-pulse' : ''}`}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && <PredictionForm />}

        {/* Predictions List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-800">Predicciones de Hoy</h2>
            <p className="text-sm text-gray-600 mt-1">
              {new Date().toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Cargando predicciones...</p>
            </div>
          ) : predictions.length === 0 ? (
            <div className="p-12 text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No hay predicciones para hoy</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="text-blue-600 font-medium hover:underline"
              >
                Agregar primera predicción
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Liga</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Partido</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Predicción</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Confianza</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cuota</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hora</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Resultado</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {predictions.map((pred) => (
                    <tr key={pred.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{pred.league}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{pred.match}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{pred.prediction}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden mr-2">
                            <div 
                              className={`h-full ${pred.confidence >= 90 ? 'bg-green-500' : pred.confidence >= 85 ? 'bg-yellow-500' : 'bg-orange-500'}`}
                              style={{ width: `${pred.confidence}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-900">{pred.confidence}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-bold text-green-600">{pred.odds}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(pred.matchTime).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {pred.isHot && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              🔥 Caliente
                            </span>
                          )}
                          {pred.isPremium && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              Premium
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          {pred.result === 'PENDING' ? (
                            <>
                              <button
                                onClick={() => handleResultUpdate(pred.id, 'WON')}
                                className="p-2 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
                                title="Marcar como acertado"
                                disabled={!isOnline}
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleResultUpdate(pred.id, 'LOST')}
                                className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                                title="Marcar como fallado"
                                disabled={!isOnline}
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          ) : pred.result === 'WON' ? (
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                ✓ Acertado
                              </span>
                              <button
                                onClick={() => handleResultUpdate(pred.id, 'PENDING')}
                                className="text-gray-400 hover:text-gray-600"
                                title="Resetear resultado"
                                disabled={!isOnline}
                              >
                                <RefreshCw className="w-3 h-3" />
                              </button>
                            </div>
                          ) : pred.result === 'LOST' ? (
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                ✗ Fallado
                              </span>
                              <button
                                onClick={() => handleResultUpdate(pred.id, 'PENDING')}
                                className="text-gray-400 hover:text-gray-600"
                                title="Resetear resultado"
                                disabled={!isOnline}
                              >
                                <RefreshCw className="w-3 h-3" />
                              </button>
                            </div>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(pred.id)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                          disabled={!isOnline}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(pred.id)}
                          className="text-red-600 hover:text-red-900"
                          disabled={!isOnline}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Tips */}
        <div className="mt-6 bg-blue-50 rounded-xl p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-3">Tips para el Administrador</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div className="flex items-start">
              <Check className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
              <span>Agrega al menos 5-7 predicciones diarias para mantener el engagement</span>
            </div>
            <div className="flex items-start">
              <Check className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
              <span>Marca como "Caliente" las predicciones con mayor confianza</span>
            </div>
            <div className="flex items-start">
              <Check className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
              <span>Mantén un balance 70/30 entre predicciones premium y gratuitas</span>
            </div>
            <div className="flex items-start">
              <Check className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
              <span>Actualiza los resultados tan pronto como terminen los partidos</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;