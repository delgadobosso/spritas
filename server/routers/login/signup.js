var express = require('express');
var router = express.Router();

router.post('/', (req, res) => {
    const errors = req.validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({errors: errors.array()});

    req.bcrypt.hash(req.body.pass, req.saltRounds, function(err, hash) {
        req.pool.query(`INSERT INTO users (email,username,nickname,pass,type) VALUES(?,?,?,?,"USER")`,
        [req.body.email, req.body.username, req.body.nickname, hash],
        (error, result, fields) => {
            if (error) {
                if (error.errno == 1062) {
                    var errType = error.sqlMessage.split(' ').pop();
                    if (errType === "'users.username'") res.send({'status': 'failure', 'message': 'this username is already in use'});
                    else res.send({'status': 'failure', 'message': 'this email is already in use'});
                } else res.sendStatus(500);
            } else {
                res.send({'status': 'success', 'message': 'successfully created account'});
            }
        })
    })
})

module.exports = router;
