const Empresa = require("../models/Empresa.");



const empresaGet = async (req, res) => {
    res.status(200).send('okUser GET')
//   const usuarios = await User.findAll({ order: [["nombre", "ASC"]] });

//   res.json(usuarios);
};

const empresaPost = async (req, res) => {
  const { nombre, user } = req.body;

  await Empresa.sync({ force: false });
  const empresas = await Empresa.create({ nombre, user });

  res.json(empresas);
};


module.exports = {
    empresaGet,
    empresaPost
};
