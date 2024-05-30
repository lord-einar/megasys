const {Router} = require('express');
const { asignarServicioASede, sedeServiciosGET } = require('../controllers/sede_servicios');



const router = Router();

router.get('/', sedeServiciosGET)

router.post('/', asignarServicioASede)




module.exports = router;