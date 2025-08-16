// ============================================
// backend/src/models/Proveedor.js
// ============================================
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Proveedor = sequelize.define('proveedor', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    autoIncrement: true
  },
  nombre_empresa: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: true
  },
  direccion: {
    type: DataTypes.STRING(255)
  },
  telefono: {
    type: DataTypes.STRING(50)
  },
  ejecutivo_nombre: {
    type: DataTypes.STRING(150)
  },
  ejecutivo_email: {
    type: DataTypes.STRING(150),
    validate: {
      isEmail: true
    }
  },
  ejecutivo_telefono: {
    type: DataTypes.STRING(50)
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'proveedores'
});

module.exports = Proveedor;