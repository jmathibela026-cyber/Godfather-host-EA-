// ad-confirm.js — Accumulation/Distribution confirmation filter (server side)
// candles: [{open,high,low,close,volume}, ...] oldest -> newest (use closed candles only)
// For forex/CFDs, "volume" is tick volume from MT4/MT5.

function adSeries(candles) {
  let total = 0;
  return candles.map(c => {
    const range = c.high - c.low;
    const clv = range === 0 ? 0 : ((c.close - c.low) - (c.high - c.close)) / range;
    total += clv * (c.volume || 0);
    return total;
  });
}

const sma = (arr, n) => arr.slice(-n).reduce((a, b) => a + b, 0) / Math.min(n, arr.length);

// side: 'BUY' | 'SELL'. Returns { ok, reason }.
function adConfirms(candles, side, lookback = 20) {
  if (!candles || candles.length < lookback + 2) return { ok: false, reason: 'A/D: not enough candles' };
  const ad = adSeries(candles);
  const now = ad[ad.length - 1];
  const past = ad[ad.length - 1 - lookback];
  const avg = sma(ad, lookback);
  const rising = now > past && now > avg;
  const falling = now < past && now < avg;
  if (side === 'BUY')  return rising  ? { ok: true,  reason: 'A/D rising — buying pressure confirms' }
                                      : { ok: false, reason: 'A/D not rising — BUY skipped' };
  if (side === 'SELL') return falling ? { ok: true,  reason: 'A/D falling — selling pressure confirms' }
                                      : { ok: false, reason: 'A/D not falling — SELL skipped' };
  return { ok: false, reason: 'A/D: unknown side' };
}

module.exports = { adSeries, adConfirms };

/* Usage, right before the order is placed (M15 candles, same timeframe as the entry):
   const { adConfirms } = require('./ad-confirm');
   if (engine.confirm.includes('ad')) {
     const r = adConfirms(m15Candles, signal.side);
     log(`${signal.symbol}: ${r.reason}`);
     if (!r.ok) return;            // skip the trade
   }
   // engine.confirm comes from the "confirm" array sent by the app to /engine/start
*/
