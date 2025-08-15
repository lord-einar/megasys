// ============================================
// backend/src/middleware/validation.js
// ============================================
const { validationResult } = require('express-validator');

/**
 * Middleware para validar resultados de express-validator
 */
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Errores de validación',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  
  next();
};

/**
 * Validar paginación
 */
const validatePagination = (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  
  if (page < 1 || limit < 1 || limit > 100) {
    return res.status(400).json({
      success: false,
      message: 'Parámetros de paginación inválidos'
    });
  }
  
  req.pagination = {
    page,
    limit,
    offset: (page - 1) * limit
  };
  
  next();
};

module.exports = {
  validateRequest,
  validatePagination
};
