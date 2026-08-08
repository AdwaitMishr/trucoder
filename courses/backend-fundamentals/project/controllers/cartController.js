// controllers/cartController.js — thin: parse, delegate, respond (lesson 10)
// GIVEN — ships complete with the project. The pure cart business rules
// (merge, line totals) live in services/cartService.js, YOUR module.
const cartRepository = require('../repositories/cartRepository');
const cartService = require('../services/cartService');

function rowsToCart(rows) {
  return rows.map((r) => ({
    productId: r.product_id,
    qty: r.qty,
    unitPrice: r.unit_price,
  }));
}

async function addItem(req, res, next) {
  try {
    const { productId, qty, unitPrice } = req.body; // validated upstream
    const rows = await cartRepository.getItems(req.user.id);
    const cart = rowsToCart(rows);
    const updated = cartService.addItem(cart, productId, qty, unitPrice);
    await cartRepository.upsertItems(req.user.id, updated);
    res.status(201).json({
      data: { items: updated, total: cartService.cartTotal(updated) },
    });
  } catch (err) { next(err); }
}

async function getCart(req, res, next) {
  try {
    const rows = await cartRepository.getItems(req.user.id);
    const cart = rowsToCart(rows);
    res.json({ data: { items: cart, total: cartService.cartTotal(cart) } });
  } catch (err) { next(err); }
}

async function removeItem(req, res, next) {
  try {
    await cartRepository.removeItem(req.user.id, Number(req.params.id));
    res.status(204).end();
  } catch (err) { next(err); }
}

module.exports = { addItem, getCart, removeItem };
