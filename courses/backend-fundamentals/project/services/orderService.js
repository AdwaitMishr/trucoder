// services/orderService.js — lesson 11: the checkout pipeline
// checkout({ userId, items, idempotencyKey }) → { status, order, replayed }
//   status: 'confirmed' | 'insufficient_stock' | 'insufficient_funds'
//   order:  the created order (when confirmed) or null
//   replayed: true when the idempotency key was already used
// Test seams (used by tests/orders.test.js, no infra needed):
//   __setStock(productId, available) · __setBalance(userId, cents) · __reset()
// TODO: implement (lesson 11).

const store = {
  stock: new Map(),
  balances: new Map(),
  orders: new Map(),
  idempotency: new Map(),
};

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
  store.idempotency.clear();
}

async function checkout({ userId, items, idempotencyKey }) {
  return { status: 'insufficient_funds', order: null, replayed: false }; // TODO
}

module.exports = { checkout, __setStock, __setBalance, __reset };
