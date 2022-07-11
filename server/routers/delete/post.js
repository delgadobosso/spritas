var express = require('express');
var router = express.Router();

router.post('/', (req, res) => {
    if (!req.session.user) return res.sendStatus(401);
    if (req.session.user && req.session.user.type === "BAN") return res.sendStatus(403);
    const errors = req.validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({errors: errors.array()});

    req.pool.query(`SELECT *
    FROM posts AS p
    WHERE id = ?`, req.body.currentid, (error, result, fields) => {
        if (error) return res.status(500).send(error);
        const post = result[0];
        if (req.session.user.id === post.idUser || req.session.user.type === 'ADMN') {
            var deletehash = post.deletehash;
            var byWho = (req.session.user.type === 'ADMN' && req.session.user.id !== post.idUser) ? 'Deleted By Admin' : 'Deleted By User';
            req.pool.query(`UPDATE posts AS p
            SET subtitle = NULL, body = ?, p.status = 'DELE', link = NULL, deletehash = NULL, type = 'TEXT'
            WHERE id = ?`, [byWho, req.body.currentid], (error, result, fields) => {
                if (error) return res.status(500).send(error);

                if (deletehash) {
                    req.imgur.deleteImage(deletehash)
                        .then(() => {
                            req.pool.query(`INSERT INTO audit_log (idFrom,idTo,idContent,type,reason) VALUES (?,?,?,'DP',?)`, [req.session.user.id, post.idUser, post.id, req.body.reason], (error, result, fields) => {
                                if (error) return res.status(500).send(error);

                                return res.sendStatus(200);
                            });
                        })
                        .catch((err) => {
                            console.error(err.message);
                            return res.sendStatus(200);
                        });
                } else {
                    req.pool.query(`INSERT INTO audit_log (idFrom,idTo,idContent,type,reason) VALUES (?,?,?,'DP',?)`, [req.session.user.id, post.idUser, post.id, req.body.reason], (error, result, fields) => {
                        if (error) return res.status(500).send(error);

                        return res.sendStatus(200);
                    });
                }
            })
        }
        else return res.sendStatus(403);
    })
})

module.exports = router;
