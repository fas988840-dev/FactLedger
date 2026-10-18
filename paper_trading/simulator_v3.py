#!/usr/bin/env python3
"""FactLedger Paper Simulator v3 — adds LIQUIDITY ENGINE + MARKET-MAKER radar.
New mandatory gates on top of v2 (score>=91, PC3, single position, stop under
the breakout candle, trailing profit-lock, capital guardian):
- LIQUIDITY ENGINE: bar dollar-volume must exceed its 20-bar median by the
  agent's factor, and the candle range (spread/volatility proxy) must be
  tradeable — too thin or chaotic bars are vetoed (STOCKHOLM/LIQUIDITY).
- MARKET-MAKER MOVEMENT RADAR: detects likely maker games around the level —
  long rejection wicks sweeping the breakout level (stop-hunt), volume climax
  without follow-through, and absorption (huge volume, tiny body). A detected
  sweep against the trade direction is a PROSECUTOR veto; clean maker
  footprints (rising volume on confirmation, no sweep wicks) add score.
Paper only. Kraken SOL/USD 1h OHLCV.
"""
import json, itertools, urllib.request
from datetime import datetime, timezone

def fetch_ohlcv():
    url = "https://api.kraken.com/0/public/OHLC?pair=SOLUSD&interval=60"
    req = urllib.request.Request(url, headers={"User-Agent": "FactLedger-Paper/3.0"})
    with urllib.request.urlopen(req, timeout=30) as r:
        data = json.load(r)
    pair = [k for k in data["result"] if k != "last"][0]
    return [{"o": float(x[1]), "h": float(x[2]), "l": float(x[3]), "c": float(x[4]), "v": float(x[6])} for x in data["result"][pair]]

def liquidity_ok(bars, i, liq_mult):
    dv = [b["v"] * b["c"] for b in bars[i-20:i]]
    med = sorted(dv)[10]
    cur = bars[i]["v"] * bars[i]["c"]
    rng = (bars[i]["h"] - bars[i]["l"]) / bars[i]["c"] * 100
    return cur > med * liq_mult and 0.15 < rng < 6.0  # liquid and not chaotic

def maker_scan(bars, i, side):
    """Return (veto, bonus). Detects sweeps/absorption in last 3 bars."""
    veto, bonus = False, 0
    for b in bars[i-2:i+1]:
        rng = max(b["h"] - b["l"], 1e-9)
        upper_wick = (b["h"] - max(b["o"], b["c"])) / rng
        lower_wick = (min(b["o"], b["c"]) - b["l"]) / rng
        body = abs(b["c"] - b["o"]) / rng
        if side == "long" and upper_wick > 0.55 and b["v"] > 0:
            veto = True   # upside sweep / rejection = maker stop-hunt risk
        if side == "short" and lower_wick > 0.55:
            veto = True
        if body < 0.25 and b["v"] > 1.8 * (sum(x["v"] for x in bars[i-12:i-2]) / 10):
            veto = True   # absorption climax: huge volume, no progress
    cf = bars[i]
    if cf["c"] > cf["o"] and side == "long":
        bonus = 5
    if cf["c"] < cf["o"] and side == "short":
        bonus = 5
    return veto, bonus

def score_and_signal(bars, i, lb, vol_mult, liq_mult, side_bias):
    if i < 55:
        return None
    win = bars[i-3-lb:i-3]
    hi, lo = max(b["h"] for b in win), min(b["l"] for b in win)
    bk, rt, cf = bars[i-2], bars[i-1], bars[i]
    avg_vol = sum(b["v"] for b in bars[i-21:i-1]) / 20
    vol_ok = cf["v"] > avg_vol * vol_mult
    trend_up = bars[i]["c"] > sum(b["c"] for b in bars[i-50:i]) / 50
    side, stop_ref = None, None
    if bk["c"] > hi and rt["l"] >= hi * 0.995 and cf["c"] > bk["h"] and side_bias in ("long", "both"):
        side, stop_ref = "long", bk["l"]
    elif bk["c"] < lo and rt["h"] <= lo * 1.005 and cf["c"] < bk["l"] and side_bias in ("short", "both"):
        side, stop_ref = "short", bk["h"]
    if not side:
        return None
    if not liquidity_ok(bars, i, liq_mult):
        return None  # LIQUIDITY ENGINE veto
    veto, bonus = maker_scan(bars, i, side)
    if veto:
        return None  # MARKET-MAKER / PROSECUTOR veto
    s = 0
    s += 22 if vol_ok else 6
    s += 18
    s += 14 if (side == "long") == trend_up else 4
    rng = max(bk["h"] - bk["l"], 1e-9)
    body = abs(bk["c"] - bk["o"]) / rng
    s += 14 if body > 0.6 else (8 if body > 0.4 else 3)
    gap = abs(rt["l"] - hi) / hi * 100 if side == "long" else abs(rt["h"] - lo) / lo * 100
    s += 14 if gap < 0.5 else (8 if gap < 1.0 else 3)
    s += 9 if cf["v"] > avg_vol * (vol_mult + 0.5) else 4
    s += 9 + bonus  # liquidity + clean maker footprint confirmed
    return (s, side, stop_ref)

def run(bars, book, lb, vol_mult, liq_mult, trail_act_R, trail_dist_pct, lev):
    cash, pos, trades, eq = 100.0, None, [], [100.0]
    side_bias = "long" if book == "SPOT" else "both"
    day_pnl, cur_day = 0.0, None
    for i in range(len(bars)):
        b, px, day = bars[i], bars[i]["c"], i // 24
        if day != cur_day:
            cur_day, day_pnl = day, 0.0
        if pos is None and day_pnl > -3.0:
            sig = score_and_signal(bars, i, lb, vol_mult, liq_mult, side_bias)
            if sig and sig[0] >= 91:
                _, side, stop_ref = sig
                entry = px
                stop = stop_ref * (0.998 if side == "long" else 1.002)
                risk_dist = abs(entry - stop) / entry * 100
                if 0.3 < risk_dist < 8 and not (book == "PERPS" and (100.0 / lev) < 2 * risk_dist):
                    pos = {"side": side, "entry": entry, "stop": stop, "init": stop,
                           "fav": entry, "margin": 20.0, "notional": 20.0 * lev, "lev": lev}
                    cash -= 20.0
        elif pos is not None:
            d = 1 if pos["side"] == "long" else -1
            pos["fav"] = max(pos["fav"], px) if d == 1 else min(pos["fav"], px)
            r = d * (px - pos["entry"]) / abs(pos["entry"] - pos["init"])
            if r >= 1.0:
                pos["stop"] = max(pos["stop"], pos["entry"]) if d == 1 else min(pos["stop"], pos["entry"])
            if r >= trail_act_R:
                t = pos["fav"] * (1 - d * trail_dist_pct / 100)
                pos["stop"] = max(pos["stop"], t) if d == 1 else min(pos["stop"], t)
            hit = px <= pos["stop"] if d == 1 else px >= pos["stop"]
            liq = False
            if book == "PERPS":
                lp = pos["entry"] * (1 - d * (100.0 / pos["lev"] - 0.5) / 100)
                liq = px <= lp if d == 1 else px >= lp
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
        peak = max(peak, v); dd = min(dd, (v - peak) / peak * 100) if peak > 0 else dd
    wins = sum(1 for t in trades if t["pnl"] > 0)
    return {"final": round(cash, 2), "ret%": round(cash - 100.0, 2), "trades": len(trades),
            "win%": round(wins / len(trades) * 100, 1) if trades else 0,
            "maxdd%": round(dd, 2), "log": trades[-10:]}

def main():
    bars = fetch_ohlcv()
    combos = list(itertools.product([10, 20], [1.2, 1.5], [1.0, 1.3], [1.5, 2.0], [2, 3, 4, 5, 6]))[:100]
    books = {}
    for book in ("SPOT", "PERPS"):
        agents = []
        for idx, (lb, vm, lm, ta, td) in enumerate(combos, 1):
            lev = 1 if book == "SPOT" else [2, 3, 5, 10][idx % 4]
            r = run(bars, book, lb, vm, lm, ta, td, lev)
            agents.append({"agent": f"{book[:4]}-{idx:03d}", "lb": lb, "volx": vm, "liqx": lm,
                           "trailR": ta, "trail%": td, "lev": lev, **r})
        agents.sort(key=lambda x: ((x["trades"] >= 3), x["ret%"] / (abs(x["maxdd%"]) + 1)), reverse=True)
        books[book] = {"capital_usd": 100, "agents_tested": len(agents), "top10": agents[:10],
                       "median_ret%": sorted(a["ret%"] for a in agents)[len(agents) // 2],
                       "agents_profitable": sum(1 for a in agents if a["ret%"] > 0)}
    out = {"generated_at": datetime.now(timezone.utc).isoformat(),
           "data": f"Kraken SOL/USD 1h OHLCV, {len(bars)} bars", "paper_only": True,
           "entry_rule": "score>=91 + liquidity gate + market-maker sweep veto, single position, stop under breakout candle",
           "books": books}
    with open("paper_trading/results_v3.json", "w") as f:
        json.dump(out, f, indent=2)
    for bk, v in books.items():
        t = v["top10"][0]
        print(bk, "best:", t["agent"], "ret%", t["ret%"], "trades", t["trades"], "win%", t["win%"],
              "maxdd%", t["maxdd%"], "lev", t["lev"], "liqx", t["liqx"],
              "| profitable:", v["agents_profitable"], "| median:", v["median_ret%"])

if __name__ == "__main__":
    main()
