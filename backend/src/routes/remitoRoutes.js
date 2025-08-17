// ============================================
// backend/src/routes/remitoRoutes.js
// CORREGIDO: Agregada ruta de confirmación faltante
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
const controller = require('../controllers/remitoController');

const router = express.Router();

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
// Listado con filtros
// =========================
router.get(
  '/',
  authenticate,
  requireEmpresa(),
  authorizeEmpresa(),
  authorize(AD_GROUPS.MESA_AYUDA, AD_GROUPS.SOPORTE, AD_GROUPS.INFRAESTRUCTURA),
  [
    query('estado').optional().isIn(['preparado', 'en_transito', 'entregado', 'confirmado']),
    query('confirmados').optional().isBoolean().toBoolean(),
    ...validatePagination
  ],
  validate,
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
// Crear Remito (creado_por_id = req.user.id)
// solicitante_id y tecnico_asignado_id son de "personal"
// =========================
router.post(
  '/',
  authenticate,
  requireEmpresa(),
  authorizeEmpresa(),
  authorize(AD_GROUPS.SOPORTE, AD_GROUPS.INFRAESTRUCTURA),
  [
    body('fecha').optional().isISO8601().toDate(),
    body('sede_origen_id').isUUID(),
    body('sede_destino_id').isUUID(),
    body('solicitante_id').isUUID(),
    body('tecnico_asignado_id').optional().isUUID(),
    body('observaciones').optional().isString(),
    body('items').isArray({ min: 1 }),
    body('items.*.inventario_id').isUUID(),
    body('items.*.cantidad').optional().isInt({ min: 1 }).toInt(),
    body('items.*.observaciones').optional().isString()
  ],
  validate,
  (req, res) => controller.create(req, res)
);

// =========================
// Cambiar estado
// =========================
router.patch(
  '/:id/estado',
  authenticate,
  requireEmpresa(),
  authorizeEmpresa(),
  authorize(AD_GROUPS.SOPORTE, AD_GROUPS.INFRAESTRUCTURA),
  [
    param('id').isUUID(),
    body('estado').isIn(['preparado', 'en_transito', 'entregado', 'confirmado']),
    body('observaciones').optional().isString()
  ],
  validate,
  (req, res) => controller.updateEstado(req, res)
);

// =========================
// Reenviar confirmación (email)
// =========================
router.post(
  '/:id/reenviar-confirmacion',
  authenticate,
  requireEmpresa(),
  authorizeEmpresa(),
  authorize(AD_GROUPS.SOPORTE, AD_GROUPS.INFRAESTRUCTURA),
  [param('id').isUUID()],
  validate,
  (req, res) => controller.reenviarConfirmacion(req, res)
);

// =========================
// ← NUEVA RUTA: Confirmación por token (público - sin auth)
// GET /remitos/confirmar?token=xxx
// =========================
router.get(
  '/confirmar',
  [query('token').isString().notEmpty()],
  validate,
  (req, res) => controller.confirmarPorToken(req, res)
);

// =========================
// Descargar PDF (entrega|confirmacion)
// GET /remitos/:id/pdf/entrega
// GET /remitos/:id/pdf/confirmacion
// =========================
router.get(
  '/:id/pdf/:tipo',
  authenticate,
  requireEmpresa(),
  authorizeEmpresa(),
  authorize(AD_GROUPS.MESA_AYUDA, AD_GROUPS.SOPORTE, AD_GROUPS.INFRAESTRUCTURA),
  [
    param('id').isUUID(),
    param('tipo').isIn(['entrega', 'confirmacion'])
  ],
  validate,
  (req, res) => controller.descargarPDF(req, res)
);

module.exports = router;