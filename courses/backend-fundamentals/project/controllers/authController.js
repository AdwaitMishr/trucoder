// controllers/authController.js
const authService = require('../services/authService');

async function register(req, res, next) {
  try {
    const user = await authService.register(req.body.email, req.body.password);
    res.status(201).json({ data: user });
  } catch (err) { next(err); }
}

async function login(req, res, next) {
  try {
    const token = await authService.login(req.body.email, req.body.password);
    res.json({ data: { token } });
  } catch (err) { next(err); }
}

module.exports = { register, login };
