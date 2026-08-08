// db/redis.js — shared Redis client (node-redis v4).
// Required by middleware/rateLimiter.js (lesson 12) and
// services/orderService.js (lesson 11), but missing from the lesson-13
// project tree — this file is the minimal fix.
const { createClient } = require('redis');

const client = createClient({ url: process.env.REDIS_URL });

client.on('error', (err) => console.error('redis client error:', err.message));

client.connect();

module.exports = client;
