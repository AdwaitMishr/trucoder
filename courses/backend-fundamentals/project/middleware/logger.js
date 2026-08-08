// middleware/logger.js — request logger that also stamps a unique req.id.
// The lesson-13 app.js wires `requestLogger` into the chain but never
// imports or defines it; it also must set req.id because the lesson-12
// rate limiter uses `${now}:${req.id}` as the sorted-set member.
const { randomUUID } = require('crypto');

function requestLogger(req, res, next) {
  req.id = randomUUID();
  const start = Date.now();
  res.on('finish', () => {
    console.log(
      `${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - start}ms`
    );
  });
  next();
}

module.exports = { requestLogger };
