const Persona = require("../models/Persona");
const Rol = require("../models/Rol");
const Sede = require("../models/Sede");
const SedePersona = require("../models/Sede_Persona");

const sedePersonaGET = async (req, res) => {
  const resultado = await SedePersona.findAll({
    attributes: ["id_sedePersona"],
    include: [
      {
        model: Sede,
        attributes: ["nombre"],
      },
      {
        model: Persona,
        attributes: ["nombre"],
      },
      {
        model: Rol,
        attributes: ["nombre"],
      },
    ],
  });

  res.status(200).send(resultado);
};

const sedePersonaByIDSede = async (id) => {

  console.log(id)
  const personas = await SedePersona.findAll({
      where: { id_sede: id },
      attributes: ["id_sedePersona"],
      include: [
        {
          model: Persona,
          attributes: ["nombre", "email", 'telefono'],
        },
        {
          model: Rol,
          attributes: ["nombre"],
        },
      ],
    })

    return personas
};

const sedePersonaPOST = async (req, res) => {
  const { id_sede, id_persona, id_rol } = req.body;

  try {
    const resultado = await SedePersona.create({
      id_sede,
      id_persona,
      id_rol,
    });
    res.status(200).send(resultado);
  } catch (error) {
    console.error("Error al asignar persona a sede:", error);
  }
};

module.exports = { sedePersonaGET, sedePersonaPOST, sedePersonaByIDSede };
