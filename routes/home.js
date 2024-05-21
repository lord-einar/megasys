const {Router} = require('express');

const router = Router();

router.get('/', (res, req) => {
    res.statusCode(200).send('ok')
})



module.exports = router;