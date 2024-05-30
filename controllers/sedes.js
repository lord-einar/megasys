const Sede = require("../models/Sede");
const Empresa = require("../models/Empresa.");
const { sedePersonaByIDSede } = require("./sede_persona");
const { servicioBySedeID } = require("./sede_servicios");
const { servicioProveedorByIDServicio } = require("./servicio_proveedor");

const sedesGET = async (req, res) => {
  const sedes = await Sede.findAll({
    include: [{model: Empresa, attributes: ['nombre_empresa']}]
  });

  res.json(sedes);
};

const sedesPOST = async (req, res) => {
  const {
    id_empresa,
    nombre,
    direccion,
    localidad,
    provincia,
    pais,
    telefono,
    email,
    ip_asignada,
  } = req.body;

  try {
    await Sede.sync({ force: false });
    const sedes = await Sede.create({
      id_empresa,
      nombre,
      direccion,
      localidad,
      provincia,
      pais,
      telefono,
      email,
      ip_asignada,
    });

    res.json(sedes);
  } catch (error) {
    res.status(500).send("Error al crear la sede: " + error.message);
  }
};

const sedeByID = async (req, res) => {

  const id = req.params.id
  const sede = await Sede.findByPk(id, {
    attributes: {exclude: ['id_empresa', 'createdAt', 'updatedAt']},
    include: [{ model: Empresa, attributes: ['nombre_empresa'] }]
  });

  const personas = await sedePersonaByIDSede(id)

  const serviciosSede = await servicioBySedeID(id)

  console.log("serviciosSede: ", serviciosSede)

  const servicios = await servicioProveedorByIDServicio(serviciosSede)
  
  res.json({
    sede,
    personas,
    servicios
  })

}

module.exports = {
  sedesGET,
  sedesPOST,
  sedeByID
};
