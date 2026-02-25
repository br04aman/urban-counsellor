import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import session from "express-session";
import path from "path";
import { Pool } from "pg";

declare const process: any;
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(
  session({
    secret: process.env.APP_SECRET || "devsecret",
    resave: false,
    saveUninitialized: false,
  })
);

const ROOT = process.cwd();
// Always use individual PG* vars to avoid URL-decoding issues with special
// characters (e.g. # in password decoded from %23 breaks URL hostname parsing).
const pgHost = process.env.PGHOST;
const pgPort = process.env.PGPORT ? Number(process.env.PGPORT) : 5432;
const pgUser = process.env.PGUSER;
const pgPassword = process.env.PGPASSWORD;
const pgDatabase = process.env.PGDATABASE;
const pool = new Pool({
  host: pgHost,
  port: pgPort,
  user: pgUser,
  password: pgPassword,
  database: pgDatabase,
  ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : undefined,
});

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL
    )
  `);
}

app.get("/", (_req, res) => {
  res.sendFile(path.join(ROOT, "index.html"));
});

app.get("/signin", (_req, res) => {
  res.sendFile(path.join(ROOT, "signin.html"));
});

app.get("/signup", (_req, res) => {
  res.sendFile(path.join(ROOT, "signup.html"));
});

app.get("/onboarding", (_req, res) => {
  res.sendFile(path.join(ROOT, "onboarding.html"));
});

app.get("/therapist-email", (_req, res) => {
  res.sendFile(path.join(ROOT, "therapist-email.html"));
});

app.get("/nutrition", (_req, res) => {
  res.sendFile(path.join(ROOT, "nutrition.html"));
});

app.get("/session-notes", (_req, res) => {
  res.sendFile(path.join(ROOT, "session-notes.html"));
});

app.get("/self-help", (_req, res) => {
  res.sendFile(path.join(ROOT, "self-help.html"));
});

app.get("/assessment", (_req, res) => {
  res.sendFile(path.join(ROOT, "assessment.html"));
});

app.get("/reading", (_req, res) => {
  res.sendFile(path.join(ROOT, "reading.html"));
});

app.get("/our-story", (_req, res) => {
  res.sendFile(path.join(ROOT, "our-story.html"));
});

app.get("/pricing", (_req, res) => {
  res.sendFile(path.join(ROOT, "pricing.html"));
});

app.get("/services", (_req, res) => {
  res.sendFile(path.join(ROOT, "services.html"));
});

app.get("/counsellors", (_req, res) => {
  res.sendFile(path.join(ROOT, "counsellors.html"));
});

app.get("/services/:category", (_req, res) => {
  res.sendFile(path.join(ROOT, "service-category.html"));
});

app.get("/support/:service", (_req, res) => {
  res.sendFile(path.join(ROOT, "service-details.html"));
});


app.get("/dashboard.css", (_req, res) => {
  res.sendFile(path.join(ROOT, "dashboard.css"));
});

app.get("/dashboard.js", (_req, res) => {
  res.setHeader("Content-Type", "application/javascript");
  res.sendFile(path.join(ROOT, "dashboard.js"));
});

app.get("/styles.css", (_req, res) => {
  res.sendFile(path.join(ROOT, "styles.css"));
});

app.use("/assets", express.static(path.join(ROOT, "assets")));


app.get("/config.js", (_req, res) => {
  const url = process.env.SUPABASE_URL || "";
  const key = process.env.SUPABASE_ANON_KEY || "";
  const js = `
    window.SUPABASE_URL = ${JSON.stringify(url)};
    window.SUPABASE_ANON_KEY = ${JSON.stringify(key)};
  `;
  res.setHeader("Content-Type", "application/javascript");
  res.send(js);
});

app.get("/api/db-health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ ok: true });
  } catch (err: any) {
    const ssl = process.env.DATABASE_SSL === "true";
    res.status(503).json({
      ok: false,
      error: "DB unreachable",
      code: String(err.code || ""),
      message: String(err.message || ""),
      host: String(pgHost || ""),
      port: pgPort,
      ssl,
    });
  }
});

app.get("/api/db-info", (_req, res) => {
  const ssl = process.env.DATABASE_SSL === "true";
  res.json({
    host: String(pgHost || ""),
    port: pgPort,
    database: String(pgDatabase || ""),
    ssl,
  });
});

app.post("/api/signup", async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  if (!email) {
    res.status(400).json({ error: "Email required" });
    return;
  }
  try {
    await pool.query("INSERT INTO users (email) VALUES ($1) ON CONFLICT (email) DO NOTHING", [email]);
    res.json({ message: "Account created." });
  } catch (e: any) {
    res.status(500).json({ error: "Signup failed" });
  }
});

// Deprecated: login is handled via Supabase on the client

app.get("/api/me", (req, res) => {
  const uid = (req.session as any).user_id;
  const email = (req.session as any).email;
  if (!uid || !email) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  res.json({ email });
});

app.post("/api/logout", (req, res) => {
  req.session.destroy(() => { });
  res.json({ message: "Signed out" });
});

initDb()
  .catch(() => { })
  .finally(() => {
    const port = process.env.PORT || 8000;
    app.listen(port, "0.0.0.0", () => { });
  });
