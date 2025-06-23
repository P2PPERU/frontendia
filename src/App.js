import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import AuthSystem from './components/auth/AuthSystem';
import MainApp from './screens/main/MainApp';
import AdminPanel from './components/admin/AdminPanel';

console.log('🚀 App.js cargado');

// Componente para rutas protegidas
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  
  console.log('🔐 ProtectedRoute - Auth state:', { isAuthenticated, isAdmin, loading });
  
  if (loading) {
    console.log('⏳ ProtectedRoute - Mostrando loading...');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    console.log('❌ No autenticado, redirigiendo a login');
    return <Navigate to="/login" replace />;
  }
  
  if (requireAdmin && !isAdmin) {
    console.log('❌ No es admin, redirigiendo a app');
    return <Navigate to="/app" replace />;
  }
  
  console.log('✅ Ruta protegida OK, renderizando children');
  return children;
};

// Componente para rutas de autenticación
const AuthRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  
  console.log('🔑 AuthRoute - Auth state:', { isAuthenticated, isAdmin, loading });
  
  if (loading) {
    console.log('⏳ AuthRoute - Mostrando loading...');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando sesión...</p>
        </div>
      </div>
    );
  }
  
  if (isAuthenticated) {
    console.log('✅ Ya autenticado, redirigiendo');
    return <Navigate to={isAdmin ? "/admin" : "/app"} replace />;
  }
  
  console.log('🔑 No autenticado, mostrando login');
  return children;
};

// Componente principal SIMPLIFICADO
function AppContent() {
  console.log('📱 AppContent renderizado');
  const [appReady, setAppReady] = useState(false);
  
  useEffect(() => {
    console.log('🔧 Iniciando inicialización SIMPLIFICADA...');
    
    const initApp = async () => {
      try {
        console.log('⏳ Esperando 1 segundo...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log('✅ Inicialización completa, setting appReady = true');
        setAppReady(true);
        
      } catch (error) {
        console.error('❌ Error en inicialización:', error);
        setAppReady(true); // Continuar de todos modos
      }
    };
    
    initApp();
  }, []);
  
  // Pantalla de carga inicial
  if (!appReady) {
    console.log('⏳ Mostrando pantalla de carga (appReady = false)');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        <div className="text-center">
          <div className="bg-white rounded-2xl p-8 shadow-xl max-w-sm w-full mx-4">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <span className="text-white text-2xl font-bold">IA</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">IA SPORT</h1>
            <p className="text-gray-600 text-sm mb-4">Inicializando aplicación...</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full animate-pulse" style={{width: '75%'}}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  console.log('🎯 App listo (appReady = true), renderizando Router');
  
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
        
        {/* Rutas de la app principal - TODAS las rutas /app/* van a MainApp */}
        <Route 
          path="/app/*" 
          element={
            <ProtectedRoute>
              <MainApp />
            </ProtectedRoute>
          } 
        />
        
        {/* Rutas del panel de administrador */}
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
        
        {/* Rutas de compatibilidad - redirigir a /app/* */}
        <Route path="/tournaments" element={<Navigate to="/app/tournaments" replace />} />
        <Route path="/tournaments/*" element={<Navigate to="/app/tournaments" replace />} />
        <Route path="/predictions" element={<Navigate to="/app" replace />} />
        <Route path="/stats" element={<Navigate to="/app/stats" replace />} />
        <Route path="/premium" element={<Navigate to="/app/premium" replace />} />
        <Route path="/profile" element={<Navigate to="/app/profile" replace />} />
        
        {/* Página 404 simple */}
        <Route 
          path="*" 
          element={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
                <p className="text-gray-600 mb-4">Página no encontrada</p>
                <a 
                  href="/app"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
                >
                  Ir al inicio
                </a>
              </div>
            </div>
          } 
        />
      </Routes>
    </Router>
  );
}

// App principal
function App() {
  console.log('🏠 App component renderizado');
  
  return (
    <AuthProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthProvider>
  );
}

export default App;