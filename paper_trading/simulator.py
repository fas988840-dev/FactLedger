#!/usr/bin/env python3
"""FactLedger Paper Trading Simulator v1
Two paper books of $100 each, competing parameterised agents on SOL:
- SPOT book: capital split into max 5 concurrent positions ($20 each slot),
  initial stop, break-even move at +1R, trailing profit-lock from +1.5R.
- PERPS book (stage-2 design): isolated margin $20/trade, leverage tiers
  capped at 10x, liquidation distance must exceed 2x stop distance or the
  Capital Guardian rejects the agent's trades.
No real funds, no signing, no orders. Public price data only.
"""
import json, math, urllib.request, itertools, sys
from datetime import datetime, timezone

def fetch_prices(days=30):
    try:
        url = f"https://api.coingecko.com/api/v3/coins/Solana/market_chart?vs_currency=usd&days={days}"
        req = urllib.request.Request(url, headers={"User-Agent": "FactLedger-Paper/1.0"})
        with urllib.request.urlopen(req, timeout=30) as r:
            data = json.load(r)
        return [p[1] for p in data["prices"]]
    except Exception:
        url = "https://api.kraken.com/0/public/OHLC?pair=SOLUSD&interval=60"
        req = urllib.request.Request(url, headers={"User-Agent": "FactLedger-Paper/1.0"})
        with urllib.request.urlopen(req, timeout=30) as r:
            data = json.load(r)
        pair = [k for k in data["result"] if k != "last"][0]
        return [float(c[4]) for c in data["result"][pair]]

def run_agent(prices, book, stop_pct, trail_act_R, trail_dist_pct, lev=1, lookback=20):
    """Single-asset sequential simulation with the approved stop ladder."""
    capital0 = 100.0
    cash = capital0
    equity_curve = [cash]
    trades = []
    slot = 20.0  # $20 per position (5 slots of the $100 book)
    pos = None
    for i in range(lookback, len(prices)):
        px = prices[i]
        if pos is None:
            # Entry signal: breakout above prior 20-bar high (BERLIN/BREAKOUT)
            if px > max(prices[i-lookback:i]) and cash >= slot:
                margin = slot
                notional = margin * lev
                if book == "PERPS":
                    liq_dist = 100.0 / lev  # approx % adverse move to liquidation
                    if liq_dist < 2 * stop_pct:  # Capital Guardian veto
                        equity_curve.append(cash); continue
                entry = px
                stop = entry * (1 - stop_pct/100)
                pos = {"entry": entry, "stop": stop, "init_stop": stop,
                       "margin": margin, "notional": notional, "lev": lev,
                       "peak": entry, "be": False, "trail": False, "i": i}
                cash -= margin
        else:
            pos["peak"] = max(pos["peak"], px)
            r_mult = (px - pos["entry"]) / (pos["entry"] - pos["init_stop"]) if pos["entry"] != pos["init_stop"] else 0
            if not pos["be"] and r_mult >= 1.0:
                pos["stop"] = pos["entry"]; pos["be"] = True
            if not pos["trail"] and r_mult >= trail_act_R:
                pos["trail"] = True
            if pos["trail"]:
                pos["stop"] = max(pos["stop"], pos["peak"] * (1 - trail_dist_pct/100))
            exit_reason = None
            if px <= pos["stop"]:
                exit_reason = "trailing-stop" if pos["trail"] else ("break-even" if pos["be"] else "initial-stop")
            if book == "PERPS":
                liq_px = pos["entry"] * (1 - (100.0/pos["lev"] - 0.5)/100)
                if px <= liq_px:
                    exit_reason = "liquidation"
            if exit_reason:
                pnl_pct = (px - pos["entry"]) / pos["entry"] * 100 * pos["lev"]
                if exit_reason == "liquidation":
                    pnl = -pos["margin"]
                else:
                    pnl = pos["notional"] * (px - pos["entry"]) / pos["entry"]
                cash += pos["margin"] + pnl if exit_reason != "liquidation" else 0
                trades.append({"entry": round(pos["entry"],3), "exit": round(px,3),
                               "pnl_usd": round(pnl,2), "reason": exit_reason,
                               "bars": i - pos["i"]})
                pos = None
        equity_curve.append(cash + (pos["margin"] + pos["notional"]*(px-pos["entry"])/pos["entry"] if pos else 0))
    if pos:
        px = prices[-1]
        pnl = pos["notional"] * (px - pos["entry"]) / pos["entry"]
        cash += pos["margin"] + pnl
        trades.append({"entry": round(pos["entry"],3), "exit": round(px,3), "pnl_usd": round(pnl,2), "reason": "open-at-end", "bars": len(prices)-pos["i"]})
    peak, maxdd = -1e9, 0.0
    for v in equity_curve:
        peak = max(peak, v); maxdd = min(maxdd, (v-peak)/peak*100) if peak > 0 else maxdd
    wins = sum(1 for t in trades if t["pnl_usd"] > 0)
    return {"final_equity": round(cash,2), "return_pct": round((cash/capital0-1)*100,2),
            "trades": len(trades), "wins": wins,
            "win_rate": round(wins/len(trades)*100,1) if trades else 0,
            "max_drawdown_pct": round(maxdd,2), "log": trades[-12:]}

def main():
    prices = fetch_prices(30)
    spot_agents, perps_agents = [], []
    # 100 competing variants per book: stop x trail activation x trail distance
    combos = list(itertools.product([3,4,5,6,8], [1.5,2.0], [2,3,4,5,6], [10,20]))[:100]
    for idx, (s, a, d, lb) in enumerate(combos, 1):
        r = run_agent(prices, "SPOT", s, a, d, 1, lb)
        spot_agents.append({"agent": f"SPOT-{idx:03d}", "stop%": s, "trail_act_R": a, "trail_dist%": d, **r})
    for idx, (s, a, d, lb) in enumerate(combos, 1):
        lev = [2,3,5,10][idx % 4]
        r = run_agent(prices, "PERPS", s, a, d, lev, lb)
        perps_agents.append({"agent": f"PERP-{idx:03d}", "lev": lev, "stop%": s, "trail_act_R": a, "trail_dist%": d, **r})
    for lst in (spot_agents, perps_agents):
        lst.sort(key=lambda x: ((x["trades"] >= 3), x["return_pct"] / (abs(x["max_drawdown_pct"]) + 1)), reverse=True)
    out = {"generated_at": datetime.now(timezone.utc).isoformat(),
           "asset": "SOL/USD hourly, last 30 days (CoinGecko)", "paper_only": True,
           "books": {"SPOT_100USD": {"slots": 5, "slot_usd": 20, "top10": spot_agents[:10],
                                     "median_return_pct": sorted(a["return_pct"] for a in spot_agents)[len(spot_agents)//2]},
                     "PERPS_100USD_stage2": {"max_leverage": 10, "margin_per_trade_usd": 20,
                                             "top10": perps_agents[:10],
                                             "median_return_pct": sorted(a["return_pct"] for a in perps_agents)[len(perps_agents)//2]}}}
    with open("paper_trading/results_latest.json", "w") as f:
        json.dump(out, f, indent=2)
    print(json.dumps({"spot_top3": spot_agents[:3], "perps_top3": perps_agents[:3],
                      "spot_median": out["books"]["SPOT_100USD"]["median_return_pct"],
                      "perps_median": out["books"]["PERPS_100USD_stage2"]["median_return_pct"],
                      "points": len(prices)}, indent=2))

if __name__ == "__main__":
    main()
