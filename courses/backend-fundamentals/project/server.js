// server.js — bootstrap (fail fast on bad config)
// Uses YOUR lesson-13 module: utils/env.js (validateEnv + getEnv).
const app = require('./app');
const { validateEnv, getEnv } = require('./utils/env');

const missing = validateEnv(['PORT', 'DATABASE_URL', 'REDIS_URL', 'JWT_SECRET']);
if (missing.length > 0) {
  console.error(`Missing required env vars: ${missing.join(', ')}`);
  process.exit(1);
}

const PORT = getEnv('PORT', 3000);
app.listen(PORT, () => {
  console.log(`shop-api listening on :${PORT}`);
});
