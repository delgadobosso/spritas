var express = require('express');
var router = express.Router();

router.get('/', (req, res) => {
    if (req.headers.referer) {
        var offset;
        var limit;
        if (req.offset && parseInt(req.offset)) offset = parseInt(req.offset);
        else offset = 0;
        if (req.limit && parseInt(req.limit)) limit = Math.min(24, parseInt(req.limit)) + 1;
        else limit = 0;
        req.pool.query(`
            SELECT 
                p1.id,
                p1.idParent,
                p1.idUser,
                p1.title,
                IFNULL(t1.subtitle, p1.subtitle) AS subtitle,
                IFNULL(t1.body, p1.body) AS body,
                IFNULL(t1.status, p1.status) AS status,
                IFNULL(t1.link, p1.link) AS link,
                IFNULL(t1.type, p1.type) AS type,
                p1.perm,
                IFNULL(t1.ts, p1.ts) AS ts,
                users.username AS username,
                users.nickname AS nickname,
                users.avatar AS avatar
            FROM posts AS p1
            LEFT JOIN users
            ON p1.idUser = users.id
            LEFT JOIN (
                SELECT *
                FROM posts AS p
                INNER JOIN (
                    SELECT MAX(id) AS id
                    FROM posts
                    WHERE posts.status = 'UPDT'
                    GROUP BY idParent) AS t
                USING (id)) AS t1
            ON p1.id = t1.idParent
            WHERE p1.idParent IS NULL
            AND (p1.status IS NULL OR (p1.status = 'DELE' AND t1.id IS NOT NULL))
            ORDER BY IFNULL(t1.ts, p1.ts) DESC
            LIMIT ?,?`,
        [offset, limit], (error, result, fields) => {
            if (error) res.status(500).send(error);

            else return res.send(result);
        });
    } else res.redirect('/');
})

module.exports = router;
