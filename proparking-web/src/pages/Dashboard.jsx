import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { obtenerMisVehiculos, registrarVehiculo, eliminarVehiculo } from '../services/vehiculoService';
import { obtenerParqueaderos } from '../services/parqueaderoService';
import { obtenerMiHistorial, registrarIngreso } from '../services/ingresoService';
import '../styles/Dashboard.css';

function Dashboard() {
    const navigate = useNavigate();
    const { usuario, logout } = useAuth();

    const [vehiculos, setVehiculos]       = useState([]);
    const [parqueaderos, setParqueaderos] = useState([]);
    const [historial, setHistorial]       = useState([]);
    const [cargando, setCargando]         = useState(true);
    const [error, setError]               = useState('');

    const [mostrarModalVehiculo, setMostrarModalVehiculo] = useState(false);
    const [mostrarModalIngreso, setMostrarModalIngreso]   = useState(false);

    const [nuevoVehiculo, setNuevoVehiculo] = useState({ placa: '', marca: '', color: '', tipoVehiculo: 'CARRO' });
    const [nuevoIngreso, setNuevoIngreso]   = useState({ vehiculoId: '', parqueaderoId: '' });

    const cargarDatos = async () => {
        setCargando(true);
        setError('');
        try {
            const [dataVehiculos, dataParqueaderos, dataHistorial] = await Promise.all([
                obtenerMisVehiculos(),
                obtenerParqueaderos(),
                obtenerMiHistorial(),
            ]);
            setVehiculos(dataVehiculos);
            setParqueaderos(dataParqueaderos);
            setHistorial(dataHistorial);
        } catch (err) {
            setError('Error al cargar la información. ' + err);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => { cargarDatos(); }, []);

    const handleLogout = () => { logout(); navigate('/login'); };

    const handleCrearVehiculo = async (e) => {
        e.preventDefault();
        try {
            await registrarVehiculo(nuevoVehiculo);
            setMostrarModalVehiculo(false);
            setNuevoVehiculo({ placa: '', marca: '', color: '', tipoVehiculo: 'CARRO' });
            cargarDatos();
        } catch (err) {
            setError('Error al registrar vehículo: ' + err);
        }
    };

    const handleBorrarVehiculo = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar este vehículo?')) return;
        try {
            await eliminarVehiculo(id);
            cargarDatos();
        } catch (err) {
            setError('Error al eliminar vehículo: ' + err);
        }
    };

    const handleCrearIngreso = async (e) => {
        e.preventDefault();
        try {
            await registrarIngreso(nuevoIngreso.vehiculoId, nuevoIngreso.parqueaderoId);
            setMostrarModalIngreso(false);
            setNuevoIngreso({ vehiculoId: '', parqueaderoId: '' });
            cargarDatos();
        } catch (err) {
            setError('Error al registrar entrada: ' + err);
        }
    };

    return (
        <div className="dashboard-layout">
            <nav className="navbar">
                <div className="navbar-brand"><h1>ProParking</h1></div>
                <div className="navbar-user">
                    <span>Hola, <strong>{usuario?.nombre}</strong></span>
                    <span className="user-role">{usuario?.rol}</span>
                    <button onClick={handleLogout} className="btn-logout">Cerrar Sesión</button>
                </div>
            </nav>

            <main className="dashboard-content">
                <h2>Panel de Cliente</h2>

                {error && <div className="error-msg" style={{ marginBottom: 16 }}>{error}</div>}

                {cargando ? <p>Cargando información...</p> : (
                    <div className="widget-grid">

                        {/* WIDGET 1: VEHÍCULOS */}
                        <div className="widget-card">
                            <h3>Mis Vehículos</h3>
                            {vehiculos.length === 0 ? <p>No tienes vehículos registrados.</p> : (
                                <ul style={{ paddingLeft: 0, listStyle: 'none' }}>
                                    {vehiculos.map(v => (
                                        <li key={v.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, padding: 10, backgroundColor: '#f8fafc', borderRadius: 6 }}>
                                            <div>
                                                <strong>{v.placa}</strong> — {v.marca} ({v.color})<br />
                                                <span style={{ fontSize: 12, color: '#64748b' }}>{v.tipoVehiculo}</span>
                                            </div>
                                            <button onClick={() => handleBorrarVehiculo(v.id)}
                                                style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer', fontSize: 18 }}>
                                                🗑️
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            <button className="btn-primary" onClick={() => setMostrarModalVehiculo(true)}>
                                + Agregar Vehículo
                            </button>
                        </div>

                        {/* WIDGET 2: HISTORIAL */}
                        <div className="widget-card">
                            <h3>Historial de Ingresos</h3>
                            {historial.length === 0 ? <p>No tienes actividad reciente.</p> : (
                                <ul style={{ paddingLeft: 0, listStyle: 'none' }}>
                                    {historial.map(h => (
                                        <li key={h.id} style={{ marginBottom: 10, padding: 10, borderLeft: `4px solid ${h.estado === 'ACTIVO' ? '#22c55e' : '#94a3b8'}`, backgroundColor: '#f8fafc' }}>
                                            <strong>{h.parqueaderoNombre}</strong> — Placa: {h.placaVehiculo}<br />
                                            <span style={{ fontSize: 12 }}>Entrada: {new Date(h.fechaEntrada).toLocaleString()}</span><br />
                                            <span style={{ fontSize: 12, fontWeight: 'bold', color: h.estado === 'ACTIVO' ? '#22c55e' : '#64748b' }}>
                                                Estado: {h.estado}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            {vehiculos.length > 0 && (
                                <button className="btn-solid"
                                    style={{ width: '100%', marginTop: 10, padding: 10, backgroundColor: '#10b981', border: 'none', color: 'white', borderRadius: 6, cursor: 'pointer' }}
                                    onClick={() => setMostrarModalIngreso(true)}>
                                    📍 Registrar Entrada a Parqueadero
                                </button>
                            )}
                        </div>

                    </div>
                )}
            </main>

            {/* MODAL: AGREGAR VEHÍCULO */}
            {mostrarModalVehiculo && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Registrar Vehículo</h3>
                        <form onSubmit={handleCrearVehiculo}>
                            <div className="form-group"><label>Placa</label>
                                <input type="text" required
                                    onChange={e => setNuevoVehiculo({ ...nuevoVehiculo, placa: e.target.value.toUpperCase() })} />
                            </div>
                            <div className="form-group"><label>Marca</label>
                                <input type="text" required
                                    onChange={e => setNuevoVehiculo({ ...nuevoVehiculo, marca: e.target.value })} />
                            </div>
                            <div className="form-group"><label>Color</label>
                                <input type="text" required
                                    onChange={e => setNuevoVehiculo({ ...nuevoVehiculo, color: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Tipo de Vehículo</label>
                                <select style={{ width: '100%', padding: 12 }}
                                    onChange={e => setNuevoVehiculo({ ...nuevoVehiculo, tipoVehiculo: e.target.value })}>
                                    <option value="CARRO">Automóvil</option>
                                    <option value="MOTO">Motocicleta</option>
                                </select>
                            </div>
                            <div className="form-actions">
                                <button type="button" className="btn-secondary"
                                    onClick={() => setMostrarModalVehiculo(false)}>Cancelar</button>
                                <button type="submit" className="btn-primary">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL: REGISTRAR INGRESO */}
            {mostrarModalIngreso && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Registrar Entrada</h3>
                        <form onSubmit={handleCrearIngreso}>
                            <div className="form-group">
                                <label>Selecciona tu Vehículo</label>
                                <select required style={{ width: '100%', padding: 12 }}
                                    onChange={e => setNuevoIngreso({ ...nuevoIngreso, vehiculoId: e.target.value })}>
                                    <option value="">-- Elige un vehículo --</option>
                                    {vehiculos.map(v => <option key={v.id} value={v.id}>{v.placa} — {v.marca}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Selecciona el Parqueadero</label>
                                <select required style={{ width: '100%', padding: 12 }}
                                    onChange={e => setNuevoIngreso({ ...nuevoIngreso, parqueaderoId: e.target.value })}>
                                    <option value="">-- Elige un parqueadero --</option>
                                    {parqueaderos.map(p => (
                                        <option key={p.id} value={p.id}>
                                            {p.nombre} — Cupos disponibles: {p.espaciosDisponibles}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-actions">
                                <button type="button" className="btn-secondary"
                                    onClick={() => setMostrarModalIngreso(false)}>Cancelar</button>
                                <button type="submit" className="btn-primary">Confirmar Entrada</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Dashboard;