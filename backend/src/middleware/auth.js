// ============================================
// backend/src/middleware/auth.js
// Autenticación + autorización por IDs de grupo (Entra ID)
// Empresas por UUID (no parseInt), y usuario del sistema ≠ personal
// ============================================

const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { logger } = require('../utils/logger');
const db = require('../models');

// Ajusta el nombre del modelo si en tu index exporta con otro alias
const Usuario = db.Usuario || db.usuarios;

// IDs de grupos (GUIDs de Entra ID) tomados de variables de entorno
// Ej: AD_GROUP_INFRAESTRUCTURA_ID="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
const AD_GROUPS = {
  INFRAESTRUCTURA: process.env.AD_GROUP_INFRAESTRUCTURA_ID || '',
  SOPORTE: process.env.AD_GROUP_SOPORTE_ID || '',
  MESA_AYUDA: process.env.AD_GROUP_MESA_AYUDA_ID || ''
};

// ==============================
// Helpers internos
// ==============================
function extractBearerToken(req) {
  const h = req.headers['authorization'] || req.headers['Authorization'];
  if (!h) return null;
  const parts = h.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null;
  return parts[1];
}

function hasAnyGroup(userGroupIds = [], requiredIds = []) {
  if (!Array.isArray(userGroupIds)) return false;
  return requiredIds.some((id) => !!id && userGroupIds.includes(id));
}

function pickEmpresaId(req) {
  // Prioridad: header → param → body
  return (
    req.headers['x-empresa-id'] ||
    req.params?.empresa_id ||
    req.body?.empresa_id ||
    null
  );
}

// ==============================
// Middleware: authenticate
// - Verifica JWT firmado por el backend (JWT_SECRET)
// - Resuelve usuario por id_user (sub/user_id) o azure_id (oid)
// - Adjunta req.user con info necesaria
// ==============================
async function authenticate(req, res, next) {
  try {
    const token = extractBearerToken(req);
    if (!token) {
      return res.status(401).json({ success: false, message: 'Falta token Bearer' });
    }

    // Verificación de JWT local (firmado por tu backend)
    // Si usás Entra ID directamente en FE, te sugiero intercambiar por un token propio del backend en /auth/callback
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      logger.warn('JWT_SECRET no definido; no se puede verificar el token');
      return res.status(500).json({ success: false, message: 'Config de autenticación incompleta' });
    }

    let payload;
    try {
      payload = jwt.verify(token, secret);
    } catch (err) {
      logger.warn(`Token inválido: ${err?.message}`);
      return res.status(401).json({ success: false, message: 'Token inválido' });
    }

    // Intentamos resolver por id_user (sub/user_id) y/o azure_id (oid)
    const whereOr = [];
    if (payload.user_id || payload.sub) {
      whereOr.push({ id_user: payload.user_id || payload.sub });
    }
    if (payload.oid) {
      whereOr.push({ azure_id: payload.oid });
    }
    if (whereOr.length === 0) {
      // Como fallback, permitimos email si tu token lo trae
      if (payload.email) whereOr.push({ email: payload.email });
    }
    if (whereOr.length === 0) {
      return res.status(401).json({ success: false, message: 'Token sin claims suficientes' });
    }

    const user = await Usuario.findOne({
      where: { [Op.or]: whereOr },
      // Traer solo columnas necesarias para req.user (evita payload gigante)
      attributes: [
        'id_user',
        'email',
        'nombre',
        'apellido',
        'active',
        'es_super_admin',
        'grupos_ad_ids',
        'empresas_permitidas',
        'ultimo_acceso'
      ]
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Usuario no encontrado' });
    }
    if (user.active === false) {
      return res.status(403).json({ success: false, message: 'Usuario deshabilitado' });
    }

    // Adjuntamos identidad de usuario a la request
    req.user = {
      id: user.id_user, // UUID
      email: user.email,
      nombre: user.nombre,
      apellido: user.apellido,
      es_super_admin: !!user.es_super_admin,
      grupos_ad_ids: Array.isArray(user.grupos_ad_ids) ? user.grupos_ad_ids : [],
      empresas_permitidas: Array.isArray(user.empresas_permitidas) ? user.empresas_permitidas : []
    };

    // Best-effort: actualizar último acceso (no bloquear si falla)
    user.update({ ultimo_acceso: new Date() }).catch((e) => {
      logger.debug(`No se pudo actualizar ultimo_acceso: ${e?.message}`);
    });

    return next();
  } catch (err) {
    logger.error(`authenticate error: ${err?.message}`);
    return res.status(500).json({ success: false, message: 'Error de autenticación' });
  }
}

// ==============================
// Middleware: authorize(...groupIds)
// - Permite si el usuario es super admin o si posee alguno de los grupos requeridos
// Uso: authorize(AD_GROUPS.INFRAESTRUCTURA, AD_GROUPS.SOPORTE)
// ==============================
const authorize = (...allowedGroupIds) => (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'No autenticado' });
    }
    if (req.user.es_super_admin) return next();

    const ok = hasAnyGroup(req.user.grupos_ad_ids, allowedGroupIds);
    if (!ok) {
      return res.status(403).json({ success: false, message: 'Permisos insuficientes' });
    }
    return next();
  } catch (err) {
    logger.error(`authorize error: ${err?.message}`);
    return res.status(500).json({ success: false, message: 'Error de autorización' });
  }
};

// ==============================
// Middleware: requireAllGroups(...groupIds)
// - Variante "AND": exige que el usuario tenga TODOS los grupos
// ==============================
const requireAllGroups = (...requiredGroupIds) => (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'No autenticado' });
    }
    if (req.user.es_super_admin) return next();

    const groups = Array.isArray(req.user.grupos_ad_ids) ? req.user.grupos_ad_ids : [];
    const ok = requiredGroupIds.every((id) => !!id && groups.includes(id));
    if (!ok) {
      return res.status(403).json({ success: false, message: 'Permisos insuficientes' });
    }
    return next();
  } catch (err) {
    logger.error(`requireAllGroups error: ${err?.message}`);
    return res.status(500).json({ success: false, message: 'Error de autorización' });
  }
};

// ==============================
// Middleware: requireEmpresa (setea req.empresaId)
// - Lee empresa desde header X-Empresa-Id (o param/body)
// ==============================
const requireEmpresa = () => (req, res, next) => {
  const empresaId = pickEmpresaId(req);
  if (!empresaId) {
    return res.status(400).json({ success: false, message: 'Empresa no especificada (X-Empresa-Id)' });
  }
  req.empresaId = String(empresaId); // UUID en string
  return next();
};

// ==============================
// Middleware: authorizeEmpresa
// - Permite si super admin o si la empresa está en empresas_permitidas
// Debe correrse después de authenticate y requireEmpresa
// ==============================
const authorizeEmpresa = () => (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'No autenticado' });
    }
    if (!req.empresaId) {
      return res.status(400).json({ success: false, message: 'Empresa no establecida (use requireEmpresa antes)' });
    }
    if (req.user.es_super_admin) return next();

    const permitidas = Array.isArray(req.user.empresas_permitidas) ? req.user.empresas_permitidas : [];
    if (permitidas.includes(req.empresaId)) return next();

    return res.status(403).json({ success: false, message: 'Sin acceso a la empresa indicada' });
  } catch (err) {
    logger.error(`authorizeEmpresa error: ${err?.message}`);
    return res.status(500).json({ success: false, message: 'Error de autorización' });
  }
};

// Export público
module.exports = {
  authenticate,
  authorize,
  requireAllGroups,
  requireEmpresa,
  authorizeEmpresa,
  AD_GROUPS
};
