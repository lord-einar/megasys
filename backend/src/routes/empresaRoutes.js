// ============================================
// backend/src/routes/empresaRoutes.js
// ============================================
const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const {
  authenticate,
  authorize,
  AD_GROUPS
} = require('../middleware/auth');
const controller = require('../controllers/empresaController');

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
// Ruta especial: Mis empresas (sin requireEmpresa)
// =========================
router.get(
  '/mis-empresas',
  authenticate,
  (req, res) => controller.getMisEmpresas(req, res)
);

// =========================
// Listado (solo Super Admin o Infraestructura)
// =========================
router.get(
  '/',
  authenticate,
  authorize(AD_GROUPS.INFRAESTRUCTURA), // Solo Infra puede ver todas las empresas
  [
    query('nombre').optional().isString().trim(),
    query('razon_social').optional().isString().trim(),
    query('cuit').optional().isString().trim(),
    query('activa').optional().isBoolean().toBoolean(),
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
  authorize(AD_GROUPS.INFRAESTRUCTURA),
  [param('id').isUUID()],
  validate,
  (req, res) => controller.getById(req, res)
);

// =========================
// Crear empresa (solo Super Admin o Infraestructura)
// =========================
router.post(
  '/',
  authenticate,
  authorize(AD_GROUPS.INFRAESTRUCTURA),
  [
    body('nombre').isString().trim().notEmpty().isLength({ max: 150 }),
    body('razon_social').isString().trim().notEmpty().isLength({ max: 200 }),
    body('cuit').isString().trim().notEmpty().matches(/^[0-9]{2}-[0-9]{8}-[0-9]$/),
    body('direccion_fiscal').optional().isString().trim().isLength({ max: 255 }),
    body('telefono_principal').optional().isString().trim().isLength({ max: 50 }),
    body('email_corporativo').optional().isEmail().normalizeEmail(),
    body('sitio_web').optional().isURL(),
    body('configuracion').optional().isObject()
  ],
  validate,
  (req, res) => controller.create(req, res)
);

// =========================
// Actualizar empresa
// =========================
router.put(
  '/:id',
  authenticate,
  authorize(AD_GROUPS.INFRAESTRUCTURA),
  [
    param('id').isUUID(),
    body('nombre').optional().isString().trim().isLength({ max: 150 }),
    body('razon_social').optional().isString().trim().isLength({ max: 200 }),
    body('cuit').optional().isString().trim().matches(/^[0-9]{2}-[0-9]{8}-[0-9]$/),
    body('direccion_fiscal').optional().isString().trim().isLength({ max: 255 }),
    body('telefono_principal').optional().isString().trim().isLength({ max: 50 }),
    body('email_corporativo').optional().isEmail().normalizeEmail(),
    body('sitio_web').optional().isURL(),
    body('configuracion').optional().isObject()
  ],
  validate,
  (req, res) => controller.update(req, res)
);

// =========================
// Activar/Desactivar empresa
// =========================
router.patch(
  '/:id/toggle',
  authenticate,
  authorize(AD_GROUPS.INFRAESTRUCTURA),
  [
    param('id').isUUID(),
    body('activa').isBoolean()
  ],
  validate,
  (req, res) => controller.toggleStatus(req, res)
);

// =========================
// Estadísticas de empresa
// =========================
router.get(
  '/:id/stats',
  authenticate,
  authorize(AD_GROUPS.INFRAESTRUCTURA),
  [param('id').isUUID()],
  validate,
  (req, res) => controller.getStats(req, res)
);

// =========================
// Gestión de usuarios de empresa
// =========================

// Listar usuarios
router.get(
  '/:id/usuarios',
  authenticate,
  authorize(AD_GROUPS.INFRAESTRUCTURA),
  [param('id').isUUID()],
  validate,
  (req, res) => controller.getUsuarios(req, res)
);

// Asignar usuario
router.post(
  '/:id/usuarios',
  authenticate,
  authorize(AD_GROUPS.INFRAESTRUCTURA),
  [
    param('id').isUUID(),
    body('usuario_id').isUUID()
  ],
  validate,
  (req, res) => controller.asignarUsuario(req, res)
);

// Quitar usuario
router.delete(
  '/:id/usuarios/:usuarioId',
  authenticate,
  authorize(AD_GROUPS.INFRAESTRUCTURA),
  [
    param('id').isUUID(),
    param('usuarioId').isUUID()
  ],
  validate,
  (req, res) => controller.quitarUsuario(req, res)
);

module.exports = router;