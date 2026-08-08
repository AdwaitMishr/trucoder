const express = require('express');
const { rateLimiter } = require('./middleware/rateLimiter');
const { requireAuth } = require('./middleware/auth');
const { notFound, errorHandler } = require('./middleware/errors');
const { requestLogger } = require('./middleware/logger');

const app = express();

app.disable('x-powered-by');            // don't advertise the framework
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' })); // Docker HEALTHCHECK target

// chain: logger → rate limiter → routes (auth runs per-route where needed)
app.use('/api', requestLogger);
app.use('/api/auth', require('./routes/auth'));           // public
app.use('/api/products', rateLimiter({ limit: 60, windowMs: 60_000,
  keyFn: (req) => `ip:${req.ip}` }), require('./routes/products')); // public catalog, IP-keyed
app.use('/api/cart', requireAuth, rateLimiter({ limit: 120, windowMs: 60_000,
  keyFn: (req) => `user:${req.user.id}` }), require('./routes/cart'));
app.use('/api/orders', requireAuth, rateLimiter({ limit: 30, windowMs: 60_000,
  keyFn: (req) => `user:${req.user.id}` }), require('./routes/orders'));

app.use(notFound);
app.use(errorHandler);

module.exports = app;
