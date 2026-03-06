import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registrarUsuario } from '../services/authService';
import '../styles/Auth.css';

function Register() {
    const [formData, setFormData] = useState({
        nombre: '', apellido: '', email: '', password: ''
    });
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setCargando(true);
        try {
            await registrarUsuario(formData);
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
                        <label>Nombre</label>
                        <input type="text" placeholder="Ej. Juan Andrés"
                            onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                            required />
                    </div>

                    <div className="form-group">
                        <label>Apellido</label>
                        <input type="text" placeholder="Ej. González"
                            onChange={e => setFormData({ ...formData, apellido: e.target.value })}
                            required />
                    </div>

                    <div className="form-group">
                        <label>Correo Electrónico</label>
                        <input type="email" placeholder="correo@ejemplo.com"
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            required />
                    </div>

                    <div className="form-group">
                        <label>Contraseña</label>
                        <input type="password" placeholder="Mínimo 8 caracteres"
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                            required />
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