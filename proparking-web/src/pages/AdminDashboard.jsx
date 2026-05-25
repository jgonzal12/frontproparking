import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { obtenerTodosLosIngresos } from '../services/ingresoService';
import { registrarSalida } from '../services/pagoService';
import { obtenerParqueaderos, actualizarTarifas } from '../services/parqueaderoService';
import { useButtonLock, useManyButtonLocks } from '../hooks/useButtonLock';
import '../styles/Dashboard.css';
import api from '../api/axios';

function AdminDashboard() {
    const navigate = useNavigate();
    const { usuario } = useAuth();

    const [ingresos, setIngresos] = useState([]);
    const [parqueaderos, setParqueaderos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [metricas, setMetricas] = useState({ vehiculosActivos: 0, ingresosHoy: 0, totalRecaudadoHoy: 0 });
    const [error, setError] = useState('');
    const [exito, setExito] = useState('');

    const [mostrarModalPago, setMostrarModalPago] = useState(false);
    const [ingresoSeleccionado, setIngresoSeleccionado] = useState(null);
    const [metodoPago, setMetodoPago] = useState('EFECTIVO');

    const [editandoParqueadero, setEditandoParqueadero] = useState(null);
    const [tarifaEdicion, setTarifaEdicion] = useState({ tarifaCarro: '', tarifaMoto: '' });

    // ── Locks anti-doble-click ──────────────────────────────────────────────
    const [procesandoPago, ejecutarProcesarPago] = useButtonLock();
    const [guardandoTarifas, ejecutarGuardarTarifas] = useButtonLock();

    // ── Carga de datos ──────────────────────────────────────────────────────
    const cargarDatos = async () => {
        try {
            setCargando(true);
            const [dataIngresos, dataParqueaderos, dataMetricas] = await Promise.all([
                obtenerTodosLosIngresos(),
                obtenerParqueaderos(),
                api.get('/admin/metricas').then(r => r.data).catch(() => null),
            ]);
            setIngresos(dataIngresos);
            setParqueaderos(dataParqueaderos);
            if (dataMetricas) setMetricas(dataMetricas);
        } catch {
            setError('Error al cargar la información del sistema');
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => { cargarDatos(); }, []);

    const abrirModalCobro = (ingreso) => {
        setIngresoSeleccionado(ingreso);
        setMostrarModalPago(true);
    };

    const handleProcesarSalida = (e) => {
        e.preventDefault();
        ejecutarProcesarPago(async () => {
            try {
                await registrarSalida(ingresoSeleccionado.id, metodoPago);
                setMostrarModalPago(false);
                setIngresoSeleccionado(null);
                setExito('✅ Salida del vehículo registrada exitosamente');
                setTimeout(() => setExito(''), 4000);
                cargarDatos();
            } catch (err) {
                setError('Error al procesar salida: ' + err);
                throw err;
            }
        });
    };

    const abrirEdicionTarifa = (p) => {
        setEditandoParqueadero(p.id);
        setTarifaEdicion({ tarifaCarro: p.tarifaCarro, tarifaMoto: p.tarifaMoto });
    };

    const handleGuardarTarifas = (parqueaderoId) => {
        ejecutarGuardarTarifas(async () => {
            try {
                await actualizarTarifas(
                    parqueaderoId,
                    Number(tarifaEdicion.tarifaCarro),
                    Number(tarifaEdicion.tarifaMoto)
                );
                setEditandoParqueadero(null);
                cargarDatos();
            } catch (err) {
                setError('Error al actualizar tarifas: ' + err);
                throw err;
            }
        });
    };

    const ingresosActivos = ingresos.filter(i => i.estado === 'ACTIVO');
    const espaciosDisponibles = parqueaderos.reduce((sum, p) => sum + p.espaciosDisponibles, 0);
    const capacidadTotal = parqueaderos.reduce((sum, p) => sum + p.capacidadTotal, 0);

    return (
        <div className="dashboard-layout">
            {/* La navbar global ya está en App.jsx — no duplicar aquí */}

            <main className="dashboard-content">
                <h2>Gestión Operativa</h2>

                {exito && <div className="success-msg" style={{ marginBottom: 16 }}>{exito}</div>}
                {error && <div className="error-msg" style={{ marginBottom: 16 }}>{error}</div>}

                {cargando ? <p>Sincronizando con el servidor...</p> : (
                    <>
                        {/* MÉTRICAS */}
                        <div className="metricas-grid">
                            {[
                                { icono: '🚗', valor: metricas.vehiculosActivos, label: 'Vehículos activos' },
                                { icono: '📅', valor: metricas.ingresosHoy, label: 'Ingresos hoy' },
                                { icono: '💰', valor: `$${Number(metricas.totalRecaudadoHoy).toLocaleString()}`, label: 'Recaudado hoy' },
                                { icono: '🅿️', valor: `${espaciosDisponibles}/${capacidadTotal}`, label: 'Espacios disponibles' },
                            ].map(m => (
                                <div key={m.label} className="metrica-card">
                                    <div className="metrica-icono">{m.icono}</div>
                                    <div className="metrica-info">
                                        <span className="metrica-valor">{m.valor}</span>
                                        <span className="metrica-label">{m.label}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="widget-grid">
                            {/* VEHÍCULOS ACTIVOS */}
                            <div className="widget-card" style={{ gridColumn: 'span 2' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, flexWrap: 'wrap', gap: 8 }}>
                                    <h3 style={{ margin: 0 }}>Vehículos en el Parqueadero</h3>
                                    <span className="badge-count">{ingresosActivos.length} activos</span>
                                </div>
                                {ingresosActivos.length === 0 ? (
                                    <p>No hay vehículos en este momento.</p>
                                ) : (
                                    <div className="table-wrapper">
                                        <table className="admin-table">
                                            <thead>
                                                <tr><th>Placa</th><th>Tipo</th><th>Ingreso</th><th>Acción</th></tr>
                                            </thead>
                                            <tbody>
                                                {ingresosActivos.map(ingreso => (
                                                    <tr key={ingreso.id}>
                                                        <td><strong>{ingreso.vehiculo.placa}</strong></td>
                                                        <td>{ingreso.vehiculo.tipoVehiculo}</td>
                                                        <td>{new Date(ingreso.fechaEntrada).toLocaleTimeString()}</td>
                                                        <td>
                                                            <button
                                                                className="btn-action-exit"
                                                                onClick={() => abrirModalCobro(ingreso)}>
                                                                Registrar Salida
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            {/* TARIFAS */}
                            {parqueaderos.map(p => (
                                <div key={p.id} className="widget-card">
                                    <h3>Tarifas — {p.nombre}</h3>
                                    <div className="tarifas-container" style={{ marginTop: 15 }}>
                                        {editandoParqueadero === p.id ? (
                                            <>
                                                <div className="tarifa-item">
                                                    <span className="tarifa-label">Carro ($/hora)</span>
                                                    <input type="number" className="input-inline"
                                                        value={tarifaEdicion.tarifaCarro}
                                                        onChange={e => setTarifaEdicion({ ...tarifaEdicion, tarifaCarro: e.target.value })} />
                                                </div>
                                                <div className="tarifa-item">
                                                    <span className="tarifa-label">Moto ($/hora)</span>
                                                    <input type="number" className="input-inline"
                                                        value={tarifaEdicion.tarifaMoto}
                                                        onChange={e => setTarifaEdicion({ ...tarifaEdicion, tarifaMoto: e.target.value })} />
                                                </div>
                                                <div className="tarifa-actions" style={{ marginTop: 10 }}>
                                                    <button
                                                        className="btn-save"
                                                        onClick={() => handleGuardarTarifas(p.id)}
                                                        disabled={guardandoTarifas}>
                                                        {guardandoTarifas ? '⏳ Guardando...' : '💾 Guardar'}
                                                    </button>
                                                    <button
                                                        className="btn-cancel"
                                                        onClick={() => setEditandoParqueadero(null)}
                                                        disabled={guardandoTarifas}>
                                                        ✖ Cancelar
                                                    </button>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="tarifa-item">
                                                    <span className="tarifa-label">Carro</span>
                                                    <span className="tarifa-value">${p.tarifaCarro}/hora</span>
                                                </div>
                                                <div className="tarifa-item">
                                                    <span className="tarifa-label">Moto</span>
                                                    <span className="tarifa-value">${p.tarifaMoto}/hora</span>
                                                </div>
                                                <button className="btn-edit" style={{ marginTop: 10 }}
                                                    onClick={() => abrirEdicionTarifa(p)}>
                                                    Editar tarifas
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </main>

            {/* MODAL DE SALIDA Y PAGO */}
            {mostrarModalPago && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Finalizar Estancia</h3>
                        <div className="resumen-pago">
                            <p>Vehículo: <strong>{ingresoSeleccionado?.vehiculo.placa}</strong></p>
                            <p>Hora entrada: {new Date(ingresoSeleccionado?.fechaEntrada).toLocaleTimeString()}</p>
                        </div>
                        <form onSubmit={handleProcesarSalida}>
                            <div className="form-group">
                                <label>Método de Pago</label>
                                <select className="full-select" value={metodoPago}
                                    onChange={e => setMetodoPago(e.target.value)}
                                    disabled={procesandoPago}>
                                    <option value="EFECTIVO">Efectivo</option>
                                    <option value="TARJETA_DEBITO">Tarjeta Débito</option>
                                    <option value="TARJETA_CREDITO">Tarjeta Crédito</option>
                                    <option value="TRANSFERENCIA_BANCARIA">Transferencia / Nequi</option>
                                </select>
                            </div>
                            <div className="form-actions">
                                <button type="button" className="btn-secondary"
                                    onClick={() => setMostrarModalPago(false)}
                                    disabled={procesandoPago}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-primary" disabled={procesandoPago}>
                                    {procesandoPago ? '⏳ Procesando...' : 'Confirmar y Cobrar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminDashboard;