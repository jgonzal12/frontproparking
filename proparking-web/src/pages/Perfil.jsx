import { useAuth } from '../context/AuthContext';
import '../styles/Perfil.css';

const rolLabel = {
    CLIENTE: 'Cliente',
    ADMIN: 'Administrador',
    SUPER_ADMIN: 'Super Admin',
};

const rolColor = {
    CLIENTE: { bg: '#e0e7ff', color: '#2563eb' },
    ADMIN: { bg: '#fef08a', color: '#854d0e' },
    SUPER_ADMIN: { bg: '#ede9fe', color: '#7c3aed' },
};

function Perfil() {
    const { usuario } = useAuth();

    if (!usuario) return null;

    const colores = rolColor[usuario.rol] || { bg: '#e2e8f0', color: '#475569' };
    const inicial = (usuario.nombre || 'U')[0].toUpperCase();

    return (
        <div className="perfil-wrapper">
            <div className="perfil-card">

                {/* ── Avatar y nombre ── */}
                <div className="perfil-header">
                    <div className="perfil-avatar">{inicial}</div>
                    <div className="perfil-header-info">
                        <h2 className="perfil-nombre">
                            {usuario.nombre} {usuario.apellido}
                        </h2>
                        <span
                            className="perfil-rol-badge"
                            style={{ backgroundColor: colores.bg, color: colores.color }}
                        >
                            {rolLabel[usuario.rol] || usuario.rol}
                        </span>
                    </div>
                </div>

                <div className="perfil-divider" />

                {/* ── Información ── */}
                <div className="perfil-section-title">Información de la cuenta</div>

                <div className="perfil-fields">
                    <div className="perfil-field">
                        <span className="perfil-field-label">Nombre</span>
                        <span className="perfil-field-value">{usuario.nombre}</span>
                    </div>

                    <div className="perfil-field">
                        <span className="perfil-field-label">Apellido</span>
                        <span className="perfil-field-value">{usuario.apellido || '—'}</span>
                    </div>

                    <div className="perfil-field">
                        <span className="perfil-field-label">Correo electrónico</span>
                        <span className="perfil-field-value">{usuario.email}</span>
                    </div>

                    <div className="perfil-field">
                        <span className="perfil-field-label">Rol</span>
                        <span className="perfil-field-value">
                            {rolLabel[usuario.rol] || usuario.rol}
                        </span>
                    </div>
                </div>

                <div className="perfil-divider" />

                {/* ── Cambiar contraseña ── */}
                <div className="perfil-section-title">Seguridad</div>

                <div className="perfil-info-box">
                    <span className="perfil-info-icon">🔒</span>
                    <div>
                        <p className="perfil-info-text">
                            ¿Quieres cambiar tu contraseña? Puedes hacerlo desde la pantalla de
                            recuperación de contraseña.
                        </p>
                        <a href="/recuperar-password" className="perfil-link">
                            Cambiar contraseña →
                        </a>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default Perfil;