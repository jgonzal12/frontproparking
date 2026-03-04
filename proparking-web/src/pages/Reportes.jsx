import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { obtenerParqueaderos } from '../services/parqueaderoService';
import { obtenerReporte, descargarPdf, descargarExcel } from '../services/reporteService';
import '../styles/Dashboard.css';

const FMT = (fechaStr) => {
    if (!fechaStr) return '—';
    return new Date(fechaStr).toLocaleString('es-CO', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
};

function Reportes() {
    const navigate = useNavigate();
    const { usuario, logout } = useAuth();

    const [parqueaderos, setParqueaderos]   = useState([]);
    const [parqueaderoId, setParqueaderoId] = useState('');
    const [nombreParqueadero, setNombreParqueadero] = useState('');
    const [filas, setFilas]                 = useState([]);
    const [cargando, setCargando]           = useState(false);
    const [cargandoExport, setCargandoExport] = useState('');
    const [error, setError]                 = useState('');

    // Filtros
    const [filtroEstado, setFiltroEstado]   = useState('TODOS');
    const [filtroPlaca, setFiltroPlaca]     = useState('');

    useEffect(() => {
        obtenerParqueaderos().then(setParqueaderos).catch(() => {});
    }, []);

    // Si es ADMIN solo tiene un parqueadero — cargarlo automáticamente
    useEffect(() => {
        if (parqueaderos.length === 1) {
            setParqueaderoId(parqueaderos[0].id);
            setNombreParqueadero(parqueaderos[0].nombre);
        }
    }, [parqueaderos]);

    useEffect(() => {
        if (!parqueaderoId) return;
        setCargando(true);
        setError('');
        obtenerReporte(parqueaderoId)
            .then(setFilas)
            .catch(err => setError(err))
            .finally(() => setCargando(false));
    }, [parqueaderoId]);

    const handleLogout = () => { logout(); navigate('/login'); };

    const handleDescargarPdf = async () => {
        setCargandoExport('pdf');
        try { await descargarPdf(parqueaderoId, nombreParqueadero); }
        catch (err) { setError(err); }
        finally { setCargandoExport(''); }
    };

    const handleDescargarExcel = async () => {
        setCargandoExport('excel');
        try { await descargarExcel(parqueaderoId, nombreParqueadero); }
        catch (err) { setError(err); }
        finally { setCargandoExport(''); }
    };

    const filasFiltradas = filas.filter(f => {
        const estadoOk = filtroEstado === 'TODOS'
            || (filtroEstado === 'COMPLETADO' && (f.estado === 'FINALIZADO' || f.estado === 'PAGADO'))
            || f.estado === filtroEstado;
        const placaOk  = f.placa.toLowerCase().includes(filtroPlaca.toLowerCase());
        return estadoOk && placaOk;
    });

    const totalRecaudado = filasFiltradas.reduce((acc, f) => acc + (f.montoPagado || 0), 0);

    return (
        <div className="dashboard-layout">
            <nav className="navbar">
                <div className="navbar-brand">
                    <h1>ProParking <span className="admin-tag">Admin</span></h1>
                </div>
                <div className="navbar-user">
                    <span>Hola, <strong>{usuario?.nombre}</strong></span>
                    <button onClick={() => navigate('/admin-dashboard')} className="btn-logout"
                        style={{ backgroundColor: '#e2e8f0', color: '#475569', marginRight: 8 }}>
                        ← Volver
                    </button>
                    <button onClick={handleLogout} className="btn-logout">Cerrar Sesión</button>
                </div>
            </nav>

            <main className="dashboard-content">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <h2>Reportes de Ingresos</h2>

                    {/* Botones de descarga */}
                    {filas.length > 0 && (
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button onClick={handleDescargarPdf} disabled={!!cargandoExport}
                                style={{
                                    padding: '9px 18px', borderRadius: 8, border: 'none',
                                    backgroundColor: '#dc2626', color: 'white',
                                    fontWeight: 600, cursor: 'pointer', fontSize: 14,
                                    opacity: cargandoExport ? 0.6 : 1
                                }}>
                                {cargandoExport === 'pdf' ? 'Generando...' : '📄 Descargar PDF'}
                            </button>
                            <button onClick={handleDescargarExcel} disabled={!!cargandoExport}
                                style={{
                                    padding: '9px 18px', borderRadius: 8, border: 'none',
                                    backgroundColor: '#16a34a', color: 'white',
                                    fontWeight: 600, cursor: 'pointer', fontSize: 14,
                                    opacity: cargandoExport ? 0.6 : 1
                                }}>
                                {cargandoExport === 'excel' ? 'Generando...' : '📊 Descargar Excel'}
                            </button>
                        </div>
                    )}
                </div>

                {error && <div className="error-msg" style={{ marginBottom: 16 }}>{error}</div>}

                {/* Selector de parqueadero — solo si hay más de uno (SUPER_ADMIN) */}
                {parqueaderos.length > 1 && (
                    <div className="widget-card" style={{ marginBottom: 20 }}>
                        <label style={{ fontWeight: 600, marginRight: 12 }}>Parqueadero:</label>
                        <select value={parqueaderoId} style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid #cbd5e1' }}
                            onChange={e => {
                                const p = parqueaderos.find(p => p.id === e.target.value);
                                setParqueaderoId(e.target.value);
                                setNombreParqueadero(p?.nombre || '');
                            }}>
                            <option value="">-- Selecciona un parqueadero --</option>
                            {parqueaderos.map(p => (
                                <option key={p.id} value={p.id}>{p.nombre}</option>
                            ))}
                        </select>
                    </div>
                )}

                {parqueaderoId && (
                    <>
                        {/* Resumen */}
                        <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
                            {[
                                { label: 'Total registros', valor: filasFiltradas.length, color: '#1e40af' },
                                { label: 'Activos', valor: filasFiltradas.filter(f => f.estado === 'ACTIVO').length, color: '#d97706' },
                                { label: 'Completados', valor: filasFiltradas.filter(f => f.estado === 'FINALIZADO' || f.estado === 'PAGADO').length, color: '#16a34a' },
                                { label: 'Total recaudado', valor: `$${totalRecaudado.toFixed(0)}`, color: '#7c3aed' },
                            ].map(({ label, valor, color }) => (
                                <div key={label} className="widget-card" style={{ flex: 1, textAlign: 'center', padding: '16px 12px' }}>
                                    <div style={{ fontSize: 24, fontWeight: 700, color }}>{valor}</div>
                                    <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>{label}</div>
                                </div>
                            ))}
                        </div>

                        {/* Filtros */}
                        <div className="widget-card" style={{ marginBottom: 20, display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                            <div>
                                <label style={{ fontWeight: 600, marginRight: 8, fontSize: 14 }}>Estado:</label>
                                <select value={filtroEstado} style={{ padding: '7px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
                                    onChange={e => setFiltroEstado(e.target.value)}>
                                    <option value="TODOS">Todos</option>
                                    <option value="ACTIVO">Activos</option>
                                    <option value="COMPLETADO">Finalizados/Pagados</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ fontWeight: 600, marginRight: 8, fontSize: 14 }}>Placa:</label>
                                <input type="text" placeholder="Buscar placa..." value={filtroPlaca}
                                    onChange={e => setFiltroPlaca(e.target.value)}
                                    style={{ padding: '7px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }} />
                            </div>
                            {(filtroEstado !== 'TODOS' || filtroPlaca) && (
                                <button onClick={() => { setFiltroEstado('TODOS'); setFiltroPlaca(''); }}
                                    style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid #cbd5e1', backgroundColor: 'white', cursor: 'pointer', fontSize: 14 }}>
                                    ✕ Limpiar filtros
                                </button>
                            )}
                        </div>

                        {/* Tabla */}
                        <div className="widget-card">
                            {cargando ? (
                                <p>Cargando registros...</p>
                            ) : filasFiltradas.length === 0 ? (
                                <p>No hay registros con los filtros seleccionados.</p>
                            ) : (
                                <div style={{ overflowX: 'auto' }}>
                                    <table className="admin-table">
                                        <thead>
                                            <tr>
                                                <th>Placa</th>
                                                <th>Tipo</th>
                                                <th>Cliente</th>
                                                <th>Entrada</th>
                                                <th>Salida</th>
                                                <th>Monto</th>
                                                <th>Estado</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filasFiltradas.map(f => (
                                                <tr key={f.ingresoId}>
                                                    <td><strong>{f.placa}</strong></td>
                                                    <td>{f.tipo}</td>
                                                    <td>{f.clienteEmail}</td>
                                                    <td>{FMT(f.fechaEntrada)}</td>
                                                    <td>{f.fechaSalida ? FMT(f.fechaSalida) : <em style={{ color: '#d97706' }}>En curso</em>}</td>
                                                    <td><strong>${f.montoPagado?.toFixed(0) || 0}</strong></td>
                                                    <td>
                                                        <span style={{
                                                            padding: '3px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600,
                                                            backgroundColor: f.estado === 'ACTIVO' ? '#fef3c7' : '#dcfce7',
                                                            color: f.estado === 'ACTIVO' ? '#d97706' : '#16a34a',
                                                        }}>
                                                            {f.estado}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}

export default Reportes;