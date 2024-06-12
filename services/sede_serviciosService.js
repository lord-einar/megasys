const SedeServicio = require("../models/Sede_Servicio");
const Servicio = require("../models/Servicio");
const Sede = require("../models/Sede");
const Proveedor = require("../models/Proveedor");

const servicioBySedeID = async (id_sede) => {
  return await SedeServicio.findAll({
    where: { id_sede },
    include: [
      { model: Sede, attributes: ["nombre"] },
      { model: Servicio, attributes: ["nombre_servicio"] },
      { model: Proveedor, attributes: ["nombre"] }
    ],
    attributes: { exclude: ["createdAt", "updatedAt"] }
  });
};

module.exports = {
  servicioBySedeID
};
