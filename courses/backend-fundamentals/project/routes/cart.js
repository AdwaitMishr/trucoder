// routes/cart.js — mounted at /api/cart (behind requireAuth + rate limiter)
const router = require('express').Router();
const cartController = require('../controllers/cartController');

router.post('/items', cartController.addItem);          // POST /api/cart/items
router.get('/', cartController.getCart);                // GET  /api/cart
router.delete('/items/:id', cartController.removeItem); // DELETE /api/cart/items/:id

module.exports = router;
