var express = require('express');
var router = express.Router();

router.get('/', (req, res) => {
    const id = req.id;
    req.pool.query(`SELECT replies.*, users.username AS username, users.nickname AS nickname, users.avatar AS avatar, users.type AS userType
    FROM replies
    LEFT JOIN users ON replies.idUser = users.id
    WHERE replies.id = ?`,
    id, (error, result, fields) => {
        if (error) return res.status(500).send(error);

        else res.send(result);
    })
})

module.exports = router;
