# ProParking — Frontend

Web application for parking lot management built with React. It provides 
role-based dashboards so each type of user interacts only with what they need.

## What it does

- Public landing page with an interactive parking lot map
- Account registration, email verification and password recovery
- Client dashboard: manage vehicles and track entry history
- Admin dashboard: manage vehicle entries/exits, process payments and view daily metrics
- Super Admin dashboard: manage parking lots, assign administrators and view system logs
- Report generation with PDF and Excel export

## Technologies

- React 19
- Vite 7
- React Router DOM 7
- Axios
- Lucide React
- CSS per module
- Vercel Analytics

## Installation & Local Setup
```bash
git clone <repository-url>
cd proparking-web
npm install
npm run dev
```

App available at `http://localhost:5173`

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
