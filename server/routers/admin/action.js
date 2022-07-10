var express = require('express');
var router = express.Router();

router.post('/', (req, res) => {
    req.pool.query(`SELECT * FROM audit_log WHERE id = ?`, req.body.id, (error, result, fields) => {
        if (error) res.status(500).send(error);

        if (result[0].actioned.toString() === req.body.actioned) return res.status(200).send('same');
        else req.pool.query(`UPDATE audit_log SET actioned = ? WHERE id = ?`, [req.body.actioned, req.body.id], (error, result, fields) => {
            if (error) res.status(500).send(error);

            else return res.status(200).send('changed');
        });
    });
});

module.exports = router;
