import api from '../api/axios';

export const obtenerMiHistorial = async (filtros = {}) => {
    try {
        const params = {};
        if (filtros.estado) params.estado = filtros.estado;
        if (filtros.desde)  params.desde  = filtros.desde;
        if (filtros.hasta)  params.hasta  = filtros.hasta;
        const response = await api.get('/cliente/historial', { params });
        return response.data;
    } catch (error) {
        throw error.response?.data?.error || 'Error al cargar el historial';
    }
};

export const registrarIngreso = async (vehiculoId, parqueaderoId) => {
    try {
        const response = await api.post('/ingresos', null, {
            params: {
                vehiculoId: vehiculoId,
                parqueaderoId: parqueaderoId
            }
        });
        return response.data;
    } catch (error) {
        // Esto ayudará a ver el mensaje exacto (ej: "No hay cupos") en el alert
        throw error.response?.data?.error || 'Error en la petición';
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