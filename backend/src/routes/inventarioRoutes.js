// ============================================
// backend/src/routes/inventarioRoutes.js
// ============================================
const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const {
  authenticate,
  authorize,
  requireEmpresa,
  authorizeEmpresa,
  AD_GROUPS
} = require('../middleware/auth');
const controller = require('../controllers/inventarioController');

const router = express.Router();

// Helper de validación
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }
  next();
}

const validatePagination = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
];

// =========================
// Listado + filtros
// =========================
router.get(
  '/',
  authenticate,
  requireEmpresa(),
  authorizeEmpresa(),
  authorize(AD_GROUPS.MESA_AYUDA, AD_GROUPS.SOPORTE, AD_GROUPS.INFRAESTRUCTURA),
  [
    query('service_tag').optional().isString().trim(),
    query('estado').optional().isIn(['disponible', 'en_uso', 'prestado', 'en_transito', 'en_reparacion', 'baja']),
    query('prestamo').optional().isBoolean().toBoolean(),
    query('sede_actual_id').optional().isUUID(),
    ...validatePagination
  ],
  validate,
  // el controller debería tomar req.empresaId para filtrar por empresa
  (req, res) => controller.list(req, res)
);

// =========================
// Detalle
// =========================
router.get(
  '/:id',
  authenticate,
  requireEmpresa(),
  authorizeEmpresa(),
  authorize(AD_GROUPS.MESA_AYUDA, AD_GROUPS.SOPORTE, AD_GROUPS.INFRAESTRUCTURA),
  [param('id').isUUID()],
  validate,
  (req, res) => controller.getById(req, res)
);

// =========================
// Crear
// =========================
router.post(
  '/',
  authenticate,
  requireEmpresa(),
  authorizeEmpresa(),
  authorize(AD_GROUPS.SOPORTE, AD_GROUPS.INFRAESTRUCTURA),
  [
    body('tipo_articulo_id').isUUID(),
    body('marca').isString().trim().notEmpty(),
    body('modelo').isString().trim().notEmpty(),
    body('service_tag').isString().trim().notEmpty(),
    body('sede_actual_id').isUUID(),
    body('numero_serie').optional().isString().trim(),
    body('activo').optional().isBoolean().toBoolean(),
  ],
  validate,
  (req, res) => controller.create(req, res)
);

// =========================
// Actualizar
// =========================
router.put(
  '/:id',
  authenticate,
  requireEmpresa(),
  authorizeEmpresa(),
  authorize(AD_GROUPS.SOPORTE, AD_GROUPS.INFRAESTRUCTURA),
  [
    param('id').isUUID(),
    body('marca').optional().isString().trim(),
    body('modelo').optional().isString().trim(),
    body('numero_serie').optional().isString().trim(),
    body('service_tag').optional().isString().trim(),
    body('sede_actual_id').optional().isUUID(),
    body('estado').optional().isIn(['disponible', 'en_uso', 'prestado', 'en_transito', 'en_reparacion', 'baja']),
    body('activo').optional().isBoolean().toBoolean(),
    body('observaciones').optional().isString(),
  ],
  validate,
  (req, res) => controller.update(req, res)
);

// =========================
// Eliminar (solo Infra)
// =========================
router.delete(
  '/:id',
  authenticate,
  requireEmpresa(),
  authorizeEmpresa(),
  authorize(AD_GROUPS.INFRAESTRUCTURA),
  [param('id').isUUID()],
  validate,
  (req, res) => controller.remove(req, res)
);

// =========================
// Préstamo
// =========================
router.post(
  '/:id/prestamo',
  authenticate,
  requireEmpresa(),
  authorizeEmpresa(),
  authorize(AD_GROUPS.SOPORTE, AD_GROUPS.INFRAESTRUCTURA),
  [
    param('id').isUUID(),
    body('usuario_prestamo_id').isUUID(),
    body('fecha_devolucion').isISO8601().toDate(),
    body('observaciones_prestamo').optional().isString(),
  ],
  validate,
  (req, res) => controller.prestar(req, res)
);

// =========================
// Devolución
// =========================
router.post(
  '/:id/devolucion',
  authenticate,
  requireEmpresa(),
  authorizeEmpresa(),
  authorize(AD_GROUPS.SOPORTE, AD_GROUPS.INFRAESTRUCTURA),
  [
    param('id').isUUID(),
    body('observaciones').optional().isString(),
  ],
  validate,
  (req, res) => controller.devolver(req, res)
);

// =========================
// Reportes de préstamos
// =========================
router.get(
  '/prestamos/proximos',
  authenticate,
  requireEmpresa(),
  authorizeEmpresa(),
  authorize(AD_GROUPS.MESA_AYUDA, AD_GROUPS.SOPORTE, AD_GROUPS.INFRAESTRUCTURA),
  validatePagination,
  validate,
  (req, res) => controller.proximosVencer(req, res)
);

router.get(
  '/prestamos/vencidos',
  authenticate,
  requireEmpresa(),
  authorizeEmpresa(),
  authorize(AD_GROUPS.MESA_AYUDA, AD_GROUPS.SOPORTE, AD_GROUPS.INFRAESTRUCTURA),
  validatePagination,
  validate,
  (req, res) => controller.vencidos(req, res)
);

module.exports = router;
