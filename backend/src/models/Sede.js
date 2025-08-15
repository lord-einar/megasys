// ============================================
// backend/src/models/Sede.js
// ============================================
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Sede = sequelize.define('sede', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre_empresa: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  nombre_sede: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  direccion: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  localidad: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  provincia: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  pais: {
    type: DataTypes.STRING(100),
    allowNull: false,
    defaultValue: 'Argentina'
  },
  telefono: {
    type: DataTypes.STRING(50)
  },
  ip_sede: {
    type: DataTypes.STRING(45)
  }
}, {
  tableName: 'sedes',
  indexes: [
    {
      unique: true,
      fields: ['nombre_empresa', 'nombre_sede']
    }
  ]
});

module.exports = Sede;