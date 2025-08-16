// ============================================
// backend/src/services/personalService.js
// ============================================
const { Personal, PersonalSede, Sede, Rol, sequelize } = require('../models');
const { Op } = require('sequelize');
const { AppError } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');
const { withTransaction } = require('../utils/helpers');

class PersonalService {
  /**
   * Obtener personal con filtros
   */
  async getPersonal(pagination, filters = {}) {
    try {
      const where = {};
      
      if (filters.activo !== undefined) {
        where.activo = filters.activo;
      }
      
      if (filters.search) {
        where[Op.or] = [
          { nombre: { [Op.iLike]: `%${filters.search}%` } },
          { apellido: { [Op.iLike]: `%${filters.search}%` } },
          { email: { [Op.iLike]: `%${filters.search}%` } }
        ];
      }
      
      // Si hay filtro por sede
      const include = [];
      if (filters.sede_id) {
        include.push({
          model: Sede,
          as: 'sedes_asignadas',
          where: { id: filters.sede_id },
          through: { 
            where: { activo: true },
            attributes: []
          },
          required: true
        });
      }
      
      const { count, rows } = await Personal.findAndCountAll({
        where,
        include,
        limit: pagination.limit,
        offset: pagination.offset,
        order: [['apellido', 'ASC'], ['nombre', 'ASC']]
      });
      
      return {
        data: rows,
        total: count,
        page: pagination.page
      };
    } catch (error) {
      logger.error('Error obteniendo personal:', error);
      throw error;
    }
  }
  
  /**
   * Obtener personal por ID
   */
  async getPersonalById(id) {
    try {
      const personal = await Personal.findByPk(id, {
        include: [
          {
            model: Sede,
            as: 'sedes_asignadas',
            through: { 
              attributes: ['rol_id', 'fecha_asignacion', 'activo'],
              as: 'asignacion'
            }
          }
        ]
      });
      
      if (!personal) {
        throw new AppError('Personal no encontrado', 404);
      }
      
      return personal;
    } catch (error) {
      logger.error(`Error obteniendo personal ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Crear personal
   */
  async createPersonal(data, usuarioId) {
    try {
      const personal = await Personal.create(data);
      logger.info(`Personal creado: ${personal.nombre} ${personal.apellido}`);
      return personal;
    } catch (error) {
      logger.error('Error creando personal:', error);
      throw error;
    }
  }
  
  /**
   * Actualizar personal
   */
  async updatePersonal(id, data, usuarioId) {
    try {
      const personal = await Personal.findByPk(id);
      
      if (!personal) {
        throw new AppError('Personal no encontrado', 404);
      }
      
      await personal.update(data);
      logger.info(`Personal actualizado: ${personal.nombre} ${personal.apellido}`);
      return personal;
    } catch (error) {
      logger.error(`Error actualizando personal ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Eliminar personal (soft delete)
   */
  async deletePersonal(id, usuarioId) {
    return withTransaction(sequelize, async (transaction) => {
      const personal = await Personal.findByPk(id, {
        include: ['sedes_asignadas', 'items_prestados'],
        transaction
      });
      
      if (!personal) {
        throw new AppError('Personal no encontrado', 404);
      }
      
      // Verificar si tiene items prestados
      if (personal.items_prestados && personal.items_prestados.length > 0) {
        throw new AppError('No se puede eliminar personal con items en préstamo', 400);
      }
      
      // Desactivar todas las asignaciones a sedes
      await PersonalSede.update(
        { activo: false, fecha_fin: new Date() },
        { 
          where: { personal_id: id, activo: true },
          transaction
        }
      );
      
      // Soft delete
      await personal.update({ activo: false }, { transaction });
      
      logger.info(`Personal desactivado: ${personal.nombre} ${personal.apellido}`);
      return { message: 'Personal eliminado correctamente' };
    });
  }
}

module.exports = new PersonalService();