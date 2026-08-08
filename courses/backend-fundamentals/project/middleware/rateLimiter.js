// middleware/rateLimiter.js — lesson 12: sliding-window rate limiter
// rateLimiter({ limit, windowMs, keyFn, store? }) → Express middleware.
//   limit    — max requests per window
//   windowMs — window length in ms; window [t - windowMs, t] INCLUSIVE
//   keyFn    — (req) => string key (user id for authed routes, IP for public)
//   store    — optional Redis client (defaults to the shared db/redis client;
//              tests inject an in-memory store so the suite runs with zero infra)
// Denied requests get 429 + Retry-After (seconds until the window frees).
// TODO: implement (lesson 12).

function rateLimiter({ limit, windowMs, keyFn, store }) {
  const redis = store || require('../db/redis');

  return async function rateLimit(req, res, next) {
    next(); // TODO: sliding-window allow/deny
  };
}

module.exports = { rateLimiter };
