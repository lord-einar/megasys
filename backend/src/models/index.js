// ============================================
// backend/src/models/index.js
// ============================================
const sequelize = require('../config/database');

// Importar modelos
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

// Función para sincronizar la base de datos
const syncDatabase = async (force = false) => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente.');
    
    await sequelize.sync({ force, alter: !force });
    console.log('✅ Modelos sincronizados con la base de datos.');
    
    return true;
  } catch (error) {
    console.error('❌ Error al conectar/sincronizar la base de datos:', error);
    throw error;
  }
};

// Exportar todo
module.exports = {
  sequelize,
  syncDatabase,
  // Modelos
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