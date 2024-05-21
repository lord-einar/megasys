const {Router} = require('express');
const {asignarPersonaASede} = require('../controllers/sede_persona');


const router = Router();

router.get('/', asignarPersonaASede)

// router.post('/', sedesPOST)


module.exports = router;