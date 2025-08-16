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
  codigo_sede: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'Código único de identificación de la sede'
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
  codigo_postal: {
    type: DataTypes.STRING(20),
    allowNull: true
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
  },
  horario_atencion: {
    type: DataTypes.JSON,
    defaultValue: {
      lunes_viernes: '09:00-18:00',
      sabado: null,
      domingo: null
    }
  }
}, {
  tableName: 'sedes',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['empresa_id', 'codigo_sede'],
      where: {
        codigo_sede: {
          [DataTypes.Op.ne]: null
        }
      }
    }
  ]
});

module.exports = Sede;