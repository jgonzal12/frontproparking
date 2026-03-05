import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { obtenerMisVehiculos, registrarVehiculo, eliminarVehiculo } from '../services/vehiculoService';
import { obtenerParqueaderos } from '../services/parqueaderoService';
import { obtenerMiHistorial, registrarIngreso } from '../services/ingresoService';
import MapaParqueaderos from '../components/MapaParqueaderos';
import '../styles/Dashboard.css';

function Dashboard() {
    const navigate = useNavigate();
    const { usuario, logout } = useAuth();

    const [vehiculos, setVehiculos]       = useState([]);
    const [parqueaderos, setParqueaderos] = useState([]);
    const [historial, setHistorial]       = useState([]);
    const [cargando, setCargando]         = useState(true);
    const [error, setError]               = useState('');
    const [vista, setVista]               = useState('mapa'); // 'mapa' | 'lista'

    const [mostrarModalVehiculo, setMostrarModalVehiculo] = useState(false);
    const [errorVehiculo, setErrorVehiculo]                 = useState('');
    const [errorIngreso, setErrorIngreso]                   = useState('');
    const [mostrarModalIngreso, setMostrarModalIngreso]   = useState(false);
    const [parqueaderoPreseleccionado, setParqueaderoPreseleccionado] = useState('');

    const [nuevoVehiculo, setNuevoVehiculo] = useState({ placa: '', marca: '', color: '', tipoVehiculo: 'CARRO' });

    // Filtros historial
    const [filtroEstado, setFiltroEstado] = useState('');
    const [filtroDesde, setFiltroDesde]   = useState('');
    const [filtroHasta, setFiltroHasta]   = useState('');
    const [cargandoHistorial, setCargandoHistorial] = useState(false);
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

    const aplicarFiltros = async () => {
        setCargandoHistorial(true);
        try {
            const data = await obtenerMiHistorial({
                estado: filtroEstado || undefined,
                desde:  filtroDesde  || undefined,
                hasta:  filtroHasta  || undefined,
            });
            setHistorial(data);
        } catch (err) {
            setError('Error al filtrar historial: ' + err);
        } finally {
            setCargandoHistorial(false);
        }
    };

    const limpiarFiltros = async () => {
        setFiltroEstado('');
        setFiltroDesde('');
        setFiltroHasta('');
        setCargandoHistorial(true);
        try {
            const data = await obtenerMiHistorial();
            setHistorial(data);
        } finally {
            setCargandoHistorial(false);
        }
    };

    const handleLogout = () => { logout(); navigate('/login'); };

    // Abre el modal de ingreso preseleccionando el parqueadero del mapa
    const handleRegistrarDesdesMapa = useCallback((parqueaderoId) => {
        if (vehiculos.length === 0) {
            setError('Debes registrar un vehículo antes de ingresar a un parqueadero.');
            return;
        }
        setParqueaderoPreseleccionado(parqueaderoId);
        setNuevoIngreso({ vehiculoId: '', parqueaderoId });
        setMostrarModalIngreso(true);
    }, [vehiculos]);

    const handleCrearVehiculo = async (e) => {
        e.preventDefault();
        setErrorVehiculo('');
        try {
            await registrarVehiculo(nuevoVehiculo);
            setMostrarModalVehiculo(false);
            setErrorVehiculo('');
            setNuevoVehiculo({ placa: '', marca: '', color: '', tipoVehiculo: 'CARRO' });
            cargarDatos();
        } catch (err) {
            setErrorVehiculo('Error al registrar vehículo: ' + err);
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
            setParqueaderoPreseleccionado('');
            cargarDatos();
        } catch (err) {
            setErrorIngreso('Error al registrar entrada: ' + err);
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

                        {/* WIDGET MAPA — ocupa todo el ancho */}
                        <div className="widget-card" style={{ gridColumn: 'span 2' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                <h3>Parqueaderos Disponibles</h3>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    {['mapa', 'lista'].map(v => (
                                        <button key={v} onClick={() => setVista(v)} style={{
                                            padding: '6px 16px', borderRadius: 8, border: 'none',
                                            cursor: 'pointer', fontWeight: 600, fontSize: 13,
                                            backgroundColor: vista === v ? '#1e40af' : '#e2e8f0',
                                            color: vista === v ? 'white' : '#475569',
                                        }}>
                                            {v === 'mapa' ? '🗺️ Mapa' : '📋 Lista'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {vista === 'mapa' ? (
                                <div style={{ height: 400 }}>
                                    <MapaParqueaderos
                                        parqueaderos={parqueaderos}
                                        modoRegistro={true}
                                        onRegistrar={handleRegistrarDesdesMapa}
                                    />
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    {parqueaderos.map(p => (
                                        <div key={p.id} style={{
                                            display: 'flex', justifyContent: 'space-between',
                                            alignItems: 'center', padding: 14,
                                            backgroundColor: '#f8fafc', borderRadius: 8,
                                            borderLeft: `4px solid ${p.espaciosDisponibles > 0 ? '#16a34a' : '#dc2626'}`
                                        }}>
                                            <div>
                                                <strong>{p.nombre}</strong>
                                                <div style={{ fontSize: 13, color: '#64748b' }}>{p.direccion}</div>
                                                <div style={{ fontSize: 12, marginTop: 4 }}>
                                                    🚗 ${p.tarifaCarro}/h &nbsp; 🏍 ${p.tarifaMoto}/h
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{
                                                    fontWeight: 700, fontSize: 15,
                                                    color: p.espaciosDisponibles > 0 ? '#16a34a' : '#dc2626'
                                                }}>
                                                    {p.espaciosDisponibles > 0
                                                        ? `${p.espaciosDisponibles} disponibles`
                                                        : 'Sin espacios'}
                                                </div>
                                                {p.espaciosDisponibles > 0 && (
                                                    <button onClick={() => handleRegistrarDesdesMapa(p.id)}
                                                        style={{
                                                            marginTop: 8, padding: '6px 14px',
                                                            backgroundColor: '#1e40af', color: 'white',
                                                            border: 'none', borderRadius: 6,
                                                            cursor: 'pointer', fontSize: 13
                                                        }}>
                                                        Registrar entrada
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* WIDGET VEHÍCULOS */}
                        <div className="widget-card">
                            <h3>Mis Vehículos</h3>
                            {vehiculos.length === 0 ? <p>No tienes vehículos registrados.</p> : (
                                <ul style={{ paddingLeft: 0, listStyle: 'none' }}>
                                    {vehiculos.map(v => (
                                        <li key={v.id} style={{
                                            display: 'flex', justifyContent: 'space-between',
                                            marginBottom: 10, padding: 10,
                                            backgroundColor: '#f8fafc', borderRadius: 6
                                        }}>
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
                            <button className="btn-primary" onClick={() => { setMostrarModalVehiculo(true); setErrorVehiculo(''); }}>
                                + Agregar Vehículo
                            </button>
                        </div>

                        {/* WIDGET HISTORIAL */}
                        <div className="widget-card">
                            <h3>Historial de Pagos</h3>

                            {/* Filtros */}
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                                <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}
                                    style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 13, flex: 1 }}>
                                    <option value="">Todos</option>
                                    <option value="ACTIVO">Activo</option>
                                    <option value="FINALIZADO">Finalizado</option>
                                </select>
                                <input type="date" value={filtroDesde} onChange={e => setFiltroDesde(e.target.value)}
                                    style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 13, flex: 1 }} />
                                <input type="date" value={filtroHasta} onChange={e => setFiltroHasta(e.target.value)}
                                    style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 13, flex: 1 }} />
                                <button onClick={aplicarFiltros}
                                    style={{ padding: '6px 12px', backgroundColor: '#1e40af', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>
                                    🔍 Filtrar
                                </button>
                                <button onClick={limpiarFiltros}
                                    style={{ padding: '6px 12px', backgroundColor: '#e2e8f0', color: '#475569', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>
                                    ✖ Limpiar
                                </button>
                            </div>

                            {cargandoHistorial ? <p>Cargando...</p> : historial.length === 0 ? (
                                <p style={{ color: '#94a3b8', textAlign: 'center', marginTop: 20 }}>No hay registros para los filtros seleccionados.</p>
                            ) : (
                                <ul style={{ paddingLeft: 0, listStyle: 'none', maxHeight: 360, overflowY: 'auto' }}>
                                    {historial.map(h => (
                                        <li key={h.id} style={{
                                            marginBottom: 10, padding: 12,
                                            borderLeft: `4px solid ${h.estado === 'ACTIVO' ? '#22c55e' : '#2563eb'}`,
                                            backgroundColor: '#f8fafc', borderRadius: 6
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <div>
                                                    <strong>{h.parqueaderoNombre}</strong>
                                                    <span style={{ fontSize: 12, color: '#64748b', marginLeft: 8 }}>🚗 {h.placaVehiculo}</span>
                                                </div>
                                                {h.monto && (
                                                    <strong style={{ color: '#16a34a', fontSize: 15 }}>
                                                        ${h.monto.toLocaleString()}
                                                    </strong>
                                                )}
                                            </div>
                                            <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                                                📅 {new Date(h.fechaEntrada).toLocaleString()}
                                                {h.fechaSalida && <> → {new Date(h.fechaSalida).toLocaleString()}</>}
                                            </div>
                                            <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
                                                <span style={{
                                                    fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 12,
                                                    backgroundColor: h.estado === 'ACTIVO' ? '#dcfce7' : '#dbeafe',
                                                    color: h.estado === 'ACTIVO' ? '#16a34a' : '#1e40af'
                                                }}>{h.estado}</span>
                                                {h.metodoPago && (
                                                    <span style={{
                                                        fontSize: 11, padding: '2px 8px', borderRadius: 12,
                                                        backgroundColor: '#f1f5f9', color: '#475569'
                                                    }}>💳 {h.metodoPago.replace('_', ' ')}</span>
                                                )}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
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
                        {errorVehiculo && <div className="error-msg" style={{ marginBottom: 12 }}>{errorVehiculo}</div>}
                        <form onSubmit={handleCrearVehiculo}>
                            <div className="form-group"><label>Placa</label>
                                <input type="text" required
                                    value={nuevoVehiculo.placa}
                                    onChange={e => setNuevoVehiculo({ ...nuevoVehiculo, placa: e.target.value.toUpperCase() })} />
                            </div>
                            <div className="form-group"><label>Marca</label>
                                <input type="text" required
                                    value={nuevoVehiculo.marca}
                                    onChange={e => setNuevoVehiculo({ ...nuevoVehiculo, marca: e.target.value })} />
                            </div>
                            <div className="form-group"><label>Color</label>
                                <input type="text" required
                                    value={nuevoVehiculo.color}
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
                        {errorIngreso && <div className="error-msg" style={{ marginBottom: 12 }}>{errorIngreso}</div>}
                        <form onSubmit={handleCrearIngreso}>
                            <div className="form-group">
                                <label>Selecciona tu Vehículo</label>
                                <select required style={{ width: '100%', padding: 12 }}
                                    onChange={e => setNuevoIngreso({ ...nuevoIngreso, vehiculoId: e.target.value })}>
                                    <option value="">-- Elige un vehículo --</option>
                                    {vehiculos.map(v => (
                                        <option key={v.id} value={v.id}>{v.placa} — {v.marca}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Parqueadero</label>
                                <select required style={{ width: '100%', padding: 12 }}
                                    value={nuevoIngreso.parqueaderoId}
                                    onChange={e => setNuevoIngreso({ ...nuevoIngreso, parqueaderoId: e.target.value })}>
                                    <option value="">-- Elige un parqueadero --</option>
                                    {parqueaderos.filter(p => p.espaciosDisponibles > 0).map(p => (
                                        <option key={p.id} value={p.id}>
                                            {p.nombre} — {p.espaciosDisponibles} espacios disponibles
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-actions">
                                <button type="button" className="btn-secondary"
                                    onClick={() => { setMostrarModalIngreso(false); setParqueaderoPreseleccionado(''); setErrorIngreso(''); }}>
                                    Cancelar
                                </button>
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