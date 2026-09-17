/**
 * Lightweight proxy middleware for SNS Agent Workbench calls.
 *
 * Routes:
 *   GET  /api/agent/health   → ping the workbench and report status
 *   POST /api/agent/execute  → forward { type, agentId, payload } to the workbench
 *   POST /api/agent/chat     → shorthand for type='chat'
 *
 * Secrets are read from process.env — never exposed in the browser bundle.
 * Handles: timeout (AbortController), 429 rate-limit, 404 inactive agent,
 *          network errors, and malformed JSON.
 *
 * Works as both a Vite dev-server middleware plugin and inside server.js.
 */

const BASE_URL = (process.env.VITE_SNS_API_URL || 'https://api.agents.snsihub.ai').replace(/\/$/, '');
const DEFAULT_AGENT_ID = process.env.VITE_SNS_AGENT_ID || '44a7adcb-5c25-4ef8-af59-5f0d2ab1b05f';
const API_KEY = process.env.SNS_API_KEY || '';
const TIMEOUT_MS = parseInt(process.env.SNS_TIMEOUT_MS || '20000', 10);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => { raw += chunk.toString(); });
    req.on('end', () => {
      try { resolve(raw ? JSON.parse(raw) : {}); }
      catch (e) { reject(new Error('Invalid JSON body')); }
    });
    req.on('error', reject);
  });
}

function sendJson(res, status, body) {
  res.setHeader('Content-Type', 'application/json');
  res.writeHead(status);
  res.end(JSON.stringify(body));
}

/** Build the SNS Workbench target URL given a request type. */
function buildTargetUrl(type, agentId) {
  switch (type) {
    case 'chat':
      return `${BASE_URL}/public/chat/${agentId}/messages`;
    case 'form':
      return `${BASE_URL}/form/${agentId}`;
    case 'workflow':
    default:
      return `${BASE_URL}/workflows/${agentId}/execute`;
  }
}

/** Build request headers, including auth if an API key is configured. */
function buildHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  if (API_KEY) {
    headers['Authorization'] = `Bearer ${API_KEY}`;
    headers['x-public-chat-key'] = API_KEY;
  }
  return headers;
}

// ---------------------------------------------------------------------------
// Core proxy dispatch
// ---------------------------------------------------------------------------

async function dispatchToAgent(type, agentId, payload) {
  const url = buildTargetUrl(type, agentId);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    let data;
    try { data = await response.json(); } catch { data = {}; }

    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After') || '60';
      return [429, {
        success: false,
        error: `Rate limited by SNS Agent Workbench. Retry after ${retryAfter}s.`,
        isFallbackAvailable: true,
      }];
    }

    if (!response.ok) {
      return [response.status, {
        success: false,
        error: data?.error || data?.message || `Agent returned HTTP ${response.status}.`,
        isFallbackAvailable: true,
        status: response.status,
      }];
    }

    return [200, { success: true, data }];
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      return [504, { success: false, error: 'Request timed out after ' + Math.round(TIMEOUT_MS / 1000) + 's.', isFallbackAvailable: true }];
    }
    return [502, { success: false, error: err.message || 'Network error contacting agent.', isFallbackAvailable: true }];
  }
}

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------

/**
 * Express-style middleware — returns true if the request was handled, false otherwise.
 * Compatible with both Vite's configureServer() and a bare http.createServer() callback.
 */
export async function agentProxyMiddleware(req, res, next) {
  const url = req.url || '';

  // Passthrough
  if (!url.startsWith('/api/agent')) {
    if (typeof next === 'function') next();
    return false;
  }

  // Health & backend info check
  if (req.method === 'GET' && (url === '/api/agent' || url === '/api/agent/' || url.startsWith('/api/agent/health'))) {
    sendJson(res, 200, {
      status: 'ok',
      message: 'GrantPilot Backend API is active and connected to frontend.',
      agentId: DEFAULT_AGENT_ID,
      endpoint: BASE_URL,
    });
    return true;
  }

  // POST execute / chat
  if (req.method === 'POST' && (url.startsWith('/api/agent/execute') || url.startsWith('/api/agent/chat'))) {
    let body;
    try {
      body = await readJsonBody(req);
    } catch (e) {
      sendJson(res, 400, { success: false, error: 'Invalid JSON request body.' });
      return true;
    }

    const type = body.type || (url.includes('/chat') ? 'chat' : 'workflow');
    const agentId = body.agentId || DEFAULT_AGENT_ID;
    const payload = body.payload || body;

    const [status, result] = await dispatchToAgent(type, agentId, payload);
    sendJson(res, status, result);
    return true;
  }

  // OPTIONS (CORS preflight from the browser)
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.writeHead(204);
    res.end();
    return true;
  }

  sendJson(res, 405, { success: false, error: 'Method not allowed.' });
  return true;
}
