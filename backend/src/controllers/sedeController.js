// ============================================
// backend/src/controllers/sedeController.js
// ============================================
const sedeService = require('../services/sedeService');
const { asyncHandler } = require('../middleware/errorHandler');
const { buildPaginatedResponse } = require('../utils/helpers');

class SedeController {
  /**
   * Obtener todas las sedes
   */
  getAllSedes = asyncHandler(async (req, res) => {
    const result = await sedeService.getAllSedes(req.pagination, req.query);
    res.json(buildPaginatedResponse(
      result.data,
      result.page,
      req.pagination.limit,
      result.total
    ));
  });
  
  /**
   * Obtener sede por ID
   */
  getSedeById = asyncHandler(async (req, res) => {
    const sede = await sedeService.getSedeById(req.params.id);
    res.json({
      success: true,
      data: sede
    });
  });
  
  /**
   * Crear nueva sede
   */
  createSede = asyncHandler(async (req, res) => {
    const sede = await sedeService.createSede(req.body);
    res.status(201).json({
      success: true,
      data: sede,
      message: 'Sede creada correctamente'
    });
  });
  
  /**
   * Actualizar sede
   */
  updateSede = asyncHandler(async (req, res) => {
    const sede = await sedeService.updateSede(req.params.id, req.body);
    res.json({
      success: true,
      data: sede,
      message: 'Sede actualizada correctamente'
    });
  });
  
  /**
   * Eliminar sede
   */
  deleteSede = asyncHandler(async (req, res) => {
    const result = await sedeService.deleteSede(req.params.id);
    res.json({
      success: true,
      message: result.message
    });
  });
  
  /**
   * Asignar personal a sede
   */
  asignarPersonal = asyncHandler(async (req, res) => {
    const { personalId, rolId } = req.body;
    const asignacion = await sedeService.asignarPersonal(
      req.params.id,
      personalId,
      rolId
    );
    res.json({
      success: true,
      data: asignacion,
      message: 'Personal asignado correctamente'
    });
  });
  
  /**
   * Obtener estadísticas de sede
   */
  getStats = asyncHandler(async (req, res) => {
    const stats = await sedeService.getSedeStats(req.params.id);
    res.json({
      success: true,
      data: stats
    });
  });
}

module.exports = new SedeController();