// controllers/ordersController.js — lesson 11: the thin status mapper
// Reads req.user.id, req.body.items and the Idempotency-Key header, calls
// orderService.checkout, and maps the status to HTTP:
//   confirmed           → 201 + order
//   replayed            → 200 + stored order
//   insufficient_stock  → 409
//   insufficient_funds  → 402
// TODO: implement (lesson 11).
const orderService = require('../services/orderService');

const STATUS_TO_HTTP = {
  confirmed: 201,
  replayed: 200,
  insufficient_stock: 409,
  insufficient_funds: 402,
};

async function checkout(req, res, next) {
  res.status(501).json({ error: { code: 'NOT_IMPLEMENTED' } }); // TODO
}

module.exports = { checkout };
