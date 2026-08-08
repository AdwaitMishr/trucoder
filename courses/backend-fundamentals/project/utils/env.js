// utils/env.js — lesson 13: fail fast at boot, not on the first request
// validateEnv(required) — returns the missing keys, in `required` order.
//   Only `KEY=value` with a NON-EMPTY value counts as present.
// getEnv(key, fallback) — the value for `key` (trimmed), or the fallback.
// TODO: implement (lesson 13).

function validateEnv(required) {
  return required; // TODO: filter to the missing ones, keep required order
}

function getEnv(key, fallback) {
  return fallback; // TODO
}

module.exports = { validateEnv, getEnv };
