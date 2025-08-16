const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Servicio = sequelize.define('servicio', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  nombre_servicio: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  tipo_servicio_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'tipo_servicios',
      key: 'id'
    }
  },
  soporte_nivel1_email: {
    type: DataTypes.STRING(150),
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  soporte_nivel1_telefono: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  soporte_nivel2_email: {
    type: DataTypes.STRING(150),
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  soporte_nivel2_telefono: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  soporte_nivelN_email: {
    type: DataTypes.STRING(150),
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  soporte_nivelN_telefono: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'servicios',
  timestamps: true,
  underscored: true
});

module.exports = Servicio;