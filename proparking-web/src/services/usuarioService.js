import axios from '../api/axios';

/**
 * PUT /api/v1/usuarios/perfil
 * Actualiza el email del usuario autenticado.
 * datosPerfil: { email: string }
 */
export const actualizarPerfil = async (datosPerfil) => {
    try {
        // El backend espera el campo "email" (no "correo")
        const payload = { email: datosPerfil.correo ?? datosPerfil.email };
        const response = await axios.put('/usuarios/perfil', payload);
        return response.data;
    } catch (error) {
        throw error;
    }
};

/**
 * PUT /api/v1/usuarios/password
 * Cambia la contraseña del usuario autenticado.
 * datos: { passwordActual: string, nuevaPassword: string }
 */
export const cambiarPassword = async (datos) => {
    try {
        const response = await axios.put('/usuarios/password', datos);
        return response.data;
    } catch (error) {
        throw error;
    }
};