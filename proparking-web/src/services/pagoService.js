import api from '../api/axios';

export const registrarSalida = async (ingresoId, metodoPago) => {
    try {
        // Llamamos al PagoController mandando el ID en la ruta y el método de pago como parámetro
        const response = await api.post(`/pagos/salida/${ingresoId}?metodoPago=${metodoPago}`);
        return response.data;
    } catch (error) {
        throw error.response?.data?.error || 'Error al procesar la salida y el pago';
    }
};