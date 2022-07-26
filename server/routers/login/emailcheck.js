var express = require('express');
var router = express.Router();

router.post('/', (req, res) => {
    const errors = req.validationResult(req);
    if (!errors.isEmpty()) return res.status(200).send('noemail');

    req.pool.query(`SELECT email FROM users WHERE email = ?`, req.body.email, (error, result, fields) => {
        if (error) return res.status(500).send(error);
        else if (result.length > 0) return res.status(200).send('taken');
        else return res.status(200).send('free');
    })
})

module.exports = router;
