const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SedeServicio = sequelize.define('sede_servicio', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  sede_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'sedes',
      key: 'id'
    }
  },
  servicio_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'servicios',
      key: 'id'
    }
  },
  proveedor_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'proveedores',
      key: 'id'
    }
  },
  fecha_inicio: {
    type: DataTypes.DATE,
    allowNull: false
  },
  fecha_fin: {
    type: DataTypes.DATE,
    allowNull: true
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  observaciones: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'sede_servicios',
  timestamps: true,
  underscored: true,
  indexes: [
   {
     fields: ['sede_id', 'servicio_id', 'activo']
   }
 ]
});

module.exports = SedeServicio;