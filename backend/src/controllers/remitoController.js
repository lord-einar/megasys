// ============================================
// backend/src/controllers/remitoController.js
// ============================================
const remitoService = require('../services/remitoService');
const { asyncHandler } = require('../middleware/errorHandler');
const { buildPaginatedResponse } = require('../utils/helpers');

class RemitoController {
  /**
   * Obtener remitos
   */
  getRemitos = asyncHandler(async (req, res) => {
    const result = await remitoService.getRemitos(req.pagination, req.query);
    res.json(buildPaginatedResponse(
      result.data,
      result.page,
      req.pagination.limit,
      result.total
    ));
  });
  
  /**
   * Obtener remito por ID
   */
  getRemitoById = asyncHandler(async (req, res) => {
    const remito = await remitoService.getRemitoById(req.params.id);
    res.json({
      success: true,
      data: remito
    });
  });
  
  /**
   * Crear nuevo remito
   */
  createRemito = asyncHandler(async (req, res) => {
    const remito = await remitoService.createRemito(req.body, solicitante_id, req.user.id);
    res.status(201).json({
      success: true,
      data: remito,
      message: 'Remito creado correctamente'
    });
  });
  
  /**
   * Actualizar estado de remito
   */
  updateEstado = asyncHandler(async (req, res) => {
    const { estado, tecnico_asignado_id } = req.body;
    const remito = await remitoService.updateEstadoRemito(
      req.params.id,
      estado,
      req.user.id,
      tecnico_asignado_id
    );
    res.json({
      success: true,
      data: remito,
      message: `Estado actualizado a ${estado}`
    });
  });
  
  /**
   * Confirmar recepción
   */
  confirmarRecepcion = asyncHandler(async (req, res) => {
    const remito = await remitoService.confirmarRecepcion(req.params.token);
    
    // Redirigir al frontend con mensaje de éxito
    res.redirect(`${process.env.FRONTEND_URL}/remitos/confirmado?id=${remito.id}`);
  });
  
  /**
   * Reenviar email de confirmación
   */
  reenviarConfirmacion = asyncHandler(async (req, res) => {
    const result = await remitoService.reenviarConfirmacion(req.params.id);
    res.json({
      success: true,
      message: result.message
    });
  });
  
  /**
   * Descargar PDF de remito
   */
  descargarPDF = asyncHandler(async (req, res) => {
    const remito = await remitoService.getRemitoById(req.params.id);
    
    const pdfPath = req.query.tipo === 'confirmacion' 
      ? remito.pdf_confirmacion_path 
      : remito.pdf_entrega_path;
    
    if (!pdfPath) {
      return res.status(404).json({
        success: false,
        message: 'PDF no encontrado'
      });
    }
    
    res.download(pdfPath);
  });
}

module.exports = new RemitoController();
