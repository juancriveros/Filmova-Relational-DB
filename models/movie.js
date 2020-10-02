const moongose = require('mongoose');
const Rating = require('./rating');

const MovieSchema = new moongose.Schema({
    title: {
        type: String, 
        required: true
    },
    releaseDate: {
        type: Date, 
        default: Date.now
    },
    category: {
        type: String,
        required: true
    }, 
    movieDirector: {
        type: String, 
        required: true
    },
    externalId: {
        type: Number,
        required: true
    },
    generalRating: {
        type: Number
    },
    ratings: [
        {
            type: moongose.Schema.Types.ObjectId,
            ref: "RatingSchema"
        }
    ]
});

module.exports = moongose.model('MovieSchema', MovieSchema);