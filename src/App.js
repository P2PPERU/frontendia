import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import AuthSystem from './components/auth/AuthSystem';
import MainApp from './screens/main/MainApp';
import AdminPanel from './components/admin/AdminPanel';

// Componente para rutas protegidas
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/app" replace />;
  }
  
  return children;
};

// Componente para rutas de autenticación
const AuthRoute = ({ children }) => {
  const { isAuthenticated, isAdmin } = useAuth();
  
  if (isAuthenticated) {
    return <Navigate to={isAdmin ? "/admin" : "/app"} replace />;
  }
  
  return children;
};

// Componente principal con providers
function AppContent() {
  const [appReady, setAppReady] = useState(false);
  
  useEffect(() => {
    // Inicializar servicios
    const initApp = async () => {
      try {
        // Solo inicializar servicio de notificaciones básico
        // El service worker ya se registra en index.js
        console.log('Inicializando app...');
        
        // Simular una pequeña demora para evitar flashes
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setAppReady(true);
        console.log('App lista');
      } catch (error) {
        console.error('Error inicializando app:', error);
        setAppReady(true); // Continuar de todos modos
      }
    };
    
    initApp();
  }, []);
  
  if (!appReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        <div className="text-center">
          <div className="bg-white rounded-2xl p-8 shadow-xl">
            <div className="animate-pulse mb-4">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mx-auto"></div>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">IA SPORT</h1>
            <p className="text-gray-600">Cargando predicciones...</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <Router>
      <Routes>
        {/* Rutas de autenticación */}
        <Route 
          path="/login" 
          element={
            <AuthRoute>
              <AuthSystem />
            </AuthRoute>
          } 
        />
        
        {/* Rutas de la app principal */}
        <Route 
          path="/app/*" 
          element={
            <ProtectedRoute>
              <MainApp />
            </ProtectedRoute>
          } 
        />
        
        {/* Rutas del admin */}
        <Route 
          path="/admin/*" 
          element={
            <ProtectedRoute requireAdmin>
              <AdminPanel />
            </ProtectedRoute>
          } 
        />
        
        {/* Ruta por defecto */}
        <Route path="/" element={<Navigate to="/app" replace />} />
        
        {/* 404 */}
        <Route 
          path="*" 
          element={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
                <p className="text-gray-600 mb-8">Página no encontrada</p>
                <a 
                  href="/"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700"
                >
                  Volver al inicio
                </a>
              </div>
            </div>
          } 
        />
      </Routes>
    </Router>
  );
}

// App principal con todos los providers
function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthProvider>
  );
}

export default App;