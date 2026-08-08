// repositories/cartRepository.js — the only file that touches cart SQL
// (lesson-13 blueprint, verbatim). GIVEN — ships complete with the project.
const { query } = require('../db/pool');

async function getItems(userId) {
  const { rows } = await query(
    'SELECT product_id, qty, unit_price FROM cart_items WHERE user_id = $1',
    [userId]
  );
  return rows;
}

async function upsertItems(userId, items) {
  for (const item of items) {
    await query(
      `INSERT INTO cart_items (user_id, product_id, qty, unit_price)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, product_id)
       DO UPDATE SET qty = EXCLUDED.qty`,   // unit_price keeps its snapshot
      [userId, item.productId, item.qty, item.unitPrice]
    );
  }
}

async function removeItem(userId, productId) {
  await query(
    'DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2',
    [userId, productId]
  );
}

module.exports = { getItems, upsertItems, removeItem };
