import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { obtenerParqueaderos } from '../services/parqueaderoService';
import {
    listarUsuarios, asignarAdmin, revocarAdmin,
    crearParqueadero, actualizarParqueadero, eliminarParqueadero
} from '../services/superAdminService';
import '../styles/Dashboard.css';

const parqueaderoVacio = { nombre: '', direccion: '', capacidadTotal: '', tarifaCarro: '', tarifaMoto: '' };

function SuperAdminDashboard() {
    const navigate = useNavigate();
    const { usuario, logout } = useAuth();

    const [parqueaderos, setParqueaderos] = useState([]);
    const [usuarios, setUsuarios]         = useState([]);
    const [cargando, setCargando]         = useState(true);
    const [error, setError]               = useState('');
    const [exito, setExito]               = useState('');
    const [tab, setTab]                   = useState('parqueaderos');

    // Modal crear/editar parqueadero
    const [mostrarModal, setMostrarModal]         = useState(false);
    const [parqueaderoEditando, setParqueaderoEditando] = useState(null); // null = creando
    const [formParqueadero, setFormParqueadero]   = useState(parqueaderoVacio);

    // Modal asignar admin
    const [mostrarModalAsignar, setMostrarModalAsignar]   = useState(false);
    const [usuarioSeleccionado, setUsuarioSeleccionado]   = useState(null);
    const [parqueaderoSeleccionado, setParqueaderoSeleccionado] = useState('');

    const cargarDatos = async () => {
        setCargando(true);
        setError('');
        try {
            const [dataParqueaderos, dataUsuarios] = await Promise.all([
                obtenerParqueaderos(),
                listarUsuarios(),
            ]);
            setParqueaderos(dataParqueaderos);
            setUsuarios(dataUsuarios);
        } catch (err) {
            setError('Error al cargar los datos: ' + err);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => { cargarDatos(); }, []);

    const mostrarExito = (msg) => {
        setExito(msg);
        setTimeout(() => setExito(''), 3000);
    };

    const handleLogout = () => { logout(); navigate('/login'); };

    // --- Abrir modal crear ---
    const abrirModalCrear = () => {
        setParqueaderoEditando(null);
        setFormParqueadero(parqueaderoVacio);
        setMostrarModal(true);
    };

    // --- Abrir modal editar ---
    const abrirModalEditar = (p) => {
        setParqueaderoEditando(p);
        setFormParqueadero({
            nombre:         p.nombre,
            direccion:      p.direccion,
            capacidadTotal: p.capacidadTotal,
            tarifaCarro:    p.tarifaCarro,
            tarifaMoto:     p.tarifaMoto,
        });
        setMostrarModal(true);
    };

    // --- Guardar (crear o editar) ---
    const handleGuardarParqueadero = async (e) => {
        e.preventDefault();
        setError('');
        const datos = {
            nombre:         formParqueadero.nombre,
            direccion:      formParqueadero.direccion,
            capacidadTotal: Number(formParqueadero.capacidadTotal),
            tarifaCarro:    Number(formParqueadero.tarifaCarro),
            tarifaMoto:     Number(formParqueadero.tarifaMoto),
        };
        try {
            if (parqueaderoEditando) {
                await actualizarParqueadero(parqueaderoEditando.id, datos);
                mostrarExito('Parqueadero actualizado correctamente');
            } else {
                await crearParqueadero(datos);
                mostrarExito('Parqueadero creado correctamente');
            }
            setMostrarModal(false);
            cargarDatos();
        } catch (err) {
            setError('Error: ' + err);
        }
    };

    // --- Eliminar parqueadero ---
    const handleEliminar = async (id, nombre) => {
        if (!window.confirm(`¿Eliminar "${nombre}"? Esta acción no se puede deshacer.`)) return;
        try {
            await eliminarParqueadero(id);
            mostrarExito('Parqueadero eliminado');
            cargarDatos();
        } catch (err) {
            setError('Error: ' + err);
        }
    };

    // --- Asignar admin ---
    const abrirModalAsignar = (u) => {
        setUsuarioSeleccionado(u);
        setParqueaderoSeleccionado('');
        setMostrarModalAsignar(true);
    };

    const handleAsignarAdmin = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await asignarAdmin(usuarioSeleccionado.id, parqueaderoSeleccionado);
            setMostrarModalAsignar(false);
            mostrarExito(`${usuarioSeleccionado.nombre} ahora es administrador`);
            cargarDatos();
        } catch (err) {
            setError('Error: ' + err);
        }
    };

    // --- Revocar admin ---
    const handleRevocarAdmin = async (u) => {
        if (!window.confirm(`¿Revocar el rol de admin de ${u.nombre}? Volverá a ser CLIENTE.`)) return;
        try {
            await revocarAdmin(u.id);
            mostrarExito(`Rol de ${u.nombre} revocado`);
            cargarDatos();
        } catch (err) {
            setError('Error: ' + err);
        }
    };

    const admins   = usuarios.filter(u => u.rol === 'ADMIN');
    const clientes = usuarios.filter(u => u.rol === 'CLIENTE');

    return (
        <div className="dashboard-layout">
            <nav className="navbar">
                <div className="navbar-brand">
                    <h1>ProParking <span className="admin-tag" style={{ backgroundColor: '#7c3aed' }}>Super Admin</span></h1>
                </div>
                <div className="navbar-user">
                    <span>Hola, <strong>{usuario?.nombre}</strong></span>
                    <button onClick={handleLogout} className="btn-logout">Cerrar Sesión</button>
                </div>
            </nav>

            <main className="dashboard-content">
                <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                    {['parqueaderos', 'usuarios'].map(t => (
                        <button key={t} onClick={() => setTab(t)} style={{
                            padding: '10px 24px', borderRadius: 8, border: 'none',
                            cursor: 'pointer', fontWeight: 600, fontSize: 14,
                            backgroundColor: tab === t ? '#1e40af' : '#e2e8f0',
                            color: tab === t ? 'white' : '#475569',
                        }}>
                            {t === 'parqueaderos' ? '🏢 Parqueaderos' : '👥 Usuarios'}
                        </button>
                    ))}
                </div>

                {error && <div className="error-msg"   style={{ marginBottom: 16 }}>{error}</div>}
                {exito && <div className="success-msg" style={{ marginBottom: 16 }}>{exito}</div>}

                {cargando ? <p>Cargando...</p> : (
                    <>
                        {/* ===== TAB PARQUEADEROS ===== */}
                        {tab === 'parqueaderos' && (
                            <div className="widget-card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                    <h3>Parqueaderos ({parqueaderos.length})</h3>
                                    <button className="btn-primary" onClick={abrirModalCrear}>
                                        + Nuevo parqueadero
                                    </button>
                                </div>

                                {parqueaderos.length === 0 ? <p>No hay parqueaderos registrados.</p> : (
                                    <table className="admin-table">
                                        <thead>
                                            <tr>
                                                <th>Nombre</th><th>Dirección</th><th>Capacidad</th>
                                                <th>Disponibles</th><th>Tarifa Carro</th><th>Tarifa Moto</th>
                                                <th>Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {parqueaderos.map(p => (
                                                <tr key={p.id}>
                                                    <td><strong>{p.nombre}</strong></td>
                                                    <td>{p.direccion}</td>
                                                    <td>{p.capacidadTotal}</td>
                                                    <td>
                                                        <span style={{ color: p.espaciosDisponibles === 0 ? '#dc2626' : '#16a34a', fontWeight: 600 }}>
                                                            {p.espaciosDisponibles}
                                                        </span>
                                                    </td>
                                                    <td>${p.tarifaCarro}/h</td>
                                                    <td>${p.tarifaMoto}/h</td>
                                                    <td style={{ display: 'flex', gap: 8 }}>
                                                        <button onClick={() => abrirModalEditar(p)}
                                                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}
                                                            title="Editar">✏️</button>
                                                        <button onClick={() => handleEliminar(p.id, p.nombre)}
                                                            style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: 18 }}
                                                            title="Eliminar">🗑️</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        )}

                        {/* ===== TAB USUARIOS ===== */}
                        {tab === 'usuarios' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                                <div className="widget-card">
                                    <h3 style={{ marginBottom: 16 }}>Administradores ({admins.length})</h3>
                                    {admins.length === 0 ? <p>No hay administradores asignados.</p> : (
                                        <table className="admin-table">
                                            <thead>
                                                <tr><th>Nombre</th><th>Email</th><th>Parqueadero</th><th>Acción</th></tr>
                                            </thead>
                                            <tbody>
                                                {admins.map(u => (
                                                    <tr key={u.id}>
                                                        <td>{u.nombre} {u.apellido}</td>
                                                        <td>{u.email}</td>
                                                        <td>{u.parqueaderoNombre || '—'}</td>
                                                        <td>
                                                            <button onClick={() => handleRevocarAdmin(u)}
                                                                style={{ padding: '4px 12px', backgroundColor: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>
                                                                Revocar
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>

                                <div className="widget-card">
                                    <h3 style={{ marginBottom: 16 }}>Clientes ({clientes.length})</h3>
                                    {clientes.length === 0 ? <p>No hay clientes registrados.</p> : (
                                        <table className="admin-table">
                                            <thead>
                                                <tr><th>Nombre</th><th>Email</th><th>Acción</th></tr>
                                            </thead>
                                            <tbody>
                                                {clientes.map(u => (
                                                    <tr key={u.id}>
                                                        <td>{u.nombre} {u.apellido}</td>
                                                        <td>{u.email}</td>
                                                        <td>
                                                            <button onClick={() => abrirModalAsignar(u)}
                                                                style={{ padding: '4px 12px', backgroundColor: '#eff6ff', border: '1px solid #93c5fd', color: '#1d4ed8', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>
                                                                Asignar como Admin
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
                    </>
                )}
            </main>

            {/* MODAL: CREAR / EDITAR PARQUEADERO */}
            {mostrarModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>{parqueaderoEditando ? 'Editar Parqueadero' : 'Nuevo Parqueadero'}</h3>
                        <form onSubmit={handleGuardarParqueadero}>
                            <div className="form-group">
                                <label>Nombre</label>
                                <input type="text" required value={formParqueadero.nombre}
                                    onChange={e => setFormParqueadero({ ...formParqueadero, nombre: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Dirección</label>
                                <input type="text" required value={formParqueadero.direccion}
                                    onChange={e => setFormParqueadero({ ...formParqueadero, direccion: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Capacidad total</label>
                                <input type="number" min="1" required value={formParqueadero.capacidadTotal}
                                    onChange={e => setFormParqueadero({ ...formParqueadero, capacidadTotal: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Tarifa Carro ($/hora)</label>
                                <input type="number" min="1" required value={formParqueadero.tarifaCarro}
                                    onChange={e => setFormParqueadero({ ...formParqueadero, tarifaCarro: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Tarifa Moto ($/hora)</label>
                                <input type="number" min="1" required value={formParqueadero.tarifaMoto}
                                    onChange={e => setFormParqueadero({ ...formParqueadero, tarifaMoto: e.target.value })} />
                            </div>
                            <div className="form-actions">
                                <button type="button" className="btn-secondary"
                                    onClick={() => setMostrarModal(false)}>Cancelar</button>
                                <button type="submit" className="btn-primary">
                                    {parqueaderoEditando ? 'Guardar cambios' : 'Crear'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL: ASIGNAR ADMIN */}
            {mostrarModalAsignar && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Asignar Administrador</h3>
                        <p>Usuario: <strong>{usuarioSeleccionado?.nombre} {usuarioSeleccionado?.apellido}</strong></p>
                        <form onSubmit={handleAsignarAdmin}>
                            <div className="form-group">
                                <label>Selecciona el parqueadero</label>
                                <select required style={{ width: '100%', padding: 12 }}
                                    value={parqueaderoSeleccionado}
                                    onChange={e => setParqueaderoSeleccionado(e.target.value)}>
                                    <option value="">-- Elige un parqueadero --</option>
                                    {parqueaderos.map(p => (
                                        <option key={p.id} value={p.id}>{p.nombre}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-actions">
                                <button type="button" className="btn-secondary"
                                    onClick={() => setMostrarModalAsignar(false)}>Cancelar</button>
                                <button type="submit" className="btn-primary">Confirmar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default SuperAdminDashboard;