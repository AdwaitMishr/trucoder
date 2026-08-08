// middleware/errors.js — terminal middleware
function notFound(req, res) {
  res.status(404).json({ error: { code: 'NOT_FOUND' } });
}

function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  // Map known DB errors to proper status codes instead of leaking 500s.
  if (err.code === '23505') {           // unique_violation (e.g. duplicate email)
    return res.status(409).json({ error: { code: 'CONFLICT', message: 'Resource already exists' } });
  }
  if (err.code === '23503') {           // foreign_key_violation
    return res.status(400).json({ error: { code: 'INVALID_REFERENCE', message: 'Referenced resource does not exist' } });
  }
  const status = err.status || 500;
  if (status >= 500) console.error(err);
  res.status(status).json({ error: { code: err.code || 'INTERNAL' } });
}

module.exports = { notFound, errorHandler };
