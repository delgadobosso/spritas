var express = require('express');
var router = express.Router();

router.get('/', (req, res) => {
    var offset;
    var limit;
    if (req.offset && parseInt(req.offset)) offset = parseInt(req.offset);
    else offset = 0;
    if (req.limit && parseInt(req.limit)) limit = Math.min(24, parseInt(req.limit)) + 1;
    else limit = 0;
    req.pool.query(`SELECT replies.*, users.username AS username, users.nickname AS nickname, users.avatar AS avatar, users.type AS userType
    FROM replies
    LEFT JOIN users ON replies.idUser = users.id
    WHERE replies.idParent = ? && replies.id > ?
    ORDER BY replies.ts ASC
    LIMIT ?,?`, [req.id, req.idSub, offset, limit], (error, result, fields) => {
        if (error) return res.status(500).send(error);

        else res.send(result);
    })
})

module.exports = router;
