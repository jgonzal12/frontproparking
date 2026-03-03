import api from '../api/axios';

export const obtenerParqueaderos = async () => {
    try {
        const response = await api.get('/parqueaderos');
        return response.data;
    } catch (error) {
        throw error.response?.data?.error || 'Error al cargar los parqueaderos';
    }
};