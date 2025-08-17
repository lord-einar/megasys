// ============================================
// backend/src/controllers/remitoController.js
// CORREGIDO: Destructuring inválido y otras correcciones
// ============================================
const remitoService = require('../services/remitoService');
const { asyncHandler } = require('../middleware/errorHandler');
const { buildPaginatedResponse } = require('../utils/helpers');
const path = require('path');
const fs = require('fs');

class RemitoController {
  /**
   * Listar remitos
   * GET /remitos
   */
  list = asyncHandler(async (req, res) => {
    const pagination = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      offset: ((parseInt(req.query.page) || 1) - 1) * (parseInt(req.query.limit) || 10)
    };
    
    const result = await remitoService.getRemitos(pagination, req.query);
    res.json(buildPaginatedResponse(
      result.data,
      result.page,
      pagination.limit,
      result.total
    ));
  });
  
  /**
   * Obtener remito por ID
   * GET /remitos/:id
   */
  getById = asyncHandler(async (req, res) => {
    const remito = await remitoService.getRemitoById(req.params.id);
    res.json({
      success: true,
      data: remito
    });
  });
  
  /**
   * Crear nuevo remito
   * POST /remitos
   */
  create = asyncHandler(async (req, res) => {
    // ← CORREGIDO: destructuring inválido const { solicitante_id, .remitoData }
    const { solicitante_id, ...remitoData } = req.body;
    
    if (!solicitante_id) {
      return res.status(400).json({
        success: false,
        message: 'El solicitante_id es requerido'
      });
    }
    
    const remito = await remitoService.createRemito(
      remitoData, 
      solicitante_id,
      req.user.id
    );
    
    res.status(201).json({
      success: true,
      data: remito,
      message: 'Remito creado correctamente'
    });
  });
  
  /**
   * Actualizar estado de remito
   * PATCH /remitos/:id/estado
   */
  updateEstado = asyncHandler(async (req, res) => {
    const { estado, observaciones, tecnico_asignado_id } = req.body;
    
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
   * Reenviar email de confirmación
   * POST /remitos/:id/reenviar-confirmacion
   */
  reenviarConfirmacion = asyncHandler(async (req, res) => {
    const result = await remitoService.reenviarConfirmacion(req.params.id);
    res.json({
      success: true,
      message: result.message
    });
  });
  
  /**
   * Confirmar recepción por token
   * GET /remitos/confirmar?token=xxx
   */
  confirmarPorToken = asyncHandler(async (req, res) => {
    const { token } = req.query;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token no proporcionado'
      });
    }
    
    const remito = await remitoService.confirmarRecepcion(token);
    
    // Redirigir al frontend con mensaje de éxito
    res.redirect(`${process.env.FRONTEND_URL}/remitos/confirmado?id=${remito.id}`);
  });
  
  /**
   * Descargar PDF de remito
   * GET /remitos/:id/pdf/:tipo
   */
  descargarPDF = asyncHandler(async (req, res) => {
    const { id, tipo } = req.params;
    
    if (!['entrega', 'confirmacion'].includes(tipo)) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de PDF inválido. Use: entrega o confirmacion'
      });
    }
    
    const remito = await remitoService.getRemitoById(id);
    
    const pdfPath = tipo === 'confirmacion' 
      ? remito.pdf_confirmacion_path 
      : remito.pdf_entrega_path;
    
    if (!pdfPath) {
      return res.status(404).json({
        success: false,
        message: `PDF de ${tipo} no encontrado`
      });
    }
    
    // Verificar que el archivo existe
    const fullPath = path.resolve(pdfPath);
    
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({
        success: false,
        message: 'Archivo PDF no encontrado en el servidor'
      });
    }
    
    // Enviar archivo
    res.download(fullPath, `remito_${remito.numero_remito}_${tipo}.pdf`);
  });
}

module.exports = new RemitoController();