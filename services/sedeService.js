const Sede = require("../models/Sede");
const Empresa = require("../models/Empresa.");
const { sedePersonaByIDSede } = require("./sede_personaService");
const { servicioBySedeID } = require("./sede_serviciosService");
const { servicioProveedorByIDServicio } = require("./servicio_proveedorService");
const { inventarioBySedeID } = require("./inventarioService");

const getSedes = async () => {
  return await Sede.findAll({
    include: [{ model: Empresa, attributes: ['nombre'] }]
  });
};

const createSede = async (data) => {
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
  } = data;

  return await Sede.create({
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
};

const getSedeById = async (id) => {
  const sede = await Sede.findByPk(id, {
    attributes: { exclude: ['id_empresa', 'createdAt', 'updatedAt'] },
    include: [{ model: Empresa, attributes: ['nombre'] }]
  });

  if (!sede) {
    throw new Error("Sede no encontrada");
  }

  const personas = await sedePersonaByIDSede(id);
  const serviciosSede = await servicioBySedeID(id);
  const servicios = await servicioProveedorByIDServicio(serviciosSede);
  const inventarios = await inventarioBySedeID(id);

  return {
    sede,
    personas,
    servicios,
    inventarios
  };
};

const updateSede = async (id, data) => {
  const { nombre, direccion, localidad, provincia, pais, telefono, email, ip_asignada } = data;

  const sede = await Sede.findByPk(id);

  if (!sede) {
    throw new Error("Sede no encontrada");
  }

  await sede.update({ nombre, direccion, localidad, provincia, pais, telefono, email, ip_asignada });

  return sede;
};

module.exports = {
  getSedes,
  createSede,
  getSedeById,
  updateSede
};
