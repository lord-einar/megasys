// backend/src/controllers/authController.js
const authService = require('../services/authService');
const { asyncHandler } = require('../middleware/errorHandler');

class AuthController {
  // GET /auth/login -> redirige a Azure AD
  login = asyncHandler(async (_req, res) => {
    const authUrl = await authService.getAuthUrl();
    return res.redirect(authUrl);
  });

  // GET /auth/callback
  callback = asyncHandler(async (req, res) => {
    const { code } = req.query;
    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Código de autorización no proporcionado',
      });
    }

    const result = await authService.handleCallback(code);

    // Armar URL de éxito del FE con token + user
    const frontendBase = process.env.FRONTEND_URL || 'http://localhost:5173';
    const url = new URL('/auth/success', frontendBase);
    url.searchParams.set('token', result.token);
    url.searchParams.set('user', encodeURIComponent(JSON.stringify(result.usuario)));

    return res.redirect(url.toString());
  });

  // GET /auth/verify
  verify = asyncHandler(async (req, res) => {
    res.json({ success: true, user: req.user });
  });

  // POST /auth/logout
  logout = asyncHandler(async (req, res) => {
    await authService.logout(req.user?.id);
    res.json({ success: true, message: 'Sesión cerrada correctamente' });
  });

  // POST /auth/refresh
  refresh = asyncHandler(async (req, res) => {
    const newToken = authService.generateJWT(req.user);
    res.json({ success: true, token: newToken });
  });
}

module.exports = new AuthController();
