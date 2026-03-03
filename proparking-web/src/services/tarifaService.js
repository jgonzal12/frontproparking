import api from '../api/axios';

export const obtenerTarifas = async () => {
    try {
        const response = await api.get('/tarifas');
        return response.data;
    } catch (error) {
        throw error.response?.data?.error || 'Error al obtener las tarifas';
    }
};

export const actualizarTarifa = async (id, nuevoValor) => {
    try {
        // Asumiendo que tu backend recibe el valor como un parámetro o en el cuerpo
        const response = await api.put(`/tarifas/${id}?valor=${nuevoValor}`);
        return response.data;
    } catch (error) {
        throw error.response?.data?.error || 'Error al actualizar la tarifa';
    }
};