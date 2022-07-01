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

    // Upload file to Imgur and add that link
    if (type === "VIDO" && req.body.link !== "") {
        req.pool.query(`INSERT INTO posts (idUser,title,subtitle,body,link,type)
        VALUES(?,?,?,?,?,?)`,
        [req.session.user.id, req.body.title, req.body.subtitle, req.body.body, req.body.link, type], (error, result, fields) => {
            if (error) return res.status(500).send(error);

            const resId = result.insertId.toString();
            return res.status(200).send(resId);
        });
    } else if (req.file && req.file.buffer && (type === "IMG" || type === "VIDO")) {
        if (imgurCurrent <= imgurLimit) {
            const file64 = req.file.buffer.toString('base64');
            imgur.uploadBase64(file64,
                    undefined,
                    req.body.title,
                    req.body.body)
                .then((json) => {
                    if (json.link) {
                        req.pool.query(`INSERT INTO posts (idUser,title,subtitle,body,link,deletehash,type)
                        VALUES(?,?,?,?,?,?,?)`,
                        [req.session.user.id, req.body.title, req.body.subtitle, req.body.body, json.link, json.deletehash, type], (error, result, fields) => {
                            if (error) return res.status(500).send(error);

                            imgurCurrent++;
                            console.log('Current Imgur upload: ' + imgurCurrent);

                            const resId = result.insertId.toString();
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
    // No link insert otherwise
    } else {
        req.pool.query(`INSERT INTO posts (idUser,title,subtitle,body,type)
        VALUES(?,?,?,?,?)`,
        [req.session.user.id, req.body.title, req.body.subtitle, req.body.body, type], (error, result, fields) => {
            if (error) return res.status(500).send(error);

            const resId = result.insertId.toString();
            return res.status(200).send(resId);
        })
    }
})

module.exports = router;
