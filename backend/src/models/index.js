const sequelize = require('../config/database');
const { Sequelize } = require('sequelize');

// Importar todos los modelos
const Empresa = require('./Empresa');
const Usuario = require('./Usuario');
const Sede = require('./Sede');
const Personal = require('./Personal');
const Rol = require('./Rol');
const PersonalSede = require('./PersonalSede');
const Proveedor = require('./Proveedor');
const TipoServicio = require('./TipoServicio');
const Servicio = require('./Servicio');
const SedeServicio = require('./SedeServicio');
const TipoArticulo = require('./TipoArticulo');
const Inventario = require('./Inventario');
const Remito = require('./Remito');
const RemitoInventario = require('./RemitoInventario');
const HistorialInventario = require('./HistorialInventario');
const ExtensionPrestamo = require('./ExtensionPrestamo');
const Auditoria = require('./Auditoria');

// Cargar asociaciones
require('./associations');

// Función helper para sincronizar
const syncDatabase = async (options = {}) => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a BD establecida');
    
    if (process.env.NODE_ENV === 'development' && options.force) {
      await sequelize.sync({ force: true });
      console.log('✅ BD recreada (force: true)');
    } else if (process.env.NODE_ENV === 'development' && options.alter) {
      await sequelize.sync({ alter: true });
      console.log('✅ BD sincronizada (alter: true)');
    } else {
      // En producción no hacer sync automático
      console.log('📝 Producción: use migraciones para cambios de esquema');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error conectando a BD:', error);
    throw error;
  }
};

// Exportar todo
module.exports = {
  sequelize,
  Sequelize,
  syncDatabase,
  // Modelos individuales
  Empresa,
  Usuario,
  Sede,
  Personal,
  Rol,
  PersonalSede,
  Proveedor,
  TipoServicio,
  Servicio,
  SedeServicio,
  TipoArticulo,
  Inventario,
  Remito,
  RemitoInventario,
  HistorialInventario,
  ExtensionPrestamo,
  Auditoria
};