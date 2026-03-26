import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { verificarCodigo, registrarUsuario } from '../services/authService';
import '../styles/Auth.css';

const MAX_INTENTOS = 5;

function Verify() {
    const location = useLocation();
    const navigate = useNavigate();

    const [email]                         = useState(location.state?.email || '');
    const [nombre]                        = useState(location.state?.nombre || '');
    const [apellido]                      = useState(location.state?.apellido || '');
    const [password]                      = useState(location.state?.password || '');
    const [codigo, setCodigo]             = useState('');
    const [error, setError]               = useState('');
    const [exito, setExito]               = useState('');
    const [intentos, setIntentos]         = useState(0);
    const [bloqueado, setBloqueado]       = useState(false);
    const [reenviando, setReenviando]     = useState(false);
    const [cooldown, setCooldown]         = useState(0); // segundos restantes para reenviar

    // Cuenta regresiva para evitar spam de reenvíos
    const iniciarCooldown = () => {
        setCooldown(60);
        const interval = setInterval(() => {
            setCooldown(prev => {
                if (prev <= 1) { clearInterval(interval); return 0; }
                return prev - 1;
            });
        }, 1000);
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        setError('');
        setExito('');
        try {
            await verificarCodigo(email, codigo);
            navigate('/login', { state: { mensaje: '¡Cuenta activada! Ahora puedes iniciar sesión.' } });
        } catch (err) {
            const nuevosIntentos = intentos + 1;
            setIntentos(nuevosIntentos);
            if (nuevosIntentos >= MAX_INTENTOS) {
                setBloqueado(true);
            } else {
                setError(`Código incorrecto. Te quedan ${MAX_INTENTOS - nuevosIntentos} intento(s).`);
                setCodigo('');
            }
        }
    };

    const handleReenviar = async () => {
        if (cooldown > 0 || reenviando) return;

        // Si no tenemos los datos del formulario original, mandamos al registro
        if (!email) {
            navigate('/register');
            return;
        }

        setReenviando(true);
        setError('');
        setExito('');
        try {
            // Llamamos al mismo endpoint de registro — el backend detecta
            // que el usuario existe pero no está verificado y reenvía el código
            await registrarUsuario({ nombre, apellido, email, password });
            setExito('¡Código reenviado! Revisa tu correo.');
            setCodigo('');
            setIntentos(0);
            setBloqueado(false);
            iniciarCooldown();
        } catch (err) {
            // Si llegó aquí con error es que el correo ya está verificado (caso raro)
            setError('No se pudo reenviar el código. ' + err);
        } finally {
            setReenviando(false);
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-card">
                <h2>Verificar Cuenta</h2>

                {bloqueado ? (
                    <div>
                        <div className="error-msg" style={{ marginBottom: 16 }}>
                            Demasiados intentos fallidos. Solicita un nuevo código.
                        </div>
                        <button
                            className="btn-primary"
                            onClick={handleReenviar}
                            disabled={reenviando || cooldown > 0}
                        >
                            {reenviando
                                ? 'Enviando...'
                                : cooldown > 0
                                    ? `Reenviar en ${cooldown}s`
                                    : 'Enviar nuevo código'}
                        </button>
                        {exito && <div className="success-msg" style={{ marginTop: 12 }}>{exito}</div>}
                        {error  && <div className="error-msg"   style={{ marginTop: 12 }}>{error}</div>}
                    </div>
                ) : (
                    <>
                        <p>
                            Ingresa el código de 6 dígitos enviado a:<br />
                            <strong>{email}</strong>
                        </p>

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
                                    onClick={handleReenviar}
                                    disabled={reenviando || cooldown > 0}
                                    style={{
                                        background: 'none', border: 'none',
                                        color: cooldown > 0 ? '#94a3b8' : '#2563eb',
                                        fontSize: 13, cursor: cooldown > 0 ? 'default' : 'pointer'
                                    }}
                                >
                                    {reenviando
                                        ? 'Enviando...'
                                        : cooldown > 0
                                            ? `Reenviar en ${cooldown}s`
                                            : '¿No recibiste el código? Reenviar'}
                                </button>
                            </div>

                            <button type="submit" className="btn-primary">Validar Código</button>
                        </form>

                        {exito && <div className="success-msg" style={{ marginTop: 12 }}>{exito}</div>}
                        {error && <div className="error-msg"   style={{ marginTop: 12 }}>{error}</div>}
                    </>
                )}
            </div>
        </div>
    );
}

export default Verify;