// services/cartService.js — lesson 10: the pure cart domain
// addItem(cart, productId, qty, unitPrice)  — add/merge a line; merging an
//   existing productId KEEPS the ORIGINAL unitPrice (price snapshot), and
//   returns the updated cart.
// lineTotal(item) — qty * unitPrice.
// cartTotal(cart) — sum of every line total.
// TODO: implement (lesson 10).

function lineTotal(item) {
  return 0;
}

function cartTotal(cart) {
  return 0;
}

function addItem(cart, productId, qty, unitPrice) {
  return cart; // TODO: merge or append a line, keep the original unitPrice
}

module.exports = { addItem, lineTotal, cartTotal };
