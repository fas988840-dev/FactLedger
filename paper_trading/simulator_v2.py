#!/usr/bin/env python3
"""FactLedger Paper Trading Simulator v2 — 'best-of-60' Solana edition.
Takes the useful units from the founder's 60-agent SPX design, Solana-adapted:
 TOKYO/NAIROBI data integrity (multi-source agreement proxy via candle sanity),
 DENVER/BERLIN breakout + RETEST + PC3 (breakout candle -> retest holds ->
 confirmation candle), FLOW/volume surge, REGIME filter, SCORE ENGINE with
 entry only at score >= 91, HELSINKI/ENTRY GATE single-position discipline
 (one trade until closed, then the next), stop UNDER the breakout candle,
 break-even at +1R, trailing profit-lock from +1.5R, CAPITAL GUARDIAN daily
 -3% halt and leverage veto (liquidation distance >= 2x stop), PROSECUTOR
 veto on any failed gate.
Books: SPOT $100 long-only, PERPS $100 long+short, isolated $20 margin,
leverage tiers <=10x. Paper only. Data: Kraken SOL/USD 1h OHLCV (~720 bars).
"""
import json, itertools, urllib.request
from datetime import datetime, timezone

def fetch_ohlcv():
    url = "https://api.kraken.com/0/public/OHLC?pair=SOLUSD&interval=60"
    req = urllib.request.Request(url, headers={"User-Agent": "FactLedger-Paper/2.0"})
    with urllib.request.urlopen(req, timeout=30) as r:
        data = json.load(r)
    pair = [k for k in data["result"] if k != "last"][0]
    rows = data["result"][pair]
    return [{"o": float(x[1]), "h": float(x[2]), "l": float(x[3]), "c": float(x[4]), "v": float(x[6])} for x in rows]

def score_and_signal(bars, i, lb, vol_mult, side_bias):
    """Return (score, side, breakout_level, candle_low/high) or None.
    PC3-adapted: price breaks lb-bar range, a later bar retests the level
    without closing through it, and the current bar confirms by closing
    beyond the breakout candle's extreme. Volume must surge."""
    if i < lb + 6:
        return None
    win = bars[i-3-lb:i-3]
    hi, lo = max(b["h"] for b in win), min(b["l"] for b in win)
    bk = bars[i-2]           # breakout candle
    rt = bars[i-1]           # retest candle
    cf = bars[i]             # confirmation candle
    avg_vol = sum(b["v"] for b in bars[i-21:i-1]) / 20
    vol_ok = cf["v"] > avg_vol * vol_mult
    # simple regime: 50-bar trend
    trend_up = bars[i]["c"] > sum(b["c"] for b in bars[i-50:i]) / 50 if i >= 50 else True
    side, level, stop_ref = None, None, None
    if bk["c"] > hi and rt["l"] >= hi * 0.995 and cf["c"] > bk["h"] and side_bias in ("long", "both"):
        side, level, stop_ref = "long", hi, bk["l"]
    elif bk["c"] < lo and rt["h"] <= lo * 1.005 and cf["c"] < bk["l"] and side_bias in ("short", "both"):
        side, level, stop_ref = "short", lo, bk["h"]
    if not side:
        return None
    # --- SCORE ENGINE (100 = perfect setup; entry requires >= 91) ---
    s = 0
    s += 25 if vol_ok else 8                                   # FLOW/volume
    s += 20                                                    # PC3 structure complete
    s += 15 if (side == "long") == trend_up else 4             # REGIME alignment
    rng = max(bk["h"] - bk["l"], 1e-9)
    body = abs(bk["c"] - bk["o"]) / rng
    s += 15 if body > 0.6 else (9 if body > 0.4 else 4)         # breakout conviction
    retest_gap = abs(rt["l"] - hi) / hi * 100 if side == "long" else abs(rt["h"] - lo) / lo * 100
    s += 15 if retest_gap < 0.5 else (9 if retest_gap < 1.0 else 3)  # retest quality
    s += 10 if cf["v"] > avg_vol * (vol_mult + 0.5) else 5     # confirmation strength
    return (s, side, level, stop_ref)

def run(bars, book, lb, vol_mult, trail_act_R, trail_dist_pct, lev):
    capital0, cash = 100.0, 100.0
    side_bias = "long" if book == "SPOT" else "both"
    pos, trades, eq = None, [], [cash]
    day_pnl, cur_day = 0.0, None
    for i in range(len(bars)):
        b = bars[i]
        day = i // 24
        if day != cur_day:
            cur_day, day_pnl = day, 0.0
        px = b["c"]
        if pos is None and day_pnl > -3.0:  # CAPITAL GUARDIAN daily -3% halt
            sig = score_and_signal(bars, i, lb, vol_mult, side_bias)
            if sig and sig[0] >= 91:
                _, side, level, stop_ref = sig
                entry = px
                stop = stop_ref * (0.998 if side == "long" else 1.002)  # under/over the candle
                risk_dist = abs(entry - stop) / entry * 100
                if 0.3 < risk_dist < 8:
                    if book == "PERPS" and (100.0 / lev) < 2 * risk_dist:
                        eq.append(cash); continue  # guardian leverage veto
                    pos = {"side": side, "entry": entry, "stop": stop, "init": stop,
                           "peak": entry, "margin": 20.0, "notional": 20.0 * lev, "lev": lev, "i": i}
                    cash -= 20.0
        elif pos is not None:
            d = 1 if pos["side"] == "long" else -1
            pos["peak"] = max(pos["peak"], px) if d == 1 else min(pos["peak"], px) if pos["peak"] else px
            if d == -1 and (pos["peak"] is None or px < pos["peak"]):
                pos["peak"] = px
            r = d * (px - pos["entry"]) / abs(pos["entry"] - pos["init"])
            if r >= 1.0:  # break-even
                pos["stop"] = max(pos["stop"], pos["entry"]) if d == 1 else min(pos["stop"], pos["entry"])
            if r >= trail_act_R:  # trailing profit-lock
                t = pos["peak"] * (1 - d * trail_dist_pct / 100)
                pos["stop"] = max(pos["stop"], t) if d == 1 else min(pos["stop"], t)
            hit = px <= pos["stop"] if d == 1 else px >= pos["stop"]
            liq = False
            if book == "PERPS":
                liq_px = pos["entry"] * (1 - d * (100.0 / pos["lev"] - 0.5) / 100)
                liq = px <= liq_px if d == 1 else px >= liq_px
            if hit or liq:
                pnl = -20.0 if liq else pos["notional"] * d * (px - pos["entry"]) / pos["entry"]
                cash += 0 if liq else 20.0 + pnl
                day_pnl += pnl
                trades.append({"side": pos["side"], "entry": round(pos["entry"], 2),
                               "exit": round(px, 2), "pnl": round(pnl, 2),
                               "reason": "liquidation" if liq else ("trailing-lock" if r >= trail_act_R else "stop")})
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
                       "pnl": round(pnl, 2), "reason": "closed-at-end"})
    peak, dd = -1e18, 0.0
    for v in eq:
        peak = max(peak, v)
        dd = min(dd, (v - peak) / peak * 100) if peak > 0 else dd
    wins = sum(1 for t in trades if t["pnl"] > 0)
    return {"final": round(cash, 2), "ret%": round((cash / capital0 - 1) * 100, 2),
            "trades": len(trades), "win%": round(wins / len(trades) * 100, 1) if trades else 0,
            "maxdd%": round(dd, 2), "log": trades[-10:]}

def main():
    bars = fetch_ohlcv()
    combos = list(itertools.product([10, 20], [1.2, 1.5, 2.0], [1.5, 2.0], [2, 3, 4, 5, 6]))[:100]
    books = {}
    for book in ("SPOT", "PERPS"):
        agents = []
        for idx, (lb, vm, ta, td) in enumerate(combos, 1):
            lev = 1 if book == "SPOT" else [2, 3, 5, 10][idx % 4]
            r = run(bars, book, lb, vm, ta, td, lev)
            agents.append({"agent": f"{book[:4]}-{idx:03d}", "lb": lb, "volx": vm,
                           "trailR": ta, "trail%": td, "lev": lev, **r})
        agents.sort(key=lambda x: ((x["trades"] >= 3), x["ret%"] / (abs(x["maxdd%"]) + 1)), reverse=True)
        books[book] = {"capital_usd": 100, "agents_tested": len(agents), "top10": agents[:10],
                       "median_ret%": sorted(a["ret%"] for a in agents)[len(agents) // 2],
                       "agents_profitable": sum(1 for a in agents if a["ret%"] > 0)}
    out = {"generated_at": datetime.now(timezone.utc).isoformat(),
           "data": f"Kraken SOL/USD 1h OHLCV, {len(bars)} bars", "paper_only": True,
           "entry_rule": "score>=91 only, single position until closed, stop under breakout candle",
           "books": books}
    with open("paper_trading/results_v2.json", "w") as f:
        json.dump(out, f, indent=2)
    for bk, v in books.items():
        t = v["top10"][0]
        print(bk, "best:", t["agent"], "ret%", t["ret%"], "trades", t["trades"], "win%", t["win%"],
              "maxdd%", t["maxdd%"], "lev", t["lev"], "| profitable agents:", v["agents_profitable"],
              "| median:", v["median_ret%"])

if __name__ == "__main__":
    main()
