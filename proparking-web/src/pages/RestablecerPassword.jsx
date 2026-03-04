import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { restablecerPassword } from '../services/authService';
import '../styles/Auth.css';

function RestablecerPassword() {
    const location = useLocation();
    const navigate  = useNavigate();

    // Recibe el email de la página anterior vía state
    const [email, setEmail]               = useState(location.state?.email || '');
    const [codigo, setCodigo]             = useState('');
    const [nuevaPassword, setNuevaPassword] = useState('');
    const [confirmar, setConfirmar]       = useState('');
    const [error, setError]               = useState('');
    const [cargando, setCargando]         = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (nuevaPassword !== confirmar) {
            setError('Las contraseñas no coinciden');
            return;
        }
        if (nuevaPassword.length < 8) {
            setError('La contraseña debe tener mínimo 8 caracteres');
            return;
        }

        setCargando(true);
        try {
            await restablecerPassword(email, codigo, nuevaPassword);
            navigate('/login', {
                state: { mensaje: 'Contraseña actualizada. Ya puedes iniciar sesión.' }
            });
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
                <p>Ingresa el código que recibiste y tu nueva contraseña.</p>

                <form onSubmit={handleSubmit}>
                    {/* Si el email no vino por state, permitir ingresarlo */}
                    {!location.state?.email && (
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
                    )}
                    <div className="form-group">
                        <label>Código de recuperación</label>
                        <input
                            type="text"
                            placeholder="123456"
                            maxLength={6}
                            value={codigo}
                            onChange={e => setCodigo(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Nueva contraseña</label>
                        <input
                            type="password"
                            placeholder="Mínimo 8 caracteres"
                            value={nuevaPassword}
                            onChange={e => setNuevaPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Confirmar contraseña</label>
                        <input
                            type="password"
                            placeholder="Repite la contraseña"
                            value={confirmar}
                            onChange={e => setConfirmar(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn-primary" disabled={cargando}>
                        {cargando ? 'Guardando...' : 'Cambiar contraseña'}
                    </button>
                </form>

                {error && <div className="error-msg">{error}</div>}

                <div className="auth-footer">
                    <Link to="/recuperar-password">¿No recibiste el código? Reenviar</Link>
                </div>
            </div>
        </div>
    );
}

export default RestablecerPassword;