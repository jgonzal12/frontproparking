import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { verificarCodigo } from '../services/authService';
import '../styles/Auth.css'; // 🔹 Importamos los estilos

function Verify() {
    const location = useLocation();
    const navigate = useNavigate();
    
    // Recuperamos el email que venía desde la pantalla de registro
    const [email] = useState(location.state?.email || '');
    const [codigo, setCodigo] = useState('');
    const [error, setError] = useState('');

    const handleVerify = async (e) => {
        e.preventDefault();
        setError('');

        try {
            await verificarCodigo(email, codigo);
            alert("¡Cuenta activada! Ahora puedes iniciar sesión.");
            navigate('/login'); // Ya verificado, lo mandamos al login
        } catch (err) {
            setError(err);
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-card">
                <h2>Verificar Cuenta</h2>
                <p>Ingresa el código de 6 dígitos enviado a:<br/><strong>{email}</strong></p>
                
                <form onSubmit={handleVerify}>
                    <div className="form-group">
                        <label>Código de Verificación</label>
                        <input
                            type="text"
                            placeholder="000000"
                            maxLength="6"
                            value={codigo}
                            onChange={e => setCodigo(e.target.value)}
                            style={{ letterSpacing: '8px', textAlign: 'center', fontSize: '20px' }} // 🔹 Toque extra para que parezca un código
                            required
                        />
                    </div>
                    
                    <button type="submit" className="btn-primary">Validar Código</button>
                </form>

                {error && <div className="error-msg">{error}</div>}
            </div>
        </div>
    );
}

export default Verify;