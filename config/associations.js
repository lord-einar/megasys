// Modelo para la relación muchos a muchos
const Empresa = require("../models/Empresa.");
const Inventario = require("../models/Inventario");
const Persona = require("../models/Persona");
const Proveedor = require("../models/Proveedor");
const Rol = require("../models/Rol");
const Sede = require("../models/Sede");
const Servicio = require("../models/Servicio");
const SedePersona = require("../models/Sede_Persona");
const SedeServicio = require("../models/Sede_Servicio");
const ServicioProveedor = require("../models/Servicio_Proveedor");
const Remito = require("../models/Remito");
const RemitoInventario = require("../models/Remito_Inventario");


SedePersona.belongsTo(Persona, { foreignKey: 'id_persona' });
SedePersona.belongsTo(Sede, { foreignKey: 'id_sede' });
SedePersona.belongsTo(Rol, { foreignKey: 'id_rol' });

// Asociaciones Empresa y Sede
Empresa.hasMany(Sede, { foreignKey: "id_empresa" });
Sede.belongsTo(Empresa, { foreignKey: "id_empresa" });

// Asociaciones Sede y Persona
Sede.belongsToMany(Persona, {
  through: SedePersona,
  foreignKey: "id_sede",
  otherKey: "id_persona",
});
Persona.belongsToMany(Sede, {
  through: SedePersona,
  foreignKey: "id_persona",
  otherKey: "id_sede",
});

Servicio.belongsToMany(Proveedor, {
  through: ServicioProveedor,
  foreignKey: 'id_servicio',
  otherKey: 'id_proveedor'
});

Proveedor.belongsToMany(Servicio, {
  through: ServicioProveedor,
  foreignKey: 'id_proveedor',
  otherKey: 'id_servicio'
});

// Asociación Sede y Remito
Sede.hasMany(Remito, { foreignKey: 'id_sede' });
Remito.belongsTo(Sede, { foreignKey: 'id_sede' });

// Asociación Remito e Inventario (a través de RemitoInventario)
Remito.belongsToMany(Inventario, { through: RemitoInventario, foreignKey: 'id_remito' });
Inventario.belongsToMany(Remito, { through: RemitoInventario, foreignKey: 'id_inventario' });



// Asociaciones Sede y Inventario
Sede.hasMany(Inventario, { foreignKey: "id_sede" });
Inventario.belongsTo(Sede, { foreignKey: "id_sede" });

// Asociaciones Sede y Servicio (muchos a muchos)
Sede.belongsToMany(Servicio, { through: SedeServicio, foreignKey: "id_sede" });
Servicio.belongsToMany(Sede, {
  through: SedeServicio,
  foreignKey: "id_servicio",
});

// Si hay asociaciones entre Proveedor y Servicio
Proveedor.belongsToMany(Servicio, {
  through: "ProveedorServicio",
  foreignKey: "id_proveedor",
});
Servicio.belongsToMany(Proveedor, {
  through: "ProveedorServicio",
  foreignKey: "id_servicio",
});

module.exports = {
  Empresa,
  Sede,
  Persona,
  Inventario,
  Servicio,
  Proveedor,
  SedePersona,
  Rol,
  Remito
};
