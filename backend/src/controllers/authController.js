// ============================================
// backend/src/controllers/authController.js
// ============================================
const authService = require('../services/authService');
const { asyncHandler } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');

class AuthController {
  /**
   * Iniciar proceso de login con Azure AD
   */
  login = asyncHandler(async (req, res) => {
    const authUrl = await authService.getAuthUrl();
    res.json({
      success: true,
      authUrl
    });
  });
  
  /**
   * Callback de Azure AD
   */
  callback = asyncHandler(async (req, res) => {
    const { code } = req.query;
    
    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Código de autorización no proporcionado'
      });
    }
    
    const result = await authService.handleCallback(code);
    
    // Redirigir al frontend con el token
    const frontendUrl = `${process.env.FRONTEND_URL}/auth/success?token=${result.token}`;
    res.redirect(frontendUrl);
  });
  
  /**
   * Verificar token actual
   */
  verify = asyncHandler(async (req, res) => {
    res.json({
      success: true,
      user: req.user
    });
  });
  
  /**
   * Cerrar sesión
   */
  logout = asyncHandler(async (req, res) => {
    await authService.logout(req.user.id);
    res.json({
      success: true,
      message: 'Sesión cerrada correctamente'
    });
  });
  
  /**
   * Refrescar token
   */
  refresh = asyncHandler(async (req, res) => {
    const newToken = authService.generateJWT(req.user);
    res.json({
      success: true,
      token: newToken
    });
  });
}

module.exports = new AuthController();