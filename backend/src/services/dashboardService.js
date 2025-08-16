// ============================================
// backend/src/services/dashboardService.js
// ============================================
const { 
  Sede, 
  Inventario, 
  Remito, 
  Personal,
  HistorialInventario,
  sequelize 
} = require('../models');
const { Op } = require('sequelize');
const { logger } = require('../utils/logger');

class DashboardService {
  /**
   * Obtener estadísticas generales
   */
  async getGeneralStats(empresaId) {
    try {
      // Obtener todas las sedes de la empresa
      const sedesIds = await Sede.findAll({
        where: { empresa_id: empresaId, activa: true },
        attributes: ['id']
      }).then(sedes => sedes.map(s => s.id));
      
      // Estadísticas paralelas
      const [
        totalSedes,
        totalInventario,
        totalPersonal,
        remitosEnTransito,
        itemsPrestados,
        itemsEnReparacion
      ] = await Promise.all([
        Sede.count({ where: { empresa_id: empresaId, activa: true } }),
        Inventario.count({ 
          where: { 
            sede_actual_id: sedesIds,
            activo: true 
          } 
        }),
        Personal.count({ where: { activo: true } }),
        Remito.count({ 
          where: { 
            [Op.or]: [
              { sede_origen_id: sedesIds },
              { sede_destino_id: sedesIds }
            ],
            estado: ['preparado', 'en_transito'] 
          } 
        }),
        Inventario.count({ 
          where: { 
            sede_actual_id: sedesIds,
            prestamo: true,
            devuelto: false
          } 
        }),
        Inventario.count({ 
          where: { 
            sede_actual_id: sedesIds,
            estado: 'en_reparacion'
          } 
        })
      ]);
      
      return {
        sedes: totalSedes,
        inventario: {
          total: totalInventario,
          prestados: itemsPrestados,
          en_reparacion: itemsEnReparacion
        },
        personal: totalPersonal,
        remitos_pendientes: remitosEnTransito
      };
    } catch (error) {
      logger.error('Error obteniendo estadísticas generales:', error);
      throw error;
    }
  }
  
  /**
   * Obtener métricas de préstamos
   */
  async getPrestamoMetrics(empresaId, dias = 30) {
    try {
      const fechaInicio = new Date();
      fechaInicio.setDate(fechaInicio.getDate() - dias);
      
      // Obtener sedes de la empresa
      const sedesIds = await Sede.findAll({
        where: { empresa_id: empresaId, activa: true },
        attributes: ['id']
      }).then(sedes => sedes.map(s => s.id));
      
      // Métricas de préstamos
      const [
        prestamosActivos,
        prestamosVencidos,
        prestamosProximos,
        prestamosPorDia
      ] = await Promise.all([
        // Activos
        Inventario.count({
          where: {
            sede_actual_id: sedesIds,
            prestamo: true,
            devuelto: false
          }
        }),
        
        // Vencidos
        Inventario.count({
          where: {
            sede_actual_id: sedesIds,
            prestamo: true,
            devuelto: false,
            fecha_devolucion: { [Op.lt]: new Date() }
          }
        }),
        
        // Próximos a vencer (7 días)
        Inventario.count({
          where: {
            sede_actual_id: sedesIds,
            prestamo: true,
            devuelto: false,
            fecha_devolucion: {
              [Op.between]: [
                new Date(),
                new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
              ]
            }
          }
        }),
        
        // Préstamos por día (últimos 30 días)
        HistorialInventario.findAll({
          where: {
            tipo_movimiento: 'prestamo',
            fecha_movimiento: { [Op.gte]: fechaInicio }
          },
          attributes: [
            [sequelize.fn('DATE', sequelize.col('fecha_movimiento')), 'fecha'],
            [sequelize.fn('COUNT', '*'), 'cantidad']
          ],
          group: [sequelize.fn('DATE', sequelize.col('fecha_movimiento'))],
          order: [[sequelize.fn('DATE', sequelize.col('fecha_movimiento')), 'ASC']]
        })
      ]);
      
      return {
        activos: prestamosActivos,
        vencidos: prestamosVencidos,
        proximos_vencer: prestamosProximos,
        historico: prestamosPorDia
      };
    } catch (error) {
      logger.error('Error obteniendo métricas de préstamos:', error);
      throw error;
    }
  }
  
  /**
   * Obtener actividad reciente
   */
  async getRecentActivity(empresaId, limit = 10) {
    try {
      // Obtener sedes de la empresa
      const sedesIds = await Sede.findAll({
        where: { empresa_id: empresaId, activa: true },
        attributes: ['id']
      }).then(sedes => sedes.map(s => s.id));
      
      const activity = await HistorialInventario.findAll({
        include: [
          {
            model: Inventario,
            as: 'inventario',
            where: { sede_actual_id: sedesIds },
            include: ['tipo']
          },
          { model: Sede, as: 'sede_origen' },
          { model: Sede, as: 'sede_destino' },
          { model: Usuario, as: 'usuario' }
        ],
        order: [['fecha_movimiento', 'DESC']],
        limit
      });
      
      return activity.map(a => ({
        id: a.id,
        tipo_movimiento: a.tipo_movimiento,
        fecha: a.fecha_movimiento,
        item: a.inventario ? {
          id: a.inventario.id,
          descripcion: `${a.inventario.tipo.nombre} - ${a.inventario.marca} ${a.inventario.modelo}`,
          service_tag: a.inventario.service_tag
        } : null,
        sede_origen: a.sede_origen?.nombre_sede,
        sede_destino: a.sede_destino?.nombre_sede,
        usuario: a.usuario ? `${a.usuario.nombre} ${a.usuario.apellido}` : null,
        observaciones: a.observaciones
      }));
    } catch (error) {
      logger.error('Error obteniendo actividad reciente:', error);
      throw error;
    }
  }
  
  /**
   * Obtener alertas del sistema
   */
  async getSystemAlerts(empresaId) {
    try {
      // Obtener sedes de la empresa
      const sedesIds = await Sede.findAll({
        where: { empresa_id: empresaId, activa: true },
        attributes: ['id']
      }).then(sedes => sedes.map(s => s.id));
      
      const alerts = [];
      
      // Préstamos vencidos
      const vencidos = await Inventario.count({
        where: {
          sede_actual_id: sedesIds,
          prestamo: true,
          devuelto: false,
          fecha_devolucion: { [Op.lt]: new Date() }
        }
      });
      
      if (vencidos > 0) {
        alerts.push({
          tipo: 'error',
          mensaje: `Hay ${vencidos} préstamo(s) vencido(s)`,
          accion: '/inventario/prestamos/vencidos'
        });
      }
      
      // Remitos pendientes de confirmación
      const remitosPendientes = await Remito.count({
        where: {
          [Op.or]: [
            { sede_origen_id: sedesIds },
            { sede_destino_id: sedesIds }
          ],
          estado: 'entregado',
          pdf_confirmacion_path: null
        }
      });
      
      if (remitosPendientes > 0) {
        alerts.push({
          tipo: 'warning',
          mensaje: `${remitosPendientes} remito(s) pendiente(s) de confirmación`,
          accion: '/remitos?estado=entregado'
        });
      }
      
      // Items con bajo stock (ejemplo: menos de 5 items disponibles por tipo)
      const bajoStock = await sequelize.query(`
        SELECT ta.nombre, COUNT(i.id) as cantidad
        FROM inventario i
        JOIN tipo_articulos ta ON i.tipo_articulo_id = ta.id
        WHERE i.sede_actual_id IN (:sedesIds)
          AND i.estado = 'disponible'
          AND i.activo = true
        GROUP BY ta.id, ta.nombre
        HAVING COUNT(i.id) < 5
      `, {
        replacements: { sedesIds },
        type: sequelize.QueryTypes.SELECT
      });
      
      if (bajoStock.length > 0) {
        alerts.push({
          tipo: 'info',
          mensaje: `${bajoStock.length} tipo(s) de artículo con stock bajo`,
          accion: '/inventario'
        });
      }
      
      return alerts;
    } catch (error) {
      logger.error('Error obteniendo alertas del sistema:', error);
      throw error;
    }
  }
}

module.exports = new DashboardService();