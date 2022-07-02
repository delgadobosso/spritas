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
// Routers
const homeNew = require('./routers/homeNew');
const post = require('./routers/post');
const comments = require('./routers/comments');
const replies = require('./routers/replies');
const createPost = require('./routers/create/post');
const createReplyPost = require('./routers/create/replyPost');
const createReplyComment = require('./routers/create/replyComment');
const createUpdate = require('./routers/create/update');
const loginSignup = require('./routers/login/signup');
const loginSignin = require('./routers/login/signin');

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

app.get('/admin', (req, res) => {
    if (!req.session.user) res.sendStatus(401);
    else if (req.session.user.type !== "ADMN") res.sendStatus(403);
    else return res.sendFile(reactApp);
})

app.use('/home/new/:offset.:limit', (req, res, next) => {
    req.offset = req.params.offset;
    req.limit = req.params.limit;
    req.pool = pool;
    next();
}, homeNew);

app.use('/login/signup',
    body('username').trim().isLength({ min: 2 }).escape(),
    body('nickname').trim().isLength({ min: 2 }).escape(),
    body('pass').isLength({ min: 8 }),
    body('email').isEmail(),
    (req, res, next) => {
        req.validationResult = validationResult;
        req.bcrypt = bcrypt;
        req.saltRounds = saltRounds;
        req.pool = pool;
        next();
    }, loginSignup);

app.use('/login/signin',
    body('username').trim().isLength({ min: 2 }).escape(),
    body('pass').isLength({ min: 8 }),
    (req, res, next) => {
        req.validationResult = validationResult;
        req.bcrypt = bcrypt;
        req.pool = pool;
        next();
    }, loginSignin);

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
app.use('/p/:id', (req, res, next) => {
    req.id = req.params.id;
    req.pool = pool;
    next();
}, post);

// Get comments to posts
app.use('/r/:id.:offset.:limit', (req, res, next) => {
    req.id = req.params.id;
    req.offset = req.params.offset;
    req.limit = req.params.limit;
    req.pool = pool;
    next();
}, comments);

// Get replies to replies
app.use('/rr/:id.:offset.:limit', (req, res, next) => {
    req.id = req.params.id;
    req.offset = req.params.offset;
    req.limit = req.params.limit;
    req.pool = pool;
    next();
}, replies);

// Create post
app.use('/create/post',
    memUpload.single('file'),
    body('title').trim().isLength({ min: 1, max: 64 }).escape(),
    body('subtitle').optional({ checkFalsy: true }).trim().isLength({ max: 32 }).escape(),
    body('link').optional({ checkFalsy: true }).matches(/(https:\/\/www\.)?(www\.)?(?<source1>youtube)\.com\/watch\?v=(?<id>[\w-]+)|(https:\/\/)?(?<source2>youtu\.be)\/(?<id2>[\w-]+)|(https:\/\/)?(?<source3>streamable)\.com\/(?<id3>[\w-]+)/).trim().escape(),
    body('body').trim().isLength({ min: 1, max: 10000 }).escape(),
    (req, res, next) => {
        req.pool = pool;
        req.validationResult = validationResult;
        req.imgur = imgur;
        req.imgurCurrent = imgurCurrent;
        req.imgurLimit = imgurLimit;
        next();
    }, createPost);

// Create comment
app.use('/create/reply/post',
    body('id').notEmpty().isInt(),
    body('reply').trim().isLength({ min: 1, max: 2500 }).escape(),
    (req, res, next) => {
        req.pool = pool;
        req.validationResult = validationResult;
        next();
    }, createReplyPost);

// Create reply
app.use('/create/reply/comment',
    body('id').notEmpty().isInt(),
    body('reply').trim().isLength({ min: 1, max: 2500 }).escape(),
    (req, res, next) => {
        req.pool = pool;
        req.validationResult = validationResult;
        next();
    }, createReplyComment);

// Update post
app.use('/update/post',
    memUpload.single('file'),
    body('id').notEmpty().isInt(),
    body('subtitle').optional({ checkFalsy: true }).trim().isLength({ max: 32 }).escape(),
    body('link').optional({ checkFalsy: true }).matches(/(https:\/\/www\.)?(www\.)?(?<source1>youtube)\.com\/watch\?v=(?<id>[\w-]+)|(https:\/\/)?(?<source2>youtu\.be)\/(?<id2>[\w-]+)|(https:\/\/)?(?<source3>streamable)\.com\/(?<id3>[\w-]+)/).trim().escape(),
    body('body').trim().isLength({ min: 1, max: 10000 }).escape(),
    (req, res, next) => {
        req.pool = pool;
        req.validationResult = validationResult;
        req.imgur = imgur;
        req.imgurCurrent = imgurCurrent;
        req.imgurLimit = imgurLimit;
        next();
    }, createUpdate);

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
                var byWho = (req.session.user.type === 'ADMN' && req.session.user.id !== result[0].idUser) ? 'Deleted By Admin' : 'Deleted By User';
                pool.query(`UPDATE posts AS p
                SET subtitle = NULL, body = ?, p.status = 'DELE', link = NULL, deletehash = NULL, type = 'TEXT'
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
        FROM replies
        WHERE id = ?`, req.body.id, (error, result, fields) => {
            if (error) return res.status(500).send(error);

            if (req.session.user.id === result[0].idUser || req.session.user.type === 'ADMN') {
                var byWho = (req.session.user.type === 'ADMN' && req.session.user.id !== result[0].idUser) ? 'Deleted By Admin' : 'Deleted By User';
                pool.query(`UPDATE replies
                SET body = ?, status = 'DELE'
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
                WHERE idUser = ? AND posts.status = 'UPDT'
                GROUP BY idParent) AS t
            USING (id)) AS t1
        ON p1.id = t1.idParent
        WHERE p1.idUser = ? AND p1.idParent IS NULL
        AND (p1.status IS NULL OR (p1.status = 'DELE' AND t1.id IS NOT NULL))
        ORDER BY IFNULL(t1.ts, p1.ts) DESC
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