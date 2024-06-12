const ServicioProveedor = require("../models/Servicio_Proveedor");
const Servicio = require("../models/Servicio");
const Proveedor = require("../models/Proveedor");

const servicioProveedorByIDServicio = async (servicios) => {
  const proveedores = await Promise.all(servicios.map(async (servicio) => {
    const proveedores = await ServicioProveedor.findAll({
      where: { id_servicio: servicio.id_servicio },
      include: [
        { model: Servicio, attributes: ["nombre_servicio"] },
        { model: Proveedor, attributes: ["nombre", "direccion", "email", "telefono"] }
      ],
      attributes: { exclude: ["createdAt", "updatedAt"] }
    });
    return { servicio: servicio.nombre_servicio, proveedores };
  }));

  return proveedores;
};

module.exports = {
  servicioProveedorByIDServicio
};
