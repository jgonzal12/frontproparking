<<<<<<< HEAD
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { actualizarPerfil } from '../services/usuarioService';
import '../styles/Perfil.css';

function Perfil() {
    const navigate = useNavigate();
    const { usuario, setUsuario, logout } = useAuth();

    const [formData, setFormData] = useState({
        email: '',
        telefono: '',
=======
import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { actualizarPerfil } from '../services/usuarioService';
import '../styles/Perfil.css'; // Archivo de estilos que crearemos en el siguiente paso

const Perfil = () => {
    const { usuario, setUsuario } = useContext(AuthContext); // Asegúrate de que tu contexto exponga 'usuario' y 'setUsuario'
    const [formData, setFormData] = useState({
        correo: '',
        telefono: ''
>>>>>>> 39bc538f0eda125f0044d618a9460bafd1c6a8a8
    });
    const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
    const [loading, setLoading] = useState(false);

<<<<<<< HEAD
    // Carga los datos actuales del usuario en el formulario
    useEffect(() => {
        if (usuario) {
            setFormData({
                email: usuario.email || '',
                telefono: usuario.telefono || '',
=======
    useEffect(() => {
        if (usuario) {
            setFormData({
                correo: usuario.correo || '',
                telefono: usuario.telefono || ''
>>>>>>> 39bc538f0eda125f0044d618a9460bafd1c6a8a8
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
<<<<<<< HEAD

        try {
            // El backend espera { email, telefono }
            const data = await actualizarPerfil({
                email: formData.email.trim(),
                telefono: formData.telefono.trim(),
            });

            // Actualiza el contexto con los nuevos datos
            // data es un UsuarioResumenDTO: { id, nombre, apellido, email, rol, ... }
            setUsuario({
                email: data.email || formData.email,
                nombre: data.nombre || usuario.nombre,
                telefono: formData.telefono,
            });

            setMensaje({
                texto: '✅ Tus datos han sido actualizados correctamente.',
                tipo: 'success',
            });
        } catch (error) {
            setMensaje({
                texto: typeof error === 'string' ? error : 'Hubo un error al actualizar el perfil.',
                tipo: 'error',
=======
        
        try {
            const data = await actualizarPerfil(formData);
            
            // Si el backend devuelve un token nuevo, actualízalo. Si solo devuelve datos, actualiza el estado.
            setUsuario(data); 
            
            setMensaje({ texto: 'Tus datos han sido actualizados correctamente.', tipo: 'success' });
        } catch (error) {
            setMensaje({ 
                texto: error.response?.data?.message || 'Hubo un error al actualizar el perfil.', 
                tipo: 'error' 
>>>>>>> 39bc538f0eda125f0044d618a9460bafd1c6a8a8
            });
        } finally {
            setLoading(false);
        }
    };

<<<<<<< HEAD
    // Determina a qué dashboard volver según el rol
    const dashboardLink = () => {
        if (!usuario) return '/login';
        if (usuario.rol === 'ADMIN') return '/admin-dashboard';
        if (usuario.rol === 'SUPER_ADMIN') return '/superadmin-dashboard';
        return '/dashboard';
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="perfil-page">
            {/* Navbar consistente con el resto de la app */}
            <nav className="navbar">
                <div className="navbar-brand">
                    <h1>ProParking</h1>
                </div>
                <div className="navbar-user">
                    <span>Hola, <strong>{usuario?.nombre}</strong></span>
                    <span className="user-role">{usuario?.rol}</span>
                    <Link to={dashboardLink()} className="btn-back-nav">
                        ← Volver
                    </Link>
                    <button onClick={handleLogout} className="btn-logout">
                        Cerrar Sesión
                    </button>
                </div>
            </nav>

            <main className="perfil-content">
                <div className="perfil-container">

                    {/* Cabecera de sección */}
                    <div className="perfil-header">
                        <div className="perfil-avatar">
                            {usuario?.nombre?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div className="perfil-header-info">
                            <h2>{usuario?.nombre}</h2>
                            <span className="perfil-rol-badge">{usuario?.rol}</span>
                        </div>
                    </div>

                    {/* Tarjeta del formulario */}
                    <div className="perfil-card">
                        <h3>Información de contacto</h3>
                        <p className="perfil-subtitle">
                            Actualiza tu correo electrónico y número de teléfono
                        </p>

                        {mensaje.texto && (
                            <div className={`alert alert-${mensaje.tipo}`}>
                                {mensaje.texto}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="perfil-form">
                            <div className="form-group">
                                <label htmlFor="email">Correo Electrónico</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    placeholder="correo@ejemplo.com"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="telefono">Número de Teléfono</label>
                                <input
                                    type="tel"
                                    id="telefono"
                                    name="telefono"
                                    value={formData.telefono}
                                    onChange={handleChange}
                                    placeholder="Ej: 3001234567"
                                    maxLength={15}
                                />
                            </div>

                            <button
                                type="submit"
                                className="btn-guardar"
                                disabled={loading}
                            >
                                {loading ? 'Guardando cambios...' : 'Guardar Cambios'}
                            </button>
                        </form>
                    </div>

                    {/* Tarjeta de datos de solo lectura */}
                    <div className="perfil-card perfil-card-readonly">
                        <h3>Datos de cuenta</h3>
                        <p className="perfil-subtitle">
                            Esta información no puede modificarse desde aquí
                        </p>
                        <div className="perfil-readonly-grid">
                            <div className="perfil-readonly-item">
                                <span className="readonly-label">Nombre completo</span>
                                <span className="readonly-value">{usuario?.nombre || '—'}</span>
                            </div>
                            <div className="perfil-readonly-item">
                                <span className="readonly-label">Rol</span>
                                <span className="readonly-value">{usuario?.rol || '—'}</span>
                            </div>
                            <div className="perfil-readonly-item">
                                <span className="readonly-label">ID de cuenta</span>
                                <span className="readonly-value readonly-id">
                                    {usuario?.id ? `${usuario.id.substring(0, 8)}...` : '—'}
                                </span>
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
=======
    return (
        <div className="perfil-container">
            <div className="perfil-card">
                <h2>Mi Perfil</h2>
                <p className="perfil-subtitle">Actualiza tu información de contacto</p>
                
                {mensaje.texto && (
                    <div className={`alert alert-${mensaje.tipo}`}>
                        {mensaje.texto}
                    </div>
                )}
                
                <form onSubmit={handleSubmit} className="perfil-form">
                    <div className="form-group">
                        <label htmlFor="correo">Correo Electrónico:</label>
                        <input 
                            type="email" 
                            id="correo"
                            name="correo" 
                            value={formData.correo} 
                            onChange={handleChange} 
                            required 
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="telefono">Número de Teléfono:</label>
                        <input 
                            type="text" 
                            id="telefono"
                            name="telefono" 
                            value={formData.telefono} 
                            onChange={handleChange} 
                            required 
                        />
                    </div>
                    
                    <button type="submit" className="btn-guardar" disabled={loading}>
                        {loading ? 'Guardando cambios...' : 'Guardar Cambios'}
                    </button>
                </form>
            </div>
        </div>
    );
};
>>>>>>> 39bc538f0eda125f0044d618a9460bafd1c6a8a8

export default Perfil;