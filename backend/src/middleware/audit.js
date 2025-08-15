// ============================================
// backend/src/middleware/audit.js
// ============================================
const { Auditoria } = require('../models');
const { logger } = require('../utils/logger');

/**
 * Middleware de auditoría automática para operaciones CUD
 */
const auditMiddleware = (modelo, accion) => {
  return async (req, res, next) => {
    // Guardar la función original de res.json
    const originalJson = res.json;
    
    // Sobrescribir res.json para capturar la respuesta
    res.json = function(data) {
      // Si la operación fue exitosa, crear registro de auditoría
      if (res.statusCode >= 200 && res.statusCode < 300) {
        createAuditLog(req, modelo, accion, data);
      }
      
      // Llamar a la función original
      return originalJson.call(this, data);
    };
    
    next();
  };
};

/**
 * Crear registro de auditoría
 */
const createAuditLog = async (req, modelo, accion, responseData) => {
  try {
    const auditData = {
      tabla_afectada: modelo,
      registro_id: extractRecordId(responseData),
      accion: accion,
      valores_anteriores: req.body.oldValues || null,
      valores_nuevos: extractNewValues(accion, req.body, responseData),
      usuario_id: req.user?.id || null,
      ip_usuario: getClientIp(req),
      user_agent: req.headers['user-agent'],
      endpoint: req.originalUrl
    };
    
    await Auditoria.create(auditData);
    logger.info(`Auditoría registrada: ${accion} en ${modelo}`);
  } catch (error) {
    logger.error('Error al crear registro de auditoría:', error);
    // No interrumpir el flujo si falla la auditoría
  }
};

/**
 * Extraer ID del registro afectado
 */
const extractRecordId = (responseData) => {
  if (responseData?.data?.id) return responseData.data.id;
  if (responseData?.id) return responseData.id;
  if (Array.isArray(responseData?.data)) return 0;
  return 0;
};

/**
 * Extraer valores nuevos según la acción
 */
const extractNewValues = (accion, requestBody, responseData) => {
  if (accion === 'DELETE') return null;
  if (accion === 'CREATE') return responseData?.data || responseData;
  if (accion === 'UPDATE') return requestBody;
  return null;
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

/**
 * Middleware para auditar transacciones complejas
 */
const auditTransaction = async (req, descripcion, detalles) => {
  try {
    await Auditoria.create({
      tabla_afectada: 'TRANSACCION',
      registro_id: 0,
      accion: 'CREATE',
      valores_nuevos: {
        descripcion,
        detalles,
        timestamp: new Date()
      },
      usuario_id: req.user?.id || null,
      ip_usuario: getClientIp(req),
      user_agent: req.headers['user-agent'],
      endpoint: req.originalUrl,
      fecha_hora: new Date()
    });
  } catch (error) {
    logger.error('Error al auditar transacción:', error);
  }
};

module.exports = {
  auditMiddleware,
  auditTransaction
};