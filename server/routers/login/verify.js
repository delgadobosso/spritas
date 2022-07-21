var express = require('express');
var router = express.Router();

router.get('/', (req, res) => {
    req.pool.query(`SELECT hash, ts FORM users WHERE username = ? LIMIT 1`,
    req.username, (error, result, fields) => {
        if (error) return res.status(500).send(error);
    })
})

module.exports = router;
