// ============================================
// backend/src/routes/inventarioRoutes.js
// ============================================
const router = require('express').Router();
const { inventarioController } = require('../controllers');
const { authenticate, authorize, AD_GROUPS } = require('../middleware/auth');
const { auditMiddleware } = require('../middleware/audit');
const { validatePagination } = require('../middleware/validation');
const { inventarioValidators, queryValidators } = require('../utils/validators');
const { validateRequest } = require('../middleware/validation');

// Aplicar autenticación a todas las rutas
router.use(authenticate);

// GET - Listar inventario
router.get(
  '/',
  queryValidators.pagination,
  validatePagination,
  inventarioController.getInventario
);

// GET - Items próximos a vencer
router.get('/proximos-vencer', inventarioController.getProximosVencer);

// GET - Obtener item por ID
router.get('/:id', inventarioController.getItemById);

// POST - Crear item (Infraestructura y Soporte)
router.post(
  '/',
  authorize(AD_GROUPS.INFRAESTRUCTURA, AD_GROUPS.SOPORTE),
  inventarioValidators.create,
  validateRequest,
  auditMiddleware('inventario', 'CREATE'),
  inventarioController.createItem
);

// PUT - Actualizar item (Infraestructura y Soporte)
router.put(
  '/:id',
  authorize(AD_GROUPS.INFRAESTRUCTURA, AD_GROUPS.SOPORTE),
  inventarioValidators.update,
  validateRequest,
  auditMiddleware('inventario', 'UPDATE'),
  inventarioController.updateItem
);

// POST - Marcar como préstamo
router.post(
  '/:id/prestamo',
  authorize(AD_GROUPS.INFRAESTRUCTURA, AD_GROUPS.SOPORTE),
  inventarioValidators.prestamo,
  validateRequest,
  auditMiddleware('inventario', 'UPDATE'),
  inventarioController.marcarPrestamo
);

// POST - Devolver préstamo
router.post(
  '/:id/devolucion',
  authorize(AD_GROUPS.INFRAESTRUCTURA, AD_GROUPS.SOPORTE),
  inventarioValidators.devolucion,
  validateRequest,
  auditMiddleware('inventario', 'UPDATE'),
  inventarioController.devolverPrestamo
);

// POST - Solicitar extensión
router.post(
  '/:id/extension',
  inventarioController.solicitarExtension
);

module.exports = router;