const Proveedor = require("../models/Proveedor");



const proveedoresGET = async (req, res) => {
    res.status(200).send('okUser GET')
//   const usuarios = await User.findAll({ order: [["nombre", "ASC"]] });

//   res.json(usuarios);
};

const proveedoresPOST = async (req, res) => {
  const { nombre, user } = req.body;

  await Proveedor.sync({ force: false });
  const proveedores = await Proveedor.create({ nombre, user });

  res.json(proveedores);
};


module.exports = {
    proveedoresGET,
    proveedoresPOST
};