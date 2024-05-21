const Sede = require("../models/Sede");
const Persona = require("../models/Persona");
const Empresa = require("../models/Empresa.");
const Inventario = require("../models/Inventario");
const Servicio = require("../models/Servicio");

const sedesGET = async (req, res) => {
    res.status(200).send('okUser GET')
};

const sedesPOST = async (req, res) => {
  const { nombre, user } = req.body;

  await Sede.sync({ force: false });
  const sedes = await Sede.create({ nombre, user });

  res.json(sedes);
};




const sedeDetalladaGET = async (req, res) => {
    try {
        const sede = await Sede.findByPk(req.params.id, {
            include: [
                {
                    model: Empresa
                },
                {
                    model: Persona,
                    attributes: ['nombre', 'email', 'telefono', 'tipo'] // Ajusta los atributos según necesites
                },
                {
                    model: Inventario,
                    attributes: ['marca', 'modelo', 'tipo_articulo', 'service_tag'] // Ajusta los atributos según necesites
                },
                {
                    model: Servicio,
                    through: {
                        attributes: []
                    },
                    attributes: ['nombre_servicio']
                }
            ]
        });

        if (sede) {
            res.json(sede);
        } else {
            res.status(404).send('Sede no encontrada');
        }
    } catch (error) {
        res.status(500).send('Error al obtener la información detallada de la sede: ' + error.message);
    }
};

module.exports = {
    sedeDetalladaGET
};


module.exports = {
    sedesGET,
    sedesPOST
};
