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
        const response = await api.post('/auth/verificar', { correo: email, codigo });
        return response.data;
    } catch (error) {
        throw error.response?.data?.error || 'Código inválido';
    }
};

export const iniciarSesion = async (email, password) => {
    try {
        const response = await api.post('/auth/login', { email, password });
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('rol', response.data.rol);
            localStorage.setItem('nombre', response.data.nombre);
        }
        return response.data;
    } catch (error) {
        throw error.response?.data?.error || 'Credenciales incorrectas';
    }
};