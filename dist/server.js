"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const path_1 = __importDefault(require("path"));
const pg_1 = require("pg");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use((0, express_session_1.default)({
    secret: process.env.APP_SECRET || "devsecret",
    resave: false,
    saveUninitialized: false,
}));
const ROOT = process.cwd();
// Always use individual PG* vars to avoid URL-decoding issues with special
// characters (e.g. # in password decoded from %23 breaks URL hostname parsing).
const pgHost = process.env.PGHOST;
const pgPort = process.env.PGPORT ? Number(process.env.PGPORT) : 5432;
const pgUser = process.env.PGUSER;
const pgPassword = process.env.PGPASSWORD;
const pgDatabase = process.env.PGDATABASE;
const pool = new pg_1.Pool({
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
    res.sendFile(path_1.default.join(ROOT, "index.html"));
});
app.get("/signin", (_req, res) => {
    res.sendFile(path_1.default.join(ROOT, "signin.html"));
});
app.get("/signup", (_req, res) => {
    res.sendFile(path_1.default.join(ROOT, "signup.html"));
});
app.get("/onboarding", (_req, res) => {
    res.sendFile(path_1.default.join(ROOT, "onboarding.html"));
});
app.get("/therapist-email", (_req, res) => {
    res.sendFile(path_1.default.join(ROOT, "therapist-email.html"));
});
app.get("/nutrition", (_req, res) => {
    res.sendFile(path_1.default.join(ROOT, "nutrition.html"));
});
app.get("/session-notes", (_req, res) => {
    res.sendFile(path_1.default.join(ROOT, "session-notes.html"));
});
app.get("/self-help", (_req, res) => {
    res.sendFile(path_1.default.join(ROOT, "self-help.html"));
});
app.get("/assessment", (_req, res) => {
    res.sendFile(path_1.default.join(ROOT, "assessment.html"));
});
app.get("/reading", (_req, res) => {
    res.sendFile(path_1.default.join(ROOT, "reading.html"));
});
app.get("/our-story", (_req, res) => {
    res.sendFile(path_1.default.join(ROOT, "our-story.html"));
});
app.get("/pricing", (_req, res) => {
    res.sendFile(path_1.default.join(ROOT, "pricing.html"));
});
app.get("/services", (_req, res) => {
    res.sendFile(path_1.default.join(ROOT, "services.html"));
});
app.get("/counsellors", (_req, res) => {
    res.sendFile(path_1.default.join(ROOT, "counsellors.html"));
});
app.get("/services/:category", (_req, res) => {
    res.sendFile(path_1.default.join(ROOT, "service-category.html"));
});
app.get("/support/:service", (_req, res) => {
    res.sendFile(path_1.default.join(ROOT, "service-details.html"));
});
app.get("/dashboard.css", (_req, res) => {
    res.sendFile(path_1.default.join(ROOT, "dashboard.css"));
});
app.get("/dashboard.js", (_req, res) => {
    res.setHeader("Content-Type", "application/javascript");
    res.sendFile(path_1.default.join(ROOT, "dashboard.js"));
});
app.get("/styles.css", (_req, res) => {
    res.sendFile(path_1.default.join(ROOT, "styles.css"));
});
app.use("/assets", express_1.default.static(path_1.default.join(ROOT, "assets")));
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
    }
    catch (err) {
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
    }
    catch (e) {
        res.status(500).json({ error: "Signup failed" });
    }
});
// Deprecated: login is handled via Supabase on the client
app.get("/api/me", (req, res) => {
    const uid = req.session.user_id;
    const email = req.session.email;
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
