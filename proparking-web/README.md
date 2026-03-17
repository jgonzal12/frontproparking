# ProParking — Frontend

Web application for parking lot management with role-based views: Client, Administrator and Super Administrator.

## Technologies

- React 19 + Vite 7
- React Router DOM 7
- Axios
- Lucide React
- CSS per module

## Installation & Local Setup
```bash
git clone <repository-url>
cd proparking-web
npm install
cp .env.example .env  # configure variable
npm run dev
```

App available at `http://localhost:5173`

## Environment Variables
```env
VITE_API_URL=http://localhost:8080/api/v1
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |

## Deployment

Ready to deploy on **Vercel**. Set `VITE_API_URL` pointing to the production backend.
