const {Router} = require('express');
const { personasGET, personasPOST } = require('../controllers/personas');


const router = Router();

router.get('/', personasGET)

router.post('/', personasPOST)


module.exports = router;