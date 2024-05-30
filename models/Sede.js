const { DataTypes, Model } = require("sequelize");
const dbConnect = require("../config/db.config");
const Empresa = require("./Empresa.");
const Inventario = require("./Inventario");
const Remito = require("./Remito");
const sequelize = dbConnect();  // Obtén la instancia de sequelize.

class Sede extends Model {}

Sede.init({
  id_sede: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  id_empresa: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Empresas',
      key: 'id_empresa'
    }
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  direccion: {
    type: DataTypes.STRING,
    allowNull: false
  },
  localidad: {
    type: DataTypes.STRING,
    allowNull: false
  },
  provincia: {
    type: DataTypes.STRING,
    allowNull: false
  },
  pais: {
    type: DataTypes.STRING,
    allowNull: false
  },
  telefono: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  ip_asignada: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'Sede'
});

// Empresa.hasMany(Sede, { foreignKey: "id_empresa" });
// Sede.belongsTo(Empresa, { foreignKey: "id_empresa" });

// Asociaciones Sede
// Sede.hasMany(Inventario, { foreignKey: 'id_sede' });
// Sede.hasMany(Remito, { foreignKey: 'id_sede' });
// Sede.hasMany(HistoricoInventario, { foreignKey: 'id_sede' });


module.exports = Sede