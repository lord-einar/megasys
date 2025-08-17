// ============================================
// backend/src/controllers/empresaController.js
// ============================================
const empresaService = require('../services/empresaService');
const { asyncHandler } = require('../middleware/errorHandler');
const { buildPaginatedResponse } = require('../utils/helpers');

class EmpresaController {
  /**
   * Listar todas las empresas
   * GET /empresas
   */
  list = asyncHandler(async (req, res) => {
    const pagination = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      offset: ((parseInt(req.query.page) || 1) - 1) * (parseInt(req.query.limit) || 10)
    };
    
    const result = await empresaService.getAllEmpresas(pagination, req.query);
    res.json(buildPaginatedResponse(
      result.data,
      result.page,
      pagination.limit,
      result.total
    ));
  });
  
  /**
   * Obtener empresa por ID
   * GET /empresas/:id
   */
  getById = asyncHandler(async (req, res) => {
    const empresa = await empresaService.getEmpresaById(req.params.id);
    res.json({
      success: true,
      data: empresa
    });
  });
  
  /**
   * Crear nueva empresa
   * POST /empresas
   */
  create = asyncHandler(async (req, res) => {
    const empresa = await empresaService.createEmpresa(req.body, req.user.id);
    res.status(201).json({
      success: true,
      data: empresa,
      message: 'Empresa creada correctamente'
    });
  });
  
  /**
   * Actualizar empresa
   * PUT /empresas/:id
   */
  update = asyncHandler(async (req, res) => {
    const empresa = await empresaService.updateEmpresa(
      req.params.id,
      req.body,
      req.user.id
    );
    res.json({
      success: true,
      data: empresa,
      message: 'Empresa actualizada correctamente'
    });
  });
  
  /**
   * Activar/Desactivar empresa
   * PATCH /empresas/:id/toggle
   */
  toggleStatus = asyncHandler(async (req, res) => {
    const { activa } = req.body;
    const empresa = await empresaService.toggleEmpresaStatus(
      req.params.id,
      activa,
      req.user.id
    );
    res.json({
      success: true,
      data: empresa,
      message: `Empresa ${activa ? 'activada' : 'desactivada'} correctamente`
    });
  });
  
  /**
   * Obtener estadísticas de empresa
   * GET /empresas/:id/stats
   */
  getStats = asyncHandler(async (req, res) => {
    const stats = await empresaService.getEmpresaStats(req.params.id);
    res.json({
      success: true,
      data: stats
    });
  });
  
  /**
   * Asignar usuario a empresa
   * POST /empresas/:id/usuarios
   */
  asignarUsuario = asyncHandler(async (req, res) => {
    const { usuario_id } = req.body;
    const result = await empresaService.asignarUsuario(
      req.params.id,
      usuario_id,
      req.user.id
    );
    res.json({
      success: true,
      data: result,
      message: 'Usuario asignado correctamente'
    });
  });
  
  /**
   * Quitar usuario de empresa
   * DELETE /empresas/:id/usuarios/:usuarioId
   */
  quitarUsuario = asyncHandler(async (req, res) => {
    await empresaService.quitarUsuario(
      req.params.id,
      req.params.usuarioId,
      req.user.id
    );
    res.json({
      success: true,
      message: 'Usuario removido de la empresa'
    });
  });
  
  /**
   * Listar usuarios con acceso a la empresa
   * GET /empresas/:id/usuarios
   */
  getUsuarios = asyncHandler(async (req, res) => {
    const usuarios = await empresaService.getUsuariosEmpresa(req.params.id);
    res.json({
      success: true,
      data: usuarios,
      total: usuarios.length
    });
  });
  
  /**
   * Obtener empresas del usuario actual
   * GET /empresas/mis-empresas
   */
  getMisEmpresas = asyncHandler(async (req, res) => {
    const authService = require('../services/authService');
    const empresas = await authService.getUsuarioEmpresas(req.user.id);
    res.json({
      success: true,
      data: empresas,
      total: empresas.length
    });
  });
}

module.exports = new EmpresaController();