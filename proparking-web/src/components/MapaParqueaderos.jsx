import { useEffect, useRef } from 'react';

// Carga Leaflet dinámicamente desde CDN — sin instalar dependencias
const LEAFLET_CSS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
const LEAFLET_JS  = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';

function cargarLeaflet() {
    return new Promise((resolve) => {
        if (window.L) { resolve(window.L); return; }

        const link = document.createElement('link');
        link.rel  = 'stylesheet';
        link.href = LEAFLET_CSS;
        document.head.appendChild(link);

        const script = document.createElement('script');
        script.src = LEAFLET_JS;
        script.onload = () => resolve(window.L);
        document.head.appendChild(script);
    });
}

// modoRegistro: si true muestra botón "Registrar entrada" en el popup
function MapaParqueaderos({ parqueaderos, modoRegistro = false, onRegistrar }) {
    const mapaRef    = useRef(null);
    const instanciaRef = useRef(null);

    useEffect(() => {
        if (!mapaRef.current) return;

        cargarLeaflet().then((L) => {
            // Destruir instancia previa si existe
            if (instanciaRef.current) {
                instanciaRef.current.remove();
                instanciaRef.current = null;
            }

            // Centro de Bogotá
            const mapa = L.map(mapaRef.current).setView([4.7110, -74.0721], 12);
            instanciaRef.current = mapa;

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(mapa);

            // Ícono personalizado según disponibilidad
            const iconoDisponible = L.divIcon({
                className: '',
                html: `<div style="
                    background:#16a34a; color:white; border-radius:50%;
                    width:32px; height:32px; display:flex; align-items:center;
                    justify-content:center; font-size:18px;
                    box-shadow:0 2px 6px rgba(0,0,0,0.3);">🅿</div>`,
                iconSize: [32, 32],
                iconAnchor: [16, 32],
            });

            const iconoLleno = L.divIcon({
                className: '',
                html: `<div style="
                    background:#dc2626; color:white; border-radius:50%;
                    width:32px; height:32px; display:flex; align-items:center;
                    justify-content:center; font-size:18px;
                    box-shadow:0 2px 6px rgba(0,0,0,0.3);">🅿</div>`,
                iconSize: [32, 32],
                iconAnchor: [16, 32],
            });

            const conCoordenadas = parqueaderos.filter(p => p.latitud && p.longitud);

            conCoordenadas.forEach(p => {
                const disponible = p.espaciosDisponibles > 0;
                const icono = disponible ? iconoDisponible : iconoLleno;

                const botonRegistrar = modoRegistro && disponible
                    ? `<br/><button
                            onclick="window.__registrarEntrada('${p.id}')"
                            style="margin-top:10px;padding:7px 14px;background:#1e40af;
                                   color:white;border:none;border-radius:6px;
                                   cursor:pointer;font-size:13px;width:100%;">
                            Registrar entrada
                       </button>`
                    : '';

                const estadoColor = disponible ? '#16a34a' : '#dc2626';
                const estadoTexto = disponible
                    ? `${p.espaciosDisponibles} espacios disponibles`
                    : 'Sin espacios disponibles';

                const popup = `
                    <div style="min-width:200px;font-family:sans-serif">
                        <strong style="font-size:15px">${p.nombre}</strong><br/>
                        <span style="color:#64748b;font-size:13px">${p.direccion || ''}</span><br/><br/>
                        <span style="color:${estadoColor};font-weight:600;font-size:13px">● ${estadoTexto}</span><br/>
                        <span style="font-size:12px;color:#475569">
                            🚗 $${p.tarifaCarro}/h &nbsp;&nbsp; 🏍 $${p.tarifaMoto}/h
                        </span>
                        ${botonRegistrar}
                    </div>`;

                L.marker([p.latitud, p.longitud], { icon: icono })
                    .addTo(mapa)
                    .bindPopup(popup);
            });

            // Ajustar vista si hay marcadores
            if (conCoordenadas.length > 0) {
                const bounds = L.latLngBounds(conCoordenadas.map(p => [p.latitud, p.longitud]));
                mapa.fitBounds(bounds, { padding: [40, 40] });
            }
        });

        return () => {
            if (instanciaRef.current) {
                instanciaRef.current.remove();
                instanciaRef.current = null;
            }
        };
    }, [parqueaderos, modoRegistro]);

    // Puente global para el botón del popup → callback React
    useEffect(() => {
        window.__registrarEntrada = (parqueaderoId) => {
            if (onRegistrar) onRegistrar(parqueaderoId);
        };
        return () => { delete window.__registrarEntrada; };
    }, [onRegistrar]);

    return (
        <div
            ref={mapaRef}
            style={{ width: '100%', height: '100%', borderRadius: 12, zIndex: 0 }}
        />
    );
}

export default MapaParqueaderos;