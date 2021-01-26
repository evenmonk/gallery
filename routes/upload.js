const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const Jimp = require('jimp');
// module for images saving
const multer = require('multer');
const sizeOf = require('image-size');
const Image = require('../models/image')


router.get('/', (req, res) => {
    res.render('upload', { userLogin: req.session.userLogin });
});

const PUBLIC_DESTINATION = 'public';
const FULL_IMAGES_DIR = 'images/full-images';
const MIN_IMAGES_DIR = 'images/min-images';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        console.log('dest file', file)
        cb(null, path.join(PUBLIC_DESTINATION, FULL_IMAGES_DIR));
    },
    filename: (req, file, cb) => {
        console.log('filedest', path.join(PUBLIC_DESTINATION, FULL_IMAGES_DIR, file.originalname));
        mkdirpath(path.join(PUBLIC_DESTINATION, FULL_IMAGES_DIR));
        cb(null, Date.now() + path.extname(file.originalname))
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
            const ext = path.extname(file.originalname).toLocaleLowerCase();
            if (ext !== '.jpg' && ext !== '.jpeg' && ext !== '.png') {
                const err = new Error('Extention');
                err.code = "EXTENTION"
                return cb(err);
            }
            cb(null, true);
        }
        // 'file' is the name for the input from form
}).array('files');

router.post('/', (req, res) => {
    // fullsize image upload 
    upload(req, res, err => {
        if (err || req.files.length === 0) {
            let error = '';
            if (req.files.length === 0 && !err)
                error = "Insert at least one picture";
            else if (err.code === 'LIMIT_FILE_SIZE')
                error = "The Size of the picture must be less than 5mb";
            else if (err.code === 'EXTENTION')
                error = 'Only jpeg and png format allowed';
            console.log(error);
            res.render('upload', { userLogin: req.session.userLogin, err: error });
        } else {
            // compress the picture and insert into db
            mkdirpath(PUBLIC_DESTINATION, MIN_IMAGES_DIR);
            (async() => {
                const images = [];

                await Promise.all(req.files.map(async image => {
                    image.owner = req.session.userLogin;
                    const resizedImage = await getResizedImage(image);
                    images.push(resizedImage);
                }));

                Image.insertMany(images)
                    .then(data => {
                        console.log(images);
                        console.log('create data', data);
                        res.redirect('/');
                    })
                    .catch(err => console.log('err from add image in db', err));
            })();
        }
    });
});

async function getResizedImage(image) {
    return new Promise((resolve, reject) => {
        Jimp.read(image.path)
            .then(fullPic => {
                fullPic.resize(600, Jimp.AUTO)
                    .write(path.join(PUBLIC_DESTINATION, MIN_IMAGES_DIR, image.filename), function(err, stdout) {
                        if (err) reject(err);
                        resolve({
                            fullImage: path.join(`/${FULL_IMAGES_DIR}`, image.filename),
                            minImage: path.join(`/${MIN_IMAGES_DIR}`, image.filename),
                            minImageHeight: sizeOf(path.join(__dirname, '..', PUBLIC_DESTINATION, MIN_IMAGES_DIR, image.filename)).height,
                            owner: image.owner,
                            date_added: new Date()
                        });
                    });
            })
            .catch(err => {
                console.log('jimp error', err);
            });
    });
}

function mkdirpath(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath);
    } else {
        console.log("Directory already exist");
    }
}

module.exports = router;