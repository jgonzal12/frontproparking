<<<<<<< HEAD
import axios from '../api/axios';
=======
import axios from '../api/axios'; // Asegúrate de que la ruta apunte a tu archivo axios.js
>>>>>>> 39bc538f0eda125f0044d618a9460bafd1c6a8a8

export const actualizarPerfil = async (datosPerfil) => {
    try {
        const response = await axios.put('/usuarios/perfil', datosPerfil);
        return response.data;
    } catch (error) {
<<<<<<< HEAD
        // Propaga el mensaje de error del backend si existe
        throw error.response?.data?.error || 'Error al actualizar el perfil';
=======
        throw error;
>>>>>>> 39bc538f0eda125f0044d618a9460bafd1c6a8a8
    }
};