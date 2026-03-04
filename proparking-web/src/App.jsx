import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';

import Landing        from './pages/Landing';
import Login          from './pages/Login';
import Register       from './pages/Register';
import Verify         from './pages/Verify';
import Dashboard      from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* Rutas públicas — cualquiera puede acceder */}
                    <Route path="/"         element={<Landing />} />
                    <Route path="/login"    element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/verify"   element={<Verify />} />

                    {/* Rutas protegidas para CLIENTE */}
                    <Route element={<PrivateRoute allowedRoles={['CLIENTE']} />}>
                        <Route path="/dashboard" element={<Dashboard />} />
                    </Route>

                    {/* Rutas protegidas para ADMIN y SUPER_ADMIN */}
                    <Route element={<PrivateRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']} />}>
                        <Route path="/admin-dashboard" element={<AdminDashboard />} />
                    </Route>

                    {/* Cualquier ruta desconocida → inicio */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;