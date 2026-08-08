// utils/response.js — one envelope for every response
const ok = (res, data, status = 200) => res.status(status).json({ data });
const fail = (res, code, message, status = 400) =>
  res.status(status).json({ error: { code, message } });

module.exports = { ok, fail };
