var express = require('express');
var router = express.Router();
const path = require('path');
const fs = require('fs');

router.post('/', (req, res) => {
    if (parseInt(req.body.id) === req.session.user.id) {
        const errors = req.validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({errors: errors.array()});
        if (req.session.user.type === 'BAN') return res.sendStatus(403);

        // Check if it's been long enough to make change
        req.pool.query(`SELECT avatar, lastTs FROM users WHERE id = ?`, req.body.id, (error, result, fields) => {
            if (error) return res.status(500).send(error);

            var last = new Date(result[0].lastTs);
            var current = new Date();
            var elapsed = (current - last) / 60000;

            if (elapsed >= 5) {
                var avatar = (req.file) ? req.file.filename : null;
                var ogAvatar = result[0].avatar;
                var nickname = (req.body.nickname !== "") ? req.body.nickname : null;
                var bio = req.body.bio;
                req.pool.query(`
                UPDATE users
                SET
                    avatar = CASE WHEN ? IS NOT NULL
                        THEN ?
                        ELSE avatar
                    END,
                    nickname = CASE WHEN ? IS NOT NULL
                        THEN ?
                        ELSE nickname
                    END,
                    bio = CASE WHEN ? IS NOT NULL
                        THEN ?
                        ELSE bio
                    END,
                    lastTs = CURRENT_TIMESTAMP
                WHERE id = ?
                `, [avatar, avatar, nickname, nickname, bio, bio, req.body.id], (error, result, fields) => {
                    if (error) return res.status(500).send(error);

                    else {
                        // delete old avatar
                        if (avatar && ogAvatar) {
                            const ogPath = path.join(__dirname, "/media/avatars/", ogAvatar);
                            if (fs.existsSync(ogPath)) {
                                fs.unlink(ogPath, (err) => {
                                    if (err) return console.error(err);
                                });
                            }
                        }

                        // update sessions user info
                        if (req.file) req.session.user.avatar = avatar;
                        if (req.body.nickname !== "") req.session.user.nickname = nickname;

                        return res.status(200).send('updated');
                    }
                })
            }
            // it hasn't been enough time yet
            else return res.status(200).send('time');
        })
    }

    else return res.sendStatus(403);
})

module.exports = router;
