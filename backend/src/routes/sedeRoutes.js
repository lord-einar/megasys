// ============================================
// backend/src/routes/sedeRoutes.js (ACTUALIZADO)
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
const controller = require('../controllers/sedeController');

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
// Listado de sedes por empresa
// =========================
router.get(
  '/',
  authenticate,
  requireEmpresa(),
  authorizeEmpresa(),
  authorize(AD_GROUPS.MESA_AYUDA, AD_GROUPS.SOPORTE, AD_GROUPS.INFRAESTRUCTURA),
  validatePagination,
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
// Crear Sede (queda ligada a req.empresaId)
// =========================
router.post(
  '/',
  authenticate,
  requireEmpresa(),
  authorizeEmpresa(),
  authorize(AD_GROUPS.SOPORTE, AD_GROUPS.INFRAESTRUCTURA),
  [
    body('nombre_sede').isString().trim().notEmpty(),
    body('direccion').isString().trim().notEmpty(),
    body('localidad').isString().trim().notEmpty(),
    body('provincia').isString().trim().notEmpty(),
    body('pais').optional().isString().trim(),
    body('telefono').optional().isString().trim(),
    body('email_sede').optional().isEmail().normalizeEmail(),
    body('ip_sede').optional().isIP()
  ],
  validate,
  (req, res) => controller.create(req, res)
);

// =========================
// Actualizar Sede
// =========================
router.put(
  '/:id',
  authenticate,
  requireEmpresa(),
  authorizeEmpresa(),
  authorize(AD_GROUPS.SOPORTE, AD_GROUPS.INFRAESTRUCTURA),
  [
    param('id').isUUID(),
    body('nombre_sede').optional().isString().trim(),
    body('direccion').optional().isString().trim(),
    body('localidad').optional().isString().trim(),
    body('provincia').optional().isString().trim(),
    body('pais').optional().isString().trim(),
    body('telefono').optional().isString().trim(),
    body('email_sede').optional().isEmail().normalizeEmail(),
    body('ip_sede').optional().isIP(),
    body('es_casa_central').optional().isBoolean(),
    body('activa').optional().isBoolean()
  ],
  validate,
  (req, res) => controller.update(req, res)
);

// =========================
// Eliminar Sede (solo Infra)
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
// Asignar personal a sede
// =========================
router.post(
  '/:id/personal',
  authenticate,
  requireEmpresa(),
  authorizeEmpresa(),
  authorize(AD_GROUPS.SOPORTE, AD_GROUPS.INFRAESTRUCTURA),
  [
    param('id').isUUID(),
    body('personal_id').isUUID(),
    body('rol_id').isUUID(),
    body('fecha_asignacion').optional().isISO8601().toDate()
  ],
  validate,
  (req, res) => controller.asignarPersonal(req, res)
);

// =========================
// Quitar personal de sede
// =========================
router.delete(
  '/:id/personal/:personalId',
  authenticate,
  requireEmpresa(),
  authorizeEmpresa(),
  authorize(AD_GROUPS.SOPORTE, AD_GROUPS.INFRAESTRUCTURA),
  [
    param('id').isUUID(),
    param('personalId').isUUID()
  ],
  validate,
  (req, res) => controller.quitarPersonal(req, res)
);

module.exports = router;