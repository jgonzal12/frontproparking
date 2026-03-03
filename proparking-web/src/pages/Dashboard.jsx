import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { obtenerMisVehiculos, registrarVehiculo, eliminarVehiculo } from '../services/vehiculoService';
import { obtenerParqueaderos } from '../services/parqueaderoService';
import { obtenerMiHistorial, registrarIngreso } from '../services/ingresoService';
import '../styles/Dashboard.css';

function Dashboard() {
    const navigate = useNavigate();
    const nombre = localStorage.getItem('nombre') || 'Usuario';
    const rol = localStorage.getItem('rol') || 'CLIENTE';

    // 🔹 Estados de Datos
    const [vehiculos, setVehiculos] = useState([]);
    const [parqueaderos, setParqueaderos] = useState([]);
    const [historial, setHistorial] = useState([]);
    const [cargando, setCargando] = useState(true);

    // 🔹 Estados de Modales
    const [mostrarModalVehiculo, setMostrarModalVehiculo] = useState(false);
    const [mostrarModalIngreso, setMostrarModalIngreso] = useState(false);

    // 🔹 Formularios
    const [nuevoVehiculo, setNuevoVehiculo] = useState({ placa: '', marca: '', color: '', tipoVehiculo: 'CARRO' });
    const [nuevoIngreso, setNuevoIngreso] = useState({ vehiculoId: '', parqueaderoId: '' });

    // 🔹 Cargar toda la información al entrar
    // 🔹 Cargar toda la información de forma independiente
    const cargarDatos = async () => {
        setCargando(true);

        // 1. Cargar Vehículos
        try {
            const dataVehiculos = await obtenerMisVehiculos();
            setVehiculos(dataVehiculos);
        } catch (err) {
            console.error("Error cargando vehículos:", err);
        }

        // 2. Cargar Parqueaderos
        try {
            const dataParqueaderos = await obtenerParqueaderos();
            setParqueaderos(dataParqueaderos);
        } catch (err) {
            console.error("Error cargando parqueaderos:", err);
        }

        // 3. Cargar Historial
        try {
            const dataHistorial = await obtenerMiHistorial();
            setHistorial(dataHistorial);
        } catch (err) {
            console.error("Error cargando historial:", err);
        }

        setCargando(false);
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    // 🔹 Funciones de Vehículos
    const handleCrearVehiculo = async (e) => {
        e.preventDefault();
        try {
            await registrarVehiculo(nuevoVehiculo);
            setMostrarModalVehiculo(false);
            setNuevoVehiculo({ placa: '', marca: '', color: '', tipoVehiculo: ' ' });
            cargarDatos();
        } catch (err) { alert("Error: " + err); }
    };

    const handleBorrarVehiculo = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar este vehículo?')) {
            try {
                await eliminarVehiculo(id);
                cargarDatos();
            } catch (err) { alert("Error: " + err); }
        }
    };

    // 🔹 Función de Ingresos
    const handleCrearIngreso = async (e) => {
    e.preventDefault();
    try {
        await registrarIngreso(nuevoIngreso.vehiculoId, nuevoIngreso.parqueaderoId);
        setMostrarModalIngreso(false);
        setNuevoIngreso({ vehiculoId: '', parqueaderoId: '' });
        cargarDatos(); 
    } catch (err) { 
        // 🔹 MODIFICACIÓN: Muestra el error real del backend
        alert("Error al registrar: " + (err.response?.data?.error || err)); 
    }
};

    return (
        <div className="dashboard-layout">
            <nav className="navbar">
                <div className="navbar-brand"><h1>ProParking</h1></div>
                <div className="navbar-user">
                    <span>Hola, <strong>{nombre}</strong></span>
                    <span className="user-role">{rol}</span>
                    <button onClick={handleLogout} className="btn-logout">Cerrar Sesión</button>
                </div>
            </nav>

            <main className="dashboard-content">
                <h2>Panel de Cliente</h2>
                
                {cargando ? <p>Cargando información...</p> : (
                    <div className="widget-grid">
                        
                        {/* WIDGET 1: VEHÍCULOS */}
                        <div className="widget-card">
                            <h3>Mis Vehículos</h3>
                            {vehiculos.length === 0 ? <p>No tienes vehículos registrados.</p> : (
                                <ul style={{ paddingLeft: '0', listStyle: 'none' }}>
                                    {vehiculos.map((v) => (
                                        <li key={v.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', padding: '10px', backgroundColor: '#f8fafc', borderRadius: '6px' }}>
                                            <div>
                                                <strong>{v.placa}</strong> - {v.marca} ({v.color}) <br/>
                                                <span style={{ fontSize: '12px', color: '#64748b' }}>{v.tipoVehiculo}</span>
                                            </div>
                                            <button onClick={() => handleBorrarVehiculo(v.id)} style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer', fontSize: '18px' }}>
                                                🗑️
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            <button className="btn-primary" onClick={() => setMostrarModalVehiculo(true)}>+ Agregar Vehículo</button>
                        </div>
                        
                        {/* WIDGET 2: HISTORIAL E INGRESOS */}
                        <div className="widget-card">
                            <h3>Historial de Ingresos</h3>
                            {historial.length === 0 ? <p>No tienes actividad reciente.</p> : (
                                <ul style={{ paddingLeft: '0', listStyle: 'none' }}>
                                    {historial.map((h) => (
                                        <li key={h.id} style={{ marginBottom: '10px', padding: '10px', borderLeft: `4px solid ${h.estado === 'ACTIVO' ? '#22c55e' : '#94a3b8'}`, backgroundColor: '#f8fafc' }}>
                                            <strong>{h.parqueaderoNombre}</strong> - Placa: {h.placaVehiculo} <br/>
                                            <span style={{ fontSize: '12px' }}>Entrada: {new Date(h.fechaEntrada).toLocaleString()}</span> <br/>
                                            <span style={{ fontSize: '12px', fontWeight: 'bold', color: h.estado === 'ACTIVO' ? '#22c55e' : '#64748b' }}>Estado: {h.estado}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            {/* Solo permitimos registrar ingreso si el usuario tiene al menos un vehículo */}
                            {vehiculos.length > 0 && (
                                <button className="btn-solid" style={{ width: '100%', marginTop: '10px', padding: '10px', backgroundColor: '#10b981', border: 'none', color: 'white', borderRadius: '6px', cursor: 'pointer' }} 
                                        onClick={() => setMostrarModalIngreso(true)}>
                                    📍 Registrar Entrada a Parqueadero
                                </button>
                            )}
                        </div>

                    </div>
                )}
            </main>

            {/* MODAL 1: AGREGAR VEHÍCULO (El mismo de antes) */}
            {mostrarModalVehiculo && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Registrar Vehículo</h3>
                        <form onSubmit={handleCrearVehiculo}>
                            <div className="form-group"><label>Placa</label><input type="text" required onChange={e => setNuevoVehiculo({...nuevoVehiculo, placa: e.target.value.toUpperCase()})} /></div>
                            <div className="form-group"><label>Marca</label><input type="text" required onChange={e => setNuevoVehiculo({...nuevoVehiculo, marca: e.target.value})} /></div>
                            <div className="form-group"><label>Color</label><input type="text" required onChange={e => setNuevoVehiculo({...nuevoVehiculo, color: e.target.value})} /></div>
                            <div className="form-group">
                                <label>Tipo de Vehículo</label>
                                <select style={{ width: '100%', padding: '12px' }} onChange={e => setNuevoVehiculo({...nuevoVehiculo, tipoVehiculo: e.target.value})}>
                                    <option value="CARRO">Automóvil</option>
                                    <option value="MOTO">Motocicleta</option>
                                </select>
                            </div>
                            <div className="form-actions">
                                <button type="button" className="btn-secondary" onClick={() => setMostrarModalVehiculo(false)}>Cancelar</button>
                                <button type="submit" className="btn-primary">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 2: REGISTRAR INGRESO */}
            {mostrarModalIngreso && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Registrar Entrada</h3>
                        <form onSubmit={handleCrearIngreso}>
                            <div className="form-group">
                                <label>Selecciona tu Vehículo</label>
                                <select required style={{ width: '100%', padding: '12px' }} onChange={e => setNuevoIngreso({...nuevoIngreso, vehiculoId: e.target.value})}>
                                    <option value="">-- Elige un vehículo --</option>
                                    {vehiculos.map(v => <option key={v.id} value={v.id}>{v.placa} - {v.marca}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Selecciona el Parqueadero</label>
                                <select required style={{ width: '100%', padding: '12px' }} onChange={e => setNuevoIngreso({...nuevoIngreso, parqueaderoId: e.target.value})}>
                                    <option value="">-- Elige un parqueadero --</option>
                                    {parqueaderos.map(p => <option key={p.id} value={p.id}>{p.nombre} (Cupos: {p.capacidadTotal})</option>)}
                                </select>
                            </div>
                            <div className="form-actions">
                                <button type="button" className="btn-secondary" onClick={() => setMostrarModalIngreso(false)}>Cancelar</button>
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