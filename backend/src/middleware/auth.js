// ============================================
// backend/src/middleware/auth.js
// ============================================
const jwt = require('jsonwebtoken');
const { Personal } = require('../models');
const { logger } = require('../utils/logger');

/**
 * Middleware de autenticación
 */
const authenticate = async (req, res, next) => {
  try {
    const token = extractToken(req);
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token no proporcionado'
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Buscar usuario en la base de datos
    const user = await Personal.findOne({
      where: { 
        id: decoded.id,
        activo: true
      }
    });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no encontrado o inactivo'
      });
    }
    
    // Adjuntar usuario a la request
    req.user = {
      id: user.id,
      email: user.email,
      nombre: user.nombre,
      apellido: user.apellido,
      grupos_ad: user.grupos_ad || []
    };
    
    next();
  } catch (error) {
    logger.error('Error de autenticación:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado'
      });
    }
    
    return res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }
};

/**
 * Extraer token del header
 */
const extractToken = (req) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
};

/**
 * Middleware de autorización por grupos AD
 */
const authorize = (...allowedGroups) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'No autenticado'
      });
    }
    
    const userGroups = req.user.grupos_ad || [];
    const hasPermission = allowedGroups.some(group => 
      userGroups.includes(group)
    );
    
    if (!hasPermission) {
      logger.warn(`Acceso denegado para usuario ${req.user.email} a ${req.originalUrl}`);
      return res.status(403).json({
        success: false,
        message: 'No tiene permisos para realizar esta acción'
      });
    }
    
    next();
  };
};

/**
 * Grupos de AD predefinidos
 */
const AD_GROUPS = {
  INFRAESTRUCTURA: 'Infraestructura',
  SOPORTE: 'Soporte',
  MESA_AYUDA: 'Mesa de ayuda'
};

module.exports = {
  authenticate,
  authorize,
  AD_GROUPS
};
