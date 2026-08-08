// tests/env.test.js — lesson 13
// Run: node --test tests/env.test.js   (or: npm test)
// The module under test is utils/env.js — pure config validation.
const { test, beforeEach, after } = require('node:test');
const assert = require('node:assert/strict');
const { validateEnv, getEnv } = require('../utils/env');

// Save the real environment; each test starts from a clean slate.
const SAVED = { ...process.env };

function unset(...names) {
  for (const name of names) delete process.env[name];
}

after(() => {
  for (const key of Object.keys(process.env)) delete process.env[key];
  Object.assign(process.env, SAVED);
});

beforeEach(() => {
  unset('PORT', 'DB_URL', 'JWT_SECRET', 'REDIS_URL', 'DATABASE_URL', 'A', 'B', 'C', 'EMPTY');
});

test('validateEnv returns [] when every required var is present', () => {
  process.env.PORT = '3000';
  process.env.JWT_SECRET = 'abc';
  assert.deepEqual(validateEnv(['PORT', 'JWT_SECRET']), []);
});

test('validateEnv returns the missing vars in REQUIRED order', () => {
  process.env.PORT = '3000';
  assert.deepEqual(validateEnv(['PORT', 'DB_URL', 'JWT_SECRET']), ['DB_URL', 'JWT_SECRET']);
});

test('validateEnv treats an empty value as missing', () => {
  process.env.PORT = '';
  assert.deepEqual(validateEnv(['PORT']), ['PORT']);
});

test('validateEnv with an empty required list returns []', () => {
  assert.deepEqual(validateEnv([]), []);
});

test('getEnv returns the value when the var is set', () => {
  process.env.PORT = '4000';
  assert.equal(getEnv('PORT', 3000), '4000');
});

test('getEnv falls back when the var is missing or empty', () => {
  assert.equal(getEnv('PORT', 3000), 3000); // missing
  process.env.PORT = '';
  assert.equal(getEnv('PORT', 3000), 3000); // empty counts as missing
});
