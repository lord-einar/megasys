const {Router} = require('express');
const { sedesGET, sedesPOST, sedeByID, sedesPUT } = require('../controllers/sedes');
const { check } = require('express-validator');
const { validarCampos } = require('../middlewares/validar-campos');


const router = Router();

router.get('/', sedesGET)


router.get('/id/:id', sedeByID)

router.post('/', sedesPOST)

router.put('/:id', [
    check('id', 'El ID es obligatorio y debe ser un UUID válido').isUUID(),
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    check('direccion', 'La dirección es obligatoria').not().isEmpty(),
    check('localidad', 'La localidad es obligatoria').not().isEmpty(),
    check('provincia', 'La provincia es obligatoria').not().isEmpty(),
    check('pais', 'El país es obligatorio').not().isEmpty(),
    check('telefono', 'El teléfono es obligatorio').not().isEmpty(),
    check('email', 'El email es obligatorio y debe ser válido').isEmail(),
    check('ip_asignada', 'La IP asignada es obligatoria').not().isEmpty(),
    validarCampos
], sedesPUT);

module.exports = router;