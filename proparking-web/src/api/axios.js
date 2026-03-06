import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});

// Interceptor de REQUEST — inyecta el token en cada petición
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor de RESPONSE — detecta token expirado (401) y redirige al login
// Excepto en rutas de auth donde el 401 es un error esperado (código incorrecto, contraseña incorrecta)
const RUTAS_AUTH = ['/auth/verificar', '/auth/login', '/auth/recuperar', '/auth/restablecer'];

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const url = error.config?.url || '';
        const esRutaAuth = RUTAS_AUTH.some(ruta => url.includes(ruta));
        if (error.response?.status === 401 && !esRutaAuth) {
            localStorage.clear();
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;