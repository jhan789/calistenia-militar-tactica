/**
 * Service Worker de la PWA de Calistenia Militar Táctica.
 * Gestiona el almacenamiento en caché de los recursos estáticos esenciales
 * para permitir la instalación en dispositivos móviles y el funcionamiento 100% sin conexión.
 */

const NOMBRE_CACHE = 'calistenia-militar-pwa-v9';
const RECURSOS_NUCLEO = [
  './',
  './index.html',
  './manifest.json',
  './icon-tactico.svg',
  './src/calisteniaMilitar.js',
  './src/progresoEntrenamiento.js'
];

/**
 * Almacena en caché todos los archivos base de la aplicación durante la instalación del Service Worker.
 *
 * @returns {Promise<void>} Promesa que se resuelve cuando los recursos quedan almacenados en caché.
 */
async function precargarRecursosNucleo() {
  const cache = await caches.open(NOMBRE_CACHE);
  await cache.addAll(RECURSOS_NUCLEO);
}

/**
 * Elimina las versiones antiguas de caché que no coincidan con NOMBRE_CACHE actual.
 *
 * @returns {Promise<void>} Promesa que se resuelve al limpiar cachés obsoletas.
 */
async function limpiarCachesObsoletas() {
  const claves = await caches.keys();
  await Promise.all(
    claves
      .filter((clave) => clave !== NOMBRE_CACHE)
      .map((claveObsoleta) => caches.delete(claveObsoleta))
  );
}

/**
 * Responde a una petición GET buscando primero en la caché local y actualizando en segundo plano
 * desde la red cuando haya conexión disponible (estrategia Stale-While-Revalidate / Offline Fallback).
 *
 * @param {Request} peticion - Objeto Request interceptado por el evento fetch.
 * @returns {Promise<Response>} Respuesta desde la caché o desde la red.
 */
async function responderConCacheORed(peticion) {
  const cache = await caches.open(NOMBRE_CACHE);
  const respuestaCache = await cache.match(peticion);

  const promesaRed = fetch(peticion)
    .then((respuestaRed) => {
      if (respuestaRed && respuestaRed.status === 200 && respuestaRed.type === 'basic') {
        cache.put(peticion, respuestaRed.clone());
      }
      return respuestaRed;
    })
    .catch(() => null);

  if (respuestaCache) {
    return respuestaCache;
  }

  const respuestaDesdeRed = await promesaRed;
  if (respuestaDesdeRed) {
    return respuestaDesdeRed;
  }

  // Fallback para navegación offline
  const fallbackInicio = await cache.match('./index.html');
  return fallbackInicio || new Response('Modo sin conexión activo.', { status: 503 });
}

self.addEventListener('install', (evento) => {
  evento.waitUntil(
    precargarRecursosNucleo().then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    limpiarCachesObsoletas().then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (evento) => {
  if (evento.request.method !== 'GET') {
    return;
  }
  evento.respondWith(responderConCacheORed(evento.request));
});
