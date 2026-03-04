import api from '../api/axios';

export const obtenerReporte = async (parqueaderoId) => {
    try {
        const response = await api.get(`/admin/reportes/detalle/parqueadero/${parqueaderoId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data?.error || 'Error al cargar el reporte';
    }
};

export const descargarPdf = async (parqueaderoId, nombreParqueadero) => {
    try {
        const response = await api.get(`/admin/reportes/exportar/pdf/${parqueaderoId}`, {
            responseType: 'blob',
        });
        const url  = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href  = url;
        link.setAttribute('download', `reporte-${nombreParqueadero}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    } catch (error) {
        throw 'Error al descargar el PDF';
    }
};

export const descargarExcel = async (parqueaderoId, nombreParqueadero) => {
    try {
        const response = await api.get(`/admin/reportes/exportar/excel/${parqueaderoId}`, {
            responseType: 'blob',
        });
        const url  = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href  = url;
        link.setAttribute('download', `reporte-${nombreParqueadero}.xlsx`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    } catch (error) {
        throw 'Error al descargar el Excel';
    }
};