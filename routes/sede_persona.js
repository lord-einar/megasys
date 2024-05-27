const {Router} = require('express');
const {sedePersonaPOST, sedePersonaGET} = require('../controllers/sede_persona');


const router = Router();

router.get('/', sedePersonaGET)

router.post('/', sedePersonaPOST)


module.exports = router;