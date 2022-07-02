var express = require('express');
var router = express.Router();

router.post('/', (req, res) => {
    const errors = req.validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({errors: errors.array()});

    req.pool.query(`SELECT * FROM users WHERE username = ? LIMIT 1`,
    req.body.username, (error, result, fields) => {
        if (error) return res.status(500).send(error);

        else if (result.length > 0) {
            req.bcrypt.compare(req.body.pass, result[0].pass, (err, ress) => {
                if (ress) {
                    req.session.regenerate(() => {
                        req.session.save((err) => {
                            const userRes = result[0];
                            req.pool.query(`INSERT INTO users_sessions (idUser, session_id) VALUES (?, ?)`, [userRes.id, req.session.id], (error, result, fields) => {
                                if (error) return res.status(500).send(error);

                                else {
                                    const user = (({id, username, nickname, avatar, type}) => ({id, username, nickname, avatar, type}))(userRes);
                                    req.session.user = user;
                                    res.redirect('/');
                                }
                            })
                        })
                    })
                }
                else res.send({'status': 'failure', 'message': 'wrong username or password'});
            })
        } else {
            res.send({'status': 'failure', 'message': 'wrong username or password'});
        }
    })
})

module.exports = router;
