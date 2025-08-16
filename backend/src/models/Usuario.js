// ============================================
// backend/src/models/Usuario.js
// ============================================
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Usuario = sequelize.define('usuario', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
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
  azure_id: {
    type: DataTypes.STRING(255),
    unique: true,
    allowNull: false
  },
  azure_tenant_id: {
    type: DataTypes.STRING(255)
  },
  foto_url: {
    type: DataTypes.STRING(500)
  },
  grupos_ad_ids: {
    type: DataTypes.JSON,
    defaultValue: [],
    comment: 'Array de IDs de grupos de Azure AD'
  },
  ultimo_acceso: {
    type: DataTypes.DATE
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  es_super_admin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  empresas_permitidas: {
    type: DataTypes.JSON,
    defaultValue: [],
    comment: 'Array de IDs de empresas a las que tiene acceso'
  },
  preferencias: {
    type: DataTypes.JSON,
    defaultValue: {
      tema: 'light',
      idioma: 'es',
      notificaciones_email: true
    }
  }
}, {
  tableName: 'usuarios',
  indexes: [
    {
      unique: true,
      fields: ['email']
    },
    {
      unique: true,
      fields: ['azure_id']
    },
    {
      fields: ['activo']
    }
  ]
});

module.exports = Usuario;