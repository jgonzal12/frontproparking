import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { obtenerMisVehiculos, registrarVehiculo, eliminarVehiculo } from '../services/vehiculoService';
import { obtenerParqueaderos } from '../services/parqueaderoService';
import { obtenerMiHistorial, registrarIngreso } from '../services/ingresoService';
import MapaParqueaderos from '../components/MapaParqueaderos';
import { useButtonLock, useManyButtonLocks } from '../hooks/useButtonLock';
import '../styles/Dashboard.css';

function Dashboard() {
    const { usuario } = useAuth();

    const [vehiculos, setVehiculos]       = useState([]);
    const [parqueaderos, setParqueaderos] = useState([]);
    const [historial, setHistorial]       = useState([]);
    const [cargando, setCargando]         = useState(true);
    const [error, setError]               = useState('');
    const [vista, setVista]               = useState('mapa');

    const [mostrarModalVehiculo, setMostrarModalVehiculo] = useState(false);
    const [errorVehiculo, setErrorVehiculo]               = useState('');
    const [errorIngreso, setErrorIngreso]                 = useState('');
    const [mostrarModalIngreso, setMostrarModalIngreso]   = useState(false);
    const [parqueaderoPreseleccionado, setParqueaderoPreseleccionado] = useState('');

    const [nuevoVehiculo, setNuevoVehiculo] = useState({ placa: '', marca: '', color: '', tipoVehiculo: 'CARRO' });
    const [nuevoIngreso, setNuevoIngreso]   = useState({ vehiculoId: '', parqueaderoId: '' });

    // Filtros historial
    const [filtroEstado, setFiltroEstado]     = useState('');
    const [filtroDesde, setFiltroDesde]       = useState('');
    const [filtroHasta, setFiltroHasta]       = useState('');
    const [cargandoHistorial, setCargandoHistorial] = useState(false);

    // ── Locks anti-doble-click ──────────────────────────────────────────────
    const [guardandoVehiculo,  ejecutarGuardarVehiculo]  = useButtonLock();
    const [confirmandoIngreso, ejecutarConfirmarIngreso] = useButtonLock();
    const [filtrandoHistorial, ejecutarFiltrar]          = useButtonLock();
    const { isLocked: isBorrandoVehiculo, ejecutar: ejecutarBorrar } = useManyButtonLocks();

    // ── Carga de datos ──────────────────────────────────────────────────────
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

    // ── Filtros historial ───────────────────────────────────────────────────
    const aplicarFiltros = () => ejecutarFiltrar(async () => {
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
    });

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

    const handleRegistrarDesdesMapa = useCallback((parqueaderoId) => {
        if (vehiculos.length === 0) {
            setError('Debes registrar un vehículo antes de ingresar a un parqueadero.');
            return;
        }
        setParqueaderoPreseleccionado(parqueaderoId);
        setNuevoIngreso({ vehiculoId: '', parqueaderoId });
        setMostrarModalIngreso(true);
    }, [vehiculos]);

    // ── CRUD vehículos ──────────────────────────────────────────────────────
    const handleCrearVehiculo = (e) => {
        e.preventDefault();
        ejecutarGuardarVehiculo(async () => {
            setErrorVehiculo('');
            try {
                await registrarVehiculo(nuevoVehiculo);
                setMostrarModalVehiculo(false);
                setNuevoVehiculo({ placa: '', marca: '', color: '', tipoVehiculo: 'CARRO' });
                cargarDatos();
            } catch (err) {
                setErrorVehiculo('Error al registrar vehículo: ' + err);
                throw err; // re-throw para que el lock se libere correctamente
            }
        });
    };

    const handleBorrarVehiculo = (id) => {
        if (!window.confirm('¿Estás seguro de eliminar este vehículo?')) return;
        ejecutarBorrar(id, async () => {
            try {
                await eliminarVehiculo(id);
                cargarDatos();
            } catch (err) {
                setError('Error al eliminar vehículo: ' + err);
            }
        });
    };

    // ── Ingreso ─────────────────────────────────────────────────────────────
    const handleCrearIngreso = (e) => {
        e.preventDefault();
        ejecutarConfirmarIngreso(async () => {
            setErrorIngreso('');
            try {
                await registrarIngreso(nuevoIngreso.vehiculoId, nuevoIngreso.parqueaderoId);
                setMostrarModalIngreso(false);
                setNuevoIngreso({ vehiculoId: '', parqueaderoId: '' });
                setParqueaderoPreseleccionado('');
                cargarDatos();
            } catch (err) {
                setErrorIngreso('Error al registrar entrada: ' + err);
                throw err;
            }
        });
    };

    return (
        <div className="dashboard-layout">
            {/* La navbar global ya está en App.jsx — no duplicar aquí */}

            <main className="dashboard-content">
                <h2>Panel de Cliente</h2>
                {error && <div className="error-msg" style={{ marginBottom: 16 }}>{error}</div>}

                {cargando ? <p>Cargando información...</p> : (
                    <div className="widget-grid">

                        {/* WIDGET MAPA */}
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
                                                    <button
                                                        onClick={() => handleRegistrarDesdesMapa(p.id)}
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
                            {vehiculos.length === 0
                                ? <p>No tienes vehículos registrados.</p>
                                : (
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
                                                <button
                                                    onClick={() => handleBorrarVehiculo(v.id)}
                                                    disabled={isBorrandoVehiculo(v.id)}
                                                    style={{
                                                        background: 'none', border: 'none',
                                                        color: isBorrandoVehiculo(v.id) ? '#94a3b8' : 'red',
                                                        cursor: isBorrandoVehiculo(v.id) ? 'not-allowed' : 'pointer',
                                                        fontSize: 18
                                                    }}>
                                                    {isBorrandoVehiculo(v.id) ? '⏳' : '🗑️'}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            <button
                                className="btn-primary"
                                onClick={() => { setMostrarModalVehiculo(true); setErrorVehiculo(''); }}>
                                + Agregar Vehículo
                            </button>
                        </div>

                        {/* WIDGET HISTORIAL */}
                        <div className="widget-card">
                            <h3>Historial de Pagos</h3>
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
                                <button
                                    onClick={aplicarFiltros}
                                    disabled={filtrandoHistorial}
                                    style={{
                                        padding: '6px 12px',
                                        backgroundColor: filtrandoHistorial ? '#93c5fd' : '#1e40af',
                                        color: 'white', border: 'none', borderRadius: 6,
                                        cursor: filtrandoHistorial ? 'not-allowed' : 'pointer', fontSize: 13
                                    }}>
                                    {filtrandoHistorial ? '⏳' : '🔍'} Filtrar
                                </button>
                                <button onClick={limpiarFiltros}
                                    style={{ padding: '6px 12px', backgroundColor: '#e2e8f0', color: '#475569', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>
                                    ✖ Limpiar
                                </button>
                            </div>

                            {cargandoHistorial ? <p>Cargando...</p> : historial.length === 0 ? (
                                <p style={{ color: '#94a3b8', textAlign: 'center', marginTop: 20 }}>No hay registros.</p>
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
                                                    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 12, backgroundColor: '#f1f5f9', color: '#475569' }}>
                                                        💳 {h.metodoPago.replace('_', ' ')}
                                                    </span>
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
                                <input type="text" required value={nuevoVehiculo.placa}
                                    onChange={e => setNuevoVehiculo({ ...nuevoVehiculo, placa: e.target.value.toUpperCase() })} />
                            </div>
                            <div className="form-group"><label>Marca</label>
                                <input type="text" required value={nuevoVehiculo.marca}
                                    onChange={e => setNuevoVehiculo({ ...nuevoVehiculo, marca: e.target.value })} />
                            </div>
                            <div className="form-group"><label>Color</label>
                                <input type="text" required value={nuevoVehiculo.color}
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
                                    onClick={() => setMostrarModalVehiculo(false)}
                                    disabled={guardandoVehiculo}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-primary" disabled={guardandoVehiculo}>
                                    {guardandoVehiculo ? 'Guardando...' : 'Guardar'}
                                </button>
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
                                            {p.nombre} — {p.espaciosDisponibles} espacios
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-actions">
                                <button type="button" className="btn-secondary"
                                    onClick={() => {
                                        setMostrarModalIngreso(false);
                                        setParqueaderoPreseleccionado('');
                                        setErrorIngreso('');
                                    }}
                                    disabled={confirmandoIngreso}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-primary" disabled={confirmandoIngreso}>
                                    {confirmandoIngreso ? 'Registrando...' : 'Confirmar Entrada'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Dashboard;