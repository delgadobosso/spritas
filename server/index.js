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
const reply = require('./routers/posts/reply');
const comments = require('./routers/posts/comments');
const replies = require('./routers/posts/replies');
const repliesPrev = require('./routers/posts/repliesPrev');
const repliesNext = require('./routers/posts/repliesNext');

const createPost = require('./routers/create/post');
const createReplyPost = require('./routers/create/replyPost');
const createReplyComment = require('./routers/create/replyComment');
const createUpdate = require('./routers/create/update');

const loginSignup = require('./routers/login/signup');
const loginSignin = require('./routers/login/signin');
const loginUsercheck = require('./routers/login/usercheck');
const loginEmailcheck = require('./routers/login/emailcheck');
const loginVerify = require('./routers/login/verify');

const deletePost = require('./routers/delete/post');
const deleteReply = require('./routers/delete/reply');

const userInfo = require('./routers/user/info');
const userPosts = require('./routers/user/posts');
const userUpdate = require('./routers/user/update');
const userBan = require('./routers/user/ban');
const userUnban = require('./routers/user/unban');

const adminAudit = require('./routers/admin/audit');
const adminUnresolved = require('./routers/admin/unresolved');
const adminAction = require('./routers/admin/action');
const adminContent = require('./routers/admin/content');

const reportPost = require('./routers/posts/reportPost');
const reportUser = require('./routers/user/reportUser');
const reportReply = require('./routers/posts/reportReply');

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

const nodemailer = require('nodemailer');
let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PW
    }
});

transporter.verify((error, success) => {
    if (error) console.log(error);
    else console.log("Nodemailer authentication verified");
})

app.get('/', (req, res) => {
    res.redirect('/home');
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../spritas/build')));

const imgur = require('imgur');
const { json } = require('express');
imgur.setClientId(process.env.IMGUR_ID);
imgur.setCredentials(process.env.IMGUR_USER, process.env.IMGUR_PW, process.env.IMGUR_ID);

app.get('/home', (req, res) => {
    res.sendFile(reactApp);
})

app.get('/u/:name', (req, res) => {
    res.sendFile(reactApp);
})

app.get('/login', (req, res) => {
    if (req.session.user) res.redirect('/');
    else res.sendFile(reactApp);
})

app.get('/p/:id', (req, res) => {
    res.sendFile(reactApp);
})

app.get('/p/:id/r/:id', (req, res) => {
    res.sendFile(reactApp);
})

app.get('/:somewhere/p/:id', (req, res) => {
    res.redirect('/p/' + req.params.id);
})

app.get('/:somewhere/p/:id/r/:id2', (req, res) => {
    res.redirect('/p/' + req.params.id + '/r/' + req.params.id2);
})

app.get('/:somewhere/:someone/p/:id', (req, res) => {
    res.redirect('/p/' + req.params.id);
})

app.get('/:somewhere/:someone/p/:id/r/:id2', (req, res) => {
    res.redirect('/p/' + req.params.id + '/r/' + req.params.id2);
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
    body('username').trim().isLength({ max: 16 }).matches(/^[\w]+$/).escape(),
    body('nickname').trim().isLength({ max: 32 }).escape(),
    body('pass').isLength({ min: 8 }),
    body('email').isEmail(),
    (req, res, next) => {
        req.validationResult = validationResult;
        req.bcrypt = bcrypt;
        req.saltRounds = saltRounds;
        req.pool = pool;
        req.transporter = transporter;
        next();
    }, loginSignup);

app.use('/verify/:username/:hash', (req, res, next) => {
    req.username = req.params.username;
    req.hash = req.params.hash;
    req.pool = pool;
    next();
}, loginVerify);

app.use('/login/signin',
    body('username').trim().isLength({ min: 2 }).escape(),
    body('pass').isLength({ min: 8 }),
    (req, res, next) => {
        req.validationResult = validationResult;
        req.bcrypt = bcrypt;
        req.pool = pool;
        next();
    }, loginSignin);

app.use('/login/usercheck',
    body('username').trim().escape(),
    (req, res, next) => {
        req.pool = pool;
        next();
    }, loginUsercheck);

app.use('/login/emailcheck',
    body('email').trim().isEmail(),
    (req, res, next) => {
        req.validationResult = validationResult;
        req.pool = pool;
        next();
    }, loginEmailcheck);

app.get('/logout', (req, res) => {
    if (req.session.user) {
        req.session.destroy(() => {
            res.redirect('/home?success=logout');
        })
    } else res.redirect('/');
})

app.get('/session/user', (req, res) => {
    if (req.headers.referer) {
        res.send(req.session.user);
    } else res.redirect('/');
})

// Get post
app.use('/post/:id', (req, res, next) => {
    req.id = req.params.id;
    req.pool = pool;
    next();
}, post);

// Get single reply
app.use('/reply/:id', (req, res, next) => {
    req.id = req.params.id;
    req.pool = pool;
    next();
}, reply);

// Get comments to posts
app.use('/replies/:id.:offset.:limit', (req, res, next) => {
    req.id = req.params.id;
    req.offset = req.params.offset;
    req.limit = req.params.limit;
    req.pool = pool;
    next();
}, comments);

// Get replies to replies
app.use('/repliesreplies/:id.:offset.:limit', (req, res, next) => {
    req.id = req.params.id;
    req.offset = req.params.offset;
    req.limit = req.params.limit;
    req.pool = pool;
    next();
}, replies);

// Get previous replies from specific reply
app.use('/repliesprev/:id.:idSub.:offset.:limit', (req, res, next) => {
    req.id = req.params.id;
    req.idSub = req.params.idSub;
    req.offset = req.params.offset;
    req.limit = req.params.limit;
    req.pool = pool;
    next();
}, repliesPrev);

// Get next replies from specific reply
app.use('/repliesnext/:id.:idSub.:offset.:limit', (req, res, next) => {
    req.id = req.params.id;
    req.idSub = req.params.idSub;
    req.offset = req.params.offset;
    req.limit = req.params.limit;
    req.pool = pool;
    next();
}, repliesNext);

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
    body('currentid').notEmpty().isInt(),
    body('reason').trim().escape(),
    (req, res, next) => {
        req.validationResult = validationResult;
        req.pool = pool;
        req.imgur = imgur;
        next();
    }, deletePost);

app.use('/delete/reply',
    body('id').notEmpty().isInt(),
    body('reason').trim().escape(),
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
    body('reason').trim().escape(),
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

app.use('/admin/audit/:offset.:limit', (req, res, next) => {
    req.offset = req.params.offset;
    req.limit = req.params.limit;
    req.pool = pool;
    next();
}, adminAudit);

app.use('/admin/unresolved/:offset.:limit', (req, res, next) => {
    req.offset = req.params.offset;
    req.limit = req.params.limit;
    req.pool = pool;
    next();
}, adminUnresolved);

app.use('/admin/content/:content.:offset.:limit', (req, res, next) => {
    req.content = req.params.content;
    req.offset = req.params.offset;
    req.limit = req.params.limit;
    req.pool = pool;
    next();
}, adminContent);

app.use('/admin/action', (req, res, next) => {
    req.pool = pool;
    next();
}, adminAction);

app.use('/report/post',
    body('id').notEmpty().isInt(),
    body('reason').trim().escape(),
    (req, res, next) => {
        req.validationResult = validationResult;
        req.pool = pool;
        next();
    }, reportPost);

app.use('/report/user',
    body('id').notEmpty().isInt(),
    body('reason').trim().escape(),
    (req, res, next) => {
        req.validationResult = validationResult;
        req.pool = pool;
        next();
    }, reportUser);

app.use('/report/reply',
    body('id').notEmpty().isInt(),
    body('reason').trim().escape(),
    (req, res, next) => {
        req.validationResult = validationResult;
        req.pool = pool;
        next();
    }, reportReply);

app.listen(port, () => {
    console.log(`Spritas Server listening at http://localhost:${port}`);
});