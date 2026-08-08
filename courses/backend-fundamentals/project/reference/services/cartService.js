// services/cartService.js — lesson 10: the pure cart domain
// A cart is an array of items { productId, qty, unitPrice }.
// Pure functions only: no HTTP, no SQL — trivially unit-testable.

function lineTotal(item) {
  return item.qty * item.unitPrice;
}

function cartTotal(cart) {
  return cart.reduce((sum, item) => sum + lineTotal(item), 0);
}

function addItem(cart, productId, qty, unitPrice) {
  const existing = cart.find((item) => item.productId === productId);
  if (existing) {
    // Merge: sum the quantities, KEEP the original unitPrice snapshot.
    return cart.map((item) =>
      item.productId === productId ? { ...item, qty: item.qty + qty } : item
    );
  }
  // Append a new line.
  return [...cart, { productId, qty, unitPrice }];
}

module.exports = { addItem, lineTotal, cartTotal };
