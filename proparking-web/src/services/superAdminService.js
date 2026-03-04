import api from '../api/axios';

export const listarUsuarios = async () => {
    try {
        const response = await api.get('/superadmin/usuarios');
        return response.data;
    } catch (error) {
        throw error.response?.data?.error || 'Error al cargar los usuarios';
    }
};

export const asignarAdmin = async (usuarioId, parqueaderoId) => {
    try {
        const response = await api.put(`/superadmin/asignar-admin/${usuarioId}/${parqueaderoId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data?.error || 'Error al asignar administrador';
    }
};

export const revocarAdmin = async (usuarioId) => {
    try {
        const response = await api.put(`/superadmin/revocar-admin/${usuarioId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data?.error || 'Error al revocar administrador';
    }
};

export const crearParqueadero = async (datos) => {
    try {
        const response = await api.post('/parqueaderos', datos);
        return response.data;
    } catch (error) {
        throw error.response?.data?.error || 'Error al crear el parqueadero';
    }
};

export const actualizarParqueadero = async (id, datos) => {
    try {
        const response = await api.put(`/parqueaderos/${id}`, datos);
        return response.data;
    } catch (error) {
        throw error.response?.data?.error || 'Error al actualizar el parqueadero';
    }
};

export const eliminarParqueadero = async (id) => {
    try {
        await api.delete(`/parqueaderos/${id}`);
    } catch (error) {
        throw error.response?.data?.error || 'Error al eliminar el parqueadero';
    }
};