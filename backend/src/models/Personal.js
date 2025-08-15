// ============================================
// backend/src/models/Personal.js
// ============================================
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Personal = sequelize.define('personal', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  apellido: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  telefono: {
    type: DataTypes.STRING(50)
  },
  azure_id: {
    type: DataTypes.STRING(255),
    unique: true
  },
  foto_url: {
    type: DataTypes.STRING(500)
  },
  grupos_ad: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'personal',
  indexes: [
    {
      fields: ['email']
    },
    {
      fields: ['azure_id']
    }
  ]
});

module.exports = Personal;