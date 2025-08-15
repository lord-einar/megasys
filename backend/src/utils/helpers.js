// ============================================
// backend/src/utils/helpers.js
// ============================================
const crypto = require('crypto');
const { format } = require('date-fns');
const { es } = require('date-fns/locale');

/**
 * Generar número de remito único
 */
const generateRemitoNumber = () => {
  const date = format(new Date(), 'yyyyMMdd');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `REM-${date}-${random}`;
};

/**
 * Generar token de confirmación
 */
const generateConfirmationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Formatear fecha en español
 */
const formatDateES = (date) => {
  return format(new Date(date), "d 'de' MMMM 'de' yyyy", { locale: es });
};

/**
 * Formatear fecha y hora en español
 */
const formatDateTimeES = (date) => {
  return format(new Date(date), "d 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es });
};

/**
 * Calcular días transcurridos
 */
const getDaysDifference = (date1, date2 = new Date()) => {
  const diffTime = Math.abs(date2 - new Date(date1));
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Validar service tag
 */
const validateServiceTag = (tag) => {
  // Formato esperado: XXX-YYYY-NNNN
  const regex = /^[A-Z0-9]{3,}-[A-Z0-9]{4,}-[A-Z0-9]{4,}$/;
  return regex.test(tag);
};

/**
 * Construir respuesta de paginación
 */
const buildPaginatedResponse = (data, page, limit, total) => {
  return {
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1
    }
  };
};

/**
 * Manejar transacciones de Sequelize
 */
const withTransaction = async (sequelize, callback) => {
  const transaction = await sequelize.transaction();
  
  try {
    const result = await callback(transaction);
    await transaction.commit();
    return result;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

/**
 * Sanitizar objeto para auditoría
 */
const sanitizeForAudit = (obj) => {
  const sanitized = { ...obj };
  delete sanitized.password;
  delete sanitized.token;
  delete sanitized.azure_secret;
  return sanitized;
};

/**
 * Obtener IP del cliente
 */
const getClientIp = (req) => {
  return req.headers['x-forwarded-for']?.split(',')[0] || 
         req.connection?.remoteAddress || 
         req.socket?.remoteAddress ||
         'unknown';
};

module.exports = {
  generateRemitoNumber,
  generateConfirmationToken,
  formatDateES,
  formatDateTimeES,
  getDaysDifference,
  validateServiceTag,
  buildPaginatedResponse,
  withTransaction,
  sanitizeForAudit,
  getClientIp
};