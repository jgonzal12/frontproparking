import api from '../api/axios';

export const obtenerMiHistorial = async () => {
    try {
        const response = await api.get('/cliente/historial');
        return response.data;
    } catch (error) {
        throw error.response?.data?.error || 'Error al cargar el historial';
    }
};

export const registrarIngreso = async (vehiculoId, parqueaderoId) => {
    try {
        // Tu controlador de Java espera RequestParams, así que los pasamos en la URL
        const response = await api.post(`/ingresos?vehiculoId=${vehiculoId}&parqueaderoId=${parqueaderoId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data?.error || 'Error al registrar el ingreso';
    }
};


export const obtenerTodosLosIngresos = async () => {
    try {
        const response = await api.get('/ingresos');
        return response.data;
    } catch (error) {
        throw error.response?.data?.error || 'Error al obtener los ingresos';
    }
};