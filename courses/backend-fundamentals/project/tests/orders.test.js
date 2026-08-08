// tests/orders.test.js — lesson 11
// Run: node --test tests/orders.test.js   (or: npm test)
// Integration: boots a REAL Express app on an ephemeral port and drives it
// with the built-in fetch. orderService ships an in-memory store (see
// services/orderService.js) so the suite runs with zero infrastructure.
const { test, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const ordersRouter = require('../routes/orders');
const orderService = require('../services/orderService');

let server;
let baseUrl;

// Test-only auth: a request carrying X-User-Id is "authenticated" as that
// user. In the real app this is the JWT middleware setting req.user.
function testAuth(req, res, next) {
  req.user = { id: Number(req.headers['x-user-id'] || 1) };
  next();
}

before(async () => {
  const app = express();
  app.use(express.json());
  app.use('/api/orders', testAuth, ordersRouter);
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(() => new Promise((resolve) => server.close(resolve)));

beforeEach(() => orderService.__reset());

function postOrder(body, key, userId = 1) {
  const headers = { 'Content-Type': 'application/json' };
  if (key) headers['Idempotency-Key'] = key;
  if (userId) headers['X-User-Id'] = String(userId);
  return fetch(`${baseUrl}/api/orders`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
}

test('confirmed checkout returns 201 with the created order', async () => {
  orderService.__setStock(1, 5);
  orderService.__setBalance(1, 1000);
  const res = await postOrder(
    { items: [{ productId: 1, qty: 2, unitPrice: 100 }] },
    'key-1'
  );
  assert.equal(res.status, 201);
  const body = await res.json();
  assert.equal(body.data.status, 'confirmed');
  assert.equal(body.data.total, 200);
  assert.ok(body.data.id);
});

test('buying exactly the available stock is allowed', async () => {
  orderService.__setStock(1, 2); // exactly what we want
  orderService.__setBalance(1, 1000);
  const res = await postOrder(
    { items: [{ productId: 1, qty: 2, unitPrice: 100 }] },
    'key-2'
  );
  assert.equal(res.status, 201);
});

test('out-of-stock checkout returns 409 and creates nothing', async () => {
  orderService.__setStock(1, 5);
  orderService.__setBalance(1, 1000);
  const res = await postOrder(
    { items: [{ productId: 1, qty: 10, unitPrice: 50 }] },
    'key-3'
  );
  assert.equal(res.status, 409);
  const body = await res.json();
  assert.equal(body.data, null); // no order was created
});

test('a product missing from stock is treated as out-of-stock (409)', async () => {
  orderService.__setStock(1, 5);
  orderService.__setBalance(1, 1000);
  const res = await postOrder(
    { items: [{ productId: 99, qty: 1, unitPrice: 10 }] },
    'key-4'
  );
  assert.equal(res.status, 409);
});

test('insufficient funds returns 402', async () => {
  orderService.__setStock(1, 5);
  orderService.__setBalance(1, 100); // can afford 100, not 200
  const res = await postOrder(
    { items: [{ productId: 1, qty: 2, unitPrice: 100 }] },
    'key-5'
  );
  assert.equal(res.status, 402);
});

test('replaying the same Idempotency-Key returns 200 with the stored order', async () => {
  orderService.__setStock(1, 5);
  orderService.__setBalance(1, 1000);
  const first = await postOrder(
    { items: [{ productId: 1, qty: 2, unitPrice: 100 }] },
    'key-6'
  );
  assert.equal(first.status, 201);
  const replay = await postOrder(
    { items: [{ productId: 1, qty: 2, unitPrice: 100 }] },
    'key-6'
  );
  assert.equal(replay.status, 200);
  const firstBody = await first.json();
  const replayBody = await replay.json();
  assert.equal(replayBody.data.id, firstBody.data.id); // same order, not a new one
});

test('a replayed key does not reserve stock twice', async () => {
  orderService.__setStock(1, 3);
  orderService.__setBalance(1, 1000);
  orderService.__setBalance(2, 1000); // the second shopper can pay
  await postOrder({ items: [{ productId: 1, qty: 2, unitPrice: 100 }] }, 'key-7');
  const replay = await postOrder(
    { items: [{ productId: 1, qty: 2, unitPrice: 100 }] },
    'key-7'
  );
  assert.equal(replay.status, 200);
  // A second shopper can still buy the remaining unit — nothing was
  // reserved twice by the replay.
  const second = await postOrder(
    { items: [{ productId: 1, qty: 1, unitPrice: 100 }] },
    'key-8',
    2
  );
  assert.equal(second.status, 201);
});

test('the controller reads the user from req.user, not from the body', async () => {
  orderService.__setStock(1, 1);
  orderService.__setBalance(1, 1000); // user 1 is rich…
  orderService.__setBalance(2, 0); // …user 2 is broke
  // Checkout as user 2: must hit the 402 path, proving req.user.id drove
  // the balance lookup (a naive controller would charge user 1).
  const res = await postOrder(
    { items: [{ productId: 1, qty: 1, unitPrice: 100 }] },
    'key-9',
    2
  );
  assert.equal(res.status, 402);
});
