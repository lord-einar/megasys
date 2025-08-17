// backend/src/middleware/rateLimiter.js
const rateLimitImport = require('express-rate-limit');
const rateLimit = rateLimitImport?.default || rateLimitImport; // CJS/ESM safe

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,                 // v7 usa 'limit' (antes 'max')
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Demasiados intentos. Inténtelo más tarde.' },
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { authLimiter, apiLimiter };
