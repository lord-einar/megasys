// ============================================
// backend/src/models/Rol.js
// ============================================
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Rol = sequelize.define('rol', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  descripcion: {
    type: DataTypes.TEXT
  },
  permisos: {
    type: DataTypes.JSON,
    defaultValue: {}
  }
}, {
  tableName: 'roles'
});

module.exports = Rol;
