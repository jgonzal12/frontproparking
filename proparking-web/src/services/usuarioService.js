import axios from '../api/axios'; // Asegúrate de que la ruta apunte a tu archivo axios.js

export const actualizarPerfil = async (datosPerfil) => {
    try {
        const response = await axios.put('/usuarios/perfil', datosPerfil);
        return response.data;
    } catch (error) {
        throw error;
    }
};