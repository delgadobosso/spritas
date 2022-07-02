var express = require('express');
var router = express.Router();

router.post('/', (req, res) => {
    if (!req.session.user) return res.sendStatus(401);
    if (req.session.user && req.session.user.type === "BAN") return res.sendStatus(403);
    const errors = req.validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({errors: errors.array()});

    req.pool.query(`SELECT *
    FROM replies
    WHERE id = ?`, req.body.id, (error, result, fields) => {
        if (error) return res.status(500).send(error);

        if (req.session.user.id === result[0].idUser || req.session.user.type === 'ADMN') {
            var byWho = (req.session.user.type === 'ADMN' && req.session.user.id !== result[0].idUser) ? 'Deleted By Admin' : 'Deleted By User';
            req.pool.query(`UPDATE replies
            SET body = ?, status = 'DELE'
            WHERE id = ?`, [byWho, req.body.id], (error, result, fields) => {
                if (error) return res.status(500).send(error);
                else return res.sendStatus(200);
            })
        }
    })
})

module.exports = router;
