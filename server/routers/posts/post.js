var express = require('express');
var router = express.Router();

router.get('/', (req, res) => {
    if (req.headers.referer) {
        const id = req.id;
        req.pool.query(`SELECT posts.*, users.username AS username, users.nickname AS nickname, users.avatar AS avatar, users.type AS userType
            FROM posts
            LEFT JOIN users ON posts.idUser = users.id
            WHERE (posts.id = ?)
            OR (posts.status = "UPDT" AND posts.idParent = ?)
            ORDER BY posts.id = ? DESC, posts.ts`,
        [id, id, id], (error, result, fields) => {
            if (error) return res.status(500).send(error);
            
            else res.send(result);
        })
    } else res.redirect('/p/' + req.id);
})

module.exports = router;
