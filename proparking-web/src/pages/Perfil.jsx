import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { actualizarPerfil } from '../services/usuarioService';
import '../styles/Perfil.css';

const Perfil = () => {
    const navigate = useNavigate();
    const { usuario, actualizarUsuario, logout } = useAuth();

    const [formData, setFormData] = useState({
        correo:   '',
        telefono: '',
    });
    const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
    const [loading, setLoading]  = useState(false);

    useEffect(() => {
        if (usuario) {
            setFormData({
                correo:   usuario.email    || '',
                telefono: usuario.telefono || '',
            });
        }
    }, [usuario]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMensaje({ texto: '', tipo: '' });
        setLoading(true);
        try {
            const data = await actualizarPerfil(formData);
            // Actualizar contexto con los nuevos datos devueltos por el backend
            actualizarUsuario({
                email:    data.email    || formData.correo,
                telefono: data.telefono || formData.telefono,
            });
            setMensaje({ texto: 'Tus datos han sido actualizados correctamente.', tipo: 'success' });
        } catch (error) {
            setMensaje({
                texto: error.response?.data?.message || error.response?.data?.error || 'Hubo un error al actualizar el perfil.',
                tipo: 'error',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    // Determina la ruta de regreso según el rol
    const handleVolver = () => {
        if (usuario?.rol === 'SUPER_ADMIN') navigate('/superadmin-dashboard');
        else if (usuario?.rol === 'ADMIN')  navigate('/admin-dashboard');
        else                                navigate('/dashboard');
    };

    return (
        <div className="perfil-container">
            <div className="perfil-card">
                {/* Encabezado con avatar de iniciales */}
                <div className="perfil-avatar">
                    {usuario?.nombre?.charAt(0).toUpperCase()}
                    {usuario?.apellido?.charAt(0).toUpperCase()}
                </div>

                <h2>Mi Perfil</h2>
                <p className="perfil-subtitle">Gestiona tu información de contacto</p>

                {/* Datos no editables */}
                <div className="perfil-info-readonly">
                    <div className="perfil-info-row">
                        <span className="perfil-info-label">Nombre completo</span>
                        <span className="perfil-info-value">
                            {usuario?.nombre || '—'} {usuario?.apellido || ''}
                        </span>
                    </div>
                    <div className="perfil-info-row">
                        <span className="perfil-info-label">Rol</span>
                        <span className={`perfil-rol perfil-rol--${(usuario?.rol || '').toLowerCase()}`}>
                            {usuario?.rol || '—'}
                        </span>
                    </div>
                </div>

                {/* Divider */}
                <div className="perfil-divider" />

                <p className="perfil-section-title">Datos editables</p>

                {mensaje.texto && (
                    <div className={`alert alert-${mensaje.tipo}`}>
                        {mensaje.texto}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="perfil-form">
                    <div className="form-group">
                        <label htmlFor="correo">Correo electrónico</label>
                        <input
                            type="email"
                            id="correo"
                            name="correo"
                            value={formData.correo}
                            onChange={handleChange}
                            required
                            placeholder="tu@correo.com"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="telefono">Número de teléfono</label>
                        <input
                            type="text"
                            id="telefono"
                            name="telefono"
                            value={formData.telefono}
                            onChange={handleChange}
                            placeholder="Ej: 3001234567"
                        />
                    </div>

                    <button type="submit" className="btn-guardar" disabled={loading}>
                        {loading ? 'Guardando cambios...' : 'Guardar Cambios'}
                    </button>
                </form>

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