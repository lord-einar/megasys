const SedePersona = require("../models/Sede_Persona");


const asignarPersonaASede = async(idSede, idPersona, rol) => {
  try {
    const resultado = await SedePersona.create({
      id_sede: idSede,
      id_persona: idPersona,
      rol: rol
    });
    console.log('Persona asignada correctamente:', resultado);
  } catch (error) {
    console.error('Error al asignar persona a sede:', error);
  }
}


module.exports = {asignarPersonaASede}
