// ============================================
// backend/src/routes/authRoutes.js
// ============================================
const router = require('express').Router();
const { authController } = require('../controllers');
const { authenticate } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');


// Rutas públicas
router.get('/login', authLimiter, authController.login);
router.get('/callback', authController.callback);

// Rutas protegidas
router.get('/verify', authenticate, authController.verify);
router.post('/logout', authenticate, authController.logout);
router.post('/refresh', authenticate, authController.refresh);

module.exports = router;
