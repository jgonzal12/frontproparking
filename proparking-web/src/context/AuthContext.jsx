import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    // Inicializa desde localStorage para que al refrescar la página no se pierda la sesión
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

// Hook para usar el contexto fácilmente en cualquier componente
export function useAuth() {
    return useContext(AuthContext);
}