// ============================================
// backend/src/models/Auditoria.js
// ============================================
const { DataTypes, Sequelize } = require('sequelize');
const sequelize = require('../config/database');

const Auditoria = sequelize.define('auditoria', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    autoIncrement: true
  },
  tabla_afectada: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  registro_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  accion: {
    type: DataTypes.ENUM('CREATE', 'UPDATE', 'DELETE'),
    allowNull: false
  },
  valores_anteriores: {
    type: DataTypes.JSON
  },
  valores_nuevos: {
    type: DataTypes.JSON
  },
usuario_id: {
  type: DataTypes.INTEGER,
  references: { model: 'usuarios', key: 'id' }
},
  fecha_hora: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  ip_usuario: {
    type: DataTypes.STRING(45)
  },
  user_agent: {
    type: DataTypes.STRING(500)
  },
  endpoint: {
    type: DataTypes.STRING(255)
  }
}, {
  tableName: 'auditoria',
  timestamps: false,
  indexes: [
    {
      fields: ['tabla_afectada', 'registro_id']
    },
    {
      fields: ['usuario_id']
    },
    {
      fields: ['fecha_hora']
    }
  ]
});

module.exports = Auditoria;