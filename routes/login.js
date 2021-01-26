const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const User = require('../models/user');

router.get('/', function(req, res) {
    res.render('login', { userLogin: req.session.userLogin });
})

router.post('/', function(req, res) {
    const login = req.body.login;
    const pass = req.body.pass;

    console.log(`login ${login}, ${pass} `) 

    let err;
    if (!login || !pass) {
        err = 'All fields must be filled'
        res.render('login', { userLogin: req.session.userLogin, err, login, pass });
    } else {
        User
            .findOne({ login, password: hash(pass) }, (err, user) => {
                if (err) res.render('login', { error: 'Server error. Try later', login, pass });
                if (!user) {
                    err = 'Login or password error'
                    res.render('login', { err, login, pass });
                } else if (user.password === hash(pass)) {
                    console.log(user);
                    req.session.userId = user.id;
                    req.session.userLogin = user.login;
                    res.redirect('/');
                }
            });
    }
});

function hash(text) {
    return crypto.createHash('sha1')
        .update(text).digest('base64');
}

module.exports = router;