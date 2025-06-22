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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
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
        console.log('🚀 Inicializando IA Sport...');
        
        // Verificar soporte de funcionalidades
        const features = {
          serviceWorker: 'serviceWorker' in navigator,
          notifications: 'Notification' in window,
          pushManager: 'PushManager' in window,
          indexedDB: 'indexedDB' in window
        };
        
        console.log('📱 Funcionalidades disponibles:', features);
        
        // Inicializar service worker para PWA
        if (features.serviceWorker) {
          try {
            const registration = await navigator.serviceWorker.ready;
            console.log('✅ Service Worker listo:', registration);
          } catch (error) {
            console.log('⚠️ Service Worker no disponible:', error);
          }
        }
        
        // Verificar si la app está instalada como PWA
        const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
                     window.navigator.standalone === true;
        
        if (isPWA) {
          console.log('📱 Ejecutándose como PWA');
          document.documentElement.classList.add('pwa-mode');
        }
        
        // Configurar tema según preferencias del sistema
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
          document.documentElement.classList.add('dark-mode');
        }
        
        // Simular carga mínima para evitar flashes
        await new Promise(resolve => setTimeout(resolve, 800));
        
        setAppReady(true);
        console.log('✅ IA Sport listo para usar');
        
        // Analytics de inicialización (opcional)
        if (typeof gtag !== 'undefined') {
          gtag('event', 'app_initialized', {
            timestamp: new Date().toISOString(),
            pwa_mode: isPWA,
            features_available: Object.keys(features).filter(key => features[key]).length
          });
        }
        
      } catch (error) {
        console.error('❌ Error inicializando app:', error);
        setAppReady(true); // Continuar de todos modos
      }
    };
    
    initApp();
  }, []);
  
  // Pantalla de carga inicial
  if (!appReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        <div className="text-center">
          <div className="bg-white rounded-2xl p-8 shadow-xl max-w-sm w-full mx-4">
            {/* Logo animado */}
            <div className="relative mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mx-auto flex items-center justify-center mb-4 animate-pulse">
                <svg 
                  className="w-10 h-10 text-white" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              
              {/* Indicador de carga */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full animate-pulse" style={{width: '75%'}}></div>
              </div>
            </div>
            
            {/* Textos */}
            <h1 className="text-2xl font-bold text-gray-800 mb-2">IA SPORT</h1>
            <p className="text-gray-600 text-sm mb-4">Predicciones Inteligentes con IA</p>
            
            {/* Features destacadas */}
            <div className="text-xs text-gray-500 space-y-1">
              <div className="flex items-center justify-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                Cargando torneos...
              </div>
              <div className="flex items-center justify-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
                Inicializando predicciones...
              </div>
              <div className="flex items-center justify-center">
                <span className="w-2 h-2 bg-purple-500 rounded-full mr-2 animate-pulse"></span>
                Preparando rankings...
              </div>
            </div>
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
        
        {/* Rutas de la app principal - Incluye todas las rutas de torneos */}
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
        
        {/* Ruta por defecto - Redirige a la app */}
        <Route path="/" element={<Navigate to="/app" replace />} />
        
        {/* Rutas adicionales para compatibilidad */}
        <Route path="/tournaments/*" element={<Navigate to="/app/tournaments" replace />} />
        <Route path="/predictions/*" element={<Navigate to="/app" replace />} />
        <Route path="/stats/*" element={<Navigate to="/app/stats" replace />} />
        <Route path="/premium/*" element={<Navigate to="/app/premium" replace />} />
        <Route path="/profile/*" element={<Navigate to="/app/profile" replace />} />
        
        {/* Página 404 mejorada */}
        <Route 
          path="*" 
          element={
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
              <div className="text-center max-w-md w-full">
                <div className="bg-white rounded-2xl p-8 shadow-xl">
                  {/* Icono 404 */}
                  <div className="w-20 h-20 bg-gradient-to-r from-red-400 to-pink-500 rounded-full mx-auto flex items-center justify-center mb-6">
                    <span className="text-3xl font-bold text-white">404</span>
                  </div>
                  
                  <h1 className="text-2xl font-bold text-gray-800 mb-2">Página no encontrada</h1>
                  <p className="text-gray-600 mb-6">
                    La página que buscas no existe o ha sido movida.
                  </p>
                  
                  {/* Botones de navegación */}
                  <div className="space-y-3">
                    <a 
                      href="/app"
                      className="block w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:opacity-90 transition-all"
                    >
                      Ir a Predicciones
                    </a>
                    
                    <a 
                      href="/app/tournaments"
                      className="block w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-200 transition-all"
                    >
                      Ver Torneos
                    </a>
                    
                    <button 
                      onClick={() => window.history.back()}
                      className="block w-full text-blue-600 font-medium hover:underline"
                    >
                      ← Volver atrás
                    </button>
                  </div>
                </div>
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
  // Manejo de errores global
  useEffect(() => {
    // Error handler para errores no capturados
    const handleError = (event) => {
      console.error('💥 Error no capturado:', event.error);
      
      // Reportar a servicio de analytics si está disponible
      if (typeof gtag !== 'undefined') {
        gtag('event', 'exception', {
          description: event.error?.message || 'Unknown error',
          fatal: false
        });
      }
    };

    // Promise rejection handler
    const handleRejection = (event) => {
      console.error('💥 Promise rechazada:', event.reason);
      
      // Prevenir que aparezca en la consola del navegador
      event.preventDefault();
      
      // Reportar a servicio de analytics si está disponible
      if (typeof gtag !== 'undefined') {
        gtag('event', 'exception', {
          description: event.reason?.message || 'Promise rejection',
          fatal: false
        });
      }
    };

    // Agregar listeners
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    // Cleanup
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  // Detectar instalación de PWA
  useEffect(() => {
    const handleAppInstalled = () => {
      console.log('📱 IA Sport PWA instalada exitosamente');
      
      // Analytics de instalación
      if (typeof gtag !== 'undefined') {
        gtag('event', 'app_installed', {
          method: 'pwa',
          timestamp: new Date().toISOString()
        });
      }
    };

    window.addEventListener('appinstalled', handleAppInstalled);
    
    return () => {
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  return (
    <AuthProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthProvider>
  );
}

export default App;