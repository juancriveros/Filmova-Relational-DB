const moongose = require('mongoose');

const RatingSchema = new moongose.Schema({
    title: {
        type: String,
        required: true
    }, 
    comment: {
        type: String, 
        required: true
    },
    rating: {
        type: Number,
        required: true
    },
    userId: {
        type: Number,
        required: true
    },
    commentDate: {
        type: Date, 
        default: Date.now
    }
});

module.exports = moongose.model('RatingSchema', RatingSchema);