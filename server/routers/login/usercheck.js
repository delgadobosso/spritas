var express = require('express');
var router = express.Router();

router.post('/', (req, res) => {
    req.pool.query(`SELECT username FROM users WHERE username = ?`, req.body.username, (error, result, fields) => {
        if (error) return res.status(500).send(error);
        else if (result.length > 0) return res.status(200).send('taken');
        else return res.status(200).send('free');
    })
})

module.exports = router;
