var express = require('express');
var router = express.Router();

router.get('/', (req, res) => {
    if (!req.session.user) return res.sendStatus(401);
    if (req.session.user.type !== "ADMN") return res.sendStatus(403);
    var offset;
    var limit;
    if (req.offset && parseInt(req.offset)) offset = parseInt(req.offset);
    else offset = 0;
    if (req.limit && parseInt(req.limit)) limit = Math.min(24, parseInt(req.limit)) + 1;
    else limit = 0;
    req.pool.query(`
    SELECT a.*, u1.username AS usernameFrom, u2.username AS usernameTo
    FROM audit_log AS a
    LEFT JOIN users AS u1
    ON a.idFrom = u1.id
    LEFT JOIN users AS u2
    ON a.idTo = u2.id
    ORDER BY a.ts DESC LIMIT ?,?`,
    [offset, limit], (error, result, fields) => {
        if (error) res.status(500).send(error);

        else return res.send(result);
    })
})

module.exports = router;
