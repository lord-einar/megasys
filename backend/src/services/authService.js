// ============================================
// backend/src/services/authService.js
// CORREGIDO: Sintaxis ...userInfo inválida
// ============================================
const jwt = require('jsonwebtoken');
const { confidentialClientApplication, SCOPES, REDIRECT_URI } = require('../config/auth');
const { Usuario, Empresa } = require('../models');
const { logger } = require('../utils/logger');

class AuthService {
  /**
   * Generar URL de autenticación de Azure AD
   */
  async getAuthUrl() {
    try {
      const authCodeUrlParameters = {
        scopes: SCOPES,
        redirectUri: REDIRECT_URI,
        prompt: 'select_account'
      };
      
      const authUrl = await confidentialClientApplication.getAuthCodeUrl(authCodeUrlParameters);
      return authUrl;
    } catch (error) {
      logger.error('Error generando URL de autenticación:', error);
      throw error;
    }
  }
  
  /**
   * Procesar callback de Azure AD
   */
  async handleCallback(code) {
    try {
      const tokenRequest = {
        code,
        scopes: SCOPES,
        redirectUri: REDIRECT_URI
      };
      
      // Obtener tokens de Azure AD
      const response = await confidentialClientApplication.acquireTokenByCode(tokenRequest);
      
      // Obtener información del usuario desde el token
      const userInfo = this.extractUserInfo(response);
      
      // Buscar o crear usuario en la base de datos
      const usuario = await this.findOrCreateUsuario(userInfo);
      
      // Generar JWT propio
      const token = this.generateJWT(usuario);
      
      return {
        usuario,
        token,
        azureToken: response.accessToken
      };
    } catch (error) {
      logger.error('Error en callback de Azure AD:', error);
      throw error;
    }
  }
  
  /**
   * Extraer información del usuario del token de Azure
   */
  extractUserInfo(tokenResponse) {
    const idToken = tokenResponse.idToken;
    const decodedToken = jwt.decode(idToken);
    
    // Extraer IDs de grupos AD (no nombres)
    const gruposIds = decodedToken.groups || [];
    
    return {
      azure_id: decodedToken.oid,
      azure_tenant_id: decodedToken.tid,
      email: decodedToken.preferred_username || decodedToken.email,
      nombre: decodedToken.given_name || decodedToken.name?.split(' ')[0],
      apellido: decodedToken.family_name || decodedToken.name?.split(' ').slice(1).join(' '),
      grupos_ad_ids: gruposIds, // Array de IDs de grupos
      foto_url: decodedToken.picture
    };
  }
  
  /**
   * Buscar o crear usuario en la base de datos
   */
  async findOrCreateUsuario(userInfo) {
    try {
      let usuario = await Usuario.findOne({
        where: { azure_id: userInfo.azure_id }
      });
      
      if (!usuario) {
        // Crear nuevo usuario - ← CORREGIDO: spread operator correcto
        usuario = await Usuario.create({
          ...userInfo,
          ultimo_acceso: new Date(),
          activo: true,
          es_super_admin: false,
          empresas_permitidas: [], // Se debe configurar manualmente
          preferencias: {
            tema: 'light',
            idioma: 'es',
            notificaciones_email: true
          }
        });
        
        logger.info(`Nuevo usuario creado: ${userInfo.email}`);
      } else {
        // Actualizar información del usuario
        await usuario.update({
          grupos_ad_ids: userInfo.grupos_ad_ids,
          foto_url: userInfo.foto_url,
          ultimo_acceso: new Date()
        });
        
        logger.info(`Usuario actualizado: ${userInfo.email}`);
      }
      
      // Verificar que el usuario tenga acceso a al menos una empresa
      if (!usuario.es_super_admin && (!usuario.empresas_permitidas || usuario.empresas_permitidas.length === 0)) {
        logger.warn(`Usuario ${usuario.email} no tiene empresas asignadas`);
        // Podemos asignar una empresa por defecto o lanzar un error
        // throw new Error('Usuario sin empresas asignadas. Contacte al administrador.');
      }
      
      return usuario;
    } catch (error) {
      logger.error('Error al buscar/crear usuario:', error);
      throw error;
    }
  }
  
  /**
   * Generar JWT propio
   */
  generateJWT(usuario) {
    const payload = {
      id: usuario.id,
      email: usuario.email,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      grupos_ad_ids: usuario.grupos_ad_ids,
      es_super_admin: usuario.es_super_admin,
      empresas_permitidas: usuario.empresas_permitidas
    };
    
    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });
  }
  
  /**
   * Verificar y renovar token
   */
  async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Verificar que el usuario sigue activo
      const usuario = await Usuario.findOne({
        where: { 
          id: decoded.id,
          activo: true
        }
      });
      
      if (!usuario) {
        throw new Error('Usuario no encontrado o inactivo');
      }
      
      return decoded;
    } catch (error) {
      logger.error('Error verificando token:', error);
      throw error;
    }
  }
  
  /**
   * Verificar si el usuario tiene acceso a una empresa específica
   */
  async verifyEmpresaAccess(usuarioId, empresaId) {
    try {
      const usuario = await Usuario.findByPk(usuarioId);
      
      if (!usuario) {
        return false;
      }
      
      // Super admin tiene acceso a todas las empresas
      if (usuario.es_super_admin) {
        return true;
      }
      
      // Verificar si la empresa está en la lista de permitidas
      return usuario.empresas_permitidas.includes(empresaId);
    } catch (error) {
      logger.error('Error verificando acceso a empresa:', error);
      return false;
    }
  }
  
  /**
   * Obtener empresas del usuario
   */
  async getUsuarioEmpresas(usuarioId) {
    try {
      const usuario = await Usuario.findByPk(usuarioId);
      
      if (!usuario) {
        throw new Error('Usuario no encontrado');
      }
      
      // Si es super admin, devolver todas las empresas
      if (usuario.es_super_admin) {
        return await Empresa.findAll({
          where: { activa: true },
          order: [['nombre', 'ASC']]
        });
      }
      
      // Si no, devolver solo las empresas permitidas
      if (usuario.empresas_permitidas && usuario.empresas_permitidas.length > 0) {
        return await Empresa.findAll({
          where: {
            id: usuario.empresas_permitidas,
            activa: true
          },
          order: [['nombre', 'ASC']]
        });
      }
      
      return [];
    } catch (error) {
      logger.error('Error obteniendo empresas del usuario:', error);
      throw error;
    }
  }
  
  /**
   * Cerrar sesión
   */
  async logout(usuarioId) {
    try {
      // Aquí podrías invalidar el token en una lista negra si lo necesitas
      logger.info(`Usuario ${usuarioId} cerró sesión`);
      return true;
    } catch (error) {
      logger.error('Error en logout:', error);
      throw error;
    }
  }
}

module.exports = new AuthService();