// routes/products.js
const router = require('express').Router();
const productsController = require('../controllers/productsController');

router.get('/', productsController.list);

module.exports = router;
