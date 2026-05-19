import { createContext, useContext, useState } from 'react';
import { cerrarSesion } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {

    const [usuario, setUsuarioState] = useState(() => {
        const rol      = localStorage.getItem('rol');
        const nombre   = localStorage.getItem('nombre');
        const id       = localStorage.getItem('id');
        const email    = localStorage.getItem('email');
        const telefono = localStorage.getItem('telefono');
        if (!rol) return null;
        return { rol, nombre, id, email, telefono };
    });

    const login = (data) => {
        localStorage.setItem('rol',      data.rol);
        localStorage.setItem('nombre',   data.nombre);
        localStorage.setItem('id',       data.id);
        localStorage.setItem('email',    data.email    || '');
        localStorage.setItem('telefono', data.telefono || '');
        setUsuarioState({
            rol:      data.rol,
            nombre:   data.nombre,
            id:       data.id,
            email:    data.email    || '',
            telefono: data.telefono || '',
        });
    };

    // Permite actualizar parcialmente los datos del usuario en contexto y localStorage
    const setUsuario = (nuevosDatos) => {
        const actualizado = { ...usuario, ...nuevosDatos };
        localStorage.setItem('rol',      actualizado.rol      || '');
        localStorage.setItem('nombre',   actualizado.nombre   || '');
        localStorage.setItem('id',       actualizado.id       || '');
        localStorage.setItem('email',    actualizado.email    || '');
        localStorage.setItem('telefono', actualizado.telefono || '');
        setUsuarioState(actualizado);
    };

    const logout = async () => {
        await cerrarSesion();
        localStorage.clear();
        setUsuarioState(null);
    };

    return (
        <AuthContext.Provider value={{ usuario, login, logout, setUsuario }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}

export { AuthContext };