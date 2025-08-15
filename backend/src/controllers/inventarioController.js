// ============================================
// backend/src/controllers/inventarioController.js
// ============================================
const inventarioService = require('../services/inventarioService');
const { asyncHandler } = require('../middleware/errorHandler');
const { buildPaginatedResponse } = require('../utils/helpers');

class InventarioController {
  /**
   * Obtener inventario
   */
  getInventario = asyncHandler(async (req, res) => {
    const result = await inventarioService.getInventario(req.pagination, req.query);
    res.json(buildPaginatedResponse(
      result.data,
      result.page,
      req.pagination.limit,
      result.total
    ));
  });
  
  /**
   * Obtener item por ID
   */
  getItemById = asyncHandler(async (req, res) => {
    const item = await inventarioService.getItemById(req.params.id);
    res.json({
      success: true,
      data: item
    });
  });
  
  /**
   * Crear nuevo item
   */
  createItem = asyncHandler(async (req, res) => {
    const item = await inventarioService.createItem(req.body, req.user.id);
    res.status(201).json({
      success: true,
      data: item,
      message: 'Item creado correctamente'
    });
  });
  
  /**
   * Actualizar item
   */
  updateItem = asyncHandler(async (req, res) => {
    const item = await inventarioService.updateItem(
      req.params.id,
      req.body,
      req.user.id
    );
    res.json({
      success: true,
      data: item,
      message: 'Item actualizado correctamente'
    });
  });
  
  /**
   * Marcar como préstamo
   */
  marcarPrestamo = asyncHandler(async (req, res) => {
    const item = await inventarioService.marcarPrestamo(
      req.params.id,
      req.body,
      req.user.id
    );
    res.json({
      success: true,
      data: item,
      message: 'Item marcado como préstamo'
    });
  });
  
  /**
   * Devolver préstamo
   */
  devolverPrestamo = asyncHandler(async (req, res) => {
    const item = await inventarioService.devolverPrestamo(
      req.params.id,
      req.body.observaciones,
      req.user.id
    );
    res.json({
      success: true,
      data: item,
      message: 'Préstamo devuelto correctamente'
    });
  });
  
  /**
   * Solicitar extensión
   */
  solicitarExtension = asyncHandler(async (req, res) => {
    const extension = await inventarioService.solicitarExtension(
      req.params.id,
      req.body,
      req.user.id
    );
    res.json({
      success: true,
      data: extension,
      message: 'Extensión solicitada correctamente'
    });
  });
  
  /**
   * Obtener items próximos a vencer
   */
  getProximosVencer = asyncHandler(async (req, res) => {
    const dias = req.query.dias || 7;
    const items = await inventarioService.getItemsProximosVencer(dias);
    res.json({
      success: true,
      data: items,
      total: items.length
    });
  });
}

module.exports = new InventarioController();