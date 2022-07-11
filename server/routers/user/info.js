var express = require('express');
var router = express.Router();

router.get('/', (req, res) => {
    if (req.headers.referer) {
        req.pool.query(`SELECT id, username, nickname, bio, avatar, type, ts, lastTs FROM users WHERE username = ?`,
        req.name, (error, result, fields) => {
            if (error) return res.status(500).send(error);

            else {
                var info = result[0];
                if (req.session.user && info) {
                    req.pool.query(`SELECT * FROM users_blocked
                    WHERE (blockerId = ? AND blockedId = ?) OR (blockerId = ? AND blockedId = ?)`,
                    [req.session.user.id, info.id, info.id, req.session.user.id], (error, result, fields) => {
                        if (error) return res.status(500).send(error);
                        else if (result.length > 1) {
                            info.blocked = true;
                            info.blocking = true;
                            return res.send(info);
                        } else if (result.length > 0 && result[0].blockedId === info.id) {
                            info.blocking = true;
                            return res.send(info);
                        } else if (result.length > 0 && result[0].blockedId === req.session.user.id) {
                            info.blocked = true;
                            return res.send(info);
                        } else return res.send(info);
                    })
                } else {
                    return res.send(info);
                }
            }
        });
    } else res.redirect('/user/' + req.params.id);
})

module.exports = router;
