// routes/orders.js — mounted at /api/orders (behind requireAuth + rate limiter)
const router = require('express').Router();
const ordersController = require('../controllers/ordersController');

router.post('/', ordersController.checkout);   // POST /api/orders

module.exports = router;
