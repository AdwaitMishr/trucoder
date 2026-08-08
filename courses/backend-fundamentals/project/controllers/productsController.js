// controllers/productsController.js
const { query } = require('../db/pool');

async function list(req, res, next) {
  try {
    const { rows } = await query(
      'SELECT id, name, price, available FROM products ORDER BY id'
    );
    res.json({ data: rows });
  } catch (err) { next(err); }
}

module.exports = { list };
