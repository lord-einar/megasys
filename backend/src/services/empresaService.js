// ============================================
// backend/src/services/empresaService.js
// ============================================
const { Empresa, Sede, Usuario, sequelize } = require('../models');
const { Op } = require('sequelize');
const { AppError } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');
const { withTransaction } = require('../utils/helpers');

class EmpresaService {
  /**
   * Obtener todas las empresas con paginación
   */
  async getAllEmpresas(pagination, filters = {}) {
    try {
      const where = {};
      
      // Aplicar filtros
      if (filters.nombre) {
        where.nombre = { [Op.iLike]: `%${filters.nombre}%` };
      }
      if (filters.razon_social) {
        where.razon_social = { [Op.iLike]: `%${filters.razon_social}%` };
      }
      if (filters.cuit) {
        where.cuit = { [Op.iLike]: `%${filters.cuit}%` };
      }
      if (filters.activa !== undefined) {
        where.activa = filters.activa;
      }
      
      const { count, rows } = await Empresa.findAndCountAll({
        where,
        limit: pagination.limit,
        offset: pagination.offset,
        include: [
          {
            model: Sede,
            as: 'sedes',
            attributes: ['id', 'nombre_sede', 'activa'],
            where: { activa: true },
            required: false
          }
        ],
        order: [['nombre', 'ASC']]
      });
      
      // Agregar estadísticas a cada empresa
      const empresasConStats = await Promise.all(
        rows.map(async (empresa) => {
          const stats = await this.getEmpresaStats(empresa.id);
          return {
            ...empresa.toJSON(),
            estadisticas: stats
          };
        })
      );
      
      return {
        data: empresasConStats,
        total: count,
        page: pagination.page,
        totalPages: Math.ceil(count / pagination.limit)
      };
    } catch (error) {
      logger.error('Error obteniendo empresas:', error);
      throw error;
    }
  }
  
  /**
   * Obtener empresa por ID
   */
  async getEmpresaById(id) {
    try {
      const empresa = await Empresa.findByPk(id, {
        include: [
          {
            model: Sede,
            as: 'sedes',
            include: [
              {
                association: 'personal_asignado',
                attributes: ['id', 'nombre', 'apellido'],
                through: { 
                  attributes: [],
                  where: { activo: true }
                },
                required: false
              }
            ]
          }
        ]
      });
      
      if (!empresa) {
        throw new AppError('Empresa no encontrada', 404);
      }
      
      // Obtener estadísticas
      const stats = await this.getEmpresaStats(id);
      
      return {
        ...empresa.toJSON(),
        estadisticas: stats
      };
    } catch (error) {
      logger.error(`Error obteniendo empresa ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Crear nueva empresa
   */
  async createEmpresa(data, usuarioId) {
    return withTransaction(sequelize, async (transaction) => {
      // Validar CUIT único
      const existente = await Empresa.findOne({
        where: { cuit: data.cuit },
        transaction
      });
      
      if (existente) {
        throw new AppError('Ya existe una empresa con este CUIT', 409);
      }
      
      const empresa = await Empresa.create({
        ...data,
        activa: true,
        configuracion: {
          colores_corporativos: {
            primario: '#2563eb',
            secundario: '#f3f4f6'
          },
          formatos_remito: {
            incluir_logo: true,
            marca_agua: true
          },
          notificaciones: {
            email_remitos: true,
            email_prestamos: true
          },
          ...data.configuracion
        }
      }, { transaction });
      
      logger.info(`Empresa creada: ${empresa.nombre} (${empresa.cuit})`);
      return empresa;
    });
  }
  
  /**
   * Actualizar empresa
   */
  async updateEmpresa(id, data, usuarioId) {
    return withTransaction(sequelize, async (transaction) => {
      const empresa = await Empresa.findByPk(id, { transaction });
      
      if (!empresa) {
        throw new AppError('Empresa no encontrada', 404);
      }
      
      // Si se actualiza el CUIT, verificar unicidad
      if (data.cuit && data.cuit !== empresa.cuit) {
        const existente = await Empresa.findOne({
          where: { 
            cuit: data.cuit,
            id: { [Op.ne]: id }
          },
          transaction
        });
        
        if (existente) {
          throw new AppError('Ya existe una empresa con este CUIT', 409);
        }
      }
      
      await empresa.update(data, { transaction });
      
      logger.info(`Empresa actualizada: ${empresa.nombre}`);
      return empresa;
    });
  }
  
  /**
   * Activar/Desactivar empresa
   */
  async toggleEmpresaStatus(id, activa, usuarioId) {
    return withTransaction(sequelize, async (transaction) => {
      const empresa = await Empresa.findByPk(id, {
        include: ['sedes'],
        transaction
      });
      
      if (!empresa) {
        throw new AppError('Empresa no encontrada', 404);
      }
      
      await empresa.update({ activa }, { transaction });
      
      // Si se desactiva la empresa, desactivar sus sedes
      if (!activa) {
        await Sede.update(
          { activa: false },
          { 
            where: { empresa_id: id },
            transaction
          }
        );
      }
      
      logger.info(`Empresa ${activa ? 'activada' : 'desactivada'}: ${empresa.nombre}`);
      return empresa;
    });
  }
  
  /**
   * Obtener estadísticas de empresa
   */
  async getEmpresaStats(empresaId) {
    try {
      const [sedesTotal, sedesActivas, usuariosConAcceso] = await Promise.all([
        Sede.count({ where: { empresa_id: empresaId } }),
        Sede.count({ where: { empresa_id: empresaId, activa: true } }),
        Usuario.count({
          where: {
            empresas_permitidas: { [Op.contains]: [empresaId] },
            activo: true
          }
        })
      ]);
      
      return {
        sedes_total: sedesTotal,
        sedes_activas: sedesActivas,
        usuarios_con_acceso: usuariosConAcceso
      };
    } catch (error) {
      logger.error(`Error obteniendo estadísticas de empresa ${empresaId}:`, error);
      return {
        sedes_total: 0,
        sedes_activas: 0,
        usuarios_con_acceso: 0
      };
    }
  }
  
  /**
   * Asignar usuario a empresa
   */
  async asignarUsuario(empresaId, usuarioId, usuarioAdmin) {
    return withTransaction(sequelize, async (transaction) => {
      const [empresa, usuario] = await Promise.all([
        Empresa.findByPk(empresaId, { transaction }),
        Usuario.findByPk(usuarioId, { transaction })
      ]);
      
      if (!empresa || !usuario) {
        throw new AppError('Empresa o usuario no encontrado', 404);
      }
      
      // Verificar si ya tiene acceso
      const empresasPermitidas = usuario.empresas_permitidas || [];
      if (empresasPermitidas.includes(empresaId)) {
        throw new AppError('El usuario ya tiene acceso a esta empresa', 400);
      }
      
      // Agregar empresa a la lista
      await usuario.update({
        empresas_permitidas: [...empresasPermitidas, empresaId]
      }, { transaction });
      
      logger.info(`Usuario ${usuario.email} asignado a empresa ${empresa.nombre}`);
      return { empresa, usuario };
    });
  }
  
  /**
   * Quitar usuario de empresa
   */
  async quitarUsuario(empresaId, usuarioId, usuarioAdmin) {
    return withTransaction(sequelize, async (transaction) => {
      const usuario = await Usuario.findByPk(usuarioId, { transaction });
      
      if (!usuario) {
        throw new AppError('Usuario no encontrado', 404);
      }
      
      const empresasPermitidas = usuario.empresas_permitidas || [];
      const nuevasEmpresas = empresasPermitidas.filter(id => id !== empresaId);
      
      await usuario.update({
        empresas_permitidas: nuevasEmpresas
      }, { transaction });
      
      logger.info(`Usuario ${usuario.email} removido de empresa ${empresaId}`);
      return usuario;
    });
  }
  
  /**
   * Obtener usuarios con acceso a la empresa
   */
  async getUsuariosEmpresa(empresaId) {
    try {
      const usuarios = await Usuario.findAll({
        where: {
          [Op.or]: [
            { empresas_permitidas: { [Op.contains]: [empresaId] } },
            { es_super_admin: true }
          ],
          activo: true
        },
        attributes: ['id', 'nombre', 'apellido', 'email', 'es_super_admin', 'ultimo_acceso'],
        order: [['apellido', 'ASC'], ['nombre', 'ASC']]
      });
      
      return usuarios;
    } catch (error) {
      logger.error(`Error obteniendo usuarios de empresa ${empresaId}:`, error);
      throw error;
    }
  }
}

module.exports = new EmpresaService();