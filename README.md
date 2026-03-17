# Urban Counsellor — Online Counseling Platform

Urban Counsellor is a comprehensive digital wellness platform designed to normalize and democratize access to quality mental health support. It provides a seamless interface for individuals to seek professional therapy, counseling, and psychiatric services from the comfort of their homes.

## 🌟 Key Features

- **Mental Health Assessments**: Insightful self-tests to help users understand their wellness needs.
- **Diverse Counseling Services**: Specialized support for relationships, stress, anxiety, LGBTQ+ challenges, workplace management, and more.
- **Expert matching**: Connect with qualified and trained clinical psychologists and mental health experts.
- **Secure Authentication**: Integrated with Supabase for robust email/password and Google OAuth sign-in.
- **Professional Dashboard**: User-friendly interface for managing sessions and resources.
- **Informative Content**: A library of articles from expert therapists on various mental health topics.

## 🛠️ Technology Stack

### Backend
- **Framework**: [Express.js](https://expressjs.com/) (v5.2.1) — High-performance web framework for Node.js.
- **Runtime**: [Node.js](https://nodejs.org/) with [TypeScript](https://www.typescriptlang.org/) (v5.9.3).
- **Database Adapters**:
  - `pg` (v8.18.0) — PostgreSQL client for Node.js, used for database pooling and queries.
  - `sqlite` & `sqlite3` — Used for local data storage and development.
- **Authentication & Security**:
  - `express-session` (v1.19.0) — For server-side session management.
  - `bcrypt` (v6.0.0) — For secure password hashing and comparison.
  - `cors` (v2.8.6) — Middleware for enabling Cross-Origin Resource Sharing.
- **Environment Management**: `dotenv` (v17.3.1) — Loads environment variables from `.env` files.
- **Development Tools**: `ts-node` (v10.9.2) — Runs TypeScript code directly without pre-compilation.

### Frontend
- **Core**: Vanilla HTML5, CSS3, and JavaScript (ES6+).
- **Authentication Client**: [@supabase/supabase-js](https://supabase.com/docs/reference/javascript/introduction) (v2) — Client-side SDK for Supabase Auth and Database interactions.
- **Typography**: Google Fonts (Open Sans, Poppins).
- **Styling**: Modern, responsive UI with custom CSS variables and utility classes.

## 📂 Project Structure

- `server.ts`: Express server handling routing and backend logic.
- `index.html`: The main landing page showcasing services and therapists.
- `assessment.html`: Mental health assessment tool.
- `counsellors.html`: Directory of available mental health professionals.
- `assets/`: Centralized storage for media, logos, and icons.
- `dist/`: Compiled production code from TypeScript.

---

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
