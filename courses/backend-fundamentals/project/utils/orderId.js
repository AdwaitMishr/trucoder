// utils/orderId.js — short, sortable order ids
const { randomBytes } = require('crypto');

function orderId() {
  return `ord_${Date.now().toString(36)}_${randomBytes(4).toString('hex')}`;
}

module.exports = { orderId };
