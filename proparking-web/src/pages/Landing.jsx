import { Link } from 'react-router-dom';
import '../styles/Landing.css'; // 🔹 Importamos los estilos de la landing

function Landing() {
    return (
        <div className="landing-container">
            {/* Barra superior */}
            <header className="landing-header">
                <div className="landing-logo">ProParking</div>
                <nav className="landing-nav">
                    <Link to="/login" className="btn-outline">Iniciar Sesión</Link>
                    <Link to="/register" className="btn-solid">Registrarse</Link>
                </nav>
            </header>

            {/* Banner Principal */}
            <main className="landing-hero">
                <h1>Tu parqueadero, <br /> más inteligente y seguro</h1>
                <p>
                    ProParking es la plataforma definitiva para gestionar cupos,
                    reservas y el control de acceso de vehículos de forma rápida, segura y desde cualquier lugar.
                </p>
                <div className="hero-buttons">
                    <Link to="/register" className="btn-solid" style={{ padding: '14px 28px', fontSize: '16px' }}>
                        Comenzar Ahora
                    </Link>
                    <Link to="/login" className="btn-outline" style={{ padding: '14px 28px', fontSize: '16px', backgroundColor: 'white' }}>
                        Ya tengo cuenta
                    </Link>
                </div>
            </main>

            {/* Tarjetas de Información */}
            <section className="landing-features">
                <div className="feature-card">
                    <div className="feature-icon">🚗</div>
                    <h3>Gestión de Vehículos</h3>
                    <p>Registra y administra los vehículos de los clientes con facilidad y mantén un historial seguro.</p>
                </div>
                <div className="feature-card">
                    <div className="feature-icon">📊</div>
                    <h3>Control en Tiempo Real</h3>
                    <p>Visualiza los cupos disponibles y el nivel de ocupación del parqueadero al instante.</p>
                </div>
                <div className="feature-card">
                    <div className="feature-icon">🔒</div>
                    <h3>Máxima Seguridad</h3>
                    <p>Acceso controlado por roles y autenticación segura para proteger toda la información.</p>
                </div>
            </section>

            {/* Pie de página */}
            <footer className="landing-footer">
                <p>&copy; 2026 ProParking. Todos los derechos reservados.</p>
            </footer>
        </div>
    );
}

export default Landing;