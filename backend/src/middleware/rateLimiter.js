// backend/src/middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 intentos
  message: 'Demasiados intentos, intente más tarde'
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

module.exports = { authLimiter, apiLimiter };