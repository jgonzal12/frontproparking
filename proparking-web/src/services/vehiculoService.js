import api from '../api/axios';

export const obtenerMisVehiculos = async () => {
    try {
        // Llamamos directamente a /vehiculos, el backend filtra por el token
        const response = await api.get('/vehiculos'); 
        return response.data;
    } catch (error) {
        throw error.response?.data?.error || 'Error al obtener los vehículos';
    }
};

export const registrarVehiculo = async (datosVehiculo) => {
    try {
        // En tu backend (TipoVehiculo.java) seguro tienes un Enum. 
        // Enviaremos los datos en el formato que Java espera.
        const response = await api.post('/vehiculos', datosVehiculo);
        return response.data;
    } catch (error) {
        throw error.response?.data?.error || 'Error al registrar el vehículo';
    }
};

export const eliminarVehiculo = async (id) => {
    try {
        const response = await api.delete(`/vehiculos/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data?.error || 'Error al eliminar el vehículo';
    }
};