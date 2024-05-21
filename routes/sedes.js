const {Router} = require('express');
const { sedesGET, sedesPOST } = require('../controllers/sedes');


const router = Router();

router.get('/', sedesGET)

router.post('/', sedesPOST)


module.exports = router;