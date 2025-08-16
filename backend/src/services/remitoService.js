// ============================================
// backend/src/services/remitoService.js
// ============================================
const { 
  Remito,
  RemitoInventario,
  Inventario,
  HistorialInventario,
  Sede,
  Personal,
  sequelize, 
  Usuario
} = require('../models');
const { Op } = require('sequelize');
const { AppError } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');
const { withTransaction, generateRemitoNumber, generateConfirmationToken } = require('../utils/helpers');
const { REMITO_ESTADOS, INVENTARIO_ESTADOS, TIPO_MOVIMIENTO } = require('../utils/constants');
const emailService = require('./emailService');
const pdfService = require('./pdfService');  

class RemitoService {
  /**
   * Obtener remitos con filtros
   */
  async getRemitos(pagination, filters = {}) {
    try {
      const where = {};
      
      // Aplicar filtros
      if (filters.estado) {
        where.estado = filters.estado;
      }
      if (filters.sede_origen_id) {
        where.sede_origen_id = filters.sede_origen_id;
      }
      if (filters.sede_destino_id) {
        where.sede_destino_id = filters.sede_destino_id;
      }
      if (filters.fecha_desde && filters.fecha_hasta) {
        where.fecha = {
          [Op.between]: [new Date(filters.fecha_desde), new Date(filters.fecha_hasta)]
        };
      }
      if (filters.confirmado !== undefined) {
        where.pdf_confirmacion_path = filters.confirmado === 'true' 
          ? { [Op.ne]: null } 
          : { [Op.eq]: null };
      }
      
      const { count, rows } = await Remito.findAndCountAll({
        where,
        limit: pagination.limit,
        offset: pagination.offset,
        include: [
          { model: Sede, as: 'sede_origen', attributes: ['id', 'nombre_sede'] },
          { model: Sede, as: 'sede_destino', attributes: ['id', 'nombre_sede'] },
          { model: Personal, as: 'solicitante', attributes: ['id', 'nombre', 'apellido'] },
          { model: Usuario, as: 'tecnico', attributes: ['id', 'nombre', 'apellido'] }
        ],
        order: [['fecha', 'DESC']]
      });
      
      return {
        data: rows,
        total: count,
        page: pagination.page,
        totalPages: Math.ceil(count / pagination.limit)
      };
    } catch (error) {
      logger.error('Error obteniendo remitos:', error);
      throw error;
    }
  }
  
  /**
   * Obtener remito por ID con items
   */
  async getRemitoById(id) {
    try {
      const remito = await Remito.findByPk(id, {
        include: [
          { model: Sede, as: 'sede_origen' },
          { model: Sede, as: 'sede_destino' },
          { model: Personal, as: 'solicitante' },
          { model: Usuario, as: 'tecnico' },
          {
            model: Inventario,
            as: 'items',
            through: { attributes: ['cantidad', 'observaciones'] },
            include: ['tipo']
          }
        ]
      });
      
      if (!remito) {
        throw new AppError('Remito no encontrado', 404);
      }
      
      return remito;
    } catch (error) {
      logger.error(`Error obteniendo remito ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Crear nuevo remito con transacción
   */
  /**
 * Crear nuevo remito con transacción.
 * @param {Object} data - { sede_origen_id, sede_destino_id, observaciones, items: [{ inventario_id, cantidad, observaciones }] }
 * @param {String} solicitanteId - ID de Personal (solicitante)
 * @param {String} usuarioId - ID de Usuario (actor del sistema que ejecuta la acción)
 */
async createRemito(data, solicitanteId, usuarioId) {
  // Validaciones rápidas de entrada
  if (!data || !Array.isArray(data.items) || data.items.length === 0) {
    throw new AppError('Debe enviar al menos un ítem de inventario', 400);
  }
  if (!data.sede_origen_id || !data.sede_destino_id) {
    throw new AppError('Debe indicar sede de origen y destino', 400);
  }
  if (data.sede_origen_id === data.sede_destino_id) {
    throw new AppError('La sede origen y destino no pueden ser iguales', 400);
  }
  if (!solicitanteId) {
    throw new AppError('Falta el solicitante (Personal)', 400);
  }

  // 1) Crear todo dentro de la transacción
  const remito = await withTransaction(sequelize, async (transaction) => {
    // Normalizar y validar ítems
    const itemIds = data.items.map(i => i.inventario_id);
    const inventarios = await Inventario.findAll({
      where: {
        id: itemIds,
        sede_actual_id: data.sede_origen_id,
        prestamo: false,
        estado: INVENTARIO_ESTADOS.DISPONIBLE
      },
      transaction
    });

    if (inventarios.length !== itemIds.length) {
      logger.warn(
        `Intento de crear remito con items no disponibles en sede ${data.sede_origen_id}. Esperados=${itemIds.length}, hallados=${inventarios.length}`
      );
      throw new AppError('Algunos items no están disponibles en la sede origen', 400);
    }

    // Crear remito - CORREGIDO: agregar creado_por_id y tecnico_asignado_id opcional
    const nuevoRemito = await Remito.create({
      numero_remito: generateRemitoNumber(),
      fecha: new Date(),
      sede_origen_id: data.sede_origen_id,
      sede_destino_id: data.sede_destino_id,
      solicitante_id: solicitanteId,             // Personal que solicita
      creado_por_id: usuarioId,                  // Usuario del sistema que crea
      tecnico_asignado_id: data.tecnico_asignado_id || null, // Técnico opcional
      estado: REMITO_ESTADOS.PREPARADO,
      fecha_preparacion: new Date(),
      token_confirmacion: generateConfirmationToken(),
      observaciones: data.observaciones || null
    }, { transaction });

    // Crear relaciones remito-inventario, pasar a EN_TRANSITO y generar historial
    for (const it of data.items) {
      const cantidad = it.cantidad && it.cantidad > 0 ? it.cantidad : 1;

      // vínculo en tabla pivote
      await RemitoInventario.create({
        remito_id: nuevoRemito.id,
        inventario_id: it.inventario_id,
        cantidad,
        observaciones: it.observaciones || null
      }, { transaction });

      // estado del inventario a EN_TRANSITO
      await Inventario.update(
        { estado: INVENTARIO_ESTADOS.EN_TRANSITO },
        { where: { id: it.inventario_id }, transaction }
      );

      // historial (actor del sistema = usuarioId)
      await HistorialInventario.create({
        inventario_id: it.inventario_id,
        remito_id: nuevoRemito.id,
        sede_origen_id: data.sede_origen_id,
        sede_destino_id: data.sede_destino_id,
        fecha_movimiento: new Date(),
        tipo_movimiento: TIPO_MOVIMIENTO.TRANSFERENCIA,
        usuario_id: usuarioId,
        observaciones: `Remito ${nuevoRemito.numero_remito}`
      }, { transaction });
    }

    logger.info(`Remito creado (PREPARADO): ${nuevoRemito.numero_remito}`);
    return nuevoRemito;
  });

  // 2) Fuera de la transacción: generar PDF y notificar si hay técnico
  try {
    const pdfPath = await pdfService.generarRemitoPDF(remito.id);
    await remito.update({ pdf_entrega_path: pdfPath });
    logger.info(`PDF generado para remito ${remito.numero_remito}: ${pdfPath}`);
    
    // Si hay técnico asignado, notificar
    if (remito.tecnico_asignado_id) {
      const tecnico = await Usuario.findByPk(remito.tecnico_asignado_id);
      if (tecnico) {
        await emailService.sendRemitoCreado(remito, tecnico);
        logger.info(`Notificación enviada al técnico ${tecnico.email}`);
      }
    }
  } catch (pdfError) {
    logger.error(`Error post-creación para remito ${remito.id}:`, pdfError);
  }

  // 3) Devolver el remito con includes útiles
  try {
    return await this.getRemitoById(remito.id);
  } catch {
    return remito;
  }
}


  
  /**
   * Actualizar estado del remito
   */
  async updateEstadoRemito(id, nuevoEstado, usuarioId, tecnicoId = null) {
    return withTransaction(sequelize, async (transaction) => {
      const remito = await Remito.findByPk(id, {
        include: ['items', 'solicitante', 'tecnico'],
        transaction
      });
      
      if (!remito) {
        throw new AppError('Remito no encontrado', 404);
      }
      
      // Validar transición de estado
      if (!this.validarTransicionEstado(remito.estado, nuevoEstado)) {
        throw new AppError(`No se puede cambiar de ${remito.estado} a ${nuevoEstado}`, 400);
      }
      
      const updateData = { estado: nuevoEstado };
      
      // Acciones según el nuevo estado
      switch (nuevoEstado) {
        case REMITO_ESTADOS.EN_TRANSITO:
          updateData.fecha_transito = new Date();
          updateData.tecnico_asignado_id = tecnicoId || usuarioId;
          
          // Notificar al técnico
          if (tecnicoId) {
            const tecnico = await Usuario.findByPk(tecnicoId);
            await emailService.sendRemitoCreado(remito, tecnico);
          }
          break;
          
        case REMITO_ESTADOS.ENTREGADO:
          updateData.fecha_entrega = new Date();
          
          // Actualizar ubicación de items
          for (const item of remito.items) {
            await item.update({
              sede_actual_id: remito.sede_destino_id,
              estado: INVENTARIO_ESTADOS.DISPONIBLE
            }, { transaction });
          }
          
          // Enviar email de confirmación al solicitante
          await emailService.sendConfirmacionRemito(remito, remito.solicitante);
          break;
          
        case REMITO_ESTADOS.CONFIRMADO:
          updateData.fecha_confirmacion = new Date();
          // AGREGAR generación de PDF de confirmación:
          try {
            const pdfConfirmacion = await pdfService.generarConfirmacionPDF(id);
            updateData.pdf_confirmacion_path = pdfConfirmacion;
            logger.info(`PDF de confirmación generado para remito ${id}`);
          } catch (pdfError) {
            logger.error(`Error generando PDF de confirmación:`, pdfError);
          }
          break;
      }
      
      await remito.update(updateData, { transaction });
      
      logger.info(`Estado de remito ${remito.numero_remito} actualizado a ${nuevoEstado}`);
      return remito;
    });
  }
  
  /**
   * Validar transición de estado
   */
  validarTransicionEstado(estadoActual, nuevoEstado) {
    const transicionesValidas = {
      [REMITO_ESTADOS.PREPARADO]: [REMITO_ESTADOS.EN_TRANSITO],
      [REMITO_ESTADOS.EN_TRANSITO]: [REMITO_ESTADOS.ENTREGADO],
      [REMITO_ESTADOS.ENTREGADO]: [REMITO_ESTADOS.CONFIRMADO]
    };
    
    return transicionesValidas[estadoActual]?.includes(nuevoEstado) || false;
  }
  
  /**
   * Confirmar recepción por token
   */
  async confirmarRecepcion(token) {
    const remito = await Remito.findOne({
      where: { 
        token_confirmacion: token,
        estado: REMITO_ESTADOS.ENTREGADO
      }
    });
    
    if (!remito) {
      throw new AppError('Token inválido o remito ya confirmado', 400);
    }
    
    return this.updateEstadoRemito(remito.id, REMITO_ESTADOS.CONFIRMADO, remito.solicitante_id);
  }
  
  /**
   * Reenviar email de confirmación
   */
  async reenviarConfirmacion(remitoId) {
    try {
      const remito = await Remito.findByPk(remitoId, {
        include: ['solicitante']
      });
      
      if (!remito) {
        throw new AppError('Remito no encontrado', 404);
      }
      
      if (remito.estado !== REMITO_ESTADOS.ENTREGADO) {
        throw new AppError('El remito debe estar en estado entregado', 400);
      }
      
      await emailService.sendConfirmacionRemito(remito, remito.solicitante);
      logger.info(`Email de confirmación reenviado para remito ${remito.numero_remito}`);
      
      return { message: 'Email reenviado correctamente' };
    } catch (error) {
      logger.error(`Error reenviando confirmación de remito ${remitoId}:`, error);
      throw error;
    }
  }
}

module.exports = new RemitoService();