var express = require('express');
var router = express.Router();

router.post('/', (req, res) => {
    if (!req.session.user) return res.sendStatus(401);
    if (req.session.user.type === "BAN") return res.sendStatus(403);
    const errors = req.validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({errors: errors.array()});

    // Get the post this comment is for
    req.pool.query(`SELECT * FROM posts WHERE id = ?`, req.body.id, (error, result, fields) => {
        if (error) return res.status(500).send(error);

        if (result.length > 0) {
            const parent = result[0];
            // Check if this user is blocked by the OP
            req.pool.query(`SELECT * FROM users_blocked
            WHERE (blockerId = ? AND blockedId = ?)`,
            [parent.idUser, req.session.user.id], (error, result, fields) => {
                if (error) return res.status(500).send(error);

                if (result.length > 0) return res.sendStatus(403);

                // Don't let OP comment on own post
                if (req.session.user.id === parent.idUser) return res.sendStatus(403);
                else {
                    req.pool.query(`INSERT INTO replies (idPost,idUser,body)
                    VALUES (?,?,?)`, [parent.id, req.session.user.id, req.body.reply], (error, result, fields) => {
                        if (error) return res.status(500).send(error);

                        const resId = result.insertId.toString();
                        
                        req.pool.query(`UPDATE posts SET tsReply = CURRENT_TIMESTAMP WHERE id = ?`,
                        parent.id, (error, result, fields) => {
                            if (error) return res.status(500).send(error);

                            return res.status(200).send(resId);
                        })
                    })
                }
            })
        } else return res.status(400).json({error: "No post to reply to."});
    })
})

module.exports = router;
