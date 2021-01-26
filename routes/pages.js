const express = require('express');
const router = express.Router();
const Image = require('../models/image');

/* GET home page. */
router.get('/:page', function(req, res, next) {
    const page = +req.params.page;
    Image.count((err, count) => {
        if (err) console.log(err);
        const pagesCount = Math.ceil(count / 12);

        Image
            .find({})
            .skip((page - 1) * 12)
            .limit(12)
            .exec((err, images) => {
                if (err) console.error(err);
                console.log(page, pagesCount)
                res.render('page', { userLogin: req.session.userLogin, images, currentPage: page, lastId: images.length - 1, pagesCount })
            })
    })
});

module.exports = router;