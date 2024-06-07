const Empresa = require("../models/Empresa.");

const empresaGet = async (req, res) => {
  const empresas = await Empresa.findAll();

  res.json(empresas);
};

const empresaPost = async (req, res) => {
  const { nombre } = req.body;

  try {
      const empresa = await Empresa.create({ nombre });
      res.json(empresa);
  } catch (error) {
      res.status(500).send('Error al crear la empresa: ' + error.message);
  }
};


module.exports = {
    empresaGet,
    empresaPost
};
