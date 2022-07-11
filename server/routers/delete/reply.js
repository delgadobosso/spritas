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

        const reply = result[0];
        req.pool.query(`SELECT idUser FROM posts WHERE id = ?`, reply.idPost, (error, result, fields) => {
            const post = result[0];
            if (req.session.user.id === reply.idUser || req.session.user.type === 'ADMN' || req.session.user.id === post.idUser) {
                var byWho;
                 if (req.session.user.type === 'ADMN') byWho = 'Deleted By Admin';
                 if (req.session.user.id === post.idUser) byWho = 'Deleted By OP';
                 if (req.session.user.id === reply.idUser) byWho = 'Deleted By User';
                req.pool.query(`UPDATE replies
                SET body = ?, status = 'DELE'
                WHERE id = ?`, [byWho, req.body.id], (error, result, fields) => {
                    if (error) return res.status(500).send(error);
                    
                    req.pool.query(`INSERT INTO audit_log (idFrom,idTo,idContent,type,reason) VALUES (?,?,?,'DR',?)`, [req.session.user.id, reply.idUser, reply.id, req.body.reason], (error, result, fields) => {
                        if (error) return res.status(500).send(error);

                        return res.sendStatus(200);
                    });
                })
            } else return res.sendStatus(403);
        })
        
    })
})

module.exports = router;
