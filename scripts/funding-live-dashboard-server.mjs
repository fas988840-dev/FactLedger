#!/usr/bin/env node
/**
 * FactLedger — Live Donations, Sponsors, Grants, 100-Agent MCP Fleet & Daily Monitor Server
 * Binds to 0.0.0.0:3000 for live preview.
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runFullDailyCheck, CANONICAL_WALLET, REPO_SLUG } from './daily-funding-email-monitor.mjs';
import { run100AgentsSuite } from './mcp-100-agents-runner.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');
const PORT = Number(process.env.PORT || 3000);

let cachedStatus = null;
let lastCheckPromise = null;
let cachedAgentsReport = null;
let lastAgentsPromise = null;

async function getLatestStatus(force = false) {
  if (!force && cachedStatus) return cachedStatus;
  if (lastCheckPromise) return lastCheckPromise;
  lastCheckPromise = runFullDailyCheck()
    .then((res) => {
      cachedStatus = res;
      return res;
    })
    .finally(() => {
      lastCheckPromise = null;
    });
  return lastCheckPromise;
}

async function getLatestAgentsReport(force = false) {
  if (!force && cachedAgentsReport) return cachedAgentsReport;
  if (lastAgentsPromise) return lastAgentsPromise;
  lastAgentsPromise = run100AgentsSuite()
    .then((rep) => {
      cachedAgentsReport = rep;
      return rep;
    })
    .finally(() => {
      lastAgentsPromise = null;
    });
  return lastAgentsPromise;
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);

  if (url.pathname === '/api/live-check') {
    try {
      const force = url.searchParams.get('force') === '1';
      const [status, agentsReport] = await Promise.all([
        getLatestStatus(force),
        getLatestAgentsReport(force),
      ]);
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ ...status, mcp100Agents: agentsReport }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: String(err.message || err) }));
    }
    return;
  }

  if (url.pathname === '/api/run-100-agents') {
    try {
      const rep = await getLatestAgentsReport(true);
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(rep));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: String(err.message || err) }));
    }
    return;
  }

  // Serve GRANTS/send-grants.html at / and /send-grants.html
  const htmlPath = path.join(ROOT_DIR, 'GRANTS', 'send-grants.html');
  const html = fs.readFileSync(htmlPath, 'utf8');
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(html);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`FactLedger Live Funding, 100-Agent MCP & Daily Monitor Server listening on http://0.0.0.0:${PORT}`);
  Promise.all([getLatestStatus(true), getLatestAgentsReport(true)]).catch(() => {});
});
