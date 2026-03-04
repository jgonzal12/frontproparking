import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { iniciarSesion } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import '../styles/Auth.css';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setCargando(true);

        try {
            const data = await iniciarSesion(email, password);
            // Guarda la sesión en el contexto (y en localStorage internamente)
            login(data);

            if (data.rol === 'ADMIN' || data.rol === 'SUPER_ADMIN') {
                navigate('/admin-dashboard');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err);
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-card">
                <h2>ProParking</h2>
                <p>Ingresa tus credenciales para iniciar sesión</p>

                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label>Correo Electrónico</label>
                        <input
                            type="email"
                            placeholder="correo@ejemplo.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Contraseña</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn-primary" disabled={cargando}>
                        {cargando ? 'Ingresando...' : 'Entrar'}
                    </button>
                </form>

                {error && <div className="error-msg">{error}</div>}

                <div className="auth-footer">
                    ¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link>
                </div>
            </div>
        </div>
    );
}

export default Login;