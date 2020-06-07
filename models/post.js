const mongoose = require('mongoose')

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    summary: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    },
    views: {
        type: Number,
        default: 0
    },
    active: Boolean,
    comments: [{
        date: {
            type: Date,
            default: Date.now
        },
        name: {
            type: String,
            required: [true, 'Name is required']
        },
        email: {
            type: String
        },
        body: {
            type: String,
            required: true
        }
    }]
})

module.exports = mongoose.model('Post', postSchema)