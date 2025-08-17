const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Sede = sequelize.define('sede', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  empresa_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'empresas',
      key: 'id'
    }
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
    type: DataTypes.STRING(50),
    allowNull: true
  },
  email_sede: {
    type: DataTypes.STRING(150),
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  ip_sede: {
    type: DataTypes.STRING(45),
    allowNull: true,
    validate: {
      isIP: true
    }
  },
  es_casa_central: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  activa: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'sedes',
  timestamps: true,
  underscored: true
});

module.exports = Sede;