// ============================================
// backend/src/services/sedeService.js
// ============================================
const { Sede, Personal, PersonalSede, Inventario, SedeServicio, sequelize } = require('../models');
const { AppError } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');
const { withTransaction } = require('../utils/helpers');
const { Op } = require('sequelize');

class SedeService {
  /**
   * Obtener todas las sedes con paginación
   */
  async getAllSedes(pagination, filters = {}) {
    try {
      const where = {};
      
      // Aplicar filtros
      if (filters.nombre_empresa) {
        where.nombre_empresa = { [Op.iLike]: `%${filters.nombre_empresa}%` };
      }
      if (filters.localidad) {
        where.localidad = { [Op.iLike]: `%${filters.localidad}%` };
      }
      if (filters.provincia) {
        where.provincia = filters.provincia;
      }
      
      const { count, rows } = await Sede.findAndCountAll({
        where,
        limit: pagination.limit,
        offset: pagination.offset,
        include: [
          {
            model: Personal,
            as: 'personal',
            through: { 
              attributes: [],
              where: { activo: true }
            },
            attributes: ['id', 'nombre', 'apellido', 'email']
          },
          {
            model: Inventario,
            as: 'inventarios',
            attributes: ['id']
          }
        ],
        order: [['nombre_empresa', 'ASC'], ['nombre_sede', 'ASC']]
      });
      
      return {
        data: rows,
        total: count,
        page: pagination.page,
        totalPages: Math.ceil(count / pagination.limit)
      };
    } catch (error) {
      logger.error('Error obteniendo sedes:', error);
      throw error;
    }
  }
  
  /**
   * Obtener sede por ID con relaciones completas
   */
  async getSedeById(id) {
    try {
      const sede = await Sede.findByPk(id, {
        include: [
          {
            model: Personal,
            as: 'personal',
            through: { 
              attributes: ['rol_id', 'fecha_asignacion', 'activo'],
              as: 'asignacion'
            }
          },
          {
            model: Inventario,
            as: 'inventarios',
            include: ['tipo']
          },
          {
            model: SedeServicio,
            as: 'servicios_contratados',
            include: ['servicio', 'proveedor']
          }
        ]
      });
      
      if (!sede) {
        throw new AppError('Sede no encontrada', 404);
      }
      
      return sede;
    } catch (error) {
      logger.error(`Error obteniendo sede ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Crear nueva sede
   */
  async createSede(data) {
    try {
      const sede = await Sede.create(data);
      logger.info(`Sede creada: ${sede.nombre_sede}`);
      return sede;
    } catch (error) {
      logger.error('Error creando sede:', error);
      throw error;
    }
  }
  
  /**
   * Actualizar sede
   */
  async updateSede(id, data) {
    try {
      const sede = await Sede.findByPk(id);
      
      if (!sede) {
        throw new AppError('Sede no encontrada', 404);
      }
      
      await sede.update(data);
      logger.info(`Sede actualizada: ${sede.nombre_sede}`);
      return sede;
    } catch (error) {
      logger.error(`Error actualizando sede ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Eliminar sede (soft delete si tiene relaciones)
   */
  async deleteSede(id) {
    return withTransaction(sequelize, async (transaction) => {
      const sede = await Sede.findByPk(id, {
        include: ['inventarios', 'personal'],
        transaction
      });
      
      if (!sede) {
        throw new AppError('Sede no encontrada', 404);
      }
      
      // Verificar si tiene inventarios o personal asignado
      if (sede.inventarios.length > 0 || sede.personal.length > 0) {
        throw new AppError('No se puede eliminar la sede porque tiene inventarios o personal asignado', 400);
      }
      
      await sede.destroy({ transaction });
      logger.info(`Sede eliminada: ${sede.nombre_sede}`);
      return { message: 'Sede eliminada correctamente' };
    });
  }
  
  /**
   * Asignar personal a sede
   */
  async asignarPersonal(sedeId, personalId, rolId) {
    return withTransaction(sequelize, async (transaction) => {
      // Verificar existencia de sede y personal
      const [sede, personal] = await Promise.all([
        Sede.findByPk(sedeId, { transaction }),
        Personal.findByPk(personalId, { transaction })
      ]);
      
      if (!sede || !personal) {
        throw new AppError('Sede o personal no encontrado', 404);
      }
      
      // Desactivar asignaciones anteriores
      await PersonalSede.update(
        { activo: false, fecha_fin: new Date() },
        { 
          where: { personal_id: personalId, sede_id: sedeId },
          transaction
        }
      );
      
      // Crear nueva asignación
      const asignacion = await PersonalSede.create({
        personal_id: personalId,
        sede_id: sedeId,
        rol_id: rolId,
        fecha_asignacion: new Date(),
        activo: true
      }, { transaction });
      
      logger.info(`Personal ${personalId} asignado a sede ${sedeId}`);
      return asignacion;
    });
  }
  
  /**
   * Obtener estadísticas de sede
   */
  async getSedeStats(sedeId) {
    try {
      const sede = await Sede.findByPk(sedeId);
      
      if (!sede) {
        throw new AppError('Sede no encontrada', 404);
      }
      
      const [inventarioCount, personalCount, remitosEnviados, remitosRecibidos] = await Promise.all([
        Inventario.count({ where: { sede_actual_id: sedeId } }),
        PersonalSede.count({ where: { sede_id: sedeId, activo: true } }),
        sede.countRemitos_enviados(),
        sede.countRemitos_recibidos()
      ]);
      
      return {
        sede: sede.nombre_sede,
        estadisticas: {
          inventario_total: inventarioCount,
          personal_activo: personalCount,
          remitos_enviados: remitosEnviados,
          remitos_recibidos: remitosRecibidos
        }
      };
    } catch (error) {
      logger.error(`Error obteniendo estadísticas de sede ${sedeId}:`, error);
      throw error;
    }
  }

  /**
 * Quitar personal de una sede
 */
async quitarPersonal(sedeId, personalId) {
  return withTransaction(sequelize, async (transaction) => {
    // Verificar que existe la asignación activa
    const asignacion = await PersonalSede.findOne({
      where: {
        sede_id: sedeId,
        personal_id: personalId,
        activo: true
      },
      transaction
    });
    
    if (!asignacion) {
      throw new AppError('Personal no está asignado a esta sede', 404);
    }
    
    // Desactivar la asignación
    await asignacion.update({
      activo: false,
      fecha_fin: new Date()
    }, { transaction });
    
    logger.info(`Personal ${personalId} removido de sede ${sedeId}`);
    
    return {
      message: 'Personal removido correctamente',
      asignacion
    };
  });
}
}

module.exports = new SedeService();