// tests/cart.test.js — lesson 10
// Run: node --test tests/cart.test.js   (or: npm test)
// The module under test is the pure cart domain — no HTTP, no database.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const cartService = require('../services/cartService');

test('lineTotal = qty x unitPrice', () => {
  assert.equal(cartService.lineTotal({ productId: 1, qty: 2, unitPrice: 100 }), 200);
  assert.equal(cartService.lineTotal({ productId: 7, qty: 1, unitPrice: 999 }), 999);
});

test('cartTotal sums every line total', () => {
  const cart = [
    { productId: 1, qty: 2, unitPrice: 100 }, // 200
    { productId: 2, qty: 3, unitPrice: 50 },  // 150
    { productId: 3, qty: 1, unitPrice: 25 },  // 25
  ];
  assert.equal(cartService.cartTotal(cart), 375);
  assert.equal(cartService.cartTotal([]), 0);
});

test('addItem appends a new product line', () => {
  const cart = [{ productId: 1, qty: 1, unitPrice: 50 }];
  const updated = cartService.addItem(cart, 2, 4, 10);
  assert.deepEqual(updated, [
    { productId: 1, qty: 1, unitPrice: 50 },
    { productId: 2, qty: 4, unitPrice: 10 },
  ]);
  assert.equal(cartService.cartTotal(updated), 90); // 50 + 40
});

test('addItem merges into an existing line and keeps the ORIGINAL unit price', () => {
  const cart = [{ productId: 1, qty: 2, unitPrice: 100 }];
  // The catalog now prices product 1 at 250 — the merge must IGNORE that
  // and keep the 100 snapshot from when the line was first added.
  const updated = cartService.addItem(cart, 1, 3, 250);
  assert.deepEqual(updated, [{ productId: 1, qty: 5, unitPrice: 100 }]);
  assert.equal(cartService.cartTotal(updated), 500); // 5 x 100, not 5 x 250
});

test('addItem works on an empty cart', () => {
  const updated = cartService.addItem([], 9, 2, 500);
  assert.deepEqual(updated, [{ productId: 9, qty: 2, unitPrice: 500 }]);
});

test('addItem keeps big numbers exact (full integer precision)', () => {
  const updated = cartService.addItem(
    [{ productId: 1, qty: 1_000_000, unitPrice: 9999 }],
    1,
    1_000_000,
    9999
  );
  assert.deepEqual(updated, [{ productId: 1, qty: 2_000_000, unitPrice: 9999 }]);
  assert.equal(cartService.cartTotal(updated), 2_000_000 * 9999); // 19,998,000,000
});

test('addItem merges across repeated adds of the same product', () => {
  let cart = [];
  cart = cartService.addItem(cart, 1, 1, 100);
  cart = cartService.addItem(cart, 1, 2, 100);
  cart = cartService.addItem(cart, 1, 3, 100);
  assert.deepEqual(cart, [{ productId: 1, qty: 6, unitPrice: 100 }]);
});
