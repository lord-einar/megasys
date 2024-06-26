const { DataTypes, Model } = require("sequelize");
const dbConnect = require("../config/db.config");
const Sede = require("./Sede");
const sequelize = dbConnect();

class Inventario extends Model {}

Inventario.init({
  id_inventario: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  id_sede: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Sedes',
      key: 'id_sede'
    }
  },
  marca: {
    type: DataTypes.STRING,
    allowNull: false
  },
  modelo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  tipo_articulo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  service_tag: {
    type: DataTypes.STRING,
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false
  },
  num_serie: {
    type: DataTypes.STRING,
  },
}, {
  sequelize,
  modelName: 'Inventario'
});

Inventario.belongsTo(Sede, { foreignKey: 'id_sede' });

module.exports = Inventario