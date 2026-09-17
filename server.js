// GrantPilot standalone production server (ESM — matches "type": "module" in package.json)
// Usage: node server.js
// Serves the built dist/ folder and proxies /api/agent/* to SNS Agent Workbench.

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { agentProxyMiddleware } from './src/server/apiProxy.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Load .env into process.env ────────────────────────────────────────────
// Works without the dotenv package; respects existing OS env vars.
try {
  const envFile = fs.readFileSync(path.join(__dirname, '.env'), 'utf8');
  for (const line of envFile.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^['"](.*)['"]$/, '$1');
    if (key && !(key in process.env)) process.env[key] = val;
  }
} catch { /* .env absent — rely on OS env */ }

// ── Config ────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3005;
const SERVE_DIR = path.join(__dirname, 'dist');

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css':  'text/css; charset=UTF-8',
  '.js':   'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.svg':  'image/svg+xml',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.webp': 'image/webp',
  '.ico':  'image/x-icon',
};

// ── Server ────────────────────────────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // SNS Agent Workbench proxy — handles /api/agent/*
  const handled = await agentProxyMiddleware(req, res, () => false).catch((e) => {
    console.error('[proxy]', e.message);
    return false;
  });
  if (handled) return;

  // Static file serving from dist/
  let reqPath = decodeURI((req.url || '/').split('?')[0]);
  if (!path.extname(reqPath)) reqPath = '/index.html'; // SPA fallback

  const filePath = path.join(SERVE_DIR, reqPath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Hard 404 only if index.html is also missing (build not run yet)
      const fallback = path.join(SERVE_DIR, 'index.html');
      fs.stat(fallback, (e2) => {
        if (e2) { res.writeHead(404, { 'Content-Type': 'text/plain' }); res.end('Run `npm run build` first.'); return; }
        res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8' });
        fs.createReadStream(fallback).pipe(res);
      });
      return;
    }
    const contentType = MIME_TYPES[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  const agentBase = process.env.VITE_SNS_API_URL || 'https://api.agents.snsihub.ai';
  console.log(`\n  GrantPilot  →  http://localhost:${PORT}`);
  console.log(`  Agent proxy →  /api/agent/* → ${agentBase}\n`);
});
