const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Auditoria = sequelize.define('auditoria', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  tabla_afectada: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  registro_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  accion: {
    type: DataTypes.ENUM('CREATE', 'UPDATE', 'DELETE'),
    allowNull: false
  },
  valores_anteriores: {
    type: DataTypes.JSON,
    allowNull: true
  },
  valores_nuevos: {
    type: DataTypes.JSON,
    allowNull: true
  },
  usuario_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  fecha_hora: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  ip_usuario: {
    type: DataTypes.STRING(45),
    allowNull: true
  },
  user_agent: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  endpoint: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  tableName: 'auditoria',
  timestamps: false,  // No usa created_at/updated_at porque tiene fecha_hora
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