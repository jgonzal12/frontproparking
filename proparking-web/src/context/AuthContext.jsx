import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [usuario, setUsuario] = useState(() => {
        const token = localStorage.getItem('token');
        if (!token) return null;
        return {
            token,
            rol:      localStorage.getItem('rol'),
            nombre:   localStorage.getItem('nombre'),
            apellido: localStorage.getItem('apellido'),
            email:    localStorage.getItem('email'),
            id:       localStorage.getItem('id'),
        };
    });

    const login = (data) => {
        localStorage.setItem('token',    data.token);
        localStorage.setItem('rol',      data.rol);
        localStorage.setItem('nombre',   data.nombre);
        localStorage.setItem('apellido', data.apellido || '');
        localStorage.setItem('email',    data.email    || '');
        localStorage.setItem('id',       data.id);
        setUsuario({
            token:    data.token,
            rol:      data.rol,
            nombre:   data.nombre,
            apellido: data.apellido || '',
            email:    data.email    || '',
            id:       data.id,
        });
    };

    const logout = () => {
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