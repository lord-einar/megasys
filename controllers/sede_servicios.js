const SedeServicio = require("../models/Sede_Servicio");



const asignarServicioASede = async(idSede, idPersona, rol) => {
  try {
    const resultado = await SedeServicio.create({
      id_sede: idSede,
    //   id_persona: idPersona,
    //   rol: rol
    });
    console.log('Persona asignada correctamente:', resultado);
  } catch (error) {
    console.error('Error al asignar persona a sede:', error);
  }
}


module.exports = {asignarServicioASede}