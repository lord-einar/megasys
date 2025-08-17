// backend/src/services/authService.js
const jwt = require('jsonwebtoken');
const { confidentialClientApplication, SCOPES, REDIRECT_URI } = require('../config/auth');
const { Usuario } = require('../models');
const { logger } = require('../utils/logger');

class AuthService {
  // Generar URL de autenticación
  async getAuthUrl() {
    const params = { scopes: SCOPES, redirectUri: REDIRECT_URI, prompt: 'select_account' };
    return confidentialClientApplication.getAuthCodeUrl(params);
  }

  // Procesar callback de Azure AD
  async handleCallback(code) {
    const tokenRequest = { code, scopes: SCOPES, redirectUri: REDIRECT_URI };

    // Tokens desde Azure
    const response = await confidentialClientApplication.acquireTokenByCode(tokenRequest);

    // Datos del usuario desde el idToken
    const userInfo = this.extractUserInfo(response);

    // Persistir/actualizar en BD
    const usuario = await this.findOrCreateUsuario(userInfo);

    // Nuestro JWT
    const token = this.generateJWT(usuario);

    return { usuario, token, azureToken: response.accessToken };
  }

  // Extraer información del usuario
  extractUserInfo(tokenResponse) {
    const decoded = jwt.decode(tokenResponse.idToken);
    const gruposIds = decoded?.groups || [];

    return {
      azure_id: decoded?.oid,
      azure_tenant_id: decoded?.tid,
      email: decoded?.preferred_username || decoded?.email,
      nombre: decoded?.given_name || decoded?.name?.split(' ')[0],
      apellido: decoded?.family_name || decoded?.name?.split(' ').slice(1).join(' '),
      grupos_ad_ids: gruposIds,
      foto_url: decoded?.picture,
    };
  }

  // Buscar o crear usuario
  async findOrCreateUsuario(userInfo) {
    let usuario = await Usuario.findOne({ where: { azure_id: userInfo.azure_id } });

    if (!usuario) {
      usuario = await Usuario.create({
        ...userInfo,               // 👈 CORRECTO (antes estaba ".userInfo")
        ultimo_acceso: new Date(),
        activo: true,
        es_super_admin: false,
        empresas_permitidas: [],   // se completará luego
        preferencias: { tema: 'light', idioma: 'es', notificaciones_email: true },
      });
      logger.info(`Nuevo usuario creado: ${userInfo.email}`);
    } else {
      await usuario.update({
        grupos_ad_ids: userInfo.grupos_ad_ids,
        foto_url: userInfo.foto_url,
        ultimo_acceso: new Date(),
      });
      logger.info(`Usuario actualizado: ${userInfo.email}`);
    }

    return usuario;
  }

  // Generar JWT
  generateJWT(usuario) {
    const payload = {
      id: usuario.id,
      email: usuario.email,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      es_super_admin: usuario.es_super_admin,
      empresas_permitidas: usuario.empresas_permitidas || [],
      grupos_ad_ids: usuario.grupos_ad_ids || [],
    };
    const secret = process.env.JWT_SECRET || 'dev_secret_change_me';
    return jwt.sign(payload, secret, { expiresIn: '8h' });
  }

  // Logout (no-op por ahora, pero deja huella para auditoría si lo necesitás)
  async logout(userId) {
    logger.info(`Logout de usuario ${userId || 'desconocido'}`);
    return true;
  }
}

module.exports = new AuthService();
