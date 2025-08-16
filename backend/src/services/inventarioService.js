// ============================================
// backend/src/services/inventarioService.js
// ============================================
const { 
  Inventario, 
  TipoArticulo, 
  Sede, 
  Personal,
  HistorialInventario,
  ExtensionPrestamo,
  sequelize 
} = require('../models');
const { Op } = require('sequelize');
const { AppError } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');
const { withTransaction } = require('../utils/helpers');
const { INVENTARIO_ESTADOS, TIPO_MOVIMIENTO } = require('../utils/constants');

class InventarioService {
  /**
   * Obtener inventario con filtros y paginación
   */
  async getInventario(pagination, filters = {}) {
    try {
      const where = {};
      
      // Aplicar filtros
      if (filters.sede_id) {
        where.sede_actual_id = filters.sede_id;
      }
      if (filters.tipo_articulo_id) {
        where.tipo_articulo_id = filters.tipo_articulo_id;
      }
      if (filters.estado) {
        where.estado = filters.estado;
      }
      if (filters.prestamo !== undefined) {
        where.prestamo = filters.prestamo === 'true';
      }
      if (filters.search) {
        where[Op.or] = [
          { service_tag: { [Op.iLike]: `%${filters.search}%` } },
          { numero_serie: { [Op.iLike]: `%${filters.search}%` } },
          { marca: { [Op.iLike]: `%${filters.search}%` } },
          { modelo: { [Op.iLike]: `%${filters.search}%` } }
        ];
      }
      
      const { count, rows } = await Inventario.findAndCountAll({
        where,
        limit: pagination.limit,
        offset: pagination.offset,
        include: [
          {
            model: TipoArticulo,
            as: 'tipo',
            attributes: ['id', 'nombre']
          },
          {
            model: Sede,
            as: 'sede_actual',
            attributes: ['id', 'nombre_sede']
          },
          {
            model: Personal,
            as: 'usuario_prestamo',
            attributes: ['id', 'nombre', 'apellido', 'email']
          }
        ],
        order: [['created_at', 'DESC']]
      });
      
      return {
        data: rows,
        total: count,
        page: pagination.page,
        totalPages: Math.ceil(count / pagination.limit)
      };
    } catch (error) {
      logger.error('Error obteniendo inventario:', error);
      throw error;
    }
  }
  
  /**
   * Obtener item por ID con historial
   */
  async getItemById(id) {
    try {
      const item = await Inventario.findByPk(id, {
        include: [
          { model: TipoArticulo, as: 'tipo' },
          { model: Sede, as: 'sede_actual' },
          { model: Personal, as: 'usuario_prestamo' },
          { 
            model: HistorialInventario, 
            as: 'historial',
            include: ['usuario', 'sede_origen', 'sede_destino'],
            order: [['fecha_movimiento', 'DESC']],
            limit: 10
          },
          {
            model: ExtensionPrestamo,
            as: 'extensiones',
            include: ['solicitante', 'aprobador'],
            order: [['fecha_solicitud', 'DESC']]
          }
        ]
      });
      
      if (!item) {
        throw new AppError('Item no encontrado', 404);
      }
      
      return item;
    } catch (error) {
      logger.error(`Error obteniendo item ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Crear nuevo item en inventario
   */
  async createItem(data, usuarioId) {
  return withTransaction(sequelize, async (transaction) => {
    // Verificar unicidad de service_tag (si existe)
    if (data.service_tag) {
      const existente = await Inventario.findOne({
        where: { service_tag: data.service_tag },
        transaction
      });
      
      if (existente) {
        throw new AppError('El service tag ya existe', 409);
      }
    }
    
    // Crear item - CORREGIDO: era .{data}, ahora es ...data
    const item = await Inventario.create({
      ...data,  // ← AQUÍ ESTABA EL BUG
      estado: INVENTARIO_ESTADOS.DISPONIBLE
    }, { transaction });
    
    // Crear registro en historial
    await HistorialInventario.create({
      inventario_id: item.id,
      sede_destino_id: data.sede_actual_id,
      fecha_movimiento: new Date(),
      tipo_movimiento: TIPO_MOVIMIENTO.INGRESO,
      usuario_id: usuarioId,
      observaciones: 'Ingreso inicial al inventario'
    }, { transaction });
    
    logger.info(`Item creado: ${item.service_tag || item.id}`);
    return item;
  });
}
  
  /**
   * Actualizar item
   */
  async updateItem(id, data, usuarioId) {
    return withTransaction(sequelize, async (transaction) => {
      const item = await Inventario.findByPk(id, { transaction });
      
      if (!item) {
        throw new AppError('Item no encontrado', 404);
      }
      
      const oldValues = item.toJSON();
      await item.update(data, { transaction });
      
      // Si cambió de sede, registrar en historial
      if (data.sede_actual_id && data.sede_actual_id !== oldValues.sede_actual_id) {
        await HistorialInventario.create({
          inventario_id: id,
          sede_origen_id: oldValues.sede_actual_id,
          sede_destino_id: data.sede_actual_id,
          fecha_movimiento: new Date(),
          tipo_movimiento: TIPO_MOVIMIENTO.TRANSFERENCIA,
          usuario_id: usuarioId,
          observaciones: 'Transferencia manual'
        }, { transaction });
      }
      
      logger.info(`Item actualizado: ${item.service_tag}`);
      return item;
    });
  }
  
  /**
   * Marcar item como préstamo
   */
  async marcarPrestamo(id, data, usuarioId) {
    return withTransaction(sequelize, async (transaction) => {
      const item = await Inventario.findByPk(id, { lock: true, transaction });
      
      if (!item) {
        throw new AppError('Item no encontrado', 404);
      }
      
      if (item.prestamo) {
        throw new AppError('El item ya está en préstamo', 400);
      }

      const fechaDevolucion = new Date(data.fecha_devolucion);
      if (fechaDevolucion <= new Date()) {
        throw new AppError('La fecha de devolución debe ser futura', 400);
      }
      
      const usuario = await Personal.findByPk(data.usuario_prestamo_id, { transaction });
      if (!usuario || !usuario.activo) {
        throw new AppError('Usuario no válido o inactivo', 400);
      }
    
      // Actualizar item
      await item.update({
        prestamo: true,
        fecha_devolucion: data.fecha_devolucion,
        usuario_prestamo_id: data.usuario_prestamo_id,
        observaciones_prestamo: data.observaciones_prestamo,
        estado: INVENTARIO_ESTADOS.PRESTADO
      }, { transaction });
      
      // Registrar en historial
      await HistorialInventario.create({
        inventario_id: id,
        fecha_movimiento: new Date(),
        tipo_movimiento: TIPO_MOVIMIENTO.PRESTAMO,
        usuario_id: usuarioId,
        observaciones: `Préstamo a usuario ID: ${data.usuario_prestamo_id}`
      }, { transaction });
      
      logger.info(`Item ${item.service_tag} marcado como préstamo`);
      return item;
    });
  }
  
  /**
   * Devolver item de préstamo
   */
  async devolverPrestamo(id, observaciones, usuarioId) {
    return withTransaction(sequelize, async (transaction) => {
      const item = await Inventario.findByPk(id, { transaction });
      
      if (!item) {
        throw new AppError('Item no encontrado', 404);
      }
      
      if (!item.prestamo) {
        throw new AppError('El item no está en préstamo', 400);
      }
      
      // Actualizar item
      await item.update({
        prestamo: false,
        devuelto: true,
        fecha_devolucion: null,
        fecha_devolucion_extendida: null,
        usuario_prestamo_id: null,
        observaciones_prestamo: null,
        estado: INVENTARIO_ESTADOS.DISPONIBLE
      }, { transaction });
      
      // Registrar en historial
      await HistorialInventario.create({
        inventario_id: id,
        fecha_movimiento: new Date(),
        tipo_movimiento: TIPO_MOVIMIENTO.DEVOLUCION,
        usuario_id: usuarioId,
        observaciones: observaciones || 'Devolución completada'
      }, { transaction });
      
      logger.info(`Item ${item.service_tag} devuelto`);
      return item;
    });
  }
  
  /**
   * Solicitar extensión de préstamo
   */
  async solicitarExtension(id, data, solicitanteId) {
    return withTransaction(sequelize, async (transaction) => {
      const item = await Inventario.findByPk(id, { transaction });
      
      if (!item || !item.prestamo) {
        throw new AppError('Item no encontrado o no está en préstamo', 404);
      }
      
      // Crear solicitud de extensión
      const extension = await ExtensionPrestamo.create({
        inventario_id: id,
        fecha_devolucion_original: item.fecha_devolucion,
        fecha_devolucion_nueva: data.fecha_devolucion_nueva,
        motivo: data.motivo,
        solicitante_id: solicitanteId,
        estado: 'pendiente'
      }, { transaction });
      
      logger.info(`Extensión solicitada para item ${item.service_tag}`);
      return extension;
    });
  }
  
  /**
   * Obtener items próximos a vencer
   */
  async getItemsProximosVencer(dias = 7) {
    try {
      const fechaLimite = new Date();
      fechaLimite.setDate(fechaLimite.getDate() + dias);
      
      const items = await Inventario.findAll({
        where: {
          prestamo: true,
          fecha_devolucion: {
            [Op.between]: [new Date(), fechaLimite]
          }
        },
        include: [
          { model: TipoArticulo, as: 'tipo' },
          { model: Personal, as: 'usuario_prestamo' },
          { model: Sede, as: 'sede_actual' }
        ],
        order: [['fecha_devolucion', 'ASC']]
      });
      
      return items;
    } catch (error) {
      logger.error('Error obteniendo items próximos a vencer:', error);
      throw error;
    }
  }

  /**
 * Agregar método faltante: getItemsVencidos
 */
async getItemsVencidos() {
  try {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    const items = await Inventario.findAll({
      where: {
        prestamo: true,
        devuelto: false,
        fecha_devolucion: {
          [Op.lt]: hoy
        }
      },
      include: [
        { model: TipoArticulo, as: 'tipo' },
        { model: Personal, as: 'usuario_prestamo' },
        { model: Sede, as: 'sede_actual' }
      ],
      order: [['fecha_devolucion', 'ASC']]
    });
    
    return items;
  } catch (error) {
    logger.error('Error obteniendo items vencidos:', error);
    throw error;
  }
}

/**
 * Agregar método faltante: deleteItem
 */
async deleteItem(id, usuarioId) {
  return withTransaction(sequelize, async (transaction) => {
    const item = await Inventario.findByPk(id, { transaction });
    
    if (!item) {
      throw new AppError('Item no encontrado', 404);
    }
    
    // Verificar que no esté en préstamo
    if (item.prestamo) {
      throw new AppError('No se puede eliminar un item en préstamo', 400);
    }
    
    // Verificar que no esté en tránsito
    if (item.estado === INVENTARIO_ESTADOS.EN_TRANSITO) {
      throw new AppError('No se puede eliminar un item en tránsito', 400);
    }
    
    // Marcar como baja en lugar de eliminar físicamente
    await item.update({
      estado: INVENTARIO_ESTADOS.BAJA,
      activo: false
    }, { transaction });
    
    // Registrar en historial
    await HistorialInventario.create({
      inventario_id: id,
      fecha_movimiento: new Date(),
      tipo_movimiento: TIPO_MOVIMIENTO.BAJA,
      usuario_id: usuarioId,
      observaciones: 'Item dado de baja'
    }, { transaction });
    
    logger.info(`Item ${item.service_tag || item.id} dado de baja`);
    return item;
  });
}
}

module.exports = new InventarioService();