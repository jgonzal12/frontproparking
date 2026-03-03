import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { obtenerTodosLosIngresos } from '../services/ingresoService';
import { registrarSalida } from '../services/pagoService';
import { obtenerTarifas, actualizarTarifa } from '../services/tarifaService';
import '../styles/Dashboard.css';

function AdminDashboard() {
    const navigate = useNavigate();
    const nombre = localStorage.getItem('nombre') || 'Administrador';
    const rol = localStorage.getItem('rol') || 'ADMIN';

    // Estados de Datos
    const [ingresos, setIngresos] = useState([]);
    const [tarifas, setTarifas] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');

    // Estados para Modal de Pago/Salida
    const [mostrarModalPago, setMostrarModalPago] = useState(false);
    const [ingresoSeleccionado, setIngresoSeleccionado] = useState(null);
    const [metodoPago, setMetodoPago] = useState('EFECTIVO');

    // Estados para Gestión de Tarifas
    const [editandoTarifa, setEditandoTarifa] = useState(null);
    const [nuevoValorTarifa, setNuevoValorTarifa] = useState('');

    const cargarDatos = async () => {
        try {
            setCargando(true);
            const [dataIngresos, dataTarifas] = await Promise.all([
                obtenerTodosLosIngresos(),
                obtenerTarifas()
            ]);
            setIngresos(dataIngresos);
            setTarifas(dataTarifas);
        } catch (err) {
            setError('Error al cargar la información del sistema');
            console.error(err);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    // --- Lógica de Salida y Pago ---
    const abrirModalCobro = (ingreso) => {
        setIngresoSeleccionado(ingreso);
        setMostrarModalPago(true);
    };

    const handleProcesarSalida = async (e) => {
        e.preventDefault();
        try {
            await registrarSalida(ingresoSeleccionado.id, metodoPago);
            alert("Salida registrada y pago procesado con éxito");
            setMostrarModalPago(false);
            setIngresoSeleccionado(null);
            cargarDatos(); // Recargar ingresos y cualquier cambio
        } catch (err) {
            alert("Error al procesar salida: " + err);
        }
    };

    // --- Lógica de Tarifas ---
    const handleGuardarTarifa = async (id) => {
        try {
            await actualizarTarifa(id, nuevoValorTarifa);
            setEditandoTarifa(null);
            cargarDatos();
            alert("Tarifa actualizada");
        } catch (err) {
            alert("Error al actualizar tarifa: " + err);
        }
    };

    // Filtro de vehículos actualmente en el sitio
    const ingresosActivos = ingresos.filter(i => i.estado === 'ACTIVO');

    return (
        <div className="dashboard-layout">
            <nav className="navbar">
                <div className="navbar-brand">
                    <h1>ProParking <span className="admin-tag">Admin</span></h1>
                </div>
                <div className="navbar-user">
                    <span>Hola, <strong>{nombre}</strong></span>
                    <span className="user-role">{rol}</span>
                    <button onClick={handleLogout} className="btn-logout">Cerrar Sesión</button>
                </div>
            </nav>

            <main className="dashboard-content">
                <h2>Gestión Operativa</h2>

                {cargando ? <p>Sincronizando con el servidor...</p> : (
                    <div className="widget-grid">

                        {/* WIDGET 1: VEHÍCULOS ACTIVOS */}
                        <div className="widget-card" style={{ gridColumn: 'span 2' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                                <h3>Vehículos en el Parqueadero</h3>
                                <span className="badge-count">{ingresosActivos.length} activos</span>
                            </div>

                            {ingresosActivos.length === 0 ? (
                                <p>No hay vehículos registrados en este momento.</p>
                            ) : (
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Placa</th>
                                            <th>Tipo</th>
                                            <th>Ingreso</th>
                                            <th>Acción</th>
                                        </tr>
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
                                                        onClick={() => abrirModalCobro(ingreso)}
                                                    >
                                                        Registrar Salida
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        {/* WIDGET 2: GESTIÓN DE TARIFAS */}
                        <div className="widget-card">
                            <h3>Tarifas por Hora</h3>
                            <div className="tarifas-container" style={{ marginTop: '15px' }}>
                                {tarifas.map(t => (
                                    <div key={t.id} className="tarifa-item">
                                        <div className="tarifa-info">
                                            <span className="tarifa-label">{t.tipoVehiculo}</span>
                                            {editandoTarifa === t.id ? (
                                                <input
                                                    type="number"
                                                    className="input-inline"
                                                    value={nuevoValorTarifa}
                                                    onChange={(e) => setNuevoValorTarifa(e.target.value)}
                                                />
                                            ) : (
                                                <span className="tarifa-value">${t.valorPorHora}</span>
                                            )}
                                        </div>
                                        <div className="tarifa-actions">
                                            {editandoTarifa === t.id ? (
                                                <>
                                                    <button className="btn-save" onClick={() => handleGuardarTarifa(t.id)}>💾</button>
                                                    <button className="btn-cancel" onClick={() => setEditandoTarifa(null)}>✖</button>
                                                </>
                                            ) : (
                                                <button
                                                    className="btn-edit"
                                                    onClick={() => {
                                                        setEditandoTarifa(t.id);
                                                        setNuevoValorTarifa(t.valorPorHora);
                                                    }}
                                                >
                                                    Editar
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

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
                                <select
                                    className="full-select"
                                    value={metodoPago}
                                    onChange={(e) => setMetodoPago(e.target.value)}
                                >
                                    <option value="EFECTIVO">Efectivo</option>
                                    <option value="TARJETA_DEBITO">Tarjeta Débito</option>
                                    <option value="TARJETA_CREDITO">Tarjeta Crédito</option>
                                    <option value="TRANSFERENCIA">Transferencia / Nequi</option>
                                </select>
                            </div>
                            <div className="form-actions">
                                <button type="button" className="btn-secondary" onClick={() => setMostrarModalPago(false)}>Cancelar</button>
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