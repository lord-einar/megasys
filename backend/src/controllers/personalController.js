// ============================================
// backend/src/controllers/personalController.js
// ============================================
const personalService = require('../services/personalService');
const { asyncHandler } = require('../middleware/errorHandler');
const { buildPaginatedResponse } = require('../utils/helpers');

class PersonalController {
  /**
   * Listar personal
   */
  list = asyncHandler(async (req, res) => {
    const pagination = {
      page: req.query.page || 1,
      limit: req.query.limit || 10,
      offset: ((req.query.page || 1) - 1) * (req.query.limit || 10)
    };
    
    const filters = {
      ...req.query,
      empresa_id: req.empresaId
    };
    
    const result = await personalService.getPersonal(pagination, filters);
    res.json(buildPaginatedResponse(
      result.data,
      result.page,
      pagination.limit,
      result.total
    ));
  });
  
  /**
   * Obtener personal por ID
   */
  getById = asyncHandler(async (req, res) => {
    const personal = await personalService.getPersonalById(req.params.id);
    res.json({
      success: true,
      data: personal
    });
  });
  
  /**
   * Crear personal
   */
  create = asyncHandler(async (req, res) => {
    const personal = await personalService.createPersonal(req.body, req.user.id);
    res.status(201).json({
      success: true,
      data: personal,
      message: 'Personal creado correctamente'
    });
  });
  
  /**
   * Actualizar personal
   */
  update = asyncHandler(async (req, res) => {
    const personal = await personalService.updatePersonal(
      req.params.id,
      req.body,
      req.user.id
    );
    res.json({
      success: true,
      data: personal,
      message: 'Personal actualizado correctamente'
    });
  });
  
  /**
   * Eliminar personal
   */
  remove = asyncHandler(async (req, res) => {
    await personalService.deletePersonal(req.params.id, req.user.id);
    res.json({
      success: true,
      message: 'Personal eliminado correctamente'
    });
  });
}

module.exports = new PersonalController();
