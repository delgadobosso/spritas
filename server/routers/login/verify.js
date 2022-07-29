var express = require('express');
var router = express.Router();

router.get('/', (req, res) => {
    req.pool.query(`SELECT id,hash,ts FROM users WHERE username = ? LIMIT 1`,
    req.username, (error, result, fields) => {
        if (error) return res.status(500).send(error);

        if (result.length > 0) {
            var ts = new Date(result[0].ts);
            var current = new Date();
            var elapsed = (current - ts) / 60000;

            if (req.hash === result[0].hash && elapsed <= 60) {
                req.pool.query(`UPDATE users
                SET type = "USER", hash = NULL
                WHERE id = ?`,
                result[0].id, (error, result, fields) => {
                    if (error) return res.status(500).send(error);

                    return res.status(200).redirect('/login?success=email-verify');
                })
            } else if (req.hash === result[0].hash) {
                req.pool.query(`DELETE FROM users WHERE id = ?`,
                result[0].id, (error, result, fields) => {
                    if (error) return res.status(500).send(error);

                    return res.status(408).redirect('/login?failure=email-verify');
                })
            }
        } else return res.status(401).redirect('/login?failure=email-verify');
    })
})

module.exports = router;
