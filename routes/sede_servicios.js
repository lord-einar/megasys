const {Router} = require('express');
const { asignarServicioASede } = require('../controllers/sede_servicios');



const router = Router();

router.get('/', asignarServicioASede)

// router.post('/', sedesPOST)


module.exports = router;