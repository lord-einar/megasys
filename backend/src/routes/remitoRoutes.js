// ============================================
// backend/src/routes/remitoRoutes.js
// ============================================
const router = require('express').Router();
const { remitoController } = require('../controllers');
const { authenticate, authorize, AD_GROUPS } = require('../middleware/auth');
const { auditMiddleware } = require('../middleware/audit');
const { validatePagination } = require('../middleware/validation');
const { remitoValidators, queryValidators } = require('../utils/validators');
const { validateRequest } = require('../middleware/validation');

// Ruta pública de confirmación
router.get('/confirmar/:token', remitoController.confirmarRecepcion);

// Aplicar autenticación al resto de rutas
router.use(authenticate);

// GET - Listar remitos
router.get(
  '/',
  queryValidators.pagination,
  queryValidators.dateRange,
  validatePagination,
  remitoController.getRemitos
);

// GET - Obtener remito por ID
router.get('/:id', remitoController.getRemitoById);

// GET - Descargar PDF
router.get('/:id/pdf', remitoController.descargarPDF);

// POST - Crear remito (Infraestructura y Soporte)
router.post(
  '/',
  authorize(AD_GROUPS.INFRAESTRUCTURA, AD_GROUPS.SOPORTE),
  remitoValidators.create,
  validateRequest,
  auditMiddleware('remito', 'CREATE'),
  remitoController.createRemito
);

// PUT - Actualizar estado (Infraestructura y Soporte)
router.put(
  '/:id/estado',
  authorize(AD_GROUPS.INFRAESTRUCTURA, AD_GROUPS.SOPORTE),
  remitoValidators.updateEstado,
  validateRequest,
  auditMiddleware('remito', 'UPDATE'),
  remitoController.updateEstado
);

// POST - Reenviar confirmación
router.post(
  '/:id/reenviar-confirmacion',
  authorize(AD_GROUPS.INFRAESTRUCTURA, AD_GROUPS.SOPORTE),
  remitoController.reenviarConfirmacion
);

module.exports = router;