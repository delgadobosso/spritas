var express = require('express');
var router = express.Router();

router.post('/', (req, res) => {
    if (!req.session.user) return res.sendStatus(401);
    else if (req.session.user.type === "BAN") return res.sendStatus(403);
    const errors = req.validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({errors: errors.array()});

    const validVid = ["video/mp4", "video/webm"];
    const validPic = ["image/png", "image/jpeg", "image/gif"];

    var type = "TEXT";
    if (req.file) {
        if (validVid.includes(req.file.mimetype)) type = "VIDO";
        else if (validPic.includes(req.file.mimetype)) type = "IMG";
    } else if (req.body.link) {
        type = "VIDO";
    }

    req.pool.query(`SELECT * FROM posts WHERE id = ?`,
    req.body.id, (error, result, fields) => {
            if (error) return res.status(500).send(error);

            // Valid first post found
            if (result.length > 0) {
                const parent = result[0];

                // Check if this user is OP
                if (req.session.user.id === parent.idUser) {
                    // Add link if it's a VIDO
                    if (type === "VIDO" && req.body.link !== "") {
                        req.pool.query("INSERT INTO posts (idParent,idUser,title,subtitle,body,status,link,type) VALUES(?,?,?,?,?,'UPDT',?,?)",
                        [parent.id, req.session.user.id, parent.title, req.body.subtitle, req.body.body, req.body.link, type],
                        (error, result, fields) => {
                            if (error) return res.status(500).send(error);

                            const resId = parent.id.toString();
                            return res.status(200).send(resId);
                        })
                    } else if (req.file && req.file.buffer && (type === "IMG" || type === "VIDO")) {
                        // Upload file to imgur and update
                        if (req.imgurCurrent <= req.imgurLimit) {
                            req.imgurCurrent++;
                            console.log('Current Imgur upload: ' + req.imgurCurrent);
                            const file64 = req.file.buffer.toString('base64');
                            req.imgur.uploadBase64(file64,
                                    undefined,
                                    parent.title,
                                    req.body.subtitle)
                                .then((json) => {
                                    if (json.link) {
                                        req.pool.query("INSERT INTO posts (idParent,idUser,title,subtitle,body,status,link,deletehash,type) VALUES(?,?,?,?,?,'UPDT',?,?,?)",
                                        [parent.id, req.session.user.id, parent.title, req.body.subtitle, req.body.body, json.link, json.deletehash, type],
                                        (error, result, fields) => {
                                            if (error) return res.status(500).send(error);

                                            const resId = parent.id.toString();
                                            return res.status(200).send(resId);
                                        })
                                    } else return res.status(500).json({error: "Issue uploading to imgur."});
                                })
                                .catch((err) => {
                                    console.error(err.message);
                                    res.redirect('/');
                                });
                        } else {
                            res.status(503).json({error: "Imgur upload capacity reached. Please try again in one hour."});
                        }
                    } else {
                    // No link insert
                        req.pool.query("INSERT INTO posts (idParent,idUser,title,subtitle,body,status) VALUES(?,?,?,?,?,'UPDT')",
                        [parent.id, req.session.user.id, parent.title, req.body.subtitle, req.body.body],
                        (error, result, fields) => {
                            if (error) return res.status(500).send(error);

                            const resId = parent.id.toString();
                            return res.status(200).send(resId);
                        })
                    }
                } else return res.sendStatus(403);
            } else return res.status(400).json({error: "No post to update."});
        })
})

module.exports = router;
