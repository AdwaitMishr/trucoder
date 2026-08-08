// services/orderService.js — lesson 11: the checkout pipeline
// checkout({ userId, items, idempotencyKey }) -> { status, order, replayed }
//   status ∈ 'confirmed' | 'insufficient_stock' | 'insufficient_funds'
//   replayed = true when the idempotency key was already used (returns the
//   stored order untouched — no double charge, no double reservation).
//
// The store below is IN-MEMORY so the test suite runs with zero
// infrastructure. In production the same contract is implemented over
// Postgres (stock, balances, orders) + Redis (the idempotency claim via
// SETNX), wrapped in a BEGIN … COMMIT transaction.
const store = {
  stock: new Map(),    // productId -> available
  balances: new Map(), // userId -> cents
  orders: new Map(),   // idempotencyKey -> order
  seq: 0,
};

// Test seams (documented, test-only): seed the store between tests.
function __setStock(productId, available) {
  store.stock.set(productId, available);
}
function __setBalance(userId, cents) {
  store.balances.set(userId, cents);
}
function __reset() {
  store.stock.clear();
  store.balances.clear();
  store.orders.clear();
  store.seq = 0;
}

async function checkout({ userId, items, idempotencyKey }) {
  // 0. Idempotency — was this exact intent already processed?
  if (store.orders.has(idempotencyKey)) {
    const order = store.orders.get(idempotencyKey);
    return { replayed: true, status: order.status, order };
  }

  // 1. Stock check (fail fast, before any write).
  for (const item of items) {
    const available = store.stock.get(item.productId) ?? -1;
    if (available < item.qty) {
      return { replayed: false, status: 'insufficient_stock', order: null };
    }
  }

  // 2. Funds check.
  const total = items.reduce((sum, item) => sum + item.qty * item.unitPrice, 0);
  const balance = store.balances.get(userId) ?? 0;
  if (balance < total) {
    return { replayed: false, status: 'insufficient_funds', order: null };
  }

  // 3. Confirmed — reserve stock and create the order atomically.
  for (const item of items) {
    store.stock.set(item.productId, store.stock.get(item.productId) - item.qty);
  }
  store.seq += 1;
  const order = {
    id: `ord_${store.seq}`,
    userId,
    items,
    total,
    status: 'confirmed',
    idempotencyKey,
    createdAt: new Date().toISOString(),
  };
  store.orders.set(idempotencyKey, order);

  return { replayed: false, status: 'confirmed', order };
}

module.exports = { checkout, __setStock, __setBalance, __reset };
