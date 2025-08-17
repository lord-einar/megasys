// ============================================
// backend/src/utils/validators.js (ACTUALIZADO)
// CORREGIDO: UUID en lugar de INT + campos de sede removidos
// ============================================
const { body, param, query } = require('express-validator');

/**
 * Validadores para Empresa
 */
const empresaValidators = {
  create: [
    body('nombre').notEmpty().trim().isLength({ max: 150 }),
    body('razon_social').notEmpty().trim().isLength({ max: 200 }),
    body('cuit').notEmpty().trim().matches(/^[0-9]{2}-[0-9]{8}-[0-9]$/),
    body('direccion_fiscal').optional().trim().isLength({ max: 255 }),
    body('telefono_principal').optional().trim().matches(/^[\d\s\-\+\(\)]+$/),
    body('email_corporativo').optional().isEmail().normalizeEmail(),
    body('sitio_web').optional().isURL(),
    body('configuracion').optional().isObject()
  ],
  update: [
    param('id').isUUID(4),
    body('nombre').optional().trim().isLength({ max: 150 }),
    body('razon_social').optional().trim().isLength({ max: 200 }),
    body('cuit').optional().trim().matches(/^[0-9]{2}-[0-9]{8}-[0-9]$/),
    body('direccion_fiscal').optional().trim().isLength({ max: 255 }),
    body('telefono_principal').optional().trim().matches(/^[\d\s\-\+\(\)]+$/),
    body('email_corporativo').optional().isEmail().normalizeEmail(),
    body('sitio_web').optional().isURL(),
    body('configuracion').optional().isObject()
  ]
};

/**
 * Validadores para Sede (CAMPOS REMOVIDOS)
 */
const sedeValidators = {
  create: [
    body('nombre_sede').notEmpty().trim().isLength({ max: 100 }),
    body('direccion').notEmpty().trim().isLength({ max: 255 }),
    body('localidad').notEmpty().trim().isLength({ max: 100 }),
    body('provincia').notEmpty().trim().isLength({ max: 100 }),
    body('pais').optional().trim().isLength({ max: 100 }),
    body('telefono').optional().trim().matches(/^[\d\s\-\+\(\)]+$/),
    body('email_sede').optional().isEmail().normalizeEmail(),
    body('ip_sede').optional().isIP()
  ],
  update: [
    param('id').isUUID(4),
    body('nombre_sede').optional().trim().isLength({ max: 100 }),
    body('direccion').optional().trim().isLength({ max: 255 }),
    body('localidad').optional().trim().isLength({ max: 100 }),
    body('provincia').optional().trim().isLength({ max: 100 }),
    body('pais').optional().trim().isLength({ max: 100 }),
    body('telefono').optional().trim().matches(/^[\d\s\-\+\(\)]+$/),
    body('email_sede').optional().isEmail().normalizeEmail(),
    body('ip_sede').optional().isIP(),
    body('es_casa_central').optional().isBoolean(),
    body('activa').optional().isBoolean()
  ],
  delete: [
    param('id').isUUID(4)
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
    param('id').isUUID(4),
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
    body('tipo_articulo_id').isUUID(4),
    body('marca').notEmpty().trim().isLength({ max: 100 }),
    body('modelo').notEmpty().trim().isLength({ max: 100 }),
    body('numero_serie').optional().trim().isLength({ max: 150 }),
    body('service_tag').optional().trim().isLength({ max: 150 }),
    body('sede_actual_id').optional().isUUID(4),
    body('observaciones').optional().trim()
  ],
  update: [
    param('id').isUUID(4),
    body('tipo_articulo_id').optional().isUUID(4),
    body('marca').optional().trim().isLength({ max: 100 }),
    body('modelo').optional().trim().isLength({ max: 100 }),
    body('numero_serie').optional().trim().isLength({ max: 150 }),
    body('service_tag').optional().trim().isLength({ max: 150 }),
    body('sede_actual_id').optional().isUUID(4),
    body('activo').optional().isBoolean(),
    body('observaciones').optional().trim()
  ],
  prestamo: [
    param('id').isUUID(4),
    body('usuario_prestamo_id').isUUID(4),
    body('fecha_devolucion').notEmpty().isISO8601(),
    body('observaciones_prestamo').optional().trim()
  ],
  devolucion: [
    param('id').isUUID(4),
    body('observaciones').optional().trim()
  ]
};

/**
 * Validadores para Remito
 */
const remitoValidators = {
  create: [
    body('sede_origen_id').isUUID(4),
    body('sede_destino_id').isUUID(4),
    body('solicitante_id').isUUID(4),
    body('tecnico_asignado_id').optional().isUUID(4),
    body('items').isArray().notEmpty(),
    body('items.*.inventario_id').isUUID(4),
    body('items.*.cantidad').optional().isInt({ min: 1 }),
    body('observaciones').optional().trim()
  ],
  updateEstado: [
    param('id').isUUID(4),
    body('estado').notEmpty().isIn(['preparado', 'en_transito', 'entregado', 'confirmado']),
    body('tecnico_asignado_id').optional().isUUID(4)
  ],
  confirmar: [
    query('token').notEmpty().isString()
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
    query('sede_id').optional().isUUID(4),
    query('activo').optional().isBoolean()
  ]
};

module.exports = {
  empresaValidators,
  sedeValidators,
  personalValidators,
  inventarioValidators,
  remitoValidators,
  queryValidators
};