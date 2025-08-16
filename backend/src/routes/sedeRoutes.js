// ============================================
// backend/src/routes/sedeRoutes.js
// ============================================
const router = require('express').Router();
const { sedeController } = require('../controllers');
const { authenticate, authorize, AD_GROUPS } = require('../middleware/auth');
const { auditMiddleware } = require('../middleware/audit');
const { validatePagination } = require('../middleware/validation');
const { sedeValidators, queryValidators } = require('../utils/validators');
const { validateRequest } = require('../middleware/validation');

// Aplicar autenticación a todas las rutas
router.use(authenticate);

// GET - Listar sedes
router.get(
  '/',
  queryValidators.pagination,
  validatePagination,
  sedeController.getAllSedes
);

// GET - Obtener sede por ID
router.get('/:id', sedeController.getSedeById);

// GET - Estadísticas de sede
router.get('/:id/stats', sedeController.getStats);

// POST - Crear sede (solo Infraestructura)
router.post(
  '/',
  authorize(AD_GROUP_IDS.INFRAESTRUCTURA),
  sedeValidators.create,
  validateRequest,
  auditMiddleware('sede', 'CREATE'),
  sedeController.createSede
);

// PUT - Actualizar sede (solo Infraestructura)
router.put(
  '/:id',
  authorize(AD_GROUP_IDS.INFRAESTRUCTURA),
  sedeValidators.update,
  validateRequest,
  auditMiddleware('sede', 'UPDATE'),
  sedeController.updateSede
);

// DELETE - Eliminar sede (solo Infraestructura)
router.delete(
  '/:id',
  authorize(AD_GROUP_IDS.INFRAESTRUCTURA),
  auditMiddleware('sede', 'DELETE'),
  sedeController.deleteSede
);

// POST - Asignar personal a sede
router.post(
  '/:id/personal',
  authorize(AD_GROUP_IDS.INFRAESTRUCTURA),
  auditMiddleware('personal_sede', 'CREATE'),
  sedeController.asignarPersonal
);

module.exports = router;
