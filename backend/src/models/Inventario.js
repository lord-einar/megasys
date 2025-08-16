// ============================================
// backend/src/models/Inventario.js
// ============================================
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Inventario = sequelize.define('inventario', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    autoIncrement: true
  },
  tipo_articulo_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    references: {
      model: 'tipo_articulos',
      key: 'id'
    }
  },
  marca: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  modelo: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  numero_serie: {
    type: DataTypes.STRING(150)
  },
  service_tag: {
    type: DataTypes.STRING(150),
    unique: true,
    allowNull: false
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  sede_actual_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'sedes',
      key: 'id'
    }
  },
  prestamo: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  fecha_devolucion: {
    type: DataTypes.DATE
  },
  devuelto: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  remito_prestamo_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'remitos',
      key: 'id'
    }
  },
  fecha_devolucion_extendida: {
    type: DataTypes.DATE
  },
  usuario_prestamo_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'personal',
      key: 'id'
    }
  },
  observaciones_prestamo: {
    type: DataTypes.TEXT
  },
  observaciones: {
    type: DataTypes.TEXT
  },
  fecha_ingreso: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  estado: {
    type: DataTypes.ENUM('disponible', 'en_uso', 'prestado', 'en_transito', 'en_reparacion', 'baja'),
    defaultValue: 'disponible'
  }
}, {
  tableName: 'inventario',
  indexes: [
    {
      unique: true,
      fields: ['service_tag']
    },
    {
      fields: ['sede_actual_id']
    },
    {
      fields: ['prestamo']
    },
    {
      fields: ['estado']
    }
  ]
});

module.exports = Inventario;
