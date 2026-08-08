// middleware/rateLimiter.js — sliding window per key (lesson 12)
// Factory: rateLimiter({ limit, windowMs, keyFn, store? })
//   limit     — max requests per window
//   windowMs  — window length in ms; window [t - windowMs, t] INCLUSIVE on both edges
//   keyFn     — (req) => string key (user id for authed routes, IP for public ones)
//   store     — optional Redis client (defaults to the shared db/redis client).
//               Tests inject an in-memory store so the suite runs with zero infra.
function rateLimiter({ limit, windowMs, keyFn, store }) {
  const redis = store || require('../db/redis');

  return async function rateLimit(req, res, next) {
    const key = keyFn(req);                 // user id, or IP for anonymous
    const now = Date.now();
    const min = now - windowMs;             // left edge of the window

    const pipe = redis.multi();
    pipe.zRemRangeByScore(key, 0, min - 1);  // drop requests strictly older than the left edge (window is inclusive)
    pipe.zCard(key);                          // count what is left
    const results = await pipe.exec();        // node-redis v4: FLAT array of results, one per command
    const count = results[1];                 // zCard result

    // ── the decision: this is exactly the lesson's rule ──
    if (count >= limit) {                   // window already full
      const oldest = await redis.zRange(key, 0, 0, { WITHSCORES: true });
      const oldestScore = oldest.length >= 2 ? Number(oldest[1]) : now;
      const retryAfter = Math.max(1, Math.ceil((oldestScore + windowMs - now) / 1000));
      return res.status(429)
        .set('Retry-After', String(retryAfter))
        .json({ error: { code: 'RATE_LIMITED', message: 'Too many requests' } });
    }

    await redis.zAdd(key, { score: now, value: `${now}:${req.id}` });   // record this request
    await redis.expire(key, Math.ceil(windowMs / 1000));
    next();                                 // allowed
  };
}

module.exports = { rateLimiter };
