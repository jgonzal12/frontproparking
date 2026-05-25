import { createContext, useContext, useState, useCallback } from 'react';
import { cerrarSesion } from '../services/authService';

const AuthContext = createContext(null);

/**
 * AuthContext — expone: usuario, login, logout, updateUsuario
 *
 * usuario contiene: { id, rol, nombre, apellido, email }
 * El JWT viaja en cookie HttpOnly — nunca en localStorage.
 * localStorage solo guarda datos no sensibles para rehidratar el estado.
 */
export function AuthProvider({ children }) {

    const [usuario, setUsuario] = useState(() => {
        try {
            const rol = localStorage.getItem('rol');
            const nombre = localStorage.getItem('nombre');
            const apellido = localStorage.getItem('apellido');
            const email = localStorage.getItem('email');
            const id = localStorage.getItem('id');
            if (!rol || !nombre || !id) return null;
            return { rol, nombre, apellido: apellido || '', email: email || '', id };
        } catch {
            return null;
        }
    });

    const login = useCallback((data) => {
        try {
            localStorage.setItem('rol', data.rol);
            localStorage.setItem('nombre', data.nombre);
            localStorage.setItem('apellido', data.apellido || '');
            localStorage.setItem('email', data.email || '');
            localStorage.setItem('id', String(data.id));
        } catch { /* ignore */ }

        setUsuario({
            rol: data.rol,
            nombre: data.nombre,
            apellido: data.apellido || '',
            email: data.email || '',
            id: data.id,
        });
    }, []);

    const logout = useCallback(async () => {
        try { await cerrarSesion(); } catch { /* ignore */ }
        try { localStorage.clear(); } catch { /* ignore */ }
        setUsuario(null);
    }, []);

    /**
     * updateUsuario — actualiza solo nombre/apellido/email, NUNCA el rol.
     * Usar desde Perfil.jsx después de actualizar en el backend.
     */
    const updateUsuario = useCallback((data) => {
        setUsuario(prev => {
            if (!prev) return prev;
            const updated = {
                ...prev,
                nombre: data.nombre ?? prev.nombre,
                apellido: data.apellido ?? prev.apellido,
                email: data.email ?? prev.email,
            };
            try {
                localStorage.setItem('nombre', updated.nombre);
                localStorage.setItem('apellido', updated.apellido);
                localStorage.setItem('email', updated.email);
            } catch { /* ignore */ }
            return updated;
        });
    }, []);

    return (
        <AuthContext.Provider value={{ usuario, login, logout, updateUsuario }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
    return context;
}

export { AuthContext };