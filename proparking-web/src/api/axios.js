import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,

    withCredentials: true,
});


const RUTAS_AUTH = [
    '/auth/verificar',
    '/auth/login',
    '/auth/recuperar',
    '/auth/restablecer',
    '/auth/logout',  
];

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