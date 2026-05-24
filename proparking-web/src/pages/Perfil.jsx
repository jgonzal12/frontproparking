import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { actualizarPerfil } from '../services/usuarioService';
import '../styles/Perfil.css';

/**
 * Perfil — Componente para actualizar datos de contacto del usuario.
 *
 * Correcciones de seguridad respecto a la versión anterior:
 * 1. Usa useAuth() en lugar de useContext(AuthContext) directamente.
 * 2. Usa updateUsuario() en lugar de setUsuario() (que no existe en el contexto).
 * 3. Sanitiza el input de teléfono en el frontend antes de enviarlo.
 * 4. Valida el email con un patrón básico antes de enviarlo.
 * 5. Limita la longitud máxima de campos para evitar inputs excesivamente largos.
 */
const Perfil = () => {
    // updateUsuario es el método seguro expuesto por AuthContext
    const { usuario, updateUsuario } = useAuth();

    const [formData, setFormData] = useState({
        correo: '',
        telefono: ''
    });
    const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
    const [loading, setLoading] = useState(false);
    const [errores, setErrores] = useState({});

    // Cargar datos actuales del usuario al montar
    useEffect(() => {
        if (usuario) {
            setFormData({
                correo: usuario.correo || '',
                telefono: usuario.telefono || ''
            });
        }
    }, [usuario]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Sanitización básica en el frontend (el backend valida también)
        let sanitized = value;

        if (name === 'telefono') {
            // Solo números, espacios, +, -, ()  — máx 20 caracteres
            sanitized = value.replace(/[^0-9\s+\-()]/g, '').slice(0, 20);
        }

        if (name === 'correo') {
            // Lowercase y máx 100 caracteres
            sanitized = value.toLowerCase().trim().slice(0, 100);
        }

        setFormData(prev => ({ ...prev, [name]: sanitized }));

        // Limpiar error del campo modificado
        if (errores[name]) {
            setErrores(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validar = () => {
        const nuevosErrores = {};

        // Validar email
        const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
        if (!formData.correo) {
            nuevosErrores.correo = 'El correo es obligatorio';
        } else if (!emailRegex.test(formData.correo)) {
            nuevosErrores.correo = 'Ingresa un correo válido';
        }

        // Validar teléfono (mínimo 7 dígitos)
        const digitosEnTelefono = formData.telefono.replace(/\D/g, '');
        if (!formData.telefono) {
            nuevosErrores.telefono = 'El teléfono es obligatorio';
        } else if (digitosEnTelefono.length < 7) {
            nuevosErrores.telefono = 'Ingresa al menos 7 dígitos';
        }

        setErrores(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMensaje({ texto: '', tipo: '' });

        if (!validar()) return;

        setLoading(true);

        try {
            const data = await actualizarPerfil(formData);

            // Actualizar el contexto de forma segura (solo nombre, no rol)
            updateUsuario(data);

            setMensaje({
                texto: 'Tus datos han sido actualizados correctamente.',
                tipo: 'success'
            });
        } catch (error) {
            const mensajeError = error.response?.data?.error
                || error.response?.data?.message
                || 'Hubo un error al actualizar el perfil.';

            setMensaje({ texto: mensajeError, tipo: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="perfil-container">
            <div className="perfil-card">
                <h2>Mi Perfil</h2>
                <p className="perfil-subtitle">Actualiza tu información de contacto</p>

                {mensaje.texto && (
                    <div className={`alert alert-${mensaje.tipo}`} role="alert">
                        {mensaje.texto}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="perfil-form" noValidate>
                    <div className="form-group">
                        <label htmlFor="correo">Correo Electrónico:</label>
                        <input
                            type="email"
                            id="correo"
                            name="correo"
                            value={formData.correo}
                            onChange={handleChange}
                            maxLength={100}
                            autoComplete="email"
                            required
                            aria-describedby={errores.correo ? 'correo-error' : undefined}
                            style={errores.correo ? { borderColor: '#dc2626' } : {}}
                        />
                        {errores.correo && (
                            <span id="correo-error" style={{ color: '#dc2626', fontSize: 12 }}>
                                {errores.correo}
                            </span>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="telefono">Número de Teléfono:</label>
                        <input
                            type="tel"
                            id="telefono"
                            name="telefono"
                            value={formData.telefono}
                            onChange={handleChange}
                            maxLength={20}
                            autoComplete="tel"
                            placeholder="Ej: +57 300 123 4567"
                            required
                            aria-describedby={errores.telefono ? 'telefono-error' : undefined}
                            style={errores.telefono ? { borderColor: '#dc2626' } : {}}
                        />
                        {errores.telefono && (
                            <span id="telefono-error" style={{ color: '#dc2626', fontSize: 12 }}>
                                {errores.telefono}
                            </span>
                        )}
                    </div>

                    <button type="submit" className="btn-guardar" disabled={loading}>
                        {loading ? 'Guardando cambios...' : 'Guardar Cambios'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Perfil;