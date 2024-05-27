const {Router} = require('express');
const { serviciosGET, serviciosPOST, serviciosByID } = require('../controllers/servicios');



const router = Router();

router.get('/', serviciosGET)

router.post('/', serviciosPOST)

router.get('/id/:id', serviciosByID)


module.exports = router;