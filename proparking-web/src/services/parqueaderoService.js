import api from '../api/axios';

export const obtenerParqueaderos = async () => {
    try {
        const response = await api.get('/parqueaderos');
        return response.data;
    } catch (error) {
        throw error.response?.data?.error || 'Error al cargar los parqueaderos';
    }
};

// Actualiza tarifaCarro y tarifaMoto de un parqueadero
// Las tarifas ahora viven en el parqueadero directamente
export const actualizarTarifas = async (parqueaderoId, tarifaCarro, tarifaMoto) => {
    try {
        const response = await api.put(`/parqueaderos/${parqueaderoId}/tarifas`, {
            tarifaCarro,
            tarifaMoto,
        });
        return response.data;
    } catch (error) {
        throw error.response?.data?.error || 'Error al actualizar las tarifas';
    }
};