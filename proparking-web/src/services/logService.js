import api from '../api/axios';

export const obtenerLogs = async (pagina = 0, tamanio = 50) => {
    try {
        const response = await api.get(`/superadmin/logs?pagina=${pagina}&tamanio=${tamanio}`);
        return response.data;
    } catch (error) {
        throw error.response?.data?.error || 'Error al cargar los logs';
    }
};

export const obtenerLogsPorUsuario = async (email, pagina = 0) => {
    try {
        const response = await api.get(`/superadmin/logs/usuario/${email}?pagina=${pagina}`);
        return response.data;
    } catch (error) {
        throw error.response?.data?.error || 'Error al cargar los logs';
    }
};

export const obtenerLogsPorAccion = async (accion, pagina = 0) => {
    try {
        const response = await api.get(`/superadmin/logs/accion/${accion}?pagina=${pagina}`);
        return response.data;
    } catch (error) {
        throw error.response?.data?.error || 'Error al cargar los logs';
    }
};