// controllers/ordersController.js — lesson 11: thin status mapper
// Reads req.body.items + req.headers['idempotency-key'] + req.user.id,
// delegates to orderService.checkout, and maps the result to HTTP:
//   confirmed           -> 201 Created
//   insufficient_stock  -> 409 Conflict
//   insufficient_funds  -> 402 Payment Required
//   replayed            -> 200 OK (the stored order, no duplicate)
const orderService = require('../services/orderService');

const STATUS_TO_HTTP = {
  confirmed: 201,
  insufficient_stock: 409,
  insufficient_funds: 402,
};

async function checkout(req, res, next) {
  try {
    const result = await orderService.checkout({
      userId: req.user.id,
      items: req.body.items,
      idempotencyKey: req.headers['idempotency-key'],
    });
    if (result.replayed) {
      return res.status(200).json({ data: result.order });
    }
    res.status(STATUS_TO_HTTP[result.status]).json({ data: result.order });
  } catch (err) {
    next(err);
  }
}

module.exports = { checkout };
