var express = require('express');
var router = express.Router();

router.post('/', (req, res) => {
    if (!req.session.user) return res.sendStatus(401);
    if (req.session.user.type === "BAN") return res.sendStatus(403);
    const errors = req.validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({errors: errors.array()});

    var parentPost;
    var parentComment;
    // Get parent comment
    req.pool.query(`SELECT * FROM replies WHERE id = ?`, req.body.id, (error, result, fields) => {
        if (error) return res.status(500).send(error);

        if (result.length > 0) {
            parentComment = result[0];

            // Get parent post
            req.pool.query(`SELECT * FROM posts WHERE id = ?`, parentComment.idPost, (error, result, fields) => {
                if (error) return res.status(500).send(error);

                parentPost = result[0];

                // Check if post or comment OPs are blocking this user
                req.pool.query(`SELECT * FROM users_blocked
                WHERE (blockerId = ? AND blockedId = ?) OR (blockerId = ? AND blockedId = ?)`,
                [parentPost.idUser, req.session.user.id, parentComment.idUser, req.session.user.id],
                (error, result, fields) => {
                    if (error) return res.status(500).send(error);

                    if (result.length > 0) return res.sendStatus(403);
                    else {
                        req.pool.query(`INSERT INTO replies (idPost,idParent,idUser,body)
                        VALUES (?,?,?,?)`, [parentComment.idPost, parentComment.id, req.session.user.id, req.body.reply], (error, result, fields) => {
                            if (error) return res.status(500).send(error);

                            const resId = result.insertId.toString();

                            // Only update post ts if not the OP replying
                            if (req.session.user.id === parentPost.idUser) return res.status(200).send(resId);
                            else {
                                req.pool.query(`UPDATE posts SET tsReply = CURRENT_TIMESTAMP WHERE id = ?`, parentPost.id, (error, result, fields) => {
                                    if (error) return res.status(500).send(error);

                                    req.pool.query(`UPDATE replies SET tsReply = CURRENT_TIMESTAMP WHERE id = ?`, parentComment.id, (error, result, fields) => {
                                        if (error) return res.status(500).send(error);

                                        return res.status(200).send(resId);
                                    })
                                })
                            }
                        })
                    }
                })
            })
        } else return res.status(400).json({error: "No comment to reply to."});
    })
})

module.exports = router;
