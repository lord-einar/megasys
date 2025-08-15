// ============================================
// backend/src/models/Servicio.js
// ============================================
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Servicio = sequelize.define('servicio', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre_servicio: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  tipo_servicio_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'tipo_servicios',
      key: 'id'
    }
  },
  soporte_nivel1_email: {
    type: DataTypes.STRING(150),
    validate: {
      isEmail: true
    }
  },
  soporte_nivel1_telefono: {
    type: DataTypes.STRING(50)
  },
  soporte_nivel2_email: {
    type: DataTypes.STRING(150),
    validate: {
      isEmail: true
    }
  },
  soporte_nivel2_telefono: {
    type: DataTypes.STRING(50)
  },
  soporte_nivelN_email: {
    type: DataTypes.STRING(150),
    validate: {
      isEmail: true
    }
  },
  soporte_nivelN_telefono: {
    type: DataTypes.STRING(50)
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'servicios'
});

module.exports = Servicio;
