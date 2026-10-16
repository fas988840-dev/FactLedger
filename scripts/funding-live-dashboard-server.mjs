#!/usr/bin/env node
/**
 * FactLedger — Live Donations, Sponsors, Grants & Daily Monitor Server
 * Binds to 0.0.0.0:3000 for live preview.
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runFullDailyCheck, CANONICAL_WALLET, REPO_SLUG } from './daily-funding-email-monitor.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');
const PORT = Number(process.env.PORT || 3000);

let cachedStatus = null;
let lastCheckPromise = null;

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

async function githubApi(endpoint, token, method = 'GET', body = null) {
  const res = await fetch(`https://api.github.com${endpoint}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'User-Agent': 'FactLedger-Funding-Monitor',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data = null;
  try { data = JSON.parse(text); } catch { /* ignore */ }
  return { ok: res.ok, status: res.status, data, text };
}

async function upsertRepoFile(repoSlug, filePath, localFullPath, commitMessage, token) {
  const contentB64 = fs.readFileSync(localFullPath).toString('base64');
  const existing = await githubApi(`/repos/${repoSlug}/contents/${filePath}`, token, 'GET');
  const payload = {
    message: commitMessage,
    content: contentB64,
    branch: 'main',
  };
  if (existing.ok && existing.data?.sha) {
    payload.sha = existing.data.sha;
  }
  return githubApi(`/repos/${repoSlug}/contents/${filePath}`, token, 'PUT', payload);
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
      const status = await getLatestStatus(force);
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(status));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: String(err.message || err) }));
    }
    return;
  }

  if (url.pathname === '/api/github-sync' && req.method === 'POST') {
    let bodyStr = '';
    req.on('data', (chunk) => { bodyStr += chunk; });
    req.on('end', async () => {
      try {
        const { token } = JSON.parse(bodyStr || '{}');
        if (!token || typeof token !== 'string') {
          res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ ok: false, error: 'يرجى إدخال رمز GitHub Token صالح' }));
          return;
        }
        const results = {};
        // 1. Update FUNDING/RECEIVING_WALLET.md
        results.walletFile = await upsertRepoFile(
          REPO_SLUG,
          'FUNDING/RECEIVING_WALLET.md',
          path.join(ROOT_DIR, 'FUNDING', 'RECEIVING_WALLET.md'),
          `chore(funding): set canonical Solana wallet to ${CANONICAL_WALLET}`,
          token.trim()
        );
        // 2. Upload daily monitor script & workflow
        results.monitorScript = await upsertRepoFile(
          REPO_SLUG,
          'scripts/daily-funding-email-monitor.mjs',
          path.join(ROOT_DIR, 'scripts', 'daily-funding-email-monitor.mjs'),
          'feat(monitor): add daily donations, sponsors, grants & health monitor script',
          token.trim()
        );
        results.monitorWorkflow = await upsertRepoFile(
          REPO_SLUG,
          '.github/workflows/daily-funding-monitor.yml',
          path.join(ROOT_DIR, '.github', 'workflows', 'daily-funding-monitor.yml'),
          'ci(monitor): add daily scheduled funding, wallet & health workflow',
          token.trim()
        );
        // 3. Merge PR #105 & #106 if still open
        results.merge105 = await githubApi(`/repos/${REPO_SLUG}/pulls/105/merge`, token.trim(), 'PUT', {
          merge_method: 'squash',
        });
        results.merge106 = await githubApi(`/repos/${REPO_SLUG}/pulls/106/merge`, token.trim(), 'PUT', {
          merge_method: 'squash',
        });
        // 4. Refresh status
        const updatedStatus = await getLatestStatus(true);
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ ok: true, results, status: updatedStatus }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ ok: false, error: String(err.message || err) }));
      }
    });
    return;
  }

  // Serve GRANTS/send-grants.html at / and /send-grants.html
  const htmlPath = path.join(ROOT_DIR, 'GRANTS', 'send-grants.html');
  const html = fs.readFileSync(htmlPath, 'utf8');
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(html);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`FactLedger Live Funding & Daily Monitor Server listening on http://0.0.0.0:${PORT}`);
  // Pre-warm status cache
  getLatestStatus(true).catch(() => {});
});
