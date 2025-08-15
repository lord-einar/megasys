// ============================================
// backend/src/utils/validators.js
// ============================================
const { body, param, query } = require('express-validator');

/**
 * Validadores para Sede
 */
const sedeValidators = {
  create: [
    body('nombre_empresa').notEmpty().trim().isLength({ max: 100 }),
    body('nombre_sede').notEmpty().trim().isLength({ max: 100 }),
    body('direccion').notEmpty().trim().isLength({ max: 255 }),
    body('localidad').notEmpty().trim().isLength({ max: 100 }),
    body('provincia').notEmpty().trim().isLength({ max: 100 }),
    body('pais').optional().trim().isLength({ max: 100 }),
    body('telefono').optional().trim().matches(/^[\d\s\-\+\(\)]+$/),
    body('ip_sede').optional().isIP()
  ],
  delete: [
    param('id').isInt()
    ],
  update: [
    param('id').isInt(),
    body('nombre_empresa').optional().trim().isLength({ max: 100 }),
    body('nombre_sede').optional().trim().isLength({ max: 100 }),
    body('direccion').optional().trim().isLength({ max: 255 }),
    body('localidad').optional().trim().isLength({ max: 100 }),
    body('provincia').optional().trim().isLength({ max: 100 }),
    body('telefono').optional().trim().matches(/^[\d\s\-\+\(\)]+$/),
    body('ip_sede').optional().isIP()
  ]
};


/**
 * Validadores para Personal
 */
const personalValidators = {
  create: [
    body('nombre').notEmpty().trim().isLength({ max: 100 }),
    body('apellido').notEmpty().trim().isLength({ max: 100 }),
    body('email').notEmpty().isEmail().normalizeEmail(),
    body('telefono').optional().trim().matches(/^[\d\s\-\+\(\)]+$/)
  ],
  update: [
    param('id').isInt(),
    body('nombre').optional().trim().isLength({ max: 100 }),
    body('apellido').optional().trim().isLength({ max: 100 }),
    body('email').optional().isEmail().normalizeEmail(),
    body('telefono').optional().trim().matches(/^[\d\s\-\+\(\)]+$/),
    body('activo').optional().isBoolean()
  ]
};


/**
 * Validadores para Inventario
 */
const inventarioValidators = {
  create: [
    body('tipo_articulo_id').notEmpty().isInt(),
    body('marca').notEmpty().trim().isLength({ max: 100 }),
    body('modelo').notEmpty().trim().isLength({ max: 100 }),
    body('numero_serie').optional().trim().isLength({ max: 150 }),
    body('service_tag').notEmpty().trim().isLength({ max: 150 }),
    body('sede_actual_id').optional().isInt(),
    body('observaciones').optional().trim()
  ],
  update: [
    param('id').isInt(),
    body('tipo_articulo_id').optional().isInt(),
    body('marca').optional().trim().isLength({ max: 100 }),
    body('modelo').optional().trim().isLength({ max: 100 }),
    body('numero_serie').optional().trim().isLength({ max: 150 }),
    body('service_tag').optional().trim().isLength({ max: 150 }),
    body('sede_actual_id').optional().isInt(),
    body('activo').optional().isBoolean(),
    body('observaciones').optional().trim()
  ],
  prestamo: [
    param('id').isInt(),
    body('usuario_prestamo_id').notEmpty().isInt(),
    body('fecha_devolucion').notEmpty().isISO8601(),
    body('observaciones_prestamo').optional().trim()
  ],
  devolucion: [
    param('id').isInt(),
    body('observaciones').optional().trim()
  ]
};

/**
 * Validadores para Remito
 */
const remitoValidators = {
  create: [
    body('sede_origen_id').notEmpty().isInt(),
    body('sede_destino_id').notEmpty().isInt(),
    body('items').isArray().notEmpty(),
    body('items.*.inventario_id').notEmpty().isInt(),
    body('items.*.cantidad').optional().isInt({ min: 1 }),
    body('observaciones').optional().trim()
  ],
  updateEstado: [
    param('id').isInt(),
    body('estado').notEmpty().isIn(['preparado', 'en_transito', 'entregado', 'confirmado']),
    body('tecnico_asignado_id').optional().isInt()
  ],
  confirmar: [
    param('token').notEmpty().isString()
  ]
};

/**
 * Validadores para queries comunes
 */
const queryValidators = {
  pagination: [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 })
  ],
  search: [
    query('search').optional().trim().isLength({ min: 1, max: 100 })
  ],
  dateRange: [
    query('fecha_desde').optional().isISO8601(),
    query('fecha_hasta').optional().isISO8601()
  ],
  filters: [
    query('estado').optional().trim(),
    query('sede_id').optional().isInt(),
    query('activo').optional().isBoolean()
  ]
};

module.exports = {
  sedeValidators,
  personalValidators,
  inventarioValidators,
  remitoValidators,
  queryValidators
};