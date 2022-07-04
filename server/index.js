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
// Routers
const homeNew = require('./routers/posts/homeNew');

const post = require('./routers/posts/post');
const comments = require('./routers/posts/comments');
const replies = require('./routers/posts/replies');

const createPost = require('./routers/create/post');
const createReplyPost = require('./routers/create/replyPost');
const createReplyComment = require('./routers/create/replyComment');
const createUpdate = require('./routers/create/update');

const loginSignup = require('./routers/login/signup');
const loginSignin = require('./routers/login/signin');

const deletePost = require('./routers/delete/post');
const deleteReply = require('./routers/delete/reply');

const userInfo = require('./routers/user/info');
const userPosts = require('./routers/user/posts');
const userUpdate = require('./routers/user/update');
const userBan = require('./routers/user/ban');
const userUnban = require('./routers/user/unban');

const adminAudit = require('./routers/admin/audit');

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

app.use('/delete/post',
    body('ogid').notEmpty().isInt(),
    body('currentid').notEmpty().isInt(),
    (req, res, next) => {
        req.validationResult = validationResult;
        req.pool = pool;
        req.imgur = imgur;
        next();
    }, deletePost);

app.use('/delete/reply',
    body('id').notEmpty().isInt(),
    (req, res, next) => {
        req.validationResult = validationResult;
        req.pool = pool;
        next();
    }, deleteReply);

app.use('/user/info/:name', 
    (req, res, next) => {
        req.name = req.params.name;
        req.pool = pool;
        next();
    }, userInfo);

app.use('/user/posts/:id.:offset.:limit', 
    (req, res, next) => {
        req.id = req.params.id;
        req.offset = req.params.offset;
        req.limit = req.params.limit;
        req.pool = pool;
        next();
    }, userPosts);

app.use('/user/update',
    avatarUpload.single('avatar'),
    body('id').isInt(),
    body('nickname').optional({ checkFalsy: true }).trim().isLength({ min: 2 }).escape(),
    body('bio').optional({ checkFalsy: true }).isLength({ max: 256 }),
    (req, res, next) => {
        req.validationResult = validationResult;
        req.pool = pool;
        next();
    }, userUpdate);

app.get('/media/avatars/:avatar', express.static(path.join(__dirname, '/media/avatars')), (req, res) => {
    res.sendFile(path.join(__dirname, '/media/avatars/', req.params.avatar));
})

app.use('/ban/user/:id',
    (req, res, next) => {
        req.id = req.params.id;
        req.pool = pool;
        req.sessionStore = sessionStore;
        next();
    }, userBan);

app.use('/unban/user/:id',
    (req, res, next) => {
        req.id = req.params.id;
        req.pool = pool;
        req.sessionStore = sessionStore;
        next();
    }, userUnban);

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

app.use('/admin/audit/:offset.:limit', 
    (req, res, next) => {
        req.offset = req.params.offset;
        req.limit = req.params.limit;
        req.pool = pool;
        next();
    }, adminAudit);

app.listen(port, () => {
    console.log(`Spritas Server listening at http://localhost:${port}`);
});