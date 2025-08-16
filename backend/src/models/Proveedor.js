const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Proveedor = sequelize.define('proveedor', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  nombre_empresa: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: true
  },
  direccion: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  telefono: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  ejecutivo_nombre: {
    type: DataTypes.STRING(150),
    allowNull: true
  },
  ejecutivo_email: {
    type: DataTypes.STRING(150),
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  ejecutivo_telefono: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'proveedores',
  timestamps: true,
  underscored: true
});

module.exports = Proveedor;