import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registrarUsuario } from '../services/authService';
import '../styles/Auth.css'; // 🔹 Importamos los estilos

function Register() {
    const [formData, setFormData] = useState({ nombre: '', email: '', password: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        try {
            await registrarUsuario(formData);
            // Si sale bien, lo mandamos a verificar y le pasamos el email
            navigate('/verify', { state: { email: formData.email } });
        } catch (err) {
            setError(err);
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-card">
                <h2>Crear Cuenta</h2>
                <p>Regístrate para usar ProParking</p>
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Nombre Completo</label>
                        <input
                            type="text"
                            placeholder="Ej. Juan Andrés"
                            onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Correo Electrónico</label>
                        <input
                            type="email"
                            placeholder="correo@ejemplo.com"
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Contraseña</label>
                        <input
                            type="password"
                            placeholder="Crea una contraseña segura"
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                            required />
                    </div>
                    
                    <button type="submit" className="btn-primary">Registrarme</button>
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