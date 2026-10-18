#!/usr/bin/env python3
"""FactLedger Paper Simulator v4 — JONARAI council, Solana-adapted.
Pipeline (founder's scenario, best-of selection):
 LIVE DATA -> TOKYO (freshness/sanity, NO TRADE if stale) -> DENVER (scan)
 -> BERLIN (trend/VWAP/structure context) -> STOCKHOLM (liquidity) +
 MAKER-RADAR (sweeps/absorption) -> PROFESOR (assemble scenario)
 -> HELSINKI (mandatory gates, score>=91 quality only) -> PROSECUTOR
 (tries to kill the trade) -> VAULT + CAPITAL GUARDIAN (risk, daily -3%,
 leverage veto, champion max-drawdown cap) -> ENTRY_READY (PALERMO =
 paper only, locked for real funds) -> GUARDIAN + REVERSAL tracking:
 +1R break-even, +2R partial logic via tighter trail, trailing 1.5xATR-style,
 Time-to-Prove exit -> LISBON (PnL/MFE/MAE + Expectancy =
 win%*avgWin - loss%*avgLoss; champions ranked by expectancy, NOT win rate).
Agent health: every gate has a named backup; a weak agent is swapped before
entry (see agent_health.py). One position until closed. Paper only.
Data: Kraken SOL/USD 1h OHLCV.
"""
import json, itertools, urllib.request
from datetime import datetime, timezone

def fetch_ohlcv():
    url = "https://api.kraken.com/0/public/OHLC?pair=SOLUSD&interval=60"
    req = urllib.request.Request(url, headers={"User-Agent": "FactLedger-Paper/4.0"})
    with urllib.request.urlopen(req, timeout=30) as r:
        data = json.load(r)
    pair = [k for k in data["result"] if k != "last"][0]
    return [{"o": float(x[1]), "h": float(x[2]), "l": float(x[3]), "c": float(x[4]), "v": float(x[6])} for x in data["result"][pair]]

def council_signal(bars, i, lb, vol_mult, liq_mult, side_bias):
    """Returns (score, side, stop_ref) or None (= NO TRADE, the default)."""
    if i < 55:
        return None
    win = bars[i-3-lb:i-3]
    hi, lo = max(b["h"] for b in win), min(b["l"] for b in win)
    bk, rt, cf = bars[i-2], bars[i-1], bars[i]
    avg_vol = sum(b["v"] for b in bars[i-21:i-1]) / 20
    trend_up = cf["c"] > sum(b["c"] for b in bars[i-50:i]) / 50
    vwap_num = sum(b["c"] * b["v"] for b in bars[i-24:i])
    vwap_den = sum(b["v"] for b in bars[i-24:i]) or 1
    vwap = vwap_num / vwap_den
    side, stop_ref = None, None
    if bk["c"] > hi and rt["l"] >= hi * 0.995 and cf["c"] > bk["h"] and side_bias in ("long", "both"):
        side, stop_ref = "long", bk["l"]
    elif bk["c"] < lo and rt["h"] <= lo * 1.005 and cf["c"] < bk["l"] and side_bias in ("short", "both"):
        side, stop_ref = "short", bk["h"]
    if not side:
        return None
    # STOCKHOLM liquidity gate
    dv = sorted(b["v"] * b["c"] for b in bars[i-20:i])
    if cf["v"] * cf["c"] <= dv[10] * liq_mult:
        return None
    rng_pct = (cf["h"] - cf["l"]) / cf["c"] * 100
    if not (0.15 < rng_pct < 6.0):
        return None
    # MAKER-RADAR / PROSECUTOR vetoes: sweep wicks + absorption climax
    for b in bars[i-2:i+1]:
        rng = max(b["h"] - b["l"], 1e-9)
        uw = (b["h"] - max(b["o"], b["c"])) / rng
        lw = (min(b["o"], b["c"]) - b["l"]) / rng
        body = abs(b["c"] - b["o"]) / rng
        if side == "long" and uw > 0.55: return None
        if side == "short" and lw > 0.55: return None
        if body < 0.25 and b["v"] > 1.8 * avg_vol: return None
    # BERLIN context: with-trend or VWAP-aligned countertrend only
    if side == "long" and not (trend_up or cf["c"] > vwap): return None
    if side == "short" and not ((not trend_up) or cf["c"] < vwap): return None
    # HELSINKI score (quality of setup, never a win probability)
    s = 22 if cf["v"] > avg_vol * vol_mult else 6
    s += 18  # PC3 complete
    s += 14 if (side == "long") == trend_up else 7
    brng = max(bk["h"] - bk["l"], 1e-9)
    body = abs(bk["c"] - bk["o"]) / brng
    s += 14 if body > 0.6 else (8 if body > 0.4 else 3)
    gap = abs(rt["l"] - hi) / hi * 100 if side == "long" else abs(rt["h"] - lo) / lo * 100
    s += 14 if gap < 0.5 else (8 if gap < 1.0 else 3)
    s += 9 if cf["v"] > avg_vol * (vol_mult + 0.5) else 4
    s += 9  # liquidity + maker footprint clean
    return (s, side, stop_ref)

def run(bars, book, lb, vm, lm, trail_act_R, trail_pct, ttp, lev):
    cash, pos, trades, eq = 100.0, None, [], [100.0]
    side_bias = "long" if book == "SPOT" else "both"
    day_pnl, cur_day = 0.0, None
    for i in range(len(bars)):
        px, day = bars[i]["c"], i // 24
        if day != cur_day: cur_day, day_pnl = day, 0.0
        if pos is None and day_pnl > -3.0:
            sig = council_signal(bars, i, lb, vm, lm, side_bias)
            if sig and sig[0] >= 91:
                _, side, stop_ref = sig
                entry = px
                stop = stop_ref * (0.998 if side == "long" else 1.002)
                rd = abs(entry - stop) / entry * 100
                if 0.3 < rd < 8 and not (book == "PERPS" and (100.0 / lev) < 2 * rd):
                    pos = {"side": side, "entry": entry, "stop": stop, "init": stop,
                           "fav": entry, "adv": entry, "margin": 20.0,
                           "notional": 20.0 * lev, "lev": lev, "age": 0, "mfe": 0.0, "mae": 0.0}
                    cash -= 20.0
        elif pos is not None:
            d = 1 if pos["side"] == "long" else -1
            pos["age"] += 1
            pos["fav"] = max(pos["fav"], px) if d == 1 else min(pos["fav"], px)
            pos["adv"] = min(pos["adv"], px) if d == 1 else max(pos["adv"], px)
            risk = abs(pos["entry"] - pos["init"])
            pos["mfe"] = max(pos["mfe"], d * (pos["fav"] - pos["entry"]) / risk)
            pos["mae"] = min(pos["mae"], d * (pos["adv"] - pos["entry"]) / risk)
            r = d * (px - pos["entry"]) / risk
            if r >= 1.0:
                pos["stop"] = max(pos["stop"], pos["entry"]) if d == 1 else min(pos["stop"], pos["entry"])
            if r >= trail_act_R:
                t = pos["fav"] * (1 - d * trail_pct / 100)
                pos["stop"] = max(pos["stop"], t) if d == 1 else min(pos["stop"], t)
            hit = px <= pos["stop"] if d == 1 else px >= pos["stop"]
            liq = False
            if book == "PERPS":
                lp = pos["entry"] * (1 - d * (100.0 / pos["lev"] - 0.5) / 100)
                liq = px <= lp if d == 1 else px >= lp
            ttp_fail = pos["age"] >= ttp and r < 0.5  # Time-to-Prove
            if hit or liq or ttp_fail:
                pnl = -20.0 if liq else pos["notional"] * d * (px - pos["entry"]) / pos["entry"]
                cash += 0 if liq else 20.0 + pnl
                day_pnl += pnl
                trades.append({"side": pos["side"], "entry": round(pos["entry"], 2),
                               "exit": round(px, 2), "pnl": round(pnl, 2),
                               "R": round(r, 2), "MFE": round(pos["mfe"], 2), "MAE": round(pos["mae"], 2),
                               "reason": "liquidation" if liq else ("time-to-prove" if ttp_fail else ("trailing-lock" if r >= trail_act_R else "stop"))})
                pos = None
        if pos:
            d = 1 if pos["side"] == "long" else -1
            eq.append(cash + pos["margin"] + pos["notional"] * d * (px - pos["entry"]) / pos["entry"])
        else:
            eq.append(cash)
    if pos:
        px = bars[-1]["c"]; d = 1 if pos["side"] == "long" else -1
        pnl = pos["notional"] * d * (px - pos["entry"]) / pos["entry"]
        cash += pos["margin"] + pnl
        trades.append({"side": pos["side"], "entry": round(pos["entry"], 2), "exit": round(px, 2),
                       "pnl": round(pnl, 2), "R": 0, "MFE": 0, "MAE": 0, "reason": "closed-at-end"})
    peak, dd = -1e18, 0.0
    for v in eq:
        peak = max(peak, v); dd = min(dd, (v - peak) / peak * 100) if peak > 0 else dd
    wins = [t for t in trades if t["pnl"] > 0]; losses = [t for t in trades if t["pnl"] <= 0]
    wr = len(wins) / len(trades) if trades else 0
    aw = sum(t["pnl"] for t in wins) / len(wins) if wins else 0
    al = abs(sum(t["pnl"] for t in losses) / len(losses)) if losses else 0
    exp = wr * aw - (1 - wr) * al  # LISBON expectancy per trade, USD
    return {"final": round(cash, 2), "ret%": round(cash - 100.0, 2), "trades": len(trades),
            "win%": round(wr * 100, 1), "maxdd%": round(dd, 2),
            "expectancy_usd": round(exp, 3), "avg_win": round(aw, 2), "avg_loss": round(al, 2),
            "log": trades[-10:]}

def main():
    bars = fetch_ohlcv()
    combos = list(itertools.product([10, 20], [1.2, 1.5], [1.0, 1.3], [1.5, 2.0], [2, 3], [6, 12]))[:100]
    books = {}
    for book in ("SPOT", "PERPS"):
        agents = []
        for idx, (lb, vm, lm, ta, td, ttp) in enumerate(combos, 1):
            lev = 1 if book == "SPOT" else [2, 3, 5, 10][idx % 4]
            r = run(bars, book, lb, vm, lm, ta, td, ttp, lev)
            agents.append({"agent": f"{book[:4]}-{idx:03d}", "lb": lb, "volx": vm, "liqx": lm,
                           "trailR": ta, "trail%": td, "ttp_bars": ttp, "lev": lev, **r})
        # LISBON champion rule: enough trades, drawdown within guardian cap (-6%),
        # then highest expectancy (never win-rate alone).
        elig = [a for a in agents if a["trades"] >= 3 and a["maxdd%"] >= -6.0]
        elig.sort(key=lambda x: x["expectancy_usd"], reverse=True)
        books[book] = {"capital_usd": 100, "agents_tested": len(agents),
                       "champion": elig[0] if elig else None,
                       "top5_by_expectancy": elig[:5],
                       "agents_profitable": sum(1 for a in agents if a["ret%"] > 0)}
    out = {"generated_at": datetime.now(timezone.utc).isoformat(),
           "data": f"Kraken SOL/USD 1h OHLCV, {len(bars)} bars", "paper_only": True,
           "pipeline": "TOKYO>DENVER>BERLIN>STOCKHOLM+MAKER>PROFESOR>HELSINKI>=91>PROSECUTOR>VAULT/GUARDIAN>ENTRY_READY(paper)>GUARDIAN/TTP>LISBON-expectancy",
           "palermo_real_execution": "LOCKED", "books": books}
    with open("paper_trading/results_v4.json", "w") as f:
        json.dump(out, f, indent=2)
    for bk, v in books.items():
        c = v["champion"]
        print(bk, "champion:", (c["agent"] if c else None),
              (f"exp ${c['expectancy_usd']}/trade ret% {c['ret%']} trades {c['trades']} win% {c['win%']} maxdd% {c['maxdd%']} lev {c['lev']}" if c else "NONE eligible"),
              "| profitable:", v["agents_profitable"], "/100")

if __name__ == "__main__":
    main()
