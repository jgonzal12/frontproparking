import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { iniciarSesion } from '../services/authService';
import '../styles/Auth.css'; // 🔹 Importamos los nuevos estilos

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(''); // Limpiamos errores previos

        try {
            const data = await iniciarSesion(email, password);

            // Dependiendo del rol, lo mandamos a un lugar distinto
            if (data.rol === 'ADMIN' || data.rol === 'SUPER_ADMIN') {
                navigate('/admin-dashboard');
            } else {
                navigate('/dashboard'); // Si es CLIENTE
            }

        } catch (err) {
            setError(err);
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

                    <button type="submit" className="btn-primary">Entrar</button>
                </form>

                {/* Mensaje de error con su propio estilo CSS */}
                {error && <div className="error-msg">{error}</div>}

                <div className="auth-footer">
                    ¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link>
                </div>
            </div>
        </div>
    );
}

export default Login;