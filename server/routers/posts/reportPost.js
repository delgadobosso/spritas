var express = require('express');
var router = express.Router();

router.post('/', (req, res) => {
    if (!req.session.user) return res.sendStatus(401);
    if (req.session.user && req.session.user.type === "BAN") return res.sendStatus(403);
    const errors = req.validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({errors: errors.array()});

    req.pool.query(`SELECT id, idUser FROM posts WHERE id = ?`, req.body.id, (error, result, fields) => {
        if (error) res.status(500).send(error);

        if (result.length > 0) {
            req.pool.query(`INSERT INTO audit_log (idFrom,idTo,idContent,type,reason)
            VALUES (?,?,?,'RP',?)`, [req.session.id, result[0].idUser, req.body.id, req.body.reason], (error, result, fields) => {
                if (error) res.status(500).send(error);

                return res.status(200);
            })
        }
    })
})

module.exports = router;
