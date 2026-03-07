import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { verificarCodigo } from '../services/authService';
import '../styles/Auth.css';

const MAX_INTENTOS = 5;

function Verify() {
    const location = useLocation();
    const navigate = useNavigate();

    const [email] = useState(location.state?.email || '');
    const [codigo, setCodigo] = useState('');
    const [error, setError] = useState('');
    const [intentos, setIntentos] = useState(0);
    const [bloqueado, setBloqueado] = useState(false);
    const [mensajeBloqueado, setMensajeBloqueado] = useState('');

    const handleVerify = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await verificarCodigo(email, codigo);
            navigate('/login', { state: { mensaje: '¡Cuenta activada! Ahora puedes iniciar sesión.' } });
        } catch (err) {
            const mensaje = typeof err === 'string' ? err : 'Código incorrecto';

            // Si el código expiró → bloquear con mensaje directo
            if (mensaje.toLowerCase().includes('expirado')) {
                setMensajeBloqueado(mensaje);
                setBloqueado(true);
                return;
            }

            const nuevosIntentos = intentos + 1;
            setIntentos(nuevosIntentos);

            if (nuevosIntentos >= MAX_INTENTOS) {
                setMensajeBloqueado('Demasiados intentos fallidos.');
                setBloqueado(true);
            } else {
                setError(`${mensaje}. Te quedan ${MAX_INTENTOS - nuevosIntentos} intento(s).`);
                setCodigo('');
            }
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-card">
                <h2>Verificar Cuenta</h2>

                {bloqueado ? (
                    <div>
                        <div className="error-msg" style={{ marginBottom: 16 }}>
                            {mensajeBloqueado} Vuelve a registrarte para obtener un nuevo código.
                        </div>
                        <button className="btn-primary" onClick={() => navigate('/register')}>
                            Volver al registro
                        </button>
                    </div>
                ) : (
                    <>
                        <p>Ingresa el código de 6 dígitos enviado a:<br /><strong>{email}</strong></p>

                        <form onSubmit={handleVerify}>
                            <div className="form-group">
                                <label>Código de Verificación</label>
                                <input
                                    type="text"
                                    placeholder="000000"
                                    maxLength="6"
                                    value={codigo}
                                    onChange={e => setCodigo(e.target.value)}
                                    style={{ letterSpacing: '8px', textAlign: 'center', fontSize: '20px' }}
                                    required
                                />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, marginBottom: 4 }}>
                                <span style={{ fontSize: 12, color: '#94a3b8' }}>
                                    {intentos > 0 && `Intentos: ${intentos}/${MAX_INTENTOS}`}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => navigate('/register')}
                                    style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: 13, cursor: 'pointer' }}>
                                    ¿No recibiste el código?
                                </button>
                            </div>
                            <button type="submit" className="btn-primary">Validar Código</button>
                        </form>

                        {error && <div className="error-msg" style={{ marginTop: 12 }}>{error}</div>}
                    </>
                )}
            </div>
        </div>
    );
}

export default Verify;