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
        // Corregido: era 'correo', el backend espera 'email'
        const response = await api.post('/auth/verificar', { email, codigo });
        return response.data;
    } catch (error) {
        throw error.response?.data?.error || 'Código inválido';
    }
};

// login ya no guarda en localStorage directamente —
// eso lo hace AuthContext.login() para mantener el estado centralizado
export const iniciarSesion = async (email, password) => {
    try {
        const response = await api.post('/auth/login', { email, password });
        return response.data;
    } catch (error) {
        throw error.response?.data?.error || 'Credenciales incorrectas';
    }
};