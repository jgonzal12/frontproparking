import axios from 'axios';

// Creamos la instancia base apuntando a tu backend
const api = axios.create({
    baseURL: 'http://localhost:8080/api/v1', // 🔹 Asegúrate de que esta sea la ruta correcta
});

// 🔹 ESTO ES LA MAGIA: El Interceptor
// Antes de que cualquier petición salga hacia Java, Axios la detiene un milisegundo,
// le inyecta el Token en los Headers, y luego la deja seguir.
api.interceptors.request.use(
    (config) => {
        // Buscamos el token que guardaste al iniciar sesión
        const token = localStorage.getItem('token'); 
        
        if (token) {
            // Si hay token, lo pegamos en el formato que espera Spring Boot (Bearer ...)
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;