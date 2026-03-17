# ProParking — Frontend

Aplicación web para la gestión de parqueaderos con vistas diferenciadas según el rol del usuario: Cliente, Administrador y Super Administrador.

## Tecnologías

- React 19 + Vite 7
- React Router DOM 7
- Axios
- Lucide React
- CSS por módulo

## Instalación y ejecución local
```bash
git clone <url-repositorio>
cd proparking-web
npm install
cp .env.example .env  # configurar variable
npm run dev
```

La app queda disponible en `http://localhost:5173`

## Variables de entorno
```env
VITE_API_URL=http://localhost:8080/api/v1
```

## Scripts

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run preview` | Previsualiza el build |

## Despliegue

Preparado para **Vercel**. Configurar `VITE_API_URL` apuntando al backend en producción.