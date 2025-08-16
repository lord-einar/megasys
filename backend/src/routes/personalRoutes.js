const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const {
  authenticate,
  authorize,
  requireEmpresa,
  authorizeEmpresa,
  AD_GROUPS
} = require('../middleware/auth');
const controller = require('../controllers/personalController');

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

// Listar personal
router.get(
  '/',
  authenticate,
  requireEmpresa(),
  authorizeEmpresa(),
  authorize(AD_GROUPS.MESA_AYUDA, AD_GROUPS.SOPORTE, AD_GROUPS.INFRAESTRUCTURA),
  [
    query('activo').optional().isBoolean().toBoolean(),
    query('sede_id').optional().isUUID(),
    query('search').optional().isString().trim(),
    ...validatePagination
  ],
  validate,
  (req, res) => controller.list(req, res)
);

// Obtener personal por ID
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

// Crear personal
router.post(
  '/',
  authenticate,
  requireEmpresa(),
  authorizeEmpresa(),
  authorize(AD_GROUPS.SOPORTE, AD_GROUPS.INFRAESTRUCTURA),
  [
    body('nombre').isString().trim().notEmpty(),
    body('apellido').isString().trim().notEmpty(),
    body('email').optional().isEmail().normalizeEmail(),
    body('telefono').optional().isString().trim()
  ],
  validate,
  (req, res) => controller.create(req, res)
);

// Actualizar personal
router.put(
  '/:id',
  authenticate,
  requireEmpresa(),
  authorizeEmpresa(),
  authorize(AD_GROUPS.SOPORTE, AD_GROUPS.INFRAESTRUCTURA),
  [
    param('id').isUUID(),
    body('nombre').optional().isString().trim(),
    body('apellido').optional().isString().trim(),
    body('email').optional().isEmail().normalizeEmail(),
    body('telefono').optional().isString().trim(),
    body('activo').optional().isBoolean().toBoolean()
  ],
  validate,
  (req, res) => controller.update(req, res)
);

// Eliminar personal
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

module.exports = router;
