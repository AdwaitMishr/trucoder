# reference/ — complete solutions

`reference/` holds **complete, working implementations** of the five modules
you write during lessons 10–13:

| File | Lesson |
|------|--------|
| `services/cartService.js` | 10 — cart domain (addItem / lineTotal / cartTotal) |
| `services/orderService.js` | 11 — checkout pipeline (checkout + test seams) |
| `controllers/ordersController.js` | 11 — status → HTTP mapping |
| `middleware/rateLimiter.js` | 12 — sliding-window rate limiter |
| `utils/env.js` | 13 — env validation (validateEnv / getEnv) |

These are the exact implementations the project's test suite
(`tests/*.test.js`) passes against — copy a file over its stub (e.g.
`cp reference/services/cartService.js services/cartService.js`) and the
corresponding test file goes green.

**Try the stubs first, then compare.** The stubs in `services/`,
`controllers/`, `middleware/` and `utils/` are deliberately unimplemented —
write your own version, get `npm test` green yourself, and only then peek
here to compare approaches. The `reference/` directory is a shortcut, not a
requirement; the tests are the real spec (they are printed in full in the
lessons and shipped in `tests/` — nothing is hidden).
