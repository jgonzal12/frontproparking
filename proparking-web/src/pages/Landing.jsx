import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { listarParqueaderosPublico } from '../services/parqueaderoService';
import MapaParqueaderos from '../components/MapaParqueaderos';
import '../styles/Landing.css';

function Landing() {
    const [parqueaderos, setParqueaderos] = useState([]);

    useEffect(() => {
        listarParqueaderosPublico()
            .then(setParqueaderos)
            .catch(() => {});
    }, []);

    return (
        <div className="landing-container">
            <header className="landing-header">
                <div className="landing-logo">ProParking</div>
                <nav className="landing-nav">
                    <Link to="/login"    className="btn-outline">Iniciar Sesión</Link>
                    <Link to="/register" className="btn-solid">Registrarse</Link>
                </nav>
            </header>

            <main className="landing-hero">
                <h1>Tu parqueadero, <br /> más inteligente y seguro</h1>
                <p>
                    ProParking es la plataforma definitiva para gestionar cupos,
                    reservas y el control de acceso de vehículos de forma rápida,
                    segura y desde cualquier lugar.
                </p>
                <div className="hero-buttons">
                    <Link to="/register" className="btn-solid"
                        style={{ padding: '14px 28px', fontSize: '16px' }}>
                        Comenzar Ahora
                    </Link>
                    <Link to="/login" className="btn-outline"
                        style={{ padding: '14px 28px', fontSize: '16px', backgroundColor: 'white' }}>
                        Ya tengo cuenta
                    </Link>
                </div>
            </main>

            {/* Mapa de parqueaderos */}
            <section style={{ padding: '48px 24px', backgroundColor: '#f8fafc' }}>
                <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                    <h2 style={{ textAlign: 'center', marginBottom: 8, fontSize: 28 }}>
                        Nuestros Parqueaderos
                    </h2>
                    <p style={{ textAlign: 'center', color: '#64748b', marginBottom: 28 }}>
                        Encuentra el parqueadero más cercano a ti en Bogotá
                    </p>
                    <div style={{ height: 450, borderRadius: 12, overflow: 'hidden',
                                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
                        <MapaParqueaderos parqueaderos={parqueaderos} modoRegistro={false} />
                    </div>
                    {/* Leyenda */}
                    <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginTop: 16 }}>
                        <span style={{ fontSize: 13, color: '#475569' }}>
                            <span style={{ color: '#16a34a', fontWeight: 700 }}>● </span>
                            Con espacios disponibles
                        </span>
                        <span style={{ fontSize: 13, color: '#475569' }}>
                            <span style={{ color: '#dc2626', fontWeight: 700 }}>● </span>
                            Sin espacios
                        </span>
                    </div>
                </div>
            </section>

            <section className="landing-features">
                <div className="feature-card">
                    <div className="feature-icon">🚗</div>
                    <h3>Gestión de Vehículos</h3>
                    <p>Registra y administra los vehículos de los clientes con facilidad.</p>
                </div>
                <div className="feature-card">
                    <div className="feature-icon">📊</div>
                    <h3>Control en Tiempo Real</h3>
                    <p>Visualiza los cupos disponibles al instante.</p>
                </div>
                <div className="feature-card">
                    <div className="feature-icon">🔒</div>
                    <h3>Máxima Seguridad</h3>
                    <p>Autenticación segura y acceso controlado por roles.</p>
                </div>
            </section>

            <footer className="landing-footer">
                <p>&copy; 2026 ProParking. Todos los derechos reservados.</p>
            </footer>
        </div>
    );
}

export default Landing;