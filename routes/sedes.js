const {Router} = require('express');
const { sedesGET, sedesPOST, sedeByID } = require('../controllers/sedes');


const router = Router();

router.get('/', sedesGET)


router.get('/id/:id', sedeByID)

router.post('/', sedesPOST)


module.exports = router;