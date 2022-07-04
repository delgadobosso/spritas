var express = require('express');
var router = express.Router();

router.get('/', (req, res) => {
    var offset;
    var limit;
    if (req.offset && parseInt(req.offset)) offset = parseInt(req.offset);
    else offset = 0;
    if (req.limit && parseInt(req.limit)) limit = Math.min(24, parseInt(req.limit)) + 1;
    else limit = 0;
    req.pool.query(`SELECT * FROM audit_log ORDER BY ts DESC LIMIT ?,?`,
    [offset, limit], (error, result, fields) => {
        if (error) res.status(500).send(error);

        else return res.send(result);
    })
})

module.exports = router;
