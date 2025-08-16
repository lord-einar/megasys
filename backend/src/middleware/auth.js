// ============================================
// backend/src/middleware/auth.js
// Autenticación + autorización por IDs de grupo (Entra ID)
// ============================================

const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { logger } = require('../utils/logger');
const { Usuario } = require('../models');

// IDs de grupos de Entra ID desde variables de entorno
const AD_GROUPS = {
  INFRAESTRUCTURA: process.env.AD_GROUP_INFRAESTRUCTURA_ID || 'infra-guid-default',
  SOPORTE: process.env.AD_GROUP_SOPORTE_ID || 'soporte-guid-default',
  MESA_AYUDA: process.env.AD_GROUP_MESA_AYUDA_ID || 'mesa-guid-default'
};

/**
 * Middleware de autenticación
 * Verifica JWT y adjunta usuario a req.user
 */
async function authenticate(req, res, next) {
  try {
    // Extraer token del header Authorization
    const authHeader = req.headers.authorization || req.headers.Authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token no proporcionado' 
      });
    }

    const token = authHeader.substring(7); // Remover 'Bearer '
    
    // Verificar token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
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

    // Buscar usuario en BD
    const usuario = await Usuario.findByPk(decoded.id, {
      attributes: [
        'id',
        'email',
        'nombre',
        'apellido',
        'activo',
        'es_super_admin',
        'grupos_ad_ids',
        'empresas_permitidas',
        'preferencias'
      ]
    });
    
    if (!usuario) {
      return res.status(401).json({ 
        success: false, 
        message: 'Usuario no encontrado' 
      });
    }

    if (!usuario.activo) {
      return res.status(403).json({ 
        success: false, 
        message: 'Usuario deshabilitado' 
      });
    }

    // Adjuntar usuario a request
    req.user = {
      id: usuario.id,
      email: usuario.email,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      es_super_admin: usuario.es_super_admin || false,
      grupos_ad_ids: Array.isArray(usuario.grupos_ad_ids) ? usuario.grupos_ad_ids : [],
      empresas_permitidas: Array.isArray(usuario.empresas_permitidas) ? usuario.empresas_permitidas : [],
      preferencias: usuario.preferencias || {}
    };

    // Actualizar último acceso (sin bloquear)
    usuario.update({ ultimo_acceso: new Date() }).catch(err => {
      logger.warn(`No se pudo actualizar ultimo_acceso para usuario ${usuario.id}:`, err.message);
    });

    next();
  } catch (error) {
    logger.error('Error en authenticate:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error de autenticación' 
    });
  }
}

/**
 * Middleware de autorización por grupos AD
 * Uso: authorize(AD_GROUPS.INFRAESTRUCTURA, AD_GROUPS.SOPORTE)
 */
const authorize = (...allowedGroups) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          success: false, 
          message: 'No autenticado' 
        });
      }

      // Super admin tiene todos los permisos
      if (req.user.es_super_admin) {
        return next();
      }

      // Verificar si el usuario tiene alguno de los grupos permitidos
      const hasPermission = allowedGroups.some(groupId => 
        req.user.grupos_ad_ids.includes(groupId)
      );

      if (!hasPermission) {
        logger.warn(`Usuario ${req.user.email} sin permisos. Grupos requeridos: ${allowedGroups.join(', ')}`);
        return res.status(403).json({ 
          success: false, 
          message: 'Sin permisos para esta operación' 
        });
      }

      next();
    } catch (error) {
      logger.error('Error en authorize:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Error de autorización' 
      });
    }
  };
};

/**
 * Middleware para requerir todos los grupos especificados (AND)
 */
const requireAllGroups = (...requiredGroups) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          success: false, 
          message: 'No autenticado' 
        });
      }

      // Super admin bypass
      if (req.user.es_super_admin) {
        return next();
      }

      // Verificar que tenga TODOS los grupos
      const hasAllGroups = requiredGroups.every(groupId => 
        req.user.grupos_ad_ids.includes(groupId)
      );

      if (!hasAllGroups) {
        return res.status(403).json({ 
          success: false, 
          message: 'Requiere todos los permisos especificados' 
        });
      }

      next();
    } catch (error) {
      logger.error('Error en requireAllGroups:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Error de autorización' 
      });
    }
  };
};

/**
 * Middleware para establecer empresa_id en la request
 * Busca en: header 'X-Empresa-Id', params.empresa_id, body.empresa_id
 */
const requireEmpresa = () => {
  return (req, res, next) => {
    const empresaId = req.headers['x-empresa-id'] || 
                      req.params.empresa_id || 
                      req.body.empresa_id ||
                      req.query.empresa_id;

    if (!empresaId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Debe especificar una empresa (header X-Empresa-Id)' 
      });
    }

    req.empresaId = empresaId;
    next();
  };
};

/**
 * Middleware para verificar acceso a la empresa especificada
 * Debe ejecutarse después de authenticate y requireEmpresa
 */
const authorizeEmpresa = () => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          success: false, 
          message: 'No autenticado' 
        });
      }

      if (!req.empresaId) {
        return res.status(400).json({ 
          success: false, 
          message: 'Empresa no especificada (use requireEmpresa primero)' 
        });
      }

      // Super admin tiene acceso a todas las empresas
      if (req.user.es_super_admin) {
        return next();
      }

      // Verificar si el usuario tiene acceso a la empresa
      if (!req.user.empresas_permitidas.includes(req.empresaId)) {
        logger.warn(`Usuario ${req.user.email} sin acceso a empresa ${req.empresaId}`);
        return res.status(403).json({ 
          success: false, 
          message: 'Sin acceso a esta empresa' 
        });
      }

      next();
    } catch (error) {
      logger.error('Error en authorizeEmpresa:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Error de autorización' 
      });
    }
  };
};

/**
 * Middleware opcional: verificar si el usuario es owner de un recurso
 */
const isOwner = (resourceIdParam = 'id') => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          success: false, 
          message: 'No autenticado' 
        });
      }

      // Super admin puede todo
      if (req.user.es_super_admin) {
        return next();
      }

      const resourceId = req.params[resourceIdParam];
      const userId = req.user.id;

      // Aquí deberías verificar en BD si el usuario es owner del recurso
      // Por ahora, solo pasamos
      next();
    } catch (error) {
      logger.error('Error en isOwner:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Error verificando propiedad' 
      });
    }
  };
};

module.exports = {
  authenticate,
  authorize,
  requireAllGroups,
  requireEmpresa,
  authorizeEmpresa,
  isOwner,
  AD_GROUPS
};