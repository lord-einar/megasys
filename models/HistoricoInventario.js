const { DataTypes, Model } = require("sequelize");
const dbConnect = require("../config/db.config");
const sequelize = dbConnect();
const Remito = require("./Remito");
const Sede = require("./Sede");
const Inventario = require("./Inventario");

class HistoricoInventario extends Model {}

HistoricoInventario.init({
  id_historico: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  id_inventario: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    references: {
      model: 'Inventarios',
      key: 'id_inventario'
    }
  },
  id_sede: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    references: {
      model: 'Sedes',
      key: 'id_sede'
    }
  },
  id_remito: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'remitos',
      key: 'id_remito'
    }
  },
  fecha_movimiento: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  sequelize,
  modelName: 'HistoricoInventario',
  tableName: 'historico_inventarios'
});

// Asociaciones HistoricoInventario
HistoricoInventario.belongsTo(Inventario, { foreignKey: 'id_inventario' });
HistoricoInventario.belongsTo(Sede, { foreignKey: 'id_sede' });
HistoricoInventario.belongsTo(Remito, { foreignKey: 'id_remito' });

module.exports = HistoricoInventario;
