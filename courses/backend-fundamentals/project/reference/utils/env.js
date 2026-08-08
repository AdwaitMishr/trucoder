// utils/env.js — lesson 13: fail fast at boot, never on the first request.
// Only KEY=value with a NON-EMPTY value counts as present.

function validateEnv(required) {
  const missing = [];
  for (const name of required) {
    const value = process.env[name];
    if (value === undefined || value === '') {
      missing.push(name);
    }
  }
  return missing;
}

function getEnv(key, fallback) {
  const value = process.env[key];
  return value === undefined || value === '' ? fallback : value;
}

module.exports = { validateEnv, getEnv };
