require('dotenv').config();
const path = require('path');
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
const storage =  multer.memoryStorage();
const uploadTmp = multer({ storage: storage });

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

app.get('/create/post/:id', (req, res) => {
    if (!req.session.user) res.sendStatus(401);
    else {
        pool.query(`SELECT perm FROM topics WHERE id = ?`,
        req.params.id, (error, result, fields) => {
            if (error) return res.sendStatus(500);

            if (result.length > 0) {
                if (result[0].perm === "ADMN" && req.session.user.type === "ADMN") return res.sendFile(reactApp);
                else if (result[0].perm === "ALL") return res.sendFile(reactApp);
                else return res.sendStatus(403);
            } else return res.sendStatus(404);
        })
    }
})

app.get('/home', (req, res) => {
    if (req.headers.referer) {
        pool.query(`SELECT * FROM topics
        WHERE idParent IS NULL
        ORDER BY id`, (error, result, fields) => {
            if (error) return res.status(500).send(error);

            else res.send(result);
        })
    } else res.redirect('/');
});

app.get('/home/:id.:offset.:limit', (req, res) => {
    if (req.headers.referer) {
        var final;
        const id = req.params.id;
        const offset = (req.params.offset) ? parseInt(req.params.offset) : 0;
        const limit = (req.params.limit) ? parseInt(req.params.limit) + 1 : 0;
        if (offset === 0) {
            pool.query(`SELECT * FROM topics WHERE idParent = ?`, id, (error, result, fields) => {
                if (error) return res.status(500).send(error);

                else {
                    final = result;

                    pool.query(`
                        SELECT 
                            p1.id,
                            p1.idTopic,
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
                            users.name AS userName
                        FROM posts AS p1
                        LEFT JOIN users
                        ON p1.idUser = users.id
                        LEFT JOIN (
                            SELECT *
                            FROM posts AS p
                            INNER JOIN (
                                SELECT MAX(id) AS id
                                FROM posts
                                WHERE idTopic = ? AND posts.update = 'UPDT'
                                GROUP BY idParent) AS t
                            USING (id)) AS t1
                        ON p1.id = t1.idParent
                        WHERE p1.idTopic = ? AND p1.idParent IS NULL
                        ORDER BY p1.lastTs DESC
                        LIMIT ?,?`,
                    [id, id, offset, limit], (error, result, fields) => {
                        if (error) res.status(500).send(error);

                        else {
                            final = final.concat(result);
                            res.send(final);
                        }
                    })
                }
            })
        } else {
            pool.query(`
                SELECT 
                    p1.id,
                    p1.idTopic,
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
                    users.name AS userName
                FROM posts AS p1
                LEFT JOIN users
                ON p1.idUser = users.id
                LEFT JOIN (
                    SELECT *
                    FROM posts AS p
                    INNER JOIN (
                        SELECT MAX(id) AS id
                        FROM posts
                        WHERE idTopic = ? AND posts.update = 'UPDT'
                        GROUP BY idParent) AS t
                    USING (id)) AS t1
                ON p1.id = t1.idParent
                WHERE p1.idTopic = ? AND p1.idParent IS NULL
                ORDER BY p1.lastTs DESC
                LIMIT ?,?`,
            [id, id, offset, limit], (error, result, fields) => {
                if (error) res.status(500).send(error);

                else res.send(result);
            })
        }
    } else res.redirect('/');
});

app.post('/login/signup',
    body('name').trim().isLength({ min: 2 }).escape(),
    body('pass').isLength({ min: 8 }),
    body('email').isEmail(),
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({errors: errors.array()});

        bcrypt.hash(req.body.pass, saltRounds, function(err, hash) {
            pool.query(`INSERT INTO users (email,name,pass,type) VALUES(?,?,?,"USER")`,
            [req.body.email, req.body.name, hash],
            (error, result, fields) => {
                if (error) {
                    if (error.errno == 1062) {
                        res.send({'status': 'failure', 'message': 'this email is already in use'});
                    } else res.sendStatus(500);
                } else {
                    res.send({'status': 'success', 'message': 'successfully created account'});
                }
            })
        })
    }
)

app.post('/login/signin',
    body('name').trim().isLength({ min: 2 }).escape(),
    body('pass').isLength({ min: 8 }),
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({errors: errors.array()});

        pool.query(`SELECT * FROM users WHERE name = ? LIMIT 1`,
        req.body.name, (error, result, fields) => {
            if (error) return res.status(500).send(error);

            else if (result.length > 0) {
                bcrypt.compare(req.body.pass, result[0].pass, (err, ress) => {
                    if (ress) {
                        req.session.regenerate(() => {
                            const user = (({id, name, type}) => ({id, name, type}))(result[0]);
                            req.session.user = user;
                            res.redirect('/');
                        })
                    }
                    else res.send({'status': 'failure', 'message': 'wrong username or password'});
                })
            } else {
                res.send({'status': 'failure', 'message': 'this user does not exist'});
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
        pool.query(`SELECT posts.*, users.name AS userName, users.type AS userType
            FROM posts
            LEFT JOIN users ON posts.idUser = users.id
            WHERE posts.id = ? OR (posts.update = "UPDT" AND posts.idParent = ?)
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
        const offset = (req.params.offset) ? parseInt(req.params.offset) : 0;
        const limit = (req.params.limit) ? parseInt(req.params.limit) + 1 : 0;
        pool.query(`SELECT posts.*, users.name AS userName, users.type AS userType
            FROM posts
            LEFT JOIN users ON posts.idUser = users.id
            WHERE posts.idParent = ? AND posts.update IS NULL
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
        const offset = (req.params.offset) ? parseInt(req.params.offset) : 0;
        const limit = (req.params.limit) ? parseInt(req.params.limit) + 1 : 0;
        pool.query(`SELECT posts.*, users.name AS userName, users.type AS userType
            FROM posts
            LEFT JOIN users ON posts.idUser = users.id
            WHERE posts.idParent = ? AND posts.update IS NULL
            ORDER BY posts.id = ? DESC, posts.lastTs DESC
            LIMIT ?,?`,
        [id, id, offset, limit], (error, result, fields) => {
            if (error) return res.status(500).send(error);
            
            else res.send(result);
        })
    } else res.redirect('/post/' + req.params.id);
})

// Redirect to regular post URL if trying to access
app.get('/p/:id', (req, res) => {
    res.redirect('/post/' + req.params.id);
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
    uploadTmp.single('file'),
    body('id').isInt(),
    body('type').notEmpty().isIn(["TEXT", "BLOG", "VIDO", "IMG"]),
    body('name').trim().isLength({ min: 2 }).escape(),
    body('subtitle').trim().isLength({ max: 30 }).escape(),
    body('link').matches(/null|(https:\/\/www\.)?(www\.)?(?<source1>youtube)\.com\/watch\?v=(?<id>\w+)|(https:\/\/)?(?<source2>youtu\.be)\/(?<id2>\w+)|(https:\/\/)?(?<source3>streamable)\.com\/(?<id3>\w+)/).trim().isLength({ min: 2 }).escape(),
    body('body').trim().isLength({ min: 2 }).escape(),
    (req, res) => {
        if (!req.session.user) return res.sendStatus(401);
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({errors: errors.array()});

        pool.query(`SELECT type, perm FROM topics WHERE id = ?`,
        req.body.id, (error, result, fields) => {
            if (error) return res.sendStatus(500);

            if (result.length > 0) {
                if (req.body.type.toUpperCase() != result[0].type) return res.status(400).json({error: "Type of this post does not match the parent topic's type."});
                if (result[0].perm === "ADMN" && req.session.user.type != "ADMN") return res.sendStatus(403);

                // Add link if it's a VIDO
                if (result[0].type === "VIDO" && req.body.link !== "null") {
                    pool.query(`INSERT INTO posts (idTopic,idUser,title,subtitle,body,link,type)
                    VALUES(?,?,?,?,?,?,?)`,
                    [req.body.id, req.session.user.id, req.body.name, req.body.subtitle, req.body.body, req.body.link, result[0].type], (error, result, fields) => {
                        if (error) return res.status(500).send(error);

                        res.redirect('/');
                    })
                // Upload file to Imgur and add that link
                } else if (result[0].type === "IMG" && req.file.buffer) {
                    if (imgurCurrent <= imgurLimit) {
                        imgurCurrent++;
                        console.log('Current Imgur upload: ' + imgurCurrent);
                        const file64 = req.file.buffer.toString('base64');
                        imgur.uploadBase64(file64,
                                undefined,
                                req.body.name,
                                req.body.body)
                            .then((json) => {
                                if (json.link) {
                                    pool.query(`INSERT INTO posts (idTopic,idUser,title,subtitle,body,link,type)
                                    VALUES(?,?,?,?,?,?,?)`,
                                    [req.body.id, req.session.user.id, req.body.name, req.body.subtitle, req.body.body, json.link, result[0].type], (error, result, fields) => {
                                        if (error) return res.status(500).send(error);

                                        res.redirect('/');
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
                    pool.query(`INSERT INTO posts (idTopic,idUser,title,subtitle,body,type)
                    VALUES(?,?,?,?,?,?)`,
                    [req.body.id, req.session.user.id, req.body.name, req.body.subtitle, req.body.body, result[0].type], (error, result, fields) => {
                        if (error) return res.status(500).send(error);

                        res.redirect('/');
                    })
                }
            } else return res.sendStatus(404);
        })
    }
)

app.post('/create/reply',
    body('id').notEmpty().isInt(),
    body('reply').trim().isLength({ min: 2 }).escape(),
    (req, res) => {
        if (!req.session.user) return res.sendStatus(401);
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({errors: errors.array()});

        // Working on insert
        pool.query(`SELECT * FROM posts
        WHERE id = ?`, req.body.id, (error, result, fields) => {
            if (error) return res.status(500).send(error);

            // Valid first post of a topic is found
            if (result.length > 0) {
                const parent = result[0];
                pool.query(`INSERT INTO posts (idTopic,idParent,idUser,body)
                VALUES(?,?,?,?)`,
                [parent.idTopic, parent.id, req.session.user.id, req.body.reply], (error, result, fields) => {
                    if (error) return res.status(500).send(error);

                    pool.query(`UPDATE posts SET lastTs = CURRENT_TIMESTAMP
                    WHERE id = ? OR id = ?`,
                    [parent.id, parent.idParent], (error, result, fields) => {
                        if (error) return res.status(500).send(error);

                        return res.redirect('/');
                    })
                })
            } else return res.status(400).json({error: "No post to reply to."});
        })
    }
)

app.post('/update/post',
    uploadTmp.single('file'),
    body('id').notEmpty().isInt(),
    body('subtitle').trim().isLength({ max: 30 }).escape(),
    body('link').matches(/null|(https:\/\/www\.)?(www\.)?(?<source1>youtube)\.com\/watch\?v=(?<id>\w+)|(https:\/\/)?(?<source2>youtu\.be)\/(?<id2>\w+)|(https:\/\/)?(?<source3>streamable)\.com\/(?<id3>\w+)/).trim().isLength({ min: 2 }).escape(),
    body('body').trim().isLength({ min: 2 }).escape(),
    (req, res) => {
        if (!req.session.user) return res.sendStatus(401);
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({errors: errors.array()});

        pool.query(`SELECT * FROM posts WHERE id = ?`,
        req.body.id, (error, result, fields) => {
                if (error) return res.status(500).send(error);

                // Valid first post of topic found
                if (result.length > 0) {
                    const parent = result[0];

                    // Check if this user is OP
                    if (req.session.user.id === parent.idUser) {
                        // Add link if it's a VIDO
                        if (result[0].type === "VIDO" && req.body.link !== "null") {
                            pool.query("INSERT INTO posts (idTopic,idParent,idUser,subtitle,body,`update`,link,type) VALUES(?,?,?,?,?,'UPDT',?,?)",
                            [parent.idTopic, parent.id, req.session.user.id, req.body.subtitle, req.body.body, req.body.link, result[0].type],
                            (error, result, fields) => {
                                if (error) return res.status(500).send(error);
    
                                pool.query(`UPDATE posts SET lastTs = CURRENT_TIMESTAMP
                                WHERE id = ?`, parent.id, (error, result, fields) => {
                                    if (error) return res.status(500).send(error);
    
                                    return res.redirect('/');
                                })
                            })
                        } else if (result[0].type === "IMG" && req.file.buffer) {
                            // Upload file to imgur and update
                            if (imgurCurrent <= imgurLimit) {
                                imgurCurrent++;
                                console.log('Current Imgur upload: ' + imgurCurrent);
                                const file64 = req.file.buffer.toString('base64');
                                imgur.uploadBase64(file64,
                                        undefined,
                                        result[0].title,
                                        req.body.body)
                                    .then((json) => {
                                        if (json.link) {
                                            pool.query("INSERT INTO posts (idTopic,idParent,idUser,subtitle,body,`update`,link,type) VALUES(?,?,?,?,?,'UPDT',?,?)",
                                            [parent.idTopic, parent.id, req.session.user.id, req.body.subtitle, req.body.body, json.link, result[0].type],
                                            (error, result, fields) => {
                                                if (error) return res.status(500).send(error);

                                                pool.query(`UPDATE posts SET lastTs = CURRENT_TIMESTAMP
                                                WHERE id = ?`, parent.id, (error, result, fields) => {
                                                    if (error) return res.status(500).send(error);
                    
                                                    return res.redirect('/');
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
                            pool.query("INSERT INTO posts (idTopic,idParent,idUser,subtitle,body,`update`) VALUES(?,?,?,?,?,'UPDT')",
                            [parent.idTopic, parent.id, req.session.user.id, req.body.subtitle, req.body.body],
                            (error, result, fields) => {
                                if (error) return res.status(500).send(error);

                                pool.query(`UPDATE posts SET lastTs = CURRENT_TIMESTAMP
                                WHERE id = ?`, parent.id, (error, result, fields) => {
                                    if (error) return res.status(500).send(error);

                                    return res.redirect('/');
                                })
                            })
                        }
                    } else return res.sendStatus(403);
                } else return res.status(400).json({error: "No post to update."});
            })
    }
)

app.listen(port, () => {
    console.log(`Spritas Server listening at http://localhost:${port}`);
});