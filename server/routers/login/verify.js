var express = require('express');
var router = express.Router();

router.get('/', (req, res) => {
    req.pool.query(`SELECT id,hash,ts FROM users WHERE username = ? LIMIT 1`,
    req.username, (error, result, fields) => {
        if (error) return res.status(500).send(error);

        if (result.length > 0) {
            if (req.hash === result[0].hash) {
                req.pool.query(`UPDATE users
                SET type = "USER", hash = NULL
                WHERE id = ?`,
                result[0].id, (error, result, fields) => {
                    if (error) return res.status(500).send(error);

                    return res.status(200).redirect('/');
                })
            }
        } else return res.status(401).redirect('/');
    })
})

module.exports = router;
