const SedePersona = require("../models/Sede_Persona");
const Persona = require("../models/Persona");
const Sede = require("../models/Sede");
const Rol = require("../models/Rol");

const sedePersonaByIDSede = async (id_sede) => {
  return await SedePersona.findAll({
    where: { id_sede },
    include: [
      { model: Sede, attributes: ["nombre"] },
      { model: Persona, attributes: ["nombre", "email", "telefono"] },
      { model: Rol, attributes: ["nombre"] }
    ],
    attributes: { exclude: ["createdAt", "updatedAt"] }
  });
};

module.exports = {
  sedePersonaByIDSede
};
