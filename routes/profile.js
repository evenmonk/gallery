const express = require('express');
const router = express.Router();

router.get('/:login', (req, res) => {
    const galleryOwner = req.params.login;
    res.render('profile', {
        userLogin: req.session.userLogin,
        galleryOwner
    });
});

module.exports = router;