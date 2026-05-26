import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { actualizarPerfil, cambiarPassword } from '../services/usuarioService';
import '../styles/Perfil.css';

const Perfil = () => {
    const navigate = useNavigate();
    const { usuario, actualizarUsuario, logout } = useAuth();

    // ── Estado formulario perfil ──────────────────────────────
    const [formEmail, setFormEmail] = useState('');
    const [mensajePerfil, setMensajePerfil] = useState({ texto: '', tipo: '' });
    const [loadingPerfil, setLoadingPerfil]  = useState(false);

    // ── Estado formulario contraseña ──────────────────────────
    const [formPass, setFormPass] = useState({
        passwordActual: '',
        nuevaPassword:  '',
        confirmar:      '',
    });
    const [mensajePass, setMensajePass] = useState({ texto: '', tipo: '' });
    const [loadingPass, setLoadingPass]  = useState(false);
    const [mostrarPass, setMostrarPass]  = useState(false);

    useEffect(() => {
        if (usuario) {
            setFormEmail(usuario.email || '');
        }
    }, [usuario]);

    // ── Submit actualizar email ───────────────────────────────
    const handleSubmitPerfil = async (e) => {
        e.preventDefault();
        setMensajePerfil({ texto: '', tipo: '' });
        setLoadingPerfil(true);
        try {
            await actualizarPerfil({ email: formEmail });
            actualizarUsuario({ email: formEmail });
            setMensajePerfil({ texto: 'Correo actualizado correctamente.', tipo: 'success' });
        } catch (error) {
            setMensajePerfil({
                texto: error.response?.data?.error
                    || error.response?.data?.message
                    || 'Error al actualizar el perfil.',
                tipo: 'error',
            });
        } finally {
            setLoadingPerfil(false);
        }
    };

    // ── Submit cambiar contraseña ─────────────────────────────
    const handleSubmitPassword = async (e) => {
        e.preventDefault();
        setMensajePass({ texto: '', tipo: '' });

        if (formPass.nuevaPassword !== formPass.confirmar) {
            setMensajePass({ texto: 'Las contraseñas nuevas no coinciden.', tipo: 'error' });
            return;
        }
        if (formPass.nuevaPassword.length < 8) {
            setMensajePass({ texto: 'La nueva contraseña debe tener mínimo 8 caracteres.', tipo: 'error' });
            return;
        }

        setLoadingPass(true);
        try {
            await cambiarPassword({
                passwordActual: formPass.passwordActual,
                nuevaPassword:  formPass.nuevaPassword,
            });
            setMensajePass({ texto: 'Contraseña actualizada correctamente.', tipo: 'success' });
            setFormPass({ passwordActual: '', nuevaPassword: '', confirmar: '' });
        } catch (error) {
            setMensajePass({
                texto: error.response?.data?.error
                    || error.response?.data?.message
                    || 'Error al cambiar la contraseña.',
                tipo: 'error',
            });
        } finally {
            setLoadingPass(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const handleVolver = () => {
        if (usuario?.rol === 'SUPER_ADMIN') navigate('/superadmin-dashboard');
        else if (usuario?.rol === 'ADMIN')  navigate('/admin-dashboard');
        else                                navigate('/dashboard');
    };

    return (
        <div className="perfil-container">
            <div className="perfil-card">

                {/* Avatar con iniciales */}
                <div className="perfil-avatar">
                    {usuario?.nombre?.charAt(0).toUpperCase()}
                    {usuario?.apellido?.charAt(0).toUpperCase()}
                </div>

                <h2>Mi Perfil</h2>
                <p className="perfil-subtitle">Gestiona tu información de cuenta</p>

                {/* Datos de solo lectura */}
                <div className="perfil-info-readonly">
                    <div className="perfil-info-row">
                        <span className="perfil-info-label">Nombre completo</span>
                        <span className="perfil-info-value">
                            {usuario?.nombre || '—'}{usuario?.apellido ? ` ${usuario.apellido}` : ''}
                        </span>
                    </div>
                    <div className="perfil-info-row">
                        <span className="perfil-info-label">Rol</span>
                        <span className={`perfil-rol perfil-rol--${(usuario?.rol || '').toLowerCase()}`}>
                            {usuario?.rol || '—'}
                        </span>
                    </div>
                </div>

                <div className="perfil-divider" />

                {/* ── Sección: actualizar email ──────────────────── */}
                <p className="perfil-section-title">Correo electrónico</p>

                {mensajePerfil.texto && (
                    <div className={`alert alert-${mensajePerfil.tipo}`}>
                        {mensajePerfil.texto}
                    </div>
                )}

                <form onSubmit={handleSubmitPerfil} className="perfil-form">
                    <div className="form-group">
                        <label htmlFor="email">Correo electrónico</label>
                        <input
                            type="email"
                            id="email"
                            value={formEmail}
                            onChange={(e) => setFormEmail(e.target.value)}
                            required
                            placeholder="tu@correo.com"
                        />
                    </div>
                    <button type="submit" className="btn-guardar" disabled={loadingPerfil}>
                        {loadingPerfil ? 'Guardando...' : 'Actualizar correo'}
                    </button>
                </form>

                <div className="perfil-divider" />

                {/* ── Sección: cambiar contraseña ────────────────── */}
                <button
                    type="button"
                    className="perfil-toggle-pass"
                    onClick={() => {
                        setMostrarPass(!mostrarPass);
                        setMensajePass({ texto: '', tipo: '' });
                        setFormPass({ passwordActual: '', nuevaPassword: '', confirmar: '' });
                    }}
                >
                    {mostrarPass ? '▲ Ocultar' : '🔒 Cambiar contraseña'}
                </button>

                {mostrarPass && (
                    <>
                        {mensajePass.texto && (
                            <div className={`alert alert-${mensajePass.tipo}`} style={{ marginTop: 12 }}>
                                {mensajePass.texto}
                            </div>
                        )}

                        <form onSubmit={handleSubmitPassword} className="perfil-form" style={{ marginTop: 14 }}>
                            <div className="form-group">
                                <label htmlFor="passwordActual">Contraseña actual</label>
                                <input
                                    type="password"
                                    id="passwordActual"
                                    value={formPass.passwordActual}
                                    onChange={(e) => setFormPass({ ...formPass, passwordActual: e.target.value })}
                                    required
                                    placeholder="••••••••"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="nuevaPassword">Nueva contraseña</label>
                                <input
                                    type="password"
                                    id="nuevaPassword"
                                    value={formPass.nuevaPassword}
                                    onChange={(e) => setFormPass({ ...formPass, nuevaPassword: e.target.value })}
                                    required
                                    placeholder="Mínimo 8 caracteres"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="confirmar">Confirmar nueva contraseña</label>
                                <input
                                    type="password"
                                    id="confirmar"
                                    value={formPass.confirmar}
                                    onChange={(e) => setFormPass({ ...formPass, confirmar: e.target.value })}
                                    required
                                    placeholder="Repite la nueva contraseña"
                                />
                            </div>
                            <button type="submit" className="btn-guardar" disabled={loadingPass}>
                                {loadingPass ? 'Actualizando...' : 'Cambiar contraseña'}
                            </button>
                        </form>
                    </>
                )}

                <div className="perfil-divider" />

                {/* Acciones secundarias */}
                <div className="perfil-actions">
                    <button onClick={handleVolver} className="btn-volver">
                        ← Volver al dashboard
                    </button>
                    <button onClick={handleLogout} className="btn-cerrar-sesion">
                        Cerrar sesión
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Perfil;