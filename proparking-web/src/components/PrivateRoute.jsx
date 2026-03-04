import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// allowedRoles: array de roles permitidos, ej: ['ADMIN', 'SUPER_ADMIN']
// Si no se pasa allowedRoles, solo verifica que esté autenticado
export default function PrivateRoute({ allowedRoles }) {
    const { usuario } = useAuth();

    // No autenticado → al login
    if (!usuario) return <Navigate to="/login" replace />;

    // Rol no permitido → al login
    if (allowedRoles && !allowedRoles.includes(usuario.rol)) {
        return <Navigate to="/login" replace />;
    }

    // Todo OK → renderiza la página hija
    return <Outlet />;
}