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
const pgUrl = process.env.DATABASE_URL;
const pgHost = process.env.PGHOST;
const pgPort = process.env.PGPORT ? Number(process.env.PGPORT) : undefined;
const pgUser = process.env.PGUSER;
const pgPassword = process.env.PGPASSWORD;
const pgDatabase = process.env.PGDATABASE;
const pool = pgUrl
    ? new pg_1.Pool({
        connectionString: pgUrl,
        ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : undefined,
    })
    : new pg_1.Pool({
        host: pgHost,
        port: pgPort || 5432,
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
        let host = "";
        let port = undefined;
        if (pgUrl) {
            try {
                const u = new URL(pgUrl);
                host = u.hostname;
                port = Number(u.port || "5432");
            }
            catch { }
        }
        else {
            host = String(pgHost || "");
            port = pgPort || 5432;
        }
        res.status(503).json({
            ok: false,
            error: "DB unreachable",
            code: String(err.code || ""),
            message: String(err.message || ""),
            host,
            port,
            ssl,
        });
    }
});
app.get("/api/db-info", (_req, res) => {
    const ssl = process.env.DATABASE_SSL === "true";
    if (pgUrl) {
        try {
            const u = new URL(pgUrl);
            res.json({
                using_url: true,
                host: u.hostname,
                port: Number(u.port || "5432"),
                database: u.pathname.replace("/", ""),
                ssl,
            });
            return;
        }
        catch { }
    }
    res.json({
        using_url: false,
        host: String(pgHost || ""),
        port: pgPort || 5432,
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
    app.listen(8000, "0.0.0.0", () => { });
});
