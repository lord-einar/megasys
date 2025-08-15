// ============================================
// backend/src/services/authService.js
// ============================================
const jwt = require('jsonwebtoken');
const { confidentialClientApplication, SCOPES, REDIRECT_URI } = require('../config/auth');
const { Personal } = require('../models');
const { logger } = require('../utils/logger');

class AuthService {

  async logChange(modelo, registroId, accion, valoresAnteriores, valoresNuevos, usuario, meta) {
    await Auditoria.create({
      tabla_afectada: modelo,
      registro_id: registroId,
      accion,
      valores_anteriores: valoresAnteriores,
      valores_nuevos: valoresNuevos,
      usuario_id: usuario.id,
      ip_usuario: meta.ip,
      user_agent: meta.userAgent,
      endpoint: meta.endpoint,
      fecha_hora: new Date()
    });
  }

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
      const user = await this.findOrCreateUser(userInfo);
      
      // Generar JWT propio
      const token = this.generateJWT(user);
      
      return {
        user,
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
    
    return {
      azure_id: decodedToken.oid,
      email: decodedToken.preferred_username || decodedToken.email,
      nombre: decodedToken.given_name || decodedToken.name?.split(' ')[0],
      apellido: decodedToken.family_name || decodedToken.name?.split(' ').slice(1).join(' '),
      grupos_ad: decodedToken.groups || [],
      foto_url: decodedToken.picture
    };
  }
  
  /**
   * Buscar o crear usuario en la base de datos
   */
  async findOrCreateUser(userInfo) {
    try {
      let user = await Personal.findOne({
        where: { azure_id: userInfo.azure_id }
      });
      
      if (!user) {
        user = await Personal.create(userInfo);
        logger.info(`Nuevo usuario creado: ${userInfo.email}`);
      } else {
        // Actualizar información del usuario
        await user.update({
          grupos_ad: userInfo.grupos_ad,
          foto_url: userInfo.foto_url
        });
      }
      
      return user;
    } catch (error) {
      logger.error('Error al buscar/crear usuario:', error);
      throw error;
    }
  }
  
  /**
   * Generar JWT propio
   */
  generateJWT(user) {
    const payload = {
      id: user.id,
      email: user.email,
      nombre: user.nombre,
      apellido: user.apellido,
      grupos_ad: user.grupos_ad
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
      const user = await Personal.findOne({
        where: { 
          id: decoded.id,
          activo: true
        }
      });
      
      if (!user) {
        throw new Error('Usuario no encontrado o inactivo');
      }
      
      return decoded;
    } catch (error) {
      logger.error('Error verificando token:', error);
      throw error;
    }
  }
  
  /**
   * Cerrar sesión
   */
  async logout(userId) {
    try {
      // Aquí podrías invalidar el token en una lista negra si lo necesitas
      logger.info(`Usuario ${userId} cerró sesión`);
      return true;
    } catch (error) {
      logger.error('Error en logout:', error);
      throw error;
    }
  }
}

module.exports = new AuthService();