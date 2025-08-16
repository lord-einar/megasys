// ============================================
// backend/src/controllers/sedeController.js
// CORREGIDO: Métodos alineados con las rutas
// ============================================
const sedeService = require('../services/sedeService');
const { asyncHandler } = require('../middleware/errorHandler');
const { buildPaginatedResponse } = require('../utils/helpers');

class SedeController {
  /**
   * Listar todas las sedes
   * GET /sedes
   */
  list = asyncHandler(async (req, res) => {
    const pagination = {
      page: req.query.page || 1,
      limit: req.query.limit || 10,
      offset: ((req.query.page || 1) - 1) * (req.query.limit || 10)
    };
    
    // Filtrar por empresa_id del contexto
    const filters = {
      ...req.query,
      empresa_id: req.empresaId
    };
    
    const result = await sedeService.getAllSedes(pagination, filters);
    res.json(buildPaginatedResponse(
      result.data,
      result.page,
      pagination.limit,
      result.total
    ));
  });
  
  /**
   * Obtener sede por ID
   * GET /sedes/:id
   */
  getById = asyncHandler(async (req, res) => {
    const sede = await sedeService.getSedeById(req.params.id);
    
    // Verificar que la sede pertenece a la empresa del contexto
    if (sede.empresa_id !== req.empresaId && !req.user.es_super_admin) {
      return res.status(403).json({
        success: false,
        message: 'No tiene acceso a esta sede'
      });
    }
    
    res.json({
      success: true,
      data: sede
    });
  });
  
  /**
   * Crear nueva sede
   * POST /sedes
   */
  create = asyncHandler(async (req, res) => {
    // Agregar empresa_id del contexto
    const sedeData = {
      ...req.body,
      empresa_id: req.empresaId
    };
    
    const sede = await sedeService.createSede(sedeData);
    res.status(201).json({
      success: true,
      data: sede,
      message: 'Sede creada correctamente'
    });
  });
  
  /**
   * Actualizar sede
   * PUT /sedes/:id
   */
  update = asyncHandler(async (req, res) => {
    // Verificar que la sede pertenece a la empresa
    const sedeActual = await sedeService.getSedeById(req.params.id);
    
    if (sedeActual.empresa_id !== req.empresaId && !req.user.es_super_admin) {
      return res.status(403).json({
        success: false,
        message: 'No tiene acceso a esta sede'
      });
    }
    
    const sede = await sedeService.updateSede(req.params.id, req.body);
    res.json({
      success: true,
      data: sede,
      message: 'Sede actualizada correctamente'
    });
  });
  
  /**
   * Eliminar sede
   * DELETE /sedes/:id
   */
  remove = asyncHandler(async (req, res) => {
    // Verificar que la sede pertenece a la empresa
    const sedeActual = await sedeService.getSedeById(req.params.id);
    
    if (sedeActual.empresa_id !== req.empresaId && !req.user.es_super_admin) {
      return res.status(403).json({
        success: false,
        message: 'No tiene acceso a esta sede'
      });
    }
    
    const result = await sedeService.deleteSede(req.params.id);
    res.json({
      success: true,
      message: result.message
    });
  });
  
  /**
   * Asignar personal a sede
   * POST /sedes/:id/personal
   */
  asignarPersonal = asyncHandler(async (req, res) => {
    const { personal_id, rol_id, fecha_asignacion } = req.body;
    
    const asignacion = await sedeService.asignarPersonal(
      req.params.id,
      personal_id,
      rol_id,
      fecha_asignacion
    );
    
    res.json({
      success: true,
      data: asignacion,
      message: 'Personal asignado correctamente'
    });
  });
  
  /**
   * Quitar personal de sede
   * DELETE /sedes/:id/personal/:personalId
   */
  quitarPersonal = asyncHandler(async (req, res) => {
    const result = await sedeService.quitarPersonal(
      req.params.id,
      req.params.personalId
    );
    
    res.json({
      success: true,
      message: 'Personal removido de la sede'
    });
  });
}

module.exports = new SedeController();