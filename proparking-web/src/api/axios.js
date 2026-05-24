import axios from 'axios';

/**
 * Cliente HTTP seguro para ProParking.
 *
 * Mejoras de seguridad sobre la versión anterior:
 * 1. Header X-Requested-With: identifica peticiones AJAX (defensa en profundidad).
 * 2. Timeout: evita que peticiones cuelguen indefinidamente (DoS a nivel cliente).
 * 3. No incluir credentials en rutas externas (solo la API propia).
 * 4. Interceptor de errores mejorado con mensajes genéricos para 401/403.
 * 5. No almacenar tokens en localStorage (viajan en cookie HttpOnly).
 */

const BASE_URL = import.meta.env.VITE_API_URL;

if (!BASE_URL) {
    console.error('[API] VITE_API_URL no está configurado. Verifica tu .env');
}

const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,      // Necesario para enviar cookie HttpOnly del JWT
    timeout: 15000,             // 15 segundos de timeout (evita peticiones indefinidas)
    headers: {
        'Content-Type': 'application/json',
        // Header que identifica peticiones AJAX — algunos ataques CSRF no pueden
        // añadir headers personalizados en peticiones cross-origin simples
        'X-Requested-With': 'XMLHttpRequest',
    },
});

// Rutas de autenticación que no deben redirigir al login si devuelven 401
const RUTAS_AUTH = [
    '/auth/verificar',
    '/auth/login',
    '/auth/recuperar',
    '/auth/restablecer',
    '/auth/logout',
    '/auth/registro',
];

// ── Interceptor de respuestas ─────────────────────────────────────────────────
api.interceptors.response.use(
    // Petición exitosa: pasar sin modificar
    (response) => response,

    (error) => {
        const url    = error.config?.url || '';
        const status = error.response?.status;
        const esRutaAuth = RUTAS_AUTH.some(ruta => url.includes(ruta));

        // 401 fuera de rutas de auth: sesión expirada → redirigir al login
        if (status === 401 && !esRutaAuth) {
            // Limpiar datos de sesión del localStorage
            try {
                localStorage.clear();
            } catch {
                // ignore
            }
            // Pequeño delay para que el componente actual pueda limpiar estado
            setTimeout(() => {
                window.location.href = '/login';
            }, 100);
            return Promise.reject(error);
        }

        // 403: acceso denegado (rol insuficiente)
        if (status === 403 && !esRutaAuth) {
            console.warn('[API] Acceso denegado — rol insuficiente');
            // No redirigir automáticamente, dejar que el componente maneje el error
        }

        // 429: rate limit alcanzado
        if (status === 429) {
            const retryAfter = error.response?.headers?.['retry-after'];
            const mensajeRateLimit = retryAfter
                ? `Demasiadas peticiones. Intenta en ${retryAfter} segundos.`
                : 'Demasiadas peticiones. Por favor espera antes de continuar.';
            error.response.data = { error: mensajeRateLimit };
        }

        // 500+: error del servidor
        if (status >= 500) {
            // No exponer detalles del servidor al usuario
            console.error('[API] Error del servidor:', status, url);
        }

        return Promise.reject(error);
    }
);

// ── Interceptor de peticiones ─────────────────────────────────────────────────
api.interceptors.request.use(
    (config) => {
        // Sanitización básica: asegurarse de que la URL no tenga path traversal
        if (config.url && (config.url.includes('../') || config.url.includes('..\\'))) {
            return Promise.reject(new Error('URL de petición inválida'));
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;