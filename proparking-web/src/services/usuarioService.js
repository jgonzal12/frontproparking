import axios from '../api/axios';

export const actualizarPerfil = async (datosPerfil) => {
    try {
        const response = await axios.put('/usuarios/perfil', datosPerfil);
        return response.data;
    } catch (error) {
        // Propaga el mensaje de error del backend si existe
        throw error.response?.data?.error || 'Error al actualizar el perfil';
    }
};