import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { obtenerTodosLosIngresos } from '../services/ingresoService';
import { registrarSalida } from '../services/pagoService';
import '../styles/Dashboard.css';

function AdminDashboard() {
    const navigate = useNavigate();
    const nombre = localStorage.getItem('nombre') || 'Administrador';
    const rol = localStorage.getItem('rol') || 'ADMIN';

    const [ingresos, setIngresos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');

    // Estado para el Modal de Cobro
    const [mostrarModalPago, setMostrarModalPago] = useState(false);
    const [ingresoSeleccionado, setIngresoSeleccionado] = useState(null);
    const [metodoPago, setMetodoPago] = useState('EFECTIVO'); // 🔹 Asegúrate de que coincida con tu Enum MetodoPago

    const cargarIngresos = async () => {
        try {
            setCargando(true);
            const data = await obtenerTodosLosIngresos();
            setIngresos(data);
        } catch (err) {
            setError(err);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarIngresos();
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    // Abre la ventanita para elegir cómo va a pagar
    const abrirModalCobro = (ingreso) => {
        setIngresoSeleccionado(ingreso);
        setMostrarModalPago(true);
    };

    const handleProcesarSalida = async (e) => {
        e.preventDefault();
        try {
            await registrarSalida(ingresoSeleccionado.id, metodoPago);
            alert("¡Salida y pago registrados con éxito!");
            setMostrarModalPago(false);
            setIngresoSeleccionado(null);
            cargarIngresos(); // Recargamos para que el vehículo desaparezca de "Activos"
        } catch (err) {
            alert("Error al cobrar: " + err);
        }
    };

    // Filtramos para mostrar solo los que siguen adentro del parqueadero
    const ingresosActivos = ingresos.filter(i => i.estado === 'ACTIVO');
    const ingresosFinalizados = ingresos.filter(i => i.estado === 'FINALIZADO');

    return (
        <div className="dashboard-layout">
            <nav className="navbar">
                <div className="navbar-brand">
                    <h1>ProParking <span style={{ color: '#64748b', fontSize: '16px' }}>| Panel de Control</span></h1>
                </div>
                <div className="navbar-user">
                    <span>Hola, <strong>{nombre}</strong></span>
                    <span className="user-role" style={{ backgroundColor: '#fef08a', color: '#854d0e' }}>{rol}</span>
                    <button onClick={handleLogout} className="btn-logout">Cerrar Sesión</button>
                </div>
            </nav>

            <main className="dashboard-content">
                <h2>Gestión del Parqueadero</h2>
                
                {cargando ? <p>Cargando información del parqueadero...</p> : error ? <p style={{color:'red'}}>{error}</p> : (
                    <div className="widget-grid">
                        
                        {/* WIDGET 1: Vehículos Activos (Adentro) */}
                        <div className="widget-card" style={{ gridColumn: 'span 2' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3>Vehículos en Parqueadero</h3>
                                <span style={{ backgroundColor: '#dbeafe', color: '#1e40af', padding: '5px 10px', borderRadius: '15px', fontWeight: 'bold' }}>
                                    Total: {ingresosActivos.length}
                                </span>
                            </div>
                            
                            {ingresosActivos.length === 0 ? <p>No hay vehículos estacionados en este momento.</p> : (
                                <table style={{ width: '100%', textAlign: 'left', marginTop: '15px', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b' }}>
                                            <th style={{ padding: '10px 0' }}>Placa</th>
                                            <th>Vehículo</th>
                                            <th>Hora Entrada</th>
                                            <th>Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {ingresosActivos.map(ingreso => (
                                            <tr key={ingreso.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                <td style={{ padding: '15px 0', fontWeight: 'bold' }}>{ingreso.vehiculo.placa}</td>
                                                <td>{ingreso.vehiculo.tipoVehiculo}</td>
                                                <td>{new Date(ingreso.fechaEntrada).toLocaleTimeString()}</td>
                                                <td>
                                                    <button 
                                                        className="btn-solid" 
                                                        style={{ backgroundColor: '#ef4444', border: 'none', padding: '6px 12px' }}
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
                    </div>
                )}
            </main>

            {/* MODAL DE COBRO */}
            {mostrarModalPago && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Registrar Salida y Cobro</h3>
                        <p>Vehículo: <strong>{ingresoSeleccionado?.vehiculo.placa}</strong></p>
                        <p>Entrada: {new Date(ingresoSeleccionado?.fechaEntrada).toLocaleString()}</p>
                        
                        <form onSubmit={handleProcesarSalida} style={{ marginTop: '20px' }}>
                            <div className="form-group">
                                <label>Método de Pago</label>
                                <select 
                                    style={{ width: '100%', padding: '12px', borderRadius: '6px' }}
                                    value={metodoPago}
                                    onChange={(e) => setMetodoPago(e.target.value)}
                                >
                                    {/* 🔹 Estos valores deben coincidir con el Enum MetodoPago de tu Java */}
                                    <option value="EFECTIVO">Efectivo</option>
                                    <option value="TARJETA_CREDITO">Tarjeta de Crédito</option>
                                    <option value="TARJETA_DEBITO">Tarjeta de Débito</option>
                                    <option value="TRANSFERENCIA_BANCARIA">Transferencia / Nequi</option>
                                </select>
                            </div>
                            
                            <div className="form-actions">
                                <button type="button" className="btn-secondary" onClick={() => setMostrarModalPago(false)}>Cancelar</button>
                                <button type="submit" className="btn-primary" style={{ backgroundColor: '#22c55e' }}>Cobrar y Finalizar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminDashboard;