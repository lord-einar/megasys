const {Router} = require('express');
const { serviciosGET, serviciosPOST } = require('../controllers/servicios');



const router = Router();

router.get('/', serviciosGET)

router.post('/', serviciosPOST)


module.exports = router;