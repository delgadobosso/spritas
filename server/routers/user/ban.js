var express = require('express');
var router = express.Router();

router.post('/', (req, res) => {
    if (!req.session.user) return res.sendStatus(401);
    else if (req.session.user.type !== 'ADMN') return res.sendStatus(403);

    req.pool.query(`UPDATE users
        SET type = "BAN"
        WHERE id = ?`, req.id, (error, result, fields) => {
            if (error) return res.status(500).send(error);
            else {
                req.pool.query(`SELECT *
                FROM users_sessions
                WHERE idUser = ?`, req.id, (error, result, fields) => {
                    result.forEach(userSession => {
                        req.sessionStore.get(userSession.session_id, (err, session) => {
                            session.user.type = 'BAN';
                            req.sessionStore.set(userSession.session_id, session);
                        })
                    });
                    req.pool.query(`INSERT INTO audit_log (idFrom,idTo,type,reason) VALUES (?,?,'BU',?)`, [req.session.user.id, req.id, req.body.reason], (error, result, fields) => {
                        if (error) return res.status(500).send(error);

                        return res.sendStatus(200);
                    });
                })
            }
        })
})

module.exports = router;
