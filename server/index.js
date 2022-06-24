require('dotenv').config();
const path = require('path');
const fs = require('fs');
const reactApp = path.join(__dirname, process.env.REACT_BUILD);

const bcrypt = require('bcrypt');
const saltRounds = 10;

const mysql = require('mysql');
const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: process.env.SQL_USER,
    password: process.env.SQL_PW,
    database: process.env.SQL_DB
});

const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const { body, validationResult } = require('express-validator');
const app = express();
const port = process.env.PORT;

const multer = require('multer');
const memStorage = multer.memoryStorage();
const memUpload = multer({
    storage: memStorage,
    fileFilter: (req, file, cb) => {
        var valid = ["video/mp4", "video/webm", "image/png", "image/jpeg", "image/gif"];
        if (valid.includes(file.mimetype)) cb(null, true);
        else cb(null, false);
    },
    limits: {
        fileSize: 20971520
    }
});
const avatarStore = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './media/avatars');
    },
    filename: (req, file, cb) => {
        var fileType = file.mimetype.split('/')[1];
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, `${file.originalname}-${uniqueSuffix}.${fileType}`);
    }
});
const avatarUpload = multer({
    storage: avatarStore,
    limits: {
        fileSize: 1048576
    }
});

const imgurLimit = 40;
var imgurCurrent = 0;
let resetImgurLimit = setInterval(() => {
    imgurCurrent = 0;
    console.log('Reset Imgur upload count to: 0');
}, 1000 * 60 * 60);

const sessionStore = new MySQLStore({}, pool);
app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.SESS_SECRET,
    store: sessionStore
}))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../spritas/build')));

const imgur = require('imgur');
const { json } = require('express');
imgur.setClientId(process.env.IMGUR_ID);
imgur.setCredentials(process.env.IMGUR_USER, process.env.IMGUR_PW, process.env.IMGUR_ID);

app.get('/', (req, res) => {
    res.sendFile(reactApp);
});

app.get('/u/:name', (req, res) => {
    res.sendFile(reactApp);
})

app.get('/login', (req, res) => {
    if (req.session.user) res.redirect('/');
    else res.sendFile(reactApp);
})

app.get('/post/:id', (req, res) => {
    pool.query(`SELECT idParent FROM posts WHERE id = ?`,
    req.params.id, (error, result, fields) => {
        if (error) return res.sendStatus(500);

        if (result[0].idParent == null) res.sendFile(reactApp);
        else res.redirect('/');
    })
})

app.get('/create/topic/:id?', (req, res) => {
    if (!req.session.user) res.sendStatus(401);
    else if (req.session.user.type != "ADMN") res.sendStatus(403);
    else res.sendFile(reactApp);
})

app.get('/create/post', (req, res) => {
    if (!req.session.user) res.sendStatus(401);
    else if (req.session.user.type === "BAN") res.sendStatus(403);
    else return res.sendFile(reactApp);
})

app.get('/home/new/:offset.:limit', (req, res) => {
    if (req.headers.referer) {
        var offset;
        var limit;
        if (req.params.offset && parseInt(req.params.offset)) offset = parseInt(req.params.offset);
        else offset = 0;
        if (req.params.limit && parseInt(req.params.limit)) limit = Math.min(24, parseInt(req.params.limit)) + 1;
        else limit = 0;
        pool.query(`
            SELECT 
                p1.id,
                p1.idParent,
                p1.idUser,
                p1.title,
                IFNULL(t1.subtitle, p1.subtitle) AS subtitle,
                IFNULL(t1.body, p1.body) AS body,
                IFNULL(t1.update, p1.update) AS 'update',
                IFNULL(t1.link, p1.link) AS link,
                IFNULL(t1.type, p1.type) AS type,
                p1.perm,
                p1.ts,
                IFNULL(t1.lastTs, p1.lastTs) AS lastTs,
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
                    WHERE posts.update = 'UPDT'
                    GROUP BY idParent) AS t
                USING (id)) AS t1
            ON p1.id = t1.idParent
            WHERE p1.idParent IS NULL
            AND (p1.update IS NULL OR (p1.update = 'DELE' AND t1.id IS NOT NULL))
            ORDER BY p1.lastTs DESC
            LIMIT ?,?`,
        [offset, limit], (error, result, fields) => {
            if (error) res.status(500).send(error);

            else return res.send(result);
        });
    } else res.redirect('/');
})

app.post('/login/signup',
    body('username').trim().isLength({ min: 2 }).escape(),
    body('nickname').trim().isLength({ min: 2 }).escape(),
    body('pass').isLength({ min: 8 }),
    body('email').isEmail(),
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({errors: errors.array()});

        bcrypt.hash(req.body.pass, saltRounds, function(err, hash) {
            pool.query(`INSERT INTO users (email,username,nickname,pass,type) VALUES(?,?,?,?,"USER")`,
            [req.body.email, req.body.username, req.body.nickname, hash],
            (error, result, fields) => {
                if (error) {
                    if (error.errno == 1062) {
                        var errType = error.sqlMessage.split(' ').pop();
                        if (errType === "'users.username'") res.send({'status': 'failure', 'message': 'this username is already in use'});
                        else res.send({'status': 'failure', 'message': 'this email is already in use'});
                    } else res.sendStatus(500);
                } else {
                    res.send({'status': 'success', 'message': 'successfully created account'});
                }
            })
        })
    }
)

app.post('/login/signin',
    body('username').trim().isLength({ min: 2 }).escape(),
    body('pass').isLength({ min: 8 }),
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({errors: errors.array()});

        pool.query(`SELECT * FROM users WHERE username = ? LIMIT 1`,
        req.body.username, (error, result, fields) => {
            if (error) return res.status(500).send(error);

            else if (result.length > 0) {
                bcrypt.compare(req.body.pass, result[0].pass, (err, ress) => {
                    if (ress) {
                        req.session.regenerate(() => {
                            req.session.save((err) => {
                                const userRes = result[0];
                                pool.query(`INSERT INTO users_sessions (idUser, session_id) VALUES (?, ?)`, [userRes.id, req.session.id], (error, result, fields) => {
                                    if (error) return res.status(500).send(error);

                                    else {
                                        const user = (({id, username, nickname, avatar, type}) => ({id, username, nickname, avatar, type}))(userRes);
                                        req.session.user = user;
                                        res.redirect('/');
                                    }
                                })
                            })
                        })
                    }
                    else res.send({'status': 'failure', 'message': 'wrong username or password'});
                })
            } else {
                res.send({'status': 'failure', 'message': 'wrong username or password'});
            }
        })
    }
)

app.get('/logout', (req, res) => {
    if (req.session.user) {
        req.session.destroy(() => {
            res.redirect('/');
        })
    } else res.redirect('/');
})

app.get('/session/user', (req, res) => {
    if (req.headers.referer) {
        res.send(req.session.user);
    } else res.redirect('/');
})

// Get post
app.get('/p/:id', (req, res) => {
    if (req.headers.referer) {
        const id = req.params.id;
        pool.query(`SELECT posts.*, users.username AS username, users.nickname AS nickname, users.avatar AS avatar, users.type AS userType
            FROM posts
            LEFT JOIN users ON posts.idUser = users.id
            WHERE (posts.id = ? AND (posts.update != "DELE" OR posts.update IS NULL))
            OR (posts.update = "UPDT" AND posts.idParent = ?)
            ORDER BY posts.id = ? DESC, posts.ts`,
        [id, id, id], (error, result, fields) => {
            if (error) return res.status(500).send(error);
            
            else res.send(result);
        })
    } else res.redirect('/post/' + req.params.id);
})

// Get replies to replies
app.get('/rr/:id.:offset.:limit', (req, res) => {
    if (req.headers.referer) {
        const id = req.params.id;
        var offset;
        var limit;
        if (req.params.offset && parseInt(req.params.offset)) offset = parseInt(req.params.offset);
        else offset = 0;
        if (req.params.limit && parseInt(req.params.limit)) limit = Math.min(24, parseInt(req.params.limit)) + 1;
        else limit = 0;
        pool.query(`SELECT posts.*, users.username AS username, users.nickname AS nickname, users.avatar AS avatar, users.type AS userType
            FROM posts
            LEFT JOIN users ON posts.idUser = users.id
            WHERE posts.idParent = ? AND posts.type = 'RPLY'
            ORDER BY posts.ts DESC
            LIMIT ?,?`,
        [id, offset, limit], (error, result, fields) => {
            if (error) return res.status(500).send(error);

            else res.send(result);
        })
    } else res.redirect('/');
})

// Get replies to posts
app.get('/r/:id.:offset.:limit', (req, res) => {
    if (req.headers.referer) {
        const id = req.params.id;
        var offset;
        var limit;
        if (req.params.offset && parseInt(req.params.offset)) offset = parseInt(req.params.offset);
        else offset = 0;
        if (req.params.limit && parseInt(req.params.limit)) limit = Math.min(24, parseInt(req.params.limit)) + 1;
        else limit = 0;
        pool.query(`SELECT posts.*, users.username AS username, users.nickname AS nickname, users.avatar AS avatar, users.type AS userType
            FROM posts
            LEFT JOIN users ON posts.idUser = users.id
            WHERE posts.idParent = ? AND posts.type = 'RPLY'
            ORDER BY posts.id = ? DESC, posts.lastTs DESC
            LIMIT ?,?`,
        [id, id, offset, limit], (error, result, fields) => {
            if (error) return res.status(500).send(error);
            
            else res.send(result);
        })
    } else res.redirect('/post/' + req.params.id);
})

app.post('/create/topic',
    body('id').isInt().optional({checkFalsy: true}),
    body('name').trim().isLength({ min: 2 }).escape(),
    body('description').trim().isLength({ min: 2 }).escape(),
    body('type').isIn(["TEXT", "BLOG", "VIDO", "IMG"]),
    body('perm').isIn(["ALL", "ADMN"]),
    (req, res) => {
        if (!req.session.user) return res.sendStatus(401);
        else if (req.session.user.type != "ADMN") return res.sendStatus(403);

        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({errors: errors.array()});

        var id;
        if (req.body.id != "") id = req.body.id;
        else id = null;
        pool.query(`INSERT INTO topics (idParent,name,description,type,perm)
        VALUES(?,?,?,?,?)`,
        [id, req.body.name, req.body.description, req.body.type, req.body.perm],
        (error, results, fields) => {
            if (error) return res.status(500).send(error);

            res.redirect('/');
        })
    }
)

app.post('/create/post',
    memUpload.single('file'),
    body('title').trim().isLength({ min: 1, max: 64 }).escape(),
    body('subtitle').optional({ checkFalsy: true }).trim().isLength({ max: 32 }).escape(),
    body('link').optional({ checkFalsy: true }).matches(/(https:\/\/www\.)?(www\.)?(?<source1>youtube)\.com\/watch\?v=(?<id>[\w-]+)|(https:\/\/)?(?<source2>youtu\.be)\/(?<id2>[\w-]+)|(https:\/\/)?(?<source3>streamable)\.com\/(?<id3>[\w-]+)/).trim().escape(),
    body('body').trim().isLength({ min: 1, max: 10000 }).escape(),
    (req, res) => {
        if (!req.session.user) return res.sendStatus(401);
        else if (req.session.user.type === "BAN") return res.sendStatus(403);
        const errors = validationResult(req);
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
            pool.query(`INSERT INTO posts (idUser,title,subtitle,body,link,type)
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
                            pool.query(`INSERT INTO posts (idUser,title,subtitle,body,link,deletehash,type)
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
            pool.query(`INSERT INTO posts (idUser,title,subtitle,body,type)
            VALUES(?,?,?,?,?)`,
            [req.session.user.id, req.body.title, req.body.subtitle, req.body.body, type], (error, result, fields) => {
                if (error) return res.status(500).send(error);

                const resId = result.insertId.toString();
                return res.status(200).send(resId);
            })
        }
    }
)

app.post('/create/reply',
    body('id').notEmpty().isInt(),
    body('reply').trim().isLength({ min: 1 }).escape(),
    (req, res) => {
        if (!req.session.user) return res.sendStatus(401);
        if (req.session.user && req.session.user.type === "BAN") return res.sendStatus(403);
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({errors: errors.array()});

        // Working on insert
        pool.query(`SELECT *
        FROM posts
        WHERE id = ?
        OR (id = (
            SELECT idParent
            FROM posts
            WHERE id = ?) AND type != 'RPLY')
        OR id = (
            SELECT idParent
            FROM posts
            WHERE id = (
                SELECT idParent
                FROM posts
                WHERE id = ?))
        ORDER BY id DESC;`, [req.body.id, req.body.id, req.body.id], (error, result, fields) => {
            if (error) return res.status(500).send(error);

            var ogOpId;
            var replyOpId;
            // If this is reply to reply, get the op id of original post
            if (result.length > 1) ogOpId = result[1].idUser;
            // Valid first post of a topic is found
            if (result.length > 0) {
                const parent = result[0];
                replyOpId = result[0].idUser;
                // Check if this user is blocked by the op
                pool.query(`SELECT * FROM users_blocked
                    WHERE (blockerId = ? AND blockedId = ?) OR (blockerId = ? AND blockedId = ?)`,
                    [ogOpId, req.session.user.id, replyOpId, req.session.user.id], (error, blockRes, fields) => {
                        if (error) return res.status(500).send(error);

                        if (blockRes.length > 0) return res.sendStatus(403);

                        // check if post was made by person trying to comment, don't let them
                        if (parent.type !== "RPLY" && req.session.user.id === parent.idUser) return res.sendStatus(403);
                        else {
                            pool.query(`INSERT INTO posts (idParent,idUser,body,type)
                            VALUES(?,?,?,'RPLY')`,
                            [parent.id, req.session.user.id, req.body.reply], (error, result, fields) => {
                                if (error) return res.status(500).send(error);

                                pool.query(`UPDATE posts SET lastTs = CURRENT_TIMESTAMP
                                WHERE id = ? OR id = ?`,
                                [parent.id, parent.idParent], (error, result, fields) => {
                                    if (error) return res.status(500).send(error);

                                    return res.redirect('/');
                                })
                            })
                        }
                    })
            } else return res.status(400).json({error: "No post to reply to."});
        })
    }
)

app.post('/update/post',
    memUpload.single('file'),
    body('id').notEmpty().isInt(),
    body('subtitle').optional({ checkFalsy: true }).trim().isLength({ max: 32 }).escape(),
    body('link').optional({ checkFalsy: true }).matches(/(https:\/\/www\.)?(www\.)?(?<source1>youtube)\.com\/watch\?v=(?<id>[\w-]+)|(https:\/\/)?(?<source2>youtu\.be)\/(?<id2>[\w-]+)|(https:\/\/)?(?<source3>streamable)\.com\/(?<id3>[\w-]+)/).trim().escape(),
    body('body').trim().isLength({ min: 1, max: 10000 }).escape(),
    (req, res) => {
        if (!req.session.user) return res.sendStatus(401);
        else if (req.session.user.type === "BAN") return res.sendStatus(403);
        const errors = validationResult(req);
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

        pool.query(`SELECT * FROM posts WHERE id = ?`,
        req.body.id, (error, result, fields) => {
                if (error) return res.status(500).send(error);

                // Valid first post found
                if (result.length > 0) {
                    const parent = result[0];

                    // Check if this user is OP
                    if (req.session.user.id === parent.idUser) {
                        // Add link if it's a VIDO
                        if (type === "VIDO" && req.body.link !== "") {
                            pool.query("INSERT INTO posts (idParent,idUser,title,subtitle,body,`update`,link,type) VALUES(?,?,?,?,?,'UPDT',?,?)",
                            [parent.id, req.session.user.id, parent.title, req.body.subtitle, req.body.body, req.body.link, type],
                            (error, result, fields) => {
                                if (error) return res.status(500).send(error);
    
                                pool.query(`UPDATE posts SET lastTs = CURRENT_TIMESTAMP
                                WHERE id = ?`, parent.id, (error, result, fields) => {
                                    if (error) return res.status(500).send(error);
    
                                    const resId = parent.id.toString();
                                    return res.status(200).send(resId);
                                })
                            })
                        } else if (req.file && req.file.buffer && (type === "IMG" || type === "VIDO")) {
                            // Upload file to imgur and update
                            if (imgurCurrent <= imgurLimit) {
                                imgurCurrent++;
                                console.log('Current Imgur upload: ' + imgurCurrent);
                                const file64 = req.file.buffer.toString('base64');
                                imgur.uploadBase64(file64,
                                        undefined,
                                        parent.title,
                                        req.body.subtitle)
                                    .then((json) => {
                                        if (json.link) {
                                            pool.query("INSERT INTO posts (idParent,idUser,title,subtitle,body,`update`,link,deletehash,type) VALUES(?,?,?,?,?,'UPDT',?,?,?)",
                                            [parent.id, req.session.user.id, parent.title, req.body.subtitle, req.body.body, json.link, json.deletehash, type],
                                            (error, result, fields) => {
                                                if (error) return res.status(500).send(error);

                                                pool.query(`UPDATE posts SET lastTs = CURRENT_TIMESTAMP
                                                WHERE id = ?`, parent.id, (error, result, fields) => {
                                                    if (error) return res.status(500).send(error);
                    
                                                    const resId = parent.id.toString();
                                                    return res.status(200).send(resId);
                                                })
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
                            pool.query("INSERT INTO posts (idParent,idUser,title,subtitle,body,`update`) VALUES(?,?,?,?,?,'UPDT')",
                            [parent.id, req.session.user.id, parent.title, req.body.subtitle, req.body.body],
                            (error, result, fields) => {
                                if (error) return res.status(500).send(error);

                                pool.query(`UPDATE posts SET lastTs = CURRENT_TIMESTAMP
                                WHERE id = ?`, parent.id, (error, result, fields) => {
                                    if (error) return res.status(500).send(error);

                                    const resId = parent.id.toString();
                                    return res.status(200).send(resId);
                                })
                            })
                        }
                    } else return res.sendStatus(403);
                } else return res.status(400).json({error: "No post to update."});
            })
    }
)

app.get('/featured', (req, res) => {
    if (req.headers.referer) {
        pool.query(`SELECT * FROM featured
        WHERE id = 1`, (error, result, fields) => {
            if (error) return res.status(500).send(error);

            else res.send(result);
        })
    } else res.redirect('/');
})

app.post('/update/featured',
    body('link').matches(/null|(https:\/\/www\.)?(www\.)?(?<source1>youtube)\.com\/watch\?v=(?<id>\w+)|(https:\/\/)?(?<source2>youtu\.be)\/(?<id2>\w+)|(https:\/\/)?(?<source3>streamable)\.com\/(?<id3>\w+)/).trim().isLength({ min: 2 }).escape(),
    (req, res) => {
        if (!req.session.user) return res.sendStatus(401);
        if (req.session.user.type != "ADMN") return res.sendStatus(403);
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({errors: errors.array()});

        pool.query(`UPDATE featured SET link = ? WHERE id = 1`, req.body.link, (error, result, fields) => {
            if (error) return res.status(500).send(error);

            return res.redirect('/');
        })
    }
)

app.post('/delete/post',
    body('ogid').notEmpty().isInt(),
    body('currentid').notEmpty().isInt(),
    (req, res) => {
        if (!req.session.user) return res.sendStatus(401);
        if (req.session.user && req.session.user.type === "BAN") return res.sendStatus(403);
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({errors: errors.array()});

        pool.query(`SELECT *
        FROM posts AS p
        WHERE id = ?`, req.body.currentid, (error, result, fields) => {
            if (error) return res.status(500).send(error);

            if (req.session.user.id === result[0].idUser || req.session.user.type === 'ADMN') {
                var deletehash = result[0].deletehash;
                var byWho = (req.session.user.type === 'ADMN') ? 'Deleted By Admin' : 'Deleted By User';
                pool.query(`UPDATE posts AS p
                SET subtitle = NULL, body = ?, p.update = 'DELE', link = NULL, deletehash = NULL, type = 'TEXT'
                WHERE id = ?`, [byWho, req.body.currentid], (error, result, fields) => {
                    if (error) return res.status(500).send(error);

                    if (deletehash) {
                        imgur.deleteImage(deletehash)
                            .then(() => { return res.sendStatus(200) })
                            .catch((err) => {
                                console.error(err.message);
                                return res.sendStatus(200);
                            });
                    } else return res.sendStatus(200);
                })
            }
            else return res.sendStatus(403);
        })
    }
)

app.post('/delete/reply',
    body('id').notEmpty().isInt(),
    (req, res) => {
        if (!req.session.user) return res.sendStatus(401);
        if (req.session.user && req.session.user.type === "BAN") return res.sendStatus(403);
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({errors: errors.array()});

        pool.query(`SELECT *
        FROM posts AS p
        WHERE id = ?`, req.body.id, (error, result, fields) => {
            if (error) return res.status(500).send(error);

            if (req.session.user.id === result[0].idUser || req.session.user.type === 'ADMN') {
                var byWho = (req.session.user.type === 'ADMN') ? 'Deleted By Admin' : 'Deleted By User';
                pool.query(`UPDATE posts AS p
                SET body = ?, p.update = 'DELE'
                WHERE id = ?`, [byWho, req.body.id], (error, result, fields) => {
                    if (error) return res.status(500).send(error);
                    else return res.sendStatus(200);
                })
            }
        })
    }
)

app.post('/delete/topic',
    body('id').notEmpty().isInt(),
    (req, res) => {
        if (!req.session.user) return res.sendStatus(401);
        else if (req.session.user.type !== 'ADMN') return res.sendStatus(403);
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({errors: errors.array()});

        pool.query(`UPDATE topics AS t
        SET status = 'DELE'
        WHERE id = ?`, req.body.id, (error, result, fields) => {
            if (error) return res.status(500).send(error);
            else return res.sendStatus(200);
        })
    }
)

app.get('/user/info/:name', (req, res) => {
    if (req.headers.referer) {
        pool.query(`SELECT id, username, nickname, bio, avatar, type, ts, lastTs FROM users WHERE username = ?`,
        req.params.name, (error, result, fields) => {
            if (error) return res.status(500).send(error);

            else {
                var info = result[0];
                if (req.session.user) {
                    pool.query(`SELECT * FROM users_blocked
                    WHERE (blockerId = ? AND blockedId = ?) OR (blockerId = ? AND blockedId = ?)`,
                    [req.session.user.id, info.id, info.id, req.session.user.id], (error, result, fields) => {
                        if (error) return res.status(500).send(error);
                        else if (result.length > 1) {
                            info.blocked = true;
                            info.blocking = true;
                            return res.send(info);
                        } else if (result.length > 0 && result[0].blockedId === info.id) {
                            info.blocking = true;
                            return res.send(info);
                        } else if (result.length > 0 && result[0].blockedId === req.session.user.id) {
                            info.blocked = true;
                            return res.send(info);
                        } else return res.send(info);
                    })
                } else {
                    return res.send(info);
                }
            }
        });
    } else res.redirect('/user/' + req.params.id);
})

app.get('/user/posts/:id.:offset.:limit', (req, res) => {
    if (req.headers.referer) {
        const id = req.params.id;
        var offset;
        var limit;
        if (req.params.offset && parseInt(req.params.offset)) offset = parseInt(req.params.offset);
        else offset = 0;
        if (req.params.limit && parseInt(req.params.limit)) limit = Math.min(24, parseInt(req.params.limit)) + 1;
        else limit = 0;
        pool.query(`
        SELECT 
            p1.id,
            p1.idParent,
            p1.idUser,
            p1.title,
            IFNULL(t1.subtitle, p1.subtitle) AS subtitle,
            IFNULL(t1.body, p1.body) AS body,
            IFNULL(t1.update, p1.update) AS 'update',
            IFNULL(t1.link, p1.link) AS link,
            IFNULL(t1.type, p1.type) AS type,
            p1.perm,
            p1.ts,
            IFNULL(t1.lastTs, p1.lastTs) AS lastTs,
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
                WHERE idUser = ? AND posts.update = 'UPDT'
                GROUP BY idParent) AS t
            USING (id)) AS t1
        ON p1.id = t1.idParent
        WHERE p1.idUser = ? AND p1.idParent IS NULL
        AND (p1.update IS NULL OR (p1.update = 'DELE' AND t1.id IS NOT NULL))
        ORDER BY p1.lastTs DESC
        LIMIT ?,?
        `, [id, id, offset, limit], (error, result, fields) => {
            if (error) return res.status(500).send(error);

            else res.send(result);
        });
    } else redirect('/');
})

app.post('/user/update',
    avatarUpload.single('avatar'),
    body('id').isInt(),
    body('nickname').trim().isLength({ min: 2 }).escape(),
    body('bio').isLength({ max: 256 }),
    (req, res) => {
        if (parseInt(req.body.id) === req.session.user.id) {
            if (req.session.user.type === 'BAN') return res.sendStatus(403);

            // Check if it's been long enough to make change
            pool.query(`SELECT avatar, lastTs FROM users WHERE id = ?`, req.body.id, (error, result, fields) => {
                if (error) return res.status(500).send(error);

                var last = new Date(result[0].lastTs);
                var current = new Date();
                var elapsed = (current - last) / 60000;

                if (elapsed >= 5) {
                    var avatar = (req.file) ? req.file.filename : null;
                    var ogAvatar = result[0].avatar;
                    var nickname = (req.body.nickname !== "") ? req.body.nickname : null;
                    var bio = req.body.bio;
                    pool.query(`
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

        else return res.sendStatus(200);
})

app.get('/media/avatars/:avatar', express.static(path.join(__dirname, '/media/avatars')), (req, res) => {
    res.sendFile(path.join(__dirname, '/media/avatars/', req.params.avatar));
})

app.post('/ban/user/:id', (req, res) => {
    if (!req.session.user) return res.sendStatus(401);
    else if (req.session.user.type !== 'ADMN') return res.sendStatus(403);

    pool.query(`UPDATE users
        SET type = "BAN"
        WHERE id = ?`, req.params.id, (error, result, fields) => {
            if (error) return res.status(500).send(error);
            else {
                pool.query(`SELECT *
                FROM users_sessions
                WHERE idUser = ?`, req.params.id, (error, result, fields) => {
                    result.forEach(userSession => {
                        sessionStore.get(userSession.session_id, (err, session) => {
                            session.user.type = 'BAN';
                            sessionStore.set(userSession.session_id, session);
                        })
                    });
                    return res.sendStatus(200);
                })
            }
        })
})

app.post('/unban/user/:id', (req, res) => {
    if (!req.session.user) return res.sendStatus(401);
    else if (req.session.user.type !== 'ADMN') return res.sendStatus(403);

    pool.query(`UPDATE users
        SET type = "USER"
        WHERE id = ?`, req.params.id, (error, result, fields) => {
            if (error) return res.status(500).send(error);
            else {
                pool.query(`SELECT *
                FROM users_sessions
                WHERE idUser = ?`, req.params.id, (error, result, fields) => {
                    result.forEach(userSession => {
                        sessionStore.get(userSession.session_id, (err, session) => {
                            session.user.type = 'USER';
                            sessionStore.set(userSession.session_id, session);
                        })
                    });
                    return res.sendStatus(200);
                })
            }
        })
})

app.post('/block/user/:id', (req, res) => {
    if (!req.session.user) return res.sendStatus(401);

    pool.query(`INSERT INTO users_blocked (blockerId, blockedId)
    VALUES (?, ?)`, [req.session.user.id, req.params.id], (error, results, fields) => {
        if (error) return res.status(500).send(error);
        else return res.sendStatus(200);
    })
})

app.post('/unblock/user/:id', (req, res) => {
    if (!req.session.user) return res.sendStatus(401);

    pool.query(`DELETE FROM users_blocked WHERE blockerId = ? AND blockedId = ?`, [req.session.user.id, req.params.id], (error, results, fields) => {
        if (error) return res.status(500).send(error);
        else return res.sendStatus(200);
    })
})

app.get('/user/blockers', (req, res) => {
    if (req.headers.referer) {
        if (!req.session.user) return res.sendStatus(401);

        pool.query(`SELECT blockerId FROM users_blocked WHERE blockedId = ?`,
        req.session.user.id, (error, result, fields) => {
            if (error) return res.status(500).send(error);

            else return res.send(result);
        })
    } else res.redirect('/');
})

app.listen(port, () => {
    console.log(`Spritas Server listening at http://localhost:${port}`);
});