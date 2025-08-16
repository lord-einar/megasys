const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Empresa = sequelize.define('empresa', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  nombre: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: true
  },
  razon_social: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  cuit: {
    type: DataTypes.STRING(20),
    unique: true,
    allowNull: false,
    validate: {
      is: /^[0-9]{2}-[0-9]{8}-[0-9]$/
    }
  },
  direccion_fiscal: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  telefono_principal: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  email_corporativo: {
    type: DataTypes.STRING(150),
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  sitio_web: {
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: {
      isUrl: true
    }
  },
  logo_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  activa: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  configuracion: {
    type: DataTypes.JSON,
    defaultValue: {
      colores_corporativos: {},
      formatos_remito: {},
      notificaciones: {}
    }
  }
}, {
  tableName: 'empresas',
  timestamps: true,
  underscored: true
});

module.exports = Empresa;