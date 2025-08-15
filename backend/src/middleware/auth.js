// ============================================
// backend/src/middleware/auth.js (ACTUALIZADO)
// ============================================
const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');
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
    const usuario = await Usuario.findOne({
      where: { 
        id: decoded.id,
        activo: true
      }
    });
    
    if (!usuario) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no encontrado o inactivo'
      });
    }
    
    // Actualizar último acceso
    await usuario.update({ ultimo_acceso: new Date() });
    
    // Adjuntar usuario a la request
    req.user = {
      id: usuario.id,
      email: usuario.email,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      grupos_ad_ids: usuario.grupos_ad_ids || [],
      es_super_admin: usuario.es_super_admin,
      empresas_permitidas: usuario.empresas_permitidas || []
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
 * Middleware de autorización por grupos AD (usando IDs)
 */
const authorize = (...allowedGroupIds) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'No autenticado'
      });
    }
    
    // Super admin siempre tiene acceso
    if (req.user.es_super_admin) {
      return next();
    }
    
    const userGroupIds = req.user.grupos_ad_ids || [];
    const hasPermission = allowedGroupIds.some(groupId => 
      userGroupIds.includes(groupId)
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
 * Middleware para verificar acceso a empresa específica
 */
const authorizeEmpresa = () => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'No autenticado'
      });
    }
    
    // Obtener empresa_id de params, query o body
    const empresaId = req.params.empresa_id || 
                     req.query.empresa_id || 
                     req.body.empresa_id;
    
    if (!empresaId) {
      return res.status(400).json({
        success: false,
        message: 'ID de empresa no proporcionado'
      });
    }
    
    // Super admin tiene acceso a todas las empresas
    if (req.user.es_super_admin) {
      req.empresaId = parseInt(empresaId);
      return next();
    }
    
    // Verificar si el usuario tiene acceso a esta empresa
    if (!req.user.empresas_permitidas.includes(parseInt(empresaId))) {
      logger.warn(`Usuario ${req.user.email} intentó acceder a empresa ${empresaId} sin permisos`);
      return res.status(403).json({
        success: false,
        message: 'No tiene acceso a esta empresa'
      });
    }
    
    req.empresaId = parseInt(empresaId);
    next();
  };
};

/**
 * Middleware para super admin
 */
const requireSuperAdmin = (req, res, next) => {
  if (!req.user || !req.user.es_super_admin) {
    return res.status(403).json({
      success: false,
      message: 'Acceso restringido a super administradores'
    });
  }
  next();
};

/**
 * IDs de grupos de AD (deberías obtener estos IDs de tu Azure AD)
 * Estos son ejemplos, reemplaza con los IDs reales
 */
const AD_GROUP_IDS = {
  INFRAESTRUCTURA: process.env.AD_GROUP_INFRAESTRUCTURA_ID || 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
  SOPORTE: process.env.AD_GROUP_SOPORTE_ID || 'yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy',
  MESA_AYUDA: process.env.AD_GROUP_MESA_AYUDA_ID || 'zzzzzzzz-zzzz-zzzz-zzzz-zzzzzzzzzzzz'
};

module.exports = {
  authenticate,
  authorize,
  authorizeEmpresa,
  requireSuperAdmin,
  AD_GROUP_IDS
};