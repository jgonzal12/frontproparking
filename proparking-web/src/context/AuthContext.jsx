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
        const telefono = localStorage.getItem('telefono');
        if (!rol) return null;
        return { rol, nombre, apellido, id, email, telefono };
    });

    const login = (data) => {
        localStorage.setItem('rol',      data.rol);
        localStorage.setItem('nombre',   data.nombre);
        localStorage.setItem('apellido', data.apellido  || '');
        localStorage.setItem('id',       data.id);
        localStorage.setItem('email',    data.email     || '');
        localStorage.setItem('telefono', data.telefono  || '');
        setUsuario({
            rol:      data.rol,
            nombre:   data.nombre,
            apellido: data.apellido  || '',
            id:       data.id,
            email:    data.email     || '',
            telefono: data.telefono  || '',
        });
    };

    // Permite actualizar campos del perfil sin cerrar sesión
    const actualizarUsuario = (datos) => {
        const nuevo = { ...usuario, ...datos };
        if (datos.email    !== undefined) localStorage.setItem('email',    datos.email);
        if (datos.telefono !== undefined) localStorage.setItem('telefono', datos.telefono);
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