// ============================================
// backend/src/controllers/dashboardController.js
// ============================================
const dashboardService = require('../services/dashboardService');
const { asyncHandler } = require('../middleware/errorHandler');

class DashboardController {
  /**
   * Obtener estadísticas generales
   */
  getStats = asyncHandler(async (req, res) => {
    const stats = await dashboardService.getGeneralStats(req.empresaId);
    res.json({
      success: true,
      data: stats
    });
  });
  
  /**
   * Obtener métricas de préstamos
   */
  getPrestamoMetrics = asyncHandler(async (req, res) => {
    const dias = req.query.dias || 30;
    const metrics = await dashboardService.getPrestamoMetrics(req.empresaId, dias);
    res.json({
      success: true,
      data: metrics
    });
  });
  
  /**
   * Obtener actividad reciente
   */
  getRecentActivity = asyncHandler(async (req, res) => {
    const limit = req.query.limit || 10;
    const activity = await dashboardService.getRecentActivity(req.empresaId, limit);
    res.json({
      success: true,
      data: activity
    });
  });
  
  /**
   * Obtener alertas del sistema
   */
  getAlerts = asyncHandler(async (req, res) => {
    const alerts = await dashboardService.getSystemAlerts(req.empresaId);
    res.json({
      success: true,
      data: alerts
    });
  });
}

module.exports = new DashboardController();