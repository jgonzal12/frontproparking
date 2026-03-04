import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { solicitarRecuperacion } from '../services/authService';
import '../styles/Auth.css';

function RecuperarPassword() {
    const [email, setEmail]       = useState('');
    const [error, setError]       = useState('');
    const [exito, setExito]       = useState('');
    const [cargando, setCargando] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setExito('');
        setCargando(true);

        try {
            await solicitarRecuperacion(email);
            setExito('Te enviamos un código a tu correo. Tienes 15 minutos para usarlo.');
            // Redirige a la página de restablecimiento pasando el email
            setTimeout(() => navigate('/restablecer-password', { state: { email } }), 2000);
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
                <p>Ingresa tu correo y te enviaremos un código para recuperar tu contraseña.</p>

                <form onSubmit={handleSubmit}>
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
                    <button type="submit" className="btn-primary" disabled={cargando}>
                        {cargando ? 'Enviando...' : 'Enviar código'}
                    </button>
                </form>

                {error  && <div className="error-msg">{error}</div>}
                {exito  && <div className="success-msg">{exito}</div>}

                <div className="auth-footer">
                    <Link to="/login">← Volver al login</Link>
                </div>
            </div>
        </div>
    );
}

export default RecuperarPassword;