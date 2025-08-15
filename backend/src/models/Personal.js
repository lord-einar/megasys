// ============================================
// backend/src/models/Personal.js (ACTUALIZADO)
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
    validate: {
      isEmail: true
    }
  },
  telefono: {
    type: DataTypes.STRING(50)
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'personal',
  comment: 'Personal que trabaja en las sedes (no son usuarios del sistema)'
});

module.exports = Personal;