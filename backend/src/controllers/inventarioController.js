// ============================================
// backend/src/controllers/inventarioController.js
// CORREGIDO: Métodos alineados con las rutas
// ============================================
const inventarioService = require('../services/inventarioService');
const { asyncHandler } = require('../middleware/errorHandler');
const { buildPaginatedResponse } = require('../utils/helpers');

class InventarioController {
  /**
   * Listar inventario con paginación
   * GET /inventario
   */
  list = asyncHandler(async (req, res) => {
    const pagination = {
      page: req.query.page || 1,
      limit: req.query.limit || 10,
      offset: ((req.query.page || 1) - 1) * (req.query.limit || 10)
    };
    
    const result = await inventarioService.getInventario(pagination, req.query);
    res.json(buildPaginatedResponse(
      result.data,
      result.page,
      req.pagination.limit,
      result.total
    ));
  });
  
  /**
   * Obtener item por ID
   * GET /inventario/:id
   */
  getById = asyncHandler(async (req, res) => {
    const item = await inventarioService.getItemById(req.params.id);
    res.json({
      success: true,
      data: item
    });
  });
  
  /**
   * Crear nuevo item
   * POST /inventario
   */
  create = asyncHandler(async (req, res) => {
    // Agregar empresa_id al body
    const data = {
      ...req.body,
      empresa_id: req.empresaId
    };
    
    const item = await inventarioService.createItem(data, req.user.id);
    res.status(201).json({
      success: true,
      data: item,
      message: 'Item creado correctamente'
    });
  });
  
  /**
   * Actualizar item
   * PUT /inventario/:id
   */
  update = asyncHandler(async (req, res) => {
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
   * Eliminar item
   * DELETE /inventario/:id
   */
  remove = asyncHandler(async (req, res) => {
    await inventarioService.deleteItem(req.params.id, req.user.id);
    res.json({
      success: true,
      message: 'Item eliminado correctamente'
    });
  });
  
  /**
   * Marcar como préstamo
   * POST /inventario/:id/prestamo
   */
  prestar = asyncHandler(async (req, res) => {
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
   * POST /inventario/:id/devolucion
   */
  devolver = asyncHandler(async (req, res) => {
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
   * Obtener items próximos a vencer
   * GET /inventario/prestamos/proximos
   */
  proximosVencer = asyncHandler(async (req, res) => {
    const dias = req.query.dias || 7;
    const items = await inventarioService.getItemsProximosVencer(dias);
    res.json({
      success: true,
      data: items,
      total: items.length
    });
  });
  
  /**
   * Obtener items vencidos
   * GET /inventario/prestamos/vencidos
   */
  vencidos = asyncHandler(async (req, res) => {
    const items = await inventarioService.getItemsVencidos();
    res.json({
      success: true,
      data: items,
      total: items.length
    });
  });
}

module.exports = new InventarioController();