const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Personal = sequelize.define('personal', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
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
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  telefono: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'personal',
  timestamps: true,
  underscored: true,
  comment: 'Personal que trabaja en las sedes (no son usuarios del sistema)'
});

module.exports = Personal;