import { createContext, useContext, useState } from 'react';
import { cerrarSesion } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {

    const [usuario, setUsuario] = useState(() => {
        const rol    = localStorage.getItem('rol');
        const nombre = localStorage.getItem('nombre');
        const id     = localStorage.getItem('id');
        if (!rol) return null;
        return { rol, nombre, id };
    });

    const login = (data) => {

        localStorage.setItem('rol',    data.rol);
        localStorage.setItem('nombre', data.nombre);
        localStorage.setItem('id',     data.id);
        setUsuario({ rol: data.rol, nombre: data.nombre, id: data.id });
    };

    const logout = async () => {

        await cerrarSesion();
        localStorage.clear();
        setUsuario(null);
    };

    return (
        <AuthContext.Provider value={{ usuario, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}