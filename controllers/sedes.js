const Sede = require("../models/Sede");
const Empresa = require("../models/Empresa.");
const { sedePersonaByIDSede } = require("./sede_persona");
const { servicioBySedeID } = require("./sede_servicios");
const { servicioProveedorByIDServicio } = require("./servicio_proveedor");
const { inventarioBySedeID } = require("./inventario");

const sedesGET = async (req, res) => {
  const sedes = await Sede.findAll({
    include: [{model: Empresa, attributes: ['nombre']}]
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
    include: [{ model: Empresa, attributes: ['nombre'] }]
  });

  const personas = await sedePersonaByIDSede(id)

  const serviciosSede = await servicioBySedeID(id)

  const servicios = await servicioProveedorByIDServicio(serviciosSede)

  const inventarios = await inventarioBySedeID(id);

  console.log(inventarios)
  
  res.json({
    sede,
    personas,
    servicios,
    inventarios
  })

}

const sedesPUT = async (req, res) => {
  const { id } = req.params;
  const { nombre, direccion, localidad, provincia, pais, telefono, email, ip_asignada } = req.body;

  try {
      const sede = await Sede.findByPk(id);

      if (!sede) {
          return res.status(404).json({ ok: false, msg: 'Sede no encontrada' });
      }

      await sede.update({ nombre, direccion, localidad, provincia, pais, telefono, email, ip_asignada });

      res.json({
          ok: true,
          msg: 'Sede actualizada correctamente',
          sede
      });
  } catch (error) {
      console.error('Error al actualizar la sede:', error);
      res.status(500).send('Error al actualizar la sede');
  }
};


module.exports = {
  sedesGET,
  sedesPOST,
  sedeByID,
  sedesPUT
};
