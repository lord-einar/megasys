const Inventario = require("../models/Inventario");


const inventarioGET = async (req, res) => {
    res.status(200).send('okUser GET')
//   const usuarios = await User.findAll({ order: [["nombre", "ASC"]] });

//   res.json(usuarios);
};

const inventarioPOST = async (req, res) => {
  const { nombre, user } = req.body;

  await Inventario.sync({ force: false });
  const inventario = await Inventario.create({ nombre, user });

  res.json(inventario);
};


module.exports = {
    inventarioGET,
    inventarioPOST
};
