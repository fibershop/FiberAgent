// Local dev wrapper for the Vercel-deployed MCP handler.
// Run: node fiber-shop-landing/dev-server.mjs
// Endpoint: http://localhost:3001/api/mcp
//
// Lets us iterate on api/mcp.js without redeploying. The handler is the same
// `export default async function handler(req, res)` Vercel calls; we just feed
// it Express's req/res. CORS, headers, and SSE streaming are handled inside
// the handler itself.

import express from 'express';
import bodyParser from 'body-parser';
import handler from './api/mcp.js';

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(bodyParser.json({ limit: '1mb' }));

app.all('/api/mcp', async (req, res) => {
  const ts = new Date().toISOString();
  console.log(`[${ts}] ${req.method} /api/mcp`);
  try {
    await handler(req, res);
  } catch (err) {
    console.error(`[${ts}] handler threw:`, err);
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    }
  }
});

app.get('/health', (_req, res) => {
  res.json({ ok: true, server: 'mcp-dev', time: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`MCP dev server listening on http://localhost:${PORT}`);
  console.log(`  MCP endpoint: http://localhost:${PORT}/api/mcp`);
  console.log(`  Health:       http://localhost:${PORT}/health`);
});
