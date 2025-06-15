// Este archivo registra el service worker para hacer la app PWA (funciona offline)

const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
  window.location.hostname === '[::1]' ||
  /^127(?:\.(?:25[0-5]|2[0-4]\d|[01]?\d\d?)){3}$/.test(window.location.hostname)
);

export function register(config) {
  if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
    const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;

    if (isLocalhost) {
      // Verifica si el SW existe localmente
      checkValidServiceWorker(swUrl, config);
    } else {
      // Registra el SW directamente
      registerValidSW(swUrl, config);
    }
  }
}

function registerValidSW(swUrl, config) {
  navigator.serviceWorker
    .register(swUrl)
    .then(registration => {
      if (registration.waiting) {
        if (config && config.onUpdate) config.onUpdate(registration);
      }
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker) {
          installingWorker.onstatechange = () => {
            if (installingWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // Nuevo contenido disponible
                if (config && config.onUpdate) config.onUpdate(registration);
              } else {
                // Contenido cacheado por primera vez
                if (config && config.onSuccess) config.onSuccess(registration);
              }
            }
          };
        }
      };
    })
    .catch(error => console.error('Error al registrar el Service Worker:', error));
}

function checkValidServiceWorker(swUrl, config) {
  fetch(swUrl, { headers: { 'Service-Worker': 'script' } })
    .then(response => {
      if (
        response.status === 404 ||
        response.headers.get('content-type')?.indexOf('javascript') === -1
      ) {
        // SW no encontrado, se elimina
        navigator.serviceWorker.ready.then(registration => registration.unregister());
      } else {
        registerValidSW(swUrl, config);
      }
    })
    .catch(() => {
      console.log('No se pudo conectar al Service Worker. App offline.');
    });
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(registration => {
      registration.unregister();
    });
  }
}
