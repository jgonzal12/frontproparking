import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { obtenerTodosLosIngresos } from '../services/ingresoService';
import { registrarSalida } from '../services/pagoService';
import { obtenerParqueaderos, actualizarTarifas } from '../services/parqueaderoService';
import '../styles/Dashboard.css';

function AdminDashboard() {
    const navigate = useNavigate();
    const { usuario, logout } = useAuth();

    const [ingresos, setIngresos]         = useState([]);
    const [parqueaderos, setParqueaderos] = useState([]);
    const [cargando, setCargando]         = useState(true);
    const [error, setError]               = useState('');
    const [exito, setExito]               = useState('');

    const [mostrarModalPago, setMostrarModalPago]       = useState(false);
    const [ingresoSeleccionado, setIngresoSeleccionado] = useState(null);
    const [metodoPago, setMetodoPago]                   = useState('EFECTIVO');

    const [editandoParqueadero, setEditandoParqueadero] = useState(null);
    const [tarifaEdicion, setTarifaEdicion]             = useState({ tarifaCarro: '', tarifaMoto: '' });

    const cargarDatos = async () => {
        try {
            setCargando(true);
            const [dataIngresos, dataParqueaderos] = await Promise.all([
                obtenerTodosLosIngresos(),
                obtenerParqueaderos(),
            ]);
            setIngresos(dataIngresos);
            setParqueaderos(dataParqueaderos);
        } catch (err) {
            setError('Error al cargar la información del sistema');
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => { cargarDatos(); }, []);

    const handleLogout = () => { logout(); navigate('/login'); };

    const abrirModalCobro = (ingreso) => {
        setIngresoSeleccionado(ingreso);
        setMostrarModalPago(true);
    };

    const handleProcesarSalida = async (e) => {
        e.preventDefault();
        try {
            await registrarSalida(ingresoSeleccionado.id, metodoPago);
            setMostrarModalPago(false);
            setIngresoSeleccionado(null);
            setExito('✅ Salida del vehículo registrada exitosamente');
            setTimeout(() => setExito(''), 4000);
            cargarDatos();
        } catch (err) {
            setError('Error al procesar salida: ' + err);
        }
    };

    const abrirEdicionTarifa = (p) => {
        setEditandoParqueadero(p.id);
        setTarifaEdicion({ tarifaCarro: p.tarifaCarro, tarifaMoto: p.tarifaMoto });
    };

    const handleGuardarTarifas = async (parqueaderoId) => {
        try {
            await actualizarTarifas(parqueaderoId, Number(tarifaEdicion.tarifaCarro), Number(tarifaEdicion.tarifaMoto));
            setEditandoParqueadero(null);
            cargarDatos();
        } catch (err) {
            setError('Error al actualizar tarifas: ' + err);
        }
    };

    const ingresosActivos   = ingresos.filter(i => i.estado === 'ACTIVO');
    const ingresosHoy       = ingresos.filter(i => {
        const hoy = new Date().toDateString();
        return new Date(i.fechaEntrada).toDateString() === hoy;
    });
    const totalRecaudadoHoy = ingresos
        .filter(i => (i.estado === 'FINALIZADO' || i.estado === 'PAGADO') && 
            new Date(i.fechaEntrada).toDateString() === new Date().toDateString())
        .reduce((sum, i) => sum + (i.monto || 0), 0);

    const espaciosDisponibles = parqueaderos.reduce((sum, p) => sum + p.espaciosDisponibles, 0);
    const capacidadTotal      = parqueaderos.reduce((sum, p) => sum + p.capacidadTotal, 0);

    return (
        <div className="dashboard-layout">
            <nav className="navbar">
                <div className="navbar-brand">
                    <h1>ProParking <span className="admin-tag">Admin</span></h1>
                </div>
                <div className="navbar-user">
                    <span className="navbar-saludo">Hola, <strong>{usuario?.nombre}</strong></span>
                    <span className="user-role">{usuario?.rol}</span>
                    <button onClick={() => navigate('/reportes')} className="btn-reportes">📊 Reportes</button>
                    <button onClick={handleLogout} className="btn-logout">Cerrar Sesión</button>
                </div>
            </nav>

            <main className="dashboard-content">
                <h2>Gestión Operativa</h2>

                {exito && <div className="success-msg" style={{ marginBottom: 16 }}>{exito}</div>}
                {error && <div className="error-msg"   style={{ marginBottom: 16 }}>{error}</div>}

                {cargando ? <p>Sincronizando con el servidor...</p> : (
                    <>
                        {/* MÉTRICAS */}
                        <div className="metricas-grid">
                            <div className="metrica-card">
                                <div className="metrica-icono">🚗</div>
                                <div className="metrica-info">
                                    <span className="metrica-valor">{ingresosActivos.length}</span>
                                    <span className="metrica-label">Vehículos activos</span>
                                </div>
                            </div>
                            <div className="metrica-card">
                                <div className="metrica-icono">📅</div>
                                <div className="metrica-info">
                                    <span className="metrica-valor">{ingresosHoy.length}</span>
                                    <span className="metrica-label">Ingresos hoy</span>
                                </div>
                            </div>
                            <div className="metrica-card">
                                <div className="metrica-icono">💰</div>
                                <div className="metrica-info">
                                    <span className="metrica-valor">${totalRecaudadoHoy.toLocaleString()}</span>
                                    <span className="metrica-label">Recaudado hoy</span>
                                </div>
                            </div>
                            <div className="metrica-card">
                                <div className="metrica-icono">🅿️</div>
                                <div className="metrica-info">
                                    <span className="metrica-valor">{espaciosDisponibles}/{capacidadTotal}</span>
                                    <span className="metrica-label">Espacios disponibles</span>
                                </div>
                            </div>
                        </div>

                        <div className="widget-grid">
                            {/* WIDGET: VEHÍCULOS ACTIVOS */}
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
                                                <tr>
                                                    <th>Placa</th><th>Tipo</th><th>Ingreso</th><th>Acción</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {ingresosActivos.map(ingreso => (
                                                    <tr key={ingreso.id}>
                                                        <td><strong>{ingreso.vehiculo.placa}</strong></td>
                                                        <td>{ingreso.vehiculo.tipoVehiculo}</td>
                                                        <td>{new Date(ingreso.fechaEntrada).toLocaleTimeString()}</td>
                                                        <td>
                                                            <button className="btn-action-exit"
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

                            {/* WIDGET: TARIFAS */}
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
                                                    <button className="btn-save" onClick={() => handleGuardarTarifas(p.id)}>💾 Guardar</button>
                                                    <button className="btn-cancel" onClick={() => setEditandoParqueadero(null)}>✖ Cancelar</button>
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
                                    onChange={e => setMetodoPago(e.target.value)}>
                                    <option value="EFECTIVO">Efectivo</option>
                                    <option value="TARJETA_DEBITO">Tarjeta Débito</option>
                                    <option value="TARJETA_CREDITO">Tarjeta Crédito</option>
                                    <option value="TRANSFERENCIA_BANCARIA">Transferencia / Nequi</option>
                                </select>
                            </div>
                            <div className="form-actions">
                                <button type="button" className="btn-secondary"
                                    onClick={() => setMostrarModalPago(false)}>Cancelar</button>
                                <button type="submit" className="btn-primary">Confirmar y Cobrar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminDashboard;