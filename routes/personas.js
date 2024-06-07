const { Router } = require('express');
const { check } = require('express-validator');
const { personasGET, personasPOST, personaByID, personasPUT, personaDELETE } = require('../controllers/personas');
const { validarCampos } = require('../middlewares/validar-campos');

const router = Router();

// Obtener todas las personas
router.get('/', personasGET);

// Obtener una persona por ID
router.get('/id/:id', [
    check('id', 'El ID es obligatorio y debe ser un UUID válido').isUUID(),
    validarCampos
], personaByID);

// Crear una nueva persona
router.post('/', [
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    check('email', 'El email es obligatorio y debe ser válido').isEmail(),
    check('telefono', 'El teléfono es obligatorio').not().isEmpty(),
    // check('tipo', 'El tipo es obligatorio').not().isEmpty(),
    validarCampos
], personasPOST);

// Actualizar una persona existente
router.put('/:id', [
    check('id', 'El ID es obligatorio y debe ser un UUID válido').isUUID(),
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    check('email', 'El email es obligatorio y debe ser válido').isEmail(),
    check('telefono', 'El teléfono es obligatorio').not().isEmpty(),
    // check('tipo', 'El tipo es obligatorio').not().isEmpty(),
    validarCampos
], personasPUT);

// Eliminar una persona existente
router.delete('/:id', [
    check('id', 'El ID es obligatorio y debe ser un UUID válido').isUUID(),
    validarCampos
], personaDELETE);

module.exports = router;
