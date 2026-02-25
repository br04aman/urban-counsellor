# Urban Counsellor

- Static HTML + Express server with Supabase Auth (email/password and Google)
- Backend persists user emails to Postgres; signup does not block on DB write
- Environment is loaded via `.env` and exposed to the frontend at `/config.js`

## Quick Start

- Install: `npm install`
- Configure `.env` (see Environment)
- Build: `npm run build`
- Start: `npm run start`
- Open:
  - Sign In: http://127.0.0.1:8000/signin
  - Sign Up: http://127.0.0.1:8000/signup

## Environment

- SUPABASE_URL
- SUPABASE_ANON_KEY
- APP_SECRET
- DATABASE_URL or discrete Postgres vars:
  - PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE
- DATABASE_SSL=true for managed Postgres (Supabase), false for local

Values are read in [server.ts](file:///c:/Users/br04a/Downloads/urban4u/server.ts#L20-L39) and exposed to the browser at `/config.js` [server.ts](file:///c:/Users/br04a/Downloads/urban4u/server.ts#L70-L77).

## Routes

- GET `/` serves [index.html](file:///c:/Users/br04a/Downloads/urban4u/index.html)
- GET `/signin` serves [signin.html](file:///c:/Users/br04a/Downloads/urban4u/signin.html)
- GET `/signup` serves [signup.html](file:///c:/Users/br04a/Downloads/urban4u/signup.html)
- GET `/styles.css` serves [styles.css](file:///c:/Users/br04a/Downloads/urban4u/styles.css)
- GET `/assets/*` static assets
- GET `/config.js` exposes Supabase config to frontend [server.ts](file:///c:/Users/br04a/Downloads/urban4u/server.ts#L70-L77)
- POST `/api/signup` persists email to DB [server.ts](file:///c:/Users/br04a/Downloads/urban4u/server.ts#L88-L103)
- GET `/api/db-health` returns DB connectivity status [server.ts](file:///c:/Users/br04a/Downloads/urban4u/server.ts#L79-L86)
- GET `/api/me` and POST `/api/logout` session helpers [server.ts](file:///c:/Users/br04a/Downloads/urban4u/server.ts#L107-L117)

## Auth Flow

- Frontend uses Supabase:
  - Email/password: [signin.html](file:///c:/Users/br04a/Downloads/urban4u/signin.html#L100-L111)
  - Google OAuth: [signin.html](file:///c:/Users/br04a/Downloads/urban4u/signin.html#L117-L128)
  - Sign Up page: [signup.html](file:///c:/Users/br04a/Downloads/urban4u/signup.html#L90-L101)
- Backend email persistence is attempted but non-blocking:
  - Signup tries `/api/signup`; failure is ignored to avoid blocking account creation

## Database

- Postgres pool initialization and users table creation:
  - [server.ts](file:///c:/Users/br04a/Downloads/urban4u/server.ts#L26-L33)
- Uses `DATABASE_URL` or PGHOST/PGPORT/PGUSER/PGPASSWORD/PGDATABASE
- Health check: `/api/db-health` for connectivity

## Notes

- Unique ID login was removed; only Supabase-based sign in remains
- If DB is unreachable, the server still starts; `/api/db-health` will return 503
- For Google OAuth, set Supabase auth redirect to your origin (e.g., `http://127.0.0.1:8000/`)

## Run In Multiple Terminals

- Terminal 1 (Backend):
  - `npm run build`
  - `npm run start`
- Terminal 2 (API Gateway):
  - Use your gateway (e.g., Nginx or a Node proxy) to forward:
    - `/api/*` → `http://127.0.0.1:8000/`
    - `/config.js` → `http://127.0.0.1:8000/config.js`
- Terminal 3 (Frontend):
  - Serve static files from project root on a different port (e.g., 3000)
  - Example: `npx http-server . -p 3000` (or any static server)
  - Ensure the gateway proxies `/api/*` and `/config.js` so the frontend’s relative paths work

This setup keeps the browser pointed at the frontend origin, while API and config requests are transparently routed to the backend via the gateway.

## Troubleshooting: Email Rate Limit

- Supabase may throttle verification emails and signups per IP/domain.
- Avoid rapid retries; wait 60 seconds before attempting again.
- Use “Sign Up with Google” to bypass email sending limits.
- Configure custom SMTP in Supabase (Auth → Email → SMTP) to increase limits.
- If you don’t require email confirmations, disable “Confirm email” in Supabase Auth.
- The signup button is disabled during requests to prevent repeated calls.
