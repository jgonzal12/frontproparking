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

    // Modal de salida/pago
    const [mostrarModalPago, setMostrarModalPago]         = useState(false);
    const [ingresoSeleccionado, setIngresoSeleccionado]   = useState(null);
    const [metodoPago, setMetodoPago]                     = useState('EFECTIVO');

    // Edición de tarifas
    const [editandoParqueadero, setEditandoParqueadero]   = useState(null);
    const [tarifaEdicion, setTarifaEdicion]               = useState({ tarifaCarro: '', tarifaMoto: '' });

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

    // --- Salida y pago ---
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
            cargarDatos();
        } catch (err) {
            setError('Error al procesar salida: ' + err);
        }
    };

    // --- Tarifas ---
    const abrirEdicionTarifa = (p) => {
        setEditandoParqueadero(p.id);
        setTarifaEdicion({ tarifaCarro: p.tarifaCarro, tarifaMoto: p.tarifaMoto });
    };

    const handleGuardarTarifas = async (parqueaderoId) => {
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
        }
    };

    const ingresosActivos = ingresos.filter(i => i.estado === 'ACTIVO');

    return (
        <div className="dashboard-layout">
            <nav className="navbar">
                <div className="navbar-brand">
                    <h1>ProParking <span className="admin-tag">Admin</span></h1>
                </div>
                <div className="navbar-user">
                    <span>Hola, <strong>{usuario?.nombre}</strong></span>
                    <span className="user-role">{usuario?.rol}</span>
                    <button onClick={handleLogout} className="btn-logout">Cerrar Sesión</button>
                </div>
            </nav>

            <main className="dashboard-content">
                <h2>Gestión Operativa</h2>

                {error && <div className="error-msg" style={{ marginBottom: 16 }}>{error}</div>}

                {cargando ? <p>Sincronizando con el servidor...</p> : (
                    <div className="widget-grid">

                        {/* WIDGET 1: VEHÍCULOS ACTIVOS */}
                        <div className="widget-card" style={{ gridColumn: 'span 2' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 15 }}>
                                <h3>Vehículos en el Parqueadero</h3>
                                <span className="badge-count">{ingresosActivos.length} activos</span>
                            </div>
                            {ingresosActivos.length === 0 ? (
                                <p>No hay vehículos en este momento.</p>
                            ) : (
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
                            )}
                        </div>

                        {/* WIDGET 2: TARIFAS POR PARQUEADERO */}
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
                                                    onChange={e => setTarifaEdicion({
                                                        ...tarifaEdicion, tarifaCarro: e.target.value
                                                    })} />
                                            </div>
                                            <div className="tarifa-item">
                                                <span className="tarifa-label">Moto ($/hora)</span>
                                                <input type="number" className="input-inline"
                                                    value={tarifaEdicion.tarifaMoto}
                                                    onChange={e => setTarifaEdicion({
                                                        ...tarifaEdicion, tarifaMoto: e.target.value
                                                    })} />
                                            </div>
                                            <div className="tarifa-actions" style={{ marginTop: 10 }}>
                                                <button className="btn-save"
                                                    onClick={() => handleGuardarTarifas(p.id)}>💾 Guardar</button>
                                                <button className="btn-cancel"
                                                    onClick={() => setEditandoParqueadero(null)}>✖ Cancelar</button>
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
                                    <option value="TRANSFERENCIA">Transferencia / Nequi</option>
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