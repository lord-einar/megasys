// ============================================
// backend/src/utils/validators.js
// CORREGIDO: UUID en lugar de INT para todas las entidades
// ============================================
const { body, param, query } = require('express-validator');

/**
 * Validadores para Sede
 */
const sedeValidators = {
  create: [
    body('nombre_sede').notEmpty().trim().isLength({ max: 100 }),
    body('direccion').notEmpty().trim().isLength({ max: 255 }),
    body('localidad').notEmpty().trim().isLength({ max: 100 }),
    body('provincia').notEmpty().trim().isLength({ max: 100 }),
    body('pais').optional().trim().isLength({ max: 100 }),
    body('telefono').optional().trim().matches(/^[\d\s\-\+\(\)]+$/),
    body('ip_sede').optional().isIP(),
    body('codigo_sede').optional().trim().isLength({ max: 20 })
  ],
  update: [
    param('id').isUUID(4), // ← CORREGIDO: UUID v4
    body('nombre_sede').optional().trim().isLength({ max: 100 }),
    body('direccion').optional().trim().isLength({ max: 255 }),
    body('localidad').optional().trim().isLength({ max: 100 }),
    body('provincia').optional().trim().isLength({ max: 100 }),
    body('telefono').optional().trim().matches(/^[\d\s\-\+\(\)]+$/),
    body('ip_sede').optional().isIP(),
    body('codigo_sede').optional().trim().isLength({ max: 20 })
  ],
  delete: [
    param('id').isUUID(4) // ← CORREGIDO: UUID v4
  ]
};

/**
 * Validadores para Personal
 */
const personalValidators = {
  create: [
    body('nombre').notEmpty().trim().isLength({ max: 100 }),
    body('apellido').notEmpty().trim().isLength({ max: 100 }),
    body('email').optional().isEmail().normalizeEmail(),
    body('telefono').optional().trim().matches(/^[\d\s\-\+\(\)]+$/)
  ],
  update: [
    param('id').isUUID(4), // ← CORREGIDO: UUID v4
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
    body('tipo_articulo_id').isUUID(4), // ← CORREGIDO: UUID v4
    body('marca').notEmpty().trim().isLength({ max: 100 }),
    body('modelo').notEmpty().trim().isLength({ max: 100 }),
    body('numero_serie').optional().trim().isLength({ max: 150 }),
    body('service_tag').optional().trim().isLength({ max: 150 }),
    body('sede_actual_id').optional().isUUID(4), // ← CORREGIDO: UUID v4
    body('observaciones').optional().trim()
  ],
  update: [
    param('id').isUUID(4), // ← CORREGIDO: UUID v4
    body('tipo_articulo_id').optional().isUUID(4), // ← CORREGIDO: UUID v4
    body('marca').optional().trim().isLength({ max: 100 }),
    body('modelo').optional().trim().isLength({ max: 100 }),
    body('numero_serie').optional().trim().isLength({ max: 150 }),
    body('service_tag').optional().trim().isLength({ max: 150 }),
    body('sede_actual_id').optional().isUUID(4), // ← CORREGIDO: UUID v4
    body('activo').optional().isBoolean(),
    body('observaciones').optional().trim()
  ],
  prestamo: [
    param('id').isUUID(4), // ← CORREGIDO: UUID v4
    body('usuario_prestamo_id').isUUID(4), // ← CORREGIDO: UUID v4
    body('fecha_devolucion').notEmpty().isISO8601(),
    body('observaciones_prestamo').optional().trim()
  ],
  devolucion: [
    param('id').isUUID(4), // ← CORREGIDO: UUID v4
    body('observaciones').optional().trim()
  ]
};

/**
 * Validadores para Remito
 */
const remitoValidators = {
  create: [
    body('sede_origen_id').isUUID(4), // ← CORREGIDO: UUID v4
    body('sede_destino_id').isUUID(4), // ← CORREGIDO: UUID v4
    body('solicitante_id').isUUID(4), // ← CORREGIDO: UUID v4
    body('tecnico_asignado_id').optional().isUUID(4), // ← CORREGIDO: UUID v4
    body('items').isArray().notEmpty(),
    body('items.*.inventario_id').isUUID(4), // ← CORREGIDO: UUID v4
    body('items.*.cantidad').optional().isInt({ min: 1 }),
    body('observaciones').optional().trim()
  ],
  updateEstado: [
    param('id').isUUID(4), // ← CORREGIDO: UUID v4
    body('estado').notEmpty().isIn(['preparado', 'en_transito', 'entregado', 'confirmado']),
    body('tecnico_asignado_id').optional().isUUID(4) // ← CORREGIDO: UUID v4
  ],
  confirmar: [
    query('token').notEmpty().isString() // Token viene por query
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
    query('sede_id').optional().isUUID(4), // ← CORREGIDO: UUID v4
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