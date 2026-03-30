/**
 * Coal Mine Gas Monitor — Backend Server
 * NodeMCU sends:  GET /update?gas=450&buzzer=0
 * Frontend polls: GET /data  → { gas, buzzer, timestamp, status }
 *
 * Run:  node server.js
 * Default port: 3000  (change PORT env var to override)
 */

const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// ── State ─────────────────────────────────────────────────────────────────────
let state = {
  gas: null,
  buzzer: false,
  timestamp: null,
  history: [],          // last 120 readings
};

const GAS_THRESHOLD = 200;   // same as frontend threshold
const MAX_HISTORY   = 120;

// ── CORS — allow the NodeMCU and local HTML file to reach this server ─────────
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

// ── Static files (serve web/index.html) ───────────────────────────────────────
app.use(express.static(path.join(__dirname, "web")));

// ── /update  — called by NodeMCU ──────────────────────────────────────────────
// Example: GET /update?gas=450&buzzer=1
app.get("/update", (req, res) => {
  const from   = req.ip || req.connection.remoteAddress;
  const gasRaw = req.query.gas;
  const buzzRaw = req.query.buzzer;

  // Log every incoming request regardless of validity
  console.log(`[INCOMING] /update from ${from}  gas="${gasRaw}"  buzzer="${buzzRaw}"`);

  const gas    = parseInt(gasRaw, 10);
  const buzzer = buzzRaw === "1" || buzzRaw === "true";

  if (isNaN(gas)) {
    console.log(`[ERROR] Bad request — gas value "${gasRaw}" is not a number`);
    return res.status(400).send("Bad request: ?gas=<number> is required");
  }

  const now = new Date().toISOString();

  state.gas       = gas;
  state.buzzer    = buzzer;
  state.timestamp = now;

  state.history.push({ gas, buzzer, ts: now });
  if (state.history.length > MAX_HISTORY) state.history.shift();

  console.log(`[${now}] Gas: ${gas}  Buzzer: ${buzzer}  Status: ${gas >= GAS_THRESHOLD ? "ALERT ⚠️" : "safe ✅"}  From: ${from}`);
  res.send("OK");
});

// ── /data  — polled by the frontend ───────────────────────────────────────────
app.get("/data", (req, res) => {
  res.json({
    gas:       state.gas,
    buzzer:    state.buzzer,
    timestamp: state.timestamp,
    status:    state.gas !== null
                 ? (state.gas >= GAS_THRESHOLD ? "DANGER" : "SAFE")
                 : "WAITING",
    history:   state.history,
    threshold: GAS_THRESHOLD,
  });
});

// ── /health — simple ping ─────────────────────────────────────────────────────
app.get("/health", (_req, res) => res.json({ ok: true, uptime: process.uptime() }));

// ── Start ─────────────────────────────────────────────────────────────────────
const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`\n🟢  Coal Mine Gas Monitor Server`);
  console.log(`    Listening on  http://0.0.0.0:${PORT}`);
  console.log(`    Dashboard →   http://localhost:${PORT}`);
  console.log(`    NodeMCU URL → http://<YOUR_PC_IP>:${PORT}/update?gas=VALUE\n`);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`\n❌  Port ${PORT} is already in use!`);
    console.error(`    Run this to fix it:`);
    console.error(`    Get-NetTCPConnection -LocalPort ${PORT} -State Listen | % { taskkill /PID $_.OwningProcess /F }\n`);
    process.exit(1);
  }
});
