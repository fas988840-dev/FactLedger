#!/usr/bin/env node
/**
 * FactLedger — Daily Donations, Sponsors, Grants & Live Health Monitor
 *
 * Checks:
 *  1. Solana Mainnet Receiving Wallet (5V58c59zzfx5AjfjDwiQSMqK1FoQ8xvtbRnCjmHocmQG) SOL & USDC balances
 *  2. Legacy Solana Wallet (EWEY53t7rXLTQ964EhuAXHAMV9WoEkxn4h4fYB1ZRFNM) SOL & USDC balances
 *  3. Live Production API (https://factledger-api.onrender.com/api/v1/health) & Demo (https://factledger-demo.onrender.com/demo.html)
 *  4. GitHub Repository Sponsorship status, GitHub Sponsors profile approval status, RECEIVING_WALLET.md on main, PRs #105/#106, Issues #74/#59
 *  5. Active Grant & Support Email Threads tracker (fas988840@gmail.com)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');

export const CANONICAL_WALLET = '5V58c59zzfx5AjfjDwiQSMqK1FoQ8xvtbRnCjmHocmQG';
export const LEGACY_WALLET = 'EWEY53t7rXLTQ964EhuAXHAMV9WoEkxn4h4fYB1ZRFNM';
export const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
export const SOLANA_RPC = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
export const API_HEALTH_URL = 'https://factledger-api.onrender.com/api/v1/health';
export const DEMO_URL = 'https://factledger-demo.onrender.com/demo.html';
export const REPO_SLUG = 'fas988840-dev/FactLedger';

export const EMAIL_GRANT_THREADS = [
  {
    id: 'superteam',
    name: 'Superteam Microgrant (MENA / Global)',
    amount: '4,000 USDC',
    recipient: 'hello@superteam.fun, support@superteam.fun',
    messageId: '1a146ff855227340',
    threadId: '1a146ff855227340',
    updatedAt: '2026-10-17',
    status: 'delivered_awaiting_reply',
    statusAr: 'تم الإرسال والتسليم بنجاح — بانتظار رد لجنة المنح',
    walletUsed: CANONICAL_WALLET,
  },
  {
    id: 'kraken',
    name: 'Kraken Open-Source Developer Grant',
    amount: '$10,000 USD',
    recipient: 'grants@kraken.com',
    messageId: '1a134b43d9062606',
    threadId: '1a073ac5e31a169c',
    updatedAt: '2026-10-13',
    status: 'delivered_awaiting_reply',
    statusAr: 'تم تحديث الروابط والمحفظة الجديدة — بانتظار المراجعة',
    walletUsed: CANONICAL_WALLET,
  },
  {
    id: 'safepal',
    name: 'SafePal × Solana Builder Growth Grant',
    amount: 'Builder Grant + Growth Support',
    recipient: 'eco@safepal.com',
    messageId: '1a146f56dcebd225',
    threadId: '1a0742806e78667a',
    updatedAt: '2026-10-17',
    status: 'delivered_awaiting_reply',
    statusAr: 'تم تصحيح رابط GitHub وإرسال المحفظة الجديدة — بانتظار المراجعة',
    walletUsed: CANONICAL_WALLET,
  },
  {
    id: 'getblock',
    name: 'GetBlock Solana Startup Program',
    amount: '$10,000 RPC Credits (90 Days)',
    recipient: 'marketing@getblock.io',
    messageId: '1a146f5858712b3d',
    threadId: '1a074284d0dddea5',
    updatedAt: '2026-10-17',
    status: 'delivered_awaiting_reply',
    statusAr: 'تم تصحيح رابط GitHub وإرسال المحفظة الجديدة — بانتظار المراجعة',
    walletUsed: CANONICAL_WALLET,
  },
  {
    id: 'chaingpt',
    name: 'ChainGPT Web3 AI Grant (Builder Tier)',
    amount: '$10,000 API Credits & Grant',
    recipient: 'labs@chaingpt.org',
    messageId: '1a14701e7741027a',
    threadId: '1a08a87b96492b8b',
    updatedAt: '2026-10-17',
    status: 'delivered_awaiting_reply',
    statusAr: 'تم إرسال الروابط الحية وطلب Builder Tier والمحفظة الجديدة',
    walletUsed: CANONICAL_WALLET,
  },
  {
    id: 'colosseum',
    name: 'Colosseum Eternal Sprint & Hackathons',
    amount: '$250,000 Pre-seed / Non-dilutive Prizes',
    recipient: 'support@colosseum.com',
    messageId: '1a14701cbab68962',
    threadId: '1a073852700ec0f7',
    updatedAt: '2026-10-17',
    status: 'delivered_awaiting_reply',
    statusAr: 'تم تصحيح رابط المستودع وإرسال العرض التفاعلي والمحفظة الجديدة',
    walletUsed: CANONICAL_WALLET,
  },
  {
    id: 'pyth_douro',
    name: 'Pyth Network / Douro Labs Developer Grant',
    amount: '$5,000 Milestone Grant + Pyth Core Access',
    recipient: 'data@dourolabs.xyz',
    messageId: '1a1472f01401a1a5',
    threadId: '1a1472f01401a1a5',
    updatedAt: '2026-10-17',
    status: 'delivered_awaiting_reply',
    statusAr: 'تم إرسال طلب تفعيل Pyth Core وخطة منحة 5,000$ والمحفظة الجديدة',
    walletUsed: CANONICAL_WALLET,
  },
  {
    id: 'helius_launchpad',
    name: 'Helius Startup Launchpad & Infrastructure',
    amount: '8 أشهر مجاناً (Business RPC) + ربط بالمستثمرين',
    recipient: 'support@helius.xyz (Kehinde Yusuf)',
    messageId: '1a1472f1f82bb35e',
    threadId: '1a08e83c125471fb',
    updatedAt: '2026-10-17',
    status: 'delivered_awaiting_reply',
    statusAr: 'تم إرسال الروابط المحدثة و100 وكيل MCP والمحفظة الجديدة لفريق Helius',
    walletUsed: CANONICAL_WALLET,
  },
  {
    id: 'solo_grants',
    name: 'Solo Grants ($1,000 Founder Microgrant)',
    amount: '$1,000 USD',
    recipient: 'kai@solofounders.com, ari@solofounders.com',
    messageId: '1a1472f8b19a606d',
    threadId: '1a0e476663f723dc',
    updatedAt: '2026-10-17',
    status: 'delivered_awaiting_reply',
    statusAr: 'تم إرسال تحديث أكتوبر بإطلاق الخادم الحي والديمو و224 اختباراً والمحفظة الجديدة',
    walletUsed: CANONICAL_WALLET,
  },
  {
    id: 'tap_payments',
    name: 'Tap Payments (بوابة الدفع والاشتراكات)',
    amount: 'تفعيل تحصيل البطاقات البنكية',
    recipient: 'w.atyeh@tap.company, onboarding@tap.company',
    messageId: '1a1470238561d737',
    threadId: '1a0f62dbf142cf62',
    updatedAt: '2026-10-17',
    status: 'delivered_awaiting_kyc_docs',
    statusAr: 'تم إرسال بيانات النشاط والروابط الحية — بانتظار رد وليد عطية/إرفاق وثيقة العمل الحر والآيبان',
    walletUsed: 'IBAN / SAR',
  },
  {
    id: 'acquire',
    name: 'Acquire.com Startup Listing ($35k–$75k Cash Valuation)',
    amount: '$35,000–$75,000 Cash Buyout Listing',
    recipient: 'support@acquire.com (Harold Ecoy & Andrew Titus)',
    messageId: '1a14769a4518776d',
    threadId: '1a132547af2d4f4b',
    updatedAt: '2026-10-17',
    status: 'delivered_pnl_and_screenshot_attached',
    statusAr: 'تم الرد على هارولد إيكوي وإرفاق جدول الأرباح والخسائر والتقييم المالي (FactLedger_PnL_and_Valuation_2026.xlsx) وتحديد سعر البيع الكاش ($35k–$75k)',
    walletUsed: 'Escrow.com / Wire / USDC',
  },
];

async function fetchJson(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), options.timeoutMs || 20000);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    const text = await res.text();
    let data = null;
    try { data = JSON.parse(text); } catch { /* plain text */ }
    return { ok: res.ok, status: res.status, data, text, headers: Object.fromEntries(res.headers.entries()) };
  } catch (err) {
    return { ok: false, status: 0, error: String(err.message || err), data: null, text: '' };
  } finally {
    clearTimeout(timer);
  }
}

export async function checkSolanaWallet(address) {
  const balRes = await fetchJson(SOLANA_RPC, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'getBalance', params: [address] }),
  });
  const lamports = balRes.data?.result?.value ?? 0;
  const sol = lamports / 1e9;

  const usdcRes = await fetchJson(SOLANA_RPC, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 2,
      method: 'getTokenAccountsByOwner',
      params: [address, { mint: USDC_MINT }, { encoding: 'jsonParsed' }],
    }),
  });
  const accounts = usdcRes.data?.result?.value ?? [];
  let usdc = 0;
  for (const acc of accounts) {
    const amt = acc?.account?.data?.parsed?.info?.tokenAmount?.uiAmount ?? 0;
    usdc += Number(amt);
  }

  const sigRes = await fetchJson(SOLANA_RPC, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 3,
      method: 'getSignaturesForAddress',
      params: [address, { limit: 5 }],
    }),
  });
  const recentSignatures = (sigRes.data?.result ?? []).map((s) => ({
    signature: s.signature,
    slot: s.slot,
    blockTime: s.blockTime ? new Date(s.blockTime * 1000).toISOString() : null,
    err: s.err,
  }));

  return { address, lamports, sol, usdc, recentSignatures };
}

export async function runFullDailyCheck() {
  const checkedAt = new Date().toISOString();

  const [
    canonicalWallet,
    legacyWallet,
    apiHealth,
    demoRes,
    repoHtml,
    sponsorsPage,
    remoteWalletFile,
    pr105,
    pr106,
    openIssues,
  ] = await Promise.all([
    checkSolanaWallet(CANONICAL_WALLET),
    checkSolanaWallet(LEGACY_WALLET),
    fetchJson(API_HEALTH_URL, { timeoutMs: 25000 }),
    fetchJson(DEMO_URL, { timeoutMs: 20000 }),
    fetchJson(`https://github.com/${REPO_SLUG}`, { timeoutMs: 15000 }),
    fetchJson('https://github.com/sponsors/fas988840-dev', { redirect: 'manual', timeoutMs: 15000 }),
    fetchJson(`https://raw.githubusercontent.com/${REPO_SLUG}/main/FUNDING/RECEIVING_WALLET.md`, { timeoutMs: 15000 }),
    fetchJson(`https://api.github.com/repos/${REPO_SLUG}/pulls/105`, { timeoutMs: 15000 }),
    fetchJson(`https://api.github.com/repos/${REPO_SLUG}/pulls/106`, { timeoutMs: 15000 }),
    fetchJson(`https://api.github.com/repos/${REPO_SLUG}/issues?state=open&per_page=30`, { timeoutMs: 15000 }),
  ]);

  const repoSponsorsEnabled = repoHtml.text.includes('"sponsors":true') || repoHtml.text.includes('Sponsor this project');
  const sponsorsProfileApproved = sponsorsPage.status === 200;
  const remoteWalletHasNewAddress = remoteWalletFile.text.includes(CANONICAL_WALLET);
  const pureIssues = Array.isArray(openIssues.data)
    ? openIssues.data.filter((item) => !item.pull_request).map((i) => ({ number: i.number, title: i.title, url: i.html_url }))
    : [];

  const summary = {
    checkedAt,
    checkedAtRiyadh: new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Riyadh' }) + ' Asia/Riyadh',
    wallets: {
      canonical: canonicalWallet,
      legacy: legacyWallet,
    },
    services: {
      api: {
        url: API_HEALTH_URL,
        httpStatus: apiHealth.status,
        ok: apiHealth.ok && apiHealth.data?.status === 'ok',
        priceProvider: apiHealth.data?.dependencies?.priceProvider ?? 'unknown',
        body: apiHealth.data,
      },
      demo: {
        url: DEMO_URL,
        httpStatus: demoRes.status,
        ok: demoRes.ok,
      },
    },
    github: {
      repoUrl: `https://github.com/${REPO_SLUG}`,
      repoSponsorsEnabled,
      sponsorsProfileApproved,
      sponsorsProfileHttpStatus: sponsorsPage.status,
      remoteWalletUpdatedOnMain: remoteWalletHasNewAddress,
      remoteWalletAddressOnMain: remoteWalletHasNewAddress ? CANONICAL_WALLET : LEGACY_WALLET,
      pr105: {
        number: 105,
        state: pr105.data?.state ?? 'unknown',
        merged: Boolean(pr105.data?.merged),
        mergeableState: pr105.data?.mergeable_state ?? 'unknown',
      },
      pr106: {
        number: 106,
        state: pr106.data?.state ?? 'unknown',
        merged: Boolean(pr106.data?.merged),
        mergeableState: pr106.data?.mergeable_state ?? 'unknown',
      },
      openIssues: pureIssues,
    },
    emailGrants: EMAIL_GRANT_THREADS,
  };

  const outJsonPath = path.join(ROOT_DIR, 'GRANTS', 'DAILY_MONITOR_STATUS.json');
  fs.writeFileSync(outJsonPath, JSON.stringify(summary, null, 2), 'utf8');
  return summary;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runFullDailyCheck().then((res) => {
    console.log('=== FactLedger Daily Funding, Sponsors & Health Report ===');
    console.log('Time (Riyadh):', res.checkedAtRiyadh);
    console.log(`Canonical Wallet (${res.wallets.canonical.address}): ${res.wallets.canonical.sol} SOL | ${res.wallets.canonical.usdc} USDC`);
    console.log(`Legacy Wallet (${res.wallets.legacy.address}): ${res.wallets.legacy.sol} SOL | ${res.wallets.legacy.usdc} USDC`);
    console.log(`API Health (${res.services.api.url}): HTTP ${res.services.api.httpStatus} (priceProvider: ${res.services.api.priceProvider})`);
    console.log(`Demo Health (${res.services.demo.url}): HTTP ${res.services.demo.httpStatus}`);
    console.log(`GitHub Repo Sponsors Enabled: ${res.github.repoSponsorsEnabled}`);
    console.log(`GitHub Sponsors Profile Public (200 OK): ${res.github.sponsorsProfileApproved} (HTTP ${res.github.sponsorsProfileHttpStatus})`);
    console.log(`GitHub main RECEIVING_WALLET.md address: ${res.github.remoteWalletAddressOnMain}`);
    console.log(`PR #105: ${res.github.pr105.state} (merged=${res.github.pr105.merged}) | PR #106: ${res.github.pr106.state} (merged=${res.github.pr106.merged})`);
  }).catch((err) => {
    console.error('Daily check failed:', err);
    process.exit(1);
  });
}
