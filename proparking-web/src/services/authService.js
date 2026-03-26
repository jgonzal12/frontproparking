import api from '../api/axios';

export const registrarUsuario = async (datos) => {
    try {
        const response = await api.post('/auth/registro', datos);
        return response.data;
    } catch (error) {
        throw error.response?.data?.error || 'Error en el registro';
    }
};

export const verificarCodigo = async (email, codigo) => {
    try {
        const response = await api.post('/auth/verificar', { email, codigo });
        return response.data;
    } catch (error) {
        throw error.response?.data?.error || 'Código inválido';
    }
};

export const iniciarSesion = async (email, password) => {
    try {
        const response = await api.post('/auth/login', { email, password });
        return response.data;
    } catch (error) {
        throw error.response?.data?.error || 'Credenciales incorrectas';
    }
};

export const cerrarSesion = async () => {
    try {
        await api.post('/auth/logout');
    } catch (error) {
        console.warn('No se pudo invalidar el token en el servidor:', error.message);
    }
};

export const solicitarRecuperacion = async (email) => {
    try {
        const response = await api.post('/auth/recuperar', { email });
        return response.data;
    } catch (error) {
        throw error.response?.data?.error || 'Error al enviar el código';
    }
};

export const restablecerPassword = async (email, codigo, nuevaPassword) => {
    try {
        const response = await api.post('/auth/restablecer', { email, codigo, nuevaPassword });
        return response.data;
    } catch (error) {
        throw error.response?.data?.error || 'Error al restablecer la contraseña';
    }
};