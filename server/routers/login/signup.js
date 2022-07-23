var express = require('express');
var router = express.Router();
var crypto = require('crypto');

router.post('/', (req, res) => {
    const errors = req.validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({errors: errors.array()});

    var username = req.body.username.replace(/[^\w]+/g, '');
    var nickname = req.body.nickname.replace(/[\s]{2,}/g, " ");
    const verifyHash = crypto.createHash('md5').update((Math.random() * 100) + Date.now().toString(36)).digest('hex');

    req.bcrypt.hash(req.body.pass, req.saltRounds, function(err, hash) {
        req.pool.query(`INSERT INTO users (email,username,nickname,pass,type,hash) VALUES(?,?,?,?,"REGI",?)`,
        [req.body.email, username, nickname, hash, verifyHash],
        (error, result, fields) => {
            if (error) {
                if (error.errno == 1062) {
                    var errType = error.sqlMessage.split(' ').pop();
                    if (errType === "'users.username'") res.send({'status': 'failure', 'message': 'this username is already in use'});
                    else res.send({'status': 'failure', 'message': 'this email is already in use'});
                } else res.sendStatus(500);
            } else {
                const link = `http://localhost:3000/verify/${username}/${verifyHash}`;
                req.transporter.sendMail({
                    from: '"The Spritas"',
                    to: req.body.email,
                    subject: "Validate Your Email",
                    text: `Validate your email for account @${username} by going to this link: ${link}`,
                    html: `Hey ${nickname},<br><br>You have registered an account as @${username} on The Spritas.<br>Please <a href="${link}">click here</a> to verify your email on this account <strong>within the hour</strong>.<br><br>See You There,<br>The Spritas`
                }, (err, info) => {
                    if (err) return res.status(500).send({'status': 'failure', 'message': 'email verification error'});
                    else return res.send({'status': 'success', 'message': 'successfully created account'});
                });
            }
        })
    })
})

module.exports = router;
