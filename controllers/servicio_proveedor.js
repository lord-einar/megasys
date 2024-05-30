const Proveedor = require("../models/Proveedor");
const Servicio = require("../models/Servicio");
const ServicioProveedor = require("../models/Servicio_Proveedor");

const servicioProveedorGET = async (req, res) => {
  const resultado = await ServicioProveedor.findAll();

  res.status(200).send(resultado);
};

const servicioProveedorPOST = async (req, res) => {
  const {
    id_servicio,
    id_proveedor,
    servicioID,
    contrato,
    fechaInicio,
    fechaFin,
    estado,
    observaciones,
  } = req.body;

  try {
    const resultado = await ServicioProveedor.create({
      id_servicio,
      id_proveedor,
      servicioID,
      contrato,
      fechaInicio,
      fechaFin,
      estado,
      observaciones,
    });
    res.status(200).send(resultado);
  } catch (error) {
    console.error("Error al asignar el servicio al proveedor:", error);
  }
};

const servicioProveedorByIDServicio = async (id) => {

  const proveedores = await ServicioProveedor.findAll({
    where: { id_servicioProveedor: id },
    attributes: { exclude: ["createdAt", "updatedAt"] },
    include: [
      {
        model: Proveedor,
        attributes: { exclude: ["createdAt", "updatedAt"] },
      },
      {
        model: Servicio,
        attributes: { exclude: ["createdAt", "updatedAt"] },
      },
    ],
  });

  return proveedores;
};

module.exports = {
  servicioProveedorGET,
  servicioProveedorPOST,
  servicioProveedorByIDServicio,
};
