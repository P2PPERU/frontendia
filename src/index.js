import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Cambiado para importar Tailwind
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';

// Verificar si es desarrollo
const isDevelopment = process.env.NODE_ENV === 'development';

// Configurar el root
const root = ReactDOM.createRoot(document.getElementById('root'));

// Renderizar la app
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Registrar service worker para PWA
serviceWorkerRegistration.register({
  onUpdate: (registration) => {
    // Notificar al usuario sobre nueva versión
    if (registration && registration.waiting) {
      const shouldUpdate = window.confirm(
        '¡Nueva versión disponible! ¿Deseas actualizar?'
      );
      
      if (shouldUpdate) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        window.location.reload();
      }
    }
  },
  onSuccess: (registration) => {
    console.log('Service Worker registrado exitosamente');
  }
});

// Medir performance
reportWebVitals((metric) => {
  if (isDevelopment) {
    console.log(metric);
  }
  // Aquí podrías enviar las métricas a un servicio de analytics
});

// Manejo de errores global
window.addEventListener('unhandledrejection', event => {
  console.error('Promesa rechazada:', event.reason);
  // Aquí podrías enviar el error a un servicio de logging
});

// Detectar cuando la app se instala
window.addEventListener('appinstalled', () => {
  console.log('IA Sport PWA instalada');
  // Aquí podrías enviar analytics
});

// Prevenir zoom en iOS
document.addEventListener('gesturestart', function (e) {
  e.preventDefault();
});

// Agregar clase para detectar si es PWA instalada
if (window.matchMedia('(display-mode: standalone)').matches || 
    window.navigator.standalone === true) {
  document.documentElement.classList.add('pwa-installed');
}