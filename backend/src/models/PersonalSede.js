// ============================================
// backend/src/models/PersonalSede.js
// ============================================
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PersonalSede = sequelize.define('personal_sede', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    autoIncrement: true
  },
  personal_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    references: {
      model: 'personal',
      key: 'id'
    }
  },
  sede_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    references: {
      model: 'sedes',
      key: 'id'
    }
  },
  rol_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    references: {
      model: 'roles',
      key: 'id'
    }
  },
  fecha_asignacion: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  fecha_fin: {
    type: DataTypes.DATE
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'personal_sede',
  indexes: [
    {
      fields: ['personal_id', 'sede_id', 'activo']
    }
  ]
});

module.exports = PersonalSede;