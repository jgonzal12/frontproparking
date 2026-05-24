import { createContext, useContext, useState, useCallback } from 'react';
import { cerrarSesion } from '../services/authService';

const AuthContext = createContext(null);

/**
 * AuthProvider — Contexto de autenticación seguro.
 *
 * Cambios respecto a la versión anterior:
 * 1. NO expone setUsuario directamente (evita que cualquier componente
 *    modifique el estado de autenticación arbitrariamente).
 * 2. La actualización del perfil se hace a través de updateUsuario,
 *    que solo permite cambiar campos no críticos (correo, teléfono).
 * 3. El token JWT viaja en cookie HttpOnly — no se almacena en localStorage.
 * 4. localStorage solo guarda datos no sensibles: rol, nombre, id.
 */
export function AuthProvider({ children }) {

    const [usuario, setUsuario] = useState(() => {
        try {
            const rol = localStorage.getItem('rol');
            const nombre = localStorage.getItem('nombre');
            const id = localStorage.getItem('id');
            // Solo restaurar si hay datos completos
            if (!rol || !nombre || !id) return null;
            return { rol, nombre, id };
        } catch {
            // localStorage puede fallar en modo privado/incógnito
            return null;
        }
    });

    /**
     * login: llamado después de un login exitoso.
     * Solo persiste datos no sensibles — el JWT va en cookie HttpOnly.
     */
    const login = useCallback((data) => {
        try {
            localStorage.setItem('rol', data.rol);
            localStorage.setItem('nombre', data.nombre);
            localStorage.setItem('id', String(data.id));
        } catch {
            // Si localStorage falla, el usuario igual puede usar la app
            // mientras no cierre la pestaña (estado en memoria)
        }
        setUsuario({ rol: data.rol, nombre: data.nombre, id: data.id });
    }, []);

    /**
     * logout: cierra sesión en servidor (revoca JWT) y limpia el estado local.
     */
    const logout = useCallback(async () => {
        try {
            await cerrarSesion(); // invalida el JWT en el servidor
        } catch {
            // Si falla el logout en el servidor, igual limpiamos local
            console.warn('No se pudo invalidar el JWT en el servidor');
        }
        try {
            localStorage.clear();
        } catch {
            // ignore
        }
        setUsuario(null);
    }, []);

    /**
     * updateUsuario: actualiza datos del perfil (solo campos no críticos).
     * El Perfil.jsx debe usar esto en lugar de setUsuario directamente.
     *
     * Solo se permite actualizar nombre y correo — el rol NUNCA se actualiza
     * desde el frontend para evitar escalada de privilegios.
     */
    const updateUsuario = useCallback((data) => {
        setUsuario(prev => {
            if (!prev) return prev;
            const updated = {
                ...prev,
                // Solo permitir actualizar nombre, NO el rol ni el id
                nombre: data.nombre || prev.nombre,
            };
            try {
                localStorage.setItem('nombre', updated.nombre);
            } catch {
                // ignore
            }
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
    if (!context) {
        throw new Error('useAuth debe usarse dentro de AuthProvider');
    }
    return context;
}

export { AuthContext };