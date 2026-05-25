import { useState, useCallback, useRef } from 'react';

/**
 * useButtonLock — hook para prevenir doble click en acciones asíncronas.
 *
 * Uso:
 *   const [loading, ejecutar] = useButtonLock();
 *
 *   <button onClick={() => ejecutar(miAccionAsincrona)} disabled={loading}>
 *     {loading ? 'Procesando...' : 'Confirmar'}
 *   </button>
 *
 * Garantías:
 * - Bloquea la acción mientras está en curso (loading = true)
 * - Desbloquea automáticamente al terminar (éxito o error)
 * - Si se llama antes de que termine, ignora el segundo intento
 * - El error se propaga para que el componente pueda manejarlo
 */
export function useButtonLock() {
    const [loading, setLoading] = useState(false);
    const inProgress = useRef(false);

    const ejecutar = useCallback(async (accion) => {
        // Si ya hay una acción en progreso, ignorar el intento
        if (inProgress.current) return;

        inProgress.current = true;
        setLoading(true);

        try {
            await accion();
        } finally {
            inProgress.current = false;
            setLoading(false);
        }
    }, []);

    return [loading, ejecutar];
}

/**
 * useManyButtonLocks — para manejar múltiples botones independientes.
 *
 * Uso:
 *   const { isLocked, ejecutar } = useManyButtonLocks();
 *
 *   // En una lista de items:
 *   <button
 *     onClick={() => ejecutar(`salida-${id}`, () => procesarSalida(id))}
 *     disabled={isLocked(`salida-${id}`)}
 *   >
 *     Registrar Salida
 *   </button>
 */
export function useManyButtonLocks() {
    const [locks, setLocks] = useState({});
    const inProgress = useRef({});

    const isLocked = useCallback((key) => !!locks[key], [locks]);

    const ejecutar = useCallback(async (key, accion) => {
        if (inProgress.current[key]) return;

        inProgress.current[key] = true;
        setLocks(prev => ({ ...prev, [key]: true }));

        try {
            await accion();
        } finally {
            inProgress.current[key] = false;
            setLocks(prev => {
                const next = { ...prev };
                delete next[key];
                return next;
            });
        }
    }, []);

    return { isLocked, ejecutar };
}