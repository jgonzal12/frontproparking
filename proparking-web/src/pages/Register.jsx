import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registrarUsuario } from '../services/authService';
import '../styles/Auth.css';

function Register() {
    const [formData, setFormData] = useState({
        nombre: '', apellido: '', email: '', password: '', confirmarPassword: ''
    });
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmarPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        setCargando(true);
        try {
            const { confirmarPassword, ...datos } = formData;
            await registrarUsuario(datos);
            navigate('/verify', { state: { email: formData.email } });
        } catch (err) {
            setError(err);
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-card">
                <h2>Crear Cuenta</h2>
                <p>Regístrate para usar ProParking</p>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Nombres</label>
                        <input
                            type="text"
                            placeholder="Ej. Juan Andrés"
                            value={formData.nombre}
                            onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Apellidos</label>
                        <input
                            type="text"
                            placeholder="Ej. González Pérez"
                            value={formData.apellido}
                            onChange={e => setFormData({ ...formData, apellido: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Correo Electrónico</label>
                        <input
                            type="email"
                            placeholder="correo@ejemplo.com"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Contraseña</label>
                        <input
                            type="password"
                            placeholder="Mínimo 8 caracteres"
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Confirmar Contraseña</label>
                        <input
                            type="password"
                            placeholder="Repite tu contraseña"
                            value={formData.confirmarPassword}
                            onChange={e => setFormData({ ...formData, confirmarPassword: e.target.value })}
                            required
                        />
                    </div>

                    <button type="submit" className="btn-primary" disabled={cargando}>
                        {cargando ? 'Registrando...' : 'Registrarme'}
                    </button>
                </form>

                {error && <div className="error-msg">{error}</div>}

                <div className="auth-footer">
                    ¿Ya tienes una cuenta? <Link to="/login">Inicia sesión aquí</Link>
                </div>
            </div>
        </div>
    );
}

export default Register;