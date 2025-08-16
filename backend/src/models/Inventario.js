const { DataTypes, Sequelize } = require('sequelize');
const sequelize = require('../config/database');

const Inventario = sequelize.define('inventario', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  tipo_articulo_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'tipo_articulos',
      key: 'id'
    }
  },
  marca: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  modelo: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  numero_serie: {
    type: DataTypes.STRING(150),
    allowNull: true,
    unique: true
  },
  service_tag: {
    type: DataTypes.STRING(150),
    allowNull: true,  // CAMBIADO: Ahora permite NULL
    unique: true
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  sede_actual_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'sedes',
      key: 'id'
    }
  },
  prestamo: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  fecha_devolucion: {
    type: DataTypes.DATE,
    allowNull: true
  },
  devuelto: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  remito_prestamo_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'remitos',
      key: 'id'
    }
  },
  fecha_devolucion_extendida: {
    type: DataTypes.DATE,
    allowNull: true
  },
  usuario_prestamo_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'personal',
      key: 'id'
    }
  },
  observaciones_prestamo: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  observaciones: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  fecha_ingreso: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  estado: {
    type: DataTypes.ENUM('disponible', 'en_uso', 'prestado', 'en_transito', 'en_reparacion', 'baja'),
    defaultValue: 'disponible'
  }
}, {
  tableName: 'inventario',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['service_tag'],
      where: {
        service_tag: {
          [Sequelize.Op.ne]: null
        }
      }
    },
    {
      unique: true,
      fields: ['numero_serie'],
      where: {
        numero_serie: {
          [Sequelize.Op.ne]: null
        }
      }
    },
    {
      fields: ['sede_actual_id']
    },
    {
      fields: ['prestamo']
    },
    {
      fields: ['estado']
    }
  ]
});

module.exports = Inventario;