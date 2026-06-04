import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import '../styles/Dashboard.css';

function Perfil() {
    const navigate = useNavigate();
    const { usuario, logout, login } = useAuth();

    // Detectar de dónde vino el usuario para el botón Volver
    const rutaVolver = () => {
        if (usuario?.rol === 'SUPER_ADMIN') return '/superadmin-dashboard';
        if (usuario?.rol === 'ADMIN') return '/admin-dashboard';
        return '/dashboard';
    };

    // Estado del formulario — inicializado con datos actuales
    const [editando, setEditando]       = useState(false);
    const [nombre, setNombre]           = useState(usuario?.nombre || '');
    const [apellido, setApellido]       = useState(usuario?.apellido || '');
    const [cargando, setCargando]       = useState(false);
    const [error, setError]             = useState('');
    const [exito, setExito]             = useState('');

    // Estado para cambio de contraseña
    const [cambioPass, setCambioPass]           = useState(false);
    const [passwordActual, setPasswordActual]   = useState('');
    const [nuevaPassword, setNuevaPassword]     = useState('');
    const [confirmarPass, setConfirmarPass]     = useState('');
    const [cargandoPass, setCargandoPass]       = useState(false);
    const [errorPass, setErrorPass]             = useState('');
    const [exitoPass, setExitoPass]             = useState('');

    const handleLogout = () => { logout(); navigate('/login'); };

    // --- Guardar datos del perfil ---
    const handleGuardarPerfil = async (e) => {
        e.preventDefault();
        setError('');
        setExito('');
        if (!nombre.trim() || !apellido.trim()) {
            setError('El nombre y apellido son obligatorios.');
            return;
        }
        setCargando(true);
        try {
            const response = await api.put('/usuario/perfil', { nombre: nombre.trim(), apellido: apellido.trim() });
            // Actualizar AuthContext con los nuevos datos
            login({ ...usuario, nombre: response.data.nombre, apellido: response.data.apellido });
            setExito('Perfil actualizado correctamente.');
            setEditando(false);
        } catch (err) {
            setError(err.response?.data?.error || 'Error al actualizar el perfil.');
        } finally {
            setCargando(false);
        }
    };

    // --- Cambiar contraseña ---
    const handleCambiarPassword = async (e) => {
        e.preventDefault();
        setErrorPass('');
        setExitoPass('');
        if (nuevaPassword !== confirmarPass) {
            setErrorPass('Las contraseñas nuevas no coinciden.');
            return;
        }
        if (nuevaPassword.length < 8) {
            setErrorPass('La nueva contraseña debe tener mínimo 8 caracteres.');
            return;
        }
        setCargandoPass(true);
        try {
            await api.put('/usuario/cambiar-password', { passwordActual, nuevaPassword });
            setExitoPass('Contraseña actualizada correctamente.');
            setPasswordActual('');
            setNuevaPassword('');
            setConfirmarPass('');
            setCambioPass(false);
        } catch (err) {
            setErrorPass(err.response?.data?.error || 'Error al cambiar la contraseña.');
        } finally {
            setCargandoPass(false);
        }
    };

    const cancelarEdicion = () => {
        setNombre(usuario?.nombre || '');
        setApellido(usuario?.apellido || '');
        setError('');
        setEditando(false);
    };

    const cancelarCambioPass = () => {
        setPasswordActual('');
        setNuevaPassword('');
        setConfirmarPass('');
        setErrorPass('');
        setCambioPass(false);
    };

    const rolLabel = {
        SUPER_ADMIN: 'Super Administrador',
        ADMIN: 'Administrador',
        CLIENTE: 'Cliente',
    };

    return (
        <div className="dashboard-layout">
            <nav className="navbar">
                <div className="navbar-brand">
                    <h1>ProParking</h1>
                </div>
                <div className="navbar-user">
                    <span>Hola, <strong>{usuario?.nombre}</strong></span>
                    <span className="user-role">{usuario?.rol}</span>
                    <button onClick={() => navigate(rutaVolver())} className="btn-logout"
                        style={{ backgroundColor: '#e2e8f0', color: '#475569', marginRight: 8 }}>
                        ← Volver
                    </button>
                    <button onClick={handleLogout} className="btn-logout">Cerrar Sesión</button>
                </div>
            </nav>

            <main className="dashboard-content" style={{ maxWidth: 640 }}>
                <h2 style={{ marginBottom: 24 }}>Mi Perfil</h2>

                {/* ── Tarjeta de datos personales ── */}
                <div className="widget-card" style={{ marginBottom: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <h3 style={{ margin: 0 }}>Datos Personales</h3>
                        {!editando && (
                            <button onClick={() => setEditando(true)} style={{
                                padding: '7px 16px', backgroundColor: '#eff6ff',
                                border: '1px solid #93c5fd', color: '#1d4ed8',
                                borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13
                            }}>
                                ✏️ Editar
                            </button>
                        )}
                    </div>

                    {exito && <div className="success-msg" style={{ marginBottom: 16 }}>{exito}</div>}
                    {error  && <div className="error-msg"   style={{ marginBottom: 16 }}>{error}</div>}

                    {editando ? (
                        <form onSubmit={handleGuardarPerfil}>
                            <div className="form-group">
                                <label>Nombre</label>
                                <input type="text" value={nombre} required
                                    onChange={e => setNombre(e.target.value)}
                                    style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 14, boxSizing: 'border-box' }} />
                            </div>
                            <div className="form-group">
                                <label>Apellido</label>
                                <input type="text" value={apellido} required
                                    onChange={e => setApellido(e.target.value)}
                                    style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 14, boxSizing: 'border-box' }} />
                            </div>
                            <div className="form-group">
                                <label>Correo Electrónico</label>
                                <input type="email" value={usuario?.email || ''} disabled
                                    style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 14, backgroundColor: '#f1f5f9', color: '#94a3b8', boxSizing: 'border-box' }} />
                                <span style={{ fontSize: 11, color: '#94a3b8' }}>El correo no se puede modificar.</span>
                            </div>
                            <div className="form-actions">
                                <button type="button" onClick={cancelarEdicion} style={{
                                    padding: '9px 20px', borderRadius: 8, border: '1px solid #e2e8f0',
                                    backgroundColor: 'white', cursor: 'pointer', fontWeight: 600, fontSize: 14
                                }}>Cancelar</button>
                                <button type="submit" disabled={cargando} style={{
                                    padding: '9px 20px', borderRadius: 8, border: 'none',
                                    backgroundColor: '#1e40af', color: 'white',
                                    cursor: 'pointer', fontWeight: 600, fontSize: 14,
                                    opacity: cargando ? 0.6 : 1
                                }}>{cargando ? 'Guardando...' : 'Guardar cambios'}</button>
                            </div>
                        </form>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            {[
                                { label: 'Nombre',   valor: usuario?.nombre   || '—' },
                                { label: 'Apellido', valor: usuario?.apellido || '—' },
                                { label: 'Correo',   valor: usuario?.email    || '—' },
                                { label: 'Rol',      valor: rolLabel[usuario?.rol] || usuario?.rol || '—' },
                            ].map(({ label, valor }) => (
                                <div key={label} style={{
                                    display: 'flex', justifyContent: 'space-between',
                                    padding: '10px 14px', backgroundColor: '#f8fafc',
                                    borderRadius: 8, fontSize: 14
                                }}>
                                    <span style={{ color: '#64748b', fontWeight: 600 }}>{label}</span>
                                    <span style={{ color: '#1e293b' }}>{valor}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── Tarjeta cambio de contraseña ── */}
                <div className="widget-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: cambioPass ? 20 : 0 }}>
                        <h3 style={{ margin: 0 }}>Cambiar Contraseña</h3>
                        {!cambioPass && (
                            <button onClick={() => setCambioPass(true)} style={{
                                padding: '7px 16px', backgroundColor: '#fef3c7',
                                border: '1px solid #fcd34d', color: '#92400e',
                                borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13
                            }}>
                                🔑 Cambiar
                            </button>
                        )}
                    </div>

                    {cambioPass && (
                        <>
                            {exitoPass && <div className="success-msg" style={{ marginBottom: 16 }}>{exitoPass}</div>}
                            {errorPass  && <div className="error-msg"   style={{ marginBottom: 16 }}>{errorPass}</div>}
                            <form onSubmit={handleCambiarPassword}>
                                <div className="form-group">
                                    <label>Contraseña actual</label>
                                    <input type="password" required value={passwordActual}
                                        onChange={e => setPasswordActual(e.target.value)}
                                        placeholder="••••••••"
                                        style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 14, boxSizing: 'border-box' }} />
                                </div>
                                <div className="form-group">
                                    <label>Nueva contraseña</label>
                                    <input type="password" required value={nuevaPassword}
                                        onChange={e => setNuevaPassword(e.target.value)}
                                        placeholder="Mínimo 8 caracteres"
                                        style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 14, boxSizing: 'border-box' }} />
                                </div>
                                <div className="form-group">
                                    <label>Confirmar nueva contraseña</label>
                                    <input type="password" required value={confirmarPass}
                                        onChange={e => setConfirmarPass(e.target.value)}
                                        placeholder="Repite la contraseña"
                                        style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 14, boxSizing: 'border-box' }} />
                                </div>
                                <div className="form-actions">
                                    <button type="button" onClick={cancelarCambioPass} style={{
                                        padding: '9px 20px', borderRadius: 8, border: '1px solid #e2e8f0',
                                        backgroundColor: 'white', cursor: 'pointer', fontWeight: 600, fontSize: 14
                                    }}>Cancelar</button>
                                    <button type="submit" disabled={cargandoPass} style={{
                                        padding: '9px 20px', borderRadius: 8, border: 'none',
                                        backgroundColor: '#1e40af', color: 'white',
                                        cursor: 'pointer', fontWeight: 600, fontSize: 14,
                                        opacity: cargandoPass ? 0.6 : 1
                                    }}>{cargandoPass ? 'Guardando...' : 'Actualizar contraseña'}</button>
                                </div>
                            </form>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}

export default Perfil;