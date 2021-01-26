const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
    fullImage: String,
    minImage: String,
    minImageHeight: Number,
    owner: String,
    date_added: Date
});

ImageSchema
    .virtual('url')
    .get(function() {
        return '/image/' + this._id;
    });

module.exports = mongoose.model('Image', ImageSchema);