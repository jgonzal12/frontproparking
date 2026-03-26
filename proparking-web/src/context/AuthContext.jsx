import { createContext, useContext, useState } from 'react';
import { cerrarSesion } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [usuario, setUsuario] = useState(() => {
        const token = localStorage.getItem('token');
        if (!token) return null;
        return {
            token,
            rol:    localStorage.getItem('rol'),
            nombre: localStorage.getItem('nombre'),
            id:     localStorage.getItem('id'),
        };
    });

    const login = (data) => {
        localStorage.setItem('token',  data.token);
        localStorage.setItem('rol',    data.rol);
        localStorage.setItem('nombre', data.nombre);
        localStorage.setItem('id',     data.id);
        setUsuario(data);
    };

    // Logout real: primero invalida el token en el servidor,
    // luego limpia el estado local
    const logout = async () => {
        await cerrarSesion(); // llama a POST /auth/logout con el token actual
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