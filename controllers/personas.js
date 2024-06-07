const Persona = require('../models/Persona');
const SedePersona = require('../models/Sede_Persona');

const personasGET = async (req, res) => {
    try {
        const personas = await Persona.findAll();
        res.json(personas);
    } catch (error) {
        console.error('Error al obtener las personas:', error);
        res.status(500).send('Error al obtener las personas');
    }
};

const personaByID = async (req, res) => {
    const id = req.params.id;
    try {
        const persona = await Persona.findByPk(id);
        if (!persona) {
            return res.status(404).json({ ok: false, msg: 'Persona no encontrada' });
        }
        res.json({ ok: true, persona });
    } catch (error) {
        console.error('Error al obtener la persona:', error);
        res.status(500).send('Error al obtener la persona');
    }
};

const personasPOST = async (req, res) => {
    const { nombre, email, telefono } = req.body;
    try {
        const persona = await Persona.create({ nombre, email, telefono });
        res.status(201).json(persona);
    } catch (error) {
        console.error('Error al crear la persona:', error);
        res.status(500).send('Error al crear la persona');
    }
};

const personasPUT = async (req, res) => {
    const { id } = req.params;
    const { nombre, email, telefono } = req.body;

    try {
        const persona = await Persona.findByPk(id);

        if (!persona) {
            return res.status(404).json({ ok: false, msg: 'Persona no encontrada' });
        }

        await persona.update({ nombre, email, telefono });

        res.json({
            ok: true,
            msg: 'Persona actualizada correctamente',
            persona
        });
    } catch (error) {
        console.error('Error al actualizar la persona:', error);
        res.status(500).send('Error al actualizar la persona');
    }
};

const personaDELETE = async (req, res) => {
  const { id } = req.params;

  try {
      const persona = await Persona.findByPk(id);

      if (!persona) {
          return res.status(404).json({ ok: false, msg: 'Persona no encontrada' });
      }

      // Eliminar las referencias en la tabla sede_persona
      await SedePersona.destroy({
          where: { id_persona: id }
      });

      // Eliminar la persona
      await persona.destroy();

      res.json({
          ok: true,
          msg: 'Persona eliminada correctamente'
      });
  } catch (error) {
      console.error('Error al eliminar la persona:', error);
      res.status(500).send('Error al eliminar la persona');
  }
};

module.exports = {
    personasGET,
    personaByID,
    personasPOST,
    personasPUT,
    personaDELETE
};
