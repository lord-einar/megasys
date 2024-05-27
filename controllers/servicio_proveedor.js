const Proveedor = require("../models/Proveedor");
const ServicioProveedor = require("../models/Servicio_Proveedor");

const servicioProveedorGET = async (req, res) => {
  const resultado = await ServicioProveedor.findAll();

  res.status(200).send(resultado);
};

const servicioProveedorPOST = async (req, res) => {
  const { id_proveedor, id_servicio } = req.body;

  try {
    const resultado = await ServicioProveedor.create({
      id_proveedor,
      id_servicio,
    });
    res.status(200).send(resultado);
  } catch (error) {
    console.error("Error al asignar el servicio al proveedor:", error);
  }
};

const servicioProveedorByIDServicio = async (id) => {
  const proveedores = await ServicioProveedor.findAll({
    where: { id_servicio: id },
    attributes: ["id_servicioproveedor"],
    include: [
      {
        model: Proveedor,
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
