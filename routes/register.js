const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const User = require('../models/user');

router.get('/', function(req, res) {
    res.render('register', { userLogin: req.session.userLogin });
})

router.post('/', function(req, res, next) {
    const login = req.body['sign-up-login'];
    const pass = req.body['sign-up-pass'];
    const rePass = req.body['sign-up-rePass'];
    console.log(req.body)

    const error = findErrorInFields(login, pass, rePass);
    if (error) res.render('register', { err: error.message, login: error.login, pass: error.pass, rePass: error.rePass });
    else {
        User.findOne({ login: login }, function(err, user) {
            if (err) console.log(err);
            console.log('find', user)
            if (!user) {
                User.create({ login, password: hash(pass) }, function(err, user) {
                    console.log('create data', user);
                    if (err) {
                        console.log(err);
                        res.render('register', {
                            error: 'Internal error'
                        })
                    }
                    req.session.userId = user.id;
                    req.session.userLogin = user.login;
                    res.redirect('/');
                });
            } else {
                res.render('register', {
                    error: 'User with this login already exists',
                    login,
                    pass,
                    rePass
                });
            }
        });
    }
});


function findErrorInFields(login, pass, rePass) {
    let result = {};
    if (login) result.login = (login);
    if (pass) result.pass = (pass);
    if (rePass) result.rePass = (rePass);

    console.log('finderr', result);

    if (!result.login || !result.pass || !result.rePass) {
        result.message = 'All fields must be filled'
    } else if (!/^[a-zA-Z0-9]+$/.test(login)) {
        result.message = 'Login must contain only Latin letters and numbers'
    } else if (login.length < 3 || login.length > 20) {
        result.message = 'Login length must be from 3 to 20 characters'
    } else if (pass.length < 5) {
        result.message = 'Password must contain at least 5 characters'
    } else if (pass !== rePass) {
        result.message = 'Passwords do not match'
    } else return false;

    console.log(result);
    return result;
}

function hash(text) {
    return crypto.createHash('sha1')
        .update(text).digest('base64');
}

module.exports = router;