import api from '../api/axios';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

// Público — sin token, para Landing y mapa
export const listarParqueaderosPublico = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/parqueaderos/publico`);
        return response.data;
    } catch (error) {
        throw error.response?.data?.error || 'Error al cargar los parqueaderos';
    }
};

// Autenticado — para dashboard
export const obtenerParqueaderos = async () => {
    try {
        const response = await api.get('/parqueaderos');
        return response.data;
    } catch (error) {
        throw error.response?.data?.error || 'Error al cargar los parqueaderos';
    }
};

export const actualizarTarifas = async (parqueaderoId, tarifaCarro, tarifaMoto) => {
    try {
        const response = await api.put(`/parqueaderos/${parqueaderoId}/tarifas`, {
            tarifaCarro, tarifaMoto
        });
        return response.data;
    } catch (error) {
        throw error.response?.data?.error || 'Error al actualizar tarifas';
    }
};