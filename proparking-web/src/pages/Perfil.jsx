import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { actualizarPerfil } from '../services/usuarioService';
import '../styles/Perfil.css'; // Archivo de estilos que crearemos en el siguiente paso

const Perfil = () => {
    const { usuario, setUsuario } = useContext(AuthContext); // Asegúrate de que tu contexto exponga 'usuario' y 'setUsuario'
    const [formData, setFormData] = useState({
        correo: '',
        telefono: ''
    });
    const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (usuario) {
            setFormData({
                correo: usuario.correo || '',
                telefono: usuario.telefono || ''
            });
        }
    }, [usuario]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMensaje({ texto: '', tipo: '' });
        setLoading(true);
        
        try {
            const data = await actualizarPerfil(formData);
            
            // Si el backend devuelve un token nuevo, actualízalo. Si solo devuelve datos, actualiza el estado.
            setUsuario(data); 
            
            setMensaje({ texto: 'Tus datos han sido actualizados correctamente.', tipo: 'success' });
        } catch (error) {
            setMensaje({ 
                texto: error.response?.data?.message || 'Hubo un error al actualizar el perfil.', 
                tipo: 'error' 
            });
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
                    <div className={`alert alert-${mensaje.tipo}`}>
                        {mensaje.texto}
                    </div>
                )}
                
                <form onSubmit={handleSubmit} className="perfil-form">
                    <div className="form-group">
                        <label htmlFor="correo">Correo Electrónico:</label>
                        <input 
                            type="email" 
                            id="correo"
                            name="correo" 
                            value={formData.correo} 
                            onChange={handleChange} 
                            required 
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="telefono">Número de Teléfono:</label>
                        <input 
                            type="text" 
                            id="telefono"
                            name="telefono" 
                            value={formData.telefono} 
                            onChange={handleChange} 
                            required 
                        />
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