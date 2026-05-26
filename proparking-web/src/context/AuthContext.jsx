import { createContext, useContext, useState } from 'react';
import { cerrarSesion } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {

    const [usuario, setUsuario] = useState(() => {
        const rol      = localStorage.getItem('rol');
        const nombre   = localStorage.getItem('nombre');
        const apellido = localStorage.getItem('apellido');
        const id       = localStorage.getItem('id');
        const email    = localStorage.getItem('email');
        if (!rol) return null;
        return { rol, nombre, apellido, id, email };
    });

    const login = (data) => {
        localStorage.setItem('rol',      data.rol);
        localStorage.setItem('nombre',   data.nombre   || '');
        localStorage.setItem('apellido', data.apellido || '');
        localStorage.setItem('id',       data.id);
        localStorage.setItem('email',    data.email    || '');
        setUsuario({
            rol:      data.rol,
            nombre:   data.nombre   || '',
            apellido: data.apellido || '',
            id:       data.id,
            email:    data.email    || '',
        });
    };

    // Actualiza campos del perfil en el contexto sin cerrar sesión
    const actualizarUsuario = (datos) => {
        const nuevo = { ...usuario, ...datos };
        if (datos.email    !== undefined) localStorage.setItem('email',    datos.email);
        if (datos.nombre   !== undefined) localStorage.setItem('nombre',   datos.nombre);
        if (datos.apellido !== undefined) localStorage.setItem('apellido', datos.apellido);
        setUsuario(nuevo);
    };

    const logout = async () => {
        await cerrarSesion();
        localStorage.clear();
        setUsuario(null);
    };

    return (
        <AuthContext.Provider value={{ usuario, login, logout, actualizarUsuario, setUsuario }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}

export { AuthContext };