// ============================================
// backend/src/routes/dashboardRoutes.js
// ============================================
const express = require('express');
const { query, validationResult } = require('express-validator');
const {
  authenticate,
  authorize,
  requireEmpresa,
  authorizeEmpresa,
  AD_GROUPS
} = require('../middleware/auth');
const controller = require('../controllers/dashboardController');

const router = express.Router();

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }
  next();
}

// Obtener estadísticas generales
router.get(
  '/stats',
  authenticate,
  requireEmpresa(),
  authorizeEmpresa(),
  authorize(AD_GROUPS.MESA_AYUDA, AD_GROUPS.SOPORTE, AD_GROUPS.INFRAESTRUCTURA),
  (req, res) => controller.getStats(req, res)
);

// Obtener métricas de préstamos
router.get(
  '/prestamos',
  authenticate,
  requireEmpresa(),
  authorizeEmpresa(),
  authorize(AD_GROUPS.MESA_AYUDA, AD_GROUPS.SOPORTE, AD_GROUPS.INFRAESTRUCTURA),
  [
    query('dias').optional().isInt({ min: 1, max: 365 }).toInt()
  ],
  validate,
  (req, res) => controller.getPrestamoMetrics(req, res)
);

// Obtener actividad reciente
router.get(
  '/actividad',
  authenticate,
  requireEmpresa(),
  authorizeEmpresa(),
  authorize(AD_GROUPS.MESA_AYUDA, AD_GROUPS.SOPORTE, AD_GROUPS.INFRAESTRUCTURA),
  [
    query('limit').optional().isInt({ min: 1, max: 50 }).toInt()
  ],
  validate,
  (req, res) => controller.getRecentActivity(req, res)
);

// Obtener alertas
router.get(
  '/alertas',
  authenticate,
  requireEmpresa(),
  authorizeEmpresa(),
  authorize(AD_GROUPS.MESA_AYUDA, AD_GROUPS.SOPORTE, AD_GROUPS.INFRAESTRUCTURA),
  (req, res) => controller.getAlerts(req, res)
);

module.exports = router;