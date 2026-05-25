import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Navbar.css';

function Navbar() {
    const { usuario, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [menuAbierto, setMenuAbierto] = useState(false);
    const menuRef = useRef(null);

    // Cerrar menú al hacer click fuera
    useEffect(() => {
        const handler = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuAbierto(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Cerrar menú al cambiar de ruta
    useEffect(() => {
        setMenuAbierto(false);
    }, [location.pathname]);

    // A dónde va el logo según el rol
    const homeRuta = () => {
        if (!usuario) return '/';
        switch (usuario.rol) {
            case 'SUPER_ADMIN': return '/superadmin-dashboard';
            case 'ADMIN': return '/admin-dashboard';
            default: return '/dashboard';
        }
    };

    // Configuración del botón "Volver" según la ruta actual
    const volverConfig = () => {
        const path = location.pathname;
        if (path === '/reportes') return { label: '← Panel Admin', ruta: '/admin-dashboard' };
        if (path === '/perfil') return { label: '← Volver', ruta: homeRuta() };
        if (path === '/restablecer-password') return { label: '← Recuperar', ruta: '/recuperar-password' };
        return null;
    };

    const volver = volverConfig();

    // Etiqueta del rol en español
    const rolLabel = {
        CLIENTE: 'Cliente',
        ADMIN: 'Administrador',
        SUPER_ADMIN: 'Super Admin',
    }[usuario?.rol] || usuario?.rol;

    // Color del badge de rol
    const rolColor = {
        CLIENTE: { bg: '#e0e7ff', color: '#2563eb' },
        ADMIN: { bg: '#fef08a', color: '#854d0e' },
        SUPER_ADMIN: { bg: '#ede9fe', color: '#7c3aed' },
    }[usuario?.rol] || { bg: '#e2e8f0', color: '#475569' };

    const handleLogout = () => {
        setMenuAbierto(false);
        logout();
        navigate('/login');
    };

    const handleVolver = () => navigate(volver.ruta);

    // Páginas sin navbar
    const rutasSinNavbar = ['/login', '/register', '/verify', '/recuperar-password', '/restablecer-password'];
    if (rutasSinNavbar.includes(location.pathname)) return null;

    return (
        <header className="global-navbar">
            <div className="global-navbar__inner">

                {/* ── Lado izquierdo: Logo + Volver ── */}
                <div className="global-navbar__left">
                    <Link to={homeRuta()} className="global-navbar__logo">
                        <span className="global-navbar__logo-icon">🅿</span>
                        <span className="global-navbar__logo-text">ProParking</span>
                    </Link>

                    {volver && (
                        <button
                            className="global-navbar__back"
                            onClick={handleVolver}
                            title={volver.label}
                        >
                            {volver.label}
                        </button>
                    )}
                </div>

                {/* ── Lado derecho: menú de usuario ── */}
                {usuario && (
                    <div className="global-navbar__right" ref={menuRef}>
                        <button
                            className="global-navbar__user-btn"
                            onClick={() => setMenuAbierto(prev => !prev)}
                            aria-expanded={menuAbierto}
                            aria-haspopup="true"
                        >
                            <span className="global-navbar__avatar">
                                {(usuario.nombre || 'U')[0].toUpperCase()}
                            </span>
                            <span className="global-navbar__username">
                                {usuario.nombre}
                            </span>
                            <span className={`global-navbar__chevron ${menuAbierto ? 'open' : ''}`}>
                                ▾
                            </span>
                        </button>

                        {/* ── Dropdown menú ── */}
                        {menuAbierto && (
                            <div className="global-navbar__dropdown" role="menu">

                                {/* Info del usuario */}
                                <div className="global-navbar__user-info">
                                    <div className="global-navbar__user-avatar-lg">
                                        {(usuario.nombre || 'U')[0].toUpperCase()}
                                    </div>
                                    <div className="global-navbar__user-details">
                                        <span className="global-navbar__user-name">
                                            {usuario.nombre} {usuario.apellido}
                                        </span>
                                        <span className="global-navbar__user-email">
                                            {usuario.email}
                                        </span>
                                        <span
                                            className="global-navbar__user-rol"
                                            style={{ backgroundColor: rolColor.bg, color: rolColor.color }}
                                        >
                                            {rolLabel}
                                        </span>
                                    </div>
                                </div>

                                <div className="global-navbar__divider" />

                                <Link
                                    to="/perfil"
                                    className="global-navbar__menu-item"
                                    role="menuitem"
                                >
                                    <span>👤</span> Mi Perfil
                                </Link>

                                <div className="global-navbar__divider" />

                                <button
                                    className="global-navbar__menu-item global-navbar__menu-item--danger"
                                    onClick={handleLogout}
                                    role="menuitem"
                                >
                                    <span>🚪</span> Cerrar Sesión
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Si no hay usuario (landing) */}
                {!usuario && (
                    <nav className="global-navbar__guest-nav">
                        <Link to="/login" className="global-navbar__guest-link">Iniciar Sesión</Link>
                        <Link to="/register" className="global-navbar__guest-link global-navbar__guest-link--primary">Registrarse</Link>
                    </nav>
                )}
            </div>
        </header>
    );
}

export default Navbar;